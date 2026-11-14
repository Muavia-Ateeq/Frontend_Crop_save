"""
Cotton Fiber Yield Prediction API
Backend for the mobile app. Loads the trained model and predicts fiber yield.
Supabase (login/history) will be added later - structure is ready for it.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import os
import pickle
import pandas as pd
import numpy as np
import asyncio
from concurrent.futures import ThreadPoolExecutor

app = FastAPI(title="Cotton Fiber Yield API")

# Thread pool for running slow SHAP in background
executor = ThreadPoolExecutor(max_workers=2)

_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
_allowed_origins = [o.strip() for o in _origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Load the trained model bundle (once, at startup) ----
_model_path = Path(__file__).parent / "fiber_yield_app_model.pkl"
with open(_model_path, "rb") as f:
    BUNDLE = pickle.load(f)

ensemble   = BUNDLE["ensemble"]
explainer  = BUNDLE["shap_explainer"]
ohe        = BUNDLE["one_hot_encoder"]
cat_cols   = BUNDLE["cat_cols"]
num_cols   = BUNDLE["num_cols"]
FEATURES   = BUNDLE["features"]
TARGET     = BUNDLE["target"]
ref_df     = BUNDLE["reference_df"]
FIXED_YEAR = BUNDLE.get("fixed_year", 2023)
ALLOWED    = BUNDLE["allowed_values"]


# ---- What the app sends us (5 inputs) ----
class PredictRequest(BaseModel):
    location: str
    genotype: str
    water_supply_pct: int
    n_rate_kg_ha: int
    soil_type: str


# ---- Helper: build the full 54-feature row from 5 inputs ----
def build_input_row(location, genotype, water_pct, n_rate, soil_type):
    mask = (ref_df["Location"] == location) & (ref_df["Year"] == FIXED_YEAR)
    if mask.sum() == 0:
        mask = (ref_df["Location"] == location)
    base = ref_df[mask].iloc[0].copy()

    base["Location"]         = location
    base["Genotype"]         = genotype
    base["Year"]             = FIXED_YEAR
    base["Water_Supply_Pct"] = water_pct
    base["N_Rate_kg_ha"]     = n_rate
    base["Soil_Type"]        = soil_type

    gmask = (ref_df["Genotype"] == genotype)
    if gmask.sum() > 0:
        gen_row = ref_df[gmask].iloc[0]
        for c in ref_df.columns:
            if c.startswith("SNP"):
                base[c] = gen_row[c]

    return base.drop(labels=[TARGET]).to_frame().T


def transform(raw):
    raw = raw.copy()
    for c in num_cols:
        raw[c] = pd.to_numeric(raw[c], errors="coerce")

    names = ohe.get_feature_names_out(cat_cols)
    Xc = pd.DataFrame(ohe.transform(raw[cat_cols]), columns=names).astype(int)
    X = pd.concat([raw[num_cols].reset_index(drop=True),
                   Xc.reset_index(drop=True)], axis=1)
    X = X[FEATURES].astype(float)
    return X


# ---- SHAP in separate thread (slow operation) ----
def run_shap(X):
    return explainer.shap_values(X, check_additivity=False)


# ---- Routes ----
@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/options")
def options():
    """The app uses this to fill the dropdown menus."""
    return {
        "Location": ALLOWED["Location"],
        "Genotype": ALLOWED["Genotype"],
        "Water_Supply_Pct": ALLOWED["Water_Supply_Pct"],
        "N_Rate_kg_ha": ALLOWED["N_Rate_kg_ha"],
        "Soil_Type": ALLOWED["Soil_Type"],
    }


@app.post("/predict")
async def predict(req: PredictRequest):
    raw = build_input_row(req.location, req.genotype,
                          req.water_supply_pct, req.n_rate_kg_ha,
                          req.soil_type)
    X = transform(raw)

    yhat = float(ensemble.predict(X)[0])

    # ---- SHAP: run in thread with 25s timeout; fall back to feature importances ----
    loop = asyncio.get_event_loop()
    try:
        shap_values = await asyncio.wait_for(
            loop.run_in_executor(executor, lambda: run_shap(X)),
            timeout=25.0,
        )
        sv = shap_values[0]
        base_val = float(explainer.expected_value)
    except asyncio.TimeoutError:
        # SHAP too slow — approximate contributions from feature importances
        fi = ensemble.feature_importances_
        base_val = float(np.mean(ref_df[TARGET]) if TARGET in ref_df.columns else yhat)
        sv = fi * (yhat - base_val)
    contribs = sorted(zip(FEATURES, sv, X.iloc[0].values),
                      key=lambda z: -abs(z[1]))[:5]

    reasons = []
    for f, s, v in contribs:
        nm = f.replace("_", " ").strip()
        up = s > 0
        amount = round(abs(float(s)), 1)
        if "Water" in f:
            text = (f"You set water supply to {req.water_supply_pct}%. "
                    + ("Good water supply raised the fiber yield."
                       if req.water_supply_pct >= 75
                       else "Low water supply pulled the yield down. More irrigation would help the most."))
        elif "N Rate" in nm or "N_Rate" in f:
            text = (f"You used {req.n_rate_kg_ha} kg/ha nitrogen. "
                    + ("This fertilizer level supported the yield."
                       if req.n_rate_kg_ha >= 240
                       else "A higher nitrogen level could improve the yield."))
        elif "SNP" in f:
            text = f"The genetics of the {req.genotype} variety affected the fiber yield."
        elif "Genotype" in f:
            text = f"The chosen variety ({req.genotype}) influenced the yield."
        elif "Crop Duration" in nm:
            text = "The length of the growing season affected the yield."
        else:
            text = f"{nm} {'helped' if up else 'reduced'} the yield."
        reasons.append({
            "feature": nm,
            "effect": "increased" if up else "reduced",
            "amount_kg_ha": amount,
            "text": text,
        })

    diff = yhat - base_val
    if diff >= 0:
        summary = f"This is a strong predicted yield, about {abs(round(diff))} kg/ha above the average."
    else:
        summary = f"This yield is about {abs(round(diff))} kg/ha below the average."

    advice = []
    if req.water_supply_pct < 75:
        advice.append("Water is the biggest factor. Increasing irrigation would raise the yield the most.")
    if req.n_rate_kg_ha < 240:
        advice.append("A higher nitrogen rate (240 or 290 kg/ha) could improve the yield.")
    if req.water_supply_pct >= 75 and req.n_rate_kg_ha >= 240:
        advice.append("Your inputs are well chosen for a strong fiber yield.")

    return {
        "predicted_fiber_yield_kg_ha": round(yhat, 1),
        "average_baseline_kg_ha": round(base_val, 1),
        "difference_kg_ha": round(diff, 1),
        "summary": summary,
        "advice": advice,
        "top_reasons": reasons,
        "inputs": req.dict(),
    }
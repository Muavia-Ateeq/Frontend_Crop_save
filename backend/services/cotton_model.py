"""Cotton fiber yield prediction model interface.

Loads the trained ensemble model bundle and provides yield prediction
with SHAP explanations for the FastAPI cotton endpoints.
"""
import os
from pathlib import Path
from typing import Optional

import joblib
import pandas as pd

from logger import logger

ROOT = Path(__file__).resolve().parent.parent  # backend/
MODEL_PATH = Path(os.getenv("COTTON_MODEL_PATH", ROOT / "ml_models" / "cotton_model.pkl"))

# Module-level singleton
BUNDLE: Optional[dict] = None
model_loaded = False

try:
    if MODEL_PATH.exists():
        logger.info(f"Loading cotton model from {MODEL_PATH}")
        BUNDLE = joblib.load(MODEL_PATH)
        model_loaded = True
        logger.info(f"Cotton model loaded successfully. Features: {len(BUNDLE.get('features', []))}")
    else:
        logger.warning(f"Cotton model not found at {MODEL_PATH}")
        logger.warning("Cotton endpoints will return 503 Service Unavailable")
except Exception as e:
    logger.error(f"ERROR loading cotton model: {e}")
    BUNDLE = None
    model_loaded = False


def load_cotton_model() -> dict:
    """Load cotton model bundle from ml_models/.

    Returns:
        dict: Model bundle with keys:
            - ensemble: trained model
            - shap_explainer: SHAP explainer
            - one_hot_encoder: categorical encoder
            - reference_df: base data with SNP markers
            - features: exact feature order (54 features)
            - allowed_values: valid input values

    Raises:
        FileNotFoundError: If model file missing
    """
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Cotton model not found at {MODEL_PATH}")

    logger.info(f"Loading cotton model from {MODEL_PATH}")
    bundle = joblib.load(MODEL_PATH)
    logger.info(f"Cotton model loaded. Features: {len(bundle.get('features', []))}")
    return bundle


def predict_cotton_yield(
    location: str,
    genotype: str,
    water_supply_pct: int,
    n_rate_kg_ha: int,
    soil_type: str
) -> dict:
    """Predict cotton fiber yield with SHAP explanations.

    Args:
        location: Growing location (e.g., "Maricopa")
        genotype: Cotton variety (e.g., "DP1646B2XF")
        water_supply_pct: Irrigation percentage 0-100
        n_rate_kg_ha: Nitrogen fertilizer rate in kg/ha
        soil_type: Soil type (e.g., "Clay Loam")

    Returns:
        dict with:
            - predicted_yield: float (kg/ha)
            - shap_values: list of feature contributions
            - advice: list[str] of optimization suggestions

    Raises:
        ValueError: If model not loaded or invalid inputs
    """
    if BUNDLE is None:
        raise ValueError("Cotton model not loaded. Check model file exists.")

    logger.debug(f"Predicting cotton yield for: {location}, {genotype}, water={water_supply_pct}%, N={n_rate_kg_ha}")

    # Extract bundle components
    ensemble = BUNDLE["ensemble"]
    shap_explainer = BUNDLE["shap_explainer"]
    one_hot_encoder = BUNDLE["one_hot_encoder"]
    reference_df = BUNDLE["reference_df"]
    features = BUNDLE["features"]

    # Build input row: start with reference data for this genotype
    # ponytail: first matching genotype row as SNP source
    ref_row = reference_df[reference_df["Genotype"] == genotype].iloc[0:1].copy()

    # Override user inputs
    ref_row["Location"] = location
    ref_row["Genotype"] = genotype
    ref_row["Water_supply_pct"] = water_supply_pct
    ref_row["N_rate_kg_ha"] = n_rate_kg_ha
    ref_row["Soil_type"] = soil_type

    # One-hot encode categoricals
    categoricals = ["Location", "Genotype", "Soil_type"]
    encoded = one_hot_encoder.transform(ref_row[categoricals])
    encoded_df = pd.DataFrame(
        encoded,
        columns=one_hot_encoder.get_feature_names_out(categoricals),
        index=ref_row.index
    )

    # Drop original categoricals, add encoded, select final features
    ref_row = ref_row.drop(columns=categoricals)
    input_df = pd.concat([ref_row, encoded_df], axis=1)[features]

    # Predict
    prediction = ensemble.predict(input_df)[0]

    # SHAP values
    shap_values = shap_explainer.shap_values(input_df)[0].tolist()

    # Generate advice
    advice = []
    if water_supply_pct < 75:
        advice.append(f"Water supply is {water_supply_pct}%. Consider increasing to 75-100% for optimal yield.")
    if n_rate_kg_ha < 240:
        advice.append(f"Nitrogen rate is {n_rate_kg_ha} kg/ha. Optimal range is 240-280 kg/ha.")
    if n_rate_kg_ha > 280:
        advice.append(f"Nitrogen rate is {n_rate_kg_ha} kg/ha. Consider reducing to avoid diminishing returns.")

    logger.info(f"Cotton yield prediction: {prediction:.2f} kg/ha")

    return {
        "predicted_yield": float(prediction),
        "shap_values": shap_values,
        "advice": advice
    }

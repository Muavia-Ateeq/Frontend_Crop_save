"""Drought risk prediction endpoint - the most important endpoint for CropSave."""
import os
from datetime import date
from pathlib import Path

import joblib
import numpy as np
from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from logger import logger
from models.schemas import PredictRequest, PredictResponse
from services.ml_service import predict_risk
from services.nasa_api import get_last_30_days_data, get_last_12_months_data

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# Paths to ML model and scaler
ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = os.getenv("MODEL_PATH", str(ROOT.parent / "ml" / "models" / "random_forest.joblib"))
SCALER_PATH = os.getenv("SCALER_PATH", str(ROOT.parent / "ml" / "models" / "scaler.pkl"))

# Load model and scaler once at startup
try:
    logger.info(f"Loading ML model from: {MODEL_PATH}")
    model = joblib.load(MODEL_PATH)
    logger.info("Drought model loaded successfully")
except FileNotFoundError:
    logger.warning(f"Model file not found at {MODEL_PATH}")
    model = None

try:
    logger.info(f"Loading scaler from: {SCALER_PATH}")
    scaler = joblib.load(SCALER_PATH)
    logger.info("Scaler loaded successfully")
except FileNotFoundError:
    logger.warning(f"Scaler file not found at {SCALER_PATH}. Predictions will use unscaled features.")
    scaler = None


@router.post("/predict", response_model=PredictResponse)
@limiter.limit("10/minute")
def predict(request: Request, req: PredictRequest):
    """Predict 30-day drought risk for a district location."""
    logger.info(f"Drought prediction request: lat={req.lat}, lon={req.lon}")
    if req.district_name:
        logger.info(f"District: {req.district_name}")

    try:
        climate_data = get_last_30_days_data(req.lat, req.lon)
    except Exception as exc:
        logger.error(f"NASA API Error: {exc}")
        raise HTTPException(status_code=503, detail="NASA data temporarily unavailable") from exc

    try:
        monthly_data = get_last_12_months_data(req.lat, req.lon)
        prev_month_rainfall = monthly_data[-2]["total_rainfall_mm"] if len(monthly_data) >= 2 else 0
    except Exception as exc:
        logger.warning(f"Could not fetch monthly data, using 0 for prev_month_rainfall: {exc}")
        prev_month_rainfall = 0

    current_month = date.today().month
    feature_dict = {
        "soil_moisture": float(climate_data["avg_soil_moisture"]),
        "rain_30d": float(climate_data["avg_rainfall"]),
        "rain_prev_month": float(prev_month_rainfall),
        "tmax_mean_30d": float(climate_data["avg_temp_max"]),
        "humidity_mean_30d": float(climate_data["avg_humidity"]),
        "month": int(current_month),
    }
    features = [
        feature_dict["soil_moisture"],
        feature_dict["rain_30d"],
        feature_dict["tmax_mean_30d"],
        feature_dict["humidity_mean_30d"],
        feature_dict["month"],
        feature_dict["rain_prev_month"],
    ]

    if model is not None:
        features_array = np.array(features).reshape(1, -1)
        if scaler is not None:
            logger.debug("Applying scaler transformation")
            features_array = scaler.transform(features_array)
        try:
            prediction_proba = model.predict_proba(features_array)[0]
            drought_probability = prediction_proba[1] if len(prediction_proba) > 1 else prediction_proba[0]
            risk_score = int(drought_probability * 100)
        except Exception as exc:
            logger.error(f"Prediction error: {exc}")
            raise HTTPException(status_code=500, detail="Prediction failed due to an internal error") from exc
    else:
        logger.warning("Model file missing; using rule-based fallback scoring")
        risk_score, _, _ = predict_risk(feature_dict)

    if 0 <= risk_score <= 30:
        risk_level = "LOW"
    elif 31 <= risk_score <= 65:
        risk_level = "MEDIUM"
    else:
        risk_level = "HIGH"

    district_display_name = req.district_name if req.district_name else f"Location ({req.lat:.2f}, {req.lon:.2f})"

    return PredictResponse(
        district_name=district_display_name,
        risk_score=risk_score,
        risk_level=risk_level,
        soil_moisture=feature_dict["soil_moisture"],
        rainfall_last_30_days=feature_dict["rain_30d"],
        temperature_max=feature_dict["tmax_mean_30d"],
        humidity=feature_dict["humidity_mean_30d"],
        prediction_date=date.today().isoformat(),
        features={
            "soil_moisture": round(feature_dict["soil_moisture"], 4),
            "rain_30d": round(feature_dict["rain_30d"], 2),
            "rain_prev_month": round(feature_dict["rain_prev_month"], 2),
            "tmax_mean_30d": round(feature_dict["tmax_mean_30d"], 2),
            "humidity_mean_30d": round(feature_dict["humidity_mean_30d"], 2),
            "month": feature_dict["month"],
        },
    )

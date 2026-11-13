"""Cotton yield prediction endpoint with drought adjustment."""
from datetime import date, datetime, timedelta
from fastapi import APIRouter, HTTPException

from logger import logger
from models.schemas import CottonPredictRequest, CottonPredictResponse
from services import cotton_model
from services.ml_service import predict_risk
from services.nasa_api import fetch_daily
from services.feature_builder import build_features, HISTORY_DAYS

router = APIRouter()


@router.post("/cotton/predict", response_model=CottonPredictResponse)
async def predict_cotton_yield(request: CottonPredictRequest):
    """Predict cotton fiber yield with optional drought adjustment.

    If district_lat and district_lon are provided, fetches NASA POWER data
    to assess drought risk and adjusts yield accordingly:
    - HIGH risk: 40% reduction
    - MEDIUM risk: 20% reduction
    - LOW risk: 0% reduction
    - UNKNOWN: 0% reduction (when lat/lon not provided or fetch fails)
    """
    # Check model availability
    if not cotton_model.model_loaded:
        raise HTTPException(
            status_code=503,
            detail="Cotton model not available. Please ensure model file exists."
        )

    try:
        # Predict base yield
        result = cotton_model.predict_cotton_yield(
            location=request.location,
            genotype=request.variety,
            water_supply_pct=int(request.irrigation_level),
            n_rate_kg_ha=int(request.nitrogen_amount),
            soil_type=request.soil_type
        )
        base_yield = result["predicted_yield"]

        # Drought risk assessment
        drought_risk = "UNKNOWN"
        drought_impact = 0

        if request.district_lat is not None and request.district_lon is not None:
            try:
                # Fetch NASA data and build features
                end = date.today()
                start = end - timedelta(days=HISTORY_DAYS - 1)
                nasa_df = fetch_daily(request.district_lat, request.district_lon, start, end)
                features = build_features(nasa_df, end)

                # Predict drought risk
                _, risk_level, _ = predict_risk(features)
                drought_risk = risk_level

                # Apply drought impact
                if risk_level == "HIGH":
                    drought_impact = 40
                elif risk_level == "MEDIUM":
                    drought_impact = 20
                # LOW or other: 0%

            except Exception as e:
                logger.warning(f"Drought risk fetch failed: {e}")
                # Continue with UNKNOWN risk, no adjustment

        # Calculate adjusted yield
        adjusted_yield = base_yield * (1 - drought_impact / 100)

        # ponytail: hardcoded MEDIUM confidence until model score available
        confidence = "MEDIUM"

        return CottonPredictResponse(
            predicted_yield=base_yield,
            drought_adjusted_yield=adjusted_yield,
            drought_risk_level=drought_risk,
            drought_impact_percent=drought_impact,
            confidence=confidence,
            variety_used=request.variety,
            prediction_date=datetime.now().isoformat()
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

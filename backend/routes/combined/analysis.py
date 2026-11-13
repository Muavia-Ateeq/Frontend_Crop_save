"""Combined drought + cotton analysis endpoint."""
from datetime import date

from fastapi import APIRouter, HTTPException

from logger import logger
from models.schemas import CombinedRequest, CombinedResponse
from services.nasa_api import get_last_30_days_data, get_last_12_months_data
from services.cotton_model import predict_cotton_yield, model_loaded

router = APIRouter()


@router.post("/analysis", response_model=CombinedResponse)
async def combined_analysis(request: CombinedRequest):
    """Get drought + cotton predictions with combined advice."""

    # 1. Drought prediction
    drought_result = {}
    try:
        climate_data = get_last_30_days_data(request.lat, request.lon)
        monthly_data = get_last_12_months_data(request.lat, request.lon)
        prev_month_rainfall = monthly_data[-2]["total_rainfall_mm"] if len(monthly_data) >= 2 else 0

        # Build features
        from services.ml_service import predict_risk
        feature_dict = {
            "soil_moisture": float(climate_data["avg_soil_moisture"]),
            "rain_30d": float(climate_data["avg_rainfall"]),
            "rain_prev_month": float(prev_month_rainfall),
            "tmax_mean_30d": float(climate_data["avg_temp_max"]),
            "humidity_mean_30d": float(climate_data["avg_humidity"]),
            "month": int(date.today().month),
        }

        risk_score, risk_level, _ = predict_risk(feature_dict)

        drought_result = {
            "district_name": request.district_name,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "soil_moisture": feature_dict["soil_moisture"],
            "rainfall_last_30_days": feature_dict["rain_30d"],
            "temperature_max": feature_dict["tmax_mean_30d"],
            "humidity": feature_dict["humidity_mean_30d"],
            "prediction_date": date.today().isoformat(),
        }
    except Exception as e:
        logger.error(f"Drought prediction failed: {e}")
        drought_result = {"error": str(e)}

    # 2. Cotton prediction
    if not model_loaded:
        raise HTTPException(status_code=503, detail="Cotton model not loaded")

    try:
        # ponytail: default location/soil since cotton model needs them
        cotton_pred = predict_cotton_yield(
            location=getattr(request, 'location', "Maricopa"),
            genotype=request.variety,
            water_supply_pct=int(request.irrigation_level),
            n_rate_kg_ha=int(request.nitrogen_amount),
            soil_type=getattr(request, 'soil_type', "Clay Loam")
        )

        cotton_result = {
            "predicted_yield": cotton_pred["predicted_yield"],
            "variety": request.variety,
            "irrigation_level": request.irrigation_level,
            "nitrogen_amount": request.nitrogen_amount,
            "advice": cotton_pred["advice"]
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Cotton prediction failed: {str(e)}")

    # 3. Combined advice
    risk_level = drought_result.get("risk_level", "UNKNOWN")
    risk_score = drought_result.get("risk_score", 0)
    irrigation = request.irrigation_level
    nitrogen = request.nitrogen_amount
    predicted_yield = cotton_pred["predicted_yield"]

    if risk_level == "HIGH" and irrigation < 75:
        advice = (
            f"CRITICAL: High drought risk detected (score: {risk_score}/100) combined with low irrigation ({irrigation:.0f}%). "
            f"This creates severe water stress for cotton. Immediate actions: increase irrigation to 80-90%, "
            f"apply mulching to retain soil moisture, and monitor crop daily. "
            f"Expected yield under these conditions: {predicted_yield:.0f} kg/ha, but actual may be 20-30% lower without intervention."
        )
    elif risk_level == "MEDIUM" and nitrogen < 240:
        advice = (
            f"Moderate drought detected (score: {risk_score}/100). Current nitrogen application ({nitrogen:.0f} kg/ha) is below optimal. "
            f"Increase nitrogen to 240-280 kg/ha to help plants cope with stress and maintain fiber quality. "
            f"Current irrigation level ({irrigation:.0f}%) is acceptable but monitor soil moisture closely. "
            f"Predicted yield: {predicted_yield:.0f} kg/ha with proper nutrient management."
        )
    elif risk_level == "HIGH" and irrigation >= 75:
        advice = (
            f"High drought risk (score: {risk_score}/100) but good irrigation coverage ({irrigation:.0f}%). "
            f"Your irrigation strategy is appropriate for current conditions. Continue monitoring and maintain nitrogen at {nitrogen:.0f} kg/ha. "
            f"Consider deficit irrigation strategy during peak growth stages. Predicted yield: {predicted_yield:.0f} kg/ha."
        )
    elif risk_level == "LOW":
        advice = (
            f"Favorable conditions detected (drought risk: {risk_score}/100). "
            f"Current practices are appropriate: {irrigation:.0f}% irrigation, {nitrogen:.0f} kg/ha nitrogen. "
            f"Maintain current management for variety {request.variety}. "
            f"Expected yield: {predicted_yield:.0f} kg/ha. Monitor for pest pressure during optimal growth conditions."
        )
    else:
        advice = (
            f"Drought risk level: {risk_level} (score: {risk_score}/100). "
            f"Current inputs: {irrigation:.0f}% irrigation, {nitrogen:.0f} kg/ha nitrogen. "
            f"Predicted yield: {predicted_yield:.0f} kg/ha. " + " ".join(cotton_pred["advice"])
        )

    # 4. Summary
    if "error" in drought_result:
        summary = f"Cotton: {predicted_yield:.0f} kg/ha. Drought data unavailable."
    else:
        # Drought-adjusted yield (simple penalty)
        drought_penalty = 1.0 - (risk_score / 100 * 0.3)  # Up to 30% reduction at max risk
        adjusted_yield = predicted_yield * drought_penalty
        summary = (
            f"Drought: {risk_level} ({risk_score}/100). "
            f"Cotton: {predicted_yield:.0f} kg/ha "
            f"(drought-adjusted: {adjusted_yield:.0f} kg/ha)."
        )

    return CombinedResponse(
        drought_result=drought_result,
        cotton_result=cotton_result,
        combined_advice=advice,
        summary=summary
    )

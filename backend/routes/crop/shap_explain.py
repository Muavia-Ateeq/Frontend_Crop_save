"""SHAP explanations endpoint for cotton yield predictions."""
from fastapi import APIRouter, HTTPException

from models.schemas import CottonPredictRequest, SHAPExplanation
from services.cotton_model import BUNDLE, model_loaded, predict_cotton_yield

router = APIRouter()


@router.post("/cotton/explain", response_model=SHAPExplanation)
async def explain_cotton_prediction(request: CottonPredictRequest):
    """Get SHAP explanations for a cotton yield prediction.

    Returns the top 5 features by absolute impact on the prediction.
    """
    if not model_loaded:
        raise HTTPException(
            status_code=503,
            detail="Cotton model not loaded. Check server logs."
        )

    try:
        # Get prediction with SHAP values
        result = predict_cotton_yield(
            location=request.location,
            genotype=request.variety,
            water_supply_pct=int(request.irrigation_level),
            n_rate_kg_ha=int(request.nitrogen_amount),
            soil_type=request.soil_type or "Clay Loam"
        )

        # Zip feature names with SHAP values
        features = BUNDLE["features"]
        shap_values_raw = result["shap_values"]

        feature_contributions = [
            {
                "feature_name": name,
                "shap_value": float(value),
                "feature_value": 0.0  # ponytail: feature values not in predict output
            }
            for name, value in zip(features, shap_values_raw)
        ]

        # Sort by absolute impact, take top 5
        feature_contributions.sort(key=lambda x: abs(x["shap_value"]), reverse=True)
        top_5 = feature_contributions[:5]

        # Extract base value from explainer
        base_value = float(BUNDLE["shap_explainer"].expected_value)

        return SHAPExplanation(
            shap_values=top_5,
            base_value=base_value,
            predicted_value=result["predicted_yield"],
            top_factor=top_5[0]["feature_name"]
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"SHAP calculation failed: {str(e)}"
        )

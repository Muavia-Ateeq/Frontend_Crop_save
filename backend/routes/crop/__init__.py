"""
Cotton yield prediction routes.

Endpoints:
- POST /crop/predict - Predict cotton fiber yield
- POST /crop/explain - Get SHAP explanations for prediction
"""
from fastapi import APIRouter
from . import cotton_predict, shap_explain

router = APIRouter()

# Include all cotton-related endpoints
router.include_router(cotton_predict.router)
router.include_router(shap_explain.router)

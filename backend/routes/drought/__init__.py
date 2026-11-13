"""
Drought prediction routes.

Endpoints:
- POST /drought/predict - Get drought risk prediction
- GET /drought/advisory - Get farming advice (bilingual)
- GET /drought/history - Get historical climate data
"""
from fastapi import APIRouter
from . import predict, advisory, history

router = APIRouter()

# Include all drought-related endpoints
router.include_router(predict.router)
router.include_router(advisory.router)
router.include_router(history.router)

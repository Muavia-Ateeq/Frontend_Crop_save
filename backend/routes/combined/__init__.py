"""
Combined analysis routes.

Endpoints:
- POST /combined/analyze - Get both drought + cotton predictions with cross-insights
"""
from fastapi import APIRouter
from . import analysis

router = APIRouter()

# Include combined analysis endpoint
router.include_router(analysis.router)

"""CropSave API: 30-day drought risk for Pakistani districts from NASA POWER data.

Run: uvicorn main:app --reload   (from the backend/ folder)
"""
import os
from datetime import datetime
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from logger import logger

from routes.drought import router as drought_router
from routes.crop import router as crop_router
from routes.combined import router as combined_router
from services.ml_service import model_loaded

load_dotenv()

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="CropSave API",
    description="Drought risk from NASA POWER satellite data"
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration with validation
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
origins = [origin.strip() for origin in cors_origins if origin.strip()]

# Validate origins - warn if wildcard is used
if "*" in origins:
    logger.warning("CORS configured with wildcard (*) - this is insecure for production!")
else:
    logger.info(f"CORS configured with origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


@app.get("/health")
def health():
    """Server health check."""
    return {"status": "ok", "model_loaded": model_loaded}


@app.get("/health/ready")
async def readiness_check():
    """Readiness probe - checks if app can serve traffic."""
    checks = {
        "drought_model_loaded": model_loaded,
        "cotton_model_loaded": False,  # Will be True when model added
    }

    # Check if critical dependencies are working
    all_ready = all(checks.values()) or model_loaded  # At least drought works

    return {
        "status": "ready" if all_ready else "not_ready",
        "checks": checks,
        "timestamp": datetime.now().isoformat()
    }


@app.get("/health/live")
async def liveness_check():
    """Liveness probe - checks if app is running."""
    return {
        "status": "alive",
        "timestamp": datetime.now().isoformat()
    }


# API v1 routes
app.include_router(drought_router, prefix="/v1/drought", tags=["Drought Prediction"])
app.include_router(crop_router, prefix="/v1/crop", tags=["Cotton Yield"])
app.include_router(combined_router, prefix="/v1/combined", tags=["Combined Analysis"])

# Legacy routes (backward compatibility - temporary)
app.include_router(drought_router, prefix="/drought", tags=["Drought Prediction (Legacy)"], include_in_schema=False)
app.include_router(crop_router, prefix="/crop", tags=["Cotton Yield (Legacy)"], include_in_schema=False)
app.include_router(combined_router, prefix="/combined", tags=["Combined Analysis (Legacy)"], include_in_schema=False)

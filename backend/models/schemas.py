"""Pydantic models for request and response validation."""
from typing import Optional
from pydantic import BaseModel, Field


class PredictRequest(BaseModel):
    """A point inside Pakistan's bounding box."""
    lat: float = Field(ge=23.0, le=37.5, description="Latitude (23.0 to 37.5 for Pakistan)")
    lon: float = Field(ge=60.5, le=77.5, description="Longitude (60.5 to 77.5 for Pakistan)")
    district_name: Optional[str] = Field(None, description="Name of the district (optional)")


class PredictResponse(BaseModel):
    """Drought prediction response."""
    district_name: str
    risk_score: int = Field(ge=0, le=100, description="Risk score from 0 to 100")
    risk_level: str = Field(description="LOW, MEDIUM, or HIGH")
    soil_moisture: float
    rainfall_last_30_days: float
    temperature_max: float
    humidity: float
    prediction_date: str
    features: dict = Field(default_factory=dict, description="Feature values used by the model")

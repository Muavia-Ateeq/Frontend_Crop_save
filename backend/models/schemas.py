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


class CottonPredictRequest(BaseModel):
    """Cotton yield prediction request."""
    variety: str = Field(description="Cotton variety/genotype")
    irrigation_level: float = Field(ge=0, le=100, description="Irrigation level 0-100%")
    nitrogen_amount: float = Field(gt=0, description="Nitrogen fertilizer rate in kg/ha")
    soil_moisture: float = Field(ge=0, le=1, description="Soil moisture 0-1")
    location: str = Field(description="Growing location")
    soil_type: Optional[str] = Field("Clay Loam", description="Soil type")
    district_lat: Optional[float] = None
    district_lon: Optional[float] = None


class CottonPredictResponse(BaseModel):
    """Cotton yield prediction response."""
    predicted_yield: float = Field(description="Predicted yield in kg/ha")
    drought_adjusted_yield: float = Field(description="Yield after drought adjustment")
    drought_risk_level: str = Field(description="LOW, MEDIUM, HIGH, or UNKNOWN")
    drought_impact_percent: int = Field(ge=0, le=100, description="Drought impact percentage")
    confidence: str = Field(description="Prediction confidence: HIGH, MEDIUM, or LOW")
    variety_used: str = Field(description="Cotton variety used in prediction")
    prediction_date: str = Field(description="ISO format prediction timestamp")


class SHAPExplanation(BaseModel):
    """SHAP explanation for cotton yield prediction."""
    shap_values: list[dict] = Field(description="Top feature contributions")
    base_value: float = Field(description="Model's expected value")
    predicted_value: float = Field(description="Actual prediction")
    top_factor: str = Field(description="Most important feature name")


class CombinedRequest(BaseModel):
    """Combined drought + cotton analysis request."""
    lat: float = Field(ge=23.0, le=37.5, description="Latitude")
    lon: float = Field(ge=60.5, le=77.5, description="Longitude")
    district_name: str = Field(description="District name")
    variety: str = Field(description="Cotton variety/genotype")
    irrigation_level: float = Field(ge=0, le=100, description="Irrigation level %")
    nitrogen_amount: float = Field(ge=0, description="Nitrogen kg/ha")
    soil_moisture: float = Field(ge=0, le=1, description="Soil moisture 0-1")


class CombinedResponse(BaseModel):
    """Combined drought + cotton analysis response."""
    drought_result: dict = Field(description="Full drought prediction")
    cotton_result: dict = Field(description="Full cotton prediction")
    combined_advice: str = Field(description="Multi-line advice paragraph")
    summary: str = Field(description="One sentence summary")

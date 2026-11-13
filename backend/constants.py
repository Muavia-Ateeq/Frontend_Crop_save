"""Application constants and configuration values."""

# Drought Risk Thresholds
RISK_THRESHOLD_LOW = 30
RISK_THRESHOLD_MEDIUM = 65
RISK_THRESHOLD_HIGH = 100

# Risk Level Names
RISK_LEVEL_LOW = "LOW"
RISK_LEVEL_MEDIUM = "MEDIUM"
RISK_LEVEL_HIGH = "HIGH"

# Drought Impact Percentages (on cotton yield)
DROUGHT_IMPACT_HIGH = 40  # percent
DROUGHT_IMPACT_MEDIUM = 20  # percent
DROUGHT_IMPACT_LOW = 0  # percent

# Cotton Optimal Ranges
OPTIMAL_WATER_MIN = 75  # percent
OPTIMAL_NITROGEN_MIN = 240  # kg/ha
OPTIMAL_NITROGEN_MAX = 280  # kg/ha

# NASA API Configuration
NASA_API_TIMEOUT = 60  # seconds (reduced from 120)
NASA_CACHE_SIZE = 256  # LRU cache entries

# Rate Limiting
RATE_LIMIT_PREDICT = "10/minute"
RATE_LIMIT_GENERAL = "20/minute"

# Feature Building
HISTORY_DAYS = 30  # Days of historical data needed
MIN_DATA_WINDOW = 60  # Minimum days for training

def get_risk_level(score: int) -> str:
    """Convert risk score to risk level category."""
    if score <= RISK_THRESHOLD_LOW:
        return RISK_LEVEL_LOW
    elif score <= RISK_THRESHOLD_MEDIUM:
        return RISK_LEVEL_MEDIUM
    return RISK_LEVEL_HIGH

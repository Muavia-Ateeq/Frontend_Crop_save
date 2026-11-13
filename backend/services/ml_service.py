"""ML model interface for drought risk scoring.

Loads the trained Random Forest model from ml/models/ and provides
a predict_risk() function for the FastAPI /predict endpoint.
"""
import os
from pathlib import Path

import joblib
import pandas as pd

from services.feature_builder import FEATURES

ROOT = Path(__file__).resolve().parent.parent  # backend/
MODEL_PATH = Path(os.getenv("MODEL_PATH", ROOT.parent / "ml" / "models" / "random_forest.joblib"))
LEVELS = ["LOW", "MEDIUM", "HIGH"]  # model class index -> label

model = joblib.load(MODEL_PATH) if MODEL_PATH.exists() else None
model_loaded = model is not None


def predict_risk(feats: dict) -> tuple[int, str, str]:
    """Return (risk_score 0-100, risk_level, model_name) for one feature dict.

    If the model file doesn't exist, falls back to a rule-based scorer
    that treats dry soil (low GWETROOT) as high drought risk.
    """
    if model is None:
        # ponytail: rule-based fallback until model.joblib is trained; dry soil = high risk
        score = round(100 * (1 - min(feats["soil_moisture"] / 0.6, 1)))
        return score, LEVELS[min(score // 34, 2)], "rule"
    proba = model.predict_proba(pd.DataFrame([feats])[FEATURES])[0]
    return round(proba[1] * 50 + proba[2] * 100), LEVELS[int(proba.argmax())], "random_forest"

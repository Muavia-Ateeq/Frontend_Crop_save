# CropSave Backend

FastAPI backend for drought risk prediction and cotton yield forecasting using NASA POWER satellite data.

## Quick Start

### 1. Install Dependencies
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env if needed (default values work)
```

### 3. Run Server
```bash
uvicorn main:app --reload
```

API will be available at http://localhost:8000
- **Interactive docs**: http://localhost:8000/docs
- **Health check**: http://localhost:8000/health

---

## Project Structure

```
backend/
    main.py              # FastAPI app initialization
    routes/              # API endpoints
        predict.py       # POST /predict (drought)
        cotton_predict.py  # POST /predict/cotton
        shap.py          # POST /shap/explain
        combined.py      # POST /predict/combined
        history.py       # GET /history
        advisory.py      # GET /advisory
    services/            # Business logic
        nasa_api.py      # NASA POWER API client
        ml_service.py    # ML model loading & prediction (drought)
        cotton_ml_service.py  # Cotton yield prediction
        feature_builder.py  # Feature engineering
    models/              # Pydantic schemas
        schemas.py       # Request/response models
    test_api.py          # API smoke tests
```

---

## API Endpoints

### Drought Prediction
- **GET /health** - Server status check
- **POST /predict** - Drought risk prediction for lat/lon
- **GET /history** - Historical rainfall/soil data by district
- **GET /advisory** - Farming advice (English/Urdu)

### Cotton Yield Prediction
- **POST /predict/cotton** - Cotton yield prediction (quintals/hectare)
- **POST /shap/explain** - SHAP feature importance analysis

### Combined Analysis
- **POST /predict/combined** - Both drought risk and cotton yield in one call

Full API documentation: http://localhost:8000/docs

---

## Cotton Yield Prediction Endpoints

### POST /predict/cotton
Predicts cotton yield based on climate parameters.

**Request:**
```json
{
  "Temperature": 25.5,
  "Rainfall": 800.0,
  "Humidity": 65.0,
  "Soil_pH": 7.2,
  "Fertilizer_kg_per_ha": 150.0,
  "Irrigation_mm": 500.0,
  "Sunshine_hours": 8.5,
  "Pest_Incidence": 15.0
}
```

**Response:**
```json
{
  "predicted_yield": 12.45,
  "model_used": "ensemble",
  "timestamp": "2026-11-13T10:30:00"
}
```

### POST /shap/explain
Returns SHAP feature importance values explaining yield predictions.

**Request:** Same as `/predict/cotton`

**Response:**
```json
{
  "predicted_yield": 12.45,
  "shap_values": {
    "Rainfall": 0.85,
    "Temperature": 0.42,
    "Irrigation_mm": 0.35,
    ...
  },
  "feature_contributions": [
    {"feature": "Rainfall", "value": 800.0, "impact": 0.85},
    ...
  ]
}
```

---

## Combined Analysis Endpoint

### POST /predict/combined
Returns both drought risk and cotton yield prediction in a single call.

**Request:**
```json
{
  "latitude": 31.5497,
  "longitude": 74.3436,
  "Temperature": 25.5,
  "Rainfall": 800.0,
  "Humidity": 65.0,
  "Soil_pH": 7.2,
  "Fertilizer_kg_per_ha": 150.0,
  "Irrigation_mm": 500.0,
  "Sunshine_hours": 8.5,
  "Pest_Incidence": 15.0
}
```

**Response:**
```json
{
  "drought_prediction": {
    "risk_score": 35,
    "risk_level": "LOW",
    "recommendation": "Continue normal farming..."
  },
  "cotton_prediction": {
    "predicted_yield": 12.45,
    "model_used": "ensemble"
  },
  "timestamp": "2026-11-13T10:30:00"
}
```

---

## Model Files Requirement

The following trained model files are required in `../ml/models/`:
- `random_forest.joblib` - Drought prediction model
- `cotton_rf_model.pkl` - Cotton Random Forest model
- `cotton_gb_model.pkl` - Cotton Gradient Boosting model
- `cotton_xgb_model.pkl` - Cotton XGBoost model

If model files are missing, endpoints will return 503 errors.

---

## Environment Variables

Required environment variables (set in `.env` or Render dashboard):

| Variable | Description | Default/Example |
|---|---|---|
| **CORS_ORIGINS** | Allowed CORS origins | `*` (dev), `https://cropsave.vercel.app` (prod) |
| **NASA_POWER_BASE_URL** | NASA POWER API endpoint | `https://power.larc.nasa.gov/api/temporal/daily/point` |
| **MODEL_PATH** | Drought prediction model | `../ml/models/random_forest.joblib` |
| **SCALER_PATH** | Feature scaler for drought model | `../ml/models/scaler.pkl` |
| **COTTON_MODEL_PATH** | Cotton yield model bundle | `ml_models/cotton_model.pkl` |
| **ENVIRONMENT** | Deployment environment | `development` / `production` |
| **PORT** | Server port (Render sets automatically) | `8000` |

**Production setup**: Copy `.env.example` to `.env` and update values.

---

## Testing

Run the test suite:
```bash
python test_api.py
```

All 4 endpoints will be tested against the live API.

---

## Deployment

The backend is configured for deployment on Render.com:
- See `../render.yaml` for deployment configuration
- Uses Python 3.11 runtime
- Health check endpoint: `/health`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

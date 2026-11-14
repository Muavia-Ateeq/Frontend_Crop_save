# CropSave Drought API

FastAPI service for district drought-risk forecasts, rainfall history, and farming advisories using NASA POWER data. CottonYield is maintained and deployed separately; this backend does not provide CottonYield endpoints.

## Run locally

From the repository root:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn main:app --reload --port 8001
```

The API is available at `http://localhost:8001`; interactive docs are at `/docs`. Port `8001` keeps the local CropSave service separate from the CottonYield backend, which uses its own URL.

## Endpoints

The current frontend uses the legacy paths below. Versioned equivalents are also available under `/v1/drought`.

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Liveness/status |
| `GET` | `/health/live` | Liveness probe |
| `GET` | `/health/ready` | Model readiness |
| `POST` | `/drought/predict` | District drought forecast |
| `GET` | `/drought/history` | Monthly NASA POWER rainfall history |
| `GET` | `/drought/advisory` | Farming advice by risk level |

### Drought forecast

`POST /drought/predict`

```json
{
  "lat": 30.1575,
  "lon": 71.5249,
  "district_name": "Multan"
}
```

Latitude and longitude must be within Pakistan's supported bounds. The response includes `risk_score`, `risk_level`, soil moisture, rainfall, temperature, humidity, and prediction date.

### Rainfall history

`GET /drought/history?district=Multan`

Alternatively, supply both `lat` and `lon`. The response contains a `months` array with `month`, `rain_mm`, and `soil_wetness` values.

### Farming advisory

`GET /drought/advisory?risk_level=HIGH&lang=en`

Supported risk levels are `LOW`, `MEDIUM`, and `HIGH`; supported languages are `en` and `ur`.

## Configuration

Copy `.env.example` to `.env`. Configure `CORS_ORIGINS` with the frontend origin(s), and adjust model paths only if the model files are stored elsewhere. The drought model and scaler included in `backend/models/` are used by default.

Never commit `.env` files or credentials.

## Tests

From `backend/`, run:

```powershell
python test_api.py
```

This smoke test calls NASA POWER for forecast and history data. `python test_endpoints.py` sends the same CropSave-only checks to a locally running API.

## Deployment

Run the app from this directory with:

```text
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Set the hosting service's root directory to `backend`, install dependencies from `requirements.txt`, and set production `CORS_ORIGINS` to the deployed frontend origin.

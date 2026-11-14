# CropSave Frontend Integration

This guide covers the CropSave drought API only. CottonYield uses its own separately maintained backend and API URL.

## Base URL

Set `VITE_CROPSAVE_API_URL` to the deployed CropSave backend origin, without an endpoint suffix. For local development:

```env
VITE_CROPSAVE_API_URL=http://localhost:8000
```

## Forecast

`POST /drought/predict`

```json
{
  "lat": 30.1575,
  "lon": 71.5249,
  "district_name": "Multan"
}
```

The response fields used by the frontend include:

```json
{
  "district_name": "Multan",
  "risk_score": 42,
  "risk_level": "MEDIUM",
  "soil_moisture": 0.31,
  "rainfall_last_30_days": 14.2,
  "temperature_max": 37.1,
  "humidity": 48.5,
  "prediction_date": "2026-11-13"
}
```

## Rainfall history

`GET /drought/history?district=Multan`

The endpoint also accepts `lat` and `lon`. It returns a `months` array containing monthly rainfall values (`month`, `rain_mm`) and soil wetness.

## Advisory

`GET /drought/advisory?risk_level=MEDIUM&lang=en`

Risk levels are `LOW`, `MEDIUM`, and `HIGH`; languages are `en` and `ur`.

## CORS

Set the backend's `CORS_ORIGINS` environment variable to a comma-separated list that includes the Vercel deployment origin and any local development origins that need access.

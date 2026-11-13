# Backend Integration Guide

**Live API**: `https://crop-save-nasa-space-challenge.onrender.com`

Complete guide for integrating the deployed CropSave backend into your frontend.

---

## Quick Start

```bash
# Test drought prediction
curl -X POST https://crop-save-nasa-space-challenge.onrender.com/drought/predict \
  -H "Content-Type: application/json" \
  -d '{"features": [25.5, 60, 5.0, 30, 150, 20, 2.5, 1000, 0.8, 15]}'

# Test cotton prediction
curl -X POST https://crop-save-nasa-space-challenge.onrender.com/crop/cotton/predict \
  -H "Content-Type: application/json" \
  -d '{"features": [25, 60, 800, 50, 7.5, 1.2, 0.8, 30]}'

# Test combined analysis
curl -X POST https://crop-save-nasa-space-challenge.onrender.com/combined/analysis \
  -H "Content-Type: application/json" \
  -d '{
    "drought_features": [25.5, 60, 5.0, 30, 150, 20, 2.5, 1000, 0.8, 15],
    "cotton_features": [25, 60, 800, 50, 7.5, 1.2, 0.8, 30]
  }'
```

---

## API Endpoints

### 1. Drought Prediction

**Endpoint**: `POST /drought/predict`

**Request**:
```json
{
  "features": [
    25.5,  // Temperature (°C)
    60,    // Humidity (%)
    5.0,   // Rainfall (mm)
    30,    // Soil Moisture (%)
    150,   // Evapotranspiration (mm)
    20,    // Wind Speed (km/h)
    2.5,   // Cloud Cover (oktas)
    1000,  // Solar Radiation (W/m²)
    0.8,   // NDVI
    15     // Days Since Last Rain
  ]
}
```

**Response** (200 OK):
```json
{
  "prediction": 1,
  "probability": 0.85,
  "risk_level": "High",
  "confidence": 0.85
}
```

**Prediction Values**:
- `0` = No Drought
- `1` = Drought Likely
- `2` = Severe Drought

---

### 2. Cotton Yield Prediction

**Endpoint**: `POST /crop/cotton/predict`

**Request**:
```json
{
  "features": [
    25,   // Temperature (°C)
    60,   // Humidity (%)
    800,  // Rainfall (mm)
    50,   // Fertilizer (kg/ha)
    7.5,  // Soil pH
    1.2,  // Nitrogen (%)
    0.8,  // Phosphorus (%)
    30    // Potassium (%)
  ]
}
```

**Response** (200 OK):
```json
{
  "predicted_yield": 2450.75,
  "unit": "kg/ha",
  "confidence": 0.92
}
```

---

### 3. Cotton SHAP Explanation

**Endpoint**: `POST /crop/cotton/explain`

**Request**: Same as `/crop/cotton/predict`

**Response** (200 OK):
```json
{
  "predicted_yield": 2450.75,
  "shap_values": [120.5, -45.2, 89.3, 34.1, -12.8, 67.9, -23.4, 45.6],
  "feature_names": [
    "Temperature",
    "Humidity",
    "Rainfall",
    "Fertilizer",
    "Soil_pH",
    "Nitrogen",
    "Phosphorus",
    "Potassium"
  ],
  "base_value": 2200.0,
  "top_factors": [
    {"feature": "Temperature", "impact": 120.5},
    {"feature": "Rainfall", "impact": 89.3},
    {"feature": "Nitrogen", "impact": 67.9}
  ]
}
```

---

### 4. Combined Analysis

**Endpoint**: `POST /combined/analysis`

**Request**:
```json
{
  "drought_features": [25.5, 60, 5.0, 30, 150, 20, 2.5, 1000, 0.8, 15],
  "cotton_features": [25, 60, 800, 50, 7.5, 1.2, 0.8, 30]
}
```

**Response** (200 OK):
```json
{
  "drought_analysis": {
    "prediction": 1,
    "probability": 0.85,
    "risk_level": "High"
  },
  "cotton_analysis": {
    "predicted_yield": 2450.75,
    "unit": "kg/ha",
    "shap_explanation": {
      "shap_values": [120.5, -45.2, 89.3, 34.1, -12.8, 67.9, -23.4, 45.6],
      "feature_names": ["Temperature", "Humidity", "Rainfall", "Fertilizer", "Soil_pH", "Nitrogen", "Phosphorus", "Potassium"],
      "top_factors": [
        {"feature": "Temperature", "impact": 120.5},
        {"feature": "Rainfall", "impact": 89.3},
        {"feature": "Nitrogen", "impact": 67.9}
      ]
    }
  },
  "recommendations": [
    "High drought risk detected - implement water conservation",
    "Expected yield: 2450.75 kg/ha",
    "Temperature and rainfall are key factors affecting yield"
  ]
}
```

---

## Frontend Integration

### Update API Configuration

**Old Code**:
```javascript
const API_URL = 'http://localhost:5000';

// Old endpoints
fetch(`${API_URL}/predict`, { ... })
```

**New Code**:
```javascript
const API_URL = 'https://crop-save-nasa-space-challenge.onrender.com';

// New endpoints - note the path changes
fetch(`${API_URL}/drought/predict`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ features: droughtFeatures })
});

fetch(`${API_URL}/crop/cotton/predict`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ features: cottonFeatures })
});

// Use combined endpoint for full analysis
fetch(`${API_URL}/combined/analysis`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    drought_features: droughtFeatures,
    cotton_features: cottonFeatures
  })
});
```

### Migration Checklist

- [ ] Replace `http://localhost:5000` with `https://crop-save-nasa-space-challenge.onrender.com`
- [ ] Update `/predict` → `/drought/predict`
- [ ] Add `/crop/cotton/predict` for cotton yield
- [ ] Add `/crop/cotton/explain` for SHAP explanations
- [ ] Use `/combined/analysis` for integrated insights
- [ ] Handle new response format (see examples above)
- [ ] Add loading states (first request may be slow due to cold start)

---

## CORS Configuration

**Allowed Origins**:
```python
CORS(app, origins=[
    "http://localhost:3000",
    "http://localhost:5173",
    "https://your-frontend-domain.vercel.app",
    "*"  # Currently allows all origins
])
```

**If you get CORS errors**:
1. Check browser console for exact error
2. Verify request includes `Content-Type: application/json` header
3. Contact backend team to add your domain

---

## Error Handling

### Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Parse response JSON |
| 400 | Bad Request | Check request format/features count |
| 500 | Server Error | Retry or contact support |
| 503 | Service Unavailable | Cold start - retry in 30s |

### Error Response Format

```json
{
  "error": "Invalid features length. Expected 10, got 8",
  "details": "Drought prediction requires exactly 10 features"
}
```

### Error Handling Example

```javascript
try {
  const response = await fetch(`${API_URL}/drought/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ features: droughtFeatures })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Prediction failed');
  }
  
  const data = await response.json();
  console.log('Prediction:', data.prediction);
  console.log('Risk Level:', data.risk_level);
  
} catch (error) {
  console.error('API Error:', error.message);
  // Show user-friendly error message
}
```

---

## Testing

### Using test_endpoints.py

```bash
cd backend
python test_endpoints.py
```

**What it tests**:
- All 4 endpoints with real data
- Response format validation
- Error handling
- Cold start detection

### Manual Testing

```bash
# Health check
curl https://crop-save-nasa-space-challenge.onrender.com/

# Drought prediction
curl -X POST https://crop-save-nasa-space-challenge.onrender.com/drought/predict \
  -H "Content-Type: application/json" \
  -d '{"features": [25.5, 60, 5.0, 30, 150, 20, 2.5, 1000, 0.8, 15]}'

# Cotton prediction
curl -X POST https://crop-save-nasa-space-challenge.onrender.com/crop/cotton/predict \
  -H "Content-Type: application/json" \
  -d '{"features": [25, 60, 800, 50, 7.5, 1.2, 0.8, 30]}'

# Cotton explanation
curl -X POST https://crop-save-nasa-space-challenge.onrender.com/crop/cotton/explain \
  -H "Content-Type: application/json" \
  -d '{"features": [25, 60, 800, 50, 7.5, 1.2, 0.8, 30]}'

# Combined analysis
curl -X POST https://crop-save-nasa-space-challenge.onrender.com/combined/analysis \
  -H "Content-Type: application/json" \
  -d '{
    "drought_features": [25.5, 60, 5.0, 30, 150, 20, 2.5, 1000, 0.8, 15],
    "cotton_features": [25, 60, 800, 50, 7.5, 1.2, 0.8, 30]
  }'
```

---

## Cotton Model Setup

**The cotton model file is NOT in this repo** - you need to get it from Muavia's repository.

### Steps:

1. **Get model file** from Muavia's cotton prediction repo:
   ```bash
   # Ask Muavia for: cotton_yield_model.pkl
   # Expected location: his-repo/models/cotton_yield_model.pkl
   ```

2. **Add to this repo**:
   ```bash
   # Place file here:
   backend/models/cotton_yield_model.pkl
   ```

3. **Verify size**: Model should be ~1-5 MB

4. **Test locally**:
   ```bash
   cd backend
   python -c "import joblib; model = joblib.load('models/cotton_yield_model.pkl'); print('Model loaded successfully')"
   ```

5. **Deploy**:
   - Commit model file
   - Push to GitHub
   - Render will auto-redeploy

### Current Status

✅ Drought model (`drought_model.pkl`) - Working  
❌ Cotton model (`cotton_yield_model.pkl`) - **Missing - need from Muavia**  

**Without cotton model**: `/crop/cotton/predict` and `/crop/cotton/explain` will return 500 errors.

---

## Performance Notes

### Cold Starts
- First request after 15min inactivity takes ~30-60s
- Subsequent requests: <1s
- Solution: Implement frontend loading state

### Timeouts
- Set client timeout to 60s minimum
- Add retry logic for 503 errors

### Rate Limiting
- No limits currently
- Add if needed based on usage

---

## Support

**Issues?**
1. Check logs: Render dashboard → Logs
2. Test locally: `python app.py`
3. Verify model files exist in `backend/models/`
4. Check `test_endpoints.py` output

**Need the cotton model?**
Contact Muavia for `cotton_yield_model.pkl` from his repository.

---

**Last Updated**: 2026-11-13  
**API Version**: 1.0  
**Deployment**: Render.com

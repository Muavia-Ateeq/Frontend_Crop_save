#!/usr/bin/env python3
"""
Integration tests for CropSave backend endpoints.
Run with: python test_endpoints.py
"""
import requests
import time
from datetime import datetime

BASE_URL = "http://localhost:8000"

def test_endpoint(method, endpoint, data=None, description=""):
    """Test one endpoint and print results."""
    print(f"\n{'='*60}")
    print(f"TEST: {description}")
    print(f"{method} {endpoint}")

    start = time.time()
    try:
        if method == "GET":
            r = requests.get(f"{BASE_URL}{endpoint}", timeout=10)
        else:
            r = requests.post(f"{BASE_URL}{endpoint}", json=data, timeout=10)

        duration = time.time() - start

        if r.status_code == 200:
            print(f"✅ PASS | {r.status_code} | {duration:.2f}s")
            print(f"Response: {r.json()}")
        else:
            print(f"❌ FAIL | {r.status_code} | {duration:.2f}s")
            print(f"Error: {r.text}")

        return r
    except Exception as e:
        duration = time.time() - start
        print(f"❌ ERROR | {duration:.2f}s")
        print(f"Exception: {str(e)}")
        return None

# Test cases
print("="*60)
print(f"CROPSAVE BACKEND INTEGRATION TESTS")
print(f"Started: {datetime.now().isoformat()}")
print("="*60)

# 1. Health check
test_endpoint("GET", "/health", description="Health check")

# 2. Drought prediction
test_endpoint("POST", "/drought/predict", {
    "lat": 31.5204,
    "lon": 74.3587,
    "district_name": "Lahore"
}, "Drought prediction for Lahore")

# 3. Cotton prediction
test_endpoint("POST", "/crop/cotton/predict", {
    "variety": "CKC-6",
    "irrigation_level": 100,
    "nitrogen_amount": 240,
    "soil_moisture": 0.5,
    "location": "Multan"
}, "Cotton yield prediction")

# 4. Combined analysis
test_endpoint("POST", "/combined/analysis", {
    "lat": 30.1575,
    "lon": 71.5249,
    "district_name": "Multan",
    "variety": "CKC-6",
    "irrigation_level": 75,
    "nitrogen_amount": 240,
    "soil_moisture": 0.4
}, "Combined drought + cotton analysis")

print("\n" + "="*60)
print("TESTS COMPLETE")
print("="*60)

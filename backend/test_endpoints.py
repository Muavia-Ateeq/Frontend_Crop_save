#!/usr/bin/env python3
"""Smoke-test CropSave drought endpoints against a local server."""
from datetime import datetime
import time

import requests

BASE_URL = "http://localhost:8000"


def test_endpoint(method, endpoint, data=None, description=""):
    """Call one endpoint and print its status and response."""
    print(f"\n{'=' * 60}")
    print(f"TEST: {description}")
    print(f"{method} {endpoint}")

    start = time.time()
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=60)
        else:
            response = requests.post(f"{BASE_URL}{endpoint}", json=data, timeout=60)

        duration = time.time() - start
        print(f"{'PASS' if response.ok else 'FAIL'} | {response.status_code} | {duration:.2f}s")
        print(f"Response: {response.text}")
        return response
    except requests.RequestException as error:
        duration = time.time() - start
        print(f"ERROR | {duration:.2f}s")
        print(f"Exception: {error}")
        return None


if __name__ == "__main__":
    print("CROPSAVE DROUGHT API SMOKE TESTS")
    print(f"Started: {datetime.now().isoformat()}")

    test_endpoint("GET", "/health", description="Health check")
    test_endpoint(
        "POST",
        "/drought/predict",
        {"lat": 31.5204, "lon": 74.3587, "district_name": "Lahore"},
        "Drought prediction for Lahore",
    )
    test_endpoint("GET", "/drought/history?district=Lahore", description="Rainfall history")
    test_endpoint(
        "GET",
        "/drought/advisory?risk_level=HIGH&lang=en",
        description="High-risk farming advisory",
    )

"""Smoke test for the CropSave API (hits the live NASA POWER API for /predict and /history).

Usage: python backend/test_api.py
"""
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_all():
    """Assert-based checks of every endpoint."""
    r = client.get("/health")
    assert r.status_code == 200 and r.json()["status"] == "ok"

    r = client.post("/predict", json={"lat": 30.20, "lon": 71.47})  # Multan
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["risk_level"] in ("LOW", "MEDIUM", "HIGH") and 0 <= body["risk_score"] <= 100
    print("predict Multan:", body)
    # Multan averages ~230 mm/year; guards the NASA POWER GEOS-IT x24 workaround in nasa.py
    assert body["features"]["rain_30d"] < 300 and body["features"]["rain_prev_month"] < 300, "implausible rainfall"

    assert client.post("/predict", json={"lat": 51.5, "lon": -0.1}).status_code == 422  # London

    r = client.get("/history", params={"district": "multan"})
    assert r.status_code == 200 and len(r.json()["months"]) >= 48
    assert max(m["rain_mm"] for m in r.json()["months"]) < 400, "implausible monthly rainfall"
    assert client.get("/history", params={"district": "Atlantis"}).status_code == 404

    r = client.get("/advisory", params={"risk_level": "HIGH", "lang": "ur"})
    assert r.status_code == 200 and r.json()["tips"]
    assert client.get("/advisory", params={"risk_level": "EXTREME"}).status_code == 422
    print("all checks passed")


if __name__ == "__main__":
    test_all()

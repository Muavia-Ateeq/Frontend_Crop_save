"""Historical rainfall and soil moisture data by district."""
import json
from datetime import date, timedelta
from pathlib import Path

import httpx
import pandas as pd
from typing import Optional
from fastapi import APIRouter, HTTPException, Query

from services.nasa_api import fetch_daily

router = APIRouter()
ROOT = Path(__file__).resolve().parent.parent  # backend/
DISTRICTS = {d["name"].lower(): d for d in json.loads((ROOT / "data" / "districts.json").read_text())}
POWER_LAG_DAYS = 3  # NASA POWER near-real-time data trails today by a few days


def nasa_or_502(lat: float, lon: float, start: date, end: date) -> pd.DataFrame:
    """Fetch NASA POWER data, turning upstream failures into a clean 502 JSON error."""
    try:
        return fetch_daily(lat, lon, start, end)
    except httpx.HTTPError as e:
        raise HTTPException(502, f"NASA POWER API unavailable: {e}") from e


@router.get("/history")
def history(
    district: Optional[str] = Query(None, description="District name, e.g. Multan"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude"),
):
    """Monthly NASA POWER rainfall and soil wetness for a district or coordinates, last 5 years."""
    target_lat = None
    target_lon = None
    target_name = "Location"

    if district:
        clean_name = district.strip()
        d = DISTRICTS.get(clean_name.lower())
        if d:
            target_lat = d["lat"]
            target_lon = d["lon"]
            target_name = d["name"]
        else:
            raise HTTPException(404, f"District '{clean_name}' not found")

    if target_lat is None or target_lon is None:
        if lat is not None and lon is not None:
            target_lat = lat
            target_lon = lon
            if target_name == "Location":
                target_name = f"Location ({lat:.2f}, {lon:.2f})"
        else:
            raise HTTPException(400, "Must provide a valid 'district' or both 'lat' and 'lon'")

    end = date.today() - timedelta(days=POWER_LAG_DAYS)
    df = nasa_or_502(target_lat, target_lon, end.replace(year=end.year - 5, day=1), end)
    monthly = df.resample("MS").agg({"PRECTOTCORR": "sum", "GWETROOT": "mean"}).dropna()
    return {
        "district": target_name,
        "data_source": "NASA POWER",
        "months": [
            {"month": ts.strftime("%Y-%m"), "rain_mm": round(r.PRECTOTCORR, 1), "soil_wetness": round(r.GWETROOT, 3)}
            for ts, r in monthly.iterrows()
        ],
    }
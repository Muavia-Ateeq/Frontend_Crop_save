"""NASA POWER API client.

All weather and soil data in CropSave comes from NASA POWER
(https://power.larc.nasa.gov), which is free and needs no API key:
  - PRECTOTCORR: precipitation (mm/day), bias-corrected, based on NASA GPM/IMERG
  - GWETROOT:    root-zone soil wetness (0-1), from NASA GMAO MERRA-2
  - T2M_MAX:     max air temperature at 2 m (deg C)
  - RH2M:        relative humidity at 2 m (%)
"""
from datetime import date, timedelta
from functools import lru_cache

import httpx
import numpy as np
import pandas as pd

from logger import logger

POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
PARAMS = ["PRECTOTCORR", "GWETROOT", "T2M_MAX", "RH2M"]
FILL_VALUE = -999  # NASA POWER marks missing values with -999


@lru_cache(maxsize=256)
def _fetch(lat: float, lon: float, start: str, end: str) -> pd.DataFrame:
    """Download daily NASA POWER data for one point (cached per argument set)."""
    resp = httpx.get(
        POWER_URL,
        params={
            "parameters": ",".join(PARAMS),
            "community": "AG",
            "latitude": lat,
            "longitude": lon,
            "start": start,
            "end": end,
            "format": "JSON",
        },
        timeout=120,
    )
    resp.raise_for_status()
    body = resp.json()
    df = pd.DataFrame(body["properties"]["parameter"])
    df.index = pd.to_datetime(df.index, format="%Y%m%d")
    df = df.replace(FILL_VALUE, float("nan"))[PARAMS]
    if "GEOSIT" in body["header"].get("sources", []):
        # ponytail: NASA POWER bug seen Oct 2026 - when the near-real-time GEOS-IT source is in a
        # response, PRECTOTCORR for EVERY day in it comes back 24x too large (MERRA-2-only responses
        # are correct). test_api.py checks rainfall stays plausible, so it fails if NASA fixes this.
        df["PRECTOTCORR"] /= 24
    return df


def fetch_daily(lat: float, lon: float, start: date, end: date) -> pd.DataFrame:
    """Return a daily DataFrame of NASA POWER parameters for a lat/lon point.

    Index is a DatetimeIndex; columns are PARAMS. Missing values are NaN.
    Coordinates are rounded to 2 decimals so nearby requests share the cache.
    """
    df = _fetch(round(lat, 2), round(lon, 2), start.strftime("%Y%m%d"), end.strftime("%Y%m%d"))
    return df.copy()  # callers may mutate; keep the cached frame clean


def fetch_climate_data(lat: float, lon: float, start_date: date, end_date: date) -> dict:
    """Fetch NASA POWER data as a dictionary with lists of daily values.

    Raises HTTPException 503 if NASA API is unavailable.
    Returns: {"rainfall": [...], "temp_max": [...], "humidity": [...], "soil_moisture": [...]}
    """
    try:
        df = fetch_daily(lat, lon, start_date, end_date)
        return {
            "rainfall": df["PRECTOTCORR"].tolist(),
            "temp_max": df["T2M_MAX"].tolist(),
            "humidity": df["RH2M"].tolist(),
            "soil_moisture": df["GWETROOT"].tolist(),
        }
    except httpx.HTTPError as e:
        from fastapi import HTTPException
        raise HTTPException(503, "NASA data temporarily unavailable") from e


def get_last_30_days_data(lat: float, lon: float) -> dict:
    """Get 30-day averages for all climate parameters.

    Returns: {"avg_rainfall": float, "avg_temp_max": float, ...}
    """
    end = date.today()
    start = end - timedelta(days=30)
    logger.debug(f"Fetching 30-day data from {start} to {end}")

    data = fetch_climate_data(lat, lon, start, end)

    # Calculate averages, replacing NaN with 0
    return {
        "avg_rainfall": float(np.nanmean(data["rainfall"]) or 0),
        "avg_temp_max": float(np.nanmean(data["temp_max"]) or 0),
        "avg_humidity": float(np.nanmean(data["humidity"]) or 0),
        "avg_soil_moisture": float(np.nanmean(data["soil_moisture"]) or 0),
    }


def get_last_12_months_data(lat: float, lon: float) -> list:
    """Get monthly rainfall totals for the last 12 months.

    Returns: [{"month": "Jan 2025", "total_rainfall_mm": 45.2}, ...]
    """
    end = date.today()
    start = end - timedelta(days=365)
    logger.debug(f"Fetching 12-month data from {start} to {end}")

    df = fetch_daily(lat, lon, start, end)

    # Group by month and sum rainfall
    df["month"] = df.index.strftime("%b %Y")
    monthly = df.groupby("month")["PRECTOTCORR"].sum()

    return [
        {"month": month, "total_rainfall_mm": float(total)}
        for month, total in monthly.items()
    ]

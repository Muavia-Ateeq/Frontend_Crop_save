"""Feature builder shared by training and inference.

Inputs are daily NASA POWER series (see nasa.py). Keeping one implementation here
guarantees the model sees identical features at train and predict time.
"""
import pandas as pd

FEATURES = [
    "soil_moisture",      # NASA POWER GWETROOT, mean of last 7 days
    "rain_30d",           # NASA POWER PRECTOTCORR, sum of last 30 days (mm)
    "rain_prev_month",    # PRECTOTCORR sum of the 30 days before that (mm)
    "tmax_mean_30d",      # NASA POWER T2M_MAX, mean of last 30 days (deg C)
    "humidity_mean_30d",  # NASA POWER RH2M, mean of last 30 days (%)
    "month",              # month of as_of date, 1-12
]
HISTORY_DAYS = 60  # days of daily data needed before as_of


def build_features(df: pd.DataFrame, as_of: pd.Timestamp) -> dict:
    """Compute the model's input features from daily NASA data ending at as_of (inclusive).

    Raises ValueError if the 60-day window is incomplete.
    """
    as_of = pd.Timestamp(as_of)
    window = df.loc[as_of - pd.Timedelta(days=HISTORY_DAYS - 1): as_of]
    if len(window) < HISTORY_DAYS or window.isna().any().any():
        raise ValueError(f"incomplete NASA data window ending {as_of.date()}")
    last30, prev30 = window.iloc[-30:], window.iloc[:30]
    return {
        "soil_moisture": round(float(window["GWETROOT"].iloc[-7:].mean()), 4),
        "rain_30d": round(float(last30["PRECTOTCORR"].sum()), 2),
        "rain_prev_month": round(float(prev30["PRECTOTCORR"].sum()), 2),
        "tmax_mean_30d": round(float(last30["T2M_MAX"].mean()), 2),
        "humidity_mean_30d": round(float(last30["RH2M"].mean()), 2),
        "month": as_of.month,
    }

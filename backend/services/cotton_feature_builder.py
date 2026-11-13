"""Cotton feature engineering service.

Transforms 5 user inputs into 54 model features by:
1. Getting base row from reference data
2. Copying SNP markers based on genotype
3. One-hot encoding categoricals
4. Reordering to match model's feature list
"""

import logging
from typing import List

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def build_cotton_features(
    location: str,
    genotype: str,
    water_supply_pct: int,
    n_rate_kg_ha: int,
    soil_type: str,
    reference_df: pd.DataFrame,
    one_hot_encoder,
    cat_cols: List[str],
    num_cols: List[str],
    features: List[str]
) -> np.ndarray:
    """Build 54-feature array from 5 user inputs.

    Pipeline:
    1. Get base row from reference_df (location + year=2023)
    2. Override with user inputs
    3. Copy SNP columns from genotype's row
    4. Convert numerics to float
    5. One-hot encode categoricals
    6. Concatenate and reorder to match FEATURES list

    Args:
        location: Growing location
        genotype: Cotton variety
        water_supply_pct: Irrigation %
        n_rate_kg_ha: Nitrogen rate
        soil_type: Soil type
        reference_df: Base data from model bundle
        one_hot_encoder: Fitted encoder from bundle
        cat_cols: Categorical column names
        num_cols: Numerical column names
        features: Exact feature order

    Returns:
        np.ndarray: Feature array ready for model (shape: (1, 54))

    Raises:
        KeyError: If location/genotype not in reference data
    """
    logger.info(f"Building features for {genotype} at {location}")
    logger.debug(f"Inputs - Water: {water_supply_pct}%, N: {n_rate_kg_ha} kg/ha, Soil: {soil_type}")

    # Step 1-3: Build raw feature row
    raw_row = build_input_row(
        location, genotype, water_supply_pct, n_rate_kg_ha, soil_type, reference_df
    )
    logger.debug(f"Raw row shape: {len(raw_row)} features")

    # Step 4-6: Transform and reorder
    feature_array = transform_features(raw_row, one_hot_encoder, cat_cols, num_cols, features)
    logger.info(f"Built feature array shape: {feature_array.shape}")

    return feature_array


def build_input_row(
    location: str,
    genotype: str,
    water_supply_pct: int,
    n_rate_kg_ha: int,
    soil_type: str,
    reference_df: pd.DataFrame,
    fixed_year: int = 2023
) -> pd.Series:
    """Build base feature row.

    Steps:
    1. Find reference row for location+year
    2. Update with user inputs
    3. Add SNP data from genotype's row
    4. Drop target column

    Args:
        location: Growing location
        genotype: Cotton variety
        water_supply_pct: Irrigation %
        n_rate_kg_ha: Nitrogen rate
        soil_type: Soil type
        reference_df: Base data from model bundle
        fixed_year: Year to use for base row (default: 2023)

    Returns:
        pd.Series: Raw feature row before encoding

    Raises:
        KeyError: If location or genotype not found in reference data
    """
    # Step 1: Get base row for location + year
    location_mask = (reference_df['Location'] == location) & (reference_df['Year'] == fixed_year)
    if not location_mask.any():
        available = reference_df[reference_df['Year'] == fixed_year]['Location'].unique()
        raise KeyError(f"Location '{location}' not found for year {fixed_year}. Available: {available}")

    base_row = reference_df[location_mask].iloc[0].copy()
    logger.debug(f"Base row from {location}, {fixed_year}")

    # Step 2: Override with user inputs
    base_row['Genotype'] = genotype
    base_row['Water_Supply_%'] = water_supply_pct
    base_row['N_Rate_kg_ha'] = n_rate_kg_ha
    base_row['Soil_Type'] = soil_type
    logger.debug("Applied user inputs")

    # Step 3: Copy SNP genetic markers from genotype's reference row
    # SNP columns represent genetic variation - must match the genotype exactly
    genotype_mask = reference_df['Genotype'] == genotype
    if not genotype_mask.any():
        available = reference_df['Genotype'].unique()
        raise KeyError(f"Genotype '{genotype}' not found in reference data. Available: {available}")

    genotype_row = reference_df[genotype_mask].iloc[0]
    snp_cols = [col for col in reference_df.columns if col.startswith('SNP_')]

    for snp_col in snp_cols:
        base_row[snp_col] = genotype_row[snp_col]

    logger.debug(f"Copied {len(snp_cols)} SNP markers from {genotype}")

    # Step 4: Drop target if present
    if 'Yield_kg_ha' in base_row.index:
        base_row = base_row.drop('Yield_kg_ha')

    return base_row


def transform_features(
    raw_row: pd.Series,
    one_hot_encoder,
    cat_cols: List[str],
    num_cols: List[str],
    features: List[str]
) -> np.ndarray:
    """One-hot encode and reorder features.

    Steps:
    1. Convert numeric columns to float
    2. One-hot encode categorical columns
    3. Concatenate [numerics] + [encoded_cats]
    4. Reorder to match FEATURES list
    5. Cast to float64

    Args:
        raw_row: Raw feature row (pd.Series)
        one_hot_encoder: Fitted encoder from bundle
        cat_cols: Categorical column names
        num_cols: Numerical column names
        features: Exact feature order expected by model

    Returns:
        np.ndarray: Transformed feature array (shape: (1, len(features)))
    """
    # Step 1: Extract and convert numerics
    numeric_values = raw_row[num_cols].astype(float).values.reshape(1, -1)
    logger.debug(f"Numeric features: {len(num_cols)}")

    # Step 2: One-hot encode categoricals
    categorical_df = pd.DataFrame([raw_row[cat_cols].values], columns=cat_cols)
    encoded_cats = one_hot_encoder.transform(categorical_df)
    logger.debug(f"Encoded categorical features: {encoded_cats.shape[1]}")

    # Step 3: Concatenate numerics + encoded categoricals
    combined = np.hstack([numeric_values, encoded_cats])
    logger.debug(f"Combined features: {combined.shape[1]}")

    # Step 4: Build feature name mapping and reorder
    # Numeric features keep their names, categoricals get encoder's feature names
    numeric_feature_names = num_cols
    categorical_feature_names = one_hot_encoder.get_feature_names_out(cat_cols).tolist()
    all_feature_names = numeric_feature_names + categorical_feature_names

    # Create DataFrame with feature names for easy reordering
    feature_df = pd.DataFrame(combined, columns=all_feature_names)

    # Reorder to match model's expected feature order
    reordered = feature_df[features].values
    logger.debug(f"Reordered to match model features: {reordered.shape}")

    # Step 5: Ensure float64 dtype
    return reordered.astype(np.float64)

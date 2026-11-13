# Cotton Fiber Yield Model

## Missing Model Files

The cotton fiber yield prediction model files are **gitignored** and not included in the repository.

## Required Files

1. **`cotton_model.pkl`** - Main trained model bundle containing:
   - Ensemble model
   - SHAP explainer
   - One-hot encoder
   - Feature lists (categorical/numeric)
   - Reference dataframe
   - Allowed values for dropdowns

## Source Location

Original model file: `fiber_yield_app_model.pkl`

**Source directory**: `E:\Web Development\Hackaton Projects\Cropsave advanced\cropsave-merged\cotton-yield-prediction\backend\`

## How to Get the Model

1. Train the model using the cotton yield prediction notebook/script
2. Copy `fiber_yield_app_model.pkl` to this directory as `cotton_model.pkl`
3. Update `.env` with: `COTTON_MODEL_PATH=ml_models/cotton_model.pkl`

## Model Details

- **Type**: Ensemble model with SHAP explainer
- **Inputs**: Location, Genotype, Water Supply %, N Rate (kg/ha), Soil Type
- **Output**: Predicted fiber yield (kg/ha)
- **Format**: Pickle bundle (.pkl)

## Alternative

If you have the model file elsewhere, place it in this directory and update the `COTTON_MODEL_PATH` in your `.env` file accordingly.

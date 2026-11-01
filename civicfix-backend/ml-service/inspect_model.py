import pickle
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"

with open(MODEL_DIR / "feature_columns.pkl", "rb") as f:
    features = pickle.load(f)

with open(MODEL_DIR / "cost_model.pkl", "rb") as f:
    model = pickle.load(f)

print("\n========== FEATURE INFORMATION ==========")
print("Features:", features)
print("Number of features:", len(features))

print("\n========== MODEL INFORMATION ==========")
print("Model type:", type(model))

if isinstance(model, np.ndarray):

    print("Array shape:", model.shape)
    print("Array dtype:", model.dtype)
    print("Array contents:", model)

    print("\n========== ARRAY ELEMENT INFORMATION ==========")

    for index, item in enumerate(model.flat):
        print(f"\nElement {index}")
        print("Type:", type(item))
        print("Value:", item)

        if hasattr(item, "predict"):
            print("This element has a predict() method!")

elif hasattr(model, "predict"):

    print("Model has predict() method")
    print("Model parameters:", model.get_params())

else:
    print("Unexpected model structure")
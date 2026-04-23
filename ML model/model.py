import pickle
import numpy as np
from scipy.sparse import hstack
from datetime import datetime
import os


MODEL_PATH = "data/model.pkl"
VECTORIZER_PATH = "data/vectorizer.pkl"

# Load model and vectorizer with error handling
try:
    with open(VECTORIZER_PATH, "rb") as f:
        vectorizer = pickle.load(f)
except Exception as e:
    print(f"Warning: Could not load vectorizer: {e}")
    vectorizer = None

try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
except Exception as e:
    print(f"Warning: Could not load model: {e}")
    model = None


def get_hour(timestamp: str):
    try:
        dt = datetime.fromisoformat(timestamp)
        return dt.hour
    except:
        return 0  # fallback


def ml_predict(data: dict):
    """
    data = {
        "receiver": str,
        "amount": float,
        "timestamp": str
    }
    
    Returns predicted category or None if model/vectorizer not available
    """
    
    if not model or not vectorizer:
        print("Warning: Model or vectorizer not loaded, falling back to rule-based classification")
        return None

    try:
        receiver = data.get("receiver", "")
        amount = data.get("amount", 0)
        timestamp = data.get("timestamp", "")

        text_vec = vectorizer.transform([receiver.lower()])
        hour = get_hour(timestamp)
        numeric_features = np.array([[amount, hour]])
        X = hstack([text_vec, numeric_features])
        prediction = model.predict(X)[0]

        return prediction
    except Exception as e:
        print(f"Error in ml_predict: {e}")
        return None
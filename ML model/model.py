import pickle
import numpy as np
from scipy.sparse import hstack
from datetime import datetime


with open("data/vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

with open("data/model.pkl", "rb") as f:
    model = pickle.load(f)


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
    """

    receiver = data.get("receiver", "")
    amount = data.get("amount", 0)
    timestamp = data.get("timestamp", "")

    text_vec = vectorizer.transform([receiver.lower()])

    hour = get_hour(timestamp)

    numeric_features = np.array([[amount, hour]])

    X = hstack([text_vec, numeric_features])

    prediction = model.predict(X)[0]

    return prediction
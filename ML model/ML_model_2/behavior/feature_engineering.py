import numpy as np
from datetime import datetime

def parse_date(date_str):
    try:
        return datetime.fromisoformat(str(date_str).replace("Z", "+00:00"))
    except Exception:
        return None

def build_user_features(transactions):
    """
    Input:
        transactions = list of dicts like:
        {
            "category": "food",
            "amount": 126,
            "date": "2026-04-23T15:57:08.792+00:00"
        }

    Output:
        feature vector (list)
    """

    if not transactions:
        return None

    total_txns = len(transactions)

    food_count = 0
    travel_count = 0
    shopping_count = 0

    amounts = []
    night_count = 0
    weekend_count = 0

    timestamps = []

    for txn in transactions:
        category = txn.get("category", "").lower()
        amount = txn.get("amount", 0)
        date_str = txn.get("date")

        if not date_str:
            continue

        dt = parse_date(date_str)
        if dt is None:
            continue

        try:
            amount = float(amount)
        except (TypeError, ValueError):
            continue

        hour = dt.hour
        weekday = dt.weekday() 

        if category == "food":
            food_count += 1
        elif category == "travel":
            travel_count += 1
        elif category == "shopping":
            shopping_count += 1

        amounts.append(amount)

        if 18 <= hour <= 23:
            night_count += 1

        if weekday >= 5:
            weekend_count += 1

        timestamps.append(dt)

    valid_txns = len(amounts)
    if valid_txns == 0:
        return None

    food_ratio = food_count / valid_txns
    travel_ratio = travel_count / valid_txns
    shopping_ratio = shopping_count / valid_txns

    avg_amount = np.mean(amounts) if amounts else 0
    variance = np.var(amounts) if amounts else 0

    timestamps.sort()
    if len(timestamps) > 1:
        total_days = (timestamps[-1] - timestamps[0]).days + 1
    else:
        total_days = 1

    txn_freq = valid_txns / total_days if total_days > 0 else valid_txns

    night_ratio = night_count / valid_txns
    weekend_ratio = weekend_count / valid_txns


    feature_vector = [
        food_ratio,
        travel_ratio,
        shopping_ratio,
        avg_amount,
        txn_freq,
        night_ratio,
        weekend_ratio,
        variance
    ]

    return feature_vector
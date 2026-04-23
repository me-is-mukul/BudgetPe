from utils import (
    is_bank_message,
    is_debit,
    parse_transaction,
    extract_hour
)
from model import ml_predict
from datetime import datetime

def rule_based_category(receiver: str):
    if not receiver:
        return None

    receiver = receiver.lower()

    if any(x in receiver for x in ["swiggy", "zomato", "eats"]):
        return "food"

    if any(x in receiver for x in ["uber", "rapido", "ola"]):
        return "travel"

    if any(x in receiver for x in ["amazon", "flipkart", "myntra"]):
        return "shopping"

    return None

def ml_fallback(data: dict):
    """
    Temporary logic using amount + time.
    Replace this with model.predict() later.
    """
    amount = data.get("amount")
    timestamp = data.get("timestamp")

    hour = extract_hour(timestamp)

    if amount is None or hour is None:
        return "others"

    if amount <= 300 and 18 <= hour <= 23:
        return "food"

    if 50 <= amount <= 500:
        return "travel"

    if amount > 500:
        return "shopping"

    return "others"

def process_message(msg: str):
    if not is_bank_message(msg):
        return None

    if not is_debit(msg):
        return None

    data = parse_transaction(msg)

    amount = data.get("amount")
    receiver = data.get("receiver")

    if amount is None:
        return None

    category = rule_based_category(receiver)

    if not category:
        category = ml_predict(data)

    current_timestamp = datetime.now().isoformat()

    return {
        "category": category,
        "amount": amount,
        "date": current_timestamp
    }
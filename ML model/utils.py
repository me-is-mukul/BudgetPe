import re
from datetime import datetime

def is_bank_message(msg: str) -> bool:
    msg = msg.lower()

    bank_keywords = [
        "a/c", "account", "credited", "debited",
        "txn", "transaction", "upi", "imps",
        "neft", "rs", "inr", "balance"
    ]
    return any(keyword in msg for keyword in bank_keywords)

def is_debit(msg: str) -> bool:
    msg = msg.lower()

    debit_keywords = [
        "debited", "spent", "paid", "dr", "withdrawn",
        "sent", "transfer", "transferred"
    ]
    return any(keyword in msg for keyword in debit_keywords)


def extract_amount(msg: str):
    msg = msg.lower().replace(",", "")

    match = re.search(r'(rs\.?|inr|₹)\s?(\d+\.?\d*)', msg)
    if match:
        return float(match.group(2))

    return None

def extract_receiver(msg: str):
    msg = msg.lower()

    patterns = [
        r'(?:to|paid to|transferred to)\s+([^\n\r]+)'
    ]

    for pattern in patterns:
        match = re.search(pattern, msg)
        if match:
            receiver = match.group(1)
            receiver = re.split(r'\b(via|on|ref|from)\b', receiver)[0]

            return receiver.strip()

    return None

def extract_hour(timestamp: str) -> int:
    try:
        dt = datetime.fromisoformat(timestamp)
        return dt.hour
    except:
        return None

def parse_transaction(msg: str):
    return {
        "amount": extract_amount(msg),
        "receiver": extract_receiver(msg),
        "timestamp": datetime.now().isoformat()  # fallback (can replace later)
    }
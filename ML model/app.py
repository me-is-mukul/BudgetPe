from flask import Flask, request, jsonify
from pipeline import process_message
from collections import defaultdict
from ML_model_2.behavior.pipeline import behavior_pipeline

app = Flask(__name__)

@app.route("/", methods=["GET"])
def home():
    return {"message": "Model API running on port 5001"}

@app.route("/model/classify", methods=["POST"])
def classify():
    data = request.get_json()

    if not data or "msg" not in data:
        return jsonify({"error": "No msg provided"}), 400

    msg = data["msg"]

    result = process_message(msg)

    if result is None:
        return jsonify({"error": "Not a valid bank debit message"}), 400

    return jsonify(result)

@app.route("/model/clustering", methods=["POST"])
def clustering():
    data = request.get_json()

    if not data or "transactions" not in data:
        return jsonify({"error": "No transactions provided"}), 400

    transactions = data["transactions"]

    if not isinstance(transactions, list):
        return jsonify({"error": "Transactions should be a list"}), 400

    user_transactions = defaultdict(list)

    for txn in transactions:
        user_id = txn.get("user")

        if not user_id:
            continue

        user_transactions[user_id].append(txn)

    result = behavior_pipeline(user_transactions)

    return jsonify(result)

if __name__ == "__main__":
    app.run(port=5001, debug=True)
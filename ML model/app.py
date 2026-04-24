from flask import Flask, request, jsonify
from pipeline import process_message
from collections import defaultdict
from ML_model_2.behavior.pipeline import behavior_pipeline
from ML_model_2.behavior.feature_engineering import build_user_features
from ML_model_2.behavior.persona_mapping import map_cluster_to_persona

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

@app.route("/model/clustering/user-insight", methods=["POST"])
def clustering_user_insight():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No payload provided"}), 400

    transactions = data.get("transactions")
    user_id = data.get("user")

    if not isinstance(transactions, list):
        return jsonify({"error": "Transactions should be a list"}), 400

    if not user_id:
        return jsonify({"error": "User id is required"}), 400

    user_transactions = defaultdict(list)
    for txn in transactions:
        uid = txn.get("user")
        if uid:
            user_transactions[uid].append(txn)

    target_transactions = user_transactions.get(user_id, [])
    if not target_transactions:
        return jsonify({"error": "No transactions found for user"}), 404

    # Single-user fallback: derive persona directly from mapped rules.
    if len(user_transactions) < 2:
        features = build_user_features(target_transactions)
        if not features:
            return jsonify({"error": "Insufficient transaction data"}), 400

        persona = map_cluster_to_persona({0: features})[0]
        return jsonify({
            "user": user_id,
            "persona": persona,
            "mode": "rule-fallback",
            "clustered_users": 1
        })

    clustered = behavior_pipeline(user_transactions)
    if isinstance(clustered, dict) and clustered.get("error"):
        return jsonify(clustered), 400

    persona = clustered.get(user_id)
    if not persona:
        return jsonify({"error": "Persona not generated for user"}), 400

    return jsonify({
        "user": user_id,
        "persona": persona,
        "mode": "clustered",
        "clustered_users": len(user_transactions)
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
from flask import Flask, request, jsonify
from pipeline import process_message

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

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001, debug=True)
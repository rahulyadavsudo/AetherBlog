from flask import Flask, jsonify, request

from service import analyze_markdown

app = Flask(__name__)


@app.get("/health")
def health():
    return jsonify({"service": "python_analytics", "status": "healthy", "port": 8082})


@app.post("/analyze")
def analyze():
    payload = request.get_json(silent=True) or {}
    return jsonify(analyze_markdown(payload.get("text", "")))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8082)

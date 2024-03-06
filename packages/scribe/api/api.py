from flask import Flask, request, jsonify, make_response
from usfm_grammar import USFMParser, Filter
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route("/process_usfm", methods=["POST"])
def process_usfm():
    data = request.get_json()
    input_usfm = data["usfm"]

    my_parser = USFMParser(input_usfm)
    output = my_parser.to_usj()
    return jsonify(output)


@app.route("/process_usj", methods=["POST"])
def process_usj():
    data = request.get_json()
    input_usj = data["usj"]
    my_parser = USFMParser(from_usj=input_usj)
    output = my_parser.usfm
    return jsonify(output)


@app.route("/process_usfm", methods=["OPTIONS"])
def handle_preflight():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173/")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type")
    response.headers.add("Access-Control-Allow-Methods", "POST")
    return response


@app.route("/process_usj", methods=["OPTIONS"])
def handle_preflight2():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173/")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type")
    response.headers.add("Access-Control-Allow-Methods", "POST")
    return response


if __name__ == "__main__":
    app.run(debug=True)

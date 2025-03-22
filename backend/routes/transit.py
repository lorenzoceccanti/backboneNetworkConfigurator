from flask import Blueprint, Response, request, jsonify
from jsonschema import validate, ValidationError
from models.transit import Transit
from services.transit import TransitPolicy

transit_bp = Blueprint("transit", __name__)

@transit_bp.route("/transit", methods=["POST"])
def transit() -> Response:
  """
  This endpoint receives a JSON object with transit policy and
  sends it to the Arista device.
  :return: Response object with the status code.
  """
  print("[INFO] Received request to configure transit policy")
  try:
    if request.is_json:
      try:
        validate(request.get_json(), Transit.schema())
      except ValidationError as e:
        return jsonify({"error": "JSON schema format error"}), 400
      transit_policy: Transit = Transit(**request.get_json())
      transit = TransitPolicy(transit_policy)
      transit.generate_transit_policy()
      return jsonify({}), 204
    else:
      return jsonify({"error": "Request must be in JSON format"}), 400
  except ValueError as e:
    return jsonify({"JSON format error": str(e)}), 400
  except Exception as e:
    return jsonify({"error": str(e)}), 500

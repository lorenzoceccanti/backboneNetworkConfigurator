from flask import Blueprint, Response, request, jsonify
from jsonschema import validate, ValidationError
from services.redistribute_ospf import RedistributeOSPFNetwork
from models.redistribute_ospf import RedistributeOSPF

redistribute_ospf_bp = Blueprint("redistribute-ospf", __name__)

@redistribute_ospf_bp.route("/redistribute-ospf", methods=["POST"])
def redistribute_ospf() -> Response:
  """
  Redistribute OSPF routes to the BGP routers.
  :return: Response object with a message and status code.
  """
  try:
    if request.is_json:
      print("[INFO] Received request to redistribute OSPF routes")
      try:
        validate(request.get_json(), RedistributeOSPF.schema())
      except ValidationError as e:
        return jsonify({"error": "JSON schema format error"}), 400
      redistribute_ospf = RedistributeOSPF(**request.get_json())
      redistribute_ospf_network = RedistributeOSPFNetwork(redistribute_ospf)
      redistribute_ospf_network.redistribute_ospf()
      return jsonify({}), 204
    else:
      return jsonify({"error": "Request must be in JSON format"}), 400
  except ValueError as e:
    return jsonify({"JSON format error": str(e)}), 400
  except Exception as e:
    return jsonify({"error": str(e)}), 500

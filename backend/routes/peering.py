from flask import Blueprint, Response, request, jsonify
from services.peering import PeeringNetwork
from models.peering import Peering

peering_bp = Blueprint("peering", __name__)

@peering_bp.route("/peering", methods=["POST"])
def peering() -> Response:
  """
  This endpoint is used to establish a peering relationship with another network.
  :return: Response object with a message and status code.
  """
  try:
    if request.is_json:
      print("[INFO] Received request to a new peering relationship")
      peers = Peering(**request.get_json())
      peering_network = PeeringNetwork(peers)
      peering_network.generate_peering_policy()
      return jsonify({}), 204
    else:
      return jsonify({"error": "Request must be in JSON format"}), 400
  except ValueError as e:
    return jsonify({"JSON format error": str(e)}), 400
  except Exception as e:
    return jsonify({"error": str(e)}), 500

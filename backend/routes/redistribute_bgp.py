from flask import Blueprint, Response, request, jsonify
from services.redistribute_bgp import RedistributeBGPNetwork
from models.redistribute_bgp import RedistributeBGP

redistribute_bgp_bp = Blueprint("redistribute-bgp", __name__)

@redistribute_bgp_bp.route("/redistribute-bgp", methods=["POST"])
def redistribute_bgp() -> Response:
  """
  Redistribute BGP routes to the OSPF routers.
  :return: Response object with a message and status code.
  """
  try:
    if request.is_json:
      print("[INFO] Received request to redistribute BGP routes")
      redistribute_bgp = RedistributeBGP(**request.get_json())
      redistribute_bgp_network = RedistributeBGPNetwork(redistribute_bgp)
      redistribute_bgp_network.redistribute_bgp()
      return jsonify({}), 204
    else:
      return jsonify({"error": "Request must be in JSON format"}), 400
  except ValueError as e:
    return jsonify({"JSON format error": str(e)}), 400
  except Exception as e:
    return jsonify({"error": str(e)}), 500

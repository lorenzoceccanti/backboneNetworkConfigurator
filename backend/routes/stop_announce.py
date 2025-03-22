from flask import Blueprint, Response, request, jsonify
from jsonschema import validate, ValidationError
from services.stop_announce import StopAnnounceNetwork
from models.stop_announce import StopAnnounce

stop_announce_bp = Blueprint("stop-announce", __name__)

@stop_announce_bp.route("/stop-announce", methods=["POST"])
def stop_annouce() -> Response:
  """
  Stops announcing the network to the other peers.
  :return: Response object with a message and status code.
  """
  try:
    if request.is_json:
      print("[INFO] Received request to announce network")
      try:
        validate(request.get_json(), StopAnnounce.schema())
      except ValidationError as e:
        return jsonify({"error": "JSON schema format error"}), 400
      network_to_stop_announce = StopAnnounce(**request.get_json())
      stop_announce_network = StopAnnounceNetwork(network_to_stop_announce)
      stop_announce_network.stop_announce_network()
      return jsonify({}), 204
    else:
      return jsonify({"error": "Request must be in JSON format"}), 400
  except ValueError as e:
    return jsonify({"JSON format error": str(e)}), 400
  except Exception as e:
    return jsonify({"error": str(e)}), 500

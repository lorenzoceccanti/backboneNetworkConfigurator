from flask import Blueprint, Response, request, jsonify
from jsonschema import validate, ValidationError
from services.announce import AnnounceNetwork
from models.announce import Announce

announce_bp = Blueprint("announce", __name__)

@announce_bp.route("/announce", methods=["POST"])
def announce() -> Response:
  """
  Announces the network to the other peers.
  :return: Response object with a message and status code.
  """
  try:
    if request.is_json:
      print("[INFO] Received request to announce network")
      try:
        validate(request.get_json(), Announce.schema())
      except ValidationError as e:
        return jsonify({"error": "JSON schema format error"}), 400
      network_to_announce = Announce(**request.get_json())
      announce_network = AnnounceNetwork(network_to_announce)
      announce_network.announce_network()
      return jsonify({}), 204
    else:
      return jsonify({"error": "Request must be in JSON format"}), 400
  except ValueError as e:
    return jsonify({"JSON format error": str(e)}), 400
  except Exception as e:
    return jsonify({"error": str(e)}), 500

from flask import Blueprint, Response, request, jsonify
from services.local_preference import LocalPreferenceNetwork
from models.local_preference import LocalPreference

local_preference_bp = Blueprint("local-preference", __name__)

@local_preference_bp.route("/local-preference", methods=["POST"])
def local_preference() -> Response:
  """
  Set the local preference for the network.
  :return: Response object with a message and status code.
  """
  try:
    if request.is_json:
      print("[INFO] Received request to set local preference")
      local_preference = LocalPreference(**request.get_json())
      local_preference_network = LocalPreferenceNetwork(local_preference)
      local_preference_network._generate_debug_file()
      local_preference_network.generate_local_preference()
      return jsonify({}), 204
    else:
      return jsonify({"error": "Request must be in JSON format"}), 400
  except ValueError as e:
    return jsonify({"JSON format error": str(e)}), 400
  except Exception as e:
    return jsonify({"error": str(e)}), 500

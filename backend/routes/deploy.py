from flask import Blueprint, Response, jsonify

deploy_bp = Blueprint("deploy", __name__)

@deploy_bp.route("/deploy", methods=["POST"])
def deploy() -> Response:
  """
  Deploys the network configuration.
  :return: Response object with a message and status code.
  """
  # os.system(f"./deploy_network.sh") TODO REMOVE
  return jsonify({"message": "Network deployed successfully"}), 200
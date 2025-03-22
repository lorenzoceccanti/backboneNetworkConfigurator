from flask import Blueprint, Response, jsonify
from services.deploy import DeployNetwork

deploy_bp = Blueprint("deploy", __name__)

@deploy_bp.route("/deploy", methods=["POST"])
def deploy() -> Response:
  """
  Deploys the network configuration.
  :return: Response object with a message and status code.
  """
  # DeployNetwork.deploy_network()
  return jsonify({}), 204

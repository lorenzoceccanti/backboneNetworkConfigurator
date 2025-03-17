from flask import Blueprint, Response, request, jsonify
from models.network_topology import NetworkTopology
from services.configure import ConfigureNetwork
import json

configure_bp = Blueprint("configure", __name__)

@configure_bp.route("/configure", methods=["POST"])
def configure() -> Response:
  """
  This endpoint receives a JSON object with the network topology and
  generates the containerlab and Arista configurations.
  :return: Response object with the generated configurations and status code.
  """
  print("[INFO] Received request to configure network")
  try:
    print(f"[DEBUG]:{request.is_json}")
    if request.is_json:
      print("[DEBUG] qui ok")
      network_topology: NetworkTopology = NetworkTopology(**request.get_json())
      print("[DEBUG] qui ok2")
      configure_network = ConfigureNetwork(network_topology)
      configure_network.generate_containerlab_config()
      configure_network.generate_arista_configs()
      links: list[list[str, str]] = configure_network.get_links()
      
      # prepare the response
      routers = []
      for router in network_topology.routers:
        routers.append({
          "name": router.name,
          "asn": router.asn,
          "mngt_ipv4": router.mngt_ipv4,
          "interfaces": [{"name": interface.linux_name, "ip": interface.ip} for interface in router.interfaces],
        })
      response: dict = {
        "routers": routers,
        "links": links
      }
      #### REMOVE THIS LINES BEFORE DEPLOYING ####
      # for testing purposes we respond with the generated configurations
      with open("our_config.json", "r") as f:
        response = json.load(f)
      #### REMOVE THIS LINES BEFORE DEPLOYING ####
      return jsonify(response), 200
    else:
      return jsonify({"error": "Request must be in JSON format"}), 400
  except ValueError as e:
    return jsonify({"JSON format error": str(e)}), 400
  except Exception as e:
    return jsonify({"error": str(e)}), 500

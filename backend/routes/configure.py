from flask import Blueprint, Response, request, jsonify
from jsonschema import validate, ValidationError
from models.network_topology import NetworkTopology
from services.configure import ConfigureNetwork
from config import Config
import json
import ipaddress

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
    if request.is_json:
      try:
        validate(request.get_json(), NetworkTopology.schema())
      except ValidationError as e:
        return jsonify({"error": "JSON schema format error"}), 400
      network_topology: NetworkTopology = NetworkTopology(**request.get_json())
      # Checking env Router
      for router in network_topology.routers:
        if router.name == Config.INTERNET_ROUTER_NAME:
          return jsonify({"error": "Conflict with Internet Router user-defined name"}), 400
        if router.asn == Config.INTERNET_ASN:
          return jsonify({"error": "Conflict with Internet Router user-defined ASN"}), 400
      # Checking env Host
      for host in network_topology.hosts:
        if host.name == Config.INTERNET_HOST_NAME:
          return jsonify({"error": "Conflict with Internet Host user-defined name"}), 400
      configure_network = ConfigureNetwork(network_topology)
      configure_network.generate_containerlab_config()
      configure_network.generate_arista_configs()
      links: list[list[str, str]] = configure_network.get_links()
      
      # prepare the response
      routers = generate_response(network_topology, links)
      links = eliminate_internet_links(links)
      response: dict = {
        "routers": routers,
        "links": links,
      }
      #### REMOVE THIS LINES BEFORE DEPLOYING ####
      # for testing purposes we respond with the generated configurations
      #with open("our_config.json", "r") as f:
      #  response = json.load(f)
      #### REMOVE THIS LINES BEFORE DEPLOYING ####
      return jsonify(response), 200
    else:
      return jsonify({"error": "Request must be in JSON format"}), 400
  except ValueError as e:
    return jsonify({"JSON format error": str(e)}), 400
  except Exception as e:
    return jsonify({"error": str(e)}), 500

def generate_response(network_topology, links) -> dict:

    as_router_map = {}
    for router in network_topology.routers:
        as_router_map.setdefault(router.asn, []).append(router)
    routers = []

    for router in network_topology.routers:
        subnetworks = []
         

        for link in links:
            endpoint1, endpoint2 = link
            part1 = endpoint1.split(":")
            part2 = endpoint2.split(":")

            if router.name in [part1[0], part2[0]]:
                other_device = part1[0] if router.name == part2[0] else part2[0]
                router_iface = part1[1] if router.name == part1[0] else part2[1]

                AS_routers = as_router_map.get(router.asn, [])
                #Add subnetwork directly linked
                if (any(host.name == other_device for host in network_topology.hosts) or any(r.name == other_device for r in AS_routers)):
                  for interface in router.interfaces:
                    if interface.linux_name == router_iface:
                        subnetworks.append(interface.network)


        if router.name != Config.INTERNET_ROUTER_NAME:
            routers.append({
                "name": router.name,
                "asn": router.asn,
                "mngt_ipv4": router.mngt_ipv4,
                "redistribute_bgp": router.redistribute_bgp,
                "interfaces": [
                    {"name": interface.linux_name, "ip": interface.ip}
                    for interface in router.interfaces
                ],
                "neighbors": [
                    {"asn": neighbor.asn, "ip": neighbor.ip}
                    for neighbor in router.neighbors
                ],
                "subnetworks": subnetworks,
            })

    # if router has redistribute_bgp attivo, add all subnet of same AS
    for router in routers:
        if router["redistribute_bgp"]:
            for r in routers:
                if router["asn"] == r["asn"] and r != router:
                    for subnetwork in r["subnetworks"]:
                        if subnetwork not in router["subnetworks"]:
                            router["subnetworks"].append(subnetwork)

   
    return routers

def eliminate_internet_links(links) -> list[list[str, str]]:
  filtered_links = []
  for link in links: 
    
    endpoint1, endpoint2 = link
    part1 = endpoint1.split(":")[0]
    part2 = endpoint2.split(":")[0]
    internet = {Config.INTERNET_ROUTER_NAME, Config.INTERNET_HOST_NAME}

    if(part1 not in internet and part2 not in internet):
      filtered_links.append(link)
  return filtered_links

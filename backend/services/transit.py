from flask import jsonify
from models.transit import Transit, TransitTo
from utils.helpers import Helper
from config import Config
import yaml
import os

class TransitPolicy:
  _transit_policy : Transit
  _from_commands: list[str] = []
  _through_commands: list[str] = []
  _to_commands: list[list[str]] = []
  _timestamp: int = Helper.generate_timestamp()

  def __init__(self, _transit_policy: Transit):
    self._transit_policy = _transit_policy
    self._to_commands = [None] * len(self._transit_policy.to)
    self._generate_from_commands()
    self._generate_through_commands()
    self._generate_to_commands()

  def _get_route_map_sequence_number(self, route_map_to_search: str, mngt_ip: str) -> int:
    response = Helper.send_arista_commands(mngt_ip, [f"enable", f"configure", f"show running-config"])
    config_cmds = response[2].get("cmds", {})
    route_map = {key: value for key, value in config_cmds.items() if f"route-map {route_map_to_search} " in key}

    if not route_map:
      return 10 # if no route map is found the sequence number is 10

    seq_num = 0;
    for key in route_map:
      parts = key.split()
      if parts[2] == "permit":
        seq_num = int(parts[3]) + 10
    return seq_num
  
  def _get_neighbor_address(self, local_asn, remote_asn) -> str:
    """ Utility function in order to get the Ri neighbor address from the running-config of an ISP router
    Returns an empty string if the neighbor address is not found
    """
    arista_response = Helper.send_arista_commands(self._transit_policy.through.mngt_ip, [f"enable", f"configure", f"show running-config"])
    response_dict = arista_response[2].get("cmds", {}).get(f"router bgp {local_asn}").get("cmds")
    neigh_addr = ""
    for row in response_dict:
      if row.startswith("neighbor"):
        words = row.split()
        if len(words) == 4 and words[3] == str(remote_asn):
           neigh_addr = words[1]
    return neigh_addr
         
  def _generate_from_commands(self) -> None:
    from_asn = self._transit_policy.from_.asn
    through_asn = self._transit_policy.through.asn

    # get the sequence number for the route-map of the through as
    new_seq = self._get_route_map_sequence_number(f"RM-IN-{through_asn}", self._transit_policy.from_.mngt_ip)

    self._from_commands = [
      f"enable",
      f"configure",
      f"ip as-path access-list AS{through_asn}-IN-{self._timestamp} permit ^{through_asn}_ any",
      f"route-map RM-IN-{through_asn} permit {new_seq}",
      f"   match as-path AS{through_asn}-IN-{self._timestamp}",
      f"exit",
      f"route-map RM-IN-{through_asn} deny 99",
      f"router bgp {from_asn}",
      f"   bgp missing-policy direction in action deny",
      f"   bgp missing-policy direction out action deny",
    ]

    for through_router_ip in self._transit_policy.through.router_ip:
      if through_router_ip.asn == from_asn:
        self._from_commands.append(f"   neighbor {through_router_ip.my_router_ip} remote-as {through_asn}")
        self._from_commands.append(f"   neighbor {through_router_ip.my_router_ip} route-map RM-IN-{through_asn} in")
        self. _from_commands.append(f"exit")

  def _append_through_commands(self, to_asn, to_router_ip) -> None:
    from_asn = self._transit_policy.from_.asn
    through_asn = self._transit_policy.through.asn
    from_router_ip = self._transit_policy.from_.router_ip

    self._through_commands.append(f"   neighbor {from_router_ip} route-map RM-OUT-{from_asn} out")
    self._through_commands.append(f"exit")

    # get the sequence number for the route-map of the to as
    new_seq = self._get_route_map_sequence_number(f"RM-IN-{to_asn}", self._transit_policy.through.mngt_ip)

    self._through_commands.append(f"ip as-path access-list AS{to_asn}-OUT-{self._timestamp} permit ^{from_asn}$ any")
    self._through_commands.append(f"ip as-path access-list AS{to_asn}-IN-{self._timestamp} permit ^{to_asn}$ any")
    self._through_commands.append(f"ip as-path access-list AS{from_asn}-OUT-{self._timestamp} permit ^{to_asn}$ any")
    self._through_commands.append(f"route-map RM-IN-{to_asn} permit {new_seq}")
    self._through_commands.append(f"   match as-path AS{to_asn}-IN-{self._timestamp}")
    self._through_commands.append(f"exit")
    self._through_commands.append(f"route-map RM-IN-{to_asn} deny 99")

    # get the sequence number for the route-map of the from as
    new_seq = self._get_route_map_sequence_number(f"RM-OUT-{from_asn}", self._transit_policy.through.mngt_ip)

    self._through_commands.append(f"route-map RM-OUT-{from_asn} permit {new_seq}")
    self._through_commands.append(f"   match as-path AS{from_asn}-OUT-{self._timestamp}")
    self._through_commands.append(f"exit")
    self._through_commands.append(f"route-map RM-OUT-{from_asn} deny 99")
    self._through_commands.append(f"exit")

    for through_router_ip in self._transit_policy.through.router_ip:
      if through_router_ip.asn == to_asn:
          self._through_commands.append(f"router bgp {through_asn}")
          self._through_commands.append(f"   neighbor {to_router_ip} remote-as {to_asn}")
          self._through_commands.append(f"   neighbor {to_router_ip} route-map RM-IN-{to_asn} in")
          self._through_commands.append(f"   neighbor {to_router_ip} route-map RM-OUT-{to_asn} out")
          self._through_commands.append(f"exit")

          # get the sequence number for the route-map of the to as
          new_seq = self._get_route_map_sequence_number(f"RM-OUT-{to_asn}", self._transit_policy.through.mngt_ip)

          self._through_commands.append(f"route-map RM-OUT-{to_asn} permit {new_seq}")
          self._through_commands.append(f"   match as-path AS{to_asn}-OUT-{self._timestamp}")
          self._through_commands.append(f"exit")
          self._through_commands.append(f"route-map RM-OUT-{to_asn} deny 99")
    

  def _generate_through_commands(self) -> None:
    from_asn = self._transit_policy.from_.asn
    through_asn = self._transit_policy.through.asn
    from_router_ip = self._transit_policy.from_.router_ip

    # get the sequence number for the route-map of the from as
    new_seq = self._get_route_map_sequence_number(f"RM-IN-{from_asn}", self._transit_policy.through.mngt_ip)

    self._through_commands = [
      f"enable",
      f"configure",
      f"ip as-path access-list AS{from_asn}-IN-{self._timestamp} permit ^{from_asn}$ any",
      f"route-map RM-IN-{from_asn} permit {new_seq}",
      f"   match as-path AS{from_asn}-IN-{self._timestamp}",
      f"exit",
      f"route-map RM-IN-{from_asn} deny 99",
      f"router bgp {through_asn}",
      f"   bgp missing-policy direction in action deny",
      f"   bgp missing-policy direction out action deny",
      f"   neighbor {from_router_ip} remote-as {from_asn}",
      f"   neighbor {from_router_ip} route-map RM-IN-{from_asn} in",
    ]

    if isinstance(self._transit_policy.to, list):
      for to in self._transit_policy.to:
        if isinstance(to, TransitTo):
          self._append_through_commands(to.asn, to.router_ip)
    
    if isinstance(self._transit_policy.to, str):
       if self._transit_policy.to == "Internet":
          neighbor_ip = self._get_neighbor_address(through_asn, Config.INTERNET_ASN)
          if neighbor_ip != "":
            self._append_through_commands(Config.INTERNET_ASN, neighbor_ip)

  def _generate_to_commands(self) -> None:
    if isinstance(self._transit_policy.to, list):
      for index, to in enumerate(self._transit_policy.to):
        if isinstance(to, TransitTo): # in this way we exclude the "Internet" case
          through_asn = self._transit_policy.through.asn

          # get the sequence number for the route-map of the through as
          new_seq = self._get_route_map_sequence_number(f"RM-IN-{through_asn}", to.mngt_ip)
          
          self._to_commands[index] = [
            f"enable",
            f"configure",
            f"ip as-path access-list AS{through_asn}-IN-{self._timestamp} permit ^{through_asn}_ any",
            f"route-map RM-IN-{through_asn} permit {new_seq}",
            f"   match as-path AS{through_asn}-IN-{self._timestamp}",
            f"exit",
            f"route-map RM-IN-{through_asn} deny 99",
            f"router bgp {to.asn}",
            f"   bgp missing-policy direction in action deny",
            f"   bgp missing-policy direction out action deny",
          ]

          for through_router_ip in self._transit_policy.through.router_ip:
            if through_router_ip.asn == to.asn:
              self._to_commands[index].append(f"   neighbor {through_router_ip.my_router_ip} remote-as {through_asn}")
              self._to_commands[index].append(f"   neighbor {through_router_ip.my_router_ip} route-map RM-IN-{through_asn} in")
              self._to_commands[index].append(f"exit")

    if isinstance(self._transit_policy.to, str):
       if self._transit_policy.to == "Internet":
          through_asn = self._transit_policy.through.asn
          # get the sequence number for the route-map of the through as
          new_seq = self._get_route_map_sequence_number(f"RM-IN-{through_asn}", Config.INTERNET_ROUTER_MNGT_IP)
          self._to_commands[0] = [
            f"enable",
            f"configure",
            f"ip as-path access-list AS{through_asn}-IN-{self._timestamp} permit ^{through_asn}_ any",
            f"route-map RM-IN-{through_asn} permit {new_seq}",
            f"   match as-path AS{through_asn}-IN-{self._timestamp}",
            f"exit",
            f"route-map RM-IN-{through_asn} deny 99",
            f"router bgp {Config.INTERNET_ASN}",
            f"   bgp missing-policy direction in action deny",
            f"   bgp missing-policy direction out action deny",
          ]

          for through_router_ip in self._transit_policy.through.router_ip:
            if through_router_ip.asn == Config.INTERNET_ASN:
              self._to_commands[0].append(f"   neighbor {through_router_ip.my_router_ip} remote-as {through_asn}")
              self._to_commands[0].append(f"   neighbor {through_router_ip.my_router_ip} route-map RM-IN-{through_asn} in")
              self._to_commands[0].append(f"exit")
  
  def _generate_debug_file(self, file_name: str, commands: list[str]) -> None:
    with open(f"config/{file_name}_TRANSIT.cfg", "w") as f:
      f.write("\n".join(commands))

  def parse_topology(self):
    """
    Read YAML file and create the  map of connection between nodes.
    """
    with open(f"config/topology.clab.yml", "r") as file:
        topology = yaml.safe_load(file)

    # Extract nodes and links from topology
    nodes = topology.get("topology", {}).get("nodes", {})
    links = topology.get("topology", {}).get("links", [])

    # Create a map of connections
    node_connections = {}

    for link in links:
        endpoint1, endpoint2 = link["endpoints"]

        # Extract device's name (es. "r1" from "r1:eth1")
        node1 = endpoint1.split(":")[0]
        node2 = endpoint2.split(":")[0]

        # Add the connection between the nodes into the map
        node_connections.setdefault(node1, []).append(node2)
        node_connections.setdefault(node2, []).append(node1)

    return node_connections
    
  def find_alternative_paths(self, node_connections, current_node, target_node, visited):
    """
    Find all paths from  current_node to target_node and avoid nodes already  visited.
    """
    if current_node == target_node:
        return [[target_node]]

    visited.add(current_node)
    paths = []

    for neighbor in node_connections.get(current_node, []):
        if neighbor not in visited:
            sub_paths = self.find_alternative_paths(node_connections, neighbor, target_node, visited.copy())
            for sub_path in sub_paths:
                paths.append([current_node] + sub_path)

    return paths

  def is_transit_router(self, router):
    """
    Verifica se un router è un router di transito controllando la sua configurazione BGP.
    Un router è considerato di transito se ha configurazioni BGP che accettano e propagano route tra AS diversi.
    """
    config_path = f"config/{router}_BGP.cfg"

    if not os.path.exists(config_path):
        print(f"Configuration for {router} not found!")
        return False

    with open(config_path, "r") as f:
        config = f.read()

    # Check if there are route-map that allow transit
    transit = (
        "route-map RM-IN-" in config and
        "route-map RM-OUT-" in config and
        "neighbor" in config and
        "remote-as" in config
    )

    return transit

  def check_alternative_paths(self, from_router, to_router, through_router):
    """
    Check if there are alternative paths from from_router to to_router without going through through_router.
    """
    try:
        node_connections = self.parse_topology()
        alternative_paths = self.find_alternative_paths(node_connections, from_router, to_router, set([through_router]))
        if alternative_paths:
            print(f"Percorsi alternativi trovati da {from_router} a {to_router}:")
            for path in alternative_paths:
                print(" -> ".join(path))
        valid_paths = []
        for path in alternative_paths:
            intermediate_routers = path[1:-1]  # Exclude `from_router` and `to_router`
            transit_routers = [r for r in intermediate_routers if self.is_transit_router(r)]

            if set(intermediate_routers) == set(transit_routers):
                valid_paths.append(path)

        if valid_paths:
            return {
                "message": "Alternative transit paths found",
                "valid_transit_paths": valid_paths
            }
        else:
            return {"message": "No valid transit paths"}
    except Exception as e:
        print(e)
        return jsonify({"error": "Check error"}), 400
      
  def generate_transit_policy(self) -> None:
    print("[INFO] Generating transit policy")
    
    Helper.send_arista_commands(self._transit_policy.from_.mngt_ip, self._from_commands)

    if isinstance(self._transit_policy.to, list):
      for index, to in enumerate(self._transit_policy.to):
        if isinstance(to, TransitTo):
          Helper.send_arista_commands(to.mngt_ip, self._to_commands[index])
    if isinstance(self._transit_policy.to, str):
       if self._transit_policy.to == "Internet":
          Helper.send_arista_commands(Config.INTERNET_ROUTER_MNGT_IP, self._to_commands[0])
    Helper.send_arista_commands(self._transit_policy.through.mngt_ip, self._through_commands)
    
    # generate debug files
    self._generate_debug_file(self._transit_policy.from_.router, self._from_commands)
    if isinstance(self._transit_policy.to, list):
      for index, to in enumerate(self._transit_policy.to):
        if isinstance(to, TransitTo):
          self._generate_debug_file(to.router, self._to_commands[index])
    if isinstance(self._transit_policy.to, str):
       if self._transit_policy.to == "Internet":
          self._generate_debug_file(Config.INTERNET_ROUTER_NAME, self._to_commands[0])
    self._generate_debug_file(self._transit_policy.through.router, self._through_commands)
    if isinstance(self._transit_policy.to, list):
      for to in self._transit_policy.to:
        self.check_alternative_paths(self._transit_policy.from_.router, to.router, self._transit_policy.through.router)
    print("[INFO] Transit policy generated successfully")

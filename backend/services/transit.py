from flask import jsonify
from models.transit import Transit, TransitTo
from utils.helpers import Helper
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

    for to in self._transit_policy.to:
      if isinstance(to, TransitTo):
        self._through_commands.append(f"   neighbor {from_router_ip} route-map RM-OUT-{from_asn} out")
        self._through_commands.append(f"exit")

        # get the sequence number for the route-map of the to as
        new_seq = self._get_route_map_sequence_number(f"RM-IN-{to.asn}", self._transit_policy.through.mngt_ip)

        self._through_commands.append(f"ip as-path access-list AS{to.asn}-OUT-{self._timestamp} permit ^{from_asn}$ any")
        self._through_commands.append(f"ip as-path access-list AS{to.asn}-IN-{self._timestamp} permit ^{to.asn}$ any")
        self._through_commands.append(f"ip as-path access-list AS{from_asn}-OUT-{self._timestamp} permit ^{to.asn}$ any")
        self._through_commands.append(f"route-map RM-IN-{to.asn} permit {new_seq}")
        self._through_commands.append(f"   match as-path AS{to.asn}-IN-{self._timestamp}")
        self._through_commands.append(f"exit")
        self._through_commands.append(f"route-map RM-IN-{to.asn} deny 99")

        # get the sequence number for the route-map of the from as
        new_seq = self._get_route_map_sequence_number(f"RM-OUT-{from_asn}", self._transit_policy.through.mngt_ip)

        self._through_commands.append(f"route-map RM-OUT-{from_asn} permit {new_seq}")
        self._through_commands.append(f"   match as-path AS{from_asn}-OUT-{self._timestamp}")
        self._through_commands.append(f"exit")
        self._through_commands.append(f"route-map RM-OUT-{from_asn} deny 99")
        self._through_commands.append(f"exit")

        for through_router_ip in self._transit_policy.through.router_ip:
          if through_router_ip.asn == to.asn:
            self._through_commands.append(f"router bgp {through_asn}")
            self._through_commands.append(f"   neighbor {to.router_ip} remote-as {to.asn}")
            self._through_commands.append(f"   neighbor {to.router_ip} route-map RM-IN-{to.asn} in")
            self._through_commands.append(f"   neighbor {to.router_ip} route-map RM-OUT-{to.asn} out")
            self._through_commands.append(f"exit")

            # get the sequence number for the route-map of the to as
            new_seq = self._get_route_map_sequence_number(f"RM-OUT-{to.asn}", self._transit_policy.through.mngt_ip)

            self._through_commands.append(f"route-map RM-OUT-{to.asn} permit {new_seq}")
            self._through_commands.append(f"   match as-path AS{to.asn}-OUT-{self._timestamp}")
            self._through_commands.append(f"exit")
            self._through_commands.append(f"route-map RM-OUT-{to.asn} deny 99")

  def _generate_to_commands(self) -> None:
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
  
  def _generate_debug_file(self, file_name: str, commands: list[str]) -> None:
    with open(f"config/{file_name}_TRANSIT.cfg", "w") as f:
      f.write("\n".join(commands))

  def parse_topology(self):
    
    #links = self._transit_policy.links

    # Create a map of connections
    node_connections = {}

    #for link in links:
        #endpoint1, endpoint2 = link["endpoints"]

        # Extract device's name (es. "r1" from "r1:eth1")
        #node1 = endpoint1.split(":")[0]
        #node2 = endpoint2.split(":")[0]

        # Add the connection between the nodes into the map
        #node_connections.setdefault(node1, []).append(node2)
        #node_connections.setdefault(node2, []).append(node1)
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
    router_mngt = router.mngt_ip

    running_conf = Helper.send_arista_commands(router_mngt, [f"enable", f"show running_config"])
    print(f"[DEBUG]: {running_conf}")

    # Check if there are route-map that allow transit
    transit = (
        "route-map RM-IN-" in running_conf[2] and
        "route-map RM-OUT-" in running_conf[2] and
        "neighbor" in running_conf[2] and
        "remote-as" in running_config[2]
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
            return jsonify({"message": "Alternative transit paths found"}), 202
                
        else:
            return jsonify({"message": "No valid transit paths"}), 500
    except Exception as e:
        print(e)
        return jsonify({"error": "Check error"}), 400
      
  def generate_transit_policy(self) -> None:
    print("[INFO] Generating transit policy")
    
    Helper.send_arista_commands(self._transit_policy.from_.mngt_ip, self._from_commands)

    for index, to in enumerate(self._transit_policy.to):
      if isinstance(to, TransitTo):
        Helper.send_arista_commands(to.mngt_ip, self._to_commands[index])
    Helper.send_arista_commands(self._transit_policy.through.mngt_ip, self._through_commands)
    
    # generate debug files
    self._generate_debug_file(self._transit_policy.from_.router, self._from_commands)
    for index, to in enumerate(self._transit_policy.to):
      if isinstance(to, TransitTo):
        self._generate_debug_file(to.router, self._to_commands[index])
    self._generate_debug_file(self._transit_policy.through.router, self._through_commands)
    for to in self._transit_policy.to:
      self.check_alternative_paths(self._transit_policy.from_.router, to.router, self._transit_policy.through.router)
    print("[INFO] Transit policy generated successfully")

from models.announce import Announce, AnnounceTo
from config import Config
from utils.helpers import Helper

class AnnounceNetwork:
  _network_to_announce: Announce
  _commands: list[str] = []

  def __init__(self, network_to_announce: Announce):
    self._network_to_announce = network_to_announce

  def _generate_debug_file(self) -> None:
    """
    Generates the debug file
    :return: None
    """
    with open(f"config/{self._network_to_announce.router}_ANNOUNCE.cfg", "w") as f:
      f.write("\n".join(self._commands))

  def _get_neighbor_address(self, local_asn, remote_asn) -> str:
    """ Utility function in order to get the Ri neighbor address from the running-config of an ISP router
    Returns an empty string if the neighbor address is not found
    """
    arista_response = Helper.send_arista_commands(self._network_to_announce.mngt_ip, [f"enable", f"configure", f"show running-config"])
    print(arista_response)
    response_dict = arista_response[2].get("cmds", {}).get(f"router bgp {local_asn}").get("cmds")
    neigh_addr = ""
    internet_rule_found = False
    for row in response_dict:
      if row.startswith("neighbor"):
        words = row.split()
        if len(words) == 4 and words[3] == str(remote_asn):
           internet_rule_found = True
           neigh_addr = words[1]
    if not internet_rule_found:
      raise ValueError("No Internet neighbor")

    return neigh_addr

  def _get_prefix_list_sequence_number(self) -> int:
    """
    Send the command to the router to get the sequence number of the prefix-list
    :return: The sequence number
    """
    # we neet to retreve from the router the sequence number of the prefix-list
    response = Helper.send_arista_commands(self._network_to_announce.mngt_ip, [f"enable", f"configure", f"show running-config"])
    # the response is like this:
    # ip prefix-list R2-NETWORKS seq 10 permit 192.168.102.0/24
    # ip prefix-list R2-NETWORKS seq 20 permit 192.168.103.0/24
    # so we need to parse the response to get the last sequence number, in order to add the new network
    config_cmds = response[2].get("cmds", {})
    networks_prefixes = {key: value for key, value in config_cmds.items() if key.startswith(f"ip prefix-list {self._network_to_announce.router}-NETWORKS")}
    if not networks_prefixes:
      return -1 # stands for no prefix-list found

    existing_networks = set()
    max_seq = 0

    for key in networks_prefixes:
      parts = key.split()
      # check for the correct format
      if len(parts) > 6:
        seq_num = int(parts[4])
        network = parts[6]
        existing_networks.add(network)
        max_seq = max(max_seq, seq_num)

    # check if the network is already in the prefix-lists
    if self._network_to_announce.network_to_announce in existing_networks:
      print(f"The network {self._network_to_announce.network_to_announce} has been already announced")
      return -2 # stands for network already announced

    new_seq = max_seq + 10
    return new_seq


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


  def announce_network(self) -> None:
    """
    Generates the commands to announce the network
    :return: None
    """
    self._commands = [
      f"enable",
      f"configure",
    ]

    for to in self._network_to_announce.to:
      
      if isistance(to, str):
        if (to == "Internet"):
          neighbor_ip = self._get_neighbor_address(self._network_to_announce.asn, Config.INTERNET_ASN)

      # get the sequence number for the route-map of the through as
      if isinstance(to, AnnounceTo):
        new_seq = self._get_route_map_sequence_number(f"RM-OUT-{to.asn}", self._network_to_announce.mngt_ip)

        self._commands.append(f"route-map RM-OUT-{to.asn} permit {new_seq}")
        self._commands.append(f"   match ip address prefix-list {self._network_to_announce.router}-NETWORKS")
        self._commands.append(f"   exit")
        self._commands.append(f"route-map RM-OUT-{to.asn} deny 99")

    # get the sequence number of the prefix-list
    seq = self._get_prefix_list_sequence_number()
    if seq == -1:
      seq = 10
    elif seq == -2:
      print(f"[INFO] The network {self._network_to_announce.network_to_announce} has been already announced")
      return

    print(f"[INFO] Added new network {self._network_to_announce.network_to_announce} with seq {seq}")
    Helper.send_arista_commands(self._network_to_announce.mngt_ip, [
      f"enable",
      f"configure",
      f"ip prefix-list {self._network_to_announce.router}-NETWORKS seq {seq} permit {self._network_to_announce.network_to_announce}"
    ])

    self._commands.append(f"router bgp {self._network_to_announce.asn}")
    for to in self._network_to_announce.to:
      if isinstance(to, AnnounceTo):
        self._commands.append(f"   neighbor {to.his_router_ip} route-map RM-OUT-{to.asn} out")
      if isinstance(to, str):
        if to == "Internet":
          self._commands.append(f"   neighbor {neighbor_ip} route-map RM-OUT-{Config.INTERNET_ASN} out")

    self._commands.append(f"   network {self._network_to_announce.network_to_announce}")
    self._commands.append("exit")

    Helper.send_arista_commands(self._network_to_announce.mngt_ip, self._commands)

    # debug file
    self._generate_debug_file()
    print("[INFO] Network announced successfully")

from models.announce import Announce
from utils.helpers import Helper

class AnnounceNetwork:
  _network_to_annouce: Announce
  _commands: list[str] = []

  def __init__(self, network_to_announce: Announce):
    self._network_to_annouce = network_to_announce

  def _generate_debug_file(self) -> None:
    """
    Generates the debug file
    :return: None
    """
    with open(f"config/{self._network_to_annouce.router}_ANNOUNCE.cfg", "w") as f:
      f.write("\n".join(self._commands))

  def _get_prefix_list_sequence_number(self) -> int:
    """
    Send the command to the router to get the sequence number of the prefix-list
    :return: The sequence number
    """
    # we neet to retreve from the router the sequence number of the prefix-list
    response = Helper.send_arista_commands(self._network_to_annouce.mngt_ip, [f"enable", f"configure", f"show running-config"])
    # the response is like this:
    # ip prefix-list R2-NETWORKS seq 10 permit 192.168.102.0/24
    # ip prefix-list R2-NETWORKS seq 20 permit 192.168.103.0/24
    # so we need to parse the response to get the last sequence number, in order to add the new network
    config_cmds = response[2].get("cmds", {})
    networks_prefixes = {key: value for key, value in config_cmds.items() if key.startswith(f"ip prefix-list {self._network_to_annouce.router}-NETWORKS")}
    if not networks_prefixes:
      return -1 # stands for no prefix-list found
    else:
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
      if self._network_to_annouce.network_to_annouce in existing_networks:
        print(f"The network {self._network_to_annouce.network_to_annouce} has been already announced")
        return -2 # stands for network already announced
      else:
        new_seq = max_seq + 10
        return new_seq

  def announce_network(self) -> None:
    """
    Generates the commands to announce the network
    :return: None
    """
    self._commands = [
      f"enable",
      f"configure",
      f"route-map RM-OUT permit 10",
      f"   match ip address prefix-list {self._network_to_annouce.router}-NETWORKS",
      f"   exit",
      f"route-map RM-OUT deny 99",
      f"router bgp {self._network_to_annouce.asn}",
      f"   bgp missing-policy direction in action deny",
      f"   bgp missing-policy direction out action deny",
    ]

    # get the sequence number of the prefix-list
    seq = self._get_prefix_list_sequence_number()
    if seq == -1:
      seq = 10
    elif seq == -2:
      print(f"[INFO] The network {self._network_to_annouce.network_to_annouce} has been already announced")
      return

    print(f"[INFO] Added new network {self._network_to_annouce.network_to_annouce} with seq {seq}")
    Helper.send_arista_commands(self._network_to_annouce.mngt_ip, [
      f"enable",
      f"configure",
      f"ip prefix-list {self._network_to_annouce.router}-NETWORKS seq {seq} permit {self._network_to_annouce.network_to_annouce}"
    ])
    for to in self._network_to_annouce.to:
      self._commands.append(f"   neighbor {to.his_router_ip} route-map RM-OUT out")
    
    self._commands.append(f"network {self._network_to_annouce.network_to_annouce}")
    Helper.send_arista_commands(self._network_to_annouce.mngt_ip, self._commands)

    # debug file
    self._generate_debug_file()

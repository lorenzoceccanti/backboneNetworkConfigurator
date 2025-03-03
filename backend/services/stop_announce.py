from models.stop_announce import StopAnnounce
from utils.helpers import Helper

class StopAnnounceNetwork:
  _network_to_stop_announce: StopAnnounce
  _commands: list[str] = []

  def __init__(self, network_to_stop_announce: StopAnnounce):
    self._network_to_stop_announce = network_to_stop_announce


  def _generate_debug_file(self) -> None:
    """
    Generates the debug file
    :return: None
    """
    with open(f"config/{self._network_to_stop_announce.router}_STOP_ANNOUNCE.cfg", "w") as f:
      f.write("\n".join(self._commands))


  def _get_prefix_list_sequence_number(self) -> int:
    # we need the sequence number of the prefix-list to remove the network
    response = Helper.send_arista_commands(self._network_to_stop_announce.mngt_ip, [f"enable", f"configure", f"show running-config"])

    config_cmds = response[2].get("cmds", {})
    networks_prefixes = {key: value for key, value in config_cmds.items() if key.startswith(f"ip prefix-list {self._network_to_stop_announce.router}-NETWORKS")}
    if not networks_prefixes:
      print(f"[INFO] No prefix-list for {self._network_to_stop_announce.router} networks found")
      return -1 # stands for no prefix-list found
    else:
      for key in networks_prefixes:
        parts = key.split()
        # check for the correct format
        if len(parts) > 6:
          seq_num = int(parts[4])
          network = parts[6]
          if self._network_to_stop_announce.network_to_stop_announce == network:
            return seq_num
        else:
          print("[INFO] Network to stop announce not found")
          return -2 # stands for network not found


  def stop_announce_network(self) -> None:
    print(f"[INFO] Stopping announcement of network {self._network_to_stop_announce.network_to_stop_announce} to the other peers")

    self._commands = [
      f"enable",
      f"configure",
      f"router bgp {self._network_to_stop_announce.asn}",
      f"  no network {self._network_to_stop_announce.network_to_stop_announce}"
    ]

    seq_num = self._get_prefix_list_sequence_number()
    if seq_num > 0:
      Helper.send_arista_commands(self._network_to_stop_announce.mngt_ip, [f"enable", f"configure", f"no ip prefix-list {self._network_to_stop_announce.router}-NETWORKS seq {seq_num} permit {self._network_to_stop_announce.network_to_stop_announce}"])

    Helper.send_arista_commands(self._network_to_stop_announce.mngt_ip, self._commands)
    self._generate_debug_file()
    print(f"[INFO] Network {self._network_to_stop_announce.network_to_stop_announce} has been stopped to be announced")

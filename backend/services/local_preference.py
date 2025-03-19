from models.local_preference import LocalPreference
from utils.helpers import Helper

class LocalPreferenceNetwork:
  _local_preference: LocalPreference
  _commands: list[str] = []
  _conflicts: bool = False

  def __init__(self, local_preference):
    self._local_preference = local_preference
    self._generate_commands()
  
  def _generate_commands(self) -> None:
    """
    Generates the command to set the local preference.
    :return: None
    """
    self._commands = [
      "enable",
      "configure",
      f"route-map RM-IN-{self.local_preference.neighbor_asn} permit 10",
      f"   set local-preference {self._local_preference.local_preference}",
      "exit",
      f"router bgp {self._local_preference.asn}",
      f"   neighbor {self._local_preference.neighbor_ip} route-map RM-IN{self.local_preference.neighbor_asn} in",
      "exit"
    ]


  @staticmethod
  def parsing_bgp_neighbor_rule(arista_response, local_asn) -> list[str]:
    """Functions that retrieves the list of bgp neighbor's addresses
    we find in the BGP section"""
    response_dict = arista_response[2].get("cmds", {}).get(f"router bgp {local_asn}").get("cmds")
    neighbor_ip = []
    route_map = []
    for row in response_dict:
      if row.startswith("neighbor"):
        words = row.split()
        if len(words) == 5 and words[4] == "in":
          neighbor_ip.append(words[1])
    return neighbor_ip

  def _check_conflicting_bgp_neighbor_rule(self) -> None:
    """
    Checks for the existence of a conflicting neighbor entry in
    the bgp section
    """
    # Resetting
    self._conflicts = False
  
    asn = self._local_preference.asn
    neighbor_ip = self._local_preference.neighbor_ip
    runn_conf = Helper.send_arista_commands(self._local_preference.mngt_ip, [f"enable", f"configure", f"show running-config"])
    
    neigh_ip = LocalPreferenceNetwork.parsing_bgp_neighbor_rule(runn_conf, asn)
    
    if neighbor_ip in neigh_ip:
      # Already exists an entry with the son peer in the father config
      print(f"[WARN]: The router has already a route-map associated")
      self._conflicts = True
      self._commands = [
      "enable",
      "configure",
      f"route-map RM-IN-{self.local_preference.neighbor_asn} permit 10",
      f"   set local-preference {self._local_preference.local_preference}",
      "exit"]


  def _generate_debug_file(self) -> None:
    """
    Generates the debug file.
    :return: None
    """ 
    with open(f"config/{self._local_preference.asn}_LOCAL_PREFERENCE.cfg", "w") as f:
      f.write("\n".join(self._commands))

  

  def generate_local_preference(self) -> None:
    """
    Generates the local preference.
    :return: None
    """
    print("[INFO] Generating local preference")
    if(self._conflicts == False):
      Helper.send_arista_commands(self._local_preference.mngt_ip, self._commands)
      self._generate_debug_file()
      
    print("[INFO] Local preference generated successfully")
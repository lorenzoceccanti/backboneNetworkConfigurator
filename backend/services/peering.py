from models.peering import Peering
from utils.helpers import Helper

class PeeringNetwork:
  _peers: Peering
  _father_commands: list[str] = []
  _son_commands: list[str] = []
  _conflicts: dict = {
      "father": False,
      "son": False
  }
  _authorization: dict = {
      "father": False,
      "son": False
  }

  def __init__(self, peers: Peering):
    self._peers = peers
    self._check_conflicting_rule()
    self._generate_father_commands()
    self._generate_son_commands()


  def _generate_father_commands(self) -> None:
    """
    Generate father commands.
    :return: None
    """
    if self._authorization["father"] == False:
      return
    father_asn = self._peers.asn
    son_router_ip = self._peers.peer.router_ip
    son_asn = self._peers.peer.asn
    self._father_commands = [
      f"enable",
      f"configure",
      f"ip as-path access-list AS{son_asn}-IN permit ^{son_asn}$ any",
      f"route-map RM-IN-{son_asn} permit 10",
      f"  match as-path AS{son_asn}-IN",
      f"exit",
      f"route-map RM-IN-{son_asn} deny 99",
      f"router bgp {father_asn}",
      f"  neighbor {son_router_ip} route-map RM-IN-{son_asn} in",
      f"exit"
    ]


  def _generate_son_commands(self) -> None:
    """
    Generate son commands.
    :return: None
    """
    if self._authorization["son"] == False:
      return
    father_asn = self._peers.asn
    father_router_ip = self._peers.router_ip
    son_asn = self._peers.peer.asn
    self._son_commands = [
      f"enable",
      f"configure",
      f"ip as-path access-list AS{father_asn}-IN permit ^{father_asn}$ any",
      f"route-map RM-IN-{father_asn} permit 10",
      f"  match as-path AS{father_asn}-IN",
      f"exit",
      f"route-map RM-IN-{father_asn} deny 99",
      f"router bgp {son_asn}",
      f"  neighbor {father_router_ip} route-map RM-IN-{father_asn} in",
      f"exit"
    ]


  def _generate_debug_file(self) -> None:
    """
    Generates the debug file
    :return: None
    """
    with open(f"config/{self._peers.asn}_PEERING.cfg", "w") as f:
      f.write("\n".join(self._father_commands))
    with open(f"config/{self._peers.peer.asn}_PEERING.cfg", "w") as f:
      f.write("\n".join(self._son_commands))

  @staticmethod
  def parsing_bgp_neighbor_rule(arista_response, local_asn) -> list[str]:
    """Functions that retrieves the list of bgp neighbor's addresses
    we find in the BGP section"""
    response_dict = arista_response[2].get("cmds", {}).get(f"router bgp {local_asn}").get("cmds")
    neigh_addr = []
    for row in response_dict:
      if row.startswith("neighbor"):
        words = row.split()
        if len(words) == 5 and words[4] == "in":
          neigh_addr.append(words[1])
    return neigh_addr

  def _check_conflicting_bgp_neighbor_rule(self) -> None:
    """
    Checks for the existence of a conflicting neighbor entry in
    the bgp section
    """
    # Resetting
    self._conflicts["father"] = False
    self._conflicts["son"] = False

    # Checking the father first
    father_asn = self._peers.asn
    son_router_ip = self._peers.peer.router_ip
    father_response = Helper.send_arista_commands(self._peers.mngt_ip, [f"enable", f"configure", f"show running-config"])
    
    neigh_father_ip = PeeringNetwork.parsing_bgp_neighbor_rule(father_response, father_asn)
    
    if son_router_ip in neigh_father_ip:
      # Already exists an entry with the son peer in the father config
      print(f"[WARN]: The father peer has already a route-map associated (either the same or less restrictive)")
      self._conflicts["father"] = True
    
    # Checking the son peer
    son_asn = self._peers.peer.asn
    father_router_ip = self._peers.router_ip
    son_response = Helper.send_arista_commands(self._peers.peer.mngt_ip, [f"enable", f"configure", f"show running-config"])
    
    neigh_son_ip = PeeringNetwork.parsing_bgp_neighbor_rule(son_response, son_asn)
  
    if father_router_ip in neigh_son_ip:
      # Already exists an entry with the father peer in the son config
      print(f"[WARN]: The son peer has already a route-map associated (either the same or less restrictive)")
      self._conflicts["son"] = True

  @staticmethod
  def parsing_access_list_rules(arista_response) -> list[str]:
    """Function that retrieves which are the AS numbers which are already present
    in the as-path access list"""
    response_dict = arista_response[2].get("cmds", {})
    # List containing the 5-th field of all the remote AS number found in the access control list section
    as_acl = []
    # Search for any entry starting with ip as-path access-list
    for entry in response_dict:
      if entry.startswith("ip as-path access-list"):
        words = entry.split()
        # We're interested in the 5th element, which is the regular expression
        # which includes the AS number. 
        as_path_regex = words[5]
        # Removing unwanted characters
        cleaned_regex = as_path_regex.replace("^", "").replace("$", "").replace("_", "")
        as_acl.append(cleaned_regex)
    
    return as_acl

  def _check_conflicting_rule(self) -> None:
    """Gives instructions to generate_peering_policy whether to send or not send
    the Arista commands performing the peering policy
    """

    # Resetting
    self._authorization["father"] = False
    self._authorization["son"] = False

    self._check_conflicting_bgp_neighbor_rule()
    print(f"[DEBUG] conflicts -> {self._conflicts}")
    # If all the elements of the conflicts dictionary are False
    # we can proceed to add the peering relationship because
    # it's the first time in which the remote AS are involved
    if self._conflicts["father"] == False:
      self._authorization["father"] = True
    else:
      # Otherwise we need to check the access-list section
      # This is necessary in case if different AS are involved, like executing a peering between R2 and R20
      # Checking the father first
      son_asn = self._peers.peer.asn
      father_response = Helper.send_arista_commands(self._peers.mngt_ip, [f"enable", f"configure", f"show running-config"])

      father_as_acl = PeeringNetwork.parsing_access_list_rules(father_response)
      
      # If the access-list involves a remote AS
      # different from the one concerning the peering, I give instructions to execute the peering
      if str(son_asn) not in father_as_acl:
        # Absence of the rule, allowing peering
        print(f"[INFO]: Father peer - New AS involved")
        self._authorization["father"] = True

    if self._conflicts["son"] == False:
      self._authorization["son"] = True
    else:
      # Checking the son peer
      father_asn = self._peers.asn
      son_response = Helper.send_arista_commands(self._peers.peer.mngt_ip, [f"enable", f"configure", f"show running-config"])

      son_as_acl = PeeringNetwork.parsing_access_list_rules(son_response)
      
      if str(father_asn) not in son_as_acl:
        # Absence of the rule, allowing peering
        print(f"[INFO]: Son peer - New AS involved")
        self._authorization["son"] = True
    
  def generate_peering_policy(self) -> None:
    """
    Generate peering policy.
    :return: None
    """
    print(f"[INFO] Generating peering policy")
    if self._authorization["father"] == True:
      Helper.send_arista_commands(self._peers.mngt_ip, self._father_commands)
    else:
       print(f"[WARN] Skipping father peering policy")
    if self._authorization["son"] == True:
      Helper.send_arista_commands(self._peers.peer.mngt_ip, self._son_commands)
    else:
       print(f"[WARN] Skipping son peering policy")

    self._generate_debug_file()
    print(f"[INFO] Peering policy has been generated")
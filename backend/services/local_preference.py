from models.local_preference import LocalPreference
from utils.helpers import Helper

class LocalPreferenceNetwork:
  _local_preference: LocalPreference
  _commands: list[str] = []

  def __init__(self, local_preference):
    self._local_preference = local_preference
    self._generate_commands()
  
  def _generate_commands(self) -> None:
    """
    Generates the command to set the local preference.
    :return: None
    """
    arista_response = Helper.send_arista_commands(self._local_preference.mngt_ip, [f"enable", f"configure", f"show running-config"])
    general_response_dict = arista_response[2].get("cmds", {})

    # If a transit or a peering is not performed before, we return an exception

    bgp_section_response_dict = general_response_dict.get(f"router bgp {self._local_preference.asn}").get("cmds")
    route_map_exists = False
    for row in bgp_section_response_dict:
      if row.startswith("neighbor") and row.endswith("in"):
        words = row.split()
        # words[1] is the address of the peer
        if len(words) == 5 and words[1] == str(self._local_preference.neighbor_ip) and words[2] == "route-map":
          # In this way I discover whether it's the case in which no ingress route-map
          # for the bgp neighbor exist
          route_map_id = words[3]
          route_map_exists = True

    if not route_map_exists:
      raise Exception("Cannot perform local-preference.")
    
    # If exists a prefix-list for the same network, delete it immediately in order to execute a consistent override.

    pref_list_filtering = [key for key in general_response_dict.keys() if key.startswith(f"ip prefix-list {self._local_preference.router}-LOCAL-PREF") and key.endswith(f"permit {self._local_preference.network}")]
    if pref_list_filtering: # Only if the list is not empty I have to delete, otherwise not delete
      words = pref_list_filtering[0].split() # The list contains only one element, since if they are duplicated entry for the same network, there's a policy to delete it immediately
      seq_num_to_del = words[4]
      pref_list_name = words[2]
      Helper.send_arista_commands(self._local_preference.mngt_ip, [f"enable", f"configure", f"no ip prefix-list {pref_list_name} seq {seq_num_to_del} permit {self._local_preference.network}"])
      # In this way I remove the prefix-list directly from the memory without re-issueing the show running-config
      del general_response_dict[pref_list_filtering[0]]

    # Here we check the case in which I have a different network but the same local-prefence value
    pref_list_seq_num = 0
    pref_list_filtering = [key for key in general_response_dict.keys() if key.startswith(f"ip prefix-list {self._local_preference.router}-LOCAL-PREF-{self._local_preference.local_preference}")]
    # empty list
    if not pref_list_filtering:
      pref_list_seq_num = 10
    else:
      for elem in pref_list_filtering:
        pl = elem.split()
        if len(pl) == 7:
          # This check is useful in order not to waste sequence numbers
          if pl[6] == self._local_preference.network:
            pref_list_seq_num = int(pl[4])
          else:
            pref_list_seq_num = int(pl[4]) + 10

    # A new filtering based without discrimating the local pref specification
    pref_list_filtering = [key for key in general_response_dict.keys() if key.startswith(f"ip prefix-list {self._local_preference.router}-LOCAL-PREF-")]
    # Creating a set with the local-pref values owned so far
    set_local_pref_values = set()
    for elem in pref_list_filtering:
      words = elem.split()
      local_pref_value = int(words[2].split("-")[-1])
      set_local_pref_values.add(local_pref_value)

    # Adding the incoming local-pref value to the set
    set_local_pref_values.add(self._local_preference.local_preference)
    count_local_pref_values = len(set_local_pref_values)

    if count_local_pref_values == 10: # 9 + the arriving one
      raise Exception("No more than 9 local-pref different values per AS can be specified.")
    
    # Ordering the local-pref values in descending order to maintain the priority order
    sorted_local_pref_values = sorted(set_local_pref_values, reverse=True)
 
    # Preparing the commands
    self._commands = [
      f"enable",
      f"configure",
    ]

    self._commands.append(f"ip prefix-list {self._local_preference.router}-LOCAL-PREF-{self._local_preference.local_preference} seq {pref_list_seq_num} permit {self._local_preference.network}")
    if count_local_pref_values == 0:
      # First time issueing a local_preference ever
      self._commands.append(f"route-map {route_map_id} permit 1")
    else:
      # First I revert the old ones
      for i in range(1, 10):
        self._commands.append(f"no route-map {route_map_id} permit {i}")
      # I reintroduce the old ones respecting the priority
      for i, value in enumerate(sorted_local_pref_values):
        self._commands.append(f"route-map {route_map_id} permit {i+1}")
        self._commands.append(f"   match ip address prefix-list {self._local_preference.router}-LOCAL-PREF-{value}")
        self._commands.append(f"   set local-preference {value}")
    self._commands.append(f"exit")

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
    Helper.send_arista_commands(self._local_preference.mngt_ip, self._commands)
    self._generate_debug_file()
    print("[INFO] Local preference generated successfully")
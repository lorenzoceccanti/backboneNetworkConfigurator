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
    self._commands = [
      "enable",
      "configure",
      f"route-map SET-LOCAL-PREF permit 10",
      f"   set local-preference {self._local_preference.local_preference}",
      "exit",
      f"router bgp {self._local_preference.asn}",
      f"   neighbor {self._local_preference.neighbor_ip} route-map SET-LOCAL-PREF in",
      "exit"
    ]


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
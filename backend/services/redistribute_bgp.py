from models.redistribute_bgp import RedistributeBGP
from utils.helpers import Helper

class RedistributeBGPNetwork:
  _redistribute_bgp: RedistributeBGP
  _commands: list[str] = []

  def __init__(self, redistribute_bgp: RedistributeBGP):
    self._redistribute_bgp = redistribute_bgp
  
  
  def _generate_debug_file(self) -> None:
    """
    Generate debug file.
    :return: None
    """
    with open(f"config/{self._redistribute_bgp.mngt_ip}_REDISTRIBUTE_BGP.cfg", "w") as f:
      f.write("\n".join(self._commands))

  def redistribute_bgp(self) -> None:
    """
    Redistribute the network to the OSPF peers.
    :return: None
    """
    print("[INFO] Redistributing BGP network")

    self._commands = [
      f"enable",
      f"configure",
      f"router ospf 1"
    ]
    if self._redistribute_bgp.redistribute:
      self._commands.append(f"   redistribute bgp")
    else:
      self._commands.append(f"   no redistribute bgp")
    self._commands.append(f"exit")

    Helper.send_arista_commands(self._redistribute_bgp.mngt_ip, self._commands)
    self._generate_debug_file()
    print("[INFO] BGP network redistributed successfully")

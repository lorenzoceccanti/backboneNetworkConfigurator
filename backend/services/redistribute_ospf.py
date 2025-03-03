from models.redistribute_ospf import RedistributeOSPF
from utils.helpers import Helper

class RedistributeOSPFNetwork:
  _redistribute_ospf: RedistributeOSPF
  _commands: list[str] = []

  def __init__(self, redistribute_ospf: RedistributeOSPF):
    self._redistribute_ospf = redistribute_ospf
  
  
  def _generate_debug_file(self) -> None:
    """
    Generate debug file.
    :return: None
    """
    with open(f"config/{self._redistribute_ospf.asn}_REDISTRIBUTE_OSPF.cfg", "w") as f:
      f.write("\n".join(self._commands))

  def redistribute_ospf(self) -> None:
    """
    Redistribute the network to the BGP peers.
    :return: None
    """
    print("[INFO] Redistributing OSPF network")

    self._commands = [
      f"enable",
      f"configure",
      f"router bgp {self._redistribute_ospf.asn}"
    ]
    if self._redistribute_ospf.redistribute:
        self._commands.append(f"   redistribute ospf")
    else:
        self._commands.append(f"   no redistribute ospf")
    self._commands.append(f"exit")

    # Helper.send_arista_commands(self._redistribute_ospf.mngt_ip, self._commands)
    self._generate_debug_file()
    print("[INFO] OSPF network redistributed successfully")

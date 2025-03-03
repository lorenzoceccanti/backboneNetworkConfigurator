from models.peering import Peering
from utils.helpers import Helper

class PeeringNetwork:
  _peers: Peering
  _father_commands: list[str] = []
  _son_commands: list[str] = []

  def __init__(self, peers: Peering):
    self._peers = peers
    self._generate_father_commands()
    self._generate_son_commands()


  def _generate_father_commands(self) -> None:
    """
    Generate father commands.
    :return: None
    """
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


  def generate_peering_policy(self) -> None:
    """
    Generate peering policy.
    :return: None
    """
    print(f"[INFO] Generating peering policy")

    Helper.send_arista_commands(self._peers.mngt_ip, self._father_commands)
    Helper.send_arista_commands(self._peers.peer.mngt_ip, self._son_commands)

    self._generate_debug_file()
    print(f"[INFO] Peering policy has been generated")
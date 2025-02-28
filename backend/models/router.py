from typing import List, Optional
from dataclasses import dataclass
from models.router_interface import RouterInterface
from models.neighbor import Neighbor
from models.dhcp import DHCP

@dataclass
class Router:
  name: str
  asn: int
  interfaces: List[RouterInterface]
  neighbors: List[Neighbor]
  admin_password: Optional[str] = None
  dhcp: Optional[DHCP] = None
  mngt_ipv4: Optional[str] = None

  def __post_init__(self):
    if self.asn < 1 or self.asn > 65534:
      raise ValueError("ASN must be between 1 and 65534")
    self.interfaces = [RouterInterface(**interface) if isinstance(interface, dict) else interface for interface in self.interfaces]
    self.neighbors = [Neighbor(**neighbor) if isinstance(neighbor, dict) else neighbor for neighbor in self.neighbors]
    self.dhcp = DHCP(**self.dhcp) if self.dhcp is not None and isinstance(self.dhcp, dict) else self.dhcp

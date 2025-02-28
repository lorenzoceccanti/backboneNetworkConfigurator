from typing import List, Optional
from dataclasses import dataclass
import ipaddress
from models.host_interface import HostInterface

@dataclass
class Host:
  name: str
  interfaces: List[HostInterface]
  gateway: str
  is_dhcp_enabled: Optional[bool] = False

  def __post_init__(self):
    if self.gateway != "":
      try:
        ipaddress.IPv4Address(self.gateway)
      except ValueError:
        raise ValueError(f"Invalid IP address format of gateway: {self.gateway}")
    self.interfaces = [HostInterface(**interface) if isinstance(interface, dict) else interface for interface in self.interfaces]

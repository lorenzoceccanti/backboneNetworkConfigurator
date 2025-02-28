from typing import Optional
from dataclasses import dataclass
import ipaddress
from utils.helpers import Helper

@dataclass
class HostInterface:
  name: str
  dhcp: bool
  linux_name: Optional[str] = None
  ip: Optional[str] = None

  def __post_init__(self):
    self.linux_name = Helper.convert_interface_name_in_linux(self.name)
    if self.dhcp is False:
      try:
        ipaddress.IPv4Network(self.ip, strict=False)
      except ValueError:
        raise ValueError(f"Invalid IP network format of host interface: {self.ip}")

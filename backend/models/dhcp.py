from typing import List
from dataclasses import dataclass
import ipaddress

@dataclass
class DHCP:
  enabled: bool
  subnet: str
  interface: str
  range: List[str]

  def __post_init__(self):
    try:
      ipaddress.IPv4Network(self.subnet, strict=False)
    except ValueError:
      print(f"Invalid subnet format: {self.subnet}")
      raise ValueError(f"Invalid subnet format: {self.subnet}")

    if len(self.range) != 2:
      raise ValueError("DHCP range must have exactly two IPs.")
    for ip in self.range:
      try:
        ipaddress.IPv4Address(ip)
      except ValueError:
        raise ValueError(f"Invalid IP in DHCP range: {ip}")

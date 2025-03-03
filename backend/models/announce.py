from dataclasses import dataclass
import ipaddress
from typing import List

@dataclass
class AnnounceTo:
  asn: int
  his_router_ip: str

  def __post_init__(self):
    if self.asn < 0 or self.asn > 65535:
      raise ValueError("ASN must be between 0 and 65535")
    try:
      ipaddress.IPv4Address(self.his_router_ip)
    except ValueError:
      raise ValueError(f"Invalid IPv4 address for {self.his_router_ip}")


@dataclass
class Announce:
  router: str
  asn: int
  mngt_ip: str
  network_to_announce: str
  to: List[AnnounceTo]

  def __post_init__(self):
    if self.asn < 0 or self.asn > 65535:
      raise ValueError("ASN must be between 0 and 65535")
    try:
      ipaddress.IPv4Address(self.mngt_ip)
    except ValueError:
      raise ValueError(f"Invalid IPv4 address for {self.mngt_ip}")
    try:
      ipaddress.IPv4Network(self.network_to_announce)
    except ValueError:
      raise ValueError(f"Invalid IPv4 network for {self.network_to_announce}")
    if not self.to:
      raise ValueError("You must specify at least one network to announce")
    self.to = [AnnounceTo(**to) for to in self.to]

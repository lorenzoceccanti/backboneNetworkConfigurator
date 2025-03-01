from dataclasses import dataclass
from typing import List
import ipaddress
from models.transit_through_router_ip import TransitThroughRouterIP

@dataclass
class TransitThrough:
  asn: int
  router: str
  router_ip: List[TransitThroughRouterIP]
  mngt_ip: str

  def __post_init__(self):
    if self.asn < 0 or self.asn > 65534:
      raise ValueError("ASN must be between 0 and 65534")
    try:
      ipaddress.IPv4Address(self.mngt_ip)
    except ValueError:
      raise ValueError(f"Invalid IP address format: {self.mngt_ip}")

    self.router_ip = [TransitThroughRouterIP(**router_ip) if isinstance(router_ip, dict) else router_ip for router_ip in self.router_ip]

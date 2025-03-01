from dataclasses import dataclass
import ipaddress

@dataclass
class TransitThroughRouterIP:
  asn: int
  my_router_ip: str

  def __post_init__(self):
    if self.asn < 0 or self.asn > 65534:
      raise ValueError("ASN must be between 0 and 65534")
    try:
      ipaddress.IPv4Address(self.my_router_ip)
    except ValueError:
      raise ValueError(f"Invalid IP address format: {self.my_router_ip}")

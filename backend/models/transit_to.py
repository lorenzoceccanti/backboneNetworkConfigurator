from dataclasses import dataclass
import ipaddress

@dataclass
class TransitTo:
  asn: int
  router: str
  router_ip: str
  mngt_ip: str

  def __post_init__(self):
    if self.asn < 0 or self.asn > 65534:
      raise ValueError("ASN must be between 0 and 65534")
    try:
      ipaddress.IPv4Address(self.router_ip)
      ipaddress.IPv4Address(self.mngt_ip)
    except ValueError:
      raise ValueError(f"Invalid IP address format: {self.router_ip} or {self.mngt_ip}")
from dataclasses import dataclass
import ipaddress

@dataclass
class Neighbor:
  ip: str
  asn: int

  def __post_init__(self):
    try:
      ipaddress.IPv4Address(self.ip)
    except ValueError:
      raise ValueError(f"Invalid IP address format: {self.ip}")

    if self.asn < 1 or self.asn > 65534:
      raise ValueError("ASN must be between 1 and 65534")

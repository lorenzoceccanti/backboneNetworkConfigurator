import ipaddress
from dataclasses import dataclass

@dataclass
class StopAnnounce:
  router: str
  asn: int
  mngt_ip: str
  network_to_stop_announce: str

  def __post_init__(self):
    if self.asn < 0 or self.asn > 65535:
      raise ValueError("ASN must be between 0 and 65535")
    try:
      ipaddress.IPv4Address(self.mngt_ip)
    except ValueError:
      raise ValueError(f"Invalid IPv4 address for {self.mngt_ip}")
    try:
      ipaddress.IPv4Network(self.network_to_stop_announce)
    except ValueError:
      raise ValueError(f"Invalid IPv4 network for {self.network_to_stop_announce}")

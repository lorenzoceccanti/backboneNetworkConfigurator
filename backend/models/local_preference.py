from dataclasses import dataclass
import ipaddress

@dataclass
class LocalPreference:
  asn: int
  router: str
  mngt_ip: str
  neighbor_ip: str
  local_preference: int
  network: str

  def __post_init__(self):
    if self.asn < 0 or self.asn > 65535:
      raise ValueError('Invalid ASN')
    try:
      ipaddress.IPv4Address(self.mngt_ip)
    except ValueError:
      raise ValueError(f'Invalid management IP address {self.mngt_ip}')
    try:
      ipaddress.IPv4Address(self.neighbor_ip)
    except ValueError:
      raise ValueError(f'Invalid neighbor IP address {self.neighbor_ip}')
    if self.local_preference < 0:
      raise ValueError('Invalid local preference')
    try:
      ipaddress.IPv4Network(self.network)
    except ValueError:
      raise ValueError(f"Invalid IPv4 network {self.network}")

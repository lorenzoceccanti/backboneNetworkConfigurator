from dataclasses import dataclass
import ipaddress

@dataclass
class RedistributeOSPF:
  asn: int
  mngt_ip: str
  redistribute: bool

  def __post_init__(self):
    if self.asn < 0 or self.asn > 65535:
      raise ValueError("ASN must be between 0 and 65535")
    try:
      ipaddress.IPv4Address(self.mngt_ip)
    except ValueError:
      raise ValueError(f"Invalid Management IP address {self.mngt_ip}")

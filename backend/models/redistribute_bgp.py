from dataclasses import dataclass
import ipaddress

@dataclass
class RedistributeBGP:
  mngt_ip: str
  redistribute: bool

  def __post_init__(self):
    try:
      ipaddress.IPv4Address(self.mngt_ip)
    except ValueError:
      raise ValueError(f"Invalid Management IP Address {self.mngt_ip}")

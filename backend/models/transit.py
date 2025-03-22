from dataclasses import dataclass
from typing import Union, List
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


@dataclass
class TransitFrom:
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


@dataclass
class Transit:
  from_: TransitFrom
  through: TransitThrough
  to: Union[List[TransitTo], str]

  def __post_init__(self):
    self.from_ = TransitFrom(**self.from_) if isinstance(self.from_, dict) else self.from_
    self.through = TransitThrough(**self.through) if isinstance(self.through, dict) else self.through
    if isinstance(self.to, list):
      self.to = [TransitTo(**to) if isinstance(to, dict) else to for to in self.to]

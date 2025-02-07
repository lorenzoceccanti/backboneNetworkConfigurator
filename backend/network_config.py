from typing import List, Optional
from pydantic import BaseModel, Field, validator
import ipaddress

class Peer(BaseModel):
  name: str
  interface: str

class Interface(BaseModel):
  name: str
  ip: str
  peer: Peer

  @validator("ip")
  def validate_ip(cls, v):
    try:
      ipaddress.IPv4Network(v, strict=False)
    except ValueError:
      print(f"Invalid IP address format: {v}")
      raise ValueError(f"Invalid IP address format: {v}")
    return v

class Neighbor(BaseModel):
  ip: str
  asn: int = Field(..., ge=1, le=65534)

  @validator("ip")
  def validate_neighbor_ip(cls, v):
    try:
      ipaddress.IPv4Address(v)
    except ValueError:
      print(f"Invalid IP address format: {v}")
      raise ValueError(f"Invalid IP address format: {v}")
    return v

class DHCPConfig(BaseModel):
  enabled: bool
  subnet: str
  range: List[str]

  @validator("subnet")
  def validate_subnet(cls, v):
    try:
      ipaddress.IPv4Network(v, strict=False)
    except ValueError:
      print(f"Invalid subnet format: {v}")
      raise ValueError(f"Invalid subnet format: {v}")
    return v

  @validator("range", pre=True)
  def validate_range(cls, v):
    if len(v) != 2:
      print(f"DHCP range must have exactly two IPs.")
      raise ValueError("DHCP range must have exactly two IPs.")
    for ip in v:
      try:
        ipaddress.IPv4Address(ip)
      except ValueError:
        print(f"Invalid IP in DHCP range: {ip}")
        raise ValueError(f"Invalid IP in DHCP range: {ip}")
    return v

class Router(BaseModel):
  name: str
  asn: int = Field(..., ge=1, le=4294967295)
  interfaces: List[Interface]
  neighbors: List[Neighbor]
  dhcp: Optional[DHCPConfig] = None

class NetworkConfig(BaseModel):
  routers: List[Router]

def get_network_address(ip: str) -> str:
    return str(ipaddress.ip_network(ip, strict=False))


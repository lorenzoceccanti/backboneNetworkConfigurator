from dataclasses import dataclass
import ipaddress

@dataclass
class Peer:
  asn: int
  router_ip: str
  mngt_ip: str

  def __post_init__(self):
    if self.asn < 1 or self.asn > 65535:
      raise ValueError("ASN must be between 1 and 65535")
    try:
      ipaddress.IPv4Address(self.router_ip)
    except ValueError:
      raise ValueError(f"Invalid IPv4 address {self.router_ip}")
    try:
      ipaddress.IPv4Address(self.mngt_ip)
    except ValueError:
      raise ValueError(f"Invalid IPv4 address {self.mngt_ip}")
  

@dataclass
class Peering:
  asn: int
  router_ip: str
  mngt_ip: str
  peer: Peer

  def __post_init__(self):
    if self.asn < 1 or self.asn > 65535:
      raise ValueError("ASN must be between 1 and 65535")
    try:
      ipaddress.IPv4Address(self.router_ip)
    except ValueError:
      raise ValueError(f"Invalid IPv4 address {self.router_ip}")
    try:
      ipaddress.IPv4Address(self.mngt_ip)
    except ValueError:
      raise ValueError(f"Invalid IPv4 address {self.mngt_ip}")

    self.peer = Peer(**self.peer) if isinstance(self.peer, dict) else self.peer

  @staticmethod
  def schema() -> dict:
    """
    Returns the JSON Schema for validating a Peering object.
    :return: JSON Schema for Peering object
    """
    return {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "Peering",
      "type": "object",
      "properties": {
        "asn": {"type": "integer"},
        "router_ip": {"type": "string"},
        "mngt_ip": {"type": "string"},
        "peer": {
          "type": "object",
          "properties": {
              "asn": {"type": "integer"},
              "router_ip": {"type": "string"},
              "mngt_ip": {"type": "string"}
          },
          "required": ["asn", "router_ip", "mngt_ip"],
          "additionalProperties": False
        }
      },
      "required": ["asn", "router_ip", "mngt_ip", "peer"],
      "additionalProperties": False
    }

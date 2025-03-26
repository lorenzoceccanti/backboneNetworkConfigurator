from dataclasses import dataclass
import ipaddress
from typing import List, Union

@dataclass
class AnnounceTo:
  asn: int
  his_router_ip: str

  def __post_init__(self):
    if self.asn < 0 or self.asn > 65535:
      raise ValueError("ASN must be between 0 and 65535")
    try:
      ipaddress.IPv4Address(self.his_router_ip)
    except ValueError:
      raise ValueError(f"Invalid IPv4 address for {self.his_router_ip}")


@dataclass
class Announce:
  router: str
  asn: int
  mngt_ip: str
  network_to_announce: str
  to: List[Union[AnnounceTo, str]]

  def __post_init__(self):
    if self.asn < 0 or self.asn > 65535:
      raise ValueError("ASN must be between 0 and 65535")
    try:
      ipaddress.IPv4Address(self.mngt_ip)
    except ValueError:
      raise ValueError(f"Invalid IPv4 address for {self.mngt_ip}")
    try:
      ipaddress.IPv4Network(self.network_to_announce)
    except ValueError:
      raise ValueError(f"Invalid IPv4 network for {self.network_to_announce}")
    if not self.to:
      raise ValueError("You must specify at least one network to announce")
    self.to = [AnnounceTo(**to) if isinstance(to, dict) else to for to in self.to]

  @staticmethod
  def schema() -> dict:
    """
    JSON schema for validating an Announce request.
    :return: JSON schema
    """
    return {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "Announce",
      "description": "Schema for validating an Announce request",
      "type": "object",
      "properties": {
        "router": {"type": "string"},
        "asn": {"type": "integer"},
        "mngt_ip": {"type": "string"},
        "network_to_announce": {"type": "string"},
        "to": {
          "type": "array",
          "minItems": 1,
          "items": {
            "oneOf": [
            {
              "type": "object",
              "properties": {
                "asn": {"type": "integer"},
                "his_router_ip": {"type": "string"}
              },
              "required": ["asn", "his_router_ip"],
              "additionalProperties": False
            },
            { "type":"string", "enum":["Internet"]}
            ]
          }
        }
      },
      "required": ["router", "asn", "mngt_ip", "network_to_announce", "to"],
      "additionalProperties": False
    }
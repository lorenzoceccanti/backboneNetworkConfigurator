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

  @staticmethod
  def schema() -> dict:
    """
    Returns the JSON Schema for validating a StopAnnounce object.
    :return: JSON Schema for StopAnnounce
    """
    return {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "StopAnnounce",
      "type": "object",
      "properties": {
        "router": {"type": "string"},
        "asn": {"type": "integer"},
        "mngt_ip": {"type": "string"},
        "network_to_stop_announce": {"type": "string"}
      },
      "required": ["router", "asn", "mngt_ip", "network_to_stop_announce"],
      "additionalProperties": False
    }
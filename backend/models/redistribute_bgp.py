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

  @staticmethod
  def schema() -> dict:
    """
    Returns the JSON Schema for validating a RedistributeBGP object.
    :return: JSON Schema for Redistribute BGP object.
    """
    return {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "RedistributeBGP",
      "type": "object",
      "properties": {
        "mngt_ip": {"type": "string"},
        "redistribute": {"type": "boolean"}
      },
      "required": ["mngt_ip", "redistribute"],
      "additionalProperties": False
    }

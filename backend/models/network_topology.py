from typing import List, Optional
from dataclasses import dataclass
import ipaddress
from utils.helpers import Helper

@dataclass
class DHCP:
  enabled: bool
  subnet: str
  interface: str
  range: List[str]

  def __post_init__(self):
    try:
      ipaddress.IPv4Network(self.subnet, strict=False)
    except ValueError:
      print(f"Invalid subnet format: {self.subnet}")
      raise ValueError(f"Invalid subnet format: {self.subnet}")

    if len(self.range) != 2:
      raise ValueError("DHCP range must have exactly two IPs.")
    for ip in self.range:
      try:
        ipaddress.IPv4Address(ip)
      except ValueError:
        raise ValueError(f"Invalid IP in DHCP range: {ip}")


@dataclass
class Peer:
  name: str
  interface: str
  linux_name: Optional[str] = None

  def __post_init__(self):
    self.linux_name = Helper.convert_interface_name_in_linux(self.interface)


@dataclass
class Neighbor:
  ip: str
  asn: int

  def __post_init__(self):
    try:
      ipaddress.IPv4Address(self.ip)
    except ValueError:
      raise ValueError(f"Invalid IP address format: {self.ip}")

    if self.asn < 1 or self.asn > 65534:
      raise ValueError("ASN must be between 1 and 65534")


@dataclass
class RouterInterface:
  name: str
  ip: str
  peer: Peer
  linux_name: Optional[str] = None
  network: Optional[str] = None

  def __post_init__(self):
    try:
      ip_obj = ipaddress.IPv4Network(self.ip, strict=False)
    except ValueError:
      raise ValueError(f"Invalid IP address format: {self.ip}")
    self.peer = Peer(**self.peer) if isinstance(self.peer, dict) else self.peer
    self.linux_name = Helper.convert_interface_name_in_linux(self.name)

@dataclass
class InternetInterface:
  enabled: bool
  name: str
  ip: str

  def __post_init__(self):
    try:
      ip_obj = ipaddress.IPv4Network(self.ip, strict=False)
    except ValueError:
      raise ValueError(f"Invalid IP address format: {self.ip}")



@dataclass
class Router:
  name: str
  asn: int
  interfaces: List[RouterInterface]
  neighbors: List[Neighbor]
  redistribute_bgp: bool
  admin_password: Optional[str] = None
  dhcp: Optional[DHCP] = None
  mngt_ipv4: Optional[str] = None
  internet_iface: Optional[InternetInterface] = None

  def __post_init__(self):
    if self.asn < 1 or self.asn > 65534:
      raise ValueError("ASN must be between 1 and 65534")
    self.interfaces = [RouterInterface(**interface) if isinstance(interface, dict) else interface for interface in self.interfaces]
    self.internet_iface = InternetInterface(**self.internet_iface) if self.internet_iface is not None and isinstance(self.internet_iface, dict) else self.internet_iface
    self.neighbors = [Neighbor(**neighbor) if isinstance(neighbor, dict) else neighbor for neighbor in self.neighbors]
    self.dhcp = DHCP(**self.dhcp) if self.dhcp is not None and isinstance(self.dhcp, dict) else self.dhcp



@dataclass
class HostInterface:
  name: str
  dhcp: bool
  linux_name: Optional[str] = None
  ip: Optional[str] = None

  def __post_init__(self):
    self.linux_name = Helper.convert_interface_name_in_linux(self.name)
    if self.dhcp is False:
      try:
        ipaddress.IPv4Network(self.ip, strict=False)
      except ValueError:
        raise ValueError(f"Invalid IP network format of host interface: {self.ip}")


@dataclass
class Host:
  name: str
  interfaces: List[HostInterface]
  gateway: str
  is_dhcp_enabled: Optional[bool] = False

  def __post_init__(self):
    if self.gateway != "":
      try:
        ipaddress.IPv4Address(self.gateway)
      except ValueError:
        raise ValueError(f"Invalid IP address format of gateway: {self.gateway}")
    self.interfaces = [HostInterface(**interface) if isinstance(interface, dict) else interface for interface in self.interfaces]


@dataclass
class NetworkTopology:
  project_name: str
  routers: List[Router]
  hosts: List[Host]
  links: Optional[list[str, str]] = None
  
  def __post_init__(self):
    self.routers = [Router(**router) if isinstance(router, dict) else router for router in self.routers]
    self.hosts = [Host(**host) if isinstance(host, dict) else host for host in self.hosts]

  @staticmethod
  def schema() -> dict:
    """
    Returns the JSON Schema for validating a NetworkTopology object.
    :return: JSON Schema for NetworkTopology object.
    """
    return {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "NetworkTopology",
      "type": "object",
      "properties": {
        "project_name": {"type": "string"},
        "routers": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": {"type": "string"},
              "asn": {"type": "integer"},
              "interfaces": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "name": {"type": "string"},
                    "ip": {"type": "string"},
                    "peer": {
                      "type": "object",
                      "properties": {
                        "name": {"type": "string"},
                        "interface": {"type": "string"},
                        "linux_name": {"type": ["string", "null"]}
                      },
                      "required": ["name", "interface"],
                      "additionalProperties": False
                    },
                    "linux_name": {"type": ["string", "null"]},
                    "network": {"type": ["string", "null"]}
                  },
                  "required": ["name", "ip", "peer"],
                  "additionalProperties": False
                }
              },
              "neighbors": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "ip": {"type": "string"},
                    "asn": {"type": "integer"}
                  },
                  "required": ["ip", "asn"],
                  "additionalProperties": False
                }
              },
              "redistribute_bgp": {"type": "boolean"},
              "admin_password": {"type": ["string", "null"]},
              "dhcp": {
                "oneOf": [
                  {"type": "null"},
                  {
                    "type": "object",
                    "properties": {
                      "enabled": {"type": "boolean"},
                      "subnet": {"type": "string"},
                      "interface": {"type": "string"},
                      "range": {
                        "type": "array",
                        "items": {"type": "string"},
                        "minItems": 2,
                        "maxItems": 2
                      }
                    },
                    "required": ["enabled", "subnet", "interface", "range"],
                    "additionalProperties": False
                  }
                ]
              },
              "mngt_ipv4": {"type": ["string", "null"]},
              "internet_iface": {
                "oneOf": [
                  {"type": "null"},
                  {
                    "type": "object",
                    "properties": {
                      "enabled": {"type": "boolean"},
                      "name": {"type": "string"},
                      "ip": {"type": "string"}
                    },
                    "required": ["enabled", "name", "ip"],
                    "additionalProperties": False
                  }
                ]
              }
          },
          "required": ["name", "asn", "interfaces", "neighbors", "redistribute_bgp"],
          "additionalProperties": False
          }
        },
        "hosts": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": {"type": "string"},
              "interfaces": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "name": {"type": "string"},
                    "dhcp": {"type": "boolean"},
                    "linux_name": {"type": ["string", "null"]},
                    "ip": {"type": ["string", "null"]}
                  },
                  "required": ["name", "dhcp"],
                  "additionalProperties": False
                }
              },
              "gateway": {"type": "string"},
              "is_dhcp_enabled": {"type": ["boolean", "null"]}
            },
            "required": ["name", "interfaces", "gateway"],
            "additionalProperties": False
          }
        },
        "links": {
          "type": "array",
          "items": {
            "type": "array",
            "items": {"type": "string"},
            "minItems": 2,
            "maxItems": 2
          }
        }
      },
      "required": ["project_name", "routers", "hosts"],
      "additionalProperties": False
    }

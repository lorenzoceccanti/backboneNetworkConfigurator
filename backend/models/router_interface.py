from typing import Optional
from dataclasses import dataclass
import ipaddress
from utils.helpers import Helper
from models.peer import Peer

@dataclass
class RouterInterface:
  name: str
  ip: str
  peer: Peer
  linux_name: Optional[str] = None
  network: Optional[str] = None

  def __post_init__(self):
    try:
      ipaddress.IPv4Network(self.ip, strict=False)
    except ValueError:
      raise ValueError(f"Invalid IP address format: {self.ip}")
    self.peer = Peer(**self.peer) if isinstance(self.peer, dict) else self.peer
    self.linux_name = Helper.convert_interface_name_in_linux(self.name)

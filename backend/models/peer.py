from typing import Optional
from dataclasses import dataclass
from utils.helpers import Helper

@dataclass
class Peer:
  name: str
  interface: str
  linux_name: Optional[str] = None

  def __post_init__(self):
    self.linux_name = Helper.convert_interface_name_in_linux(self.interface)

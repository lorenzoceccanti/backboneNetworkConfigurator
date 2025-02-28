from typing import List, Optional
from dataclasses import dataclass
from models.router import Router
from models.host import Host

@dataclass
class NetworkTopology:
  project_name: str
  routers: List[Router]
  hosts: List[Host]
  links: Optional[list[str, str]] = None
  
  def __post_init__(self):
    self.routers = [Router(**router) if isinstance(router, dict) else router for router in self.routers]
    self.hosts = [Host(**host) if isinstance(host, dict) else host for host in self.hosts]

import os
from models.network_topology import NetworkTopology
from utils.helpers import Helper

class DeployNetwork:
  @staticmethod
  def deploy_network():
    os.system(f"./deploy_network.sh")

  def _internet_router_configuration(self) -> None:
    commands: list[str] = []
    self._commands = [
      f"enable",
      f"configure",
    ]

    for router in self._network_topology.routers:
      if router.name == "Internet_router":
        commands.append("ip prefix-list DEFAULT_ROUTE seq 10 permit 0.0.0.0/0")
        commands.append("route-map RM-OUT-INTERNET permit 10")
        commands.append("   match ip address prefix-list DEFAULT_ROUTE")
        commands.append("exit")
        commands.append("no ip route 0.0.0.0/0 172.20.20.1")
        commands.append("ip route 0.0.0.0/0 192.168.140.10")
        for neighbor in router.neighbors:
          commands.append(f"ip as-path access-list AS{neighbor.asn}-IN permit ^{neighbor.asn}_ any")
          commands.append(f"route-map RM-IN-{neighbor.asn} permit 10")
          commands.append(f"   match as-path AS{neighbor.asn}-IN")
          commands.append(f"exit")
          commands.append(f"router bgp {router.asn}")
          commands.append(f"   neighbor {neighbor.ip} route-map RM-IN-{neighbor.asn} in")
          commands.append(f"   neighbor {neighbor.ip} route-map RM-OUT-INTERNET out")
          commands.append(f"exit")

        commands.append(f"router bgp {router.asn}")
        commands.append(f"network 0.0.0.0/0")
        commands.append(f"exit")
        Helper.send_arista_commands(router.mngt_ipv4, commands)
    print("[DEBUG] router internet configurato")


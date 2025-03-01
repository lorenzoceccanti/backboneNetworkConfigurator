from models.transit import Transit, TransitTo
from utils.helpers import Helper

class TransitPolicy:
  _transit_policy : Transit
  _from_commands: list[str] = []
  _through_commands: list[str] = []
  _to_commands: list[list[str]]

  def __init__(self, _transit_policy: Transit):
    self._transit_policy = _transit_policy
    self._to_commands = [None] * len(self._transit_policy.to)
    self._generate_from_commands()
    self._generate_through_commands()
    self._generate_to_commands()

  def _generate_from_commands(self) -> None:
    from_asn = self._transit_policy.from_.asn
    through_asn = self._transit_policy.through.asn

    self._from_commands = [
      f"enable",
      f"configure",
      f"ip as-path access-list AS{through_asn}-IN permit ^{through_asn}_ any",
      f"route-map RM-IN-{through_asn} permit 10",
      f"   match as-path AS{through_asn}-IN",
      f"exit",
      f"route-map RM-IN-{through_asn} deny 99",
      f"router bgp {from_asn}",
      f"   bgp missing-policy direction in action deny",
      f"   bgp missing-policy direction out action deny",
    ]

    for through_router_ip in self._transit_policy.through.router_ip:
      if through_router_ip.asn == from_asn:
        self._from_commands.append(f"   neighbor {through_router_ip.my_router_ip} remote-as {through_asn}")
        self._from_commands.append(f"   neighbor {through_router_ip.my_router_ip} route-map RM-IN-{through_asn} in")
        self. _from_commands.append(f"exit")
    pass

  def _generate_through_commands(self) -> None:
    from_asn = self._transit_policy.from_.asn
    through_asn = self._transit_policy.through.asn
    from_router_ip = self._transit_policy.from_.router_ip

    self._through_commands = [
      f"enable",
      f"configure",
      f"ip as-path access-list AS{from_asn}-IN permit ^{from_asn}$ any",
      f"ip as-path access-list AS{from_asn}-OUT permit ^{from_asn}$ any",
      f"route-map RM-IN-{from_asn} permit 10",
      f"   match as-path AS{from_asn}-IN",
      f"exit",
      f"route-map RM-IN-{from_asn} deny 99",
      f"router bgp {through_asn}",
      f"   bgp missing-policy direction in action deny",
      f"   bgp missing-policy direction out action deny",
      f"   neighbor {from_router_ip} remote-as {from_asn}",
      f"   neighbor {from_router_ip} route-map RM-IN-{from_asn} in",
    ]

    for to in self._transit_policy.to:
      if isinstance(to, TransitTo):
        self._through_commands.append(f"   neighbor {from_router_ip} route-map RM-OUT-{to.asn} out")
        self._through_commands.append(f"exit")

        self._through_commands.append(f"ip as-path access-list AS{to.asn}-IN permit ^{to.asn}$ any")
        self._through_commands.append(f"ip as-path access-list AS{to.asn}-OUT permit ^{to.asn}$ any")
        self._through_commands.append(f"route-map RM-IN-{to.asn} permit 10")
        self._through_commands.append(f"   match as-path AS{to.asn}-IN")
        self._through_commands.append(f"exit")
        self._through_commands.append(f"route-map RM-IN-{to.asn} deny 99")
        self._through_commands.append(f"route-map RM-OUT-{to.asn} permit 10")
        self._through_commands.append(f"   match as-path AS{to.asn}-OUT")
        self._through_commands.append(f"exit")

        for through_router_ip in self._transit_policy.through.router_ip:
          if through_router_ip.asn == to.asn:
            self._through_commands.append(f"router bgp {through_asn}")
            self._through_commands.append(f"   neighbor {to.router_ip} remote-as {to.asn}")
            self._through_commands.append(f"   neighbor {to.router_ip} route-map RM-IN-{to.asn} in")
            self._through_commands.append(f"   neighbor {to.router_ip} route-map RM-OUT-{from_asn} out")
            self._through_commands.append(f"exit")
            self._through_commands.append(f"route-map RM-OUT-{from_asn} permit 10")
            self._through_commands.append(f"   match as-path AS{from_asn}-OUT")
            self._through_commands.append(f"exit")
            self._through_commands.append(f"route-map RM-OUT-{from_asn} deny 99")

  def _generate_to_commands(self) -> None:
    for index, to in enumerate(self._transit_policy.to):
      if isinstance(to, TransitTo): # in this way we exclude the "Internet" case
        through_asn = self._transit_policy.through.asn

        self._to_commands[index] = [
          f"enable",
          f"configure",
          f"ip as-path access-list AS{through_asn}-IN permit ^{through_asn}_ any",
          f"route-map RM-IN-{through_asn} permit 10",
          f"   match as-path AS{through_asn}-IN",
          f"exit",
          f"route-map RM-IN-{through_asn} deny 99",
          f"router bgp {to.asn}",
          f"   bgp missing-policy direction in action deny",
          f"   bgp missing-policy direction out action deny",
        ]

        for through_router_ip in self._transit_policy.through.router_ip:
          if through_router_ip.asn == to.asn:
            self._to_commands[index].append(f"   neighbor {through_router_ip.my_router_ip} remote-as {through_asn}")
            self._to_commands[index].append(f"   neighbor {through_router_ip.my_router_ip} route-map RM-IN-{through_asn} in")
            self._to_commands[index].append(f"exit")
  
  def _generate_debug_file(self, file_name: str, commands: list[str]) -> None:
    with open(f"config/{file_name}_TRANSIT.cfg", "w") as f:
      f.write("\n".join(commands))

  def generate_transit_policy(self) -> None:
    print("[INFO] Generating transit policy")
    
    # Helper.send_arista_commands(self._transit_policy.from_.mngt_ip, self._from_commands)
    for index, to in enumerate(self._transit_policy.to):
      if isinstance(to, TransitTo):
        pass
        # Helper.send_arista_commands(to.mngt_ip, self._to_commands[index])
    # Helper.send_arista_commands(self._transit_policy.through.mngt_ip, self._through_commands)
    
    # generate debug files
    self._generate_debug_file(self._transit_policy.from_.router, self._from_commands)
    for index, to in enumerate(self._transit_policy.to):
      if isinstance(to, TransitTo):
        self._generate_debug_file(to.router, self._to_commands[index])
    self._generate_debug_file(self._transit_policy.through.router, self._through_commands)
    print(self._transit_policy)
    print("[INFO] Transit policy generated successfully")

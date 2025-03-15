from jinja2 import Environment, FileSystemLoader
import os
import ipaddress
import crypt
from config import Config
from models.network_topology import NetworkTopology, Router, RouterInterface, Host, HostInterface, Neighbor
from utils.helpers import Helper

class ConfigureNetwork:

  _network_topology: NetworkTopology
  _links: list[list[str, str]]
  internet_count = 2 # NOTA: perché è un campo del metodo se lo usi solo in una funzione?


  def __init__(self, _network_topology: NetworkTopology):
    self._network_topology = _network_topology
    # NOTA: qui creerei una funzione apposta per 
    # lasciare il costruttore il più pulito possibile
    # NOTA: tutta questa roba hardcodata (il nome del router, l'asn, ecc..) 
    # non mi piace, la inserirein in Config 
    router_internet = Router(name = "Internet_router", asn = 54000, interfaces=[RouterInterface(name="Ethernet1", ip="192.168.140.1/24", peer={"name": "Internet_host", "interface":"Ethernet1"})], neighbors = self._get_internet_neighbor())
    self._network_topology.routers.append(router_internet)
    internet_host = Host(name="Internet_host", interfaces=[HostInterface(name="Ethernet1", dhcp =False, ip ="192.168.140.10/24")], gateway ="192.168.140.1")
    self._network_topology.hosts.append(internet_host)
    self._links = self._generate_links()
    self._generate_internet_interfaces(router_internet)
    self._generate_mngt_ip()
    self._enable_dhcp_on_hosts()
    self._generate_admin_password_hash()
    self._generate_networks_for_routers()

  def _get_internet_neighbor(self) -> list[Neighbor]:
    # NOTA: manca l'importazione di List, usa list minuscolo
    # NOTA: manca la descrizione della funzione
    list_neighbor: List[Neighbor] = []
    for router in self._network_topology.routers:
      if router.internet and router.internet_iface and router != self:
        new_neighbor = Neighbor(ip=f"{router.internet_iface.ip}", asn=router.asn)
        list_neighbor.append(new_neighbor)

    return list_neighbor

  def get_links(self) -> list[list[str, str]]:
    # TODO: aggiungere la descrizione della funzione
    return self._links


  def _generate_links(self) -> list[list[str, str]]:
    """ 
    Generates the links between the routers based on the 
    interfaces peer information, this function was created to avoid 
    duplicate links in the containerlab configuration.
    :param routers: list of routers
    :return list of links
    """
    # a set doesn't allow duplicate elements, 
    # so we can use it to store the links
    links_set: set[tuple[str, str]] = set()
    for router in self._network_topology.routers:
      for interface in router.interfaces:
        peer_name: str = interface.peer.name
        peer_interface: str = interface.peer.linux_name

        # check if the peer name and interface are not empty
        # (for example, the Loopback0 interface doesn't have a peer)
        if peer_name and peer_interface:
          endpoint1: str = f"{router.name}:{interface.linux_name}"
          endpoint2: str = f"{peer_name}:{peer_interface}"
          # to avoid duplicates like "router1:eth0" and "router2:eth0"
          # we sort the endpoints and add them to the set
          sorted_endpoints: tuple[str, str] = tuple(sorted([endpoint1, endpoint2]))
          # if the link is already in the set, it won't be added
          links_set.add(sorted_endpoints)

    # convert the set to a list of dictionaries
    links_list: list[list[str, str]] = []
    for link_tuple in links_set:
      links_list.append(list(link_tuple))

    return links_list

  
  def _generate_internet_interfaces(self, router_internet) -> list[list[str, str]]:
    """
    if a router is configurate to access the internet, create a new interface in internet router
    # NOTA: mancano i parametri e cosa ritorna la funzione
    """
    for router in self._network_topology.routers:
      if router.internet:
        # NOTA: non è obbligatorio che sia /24 la maschera di rete
        # e se un amministratore specifica per quell'interfaccia una maschera non /24 questo non va
        parts = router.internet_iface.ip.split(".")
        last = int(parts[3]) + 1
        internet_ip = f"{parts[0]}.{parts[1]}.{parts[2]}.{str(last)}"
        # create a new interfaces to collegate to internet
        new_interface = RouterInterface(name =f"Ethernet{str(self.internet_count)}", ip = f"{internet_ip}/24", peer={"name":f"{router.name}", "interface":f"{router.internet_iface.name}"})
        router_internet.interfaces.append(new_interface)
        
        self.internet_count = self.internet_count + 1
       
        # add internet router as neighbor for the router
        internet_neighbor = Neighbor(ip=internet_ip, asn=54000)
        router.neighbors.append(internet_neighbor)

  def _generate_mngt_ip(self) -> None:
    """ 
    Generates the management IP address for the routers
    and writes it to the router object 
    :param routers: list of routers
    """
    ipv4_base = ipaddress.IPv4Address("172.20.20.2")
    for i, router in enumerate(self._network_topology.routers):
      router.mngt_ipv4 = f"{str(ipv4_base + i)}/24"


  def _enable_dhcp_on_hosts(self) -> None:
    """ 
    If any of the interfaces of the host has the dhcp enabled,
    then insert a field named "dhcp_enabled" with the value "true" in the host dictionary.
    """
    for host in self._network_topology.hosts:
      for interface in host.interfaces:
        if interface.dhcp:
          host.dhcp_enabled = True
          break


  def _generate_admin_password_hash(self) -> None:
    """ 
    Generates a password hash for the admin user.
    """
    salt = crypt.mksalt(crypt.METHOD_SHA512)
    hashed_password = crypt.crypt(Config.PASSWORD, salt)
    for router in self._network_topology.routers:
      router.admin_password = hashed_password


  def _generate_networks_for_routers(self) -> None:
    for router in self._network_topology.routers:
      # also generate the network address for each interface that is used in ospf configuration
      for interface in router.interfaces:
        # for the ospf settings, we need to know the network address of the interface
        # but if that network address is on the same network as the neighbor, 
        # we don't need to add it, since it will be added in the neighbor's configuration
        for neighbor in router.neighbors:
          network_mask = interface.ip.split("/")[1]
          neighbor_network = Helper.get_network_address(neighbor.ip + "/" + network_mask)
          interface_network = Helper.get_network_address(interface.ip)

          if neighbor_network == interface_network:
            # This is an additional check in order to see whether it's necessary to add
            # a new OSPF rule used in a intra-AS scope between 2 different routers having
            # a subnetwork in common
            if neighbor.asn != router.asn:
              # if the neighbor is on the same network as the interface (and the asn is different) break the loop
              # This is for how the for else works: I skip the routers having a different ASN
              break
        else:
          # if none of the neighbors are on the same network as the interface, add the network
          interface.network = interface_network


  def generate_containerlab_config(self) -> None:
    """ 
    Generates the containerlab configuration file and writes it in the ./config folder.
    :param _network_topology: network topology
    """
    print("[INFO] Generating containerlab configuration file")

    env = Environment(loader=FileSystemLoader(Config.TEMPLATE_DIR))
    template = env.get_template("containerlab.j2")
    config_content = template.render(project_name=self._network_topology.project_name, routers=self._network_topology.routers, hosts=self._network_topology.hosts, links=self._links)

    containerlab_file = os.path.join(Config.CONFIG_DIR, "topology.clab.yml")
    with open(containerlab_file, "w") as f:
      f.write(config_content)
    print(f"[INFO] Containerlab configuration file written to {containerlab_file}")


  def generate_arista_configs(self) -> None:
    """ 
    Generates the Arista configuration files for each router and writes them in the ./config folder.
    """
    print("[INFO] Generating Arista configuration files")
    env = Environment(loader=FileSystemLoader(Config.TEMPLATE_DIR))
    template = env.get_template("arista_config.j2")
    files = []

    for router in self._network_topology.routers:
      config_content = template.render(router=router)
      file_path = os.path.join(Config.CONFIG_DIR, f"{router.name}.cfg")

      with open(file_path, "w") as f:
        f.write(config_content)

      files.append(file_path)
    print(f"[INFO] Arista configuration files written successfully to {Config.CONFIG_DIR}")

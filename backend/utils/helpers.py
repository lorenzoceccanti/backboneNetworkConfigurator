import ipaddress

class Helper:
  @staticmethod
  def convert_interface_name_in_linux(interface_name: str) -> str:
    """ 
    This function converts the interface's names to the format expected by containerlab 
    in the frontend the interfaces are named like "Ethernet0", but in the containerlab
    the interfaces are named like "eth0"
    :param interface_name: interface name
    :return: interface name in the format expected by containerlab
    """
    interfaces_map = {
      "Ethernet": "eth",
      "Loopback": "lo",
      "Vlan": "vlan",
      "Management": "mgmt"
    }

    for key, value in interfaces_map.items():
      if key in interface_name:
        return interface_name.replace(key, value)


  @staticmethod
  def get_network_address(ip: str) -> str:
    """
    This function returns the network address of the given IP address
    :param ip: IP address
    :return: network address
    """
    return str(ipaddress.ip_network(ip, strict=False))

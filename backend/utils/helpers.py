import ipaddress
import time
from jsonrpclib import Server
from config import Config

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
  

  @staticmethod
  def send_arista_commands(mngt_ip: str, commands: list[str]) -> dict:
    """
    Sends the commands to the Arista switch using the eAPI
    :param mngt_ip: Management IP of the Arista switch
    :param commands: List of commands to be executed on the switch
    :return: Response from the switch
    """
    if not mngt_ip:
      return {"error": "Management IP not specified"}, 400

    url = f"http://{Config.USERNAME}:{Config.PASSWORD}@{mngt_ip}/command-api"

    try:
      switch = Server(url)
      response = switch.runCmds(1, commands)
      return response
    except Exception as e:
      return {"error": "Error while sending commands to the Arista switch, please check the connection."}, 400

  @staticmethod
  def generate_timestamp() -> int:
    return int(time.time())

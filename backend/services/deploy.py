import os
from models.network_topology import NetworkTopology
from utils.helpers import Helper

class DeployNetwork:
  @staticmethod
  def deploy_network():
    os.system(f"./deploy_network.sh")

  @staticmethod
  def internet_router_configuration() -> None:
    commands: list[str] = [
            "enable",
            "configure",
            "ip prefix-list DEFAULT_ROUTE seq 10 permit 0.0.0.0/0",
            "route-map RM-OUT-INTERNET permit 10",
            "   match ip address prefix-list DEFAULT_ROUTE",
            "exit",
            "no ip route 0.0.0.0/0 172.20.20.1",
            "ip route 0.0.0.0/0 192.168.140.10"
        ]
    current_dir = os.path.dirname(os.path.abspath(__file__))  # Trova la directory di 'configure.py'
    config_dir = os.path.join(current_dir, "..", "config")  # Aggiunge la cartella 'config'
    file_path = os.path.join(config_dir, "Internet_router.cfg")  # Aggiungi il nome del file

    if not os.path.exists(file_path):
      raise FileNotFoundError(f"Error: file {file_path} doesn't exist.")
    
    # Variabile per memorizzare le righe che iniziano con 'neighbor'
    neighbor_lines = []
    management = False
    management_ip = None

    # Apre il file per la lettura
    with open(file_path, "r") as file:
      for line in file:
        line = line.strip()  # Rimuove eventuali spazi o caratteri di nuova riga
        if line.startswith("neighbor"):  # Verifica se la riga inizia con 'neighbor'
            neighbor_lines.append(line)  # Aggiungi la riga alla lista
        if line == "interface Management0":
          management = True
        if management and "ip address" in line:
         management_ip = line
         management = False

    if management_ip is None:
            raise ValueError("Errore: Nessun IP di management trovato nel file di configurazione.")
    for neighbor in neighbor_lines:
        parts = neighbor.split(" ")
        neighbor_ip = parts[1]
        neighbor_asn = parts[3]
        commands.append(f"ip as-path access-list AS{neighbor_asn}-IN permit ^{neighbor_asn}_ any")
        commands.append(f"route-map RM-IN-{neighbor_asn} permit 10")
        commands.append(f"   match as-path AS{neighbor_asn}-IN")
        commands.append(f"exit")
        commands.append(f"router bgp 54000")
        commands.append(f"   neighbor {neighbor_ip} route-map RM-IN-{neighbor_asn} in")
        commands.append(f"   neighbor {neighbor_ip} route-map RM-OUT-INTERNET out")
        commands.append(f"exit")

    commands.append(f"router bgp 54000")
    commands.append(f"network 0.0.0.0/0")
    commands.append(f"exit")

     
    parts = management_ip.split(" ")
    ip = parts[2].split("/")
    router_mngt_ip = ip[0] 
    Helper.send_arista_commands(router_mngt_ip, commands)
    print("[DEBUG] router internet configurato")


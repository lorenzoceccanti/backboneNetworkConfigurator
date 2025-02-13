from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from jinja2 import Environment, FileSystemLoader
import json
import os
import sys
import crypt
import ipaddress
from jsonrpclib import Server
from dotenv import load_dotenv
from network_config import NetworkConfig, get_network_address

app = Flask(__name__, static_folder="out", static_url_path="")
CORS(app, resources={r"/*": {"origins": "*"}})

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "templates")
CONFIG_DIR = os.path.join(os.path.dirname(__file__), "config")
os.makedirs(CONFIG_DIR, exist_ok=True) # create the config directory if it doesn't exist
env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))

load_dotenv()

USERNAME = os.getenv("USERNAME")
PASSWORD = os.getenv("PASSWORD")

@app.route("/")
def serve_index():
    """ Sends the index.html file to the client """
    return send_from_directory("out", "index.html")

@app.route("/<path:path>")
def serve_static(path):
    """ Sends static files to the client, like CSS and JS files """
    return send_from_directory("out", path)

@app.route("/configure", methods=["POST"])
def configure():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON"}), 400

        try:
            NetworkConfig(**data)
            generate_containerlab_config(data["routers"], data["hosts"], data["project_name"])
            generate_arista_configs(data["routers"])

            return jsonify({"message": "Network deployed successfully"}), 200
        except Exception as e:
            print(e)
            sys.stdout.flush()
            return jsonify({"error ": "Validation error"}), 400
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/deploy", methods=["POST"])
def deploy():
    os.system(f"./deploy_network.sh")
    return jsonify({"message": "Network deployed successfully"}), 200


def convert_interfaces(routers, hosts):
    """ This function converts the interface's names to the format expected by containerlab 
        in the frontend the interfaces are named like "Ethernet0", but in the containerlab
        the interfaces are named like "eth0" """
    interfaces_map = {
        "Ethernet": "eth",
        "Loopback": "lo",
        "Vlan": "vlan",
        "Management": "mgmt"
    }

    for router in routers:
        for interface in router["interfaces"]:
            for key, value in interfaces_map.items():
                if key in interface["name"]:
                    interface["linux_name"] = interface["name"].replace(key, value)

                if key in interface["peer"]["interface"]:
                    interface["peer"]["linux_interface"] = interface["peer"]["interface"].replace(key, value)
                    break

    for host in hosts:
        for interface in host["interfaces"]:
            for key, value in interfaces_map.items():
                if key in interface["name"]:
                    interface["linux_name"] = interface["name"].replace(key, value)
                    break

def generate_links_from_routers(routers):
    """ Generates the links between the routers based on the 
        interfaces peer information, this function was created to avoid 
        duplicate links in the containerlab configuration """
    
    # a set doesn't allow duplicate elements, 
    # so we can use it to store the links
    links_set = set()
    for router in routers:
        for iface in router["interfaces"]:
            peer_name = iface["peer"]["name"] 
            peer_intf = iface["peer"].get("linux_interface", "") # Get peer interface, default to ""

            # check if the peer name and interface are not empty
            # (for example, the Loopback0 interface doesn't have a peer)
            if peer_name and peer_intf:
                endpoint1 = f"{router['name']}:{iface['linux_name']}"
                endpoint2 = f"{peer_name}:{peer_intf}"
                # to avoid duplicates like "router1:eth0" and "router2:eth0"
                # we sort the endpoints and add them to the set
                sorted_endpoints = tuple(sorted([endpoint1, endpoint2]))
                # if the link is already in the set, it won't be added
                links_set.add(sorted_endpoints)

    # convert the set to a list of dictionaries
    links_list = []
    for link_tuple in links_set:
        links_list.append({"endpoints": list(link_tuple)})

    return links_list
    
def generate_password_hash():
    """ Generates a password hash for the admin user
        The hash is in the format $6$salt$hash with the sha512 algorithm """
    password = "admin"
    salt = crypt.mksalt(crypt.METHOD_SHA512)
    hashed_password = crypt.crypt(password, salt)
    return hashed_password

def generate_containerlab_config(routers, hosts, project_name):
    """ Generates the containerlab configuration file and writes it in the ./config folder """
    # if any of the interfaces of the host has the dhcp enabled, then insert a field
    # named "dhcp_enabled" with the value "true" in the host dictionary
    for host in hosts:
        for interface in host["interfaces"]:
            if interface["dhcp"]:
                host["dhcp_enabled"] = True
                break
        else:
            host["dhcp_enabled"] = False
    
    # with this function we convert the interface names to the format expected by containerlab
    # for example, in the frontend the interfaces are named like "Ethernet0", but in the containerlab
    # the interfaces are named like "eth0"
    convert_interfaces(routers, hosts)

    links = generate_links_from_routers(routers)
    
    template = env.get_template("containerlab.j2")
    config_content = template.render(project_name=project_name, routers=routers, hosts=hosts, links=links)

    containerlab_file = os.path.join(CONFIG_DIR, "topology.clab.yml")
    with open(containerlab_file, "w") as f:
        f.write(config_content)


def generate_arista_configs(routers):
    """ Generates the Arista configuration files for each router and writes them in the ./config folder """
    template = env.get_template("arista_config.j2")
    files = []

    # generate the management IP addresses for each router 
    # also generate the network address for each interface
    ipv4_base = ipaddress.IPv4Address("172.20.20.2")
    ipv6_base = ipaddress.IPv6Address("3fff:172:20:20::2")
    for i, router in enumerate(routers):
        router["mngt_ipv4"] = f"{str(ipv4_base + i)}/24"
        router["mngt_ipv6"] = f"{str(ipv6_base + i)}/64"
        # also generate the network address for each interface that is used in ospf configuration
        for interface in router["interfaces"]:
            # for the ospf settings, we need to know the network address of the interface
            # but if that network address is on the same network as the neighbor, 
            # we don't need to add it, since it will be added in the neighbor's configuration
            for neighbor in router["neighbors"]:
                network_mask = interface["ip"].split("/")[1]
                neighbor_network = get_network_address(neighbor["ip"] + "/" + network_mask)
                interface_network = get_network_address(interface["ip"])

                if neighbor_network == interface_network:
                    # if the neighbor is on the same network as the interface, break the loop
                    break
            else:
                # if none of the neighbors are on the same network as the interface, add the network
                interface["network"] = interface_network
                print(f"Network: {interface['network']}")
    
        # generate the password hash for the admin user and add it to the json
        router["admin_password"] = generate_password_hash()

        config_content = template.render(router=router)
        file_path = os.path.join(CONFIG_DIR, f"{router['name']}.cfg")

        with open(file_path, "w") as f:
            f.write(config_content)

        files.append(file_path)

def send_arista_commands(mngt_ip, commands):
    """ Sends the commands to the Arista switch using the eAPI """
    if not mngt_ip:
        return {"error": "Management IP non specificato"}

    url = f"http://{USERNAME}:{PASSWORD}@{mngt_ip}/command-api"

    try:
        switch = Server(url)
        response = switch.runCmds(1, commands)
        return response
    except Exception as e:
        return {"error": str(e)}
    
@app.route('/transit', methods=['POST'])
def transit():
    """
    This endpoint is used to send the transit configuration to the Arista routers
    """
    data = request.get_json()

    if not data or "transit" not in data:
        return jsonify({"error": "Invalid JSON format"}), 400

    transits = data["transit"]
    
    for transit in transits:
        from_asn = transit["from"]["asn"]
        from_router = transit["from"]["router"]
        from_router_ip = transit["from"]["router_ip"]

        through_asn = transit["through"]["asn"]
        through_router = transit["through"]["router"]
        through_router_ips = transit["through"]["router_ip"]

        commands_from = [
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

        for through_router_ip in through_router_ips:
            if through_router_ip["asn"] == from_asn:
                commands_from.append(f"   neighbor {through_router_ip['router_ip']} remote-as {through_asn}")
                commands_from.append(f"   neighbor {through_router_ip['router_ip']} route-map RM-IN-{through_asn} in")
                commands_from.append(f"exit")

        mngt_ip_from = transit["from"]["mngt_ip"]
        response = send_arista_commands(mngt_ip_from, commands_from)
        print(response)
        # save on file the from router configuration
        with open(f"config/{from_router}_BGP.cfg", "w") as f:
            f.write("\n".join(commands_from))

        # BGP configuration of the TO routers
        for to in transit["to"]:
            if isinstance(to, dict):  # in this way we exclude the "Internet" field
                to_asn = to["asn"]
                to_router = to["router"]
                to_router_ip = to["router_ip"]

                commands_to = [
                    f"enable",
                    f"configure",
                    f"ip as-path access-list AS{through_asn}-IN permit ^{through_asn}_ any",
                    f"route-map RM-IN-{through_asn} permit 10",
                    f"   match as-path AS{through_asn}-IN",
                    f"exit",
                    f"route-map RM-IN-{through_asn} deny 99",
                    f"router bgp {to_asn}",
                    f"   bgp missing-policy direction in action deny",
                    f"   bgp missing-policy direction out action deny",
                ]

                for through_router_ip in through_router_ips:
                    if through_router_ip["asn"] == to_asn:
                        commands_to.append(f"   neighbor {through_router_ip['router_ip']} remote-as {through_asn}")
                        commands_to.append(f"   neighbor {through_router_ip['router_ip']} route-map RM-IN-{through_asn} in")
                        commands_to.append(f"exit")

                mngt_ip_to = to["mngt_ip"]
                response = send_arista_commands(mngt_ip_to, commands_to)
                print(response)
                # save on file the to router configuration
                with open(f"config/{to_router}_BGP.cfg", "w") as f:
                    f.write("\n".join(commands_to))

        commands_through = [
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
            f"   neighbor {from_router_ip} route-map RM-OUT-{to_asn} out",
            f"exit",
        ]

        for to in transit["to"]:
            if isinstance(to, dict):
                to_asn = to["asn"]
                to_router_ip = to["router_ip"]

                commands_through.append(f"ip as-path access-list AS{to_asn}-IN permit ^{to_asn}$ any")
                commands_through.append(f"ip as-path access-list AS{to_asn}-OUT permit ^{to_asn}$ any")
                commands_through.append(f"route-map RM-IN-{to_asn} permit 10")
                commands_through.append(f"   match as-path AS{to_asn}-IN")
                commands_through.append(f"exit")
                commands_through.append(f"route-map RM-IN-{to_asn} deny 99")
                commands_through.append(f"route-map RM-OUT-{to_asn} permit 10")
                commands_through.append(f"   match as-path AS{to_asn}-OUT")
                commands_through.append(f"exit")

                for through_router_ip in through_router_ips:
                    if through_router_ip["asn"] == to_asn:
                        commands_through.append(f"router bgp {through_asn}")
                        commands_through.append(f"   neighbor {to_router_ip} remote-as {to_asn}")
                        commands_through.append(f"   neighbor {to_router_ip} route-map RM-IN-{to_asn} in")
                        commands_through.append(f"   neighbor {to_router_ip} route-map RM-OUT-{from_asn} out")
                        commands_through.append(f"exit")
                        commands_through.append(f"route-map RM-OUT-{from_asn} permit 10")
                        commands_through.append(f"   match as-path AS{from_asn}-OUT")
                        commands_through.append(f"exit")
                        commands_through.append(f"route-map RM-OUT-{from_asn} deny 99")
        
        mngt_ip_through = transit["through"]["mngt_ip"]
        response = send_arista_commands(mngt_ip_through, commands_through)
        print(response)
        with open(f"config/{through_router}_BGP.cfg", "w") as f:
            f.write("\n".join(commands_through))

    return jsonify({"message": "Transit configuration initiated"}), 200
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

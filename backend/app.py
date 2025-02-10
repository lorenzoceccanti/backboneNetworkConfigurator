from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from jinja2 import Environment, FileSystemLoader
import json
import os
import sys
import hashlib
import secrets
import base64
import ipaddress
import subprocess
from network_config import NetworkConfig, get_network_address

app = Flask(__name__, static_folder="out", static_url_path="")
CORS(app, resources={r"/*": {"origins": "*"}})

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "templates")
CONFIG_DIR = os.path.join(os.path.dirname(__file__), "config")
os.makedirs(CONFIG_DIR, exist_ok=True) # create the config directory if it doesn't exist
env = Environment(loader=FileSystemLoader(TEMPLATE_DIR))

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
            generate_containerlab_config(data["routers"], data["hosts"])
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
    # os.system(f"cd config && sudo containerlab destroy && sudo containerlab deploy -t topology.clab.yml -d")
    # os.system("echo 'Deploying network' && sleep 10")
    subprocess.run(["cd", "config", "&&", "sudo", "containerlab", "deploy", "-t", "topology.clab.yml", "-d"], check=True)
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
    password = "admin".encode("utf-8")
    # generate a 16 bytes random salt to add to the password
    salt = base64.b64encode(secrets.token_bytes(16)).decode("utf-8").rstrip("=")[:16]

    hashed = hashlib.sha512((salt + password.decode()).encode()).digest()
    hash_b64 = base64.b64encode(hashed).decode("utf-8").rstrip("=")

    # return the hash in the format $6$salt$hash
    return f"$6${salt}${hash_b64}"

def generate_containerlab_config(routers, hosts):
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
    config_content = template.render(routers=routers, hosts=hosts, links=links)

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
        for interface in router["interfaces"]:
            interface["network"] = get_network_address(interface["ip"])
    
        # generate the password hash for the admin user and add it to the json
        router["admin_password"] = generate_password_hash()

        config_content = template.render(router=router)
        file_path = os.path.join(CONFIG_DIR, f"{router['name']}.cfg")

        with open(file_path, "w") as f:
            f.write(config_content)

        files.append(file_path)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

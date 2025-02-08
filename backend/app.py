from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from jinja2 import Environment, FileSystemLoader
import json
import os
import sys
from network_config import NetworkConfig, get_network_address

app = Flask(__name__, static_folder="out", static_url_path="")
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}) # http://localhost:5000

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
            validated_data = NetworkConfig(**data)
            generate_containerlab_config(data["routers"], data["hosts"])
            generate_arista_configs(data["routers"])

            # execute the command to auto deploy the network
            # os.system(f"sudo containerlab deploy -t ./config/topology.clab.yml")

            return jsonify({"message": "Network deployed successfully"}), 200
        except Exception as e:
            print(e)
            sys.stdout.flush()
            return jsonify({"error ": "Validation error"}), 400
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
    
    convert_interfaces(routers, hosts)

    template = env.get_template("containerlab.j2")
    config_content = template.render(routers=routers, hosts=hosts)

    containerlab_file = os.path.join(CONFIG_DIR, "topology.clab.yml")
    with open(containerlab_file, "w") as f:
        f.write(config_content)


def generate_arista_configs(routers):
    """ Generates the Arista configuration files for each router and writes them in the ./config folder """
    template = env.get_template("arista_config.j2")
    files = []

    # for each interface of each router, add to the json the network and than
    # create the config file
    for router in routers:
        for interface in router["interfaces"]:
            interface["network"] = get_network_address(interface["ip"])
    
        config_content = template.render(router=router)
        file_path = os.path.join(CONFIG_DIR, f"{router['name']}.cfg")

        with open(file_path, "w") as f:
            f.write(config_content)

        files.append(file_path)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

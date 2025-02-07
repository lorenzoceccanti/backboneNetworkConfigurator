from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from jinja2 import Environment, FileSystemLoader
import json
import os
import sys
from network_config import NetworkConfig, get_network_address

app = Flask(__name__, static_folder="out", static_url_path="")
CORS(app, resources={r"/*": {"origins": "http://localhost:5000"}}) # http://localhost:3000

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
        
        # print("Received Configuration:")
        # print(json.dumps(data, indent=4))
        # sys.stdout.flush()

        try:
            validated_data = NetworkConfig(**data)
            generate_containerlab_config(data["routers"])
            generate_arista_configs(data["routers"])
            sys.stdout.flush()

            return jsonify({"message": "Configuration received successfully"}), 200
        except Exception as e:
            return jsonify({"error ": "Validation error"}), 400
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def generate_containerlab_config(routers):
    """ Generates the containerlab configuration file and writes it to disk """
    template = env.get_template("containerlab.j2")
    config_content = template.render(routers=routers)

    containerlab_file = os.path.join(CONFIG_DIR, "topology.clab.yml")
    with open(containerlab_file, "w") as f:
        f.write(config_content)


def generate_arista_configs(routers):
    """ Generates the Arista configuration files for each router and writes them to disk """
    template = env.get_template("arista_config.j2")
    files = []

    for router in routers:
        # for each interface of the router, add to the json the network using get_interface_network of the NetworkConfig class

        for interface in router["interfaces"]:
            # modify router interface to include the network address
            interface["network"] = get_network_address(interface["ip"])
    
        print(router)
        sys.stdout.flush()
        config_content = template.render(router=router)
        file_path = os.path.join(CONFIG_DIR, f"{router['name']}.cfg")

        with open(file_path, "w") as f:
            f.write(config_content)

        files.append(file_path)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

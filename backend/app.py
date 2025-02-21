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
from transit import Transit
from announce import Announce
from stop_announce import StopAnnounce

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
    salt = crypt.mksalt(crypt.METHOD_SHA512)
    hashed_password = crypt.crypt(PASSWORD, salt)
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
        return {"error": "Management IP not specified"}

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
    try:
        for transit in transits:
            # this validates the JSON format
            Transit(**transit)
            from_asn = transit["from_"]["asn"]
            from_router = transit["from_"]["router"]
            from_router_ip = transit["from_"]["router_ip"]

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
                    commands_from.append(f"   neighbor {through_router_ip['my_router_ip']} remote-as {through_asn}")
                    commands_from.append(f"   neighbor {through_router_ip['my_router_ip']} route-map RM-IN-{through_asn} in")
                    commands_from.append(f"exit")

            mngt_ip_from = transit["from_"]["mngt_ip"]
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
                            commands_to.append(f"   neighbor {through_router_ip['my_router_ip']} remote-as {through_asn}")
                            commands_to.append(f"   neighbor {through_router_ip['my_router_ip']} route-map RM-IN-{through_asn} in")
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
    except Exception as e:
        print(e)
        return jsonify({"error ": "Validation error"}), 400

@app.route('/announce', methods=['POST'])
def announce():
    """
    This endpoint is used to send the announce configuration to the Arista routers
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid JSON format"}), 400
    # this validates the JSON format
    try:
        Announce(**data)

        router = data["router"]
        asn = data["asn"]
        mngt_ip = data["mngt_ip"]
        network_to_annouce = data["network_to_announce"]
        to_list = data["to"]

        commands = [
            f"enable",
            f"configure",
            f"route-map RM-OUT permit 10",
            f"   match ip address prefix-list {router}-NETWORKS",
            f"   exit",
            f"route-map RM-OUT deny 99",
            f"router bgp {asn}",
            f"   bgp missing-policy direction in action deny",
            f"   bgp missing-policy direction out action deny",
        ]

        # we neet to retreve from the router the sequence number of the prefix-list
        response = send_arista_commands(mngt_ip, [f"enable", f"configure", f"show running-config"])
        # the response is like this:
        # ip prefix-list R2-NETWORKS seq 10 permit 192.168.102.0/24
        # ip prefix-list R2-NETWORKS seq 20 permit 192.168.103.0/24
        # so we need to parse the response to get the last sequence number, in order to add the new network

        config_cmds = response[2].get("cmds", {})
        networks_prefixes = {key: value for key, value in config_cmds.items() if key.startswith(f"ip prefix-list {router}-NETWORKS")}
        if not networks_prefixes:
            print(f"No prefix-list for {router} networks found")
            send_arista_commands(mngt_ip, [f"enable", f"configure", f"ip prefix-list {router}-NETWORKS seq 10 permit {network_to_annouce}"])
        else:
            existing_networks = set()
            max_seq = 0

            for key in networks_prefixes:
                print(key)
                parts = key.split()
                # check for the correct format
                if len(parts) > 6:
                    seq_num = int(parts[4])
                    network = parts[6]
                    existing_networks.add(network)
                    max_seq = max(max_seq, seq_num)

            # check if the network is already in the prefix-lists
            if network_to_annouce in existing_networks:
                print(f"The network {network_to_annouce} has been already announced")
            else:
                new_seq = max_seq + 10
                print(f"Added new network {network_to_annouce} with seq {new_seq}")
                send_arista_commands(mngt_ip, [
                    f"enable",
                    f"configure",
                    f"ip prefix-list {router}-NETWORKS seq {new_seq} permit {network_to_annouce}"
                ])
    
        for to in to_list:
            his_router_ip = to["his_router_ip"]
            commands.append(f"   neighbor {his_router_ip} route-map RM-OUT out")

        commands.append(f"network {network_to_annouce}")

        response = send_arista_commands(mngt_ip, commands)
        print(response)
        # save on file the router configuration
        with open(f"config/{router}_ANNOUNCE.cfg", "w") as f:
            f.write("\n".join(commands))

        return jsonify({"message": "Announce configuration sent"}), 200
    except Exception as e:
        print(e)
        return jsonify({"error ": "Validation error"}), 400

@app.route('/stop-announce', methods=['POST'])
def stop_announce():
    """
    This endpoint is used to stop the announce configuration on the Arista routers
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid JSON format"}), 400

    try:
        # this validates the JSON format
        StopAnnounce(**data)
        router = data["router"]
        asn = data["asn"]
        mngt_ip = data["mngt_ip"]
        network_to_stop_announce = data["network_to_stop_announce"]

        commands = [
            f"enable",
            f"configure",
            f"router bgp {asn}",
            f"  no network {network_to_stop_announce}"
        ]

        # we need the sequence number of the prefix-list to remove the network
        response = send_arista_commands(mngt_ip, [f"enable", f"configure", f"show running-config"])

        config_cmds = response[2].get("cmds", {})
        networks_prefixes = {key: value for key, value in config_cmds.items() if key.startswith(f"ip prefix-list {router}-NETWORKS")}

        if not networks_prefixes:
            print(f"No prefix-list for {router} networks found")
        else:
            for key in networks_prefixes:
                print(key)
                parts = key.split()
                # check for the correct format
                if len(parts) > 6:
                    seq_num = int(parts[4])
                    network = parts[6]
                    if network_to_stop_announce == network:
                        send_arista_commands(mngt_ip, [f"enable", f"configure", f"no ip prefix-list {router}-NETWORKS seq {seq_num} permit {network_to_stop_announce}"])
                        break
            else:
                print("Network to stop announce not found")

        response = send_arista_commands(mngt_ip, commands)
        print(response)
        # save on file the router configuration
        with open(f"config/{router}_STOP_ANNOUNCE.cfg", "w") as f:
            f.write("\n".join(commands))

        return jsonify({"message": "Stop announce configuration sent"}), 200
    except Exception as e:
        print(e)
        return jsonify({"error ": "Validation error"}), 400

@app.route('/peering', methods=["POST"])
def peering():
    """Handler for configuring the rules on the Arista routers having
    a peering relationship among each other
    """
    data = request.get_json()
    if not data or "routerId" not in data or "asn" not in data or "router_ip" not in data or "mngt_ip" not in data or "peers" not in data:
        return jsonify({"error": "Invalid JSON format"}), 400
    
    routerId = data["routerId"]
    asn = data["asn"]
    router_ip = data["router_ip"]
    father_mngt_ip = data["mngt_ip"]
    cmd_father_peer = [
        f"enable",
        f"configure"
    ]
    list_peers = data["peers"]

    # Why a cycle? Because it could happen that an AS has multiple peering
    # relationship
    for peer in list_peers:
        # Checking fields inside list_peers
        if not peer or "routerId" not in peer or "asn" not in peer or "router_ip" not in peer or "mngt_ip" not in peer:
            return jsonify({"error": "Invalid JSON format"}), 400

        # Configuring the father peer first
        # Hypotesis: The rule neighbor <neighbour_ip> remote-as <neigh_as>
        # has already set with Jinja templating
        peer_routerId = peer["routerId"]
        peer_asn = peer["asn"]
        peer_router_ip = peer["router_ip"]
        son_man_ip = peer["mngt_ip"]
        # The extend is like the append, but it doesn't append as a list
        # but appends each single element as a string, as we want.
        cmd_father_peer.extend([
            f"ip as-path access-list AS{peer_asn}-IN permit ^{peer_asn}$ any",
            f"route-map RM-IN-{peer_asn} permit 10",
            f"  match as-path AS{peer_asn}-IN",
            f"exit",
            f"route-map RM-IN-{peer_asn} deny 99",
            f"router bgp {asn}",
            f"  neighbor {peer_router_ip} route-map RM-IN-{peer_asn} in",
            f"exit"
        ])

        # Configuring the peer
        cmd_son_peer = [
            f"enable",
            f"configure",
            f"ip as-path access-list AS{asn}-IN permit ^{asn}$ any",
            f"route-map RM-IN-{asn} permit 10",
            f"  match as-path AS{asn}-IN",
            f"exit",
            f"route-map RM-IN-{asn} deny 99",
            f"router bgp {peer_asn}",
            f"  neighbor {router_ip} route-map RM-IN-{asn} in",
            f"exit"
        ]

        # Invoking Arista eAPI
        response = send_arista_commands(son_man_ip, cmd_son_peer)
        print(response)
        # Only for testing purposes
        #with open(f"config/{peer_routerId}_peering.cfg", "w") as f:
        #    f.write("\n".join(cmd_son_peer))
    
    response = send_arista_commands(father_mngt_ip, cmd_father_peer)
    print(response)
    # Only for testing purposes
    #with open(f"config/{routerId}_peering.cfg", "w") as f:
    #        f.write("\n".join(cmd_father_peer))
    return jsonify({"message": "Peering successful"}), 200

@app.route('/local-preference', methods=['POST'])
def set_local_preference():
    """
    This endpoint set the Local Preference on a Arista router
    """
    data = request.get_json()
    
    # Check on  JSON file's field
    if not data or "asn" not in data or "router" not in data or "mngt_ip" not in data or "neighbor_ip" not in data or "local_pref" not in data:
        return jsonify({"error": "Invalid JSON format"}), 400

    try:

        asn = data["asn"]
        router = data["router"]
        mngt_ip = data["mngt_ip"]
        neighbor_ip = data["neighbor_ip"]
        local_pref = data["local_pref"]

        # commands to set Local Preference 
        commands = [
            "enable",
            "configure",
            f"route-map SET-LOCAL-PREF permit 10",
            f"   set local-preference {local_pref}",
            "exit",
            f"router bgp {asn}",
            f"   neighbor {neighbor_ip} route-map SET-LOCAL-PREF in",
            "exit"
        ]
        

        response = send_arista_commands(mngt_ip, commands)
        print(response)

        # for testing
        with open(f"config/{router}_LOCAL_PREF.cfg", "w") as f:
            f.write("\n".join(commands))

        return jsonify({"message": f"Local Preference set to {local_pref} on {router}"}), 200

    except Exception as e:
        print(e)
        return jsonify({"error": "Error configuring Local Preference"}), 500

@app.route('/redistribute-ospf', methods=["POST"])
def redistribute_ospf():
    """Handler for the RESTful API which deals with the enabling
    or disabling the redistribution of routes learned with OSPF
    via iBGP"""
    data = request.get_json()
    if not data or not "mngt_ip" in data or not "asn" in data or not "action" in data:
        return jsonify({"error": "Invalid JSON format"}), 400
    
    # We can stay sure that if we execute multiple time the same action,
    # the router will not add furher rules!
    # We don't need any check on the redistribute route to be already there or not
    mngt_ip = data["mngt_ip"]
    asn = data["asn"]
    action = data["action"]
    commands = [
        f"enable",
        f"configure",
        f"router bgp {asn}"
    ]
    if action == "yes":
        commands.append(f"   redistribute ospf")
    elif action == "no":
        commands.append(f"   no redistribute ospf")
    else:
        return jsonify({"error": "Invalid JSON format"}), 400
    
    commands.append(f"exit")
    responseText = f"OSPF Redistribution: {action}"

    response = send_arista_commands(mngt_ip, commands)
    print(response)
    # Only for testing purposes
    #with open(f"config/redistribute-ospf.cfg", "w") as f:
    #    f.write("\n".join(commands))
    return jsonify({"message": responseText}), 200

@app.route('/redistribute-bgp', methods=["POST"])
def redistribute_bgp():
    """Handler for the RESTful API POST /redistbgp which deals with
    enabling or disabling the redistribution of prefixes learned with BGP
    via OSPF"""
    data = request.get_json()
    if not data or not "mngt_ip" or not "action":
        return jsonify({"error": "Invalid JSON format"}), 400
    
    mngt_ip = data["mngt_ip"]
    action = data["action"]
    commands = [
        f"enable",
        f"configure",
        f"router ospf 1"
    ]
    if action == "yes":
        commands.append(f"   redistribute bgp")
    elif action == "no":
        commands.append(f"   no redistribute bgp")
    else:
        return jsonify({"error": "Invalid JSON format"}), 400
    
    commands.append(f"exit")
    responseText = f"BGP Redistribution: {action}"

    response = send_arista_commands(mngt_ip, commands)
    print(response)
    # Only for testing purposes
    #with open(f"config/redistribute-bgp.cfg", "w") as f:
    #    f.write("\n".join(commands))
    return jsonify({"message": responseText}), 200
    
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

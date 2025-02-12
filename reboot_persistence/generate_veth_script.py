#############################################################################
## Questo programma genera un file .sh per ripristinare le veth
## al riavvio della macchina senza dover rifare containerlab deploy da capo
## Si aspetta nella stessa cartella il file topology.clab.yml
# Ad ogni riavvio va rilanciato il file, perché gli identificatori dei 
# docker containers cambiano
#############################################################################
import yaml
import subprocess
import os

def retrieve_container_id_from_name(containerName):
    try:
        result = subprocess.check_output("docker inspect -f '{{.State.Pid}}' "+containerName, shell=True, text=True)
        return result[:-1]
    except subprocess.CalledProcessError as e:
        print("Error occoured in retrieving docker container id")

with open('topology.clab.yml', 'r') as file:
    data = yaml.load(file, Loader=yaml.FullLoader)

name = data['name']
list_links = data['topology']['links']
list_endpoints = []
for link in list_links:
    l_endpoint = link['endpoints'][0]
    r_endpoint = link['endpoints'][1]
    l_id, l_iface = l_endpoint.split(":", 1)
    r_id, r_iface = r_endpoint.split(":", 1)

    # Costrusici la lista degli endpoints da scorrere dopo
    endpoint_elem = {
        'left_name': l_id,
        'left_iface': l_iface,
        'right_name': r_id,
        'right_iface': r_iface,
        'left_containerName': "clab-"+name+"-"+l_id,
        'right_containerName': "clab-"+name+"-"+r_id
    }
    list_endpoints.append(endpoint_elem)

# Per eseguire il lease del DHCP per gli host che lo richiedono
subdata = data['topology']['nodes']
hosts_with_exec = []
for node, config in data.get("topology", {}).get("nodes", {}).items():
    if "exec" in config:
        elem = {'id': node, 'cmd': config['exec'][0]}
        hosts_with_exec.append(elem)

counter = 0
# Apertura del file in w-mode
f = open("docker_veth.sh", "w")
for endpoint in list_endpoints:
        left_containerName = endpoint['left_containerName']
        right_containerName = endpoint['right_containerName']
        left_iface = endpoint['left_iface']
        right_iface = endpoint['right_iface']

        
        f.write("sudo ip link add veth-"+str(counter)+"-l type veth peer name veth-"+str(counter)+"-r\n")
        left_containerCode = retrieve_container_id_from_name(left_containerName)
        right_containerCode = retrieve_container_id_from_name(right_containerName)
        f.write("sudo ip link set veth-"+str(counter)+"-l netns "+left_containerCode+"\n")
        f.write("sudo ip link set veth-"+str(counter)+"-r netns "+right_containerCode+"\n")
        f.write("docker exec -it "+left_containerName+" ip link set veth-"+str(counter)+"-l name "+left_iface+"\n")
        f.write("docker exec -it "+left_containerName+" ip link set "+left_iface+" up\n")
        f.write("docker exec -it "+right_containerName+" ip link set veth-"+str(counter)+"-r name "+right_iface+"\n")
        f.write("docker exec -it "+right_containerName+" ip link set "+right_iface+" up\n")

        counter = counter + 1

for elem in hosts_with_exec:
    f.write("docker exec -it clab-"+name+"-"+elem['id']+" "+elem['cmd']+"\n")
f.close()
os.chmod("docker_veth.sh", 0o777)
# ******************************************************
# THIS FILE AUTOMATES:
# - THE CREATION OF THE TOPOLOGY
# SPECIFIED BY THE config.clab.yml FILE
# - THE DHCP REQUEST TO THE DHCP SERVER RUNNING
# IN EACH HOST'S NETWORK IN ORDER TO GET A LEASE IP
# - THE CREATION OF THE RULES IN N1 AND N2'S ROUTING
# TABLES WHICH ARE NECESSARY TO REACH THE COUNTERPART
# IN THE SAME INTRA-AS DOMAIN.
# *****************************************************
cd dhcp # it's a parameter
sudo containerlab destroy
sudo containerlab deploy
docker exec -it clab-dhcp-n1 sh -c " # name of the container it's a parameter depends on .yml
	udhcpc -i eth1
	ip route add default via 192.168.100.1 dev eth1 #ip address depends on DHCP subnet ceos1
"
docker exec -it clab-dhcp-n2 sh -c " # name of the container it's a parameter depends on .yml
	udhcpc -i eth1
	ip route add default via 192.168.101.1 dev eth1 # ip address depends on DHCP subnet ceos2
" 

#!/bin/bash

if [ -z "$1" ]; then
    echo "Please provide the project_name"
    echo "Usage: $0 <project_name>"
    exit 1
fi

NOME_PROGETTO=$1
CONTAINER="clab-${NOME_PROGETTO}-R10"

# Definiamo una stringa multi-linea con tutti i comandi da eseguire.
# (<<EOF ... EOF) serve per fare una stringa multilinea in bash
COMMANDS=$(cat <<EOF
enable
configure
ip prefix-list NO_DEFAULT seq 5 deny 0.0.0.0/0
route-map REDISTRIBUTE_BGP_NO_DEFAULT permit 10
match ip address prefix-list NO_DEFAULT
exit
route-map REDISTRIBUTE_BGP_NO_DEFAULT deny 99
exit
router ospf 1
redistribute bgp route-map REDISTRIBUTE_BGP_NO_DEFAULT
exit
EOF
)

# Eseguiamo tutti i comandi in un'unica sessione nel container, evitando di uscire dopo ogni comando.
docker exec -i $CONTAINER Cli <<EOF
$COMMANDS
EOF

echo "Interrotta su R10 redistribuzione della default route"

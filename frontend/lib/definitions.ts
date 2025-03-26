export type DHCPConfig = {
  enabled: boolean;
  subnet: string;
  interface: string;
  range: [string, string];
};

export type RouterInterface = {
  name: string;
  ip: string;
  peer: {
    name: string;
    interface: string;
    linux_interface?: string;
    network?: string;
  }
};

export type InternetInterface = {
  enabled: boolean;
  name: string;
  ip: string;
}

export type Neighbor = {
  ip: string;
  asn: number;
};

export type RouterConfig = {
  name: string;
  asn: number;
  interfaces: RouterInterface[];
  neighbors: Neighbor[];
  dhcp?: DHCPConfig;
  mngt_ipv4?: string;
  internet_iface?: InternetInterface;
  redistribute_bgp: boolean;
};

export type HostInterface = {
  name: string;
  dhcp: boolean;
  ip?: string;
  linux_name?: string;
};

export type HostConfig = {
  name: string;
  interfaces: HostInterface[];
  gateway: string;
  dhcp_enabled?: boolean;
};

export type NetworkTopology = {
  routers: RouterConfig[];
  hosts: HostConfig[];
  project_name: string;
}

export type TransitConfig = {
  from: number;
  through: number;
  to: number[];
};

export type PeeringConfig = {
  fromAS: number;
  toAS: number
};

export type LocalPreferenceConfig = {
  asn: number; 
  neighbor_router: string;
  local_preference: number;
  network_ip: string;
}

export type AnnounceConfig = {
  router: string;
  network_ip: string;
  to: number[];
}

export type StopAnnounceConfig = {
  router: string;
  network_ip: string;
}

export type TransitConfigBody = {
  from_: {
    asn: number;
    router: string;
    router_ip: string;
    mngt_ip: string;
  },
  through: {
    asn: number;
    router: string;
    mngt_ip: string;
    router_ip: ({
        asn: number;
        my_router_ip: string;
    } | string)[];
  },
  to: ({
    asn: number;
    router: string;
    router_ip: string;
    mngt_ip: string;
  } | string)[],
}

export type PeeringConfigBody = {
  asn: number;
  router_ip: string;
  mngt_ip: string;
  peer: {
    asn: number;
    router_ip: string;
    mngt_ip: string
  }
}

export type LocalPreferenceConfigBody = {
  asn: number;
  router: string;
  mngt_ip: string;
  neighbor_ip: string;
  local_preference: number;
  network: string;
}

export type AnnounceToConfigBody = {
  asn: number;
  his_router_ip: string;
}

export type AnnounceConfigBody = {
  router: string;
  asn: number;
  mngt_ip: string;
  network_to_announce: string;
  to: AnnounceToConfigBody[]
}

export type StopAnnounceConfigBody = {
  router: string;
  asn: number;
  mngt_ip: string;
  network_to_stop_announce: string;
}


export type RouterInterfaceResponse = {
  ip: string,
  name: string,
}

export type RouterNeighborResponse = {
  asn: number,
  ip: string,
}

export type RouterResponse = {
  name: string;
  asn: number;
  interfaces: RouterInterfaceResponse[];
  neighbors: RouterNeighborResponse[];
  subnetworks: string[];
  redistribute_bgp: boolean;
  mngt_ipv4?: string;
}

export type NetworkTopologyResponse = {
  links: [string, string][];
  routers: RouterResponse[];
}

export type NodeData = {
  id: number;
  label: string;
  shape: string;
  image?: string;
}

export type EdgeData = {
  id?: string | number;
  from: number;
  to: number;
}

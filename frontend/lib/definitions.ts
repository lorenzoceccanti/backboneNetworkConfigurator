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
    router_ip: {
        asn: number;
        my_router_ip: string;
    }[];
  },
  to: {
    asn: number;
    router: string;
    router_ip: string;
    mngt_ip: string;
  }
}

export type RouterInterfaceResponse = {
  ip: string,
  name: string,
}

export type RouterResponse = {
  name: string;
  asn: number;
  interfaces: RouterInterfaceResponse[];
  mngt_ipv4?: string;
}

export type NetworkTopologyResponse = {
  links: [string, string][];
  routers: RouterResponse[];
}

// import { z } from "zod";

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

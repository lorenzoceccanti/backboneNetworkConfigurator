import { z } from "zod";

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
  }
};

export type Neighbor = {
  ip: string;
  asNumber: number;
};

export type RouterConfig = {
  routerName: string;
  asNumber: number;
  interfaces: RouterInterface[];
  neighbors: Neighbor[];
  dhcp?: DHCPConfig;
};

export type HostInterface = {
  name: string;
  dhcp: boolean;
  ip?: string;
};

export type HostConfig = {
  hostName: string;
  interfaces: HostInterface[];
  gateway: string;
};

export const ipWithMaskSchema = z.string().regex(
  /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\/([0-9]|[12][0-9]|3[0-2])$/,
  "Invalid IP format (must be CIDR e.g., 192.168.1.1/24)"
);

export const ipSchema = z.string().regex(
  /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/,
  "Invalid IP format (e.g., 192.168.1.1)"
);
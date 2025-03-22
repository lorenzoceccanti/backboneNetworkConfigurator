import { RouterConfig, HostConfig } from "@/lib/definitions";

export const initialMainConfig = {
  number_of_routers: 0,
  number_of_hosts: 0,
  server_ip: "127.0.0.1",
  project_name: "test01"
}

export const initialRouterConfig: RouterConfig = {
  name: "R1",
  asn: 55001,
  interfaces: [
    {
      name: "Loopback0",
      ip: "1.1.1.1/32",
      peer: {
        name: "",
        interface: "",
      },
    },
    {
      name: "Ethernet1",
      ip: "192.168.100.1/24",
      peer: {
        name: "h1",
        interface: "Ethernet1",
      },
    },
  ],
  neighbors: [
    {
      ip: "192.168.200.1",
      asn: 55002,
    }
  ],
  dhcp: {
    enabled: true,
    subnet: "192.168.100.0/24",
    interface: "Ethernet1",
    range: ["192.168.100.10", "192.168.100.99"]
  },
  internet_iface: undefined,
  redistribute_bgp: false
};

export const initialHostConfig: HostConfig = {
  name: "H1",
  interfaces: [
    {
      name: "Ethernet1",
      dhcp: true,
    }
  ],
  gateway: "",
};
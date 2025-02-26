import { RouterConfig, HostConfig } from "@/lib/definitions";

export const initialRouterConfig: RouterConfig = {
  name: "r1",
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
  }
};

export const initialHostConfig: HostConfig = {
  name: "h1",
  interfaces: [
    {
      name: "Ethernet1",
      dhcp: true,
    }
  ],
  gateway: "",
};
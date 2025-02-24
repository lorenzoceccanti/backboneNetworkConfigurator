"use client";

import { RouterConfig, HostConfig, TransitConfig } from "@/lib/definitions";
import { NetworkTopology } from "@/lib/NetworkTopology";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import RouterConfiguration from "./RouterConfiguration";
import HostConfiguration from "./HostConfiguration";
import { Spinner } from "./Spinner";
import TransitConfiguration from "./TransitConfiguration";
import ip from "ip";

const formSchema = z.object({
  number_of_routers: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().gte(1).lte(10)
  ),
  number_of_hosts: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().gte(1).lte(10)
  ),
  server_ip: z.string().nonempty("Server IP is required").ip("Invalid IP address"),
  project_name: z.string().nonempty("Project name is required"),
});

export default function MainConfiguration() {
  const [routerConfigs, setRouterConfigs] = useState<RouterConfig[]>([]);
  const [hostConfigs, setHostConfigs] = useState<HostConfig[]>([]);
  const [transitConfigs, setTransitConfigs] = useState<TransitConfig>();
  const [expandedItem, setExpandedItem] = useState<string | undefined>(undefined);
  const [serverIp, setServerIp] = useState<string | undefined>(undefined);
  const [isConfigGenerated, setIsConfigGenerated] = useState<boolean>(false);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [networkTopology, setNetworkTopology] = useState<NetworkTopology | null>(null);


  const { toast } = useToast()

  const handleRouterConfigChange = (index: number, config: RouterConfig) => {
    const newRouterConfigs = [...routerConfigs];
    newRouterConfigs[index] = config;
    setRouterConfigs(newRouterConfigs);
  };

  const handleHostConfigChange = (index: number, config: HostConfig) => {
    const newHostConfigs = [...hostConfigs];
    newHostConfigs[index] = config;
    setHostConfigs(newHostConfigs);
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      number_of_routers: 0,
      number_of_hosts: 0,
      server_ip: "127.0.0.1",
      project_name: "test01",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setServerIp(values.server_ip);
    setRouterConfigs(
      Array(values.number_of_routers).fill({
        routerName: "r1",
        asNumber: 10,
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
            asNumber: 20,
          }
        ],
        dhcp: {
          enabled: true,
          subnet: "192.168.100.0/24",
          interface: "Ethernet1",
          range: ["192.168.100.10", "192.168.100.99"]
        }
      })
    );
    setHostConfigs(
      Array(values.number_of_hosts).fill({
        hostName: "h1",
        interfaces: [
          {
            name: "Ethernet1",
            dhcp: true,
          }
        ],
        gateway: "",
      })
    );
  }

  const handleGenerateConfiguration = async (routerConfigs: RouterConfig[], hostConfigs: HostConfig[]) => {
    const formattedConfig = {
      project_name: form.getValues("project_name"),
      routers: routerConfigs.map((router) => ({
        name: router.routerName,
        asn: router.asNumber,
        interfaces: router.interfaces.map((iface) => ({
          name: iface.name,
          ip: iface.ip,
          peer: {
            name: iface.peer.name,
            interface: iface.peer.interface,
          }
        })),
        neighbors: router.neighbors.map((neighbor) => ({
          ip: neighbor.ip,
          asn: neighbor.asNumber,
        })),
        ...(router.dhcp && { dhcp: router.dhcp }),
      })),
      hosts: hostConfigs.map((host) => ({
        name: host.hostName,
        interfaces: host.interfaces.map((iface) => ({
          name: iface.name,
          dhcp: iface.dhcp,
          ...(iface.dhcp ? {} : { ip: iface.ip }),
        })),
        gateway: host.gateway,
      })),
    };

    console.log(JSON.stringify(formattedConfig))

    try {
      const configApi = "http://" + serverIp + ":5000/configure"
      const response = await fetch(configApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedConfig),
      });
  
      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your request: " + response.statusText,
        })
        setIsConfigGenerated(false);
        throw new Error(`Error on request: ${response.statusText}`);
      }
      const data: NetworkTopology = await response.json();
      setNetworkTopology(data); 
  
      toast({
        variant: "default",
        title: "Configuration generated!",
        description: "The configuration has been generated successfully.",
      })
      setIsConfigGenerated(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request: " + error,
      })
      setIsConfigGenerated(false);
    }
  };

  const handleDeployNetwork = async () => {
    setIsDeploying(true);
    try {
      /*const deployApi = "http://" + serverIp + ":5000/deploy"
      const response = await fetch(deployApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });*/
      const response = { ok: true } // for testing purposes
  
      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your request: " + response.statusText,
        })
        throw new Error(`Error on request: ${response.statusText}`);
      }
  
      toast({
        variant: "default",
        title: "Network deployed!",
        description: "The network has been deployed successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request: " + error,
      })
    } finally {
      setIsDeploying(false);
      // once the network is deployed, show the transit configuration
      setTransitConfigs({
        from: 0,
        through: 0,
        to: [0],
      });
    }
  }

  const getAvailableASOptions = () => {
    if (!networkTopology) return [];

    // the set is used to remove duplicates
    return Array.from(new Set(networkTopology.routers.map(router => router.asn)));
  };

  const handleTransitConfigsChange = (newConfig: TransitConfig) => {
    setTransitConfigs(newConfig);
  };

  const handleTransitConfigsSend = async () => {
    if (!networkTopology || !transitConfigs) return;
  
    // find the from and the through routers configurations
    const fromRouter = networkTopology.routers.find(router => router.asn === transitConfigs.from);
    const throughRouter = networkTopology.routers.find(router => router.asn === transitConfigs.through);
    if (!fromRouter || !throughRouter) {
      console.error("Router not found in network topology.");
      return;
    }
  
    // utility function to check if two IPs are in the same subnet
    const isSameSubnet = (ip1: string, ip2: string, cidr: string): boolean => {
      if (cidr === "32") return false;
      const subnetMask = ip.cidrSubnet(`${ip1}/${cidr}`).subnetMask;
      return ip.subnet(ip1, subnetMask).contains(ip2);
    };
  
    // find the connection between the from and the through routers
    let fromRouterInterface;
    let throughRouterInterfaceConnectedToFrom;
    for (const ifaceFrom of fromRouter.interfaces) {
  
      for (const ifaceThrough of throughRouter.interfaces) {
        if (!ifaceFrom.ip || !ifaceThrough.ip) continue;
  
        const [fromIp, fromCidr] = ifaceFrom.ip.split("/");
        const [throughIp, throughCidr] = ifaceThrough.ip.split("/");
        if (!fromCidr || !throughCidr) continue;
        // if the IPs are in the same subnet, we found the connection
        if (isSameSubnet(fromIp, throughIp, fromCidr)) {
          fromRouterInterface = ifaceFrom;
          throughRouterInterfaceConnectedToFrom = ifaceThrough;
          break;
        }
      }
      if (fromRouterInterface && throughRouterInterfaceConnectedToFrom) break;
    }
  
    if (!fromRouterInterface || !throughRouterInterfaceConnectedToFrom) {
      console.error("No valid connection found between from and through routers.");
      return;
    }
  
    // find the connections between the through and the to routers
    const throughRouterIPs = [];
    const toRoutersData = [];
  
    for (const toASN of transitConfigs.to) {
      // find the to router configuration
      const toRouter = networkTopology.routers.find(router => router.asn === toASN);
      if (!toRouter) continue;
  
      let toRouterInterfaceConnectedToThrough;
  
      for (const ifaceThrough of throughRouter.interfaces) {
        for (const ifaceTo of toRouter.interfaces) {
          if (!ifaceThrough.ip || !ifaceTo.ip) continue;
  
          const [throughIp, throughCidr] = ifaceThrough.ip.split("/");
          const [toIp, toCidr] = ifaceTo.ip.split("/");
          if (!throughCidr || !toCidr) continue;
  
          // if the IPs are in the same subnet, we found the connection
          if (isSameSubnet(throughIp, toIp, throughCidr)) {
            // add the connection to the through router
            throughRouterIPs.push({
              asn: toRouter.asn,
              my_router_ip: ifaceThrough.ip.split("/")[0],
            });
            toRouterInterfaceConnectedToThrough = ifaceTo;
          }
        }
      }
      // if the to router is not connected to the through router, skip it
      // otherwise, add the to router data
      if (toRouterInterfaceConnectedToThrough) {
        toRoutersData.push({
          asn: toRouter.asn,
          router: toRouter.name,
          router_ip: toRouterInterfaceConnectedToThrough.ip.split("/")[0],
          mngt_ip: toRouter.mngt_ipv4.split("/")[0],
        });
      }
    }
  
    const formattedConfig = {
      transit: [
        {
          from_: {
            asn: transitConfigs.from,
            router: fromRouter.name,
            router_ip: fromRouterInterface.ip.split("/")[0],
            mngt_ip: fromRouter.mngt_ipv4.split("/")[0],
          },
          through: {
            asn: transitConfigs.through,
            router: throughRouter.name,
            mngt_ip: throughRouter.mngt_ipv4.split("/")[0],
            router_ip: [
              {
                asn: fromRouter.asn,
                my_router_ip: throughRouterInterfaceConnectedToFrom.ip.split("/")[0],
              },
              ...throughRouterIPs,
            ],
          },
          to: toRoutersData,
        },
      ],
    };
  
    console.log(formattedConfig);
    try {
      const transitApi = "http://" + serverIp + ":5000/transit"
      const response = await fetch(transitApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedConfig),
      });
  
      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your request: " + response.statusText,
        })
        throw new Error(`Error on request: ${response.statusText}`);
      }
  
      toast({
        variant: "default",
        title: "Transit configuration sent!",
        description: "The transit configuration has been sent successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request: " + error,
      })
    } finally {
      // setIsDeploying(false);
    }
  };
  
  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5 w-fit mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="number_of_routers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How many routers?</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={10} className="w-full" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="number_of_hosts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How many hosts?</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={10} className="w-full" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="server_ip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is the server IP?</FormLabel>
                  <FormControl>
                    <Input type="text" className="w-full" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="project_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is the name of the project?</FormLabel>
                  <FormControl>
                    <Input type="text" className="w-full" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="mx-auto w-full">Submit</Button>
        </form>
      </Form>

      <div className="space-y-4 max-w-5xl lg:mx-auto my-10 mx-10">
        <Accordion
          type="single"
          collapsible
          value={expandedItem}
          onValueChange={setExpandedItem}
        >
          {routerConfigs.map((config, index) => (
            <AccordionItem key={index} value={`item-${index + 1}`}>
              <AccordionTrigger>Router {index + 1}</AccordionTrigger>
              <AccordionContent>
                <RouterConfiguration
                  initialValues={config}
                  onChange={(updatedConfig) =>
                    handleRouterConfigChange(index, updatedConfig)
                  }
                />
              </AccordionContent>
            </AccordionItem>
          ))}
          {hostConfigs.map((config, index) => (
              <AccordionItem key={index} value={`item-${routerConfigs.length + index + 1}`}>
                <AccordionTrigger>Host {index + 1}</AccordionTrigger>
                <AccordionContent>
                  <HostConfiguration
                    initialValues={config}
                    onChange={(updatedConfig) =>
                      handleHostConfigChange(index, updatedConfig)
                    }
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
        </Accordion>
          {routerConfigs.length > 0 && 
          hostConfigs.length > 0 && 
          routerConfigs.every(config => 
            config.routerName && 
            config.asNumber && 
            config.interfaces.length > 0 && 
            config.neighbors.length > 0 &&
            config.interfaces.every(iface => iface.name && iface.ip && iface.peer) &&
            config.neighbors.every(neighbor => neighbor.ip && neighbor.asNumber)
          ) && 
          hostConfigs.every(config =>
            config.hostName &&
            config.interfaces.length > 0 &&
            config.interfaces.every(iface => iface.name && (iface.dhcp || iface.ip)) &&
            // if none of the interfaces have dhcp enabled, then gateway is required
            (config.interfaces.some(iface => iface.dhcp) || config.gateway)
          ) && (
            <div className="sm:space-x-3">
              <Button className="w-fit my-4" onClick={() => handleGenerateConfiguration(routerConfigs, hostConfigs)}>
                Generate Configuration
              </Button>
              <Button disabled={!isConfigGenerated} className="w-fit my-4" onClick={() => handleDeployNetwork()}>
                Deploy Network {isDeploying ? <Spinner /> : ""}
              </Button>
            </div>
          )}
          {transitConfigs && (
            <div>
              <TransitConfiguration
                initialValues={transitConfigs}
                availableASOptions={getAvailableASOptions()}
                onChange={handleTransitConfigsChange}
              />
              <Button className="w-fit" onClick={handleTransitConfigsSend}>
                Send Transit Configuration
              </Button>
            </div>
          )}
        </div>
    </>
  );
}

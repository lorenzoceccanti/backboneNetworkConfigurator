import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RouterConfig, HostConfig, TransitConfig, NetworkTopology } from "@/lib/definitions";
import { initialMainConfig, initialRouterConfig, initialHostConfig } from "@/lib/default-values";
import { sendConfiguration, deployNetwork } from "@/lib/api";
import { mainConfigurationFormSchema } from "@/lib/validations";
import { useToast } from "@/hooks/use-toast";
import ip from "ip";

export function useMainConfig() {
  const [routerConfigs, setRouterConfigs] = useState<RouterConfig[]>([]);
  const [hostConfigs, setHostConfigs] = useState<HostConfig[]>([]);
  const [transitConfigs, setTransitConfigs] = useState<TransitConfig>();
  const [networkTopology, setNetworkTopology] = useState<NetworkTopology | null>(null);
  const [serverIp, setServerIp] = useState<string | undefined>(undefined);
  const [isConfigGenerated, setIsConfigGenerated] = useState<boolean>(false);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof mainConfigurationFormSchema>>({
    resolver: zodResolver(mainConfigurationFormSchema),
    defaultValues: initialMainConfig,
  });

  function onSubmit(values: z.infer<typeof mainConfigurationFormSchema>) {
    setServerIp(values.server_ip);
    setRouterConfigs(
      Array(values.number_of_routers).fill({ ...initialRouterConfig })
    );
    setHostConfigs(
      Array(values.number_of_hosts).fill({ ...initialHostConfig })
    );
  }

  const updateRouterConfig = (index: number, config: RouterConfig) => {
    setRouterConfigs((prev) => {
      const newConfigs = [...prev];
      newConfigs[index] = config;
      return newConfigs;
    });
  };

  const updateHostConfig = (index: number, config: HostConfig) => {
    setHostConfigs((prev) => {
      const newConfigs = [...prev];
      newConfigs[index] = config;
      return newConfigs;
    });
  };

  const handleGenerateConfiguration = async (routerConfigs: RouterConfig[], hostConfigs: HostConfig[]) => {
    const body: NetworkTopology = {
      project_name: form.getValues("project_name"),
      routers: routerConfigs,
      hosts: hostConfigs,
    };

    if (!serverIp) {
      console.error("Server IP is not set.");
      return;
    }

    try {
      const data = await sendConfiguration(body, serverIp);
      setNetworkTopology(data);
      toast({
        variant: "default",
        title: "Configuration generated!",
        description: "The configuration has been generated successfully.",
      })
      setIsConfigGenerated(true);
    } catch (error) {
      console.error("Error:", error);
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

    if (!serverIp) {
      console.error("Server IP is not set.");
      return;
    }

    try {
      await deployNetwork(serverIp);
      toast({
        variant: "default",
        title: "Network deployed!",
        description: "The network has been deployed successfully.",
      });
      setTransitConfigs({
        from: 0,
        through: 0,
        to: [0],
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request: " + error,
      })
    } finally {
      setIsDeploying(false);
    }
  };

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
          mngt_ip: toRouter.mngt_ipv4!.split("/")[0],
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
            mngt_ip: fromRouter.mngt_ipv4!.split("/")[0],
          },
          through: {
            asn: transitConfigs.through,
            router: throughRouter.name,
            mngt_ip: throughRouter.mngt_ipv4!.split("/")[0],
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

  return {
    form, 
    onSubmit,
    routerConfigs, 
    updateRouterConfig,
    hostConfigs, 
    updateHostConfig,
    transitConfigs, 
    isConfigGenerated,
    isDeploying,
    handleGenerateConfiguration,
    handleDeployNetwork,
    handleTransitConfigsChange,
    getAvailableASOptions,
    handleTransitConfigsSend,
  };
}
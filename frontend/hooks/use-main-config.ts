import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RouterConfig, HostConfig, TransitConfig, NetworkTopology, NetworkTopologyResponse, RouterResponse, TransitConfigBody } from "@/lib/definitions";
import { initialMainConfig, initialRouterConfig, initialHostConfig } from "@/lib/default-values";
import { sendConfiguration, deployNetwork, sendTransitConfiguration } from "@/lib/api";
import { mainConfigurationFormSchema } from "@/lib/validations";
import { useToast } from "@/hooks/use-toast";

export function useMainConfig() {
  const [routerConfigs, setRouterConfigs] = useState<RouterConfig[]>([]);
  const [hostConfigs, setHostConfigs] = useState<HostConfig[]>([]);
  const [transitConfigs, setTransitConfigs] = useState<TransitConfig>();
  const [networkTopologyResponse, setNetworkTopologyResponse] = useState<NetworkTopologyResponse | null>(null);
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
      setNetworkTopologyResponse(data);
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

  const getNetworkTopologyResponse = () => networkTopologyResponse;

  const getAvailableASOptions = () => {
    if (!networkTopologyResponse) return [];

    // the set is used to remove duplicates
    return Array.from(new Set(networkTopologyResponse.routers.map(router => router.asn)));
  };

  const handleTransitConfigsChange = (newConfig: TransitConfig) => {
    setTransitConfigs(newConfig);
  };

  const getRoutersByASN = (networkTopologyResponse: NetworkTopologyResponse, asn: number): RouterResponse[] =>
    networkTopologyResponse.routers.filter(router => router.asn === asn);

  const getRoutersByASNs = (networkTopologyResponse: NetworkTopologyResponse, asns: number[]): RouterResponse[] =>
    networkTopologyResponse.routers.filter(router => asns.includes(router.asn));

  const findLinksBetweenRouters = (networkTopologyResponse: NetworkTopologyResponse, routersA: RouterResponse[], routersB: RouterResponse[]): [string, string][] => {
    return networkTopologyResponse.links.filter(([link1, link2]) =>
      routersA.some(routerA => link1.split(":")[0] === routerA.name || link2.split(":")[0] === routerA.name) &&
      routersB.some(routerB => link1.split(":")[0] === routerB.name || link2.split(":")[0] === routerB.name)
    );
  };

  const findConnectedRouter = (routers: RouterResponse[], links: [string, string][]): RouterResponse => {
    const connections = routers.find(router => links.some(([link1, link2]) =>
      link1.split(":")[0] === router.name || link2.split(":")[0] === router.name)
    );
    if (connections) return connections;
    console.error("Router not found.");
    return routers[0]; // TODO fix this
  };

  const findThroughToLinks = (networkTopologyResponse: NetworkTopologyResponse, throughRouters: RouterResponse[], toRouters: RouterResponse[]): ([string, string])[] => {
    return toRouters.map(toRouter => {
      const link = networkTopologyResponse.links.find(([link1, link2]) =>
        throughRouters.some(throughRouter =>
          (link1.split(":")[0] === throughRouter.name && link2.split(":")[0] === toRouter.name) ||
          (link1.split(":")[0] === toRouter.name && link2.split(":")[0] === throughRouter.name)
        )
      );
      if (!link) {
        console.error("Through-To link not found.");
        return ["", ""];
      }
      return link;
    });
  };

  const getConnectedInterface = (router: RouterResponse, links: [string, string][]): string | null => {
    const link = links.find(([link1, link2]) =>
      link1.split(":")[0] === router.name || link2.split(":")[0] === router.name
    );
    return link ? (link[0].split(":")[0] === router.name ? link[0].split(":")[1] : link[1].split(":")[1]) : null;
  };

  const buildThroughRouterIps = (
    throughRouter: RouterResponse,
    throughToLinks: ([string, string])[],
    toRouters: RouterResponse[],
    fromRouter: RouterResponse,
    throughInterfaceConnectedToFrom: string | null
  ): { asn: number; my_router_ip: string }[] => {
    const ips = throughToLinks.map(link => {
      if (!link) return console.error("Link not found.");
      const [link1, link2] = link;
      const toRouter = toRouters.find(router => router.name === link2.split(":")[0] || router.name === link1.split(":")[0]);
      if (!toRouter) return console.error("To router not found.");
      const throughRouterInterfaceConnectedToTo = link1.split(":")[0] === throughRouter.name ? link1.split(":")[1] : link2.split(":")[1];
      return {
        asn: toRouter.asn,
        my_router_ip: throughRouter.interfaces.find(int => int.name === throughRouterInterfaceConnectedToTo)?.ip.split("/")[0]
      };
    }).filter(Boolean) as { asn: number; my_router_ip: string }[];

    ips.unshift({
      asn: fromRouter.asn,
      my_router_ip: throughRouter.interfaces.find(int => int.name === throughInterfaceConnectedToFrom)?.ip.split("/")[0] || ""
    });

    return ips;
  };

  const buildToArray = (throughRouter: RouterResponse, throughToLinks: ([string, string])[], toRouters: RouterResponse[]): { asn: number; router: string; router_ip: string; mngt_ip: string }[] => {
    return toRouters.map(toRouter => {
      const link = throughToLinks.find(link => {
        if (!link) return false;
        const [link1, link2] = link;
        return link1.split(":")[0] === toRouter.name || link2.split(":")[0] === toRouter.name;
      });
      if (!link) {
        console.error("Link not found.");
        return null;
      }
      const [link1, link2] = link;
      const toInterfaceConnectedToThrough = link1.split(":")[0] === toRouter.name ? link1.split(":")[1] : link2.split(":")[1];
      return {
        asn: toRouter.asn,
        router: toRouter.name,
        router_ip: toRouter.interfaces.find(int => int.name === toInterfaceConnectedToThrough)?.ip.split("/")[0],
        mngt_ip: toRouter.mngt_ipv4?.split("/")[0]
      };
    }).filter((item): item is { asn: number; router: string; router_ip: string; mngt_ip: string } => item !== null);
  };

  const buildRequestBody = (
    fromRouter: RouterResponse,
    throughRouter: RouterResponse,
    throughRouterIps: { asn: number; my_router_ip: string }[],
    to: { asn: number; router: string; router_ip: string; mngt_ip: string }[],
    fromInterfaceConnectedToThrough: string | null
  ): TransitConfigBody => {
    const from_ip = fromRouter.interfaces.find(int => int.name === fromInterfaceConnectedToThrough)?.ip.split("/")[0] ?? "";
    const from_mngt = fromRouter.mngt_ipv4?.split("/")[0] ?? "";
    const through_mngt = throughRouter.mngt_ipv4?.split("/")[0] ?? "";
  
    const cleanedThroughRouterIps = throughRouterIps.map(ip => ({
      asn: ip.asn,
      my_router_ip: ip.my_router_ip ?? ""
    }));
  
    const toObj = to.length > 0 ? {
      asn: to[0].asn,
      router: to[0].router,
      router_ip: to[0].router_ip ?? "",
      mngt_ip: to[0].mngt_ip ?? ""
    } : {
      asn: 0,
      router: "",
      router_ip: "",
      mngt_ip: ""
    };
  
    return {
      from_: {
        asn: fromRouter.asn,
        router: fromRouter.name,
        router_ip: from_ip,
        mngt_ip: from_mngt,
      },
      through: {
        asn: throughRouter.asn,
        router: throughRouter.name,
        mngt_ip: through_mngt,
        router_ip: cleanedThroughRouterIps,
      },
      to: toObj
    };
  };

  const handleTransitConfigsSend = async () => {
    if (!networkTopologyResponse || !transitConfigs) return;

    const fromRouters = getRoutersByASN(networkTopologyResponse, transitConfigs.from);
    if (!fromRouters.length) return console.error("From router not found.");

    const throughRouters = getRoutersByASN(networkTopologyResponse, transitConfigs.through);
    if (!throughRouters.length) return console.error("Through router not found.");

    const toRouters = getRoutersByASNs(networkTopologyResponse, transitConfigs.to);
    if (!toRouters.length) return console.error("To routers not found.");

    const fromThroughLinks = findLinksBetweenRouters(networkTopologyResponse, fromRouters, throughRouters);
    if (!fromThroughLinks.length) return console.error("From-Through link not found.");

    const fromRouter = findConnectedRouter(fromRouters, fromThroughLinks);
    if (!fromRouter) return console.error("From router not found.");

    const throughRouter = findConnectedRouter(throughRouters, fromThroughLinks);
    if (!throughRouter) return console.error("Through router not found.");

    const throughToLinks = findThroughToLinks(networkTopologyResponse, throughRouters, toRouters);
    
    const fromInterfaceConnectedToThrough = getConnectedInterface(fromRouter, fromThroughLinks);
    const throughInterfaceConnectedToFrom = getConnectedInterface(throughRouter, fromThroughLinks);

    const throughRouterIps = buildThroughRouterIps(throughRouter, throughToLinks, toRouters, fromRouter, throughInterfaceConnectedToFrom);

    const to = buildToArray(throughRouter, throughToLinks, toRouters);

    const body: TransitConfigBody = buildRequestBody(fromRouter, throughRouter, throughRouterIps, to, fromInterfaceConnectedToThrough);
    console.log(body);
    if (!serverIp) {
      console.error("Server IP is not set.");
      return;
    }

    try {
      // await sendTransitConfiguration(body, serverIp);
      toast({
        variant: "default",
        title: "Transit configuration generated!",
        description: "The configuration has been generated successfully.",
      })
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request: " + error,
      })
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
    getNetworkTopologyResponse,
    handleGenerateConfiguration,
    handleDeployNetwork,
    handleTransitConfigsChange,
    getAvailableASOptions,
    handleTransitConfigsSend,
  };
}
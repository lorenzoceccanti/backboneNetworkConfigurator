import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RouterConfig, HostConfig, TransitConfig, PeeringConfig, LocalPreferenceConfig, AnnounceConfig, NetworkTopology, NetworkTopologyResponse, RouterResponse, TransitConfigBody, PeeringConfigBody, LocalPreferenceConfigBody, AnnounceConfigBody, AnnounceToConfigBody, StopAnnounceConfig, StopAnnounceConfigBody} from "@/lib/definitions";
import { initialMainConfig, initialRouterConfig, initialHostConfig } from "@/lib/default-values";
import { sendConfiguration, deployNetwork, sendTransitConfiguration, sendPeeringConfiguration, sendLocalPreferenceConfiguration, sendAnnounceConfiguration, sendStopAnnounceConfiguration} from "@/lib/api";
import { mainConfigurationFormSchema } from "@/lib/validations";
import { useToast } from "@/hooks/use-toast";

export function useMainConfig() {
  const [routerConfigs, setRouterConfigs] = useState<RouterConfig[]>([]);
  const [hostConfigs, setHostConfigs] = useState<HostConfig[]>([]);
  const [transitConfigs, setTransitConfigs] = useState<TransitConfig>();
  const [peeringConfigs, setPeeringConfigs] = useState<PeeringConfig>();
  const [localPreferenceConfigs, setlocalPreferenceConfigs] = useState<LocalPreferenceConfig>();
  const [announceConfigs, setAnnounceConfigs] = useState<AnnounceConfig>();
  const [stopAnnounceConfigs, setStopAnnounceConfigs] = useState<StopAnnounceConfig>();
  const [announcedNetworks, setAnnouncedNetworks] = useState<Record<string, string[]>>({});
  
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
    // check if the name of the routers are unique in the list of routers configurations
    const isNameUnique = routerConfigs.every((routerConfig, index) => {
      return routerConfigs.findIndex((router) => router.name === routerConfig.name) === index;
    });
    if (!isNameUnique) {
      toast({
        variant: "destructive",
        title: "Router names are not unique.",
        description: "Please make sure that the names of the routers are unique.",
      });
      return;
    }
    
    const body: NetworkTopology = {
      project_name: form.getValues("project_name"),
      routers: routerConfigs,
      hosts: hostConfigs,
    };

    if (!serverIp) {
      toast({
        variant: "destructive",
        title: "Server IP is not set.",
        description: "Please set the server IP in the form.",
      });
      return;
    }

    try {
      console.log(JSON.stringify(body));
      const data = await sendConfiguration(body, serverIp);
      setNetworkTopologyResponse(data);
      toast({
        variant: "default",
        title: "Configuration generated!",
        description: "The configuration has been generated successfully.",
      });
      setIsConfigGenerated(true);
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request: " + error,
      });
      setIsConfigGenerated(false);
    }
  };

  const handleDeployNetwork = async () => {
    setIsDeploying(true);

    if (!serverIp) {
      toast({
        variant: "destructive",
        title: "Server IP not set.",
        description: "Please set the server IP in the form.",
      });
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
        from: networkTopologyResponse?.routers[0].asn || 0,
        through: networkTopologyResponse?.routers[1].asn || 0,
        to: [networkTopologyResponse?.routers[2].asn || 0],
      });
      setPeeringConfigs({
        fromAS: networkTopologyResponse?.routers[0].asn || 0,
        toAS: networkTopologyResponse?.routers[1].asn || 0,
      });
      setlocalPreferenceConfigs({
        asn: 0,
        neighbor_router: "",
        local_preference: 100,
        network_ip: ""
      });
      setAnnounceConfigs({
        router: "",
        network_ip: "",
        to: [0],
      });
      setStopAnnounceConfigs({
        router: "",
        network_ip: "",
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

  const getAvailableASOptionsWithInternet = () => {
    if (!networkTopologyResponse) return [];

    // the set is used to remove duplicates
    const availableASOptions: number[] = Array.from(new Set(networkTopologyResponse.routers.map(router => router.asn)));
    // add to the available AS options the "Internet" field (-1)
    availableASOptions.push(-1);
    return availableASOptions;
};

  const getAvailableRouters = () => {
    if (!networkTopologyResponse) return [];

    // the set is used to remove duplicates
    return Array.from(new Set(networkTopologyResponse.routers));
  };

  const handleTransitConfigsChange = (newConfig: TransitConfig) => {
    setTransitConfigs(newConfig);
  };

  const handlePeeringConfigsChange =  (newConfig: PeeringConfig) => {
    setPeeringConfigs(newConfig);
  };

  const handleLocalPreferenceConfigsChange = (newConfig: LocalPreferenceConfig) => {
    setlocalPreferenceConfigs(newConfig);
  };

  const handleAnnounceConfigsChange = (newConfig: AnnounceConfig) => {
    setAnnounceConfigs(newConfig);
  };

  const handleStopAnnounceConfigsChange = (newConfig: StopAnnounceConfig) => {
    setStopAnnounceConfigs(newConfig);
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
    throughInterfaceConnectedToFrom: string | null,
    hasInternet: boolean
  ): ({ asn: number; my_router_ip: string } | string)[] => {
    const ips: ({ asn: number; my_router_ip: string } | string)[] 
      = throughToLinks.map(link => {
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

    if(hasInternet) {
      ips.push("Internet");
    }

    return ips;
  };

  const buildToArray = (throughToLinks: ([string, string])[], toRouters: RouterResponse[], hasInternet: boolean): ({ asn: number; router: string; router_ip: string; mngt_ip: string } | string)[] => {
    const toArray: ({ asn: number; router: string; router_ip: string; mngt_ip: string } | string)[] 
      = toRouters.map(toRouter => {
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

    if (hasInternet) {
      toArray.push("Internet");
    }

    return toArray;
  };

  const buildRequestBody = (
    fromRouter: RouterResponse,
    throughRouter: RouterResponse,
    throughRouterIps: ({ asn: number; my_router_ip: string } | string)[],
    toArray: ({ asn: number; router: string; router_ip: string; mngt_ip: string } | string)[],
    fromInterfaceConnectedToThrough: string | null,
  ): TransitConfigBody => {
    const fromIp = fromRouter.interfaces.find(int => int.name === fromInterfaceConnectedToThrough)?.ip.split("/")[0] ?? "";
    const fromMngt = fromRouter.mngt_ipv4?.split("/")[0] ?? "";
    const throughMngt = throughRouter.mngt_ipv4?.split("/")[0] ?? "";
  
    const cleanedThroughRouterIps = throughRouterIps.map(ip => 
      typeof ip === "string" ? ip : {
      asn: ip.asn,
      my_router_ip: ip.my_router_ip ?? ""
      }
    );
  
    return {
      from_: {
        asn: fromRouter.asn,
        router: fromRouter.name,
        router_ip: fromIp,
        mngt_ip: fromMngt,
      },
      through: {
        asn: throughRouter.asn,
        router: throughRouter.name,
        mngt_ip: throughMngt,
        router_ip: cleanedThroughRouterIps,
      },
      to: toArray
    };
  };

  const isInternetLinkPresent = (throughRouter: RouterResponse): boolean => {
    // we need to check if there is a neighbor in the through AS
    // which ASN is not present in the available AS options
    const throughRouterNeighbors = throughRouter.neighbors;
    const availableASOptions = getAvailableASOptions();
    const throughRouterNeighborASNs = throughRouterNeighbors.map(neighbor => neighbor.asn);
    const internetLinkPresent = throughRouterNeighborASNs.some(neighborASN => !availableASOptions.includes(neighborASN));
    return internetLinkPresent;
  }

  const handleTransitConfigsSend = async () => {
    if (!networkTopologyResponse || !transitConfigs) return;

    const fromRouters = getRoutersByASN(networkTopologyResponse, transitConfigs.from);
    if (!fromRouters.length) {
      toast({
        variant: "destructive",
        title: "From router not found.",
        description: "The router with the ASN provided was not found.",
      });
    }

    const throughRouters = getRoutersByASN(networkTopologyResponse, transitConfigs.through);
    if (!throughRouters.length) {
      toast({
        variant: "destructive",
        title: "Through router not found.",
        description: "The router with the ASN provided was not found.",
      });
      return;
    }

    const toRouters = getRoutersByASNs(networkTopologyResponse, transitConfigs.to.filter(asn => asn !== -1));
    if(!(transitConfigs.to.length === 1 && transitConfigs.to[0] === -1)) {
      if (!toRouters.length) {
        toast({
          variant: "destructive",
          title: "To router not found.",
          description: "The router with the ASN provided was not found.",
        });
        return;
      }
    }

    const fromThroughLinks = findLinksBetweenRouters(networkTopologyResponse, fromRouters, throughRouters);
    if (!fromThroughLinks.length) {
      toast({
        variant: "destructive",
        title: "From-Through link not found.",
        description: "There is no link between the from and through routers.",
      });
      return;
    }

    const fromRouter = findConnectedRouter(fromRouters, fromThroughLinks);
    if (!fromRouter) {
      toast({
        variant: "destructive",
        title: "From router not found.",
        description: "The from router was not found.",
      });
      return;
    }

    const throughRouter = findConnectedRouter(throughRouters, fromThroughLinks);
    if (!throughRouter) {
      toast({
        variant: "destructive",
        title: "Through router not found.",
        description: "The through router was not found.",
      });
      return;
    }

    // if transitConfigs.to contains -1, remove -1 from the list and set the boolean hasInternet to true
    const hasInternet = transitConfigs.to.includes(-1);

    if(hasInternet && !isInternetLinkPresent(throughRouter)) {
      toast({
        variant: "destructive",
        title: "Internet link not found.",
        description: "The internet link was not found.",
      });
      return;
    }

    const throughToLinks = findThroughToLinks(networkTopologyResponse, throughRouters, toRouters);
    if (throughToLinks[0]?.[0] === "" && throughToLinks[0]?.[1] === "") {
      toast({
        variant: "destructive",
        title: "Through-To link not found.",
        description: "There is no link between the through and to routers.",
      });
      return;
    }
    
    const fromInterfaceConnectedToThrough = getConnectedInterface(fromRouter, fromThroughLinks);
    const throughInterfaceConnectedToFrom = getConnectedInterface(throughRouter, fromThroughLinks);

    const throughRouterIps = buildThroughRouterIps(throughRouter, throughToLinks, toRouters, fromRouter, throughInterfaceConnectedToFrom, hasInternet);

    const toArray = buildToArray(throughToLinks, toRouters, hasInternet);

    const body: TransitConfigBody = buildRequestBody(fromRouter, throughRouter, throughRouterIps, toArray, fromInterfaceConnectedToThrough);

    if (!serverIp) {
      toast({
        variant: "destructive",
        title: "Server IP not set.",
        description: "Please set the server IP in the form.",
      });
      return;
    }

    try {
      await sendTransitConfiguration(body, serverIp);
      toast({
        variant: "default",
        title: "Transit configuration generated!",
        description: "The configuration has been generated successfully.",
      });

      
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request: " + error,
      });
    }
  };

  const buildPeerRequestBody = (
    router: RouterResponse,
    peer: RouterResponse,
    fatherInterfaceConnectedToSon: string | null,
    sonInterfaceConnectedToFather: string | null,
  ): PeeringConfigBody => {
    return {
      asn: router.asn,
      router_ip: router.interfaces.find(int => int.name === fatherInterfaceConnectedToSon)?.ip.split("/")[0] ?? "",
      mngt_ip: router.mngt_ipv4?.split("/")[0] ?? "",
      peer: {
        asn: peer.asn,
        router_ip: peer.interfaces.find(int => int.name === sonInterfaceConnectedToFather)?.ip.split("/")[0] ?? "",
        mngt_ip: peer.mngt_ipv4?.split("/")[0] ?? "",
      },
    };
  };

  const handlePeeringConfigsSend = async() => {
    if(!networkTopologyResponse || !peeringConfigs) return;

    const fatherASRouters = getRoutersByASN(networkTopologyResponse, peeringConfigs.fromAS);
    if(!fatherASRouters.length) {
      toast({
        variant: "destructive",
        title: "Father peer router not found.",
        description: "No router with the ASN provided was found.",
      });
      return;
    }

    const sonASRouters = getRoutersByASN(networkTopologyResponse, peeringConfigs.toAS);
    if(!sonASRouters.length) {
      toast({
        variant: "destructive",
        title: "Son peer router not found.",
        description: "No router with the ASN provided was found.",
      });
      return;
    }

    const fatherSonLinks = findLinksBetweenRouters(networkTopologyResponse, fatherASRouters, sonASRouters);
    if(!fatherSonLinks.length) {
      toast({
        variant: "destructive",
        title: "From-To link not found.",
        description: "There is no link between the From and To AS.",
      });
      return;
    }

    const fatherRouter = findConnectedRouter(fatherASRouters, fatherSonLinks);
    if (!fatherRouter) {
      toast({
        variant: "destructive",
        title: "From peer router not found.",
        description: "From peer router not found.",
      });
      return;
    }

    const sonRouter = findConnectedRouter(sonASRouters, fatherSonLinks);
    if (!sonRouter) {
      toast({
        variant: "destructive",
        title: "To peer router not found.",
        description: "To peer router not found.",
      });
      return;
    }

    const fatherInterfaceConnectedToSon = getConnectedInterface(fatherRouter, fatherSonLinks);
    const sonInterfaceConnectedToFather = getConnectedInterface(sonRouter, fatherSonLinks);

    const body : PeeringConfigBody = buildPeerRequestBody(fatherRouter, sonRouter, fatherInterfaceConnectedToSon, sonInterfaceConnectedToFather);

    if (!serverIp) {
      toast({
        variant: "destructive",
        title: "Server IP not set.",
        description: "Please set the server IP in the form.",
      });
      return;
    }

    try {
      await sendPeeringConfiguration(body, serverIp);
      toast({
        variant: "default",
        title: "Peering configuration generated!",
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

  const getRoutersByName = (networkTopologyResponse: NetworkTopologyResponse, name: string): RouterResponse[] =>
    networkTopologyResponse.routers.filter(router => router.name === name);

  const findTargetRouter = (routers: RouterResponse[], neighbors: RouterResponse[]): { router: RouterResponse, matchedIp: string } | undefined => {
    const result = routers.map(router => {
      const match = router.neighbors.find(routerNeighbor => {   
        return neighbors.some(neighbor => 
          neighbor.interfaces.some(interfaceData => interfaceData.ip.split("/")[0] === routerNeighbor.ip)
        );
      });

      if (match) {
        const matchedIp = match.ip; 
        return { router, matchedIp }; 
      }
      return undefined;
    }).find(result => result !== undefined); 
    return result; 
  };

  const buildLocalPreferenceRequestBody = (
    router: RouterResponse,
    neighbor_ip: string,
    lpf: number,
    network: string
  ): LocalPreferenceConfigBody => {
    return {
      asn: router.asn,
      router: router.name,
      neighbor_ip: neighbor_ip, 
      mngt_ip: router.mngt_ipv4?.split("/")[0] ?? "",
      local_preference: lpf, 
      network: network
    };
  };

  const handleLocalPreferenceConfigsSend = async() =>{
    if(!networkTopologyResponse || !localPreferenceConfigs) return;

    if(localPreferenceConfigs.network_ip === "") {
      toast({
        variant: "destructive",
        title: "Network IP not set.",
        description: "Please set the network IP in the form.",
      });
      return;
    }

    const ASrouters = getRoutersByASN(networkTopologyResponse, localPreferenceConfigs.asn);
    if(!ASrouters.length) {
      toast({
        variant: "destructive",
        title: "AS routers not founded.",
        description: "No router with the ASN provided was found.",
      });
      return;
    }

    const neighborRouter = getRoutersByName(networkTopologyResponse, localPreferenceConfigs.neighbor_router)
    if(neighborRouter.length > 1 || !neighborRouter) {
      toast({
        variant: "destructive",
        title: "Neighbor router not found.",
        description: "The neighbor router was not found.",
      });
      return;
    }

    const target = findTargetRouter(ASrouters, neighborRouter);
    if(!target) {
      toast({
        variant: "destructive",
        title: "Neighbor router not found.",
        description: "The Neighbor router was not found.",
      });
      return;
    }

    const body : LocalPreferenceConfigBody = buildLocalPreferenceRequestBody(target.router, target.matchedIp,  localPreferenceConfigs.local_preference, localPreferenceConfigs.network_ip);
    if (!serverIp) {
      toast({
        variant: "destructive",
        title: "Server IP not set.",
        description: "Please set the server IP in the form.",
      });
      return;
    }

    try {
      console.log(JSON.stringify(body));
      await sendLocalPreferenceConfiguration(body, serverIp);
      toast({
        variant: "default",
        title: "Local Preference configuration generated!",
        description: "The configuration has been generated successfully.",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request: " + error,
      });
    }
  };

  const buildAnnounceRequestBody = (
    router: RouterResponse,
    network: string,
    to_list: (AnnounceToConfigBody | string)[]
  ): AnnounceConfigBody => {
    return {
      router: router.name,
      asn: router.asn,
      mngt_ip: router.mngt_ipv4?.split("/")[0] ?? "",
      network_to_announce: network,
      to: to_list
    };
  };

  const getTolist = (
    router: RouterResponse,
  ): (AnnounceToConfigBody | string)[] => {
    if (!announceConfigs) return [];
  
    const to_list: (AnnounceToConfigBody | string)[] = [];
  
    announceConfigs.to.forEach((val) => {
      if (val === -1) {
        to_list.push("Internet");
      } else {
        const filteredNeighbors = router.neighbors.filter((neig) => neig.asn === val);
        
        filteredNeighbors.forEach((neig) => {
          to_list.push({
            asn: neig.asn,
            his_router_ip: neig.ip,
          });
        });
      }
    });
  
    return to_list;
  };
  

  const handleAnnounceConfigSend = async() =>{
    if(!networkTopologyResponse || !announceConfigs) return;

    const router = getRoutersByName(networkTopologyResponse, announceConfigs.router);
    if(router.length > 1 || !router.length) {
      toast({
        variant: "destructive",
        title: "Router not found.",
        description: "The router was not found.",
      });
      return;
    }

    const to_list = getTolist(router[0]);

    const body : AnnounceConfigBody = buildAnnounceRequestBody(router[0], announceConfigs.network_ip, to_list);
    if (!serverIp) {
      toast({
        variant: "destructive",
        title: "Server IP not set.",
        description: "Please set the server IP in the form.",
      });
      return;
    }

    try {
      console.log(JSON.stringify(body))
      await sendAnnounceConfiguration(body, serverIp);
      setAnnouncedNetworks((prev = {}) => ({
        ...prev,
        [router[0].name]: [
          ...(prev[router[0].name] || []),
          ...(prev[router[0].name]?.includes(announceConfigs.network_ip) ? [] : [announceConfigs.network_ip])
        ]
      }));
      
      toast({
        variant: "default",
        title: "Announce configuration generated!",
        description: "The configuration has been generated successfully.",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request: " + error,
      });
    }
  };

  const buildStopAnnounceRequestBody = (
    router: RouterResponse,
    network: string,
  ): StopAnnounceConfigBody => {
    return {
      router: router.name,
      asn: router.asn,
      mngt_ip: router.mngt_ipv4?.split("/")[0] ?? "",
      network_to_stop_announce: network,
    };
  };
  const handleStopAnnounceConfigSend = async() =>{
    if(!networkTopologyResponse || !stopAnnounceConfigs) return;

    const router = getRoutersByName(networkTopologyResponse, stopAnnounceConfigs.router);
    if(router.length > 1 || !router.length) {
      toast({
        variant: "destructive",
        title: "Router not found.",
        description: "The router was not found.",
      });
      return;
    }

    const body : StopAnnounceConfigBody = buildStopAnnounceRequestBody(router[0], stopAnnounceConfigs.network_ip);
    if (!serverIp) {
      toast({
        variant: "destructive",
        title: "Server IP not set.",
        description: "Please set the server IP in the form.",
      });
      return;
    }

    try {
      await sendStopAnnounceConfiguration(body, serverIp);
      setAnnouncedNetworks((prev = {}) => {
        const routerName = stopAnnounceConfigs.router;
      
        if (prev[routerName]) {
          return {
            ...prev,
            [routerName]: prev[routerName].filter(
              (network) => network !== stopAnnounceConfigs.network_ip
            ),
          };
        }
        return prev;
      });
      
      toast({
        variant: "default",
        title: "Stop Announce configuration generated!",
        description: "The configuration has been generated successfully.",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request: " + error,
      });
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
    peeringConfigs,
    localPreferenceConfigs,
    announceConfigs,
    stopAnnounceConfigs,
    announcedNetworks,
    isConfigGenerated,
    isDeploying,
    getNetworkTopologyResponse,
    handleGenerateConfiguration,
    handleDeployNetwork,
    handleTransitConfigsChange,
    handlePeeringConfigsChange,
    handleLocalPreferenceConfigsChange,
    handleAnnounceConfigsChange,
    handleStopAnnounceConfigsChange,
    getAvailableASOptions,
    getAvailableASOptionsWithInternet,
    getAvailableRouters,
    handleTransitConfigsSend,
    handlePeeringConfigsSend,
    handleLocalPreferenceConfigsSend,
    handleAnnounceConfigSend, 
    handleStopAnnounceConfigSend  
  };
}

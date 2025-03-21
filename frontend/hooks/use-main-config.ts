import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RouterConfig, HostConfig, TransitConfig, PeeringConfig, LocalPreferenceConfig, AnnounceConfig, NetworkTopology, NetworkTopologyResponse, RouterResponse, TransitConfigBody, PeeringConfigBody, LocalPreferenceConfigBody, AnnounceConfigBody, AnnounceToConfigBody, StopAnnounceConfig, StopAnnounceConfigBody} from "@/lib/definitions";
import { initialMainConfig, initialRouterConfig, initialHostConfig } from "@/lib/default-values";
import { sendConfiguration, deployNetwork, sendTransitConfiguration, sendPeeringConfiguration, sendLocalPreferenceConfiguration, sendAnnounceConfiguration, sendStopAnnounceConfiguration} from "@/lib/api";
import { mainConfigurationFormSchema } from "@/lib/validations";
import { useToast } from "@/hooks/use-toast";
import { get } from "http";
import { NextFlightResponse } from "next/dist/server/app-render/types";

export function useMainConfig() {
  const [routerConfigs, setRouterConfigs] = useState<RouterConfig[]>([]);
  const [hostConfigs, setHostConfigs] = useState<HostConfig[]>([]);
  const [transitConfigs, setTransitConfigs] = useState<TransitConfig>();
  const [peeringConfigs, setPeeringConfigs] = useState<PeeringConfig>();
  const [localPreferenceConfigs, setlocalPreferenceConfigs] = useState<LocalPreferenceConfig>();
  const [announceConfigs, setAnnounceConfigs] = useState<AnnounceConfig>();
  const [stopAnnounceConfigs, setStopAnnounceConfigs] = useState<StopAnnounceConfig>();
  {/*Record to store routers and their announced network*/}
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
      setAnnounceConfigs({
        router: "",
        network_ip: "",
        to: [0],
      });
      setStopAnnounceConfigs({
        router: "",
        network_ip: ""
      })
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
      setPeeringConfigs({
        fromAS: 0,
        toAS: 0
      });
      setlocalPreferenceConfigs({
        asn: 0,
        neighbor_router: "",
        local_preference: 0,
      });
      setAnnounceConfigs({
        router: "",
        network_ip: "",
        to: [0],
      });
      setStopAnnounceConfigs({
        router: "",
        network_ip: ""
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
    fromInterfaceConnectedToThrough: string | null,

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
      to: toObj,
     
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
      await sendTransitConfiguration(body, serverIp);
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
    if(!fatherASRouters.length) return console.error("Father peer router not found");

    const sonASRouters = getRoutersByASN(networkTopologyResponse, peeringConfigs.toAS);
    if(!sonASRouters.length) return console.error("Son peer router not found");

    const fatherSonLinks = findLinksBetweenRouters(networkTopologyResponse, fatherASRouters, sonASRouters);
    if(!fatherSonLinks.length) return console.error("Peering link not found")

    const fatherRouter = findConnectedRouter(fatherASRouters, fatherSonLinks);
    if (!fatherRouter) return console.error("Father peer router not found");

    const sonRouter = findConnectedRouter(sonASRouters, fatherSonLinks);
    if (!sonRouter) return console.error("Son peer router not found");

    const fatherInterfaceConnectedToSon = getConnectedInterface(fatherRouter, fatherSonLinks);
    const sonInterfaceConnectedToFather = getConnectedInterface(sonRouter, fatherSonLinks);

    const body : PeeringConfigBody = buildPeerRequestBody(fatherRouter, sonRouter, fatherInterfaceConnectedToSon, sonInterfaceConnectedToFather);
    console.log(body);
    if (!serverIp) {
      console.error("Server IP is not set.");
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
    neighbor_asn: number,
    lpf: number
  ): LocalPreferenceConfigBody => {
    return {
      asn: router.asn,
      neighbor_ip: neighbor_ip,
      neighbor_asn: neighbor_asn, 
      mngt_ip: router.mngt_ipv4?.split("/")[0] ?? "",
      local_preference: lpf, 
    };
  };

  const handleLocalPreferenceConfigsSend = async() =>{
    if(!networkTopologyResponse || !localPreferenceConfigs) return;

    const ASrouters = getRoutersByASN(networkTopologyResponse, localPreferenceConfigs.asn);
    if(!ASrouters.length) return console.error("routers not found");

    const NeighborRouter = getRoutersByName(networkTopologyResponse, localPreferenceConfigs.neighbor_router)
    if(NeighborRouter.length > 1 || !NeighborRouter) return console.error("routers not found");

    const Target = findTargetRouter(ASrouters, NeighborRouter);
    if(!Target) return console.error("router not found");



    const body : LocalPreferenceConfigBody = buildLocalPreferenceRequestBody(Target.router, Target.matchedIp, NeighborRouter[0].asn, localPreferenceConfigs.local_preference);
    console.log(body);
    if (!serverIp) {
      console.error("Server IP is not set.");
      return;
    }

    try {
      await sendLocalPreferenceConfiguration(body, serverIp);
      toast({
        variant: "default",
        title: "Local Preference configuration generated!",
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

  const buildAnnounceRequestBody = (
    router: RouterResponse,
    network: string,
    to_list: AnnounceToConfigBody[]
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
  ): AnnounceToConfigBody[]  => {
    if(!announceConfigs) return [];
    
    const filteredNeighbors = announceConfigs.to.map((val) => router.neighbors.filter((neig) => neig.asn === val)).flat()
    
    const to_list: AnnounceToConfigBody[] = []
    filteredNeighbors.forEach((val) => {
       const obj: AnnounceToConfigBody = {asn: 0, his_router_ip: ""};
       console.log(val)
       obj.asn = val.asn;
       obj.his_router_ip = val.ip;
       to_list.push(obj);
       
     })

     return to_list;
  }

  useEffect(() => {
    console.log("Announced Networks Updated:", announcedNetworks);
  }, [announcedNetworks]);

  const handleAnnounceConfigSend = async() =>{
    if(!networkTopologyResponse || !announceConfigs) return;

    const router = getRoutersByName(networkTopologyResponse, announceConfigs.router);
    if(router.length > 1 || !router.length) return console.error("routers not found");

    const to_list = getTolist(router[0])

    const body : AnnounceConfigBody = buildAnnounceRequestBody(router[0], announceConfigs.network_ip, to_list);
    if (!serverIp) {
      console.error("Server IP is not set.");
      return;
    }

    try {
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
    if(router.length > 1 || !router.length) return console.error("routers not found");

    const body : StopAnnounceConfigBody = buildStopAnnounceRequestBody(router[0], stopAnnounceConfigs.network_ip);
    if (!serverIp) {
      console.error("Server IP is not set.");
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
        title: "Announce configuration generated!",
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
    getAvailableRouters,
    handleTransitConfigsSend,
    handlePeeringConfigsSend,
    handleLocalPreferenceConfigsSend,
    handleAnnounceConfigSend, 
    handleStopAnnounceConfigSend  
  };
}

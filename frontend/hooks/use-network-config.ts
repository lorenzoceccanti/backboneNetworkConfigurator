import { useState } from "react";
import { RouterConfig, HostConfig, TransitConfig, NetworkTopology } from "@/lib/definitions";

export function useNetworkConfig() {
  const [routerConfigs, setRouterConfigs] = useState<RouterConfig[]>([]);
  const [hostConfigs, setHostConfigs] = useState<HostConfig[]>([]);
  const [transitConfigs, setTransitConfigs] = useState<TransitConfig>();
  const [networkTopology, setNetworkTopology] = useState<NetworkTopology | null>(null);
  const [serverIp, setServerIp] = useState<string | undefined>(undefined);
  const [isConfigGenerated, setIsConfigGenerated] = useState<boolean>(false);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);

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

  return {
    routerConfigs,
    setRouterConfigs,
    hostConfigs,
    setHostConfigs,
    transitConfigs,
    setTransitConfigs,
    networkTopology,
    setNetworkTopology,
    serverIp,
    setServerIp,
    isConfigGenerated,
    setIsConfigGenerated,
    isDeploying,
    setIsDeploying,
    updateRouterConfig,
    updateHostConfig,
  };
}
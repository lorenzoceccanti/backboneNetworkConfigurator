import { useEffect, useState } from "react";
import { StopAnnounceConfig, RouterResponse} from "@/lib/definitions";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StopAnnounceConfigFormSchema} from "@/lib/validations";
import { useToast } from "@/hooks/use-toast";



export function useStopAnnounceConfig(
  initialValues: StopAnnounceConfig,
  announcedNetworks: Record<string, string[]>,
  onChange: (config: StopAnnounceConfig) => void
) {
  const [config, setConfig] = useState<StopAnnounceConfig>(initialValues);
  const { toast } = useToast();

  useEffect(() => {
    setConfig(initialValues);
  }, [initialValues]);

  const handleChange = <K extends keyof StopAnnounceConfig>(
    field: K,
    value: StopAnnounceConfig[K]
  ) => {
    const updatedConfig = { ...config, [field]: value };
    setConfig(updatedConfig);
    onChange(updatedConfig);
  };

  
  const getAvailableRouterOptions = (
    config: StopAnnounceConfig,
    availableRouter: RouterResponse[],
  ) => {
    return availableRouter;

  }

  const getAvailableNetworksOptions = (
      config: StopAnnounceConfig,
      availableRouter: RouterResponse[],
      announcedNetworks: Record<string, string[]>
    ): string[] => {
      
      
        const networksForRouter = announcedNetworks[config.router];

       
        if (!networksForRouter || networksForRouter.length === 0) {
          return [];
        }
      
       
        return networksForRouter;
    }

    
    const handleRouterChange = (routerName: string) => {
        const updatedConfig = { ...config, "router": routerName, "network_ip": ""};
        setConfig(updatedConfig);
        onChange(updatedConfig);
    
      };
  
    


  return {
    config,
    handleChange,
    handleRouterChange,
    getAvailableRouterOptions,
    getAvailableNetworksOptions,
  };
}

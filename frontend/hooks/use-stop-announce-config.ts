import { useEffect, useState } from "react";
import { StopAnnounceConfig } from "@/lib/definitions";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stopAnnounceConfigFormSchema} from "@/lib/validations";


export function useStopAnnounceConfig(
  initialValues: StopAnnounceConfig,
  onChange: (config: StopAnnounceConfig) => void
) {
  const [config, setConfig] = useState<StopAnnounceConfig>(initialValues);

  const form = useForm<z.infer<typeof stopAnnounceConfigFormSchema>>({
    resolver: zodResolver(stopAnnounceConfigFormSchema),
    mode: "onBlur",
    defaultValues: initialValues,
  });

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

  const getAvailableNetworksOptions = (
    config: StopAnnounceConfig,
    announcedNetworks: Record<string, string[]>
  ): string[] => {
    const networksForRouter = announcedNetworks[config.router];
    if (!networksForRouter || networksForRouter.length === 0) {
      return [];
    }
    return networksForRouter;
  };
    
  const handleRouterChange = (routerName: string) => {
    const updatedConfig = { ...config, "router": routerName, "network_ip": ""};
    setConfig(updatedConfig);
    onChange(updatedConfig);
  };
  
  return {
    config,
    handleChange,
    form,
    handleRouterChange,
    getAvailableNetworksOptions,
  };
}

import { useEffect, useState } from "react";
import { LocalPreferenceConfig, RouterResponse} from "@/lib/definitions";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { localPreferenceConfigurationFormSchema } from "@/lib/validations";

export function useLocalPreferenceConfig(
  initialValues: LocalPreferenceConfig,
  onChange: (config: LocalPreferenceConfig) => void,
) {
  const [config, setConfig] = useState<LocalPreferenceConfig>(initialValues);

  const form = useForm<z.infer<typeof localPreferenceConfigurationFormSchema>>({
    resolver: zodResolver(localPreferenceConfigurationFormSchema),
    mode: "onBlur",
    defaultValues: initialValues,
  });

  useEffect(() => {
    setConfig(initialValues);
  }, [initialValues]);

  const handleChange = <K extends keyof LocalPreferenceConfig>(
    field: K,
    value: LocalPreferenceConfig[K]
  ) => {
    const updatedConfig = { ...config, [field]: value };
    setConfig(updatedConfig);
    onChange(updatedConfig);
  };
  

  const getAvailableRouterOptions = (
    config: LocalPreferenceConfig,
    availablerouter: RouterResponse[]
  ) => {
  
    return availablerouter.filter((opt) => opt.asn != config.asn);
  }

  const getAvailableNetworksOptions = (
    config: LocalPreferenceConfig,
    availableRouter: RouterResponse[],
  ): string[] => {
    const options = availableRouter.filter((opt) => opt.name === config.neighbor_router);
    if(options.length > 1 || !options.length) {
      return[];
    }

    const networks = options[0].subnetworks
    if (!networks.includes("0.0.0.0/0")) {
      networks.push("0.0.0.0/0");
    }
    return networks || [];
  };

  const getAvailableLPASOptions = (
    config: LocalPreferenceConfig,
    availableAS: number[],
    field: "asn"
  ) => {
    const used: number[] = [];
    if (config.asn !== null && field !== "asn") {
      used.push(config.asn);
    }
    return availableAS.filter((opt) => !used.includes(opt));
  };

  return {
    config,
    form,
    handleChange,
    getAvailableRouterOptions,
    getAvailableLPASOptions,
    getAvailableNetworksOptions
  };
}
  

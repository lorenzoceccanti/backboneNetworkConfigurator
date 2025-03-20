import { useEffect, useState } from "react";
import { AnnounceConfig, RouterResponse} from "@/lib/definitions";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { announceConfigurationFormSchema } from "@/lib/validations";

export function useAnnounceConfig(
  initialValues: AnnounceConfig,
  availableASOptions: number[],
  onChange: (config: AnnounceConfig) => void
) {
  const [config, setConfig] = useState<AnnounceConfig>(initialValues);

  const form = useForm<z.infer<typeof announceConfigurationFormSchema>>({
    resolver: zodResolver(announceConfigurationFormSchema),
    mode: "onBlur",
    defaultValues: initialValues,
  });

  useEffect(() => {
    setConfig(initialValues);
  }, [initialValues]);

  const handleChange = <K extends keyof AnnounceConfig>(
    field: K,
    value: AnnounceConfig[K]
  ) => {
    const updatedConfig = { ...config, [field]: value };
    setConfig(updatedConfig);
    onChange(updatedConfig);
  };

  const getAvailableRouterOptions = (
    config: AnnounceConfig,
    availableRouter: RouterResponse[],
  ) => {
    return availableRouter;

  }

  // NOTA aggiungere poi il controllo sulla as e sul redistribute bgp
  const getAvailableNetworksOptions = (
    config: AnnounceConfig,
    availableRouter: RouterResponse[],
  ) => {
    const options = availableRouter.filter((opt) => opt.name === config.router);
    if(options.length > 1 || !options.length){
       return[]
    }

    return options[0].subnetworks || []
  }

  const handleToChange = (index: number, value: number) => {
      const updatedTo = [...config.to];
      updatedTo[index] = value;
      handleChange("to", updatedTo);
    };
  
    const addToField = (routers: RouterResponse[]) => {
      const options = getAvailableASOptions(config, availableASOptions, routers);
      const newOption = options[0];
  
      if (newOption == undefined) {
        console.error("No available AS numbers to add");
        return;
      }
      handleChange("to", [...config.to, newOption]);
    };

    const getASNbyRouter = (
      name: string,
      routers: RouterResponse[]
    ): number => {
      const result = routers.filter(router => router.name === name)
      if(result.length > 1 || !result.length) return 0
      return result[0].asn 
      
    }
    

    const getAvailableASOptions = (
      config: AnnounceConfig,
      availableAS: number[],
      routers: RouterResponse[],
      toIndex?: number
    ) => {
      
      const used: number[] = [];
      const as = getASNbyRouter(config.router, routers)
      used.push(as)
    
      config.to.forEach((val, i) => {
        if ( i !== toIndex ) {
          used.push(val);
        }
      });

      const filtered = availableAS.filter((opt) => !used.includes(opt));
    
      return filtered;
    };
  
    const removeToAS = (index: number) => {
      const updatedTo = config.to.filter((_, i) => i !== index);
      handleChange("to", updatedTo);
    }

  return {
    config,
    form,
    handleChange,
    getAvailableASOptions,
    getAvailableRouterOptions,
    getAvailableNetworksOptions,
    handleToChange,
    addToField,
    removeToAS,
  };
}

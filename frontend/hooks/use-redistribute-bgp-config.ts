import { useEffect, useState } from "react";
import { RedistributeBGPConfig } from "@/lib/definitions";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { redistributeBGPConfigurationFormSchema } from "@/lib/validations";

export function useRedistributeBGPConfig(
  initialValues: RedistributeBGPConfig,
  availableRoutersOptions: string[],
  onChange: (config: RedistributeBGPConfig) => void
) {
  const [config, setConfig] = useState<RedistributeBGPConfig>(initialValues);

  const form = useForm<z.infer<typeof redistributeBGPConfigurationFormSchema>>({
    resolver: zodResolver(redistributeBGPConfigurationFormSchema),
    mode: "onBlur",
    defaultValues: initialValues,
  });

  useEffect(() => {
    setConfig(initialValues);
  }, [initialValues]);

  const handleChange = <K extends keyof RedistributeBGPConfig>(
    field: K,
    value: RedistributeBGPConfig[K]
  ) => {
    const updatedConfig = { ...config, [field]: value };
    setConfig(updatedConfig);
    onChange(updatedConfig);
  };

  return {
    config,
    form,
    handleChange
  };
}
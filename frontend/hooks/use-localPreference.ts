import { useEffect, useState } from "react";
import { LocalPreferenceConfig, ASN_INTERNET } from "@/lib/definitions";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { localPreferenceConfigurationFormSchema } from "@/lib/validations";

export function useLocalPreferenceConfig(
  initialValues: LocalPreferenceConfig,
  availableASOptions: number[],
  onChange: (config: LocalPreferenceConfig) => void
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

  const getAvailableLPASOptions = (
    config: LocalPreferenceConfig,
    availableAS: number[],
    field: "asn"
  ) => {
    const used: number[] = [];
    if (config.asn !== null && field !== "asn") {
      used.push(config.asn);
    }
    return availableAS.filter((opt) => !used.includes(opt) && opt !== ASN_INTERNET);
  };

  return {
    config,
    form,
    handleChange,
    getAvailableLPASOptions,
  };
}
  

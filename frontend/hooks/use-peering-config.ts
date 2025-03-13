import { useEffect, useState } from "react";
import { PeeringConfig } from "@/lib/definitions";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { peeringConfigurationFormSchema } from "@/lib/validations";

export function usePeeringConfig(
  initialValues: PeeringConfig,
  availableASOptions: number[],
  onChange: (config: PeeringConfig) => void
) {
  const [config, setConfig] = useState<PeeringConfig>(initialValues);

  const form = useForm<z.infer<typeof peeringConfigurationFormSchema>>({
    resolver: zodResolver(peeringConfigurationFormSchema),
    mode: "onBlur",
    defaultValues: initialValues,
  });

  useEffect(() => {
    setConfig(initialValues);
  }, [initialValues]);

  const handleChange = <K extends keyof PeeringConfig>(
    field: K,
    value: PeeringConfig[K]
  ) => {
    const updatedConfig = { ...config, [field]: value };
    setConfig(updatedConfig);
    onChange(updatedConfig);
  };

  const getAvailableASOptions = (
    config: PeeringConfig,
    availableAS: number[],
    field: "fromAS" | "toAS"
  ) => {
    const used: number[] = [];
    if (config.fromAS !== null && field !== "fromAS") {
      used.push(config.fromAS);
    }
    if (config.toAS !== null && field !== "toAS") {
      used.push(config.toAS);
    }
    return availableAS.filter((opt) => !used.includes(opt));
  };

  return {
    config,
    form,
    handleChange,
    getAvailableASOptions,
  };
}

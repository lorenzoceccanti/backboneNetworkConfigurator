import { useEffect, useState } from "react";
import { TransitConfig } from "@/lib/definitions";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transitConfigurationFormSchema } from "@/lib/validations";


export function useTransitConfig(
  initialValues: TransitConfig, 
  availableASOptions: number[], 
  onChange: (config: TransitConfig) => void
) {
  const [config, setConfig] = useState<TransitConfig>(initialValues);

  const form = useForm<z.infer<typeof transitConfigurationFormSchema>>({
    resolver: zodResolver(transitConfigurationFormSchema),
    mode: "onBlur",
    defaultValues: initialValues,
  });

  useEffect(() => {
    setConfig(initialValues);
  }, [initialValues]);

  const handleChange = <K extends keyof TransitConfig>(field: K, value: TransitConfig[K]) => {
    const updatedConfig = { ...config, [field]: value };
    setConfig(updatedConfig);
    onChange(updatedConfig);
  };

  const handleToChange = (index: number, value: number) => {
    const updatedTo = [...config.to];
    updatedTo[index] = value;
    handleChange("to", updatedTo);
  };

  const addToField = () => {
    const options = getAvailableASOptions(config, availableASOptions, "to");
    const newOption = options[0];

    if (newOption == undefined) {
      console.error("No available AS numbers to add");
      return;
    }
    handleChange("to", [...config.to, newOption]);
  };

  const getAvailableASOptions = (
    config: TransitConfig,
    availableAS: number[],
    field: "from" | "through" | "to",
    toIndex?: number
  ) => {
    // build a list of AS numbers that are already in use
    const used: number[] = [];
  
    if (field !== "from" && config.from !== null) {
      used.push(config.from);
    }
    if (field !== "through" && config.through !== null) {
      used.push(config.through);
    }
    config.to.forEach((val, i) => {
      if (field !== "to" || i !== toIndex) {
        used.push(val);
      }
    });
  
    let filtered = availableAS.filter((opt) => !used.includes(opt));
  
    if (field !== "to") {
      // Exclude "Internet" (-1) for "from" and "through"
      filtered = filtered.filter((opt) => opt !== -1);
    }
  
    let currentValue: number | null = null;
    if (field === "from") {
      currentValue = config.from;
    } else if (field === "through") {
      currentValue = config.through;
    } else {
      currentValue = config.to[toIndex!];
    }
  
    if (currentValue !== null && !filtered.includes(currentValue)) {
      filtered.push(currentValue);
    }

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
    handleToChange,
    addToField,
    getAvailableASOptions,
    removeToAS,
  }
}

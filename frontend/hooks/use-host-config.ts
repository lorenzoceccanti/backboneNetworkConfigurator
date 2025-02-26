import { useState, useEffect } from "react";
import { HostConfig } from "@/lib/definitions";

export function useHostConfig(initialValues: HostConfig, onChange: (config: HostConfig) => void) {
  const [config, setConfig] = useState<HostConfig>(initialValues);
  const [selectedInterfaces, setSelectedInterfaces] = useState<string[]>([]);

  const availableInterfaces = ["Ethernet1", "Ethernet2", "Ethernet3", "Ethernet4"];

  useEffect(() => {
    setConfig(initialValues);
    const selected = initialValues.interfaces.map((iface) => iface.name);
    setSelectedInterfaces(selected);
  }, [initialValues]);

  const handleChange = <K extends keyof HostConfig>(field: K, value: HostConfig[K]) => {
    const updatedConfig = { ...config, [field]: value };
    setConfig(updatedConfig);
    onChange(updatedConfig);
  };

  const handleInterfaceSelection = (index: number, value: string) => {
    const updatedInterfaces = [...config.interfaces];
    updatedInterfaces[index] = { ...updatedInterfaces[index], name: value };
    handleChange("interfaces", updatedInterfaces);
    setSelectedInterfaces((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const getAvailableInterfaces = (index: number) => {
    return availableInterfaces.filter((iface) => !selectedInterfaces.includes(iface) || selectedInterfaces[index] === iface);
  };

  const removeInterface = (index: number) => {
    const updatedInterfaces = config.interfaces.filter((_, i) => i !== index);
    handleChange("interfaces", updatedInterfaces);
    setSelectedInterfaces((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    config,
    handleChange,
    handleInterfaceSelection,
    getAvailableInterfaces,
    removeInterface,
  };
}
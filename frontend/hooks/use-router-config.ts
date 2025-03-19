import { useState, useEffect } from "react";
import { RouterConfig } from "@/lib/definitions";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { routerConfigurationFormSchema } from "@/lib/validations";

export function useRouterConfig(initialValues: RouterConfig, onChange: (config: RouterConfig) => void) {
  const [config, setConfig] = useState<RouterConfig>(initialValues);
  const [selectedInterfaces, setSelectedInterfaces] = useState<string[]>([]);
  const [selectedInternetInterface, setSelectedInternetInterface] = useState<string | undefined>("");

  const availableInterfaces = ["Ethernet1", "Ethernet2", "Ethernet3", "Ethernet4"];

  const form = useForm<z.infer<typeof routerConfigurationFormSchema>>({
    resolver: zodResolver(routerConfigurationFormSchema),
    mode: "onBlur",
    defaultValues: initialValues,
  });

  useEffect(() => {
    setConfig(initialValues);
    const selected = initialValues.interfaces.map((iface) => iface.name !== "Loopback0" ? iface.name : "");
    setSelectedInterfaces(selected);
  }, [initialValues]);

  const handleChange = <K extends keyof RouterConfig>(field: K, value: RouterConfig[K]) => {
    const updatedConfig = { ...config, [field]: value };
    setConfig(updatedConfig);
    onChange(updatedConfig);
  };


  const handlePeerInterfaceSelect = (index: number, value: string) => {
    const updatedInterfaces = [...config.interfaces];
    updatedInterfaces[index] = { ...updatedInterfaces[index], peer: { ...updatedInterfaces[index].peer, interface: value } };
    handleChange("interfaces", updatedInterfaces);
  }

  const handleInterfaceSelect = (index: number, value: string) => {
    const updatedInterfaces = [...config.interfaces];
    updatedInterfaces[index] = { ...updatedInterfaces[index], name: value };
    handleChange("interfaces", updatedInterfaces);
    setSelectedInterfaces((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleInternetInterfaceSelect = (value: string) => {
    const updatedInterface = { ...config.internet_iface!, name: value };
    handleChange("internet_iface", updatedInterface);
    setSelectedInternetInterface(value);
  };

  const availableInterfacesOptions = (index: number) => {
    return availableInterfaces.filter((iface) => (!selectedInterfaces.includes(iface) || selectedInterfaces[index] === iface) && !selectedInternetInterface?.includes(iface));
  };
  
  const availableDhcpOptions = () => {
    return selectedInterfaces.filter((iface) => iface !== "");
  };

  const availableInternetOptions = () => {
    return availableInterfaces.filter((iface) => !selectedInterfaces.includes(iface));
  };
  
  const removeInternetInterface = () => {
    const updatedInterface = { ...config.internet_iface!, name: "" };
    handleChange("internet_iface", updatedInterface);
    setSelectedInternetInterface(undefined);
  }

  const removeInterface = (index: number) => {
    const updatedInterfaces = config.interfaces.filter((_, i) => i !== index);
    handleChange("interfaces", updatedInterfaces);
    setSelectedInterfaces((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNeighbor = (index: number) => {
    const updatedNeighbors = config.neighbors.filter((_, i) => i !== index);
    handleChange("neighbors", updatedNeighbors);
  };

  return {
    config,
    handlePeerInterfaceSelect,
    handleChange,
    handleInterfaceSelect,
    availableInterfacesOptions,
    removeInterface,
    removeInternetInterface,
    removeNeighbor,
    availableDhcpOptions,
    availableInternetOptions,
    handleInternetInterfaceSelect,
    form
  }
}
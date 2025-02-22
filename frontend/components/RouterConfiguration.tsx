import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RouterConfig } from "@/lib/definitions";
import { X } from "lucide-react";
import { ipWithMaskSchema, ipSchema } from "@/lib/definitions";
import { ZodError } from "zod";

type RouterConfigurationProps = {
  initialValues: RouterConfig;
  onChange: (config: RouterConfig) => void;
};

export default function RouterConfiguration({
  initialValues,
  onChange,
}: RouterConfigurationProps) {
  const [config, setConfig] = useState<RouterConfig>(initialValues);
  const [ifaceIPError, setIfaceIPError] = useState<boolean[]>([]);
  const [peerIfaceError, setPeerIfaceError] = useState<boolean[]>([]);
  const [neighborIPError, setNeighborIPError] = useState<boolean[]>([]);
  const [subnetIPError, setSubnetIPError] = useState<boolean | null>(null);
  const [dhcpStartIPError, setDhcpStartIPError] = useState<boolean | null>(null);
  const [dhcpEndIPError, setDhcpEndIPError] = useState<boolean | null>(null);
  const [selectedInterfaces, setSelectedInterfaces] = useState<string[]>([]);

  const availableInterfaces = ["Ethernet1", "Ethernet2", "Ethernet3", "Ethernet4"];

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

  const handlePeerInterfaceChange = (index: number, value: string) => {
    // if the selected interface is not in the available interfaces, set error
    if (!availableInterfaces.includes(value)) {
      setPeerIfaceError((prev) => {
        const updated = [...prev];
        updated[index] = true;
        return updated;
      });
    } else {
      setPeerIfaceError((prev) => {
        const updated = [...prev];
        updated[index] = false;
        return updated;
      });
    }

    const updatedInterfaces = [...config.interfaces];
    updatedInterfaces[index] = { ...updatedInterfaces[index], peer: { ...updatedInterfaces[index].peer, interface: value } };
    handleChange("interfaces", updatedInterfaces);
}

  const validateIp = (type: string, ip: string, index: number) => {
    switch (type) {
      case "iface":
        try {
          ipWithMaskSchema.parse(ip);
          setIfaceIPError((prev) => {
            const updated = [...prev];
            updated[index] = false;
            return updated;
          });
        } catch (e) {
          if (e instanceof ZodError) {
            setIfaceIPError((prev) => {
              const updated = [...prev];
              updated[index] = true;
              return updated;
            });
          }
        }
        break;
      case "neighbor":
        try {
          ipSchema.parse(ip);
          setNeighborIPError((prev) => {
            const updated = [...prev];
            updated[index] = false;
            return updated;
          });
        } catch (e) {
          if (e instanceof ZodError) {
            setNeighborIPError((prev) => {
              const updated = [...prev];
              updated[index] = true;
              return updated;
            });
          }
        }
        break;
      case "subnet":
        try {
          ipWithMaskSchema.parse(ip);
          setSubnetIPError(false);
        } catch (e) {
          if (e instanceof ZodError) {
            setSubnetIPError(true);
          }
        }
        break;
      case "dhcpStart":
        try {
          ipSchema.parse(ip);
          setDhcpStartIPError(false);
        } catch (e) {
          if (e instanceof ZodError) {
            setDhcpStartIPError(true);
          }
        }
        break;
      case "dhcpEnd":
        try {
          ipSchema.parse(ip);
          setDhcpEndIPError(false);
        } catch (e) {
          if (e instanceof ZodError) {
            setDhcpEndIPError(true);
          }
        }
        break;
    }
  };

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

  const availableInterfacesOptions = (index: number) => {
    return availableInterfaces.filter((iface) => !selectedInterfaces.includes(iface) || selectedInterfaces[index] === iface);
  };

  const availableDhcpOptions = () => {
    return selectedInterfaces.filter((iface) => iface !== "");
  };

  const removeInterface = (index: number) => {
    const updatedInterfaces = config.interfaces.filter((_, i) => i !== index);
    handleChange("interfaces", updatedInterfaces);
    setSelectedInterfaces((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNeighbor = (index: number) => {
    const updatedNeighbors = config.neighbors.filter((_, i) => i !== index);
    handleChange("neighbors", updatedNeighbors);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div>
        <label className="block text-sm font-medium">Router Name</label>
        <Input
          type="text"
          value={config.routerName}
          className={`border ${config.routerName ? 'border-green-500' : ''}`}
          onChange={(e) => handleChange("routerName", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">AS Number</label>
        <Input
          type="number"
          min={1}
          max={65534}
          value={config.asNumber}
          className={`border ${config.asNumber ? 'border-green-500' : ''}`}
          onChange={(e) => handleChange("asNumber", Number(e.target.value))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Interfaces</label>
        {config.interfaces.map((iface, i) => (
          <div key={i} className="md:flex md:space-x-2 my-2 space-y-3 md:space-y-0 mb-10 md:mb-0">
            {i == 0 && (
              <Input
                  placeholder="Interface Name"
                  value={iface.name}
                  disabled
              /> 
            )}
            { i != 0 && (
              <Select value={iface.name} onValueChange={(value) => handleInterfaceSelect(i, value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an Interface" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Interfaces</SelectLabel>
                    {availableInterfacesOptions(i).map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
              <Input
                className={`border ${ifaceIPError[i] !== undefined ? (ifaceIPError[i] ? 'border-red-500' : 'border-green-500') : ''}`}
                placeholder="IP Address (eg. 192.168.10.1/24)"
                value={iface.ip}
                onChange={(e) => {
                const updatedInterfaces = [...config.interfaces];
                updatedInterfaces[i] = { ...iface, ip: e.target.value };
                handleChange("interfaces", updatedInterfaces);
                validateIp("iface", e.target.value, i);
              }}
            />
            <Input
              placeholder="Peer Name"
              disabled={i === 0}
              value={iface.peer.name}
              className={`border ${iface.peer.name ? 'border-green-500' : ''}`}
              onChange={(e) => {
                const updatedInterfaces = [...config.interfaces];
                updatedInterfaces[i] = { ...iface, peer: { ...iface.peer, name: e.target.value } };
                handleChange("interfaces", updatedInterfaces);
              }}
            />
            <Input
              placeholder="Peer Interface"
              disabled={i === 0}
              value={iface.peer.interface}
              className={`border ${peerIfaceError[i] !== undefined ? (peerIfaceError[i] ? 'border-red-500' : 'border-green-500') : ''}`}
              onChange={(e) => {
                const updatedInterfaces = [...config.interfaces];
                updatedInterfaces[i] = { ...iface, peer: { ...iface.peer, interface: e.target.value } };
                handlePeerInterfaceChange(i, e.target.value);
              }}
            />
            <button
              disabled={i === 0}
              onClick={() => removeInterface(i)}
              className="text-red-500 hover:text-red-700 md:border-none md:bg-transparent md:p-0 border border-red-500 rounded-md px-2 py-1 flex items-center md:hidden"
            >
              <span className="mr-1">Delete Interface</span>
              <X size={20} />
            </button>
            <button
              disabled={i === 0}
              onClick={() => removeInterface(i)}
              className="text-red-500 hover:text-red-700 hidden sm:block"
            >
              <X size={20} />
            </button>
          </div>
        ))}
        <Button
          className="md:mt-2 mb-5 md:mb-0"
          onClick={() =>
            handleChange("interfaces", [...config.interfaces, { name: "", ip: "", peer: { name: "", interface: "" } }])
          }
        >
          Add Interface
        </Button>
      </div>

      <div>
        <label className="block text-sm font-medium">BGP Neighbors</label>
        {config.neighbors.map((neighbor, i) => (
          <div key={i} className="md:flex md:space-x-2 my-2 space-y-3 md:space-y-0 mb-10 md:mb-0">
            <Input
              className={`border ${neighborIPError[i] !== undefined ? (neighborIPError[i] ? 'border-red-500' : 'border-green-500') : ''}`}
              placeholder="Neighbor IP (eg. 192.168.10.2)"
              value={neighbor.ip}
              onChange={(e) => {
                const updatedNeighbors = [...config.neighbors];
                updatedNeighbors[i] = { ...neighbor, ip: e.target.value };
                handleChange("neighbors", updatedNeighbors);
                validateIp("neighbor", e.target.value, i);
              }}
            />
            <Input
              placeholder="AS Number"
              type="number"
              min={1}
              max={65534}
              className={`border ${neighbor.asNumber ? 'border-green-500' : ''}`}
              value={neighbor.asNumber}
              onChange={(e) => {
                const updatedNeighbors = [...config.neighbors];
                updatedNeighbors[i] = { ...neighbor, asNumber: Number(e.target.value) };
                handleChange("neighbors", updatedNeighbors);
              }}
            />
            <button
              disabled={i === 0}
              onClick={() => removeNeighbor(i)}
              className="text-red-500 hover:text-red-700 md:border-none md:bg-transparent md:p-0 border border-red-500 rounded-md px-2 py-1 flex items-center md:hidden"
            >
              <span className="mr-1">Delete Neighbor</span>
              <X size={20} />
            </button>
            <button
              disabled={i === 0}
              onClick={() => removeNeighbor(i)}
              className="text-red-500 hover:text-red-700 hidden sm:block"
            >
              <X size={20} />
            </button>
          </div>
        ))}
        <Button
          className="md:mt-2 mb-5 md:mb-0"
          onClick={() =>
            handleChange("neighbors", [...config.neighbors, { ip: "", asNumber: 0 }])
          }
        >
          Add Neighbor
        </Button>
      </div>
      <div className="border-t pt-4">
        <div className="flex space-x-4">
          <label className="block text-sm font-medium">Enable DHCP</label>
          <Switch
            checked={config.dhcp?.enabled ?? false}
            onCheckedChange={(checked) =>
              handleChange("dhcp", checked ? { enabled: true, subnet: "", interface: "", range: ["", ""] } : undefined)
            }
          />
        </div>
        {config.dhcp?.enabled && (
          <div className="mt-4 space-y-2">
            <label className="block text-sm font-medium">Subnet</label>
            <Input
              className={`border ${subnetIPError !== null ? (subnetIPError ? 'border-red-500' : 'border-green-500') : ''}`}
              placeholder="192.168.100.0/24"
              value={config.dhcp.subnet}
              onChange={(e) => {
                handleChange("dhcp", { ...config.dhcp!, subnet: e.target.value })
                validateIp("subnet", e.target.value, 0);
              }}
            />
            <label className="block text-sm font-medium">Interface Name</label>
            <Select value={config.dhcp.interface} onValueChange={(value) => handleChange("dhcp", { ...config.dhcp!, interface: value })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an Interface" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Interfaces</SelectLabel>
                  {availableDhcpOptions().map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <label className="block text-sm font-medium">DHCP Range</label>
            <div className="md:flex md:space-x-2 space-y-3 md:space-y-0 mb-10 md:mb-0">
              <Input
                className={`border ${dhcpStartIPError !== null ? (dhcpStartIPError ? 'border-red-500' : 'border-green-500') : ''}`}
                placeholder="Start IP (eg. 192.168.10.1)"
                value={config.dhcp.range[0]}
                onChange={(e) => {
                  const updatedDhcp = { 
                    ...config.dhcp!, 
                    range: [e.target.value, config.dhcp!.range[1]] as [string, string]
                  };
                  handleChange("dhcp", updatedDhcp);
                  validateIp("dhcpStart", e.target.value, 0);
                }}
              />
              <Input
                className={`border ${dhcpEndIPError !== null ? (dhcpEndIPError ? 'border-red-500' : 'border-green-500') : ''}`}
                placeholder="End IP (eg. 192.168.10.99)"
                value={config.dhcp.range[1]}
                onChange={(e) => {
                  const updatedDhcp = { 
                    ...config.dhcp!, 
                    range: [config.dhcp!.range[0], e.target.value] as [string, string]
                  };
                  handleChange("dhcp", updatedDhcp);
                  validateIp("dhcpEnd", e.target.value, 0);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

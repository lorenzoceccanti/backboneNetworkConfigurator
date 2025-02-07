import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"
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
  const [neighborIPError, setNeighborIPError] = useState<boolean[]>([]);
  const [subnetIPError, setSubnetIPError] = useState<boolean | null>(null);
  const [dhcpStartIPError, setDhcpStartIPError] = useState<boolean | null>(null);
  const [dhcpEndIPError, setDhcpEndIPError] = useState<boolean | null>(null);

  useEffect(() => {
    setConfig(initialValues);
  }, [initialValues]);

  const handleChange = <K extends keyof RouterConfig>(field: K, value: RouterConfig[K]) => {
    const updatedConfig = { ...config, [field]: value };
    setConfig(updatedConfig);
    onChange(updatedConfig);
  };

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

  const removeInterface = (index: number) => {
    const updatedInterfaces = config.interfaces.filter((_, i) => i !== index);
    handleChange("interfaces", updatedInterfaces);
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
          <div key={i} className="flex space-x-2 my-2">
            <Input
              placeholder="Name"
              className={`border ${iface.name ? 'border-green-500' : ''}`}
              disabled={i === 0}
              value={iface.name}
              onChange={(e) => {
                const updatedInterfaces = [...config.interfaces];
                updatedInterfaces[i] = { ...iface, name: e.target.value };
                handleChange("interfaces", updatedInterfaces);
                }}
              />
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
              className={`border ${iface.peer.interface ? 'border-green-500' : ''}`}
              onChange={(e) => {
                const updatedInterfaces = [...config.interfaces];
                updatedInterfaces[i] = { ...iface, peer: { ...iface.peer, interface: e.target.value } };
                handleChange("interfaces", updatedInterfaces);
              }}
            />
            <button
              disabled={i === 0}
              onClick={() => removeInterface(i)}
              className="text-red-500 hover:text-red-700"
            >
              <X size={20} />
            </button>
          </div>
        ))}
        <Button
          className="mt-2"
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
          <div key={i} className="flex space-x-2 my-2">
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
              onClick={() => removeNeighbor(i)}
              className="text-red-500 hover:text-red-700"
            >
              <X size={20} />
            </button>
          </div>
        ))}
        <Button
          className="mt-2"
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
              handleChange("dhcp", checked ? { enabled: true, subnet: "", range: ["", ""] } : undefined)
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
            <label className="block text-sm font-medium">DHCP Range</label>
            <div className="flex space-x-2">
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

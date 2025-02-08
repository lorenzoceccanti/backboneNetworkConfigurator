import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button";
import { HostConfig } from "@/lib/definitions";
import { X } from "lucide-react";
import { ipWithMaskSchema, ipSchema } from "@/lib/definitions";
import { ZodError } from "zod";

type HostConfigurationProps = {
  initialValues: HostConfig;
  onChange: (config: HostConfig) => void;
};

export default function HostConfiguration({
  initialValues,
  onChange,
}: HostConfigurationProps) {
  const [config, setConfig] = useState<HostConfig>(initialValues);
  const [ifaceIPError, setIfaceIPError] = useState<boolean[]>([]);
  const [gatewayIpError, setGatewayIpError] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    setConfig(initialValues);
  }, [initialValues]);

  const handleChange = <K extends keyof HostConfig>(field: K, value: HostConfig[K]) => {
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
      case "gateway":
        try {
          ipSchema.parse(ip);
          setGatewayIpError(false);
        } catch (e) {
          if (e instanceof ZodError) {
            setGatewayIpError(true);
          }
        }
        break;
    }
  };

  const removeInterface = (index: number) => {
    const updatedInterfaces = config.interfaces.filter((_, i) => i !== index);
    handleChange("interfaces", updatedInterfaces);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div>
        <label className="block text-sm font-medium">Host Name</label>
        <Input
          type="text"
          value={config.hostName}
          className={`border ${config.hostName ? 'border-green-500' : ''}`}
          onChange={(e) => handleChange("hostName", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Interfaces</label>
        {config.interfaces.map((iface, i) => (
          <div key={i} className="flex space-x-2 my-2">
            <Input
              placeholder="Name"
              className={`border ${iface.name ? 'border-green-500' : ''}`}
              value={iface.name}
              onChange={(e) => {
                const updatedInterfaces = [...config.interfaces];
                updatedInterfaces[i] = { ...iface, name: e.target.value };
                handleChange("interfaces", updatedInterfaces);
                }}
              />
              {!config.interfaces[i].dhcp && (
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
              )}
            <div className="flex space-x-4 my-2">
              <label className="block text-sm font-medium text-nowrap">Enable DHCP</label>
              <Switch
                checked={config.interfaces[i].dhcp}
                onCheckedChange={(checked) =>
                  handleChange("interfaces", [
                    ...config.interfaces.slice(0, i),
                    { ...iface, dhcp: checked },
                    ...config.interfaces.slice(i + 1),
                  ])
                }
              />
            </div>
            <button
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
            handleChange("interfaces", [...config.interfaces, { name: "", ip: "", dhcp: false }])
          }
        >
          Add Interface
        </Button>
      </div>

      <div>
        <label className="block text-sm font-medium">Gateway</label>
        <Input
          type="text"
          placeholder="IP Address (eg. 192.168.1.1)"
          value={config.gateway}
          className={`border ${gatewayIpError !== undefined ? (gatewayIpError ? 'border-red-500' : 'border-green-500') : ''}`}
          onChange={(e) => {
            handleChange("gateway", e.target.value)
            validateIp("gateway", e.target.value, 0);
          }}
        />
      </div>
    </div>
  );
}

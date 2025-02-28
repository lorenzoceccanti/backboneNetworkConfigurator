import { HostConfig } from "@/lib/definitions";
import { useHostConfig } from "@/hooks/use-host-config";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type HostConfigurationProps = {
  initialValues: HostConfig;
  onChange: (config: HostConfig) => void;
};

export default function HostConfiguration({
  initialValues,
  onChange,
}: HostConfigurationProps) {
  const {
    config,
    handleChange,
    handleInterfaceSelection,
    getAvailableInterfaces,
    removeInterface,
    form
  } = useHostConfig(initialValues, onChange);

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div>
        <label className="block text-sm font-medium">Host Name</label>
        <Input
          {...form.register("name")}
          type="text"
          value={config.name}
          className={`border ${form.formState.errors.name ? 'border-red-500' : 'border-green-500'}`}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        {form.formState.errors.name && <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Interfaces</label>
        {config.interfaces.map((iface, i) => (
          <div key={i} className="md:flex md:space-x-2 my-2 space-y-3 md:space-y-0 mb-10 md:mb-0">
            <Select {...form.register(`interfaces.${i}.name`)} value={config.interfaces[i].name} onValueChange={(value) => handleInterfaceSelection(i, value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an Interface" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Interfaces</SelectLabel>
                  {getAvailableInterfaces(i).map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {form.formState.errors.interfaces?.[i]?.name && <p className="text-red-500 text-sm">{form.formState.errors.interfaces[i].name.message}</p>}
            {!config.interfaces[i].dhcp && (
              <div className="w-full">
                <Input
                    {...form.register(`interfaces.${i}.ip`)}
                    className={`border ${iface.ip ? (form.formState.errors.interfaces?.[i]?.ip ? 'border-red-500' : 'border-green-500') : ''}`}
                    placeholder="IP Address (eg. 192.168.10.1/24)"
                    value={iface.ip}
                    onChange={(e) => {
                    const updatedInterfaces = [...config.interfaces];
                    updatedInterfaces[i] = { ...iface, ip: e.target.value };
                    handleChange("interfaces", updatedInterfaces);
                  }}
                />
                {form.formState.errors.interfaces?.[i]?.ip && <p className="text-red-500 text-sm">{form.formState.errors.interfaces[i].ip.message}</p>}
              </div>
            )}
            <div className="flex space-x-4 my-2">
              <label className="block text-sm font-medium text-nowrap my-auto">Enable DHCP</label>
              <Switch
                className="my-auto"
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
            handleChange("interfaces", [...config.interfaces, { name: "", ip: "", dhcp: false }])
          }
        >
          Add Interface
        </Button>
      </div>

      {!config.interfaces.some((iface) => iface.dhcp) && (
        <div>
          <label className="block text-sm font-medium">Gateway</label>
          <Input
            {...form.register("gateway")}
            type="text"
            placeholder="IP Address (eg. 192.168.1.1)"
            value={config.gateway}
            className={`border ${config.gateway ? (form.formState.errors.gateway ? 'border-red-500' : 'border-green-500') : ''}`}
            onChange={(e) => {
              handleChange("gateway", e.target.value);
            }}
          />
          {form.formState.errors.gateway && <p className="text-red-500 text-sm">{form.formState.errors.gateway.message}</p>}
        </div>
      )}
    </div>
  );
}
import { useRouterConfig } from "@/hooks/use-router-config";
import { RouterConfig } from "@/lib/definitions";
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
import { X } from "lucide-react";


type RouterConfigurationProps = {
  initialValues: RouterConfig;
  onChange: (config: RouterConfig) => void;
};

export default function RouterConfiguration({
  initialValues,
  onChange,
}: RouterConfigurationProps) {
  const {
    config,
    handleChange,
    handlePeerInterfaceSelect,
    handleInterfaceSelect,
    availableInterfacesOptions,
    removeInterface,
    removeInternetInterface,
    removeNeighbor,
    availableDhcpOptions,
    availableInternetOptions,
    handleInternetInterfaceSelect,
    form
  } = useRouterConfig(initialValues, onChange);

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div>
        <label className="block text-sm font-medium">Router Name</label>
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
        <label className="block text-sm font-medium">AS Number</label>
        <Input
          {...form.register("asn", { valueAsNumber: true })}
          type="number"
          value={config.asn}
          className={`border ${form.formState.errors.asn ? 'border-red-500' : 'border-green-500'}`}
          onChange={(e) => handleChange("asn", Number(e.target.value))}
        />
        {form.formState.errors.asn && <p className="text-red-500 text-sm">{form.formState.errors.asn.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Interfaces</label>
        {config.interfaces.map((iface, i) => (
          <div key={i} className="md:flex md:space-x-2 my-2 space-y-3 md:space-y-0 mb-10 md:mb-0">
            {i == 0 && (
              <div className="w-full">
                <Input
                  {...form.register(`interfaces.${i}.name`)}
                  placeholder="Interface Name"
                  value={iface.name}
                  disabled
                /> 
              </div>
            )}
            { i != 0 && (
              <div className="w-full">
                <Select value={iface.name} onValueChange={(value) => {form.setValue(`interfaces.${i}.name`, value, { shouldValidate: true }); handleInterfaceSelect(i, value)}}>
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
              </div>
            )}
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
            <div className="w-full">
              <Input
                placeholder="Peer Name"
                {...form.register(`interfaces.${i}.peer.name`)}
                disabled={i === 0}
                value={iface.peer.name}
                className={`border ${iface.peer.name ? (form.formState.errors.interfaces?.[i]?.peer?.name ? 'border-red-500' : 'border-green-500') : ''}`}
                onChange={(e) => {
                  const updatedInterfaces = [...config.interfaces];
                  updatedInterfaces[i] = { ...iface, peer: { ...iface.peer, name: e.target.value } };
                  handleChange("interfaces", updatedInterfaces);
                }}
              />
              {form.formState.errors.interfaces?.[i]?.peer?.name && <p className="text-red-500 text-sm">{form.formState.errors.interfaces[i].peer.name.message}</p>}
            </div>
            <div className="w-full">
              <Input
                placeholder="Peer Interface"
                {...form.register(`interfaces.${i}.peer.interface`)}
                disabled={i === 0}
                value={iface.peer.interface}
                className={`border ${iface.peer.interface ? (form.formState.errors.interfaces?.[i]?.peer?.interface ? 'border-red-500' : 'border-green-500') : ''}`}
                onChange={(e) => {
                  const updatedInterfaces = [...config.interfaces];
                  updatedInterfaces[i] = { ...iface, peer: { ...iface.peer, interface: e.target.value } };
                  handlePeerInterfaceSelect(i, e.target.value);
                }}
              />
              {form.formState.errors.interfaces?.[i]?.peer?.interface && <p className="text-red-500 text-sm">{form.formState.errors.interfaces[i].peer.interface.message}</p>}
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
            <div className="w-full">
              <Input
                {...form.register(`neighbors.${i}.ip`)}
                className={`border ${neighbor.ip ? (form.formState.errors.neighbors?.[i]?.ip ? 'border-red-500' : 'border-green-500') : ''}`}
                placeholder="Neighbor IP (eg. 192.168.10.2)"
                value={neighbor.ip}
                onChange={(e) => {
                  const updatedNeighbors = [...config.neighbors];
                  updatedNeighbors[i] = { ...neighbor, ip: e.target.value };
                  handleChange("neighbors", updatedNeighbors);
                }}
              />
              {form.formState.errors.neighbors?.[i]?.ip && <p className="text-red-500 text-sm">{form.formState.errors.neighbors[i].ip.message}</p>}
            </div>
            <div className="w-full">
              <Input
                placeholder="AS Number"
                {...form.register(`neighbors.${i}.asn`, { valueAsNumber: true })}
                type="number"
                min={1}
                max={65534}
                className={`border ${neighbor.asn ? (form.formState.errors.neighbors?.[i]?.asn ? 'border-red-500' : 'border-green-500') : ''}`}
                value={neighbor.asn}
                onChange={(e) => {
                  const updatedNeighbors = [...config.neighbors];
                  updatedNeighbors[i] = { ...neighbor, asn: Number(e.target.value) };
                  handleChange("neighbors", updatedNeighbors);
                }}
              />
              {form.formState.errors.neighbors?.[i]?.asn && <p className="text-red-500 text-sm">{form.formState.errors.neighbors[i].asn.message}</p>}
            </div>
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
            handleChange("neighbors", [...config.neighbors, { ip: "", asn: 0 }])
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
              {...form.register("dhcp.subnet")}
              className={`border ${form.formState.errors.dhcp?.subnet ? 'border-red-500' : 'border-green-500'}`}
              placeholder="192.168.100.0/24"
              value={config.dhcp.subnet}
              onChange={(e) => {
                handleChange("dhcp", { ...config.dhcp!, subnet: e.target.value })
              }}
            />
            {form.formState.errors.dhcp?.subnet && <p className="text-red-500 text-sm">{form.formState.errors.dhcp.subnet.message}</p>}
            <label className="block text-sm font-medium">Interface Name</label>
            <Select value={config.dhcp.interface} onValueChange={(value) => {form.setValue(`dhcp.interface`, value, { shouldValidate: true }); handleChange("dhcp", { ...config.dhcp!, interface: value })}}>
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
                {...form.register("dhcp.range.0")}
                className={`border ${form.formState.errors.dhcp?.range?.[0] ? 'border-red-500' : 'border-green-500'}`}
                placeholder="Start IP (eg. 192.168.10.1)"
                value={config.dhcp.range[0]}
                onChange={(e) => {
                  const updatedDhcp = { 
                    ...config.dhcp!, 
                    range: [e.target.value, config.dhcp!.range[1]] as [string, string]
                  };
                  handleChange("dhcp", updatedDhcp);
                }}
              />
              {form.formState.errors.dhcp?.range && <p className="text-red-500 text-sm">{form.formState.errors.dhcp.range.message}</p>}
              <Input
                {...form.register("dhcp.range.1")}
                className={`border ${form.formState.errors.dhcp?.range?.[1] ? 'border-red-500' : 'border-green-500'}`}
                placeholder="End IP (eg. 192.168.10.99)"
                value={config.dhcp.range[1]}
                onChange={(e) => {
                  const updatedDhcp = { 
                    ...config.dhcp!, 
                    range: [config.dhcp!.range[0], e.target.value] as [string, string]
                  };
                  handleChange("dhcp", updatedDhcp);
                }}
              />
              {form.formState.errors.dhcp?.range && <p className="text-red-500 text-sm">{form.formState.errors.dhcp.range.message}</p>}
            </div>
          </div>
        )}
      </div>
      <div className="border-t pt-4">
        <div className="flex space-x-4">
          <label className="block text-sm font-medium">Enable Internet</label>
          <Switch
            checked= {config.internet_iface?.enabled ?? false}
            onCheckedChange={(checked) => {
              if (!checked) {
                removeInternetInterface();
              }
              handleChange("internet_iface",  checked ? { enabled: true, name: "", ip : ""} : undefined) 
            }}
          />
        </div>
         
        {config.internet_iface?.enabled && (
          <div className="mt-4 space-y-2">
            <label className="block text-sm font-medium">Internet Interface</label>  
              <div className="md:flex md:space-x-2 my-2 space-y-3 md:space-y-0 mb-10 md:mb-0">  
                <div className="w-full">
                  <Select 
                    value={config.internet_iface.name} 
                    onValueChange={(value) => { 
                      form.setValue(`internet_iface.name`, value, { shouldValidate: true }); 
                      handleInternetInterfaceSelect(value)
                    }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder = "Select interface"/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Interfaces</SelectLabel>
                          {availableInternetOptions().map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              <div className="w-full">
                <Input
                  {...form.register("internet_iface.ip")}
                  className={`border ${config.internet_iface?.ip ? (form.formState.errors.internet_iface?.ip ? 'border-red-500' : 'border-green-500') : ''}`}
                  placeholder="IP Address (eg. 192.168.10.1/24)"
                  value={config.internet_iface.ip}
                  onChange={(e) => {
                    const updatedInterface = { ...config.internet_iface!,  ip: e.target.value};
                    handleChange("internet_iface", updatedInterface);
                  }}
                />
                {form.formState.errors.internet_iface?.ip && <p className="text-red-500 text-sm">{form.formState.errors.internet_iface.ip.message}</p>}
             </div>
            </div>
          </div>
        )}
      </div>
      <div className="border-t pt-4">
        <div className="flex space-x-4">
          <label className="block text-sm font-medium">Enable BGP Redistribution</label>
          <Switch
            checked={config.redistribute_bgp ?? false}
            onCheckedChange={(checked) => {
              handleChange("redistribute_bgp", checked);
            }}
          />
        </div>
      </div>
    </div>
  );
}

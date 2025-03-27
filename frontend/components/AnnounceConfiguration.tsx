import { AnnounceConfig, RouterResponse } from "@/lib/definitions";
import { useAnnounceConfig } from "@/hooks/use-announce-config";
import {Button} from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

type AnnounceConfigurationProps = {
  initialValues: AnnounceConfig;
  availableASOptions: number[];
  availableRouterOptions: RouterResponse[];
  onChange: (config: AnnounceConfig) => void;
};

export default function AnnounceConfiguration({
  initialValues,
  availableASOptions,
  availableRouterOptions,
  onChange,
}: AnnounceConfigurationProps) {
  const {
    config,
    form,
    handleChange,
    handleRouterChange,
    getAvailableASOptions,
    getAvailableNetworksOptions,
    handleToChange,
    addToField,
    removeToAS,
  } = useAnnounceConfig(initialValues, availableASOptions, onChange);

  return (
    <div className="my-3">
      <h1 className="font-bold text-base">Announce Network Configuration</h1>
      <p className="text-sm">
        The announce network configuration is used to announce a network to a specific AS.
      </p>
      <div className="text-sm grid grid-cols-3 gap-x-10 w-fit mx-auto my-5">
        {/* Router */}
        <div>
          <label className="block font-semibold mb-1">Router</label>
          <Select
            value={config.router === null ? "" : config.router}
            onValueChange={(value) => handleRouterChange(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a Router">
                {config.router ?? "Select"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Router</SelectLabel>
                {availableRouterOptions.map(
                  (option: RouterResponse) => (
                    <SelectItem key={option.name} value={option.name}>
                      {option.name}
                    </SelectItem>
                  )
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Networks */}
        <div>
          <label className="block font-semibold mb-1">Network to announce</label>
          <Select
            value={config.network_ip === null ? "" : config.network_ip}
            onValueChange={(value) => handleChange("network_ip", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a Network">
                {config.network_ip ?? "Select"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Networks</SelectLabel>
                {getAvailableNetworksOptions(config, availableRouterOptions).map(
                  (option: string) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  )
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        {/* To */}
        <div>
          <label className="block font-semibold mb-1">To AS</label>
            {config.to.map((value: number | string, i: number) => (
              <div key={i} className="flex space-x-4 mb-2">
                <Select
                  value={String(value)}
                  onValueChange={(val) => handleToChange(i, Number(val))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an AS">
                      {value === -1 ? "Internet" : value}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>AS Number</SelectLabel>
                      {getAvailableASOptions(config, availableASOptions, availableRouterOptions, i).map(
                        (option: number) => (
                          <SelectItem key={option} value={String(option)}>
                            {option === -1 ? "Internet" : option}
                          </SelectItem>
                        )
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {form.formState.errors.to?.[i] && (
                  <p className="text-red-500 text-sm">
                    {form.formState.errors.to[i].message}
                  </p>
                )}
                <button
                  disabled={i === 0}
                  onClick={() => removeToAS(i)}
                  className="text-red-500 hover:text-red-700 md:border-none md:bg-transparent md:p-0 border border-red-500 rounded-md px-2 py-1 flex items-center md:hidden"
                >
                  <span className="mr-1">Delete AS</span>
                  <X size={20} />
                </button>
                <button
                  disabled={i === 0}
                  onClick={() => removeToAS(i)}
                  className="text-red-500 hover:text-red-700 hidden sm:block"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
            <Button onClick={() => addToField(availableRouterOptions)}>
              Add To AS
            </Button>
          </div>
      </div>
    </div>
  );
}

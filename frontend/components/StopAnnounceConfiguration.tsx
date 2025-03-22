import { StopAnnounceConfig, RouterResponse } from "@/lib/definitions";
import { useStopAnnounceConfig } from "@/hooks/use-stop-announce-config";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StopAnnounceConfigurationProps = {
  initialValues: StopAnnounceConfig;
  announcedNetworks: Record<string, string[]>;
  availableRouterOptions: RouterResponse[];
  onChange: (config: StopAnnounceConfig) => void;
};

export default function StopAnnounceConfiguration({
  initialValues,
  announcedNetworks,
  availableRouterOptions,
  onChange,
}: StopAnnounceConfigurationProps) {
  const {
    config,
    handleChange,
    form,
    handleRouterChange,
    getAvailableNetworksOptions,
  } = useStopAnnounceConfig(initialValues, onChange);

  return (
    <div className="my-3">
    <h1 className="font-bold text-base">Stop Announce Configuration</h1>
    <p className="text-sm">
      The stop announce configuration is used to stop announcing a network to a specific router.
    </p>
    <div className="text-sm grid grid-cols-2 gap-x-10 w-fit mx-auto my-5">
        <div className="w-full">
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
          {form.formState.errors.router && ( <p className="text-red-500 text-xs mt-1">{form.formState.errors.router.message}</p>)}
        </div>

        {/* Networks */}
        <div className="w-full">
          <label className="block font-semibold mb-1">Network to stop announce</label>
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
                {getAvailableNetworksOptions(config, announcedNetworks).map(
                  (option: string) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  )
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
          {form.formState.errors.network_ip && ( <p className="text-red-500 text-xs mt-1">{form.formState.errors.network_ip.message}</p>)}
        </div> 
      </div>
    </div>
  );
}

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
    form,
    handleChange,
    handleRouterChange,
    getAvailableRouterOptions,
    getAvailableNetworksOptions,
  } = useStopAnnounceConfig(initialValues, announcedNetworks, onChange);

  return (
    <div>
      <h1 className="font-bold text-base"> Stop Announce Configuration</h1>
      <p className="text-sm">
      Stop Announce allows you to stop the announcement of a network that &quot;Router&quot; was announcing
      </p>

      <div className="md:flex md:space-x-2 my-2 space-y-3 md:space-y-0 mb-10 md:mb-0">
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
                {getAvailableRouterOptions(config, availableRouterOptions).map(
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
                {getAvailableNetworksOptions(config, availableRouterOptions, announcedNetworks).map(
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
        
        
      </div>
    </div>
  );
}

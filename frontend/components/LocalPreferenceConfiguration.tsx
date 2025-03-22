import { LocalPreferenceConfig, RouterResponse} from "@/lib/definitions";
import { useLocalPreferenceConfig } from "@/hooks/use-local-preference";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


type LocalPreferenceConfigurationProps = {
  initialValues: LocalPreferenceConfig;
  availableASOptions: number[];
  availableRouters: RouterResponse[];
  onChange: (config: LocalPreferenceConfig) => void;
};

export default function LocalPreferenceConfiguration({
  initialValues,
  availableASOptions,
  availableRouters,
  onChange,
}: LocalPreferenceConfigurationProps) {
  const {
    config,
    form,
    handleChange,
    getAvailableRouterOptions,
    getAvailableLPASOptions,
    getAvailableNetworksOptions
  } = useLocalPreferenceConfig(initialValues, onChange);

  return (
    <div className="my-3">
      <h1 className="font-bold text-base">Local Preference Configuration</h1>
      <p className="text-sm">
        The local preference attribute is used to select the exit point for an autonomous system.
      </p>
      <div className="text-sm grid grid-cols-4 gap-x-10 w-fit mx-auto my-5">
        {/* AS Number */}
        <div>
          <label className="block font-semibold mb-1">AS Number</label>
          <Select
            value={config.asn === null ? "" : String(config.asn)}
            onValueChange={(value) => handleChange("asn", Number(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an AS">
                {config.asn ?? "Select"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>AS Number</SelectLabel>
                {getAvailableLPASOptions(config, availableASOptions, "asn").map(
                  (option: number) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  )
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
          {form.formState.errors.asn && <p className="text-red-500 text-sm">{form.formState.errors.asn.message}</p>}
        </div>
        {/* Neighbor router */}
        <div>
          <label className="block font-semibold mb-1">Neighbor router</label>
          <Select
            value={config.asn === null ? "" : String(config.asn)}
            onValueChange={(value) => handleChange("neighbor_router", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a router">
                {config.neighbor_router ?? "Select"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Router name</SelectLabel>
                  {getAvailableRouterOptions(config, availableRouters).map(
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
        {/* Network */}
        <div className = "w-full">
          <label className="block font-semibold mb-1">Network</label>
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
                {getAvailableNetworksOptions(config, availableRouters).map(
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
        {/* Local Preference */}
        <div className = "w-full">
          <label className="block font-semibold mb-1">Local Preference</label>
          <Input
            {...form.register("local_preference", { valueAsNumber: true })}
            type = "number"
            placeholder="Local Preference"
            value={config.local_preference}
            onChange={(e) => {
              const updatedLocalPreference = Number(e.target.value);
              handleChange("local_preference", updatedLocalPreference);
            }}
          />
          {form.formState.errors.local_preference && <p className="text-red-500 text-sm">{form.formState.errors.local_preference.message}</p>}
        </div>
      </div>
    </div>
  );
}


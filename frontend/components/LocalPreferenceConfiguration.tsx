import { LocalPreferenceConfig, RouterResponse} from "@/lib/definitions";
import { useLocalPreferenceConfig } from "@/hooks/use-localPreference";
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
  } = useLocalPreferenceConfig(initialValues, onChange);

  return (
    <div className="border-t pt-4">
      <h1 className="font-bold text-base">Local Preference Configuration</h1>
      <p className="text-sm">
        Local Preference allows to select a preferred path to send outbound traffic
      </p>
      <div className="md:flex md:space-x-2 my-2 space-y-3 md:space-y-0 mb-10 md:mb-0">
            <div className="w-full">
                <label className="block font-semibold mb-1">AS</label>
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
            <div className = "w-full">
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
            <div className = "w-full">
                <label className="block font-semibold mb-1">Local Preference</label>
                <Input
                  {...form.register("local_preference")}
                  type = "number"
                  placeholder="Local Preference"
                  value={config.local_preference}
                  onChange={(e) => {
                    const updatedInterface = Number(e.target.value);
                    handleChange("local_preference", updatedInterface);
                  }}
                />
                
            </div>
        </div>
    </div>
  );
}


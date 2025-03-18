import { LocalPreferenceConfig } from "@/lib/definitions";
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
  onChange: (config: LocalPreferenceConfig) => void;
};

export default function LocalPreferenceConfiguration({
  initialValues,
  availableASOptions,
  onChange,
}: LocalPreferenceConfigurationProps) {
  const {
    config,
    form,
    handleChange,
    getAvailableLPASOptions,
  } = useLocalPreferenceConfig(initialValues, availableASOptions, onChange);

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
                <label className="block font-semibold mb-1">Neighbor ip</label>
                <Input
                  {...form.register("neighbor_ip")}
                  className={`border ${config.neighbor_ip ? (form.formState.errors.neighbor_ip ? 'border-red-500' : 'border-green-500') : ''}`}
                  placeholder="IP Address (eg. 192.168.10.1)"
                  value={config.neighbor_ip}
                  onChange={(e) => {
                    const updatedInterface = e.target.value;
                    handleChange("neighbor_ip", updatedInterface);
                  }}
                />
            </div>
            <div className = "w-full">
                <label className="block font-semibold mb-1">Local Preference</label>
                <Input
                  {...form.register("local_preference")}
                  className={`border ${config.local_preference ? (form.formState.errors.local_preference ? 'border-red-500' : 'border-green-500') : ''}`}
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


import { LocalPreferenceConfig } from "@/lib/definitions";
import { useLocalPreferenceConfig } from "@/hooks/use-localPreference";
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
    getAvailableASOptions,
  } = useLocalPreferenceConfig(initialValues, availableASOptions, onChange);

  return (
    <div>
      <h1 className="font-bold text-base">Local Preference Configuration</h1>
      <p className="text-sm">
        Local Preference allows to select a preferred path to send outbound traffic
      </p>

      <div className="text-sm grid grid-cols-2 gap-x-10 w-fit mx-auto my-5">
        <div>
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
                {getAvailableASOptions(config, availableASOptions, "asn").map(
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

        
      </div>
    </div>
  );
}

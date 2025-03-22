import { PeeringConfig } from "@/lib/definitions";
import { usePeeringConfig } from "@/hooks/use-peering-config";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


type PeeringConfigurationProps = {
  initialValues: PeeringConfig;
  availableASOptions: number[];
  onChange: (config: PeeringConfig) => void;
};

export default function PeeringConfiguration({
  initialValues,
  availableASOptions,
  onChange,
}: PeeringConfigurationProps) {
  const {
    config,
    form,
    handleChange,
    getAvailableASOptions,
  } = usePeeringConfig(initialValues, availableASOptions, onChange);

  return (
    <div className="my-3">
      <h1 className="font-bold text-base">Peering Configuration</h1>
      <p className="text-sm">
        Peering allows direct traffic exchange between &quot;From&quot; AS and &quot;To&quot; AS
        without an intermediary.
      </p>

      <div className="text-sm grid grid-cols-2 gap-x-10 w-fit mx-auto my-5">
        {/* From AS */}
        <div>
          <label className="block font-semibold mb-1">From AS</label>
          <Select
            value={config.fromAS === null ? "" : String(config.fromAS)}
            onValueChange={(value) => handleChange("fromAS", Number(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an AS">
                {config.fromAS ?? "Select"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>AS Number</SelectLabel>
                {getAvailableASOptions(config, availableASOptions, "fromAS").map(
                  (option: number) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  )
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
          {form.formState.errors.fromAS && <p className="text-red-500 text-sm">{form.formState.errors.fromAS.message}</p>}
        </div>

        {/* To AS */}
        <div>
          <label className="block font-semibold mb-1">To AS</label>
          <Select
            value={config.toAS === null ? "" : String(config.toAS)}
            onValueChange={(value) => handleChange("toAS", Number(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an AS">
                {config.toAS ?? "Select"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>AS Number</SelectLabel>
                {getAvailableASOptions(config, availableASOptions, "toAS").map(
                  (option: number) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  )
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
          {form.formState.errors.toAS && <p className="text-red-500 text-sm">{form.formState.errors.toAS.message}</p>}
        </div>
      </div>
    </div>
  );
}

import { TransitConfig } from "@/lib/definitions";
import { useTransitConfig } from "@/hooks/use-transit-config";
import { Button } from "@/components/ui/button";
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

type TransitConfigurationProps = {
  initialValues: TransitConfig;
  availableASOptions: number[];
  onChange: (config: TransitConfig) => void;
};

export default function TransitConfiguration({
  initialValues,
  availableASOptions,
  onChange,
}: TransitConfigurationProps) {
  const {
    config,
    form,
    handleChange,
    handleToChange,
    addToField,
    getAvailableASOptions,
    removeToAS,
  } = useTransitConfig(initialValues, availableASOptions, onChange);

  return (
    <div className="my-3">
      <h1 className="font-bold text-base">Transit Configuration</h1>
      <p className="text-sm">
        Transit means that traffic from the &quot;From&quot; AS can reach
        the &quot;To&quot; AS via the intermediate AS &quot;Through&quot;,
        which has a business relationship with both &quot;From&quot; and
        &quot;To&quot;, allowing end-to-end connectivity.
      </p>

      <div className="text-sm grid grid-cols-3 gap-x-10 w-fit mx-auto my-5">
        {/* From */}
        <div>
          <label className="block font-semibold mb-1">From AS</label>
          <Select
            value={config.from === null ? "" : String(config.from)}
            onValueChange={(value) => handleChange("from", Number(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an AS">
                {config.from ?? "Select"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>AS Number</SelectLabel>
                {getAvailableASOptions(config, availableASOptions, "from").map((option: number) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {form.formState.errors.from && <p className="text-red-500 text-sm">{form.formState.errors.from.message}</p>}
        </div>

        {/* Through */}
        <div>
          <label className="block font-semibold mb-1">Through AS</label>
          <Select
            value={config.through === null ? "" : String(config.through)}
            onValueChange={(value) => handleChange("through", Number(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an AS">
                {config.through ?? "Select"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>AS Number</SelectLabel>
                {getAvailableASOptions(config, availableASOptions, "through").map((option: number) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {form.formState.errors.through && <p className="text-red-500 text-sm">{form.formState.errors.through.message}</p>}
        </div>

        {/* To */}
        <div>
          <label className="block font-semibold mb-1">To AS</label>
          {config.to.map((value: number, i: number) => (
            <div key={i} className="flex space-x-4 mb-2">
              <Select
                value={String(value)}
                onValueChange={(val) => handleToChange(i, Number(val))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an AS">
                    {value}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>AS Number</SelectLabel>
                    {getAvailableASOptions(config, availableASOptions, "to", i).map(
                      (option: number) => (
                        <SelectItem key={option} value={String(option)}>
                          {option}
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
                <span className="mr-1">Delete Interface</span>
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
          <Button onClick={addToField}>
            Add To AS
          </Button>
        </div>
      </div>
    </div>
  );
}

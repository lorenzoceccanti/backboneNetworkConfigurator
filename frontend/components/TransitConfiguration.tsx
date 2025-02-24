import { useEffect, useState } from "react";
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
import { TransitConfig } from '../lib/definitions';

/*export type TransitConfig = {
  from: number | null;
  through: number | null;
  to: number[];
};*/

type TransitConfigurationProps = {
  initialValues: TransitConfig;
  availableASOptions: number[];
  onChange: (config: TransitConfig) => void;
};

function getAvailableOptionsForField(
  config: TransitConfig,
  availableAS: number[],
  field: "from" | "through" | "to",
  toIndex?: number
): number[] {
  // build a list of AS numbers that are already in use
  const used: number[] = [];

  if (field !== "from" && config.from !== null) {
    used.push(config.from);
  }
  if (field !== "through" && config.through !== null) {
    used.push(config.through);
  }
  config.to.forEach((val, i) => {
    if (field !== "to" || i !== toIndex) {
      used.push(val);
    }
  });

  // filter out the AS numbers that are already in use
  const filtered = availableAS.filter((opt) => !used.includes(opt));

  // calculate the current value for the field
  let currentValue: number | null = null;
  if (field === "from") {
    currentValue = config.from;
  } else if (field === "through") {
    currentValue = config.through;
  } else {
    // field === "to"
    currentValue = config.to[toIndex!];
  }

  // add the current value if it's not null and not already in the list
  if (currentValue !== null && !filtered.includes(currentValue)) {
    filtered.push(currentValue);
  }

  // optional: sort the list
  filtered.sort((a, b) => a - b);
  return filtered;
}

export default function TransitConfiguration({
  initialValues,
  availableASOptions,
  onChange,
}: TransitConfigurationProps) {
  const [config, setConfig] = useState<TransitConfig>(initialValues);

  // useEffect is used to update the local state 
  // when the parent component changes it
  useEffect(() => {
    setConfig(initialValues);
  }, [initialValues]);

  // handleChange is a generic function that updates a single field 
  // and notifies the parent component of the change
  const handleChange = <K extends keyof TransitConfig>(field: K, value: TransitConfig[K]) => {
    const updatedConfig = { ...config, [field]: value };
    setConfig(updatedConfig);
    onChange(updatedConfig);
  };

  // handleToChange is a specific function that updates a single "to" field
  const handleToChange = (index: number, value: number) => {
    const updatedTo = [...config.to];
    updatedTo[index] = value;
    handleChange("to", updatedTo);
  };

  // addToField is a specific function that adds a new "to" field
  const addToField = () => {
    // get the AS numbers that are already in use
    // and find the first available one
    const used = new Set<number>([
      config.from ?? undefined,
      config.through ?? undefined,
      ...config.to,
    ].filter((x): x is number => x !== null));

    const newOption = availableASOptions.find((opt) => !used.has(opt));
    if (newOption !== undefined) {
      handleChange("to", [...config.to, newOption]);
    }
  };

  return (
    <div>
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
                {getAvailableOptionsForField(config, availableASOptions, "from").map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
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
                {getAvailableOptionsForField(config, availableASOptions, "through").map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* To */}
        <div>
          <label className="block font-semibold mb-1">To AS</label>
          {config.to.map((value, index) => (
            <div key={index} className="mb-2">
              <Select
                value={String(value)}
                onValueChange={(val) => handleToChange(index, Number(val))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an AS">
                    {value}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>AS Number</SelectLabel>
                    {getAvailableOptionsForField(config, availableASOptions, "to", index).map(
                      (option) => (
                        <SelectItem key={option} value={String(option)}>
                          {option}
                        </SelectItem>
                      )
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
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

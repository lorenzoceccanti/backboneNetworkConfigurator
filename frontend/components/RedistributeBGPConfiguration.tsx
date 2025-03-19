import { RedistributeBGPConfig } from "@/lib/definitions";
import { useRedistributeBGPConfig } from "@/hooks/use-redistribute-bgp-config";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type RedistributeBGPConfigurationProps = {
  initialValues: RedistributeBGPConfig;
  availableRoutersOptions: string[];
  onChange: (config: RedistributeBGPConfig) => void;
};

export default function RedistributeBGPConfiguration({
  initialValues,
  availableRoutersOptions,
  onChange,
}: RedistributeBGPConfigurationProps) {
  const {
    config,
    form,
    handleChange
  } = useRedistributeBGPConfig(initialValues, availableRoutersOptions, onChange);
  
  return (
    <div>
      <h1 className="font-bold text-base">Redistribute BGP Configuration</h1>
      <p className="text-sm">
        Redistribute BGP allows the router to redistribute BGP routes into the OSPF routing table.
      </p>

      <div className="text-sm grid grid-cols-2 gap-x-10 w-fit mx-auto my-5">
        {/* Router */}
        <div>
          <label className="block font-semibold mb-1">Router</label>
          <Select
            value={config.router === null ? "" : String(config.router)}
            onValueChange={(value) => handleChange("router", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a Router">
                {config.router ?? "Select"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Router Name</SelectLabel>
                {availableRoutersOptions.map(
                  (option: string) => (
                    <SelectItem key={option} value={String(option)}>
                      {option}
                    </SelectItem>
                  )
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
          {form.formState.errors.router && <p className="text-red-500 text-sm">{form.formState.errors.router.message}</p>}
        </div>

        {/* Switch for redistribute */}
        <div>
          <label className="block font-semibold mb-1 text-center">Redistribute</label>
          <div className="mx-auto w-fit">
            <Switch
              checked={config.redistribute}
              onCheckedChange={(value) => handleChange("redistribute", value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
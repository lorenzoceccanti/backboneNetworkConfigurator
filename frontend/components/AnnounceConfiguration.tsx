import { AnnounceConfig } from "@/lib/definitions";
import { useAnnounceConfig } from "@/hooks/use-announce-config";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


type AnnounceConfigurationProps = {
  initialValues: AnnounceConfig;
  availableASOptions: number[];
  onChange: (config: AnnounceConfig) => void;
};

export default function AnnounceConfiguration({
  initialValues,
  availableASOptions,
  onChange,
}: AnnounceConfigurationProps) {
  const {
    config,
    form,
    handleChange,
    getAvailableASOptions,
  } = useAnnounceConfig(initialValues, availableASOptions, onChange);

  return (
    <div>
      <h1 className="font-bold text-base">Announce Configuration</h1>
      <p className="text-sm">
        Annouce allows to announce an AS local network  to &quot;To&quot; AS
      </p>

      <div className="text-sm grid grid-cols-2 gap-x-10 w-fit mx-auto my-5">
        <div>
          <label className="block font-semibold mb-1">Router</label>
          <Select
            value={config.router === null ? "" : config.router}
            onValueChange={(value) => handleChange("router", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a Router">
                {config.router ?? "Select"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>R</SelectLabel>
                {getAvailableASOptions(config, availableASOptions, "router").map(
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

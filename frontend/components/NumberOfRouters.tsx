"use client";

import { RouterConfig } from "@/lib/definitions";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import RouterConfiguration from "./RouterConfiguration";

const formSchema = z.object({
  number_of_routers: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().gte(1).lte(10)
  ),
});

export default function NumberOfRouters() {
  const [routerConfigs, setRouterConfigs] = useState<RouterConfig[]>([]);
  const [expandedItem, setExpandedItem] = useState<string | undefined>(undefined);

  const { toast } = useToast()

  const handleRouterConfigChange = (index: number, config: RouterConfig) => {
    const newConfigs = [...routerConfigs];
    newConfigs[index] = config;
    setRouterConfigs(newConfigs);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      number_of_routers: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setRouterConfigs(
      Array(values.number_of_routers).fill({
        routerName: "",
        asNumber: 0,
        interfaces: [
          {
            name: "Loopback0",
            ip: "",
            peer: {
              name: "",
              interface: "",
            },
          },
        ],
        neighbors: [],
      })
    );
  }

  const handleGenerateConfiguration = async (routerConfigs: RouterConfig[]) => {
    const formattedConfig = {
      routers: routerConfigs.map((router) => ({
        name: router.routerName,
        asn: router.asNumber,
        interfaces: router.interfaces.map((iface) => ({
          name: iface.name,
          ip: iface.ip,
          peer: {
            name: iface.peer.name,
            interface: iface.peer.interface,
          }
        })),
        neighbors: router.neighbors.map((neighbor) => ({
          ip: neighbor.ip,
          asn: neighbor.asNumber,
        })),
        ...(router.dhcp && { dhcp: router.dhcp }),
      })),
    };

    console.log(JSON.stringify(formattedConfig))

  
    try { // http://192.168.1.16:5000/configure http://localhost:5000/configure
      const response = await fetch("http://192.168.1.16:5000/configure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedConfig),
      });
  
      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your request: " + response.statusText,
        })
        throw new Error(`Error on request: ${response.statusText}`);
      }
  
      toast({
        variant: "default",
        title: "Configuration generated!",
        description: "The configuration has been generated successfully.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request: " + error,
      })
    }
  };
  
  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-fit mx-auto flex space-x-2"
        >
          <FormField
            control={form.control}
            name="number_of_routers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How many routers?</FormLabel>
                <FormControl>
                  <Input type="number" min={1} max={10} className="w-full" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>

      <div className="space-y-4 max-w-5xl mx-auto my-10">
        <Accordion
          type="single"
          collapsible
          value={expandedItem}
          onValueChange={setExpandedItem}
        >
          {routerConfigs.map((config, index) => (
            <AccordionItem key={index} value={`item-${index + 1}`}>
              <AccordionTrigger>Router {index + 1}</AccordionTrigger>
              <AccordionContent>
                <RouterConfiguration
                  initialValues={config}
                  onChange={(updatedConfig) =>
                    handleRouterConfigChange(index, updatedConfig)
                  }
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        {routerConfigs.length > 0 && routerConfigs.every(config => 
          config.routerName && 
          config.asNumber && 
          config.interfaces.length > 0 && 
          config.neighbors.length > 0 &&
          config.interfaces.every(iface => iface.name && iface.ip && iface.peer) &&
          config.neighbors.every(neighbor => neighbor.ip && neighbor.asNumber)
        ) && (
          <Button className="w-fit my-4" onClick={() => handleGenerateConfiguration(routerConfigs)}>
            Generate Configuration
          </Button>
        )}
      </div>
    </>
  );
}

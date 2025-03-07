"use client";

import { useState } from "react";
import { useMainConfig } from "@/hooks/use-main-config";
import RouterConfiguration from "@/components/RouterConfiguration";
import HostConfiguration from "@/components/HostConfiguration";
import TransitConfiguration from "@/components/TransitConfiguration";
import NetworkVisualization from "@/components/NetworkVisualization";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/Spinner";
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

export default function MainConfiguration() {
  const [expandedItem, setExpandedItem] = useState<string | undefined>(undefined);
  const {
    form, 
    onSubmit,
    routerConfigs, 
    updateRouterConfig,
    hostConfigs, 
    updateHostConfig,
    transitConfigs, 
    isConfigGenerated,
    isDeploying,
    getNetworkTopologyResponse,
    handleGenerateConfiguration,
    handleDeployNetwork,
    handleTransitConfigsChange,
    getAvailableASOptions,
    handleTransitConfigsSend,
  } = useMainConfig();
  
  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5 w-fit mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <FormField
              control={form.control}
              name="number_of_hosts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How many hosts?</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={10} className="w-full" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="server_ip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is the server IP?</FormLabel>
                  <FormControl>
                    <Input type="text" className="w-full" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="project_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What is the name of the project?</FormLabel>
                  <FormControl>
                    <Input type="text" className="w-full" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="mx-auto w-full">Submit</Button>
        </form>
      </Form>

      <div className="space-y-4 max-w-5xl lg:mx-auto my-10 mx-10">
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
                    updateRouterConfig(index, updatedConfig)
                  }
                />
              </AccordionContent>
            </AccordionItem>
          ))}
          {hostConfigs.map((config, index) => (
              <AccordionItem key={index} value={`item-${routerConfigs.length + index + 1}`}>
                <AccordionTrigger>Host {index + 1}</AccordionTrigger>
                <AccordionContent>
                  <HostConfiguration
                    initialValues={config}
                    onChange={(updatedConfig) =>
                      updateHostConfig(index, updatedConfig)
                    }
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
        </Accordion>
          {routerConfigs.length > 0 && 
          hostConfigs.length > 0 && 
          routerConfigs.every(config => 
            config.name && 
            config.asn && 
            config.interfaces.length > 0 && 
            config.neighbors.length > 0 &&
            config.interfaces.every(iface => iface.name && iface.ip && iface.peer) &&
            config.neighbors.every(neighbor => neighbor.ip && neighbor.asn)
          ) && 
          hostConfigs.every(config =>
            config.name &&
            config.interfaces.length > 0 &&
            config.interfaces.every(iface => iface.name && (iface.dhcp || iface.ip)) &&
            // if none of the interfaces have dhcp enabled, then gateway is required
            (config.interfaces.some(iface => iface.dhcp) || config.gateway)
          ) && (
            <div className="sm:space-x-3">
              <Button className="w-fit my-4" onClick={() => handleGenerateConfiguration(routerConfigs, hostConfigs)}>
                Generate Configuration
              </Button>
              <Button disabled={!isConfigGenerated} className="w-fit my-4" onClick={() => handleDeployNetwork()}>
                Deploy Network {isDeploying ? <Spinner /> : ""}
              </Button>
            </div>
          )}
          {isConfigGenerated && getNetworkTopologyResponse() && (
            <NetworkVisualization config={getNetworkTopologyResponse()!}/>
          )}
          {transitConfigs && (
            <div>
              <TransitConfiguration
                initialValues={transitConfigs}
                availableASOptions={getAvailableASOptions()}
                onChange={handleTransitConfigsChange}
              />
              <Button className="w-fit" onClick={handleTransitConfigsSend}>
                Send Transit Configuration
              </Button>
            </div>
          )}
        </div>
    </>
  );
}

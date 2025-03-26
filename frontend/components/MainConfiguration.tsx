"use client";

import { useState } from "react";
import { useMainConfig } from "@/hooks/use-main-config";
import RouterConfiguration from "@/components/RouterConfiguration";
import HostConfiguration from "@/components/HostConfiguration";
import TransitConfiguration from "@/components/TransitConfiguration";
import PeeringConfiguration from "./PeeringConfiguration";
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
import LocalPreferenceConfiguration from "./LocalPreferenceConfiguration";
import AnnounceConfiguration from "./AnnounceConfiguration";
import StopAnnounceConfiguration from "./StopAnnounceConfiguration";

export default function MainConfiguration() {
  const [expandedItem, setExpandedItem] = useState<string | undefined>(undefined);
  const [expandedItemPolicies, setExpandedItemPolicies] = useState<string | undefined>(undefined);
  const {
    form, 
    onSubmit,
    routerConfigs, 
    updateRouterConfig,
    hostConfigs, 
    updateHostConfig,
    transitConfigs,
    peeringConfigs,
    localPreferenceConfigs,
    announceConfigs,
    stopAnnounceConfigs,
    announcedNetworks,
    isConfigGenerated,
    isDeploying,
    getNetworkTopologyResponse,
    handleGenerateConfiguration,
    handleDeployNetwork,
    handleTransitConfigsChange,
    handlePeeringConfigsChange,
    handleLocalPreferenceConfigsChange,
    handleAnnounceConfigsChange,
    handleStopAnnounceConfigsChange,
    getAvailableASOptions,
    getAvailableASOptionsWithInternet,
    getAvailableRouters,
    handleTransitConfigsSend,
    handlePeeringConfigsSend,
    handleLocalPreferenceConfigsSend,
    handleAnnounceConfigSend,
    handleStopAnnounceConfigSend
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
          value={expandedItemPolicies}
          onValueChange={setExpandedItemPolicies}
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
        <Accordion
          type="single"
          collapsible
          value={expandedItem}
          onValueChange={setExpandedItem}
        >
          {transitConfigs && (
            <AccordionItem value="transit">
              <AccordionTrigger>Transit Policy Configuration</AccordionTrigger>
              <AccordionContent>
                <TransitConfiguration
                  initialValues={transitConfigs}
                  availableASOptions={getAvailableASOptionsWithInternet()}
                  onChange={handleTransitConfigsChange}
                />
                <Button className="w-fit" onClick={handleTransitConfigsSend}>
                  Send Transit Configuration
                </Button>
              </AccordionContent>
            </AccordionItem>
          )}
          {peeringConfigs && (
            <AccordionItem value="peering">
              <AccordionTrigger>Peering Policy Configuration</AccordionTrigger>
              <AccordionContent>
                <PeeringConfiguration
                  initialValues={peeringConfigs}
                  availableASOptions={getAvailableASOptions()}
                  onChange={handlePeeringConfigsChange}
                />
                <Button className="w-fit" onClick={handlePeeringConfigsSend}>
                  Send Peering Configuration
                </Button>
              </AccordionContent>
            </AccordionItem>
          )}
          {localPreferenceConfigs && (
            <AccordionItem value="local-preference">
              <AccordionTrigger>Local Preference Configuration</AccordionTrigger>
              <AccordionContent>
                <LocalPreferenceConfiguration
                  initialValues={localPreferenceConfigs}
                  availableASOptions={getAvailableASOptions()}
                  availableRouters={getAvailableRouters()}
                  onChange={handleLocalPreferenceConfigsChange}
                />
                <Button className="w-fit" onClick={handleLocalPreferenceConfigsSend}>
                  Send Local Preference Configuration
                </Button>
              </AccordionContent>
            </AccordionItem>
          )}
          {announceConfigs && (
            <AccordionItem value="announce">
              <AccordionTrigger>Announce Network Configuration</AccordionTrigger>
              <AccordionContent>
                <AnnounceConfiguration
                  initialValues={announceConfigs}
                  availableASOptions={getAvailableASOptions()}
                  availableRouterOptions={getAvailableRouters()}
                  onChange={handleAnnounceConfigsChange}
                />
                <Button className="w-fit" onClick={handleAnnounceConfigSend}>
                  Send Announce Configuration
                </Button>
              </AccordionContent>
            </AccordionItem>
          )}
          {stopAnnounceConfigs && (
            <AccordionItem value="stop-announce">
              <AccordionTrigger>Stop Announce Network Configuration</AccordionTrigger>
              <AccordionContent>
                <StopAnnounceConfiguration
                  initialValues={stopAnnounceConfigs}
                  announcedNetworks={announcedNetworks}
                  availableRouterOptions={getAvailableRouters()}
                  onChange={handleStopAnnounceConfigsChange}
                />
                <Button className="w-fit" onClick={handleStopAnnounceConfigSend}>
                  Send Stop Announce Configuration
                </Button>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </>
  );
}

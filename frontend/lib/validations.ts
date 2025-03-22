import { z } from "zod";

export const ipWithMaskSchema = z.string().regex(
  /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\/([0-9]|[12][0-9]|3[0-2])$/,
  "Invalid IP format (must be CIDR e.g., 192.168.1.1/24)"
);

export const ipSchema = z.string().regex(
  /^(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/,
  "Invalid IP format (e.g., 192.168.1.1)"
);

export const mainConfigurationFormSchema = z.object({
  number_of_routers: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().gte(1).lte(10)
  ),
  number_of_hosts: z.preprocess(
    (a) => parseInt(z.string().parse(a), 10),
    z.number().gte(1).lte(10)
  ),
  server_ip: z.string().nonempty("Server IP is required").ip("Invalid IP address"),
  project_name: z.string().nonempty("Project name is required"),
});

export const routerConfigurationFormSchema = z.object({
  name: z.string().nonempty("Router name is required"),
  asn: z.number().min(1, "ASN must be at least 1").max(65534, "ASN must be at most 65534"), 
  interfaces: z.array(
    z.object({
      name: z.string().nonempty("Interface name is required"),
      ip: ipWithMaskSchema,
      peer: z.object({
        name: z.string().nonempty("Peer name is required"),
        interface: z.string().nonempty("Peer interface is required"),
      })
    })
  ),
  neighbors: z.array(
    z.object({
      ip: ipSchema,
      asn: z.number().min(1, "ASN must be at least 1").max(65534, "ASN must be at most 65534"), 
    })
  ),
  dhcp: z.object({
    subnet: ipWithMaskSchema,
    interface: z.string().nonempty("Interface name is required"),
    range: z.tuple([ipSchema, ipSchema]),
  }).optional(),

  internet_iface: z.object({
    name: z.string().nonempty("Interface name is required"),
    ip: ipWithMaskSchema,
  }).optional(),
});

export const hostConfigurationFormSchema = z.object({
  name: z.string().nonempty("Host name is required"),
  interfaces: z.array(
    z.object({
      name: z.string().nonempty("Interface name is required"),
      ip: ipWithMaskSchema.optional(),
      dhcp: z.boolean(),
    })
  ),
  gateway: ipSchema.optional(),
});

export const transitConfigurationFormSchema = z.object({
  from: z.number().min(1, "ASN must be at least 1").max(65534, "ASN must be at most 65534"),
  through: z.number().min(1, "ASN must be at least 1").max(65534, "ASN must be at most 65534"),
  to: z.array(z.number().min(1, "ASN must be at least 1").max(65534, "ASN must be at most 65534")),
});

export const peeringConfigurationFormSchema = z.object({
  fromAS: z.number().min(1, "ASN must be at least 1").max(65534, "ASN must be at most 65534"),
  toAS: z.number().min(1, "ASN must be at least 1").max(65534, "ASN must be at most 65534"),
});


export const localPreferenceConfigurationFormSchema = z.object({
  asn: z.number().min(1, "ASN must be at least 1").max(65534, "ASN must be at most 65534"),
  neighbor_router: z.string().nonempty("Router name is required"),
  local_preference: z.number().min(1, "Local Preference must be at least 1"),
  network_ip: z.union([
    ipWithMaskSchema, 
    z.literal("Internet"), 
    z.literal("internet"), 
    z.literal("INTERNET")  
  ])
}); 

export const announceConfigurationFormSchema = z.object({
  router: z.string().nonempty("Router name is required"),
  network_ip: ipWithMaskSchema.nonempty("Network IP is required"),
  to: z.array(z.number().min(1, "ASN must be at least 1").max(65534, "ASN must be at most 65534")),
}); 

export const stopAnnounceConfigFormSchema = z.object({
  router: z.string().nonempty("Router name is required"),
  network_ip: ipWithMaskSchema
});

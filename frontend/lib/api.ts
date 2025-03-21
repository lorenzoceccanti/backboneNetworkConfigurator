import { NetworkTopology, PeeringConfigBody, TransitConfigBody, LocalPreferenceConfigBody, AnnounceConfigBody, StopAnnounceConfigBody } from "@/lib/definitions";

export async function sendConfiguration(config: NetworkTopology, serverIp: string) {
  const configApi = `http://${serverIp}:5000/configure`;
  const response = await fetch(configApi, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });

  if (!response.ok) throw new Error(response.statusText);
  return response.json();
}

export async function deployNetwork(serverIp: string) {
  const deployApi = `http://${serverIp}:5000/deploy`;
  const response = await fetch(deployApi, {
    method: "POST",
  });

  if (!response.ok) throw new Error(response.statusText);
}

export async function sendTransitConfiguration(config: TransitConfigBody, serverIp: string) {
  const transitApi = `http://${serverIp}:5000/transit`;
  const response = await fetch(transitApi, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });

  if (!response.ok) throw new Error(response.statusText);
}

export async function sendPeeringConfiguration(config: PeeringConfigBody, serverIp: string){
  const peeringApi = `http://${serverIp}:5000/peering`;
  const response = await fetch(peeringApi, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });

  if (!response.ok) throw new Error(response.statusText);
}

export async function sendLocalPreferenceConfiguration(config: LocalPreferenceConfigBody, serverIp: string){
  const localpreferenceApi = `http://${serverIp}:5000/local-preference`;
  const response = await fetch(localpreferenceApi, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });

  if (!response.ok) throw new Error(response.statusText);
}

export async function sendAnnounceConfiguration(config: AnnounceConfigBody, serverIp: string){
  const announceApi = `http://${serverIp}:5000/announce`;
  const response = await fetch(announceApi, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });

  if (!response.ok) throw new Error(response.statusText);
}

export async function sendStopAnnounceConfiguration(config: StopAnnounceConfigBody, serverIp: string){
  const stopannounceApi = `http://${serverIp}:5000/stop-announce`;
  const response = await fetch(stopannounceApi, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });

  if (!response.ok) throw new Error(response.statusText);
}

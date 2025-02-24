import { NetworkTopology } from "@/lib/definitions";

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
  return response.json();
}
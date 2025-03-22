import { NetworkTopologyResponse, NodeData, EdgeData } from '@/lib/definitions';
import React, { useEffect, useRef } from 'react';
import { DataSet, Network } from 'vis-network/standalone';

type NetworkVisualizationProps = {
  config: NetworkTopologyResponse;
}

export default function NetworkVisualization({
  config
}: NetworkVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const routerImage = '/imgs/router.png';
    const hostImage = '/imgs/computer.png';

    const routerNames = new Set(config.routers.map((router) => router.name));
    const asnGroups: { [asn: number]: string[] } = {};

    // Raggruppa i nodi per ASN
    config.routers.forEach((router) => {
      if (!asnGroups[router.asn]) {
        asnGroups[router.asn] = [];
      }
      asnGroups[router.asn].push(router.name);
    });

    const allNodes = new Set<string>();
    config.links.forEach((link) => {
      link.forEach((endpoint) => {
        const [nodeName] = endpoint.split(':');
        allNodes.add(nodeName);
      });
    });

    const nodesData: NodeData[] = [];
    const nodeIds: { [key: string]: number } = {};
    let nodeId = 1;
    allNodes.forEach((name) => {
      const isRouter = routerNames.has(name);
      const asn = config.routers.find((router) => router.name === name)?.asn || 0;
    
      nodesData.push({
        id: nodeId,
        label: isRouter ? `${name}\nASN: ${asn}` : name,
        shape: 'image',
        image: isRouter ? routerImage : hostImage,
      });
    
      nodeIds[name] = nodeId;
      nodeId++;
    });

    const edgesData: EdgeData[] = config.links.map((link) => {
      const [endpoint1, endpoint2] = link;
      const node1 = endpoint1.split(':')[0];
      const node2 = endpoint2.split(':')[0];
      return {
        from: nodeIds[node1],
        to: nodeIds[node2],
      };
    });

    // Disegna i quadrati attorno ai gruppi di ASN
    const groups = Object.entries(asnGroups).map(([asn, nodes]) => {
      const nodePositions = nodes.map((node) => nodeIds[node]);
      return {
        label: `ASN: ${asn}`,
        nodes: nodePositions,
      };
    });

    if (containerRef.current) {
      const nodes = new DataSet(nodesData);
      const edges = new DataSet(edgesData);
      const data = { nodes, edges };
      const options = {
        physics: {
          stabilization: true,
        },
        groups: groups.reduce((acc: { [key: number]: { shape: string; label: string; color: { border: string; background: string } } }, group) => {
          group.nodes.forEach((nodeId) => {
            acc[nodeId] = {
              shape: 'box',
              label: group.label,
              color: {
                border: '#000',
                background: '#f0f0f0',
              },
            };
          });
          return acc;
        }, {}),
      };
      new Network(containerRef.current, data, options);
    }
  }, [config]);

  return (
    <div className="space-y-4 max-w-5xl lg:mx-auto my-10 mx-10">
      <h1 className="font-bold text-base">Your Configuration</h1>
      <p className="text-sm">
        This is a visualization of the network topology you have configured.
        If you see any issues, you can go back and modify the configuration, or
        you can proceed clicking the &quot;Deploy Network&quot; button above.
      </p>
      <div
        className="h-[600px] border border-gray-200 rounded-md shadow-md"
        ref={containerRef}
      />
    </div>
  );
};
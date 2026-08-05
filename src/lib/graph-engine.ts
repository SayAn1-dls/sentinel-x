import type { Transaction, NetworkNode } from './types';

export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
  count: number;
}

export interface GraphAnalysisResult {
  nodes: NetworkNode[];
  edges: GraphEdge[];
  cycles: string[][];
  layeringScore: number;
  smurfingDetected: boolean;
}

export class GraphEngine {
  buildGraph(transactions: Transaction[]): { nodes: Map<string, NetworkNode>; edges: Map<string, GraphEdge> } {
    const nodes = new Map<string, NetworkNode>();
    const edges = new Map<string, GraphEdge>();

    for (const tx of transactions) {
      if (!nodes.has(tx.from)) {
        nodes.set(tx.from, { id: tx.from, address: tx.from, txCount: 0, totalVolume: 0, riskLevel: 'LOW', connections: [] });
      }
      if (!nodes.has(tx.to)) {
        nodes.set(tx.to, { id: tx.to, address: tx.to, txCount: 0, totalVolume: 0, riskLevel: 'LOW', connections: [] });
      }

      const fromNode = nodes.get(tx.from)!;
      const toNode = nodes.get(tx.to)!;
      fromNode.txCount++;
      fromNode.totalVolume += tx.amount;
      toNode.txCount++;
      toNode.totalVolume += tx.amount;

      const edgeKey = `${tx.from}->${tx.to}`;
      if (!edges.has(edgeKey)) {
        edges.set(edgeKey, { from: tx.from, to: tx.to, weight: 0, count: 0 });
      }
      const edge = edges.get(edgeKey)!;
      edge.weight += tx.amount;
      edge.count++;
    }

    return { nodes, edges };
  }

  detectCycles(edges: GraphEdge[]): string[][] {
    const cycles: string[][] = [];
    const adj = new Map<string, string[]>();

    for (const edge of edges) {
      if (!adj.has(edge.from)) adj.set(edge.from, []);
      adj.get(edge.from)!.push(edge.to);
    }

    const visited = new Set<string>();
    const path: string[] = [];

    const dfs = (node: string) => {
      if (path.includes(node)) {
        cycles.push([...path.slice(path.indexOf(node)), node]);
        return;
      }
      if (visited.has(node)) return;
      visited.add(node);
      path.push(node);
      for (const neighbor of adj.get(node) ?? []) dfs(neighbor);
      path.pop();
    };

    for (const node of adj.keys()) dfs(node);
    return cycles;
  }

  analyze(transactions: Transaction[]): GraphAnalysisResult {
    const { nodes, edges } = this.buildGraph(transactions);
    const edgeArr = Array.from(edges.values());
    const cycles = this.detectCycles(edgeArr);
    const layeringScore = Math.min(cycles.length * 15, 100);
    const smurfingDetected = Array.from(nodes.values()).some((n) => n.txCount > 10 && n.totalVolume < 10_000);

    return {
      nodes: Array.from(nodes.values()),
      edges: edgeArr,
      cycles,
      layeringScore,
      smurfingDetected,
    };
  }
}

export const graphEngine = new GraphEngine();

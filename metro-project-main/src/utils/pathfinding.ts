// Dijkstra's algorithm for finding shortest path in station layout

export interface Node {
  id: string;
  name: string;
  type: string;
  floor: string;
  x: number;
  y: number;
}

export interface Edge {
  from: string;
  to: string;
  distance: number;
}

export interface PathResult {
  path: string[];
  totalDistance: number;
  estimatedTime: number;
  instructions: string[];
}

export function findShortestPath(
  nodes: Node[],
  edges: Edge[],
  startId: string,
  endId: string
): PathResult | null {
  // Build adjacency list
  const graph = new Map<string, { nodeId: string; distance: number }[]>();
  
  edges.forEach(edge => {
    if (!graph.has(edge.from)) graph.set(edge.from, []);
    if (!graph.has(edge.to)) graph.set(edge.to, []);
    
    graph.get(edge.from)!.push({ nodeId: edge.to, distance: edge.distance });
    graph.get(edge.to)!.push({ nodeId: edge.from, distance: edge.distance });
  });

  // Dijkstra's algorithm
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const unvisited = new Set(nodes.map(n => n.id));

  nodes.forEach(node => {
    distances.set(node.id, node.id === startId ? 0 : Infinity);
    previous.set(node.id, null);
  });

  while (unvisited.size > 0) {
    // Find unvisited node with smallest distance
    let current: string | null = null;
    let minDist = Infinity;
    
    unvisited.forEach(nodeId => {
      const dist = distances.get(nodeId) || Infinity;
      if (dist < minDist) {
        minDist = dist;
        current = nodeId;
      }
    });

    if (current === null || current === endId) break;
    if (minDist === Infinity) break;

    unvisited.delete(current);

    const neighbors = graph.get(current) || [];
    neighbors.forEach(({ nodeId, distance }) => {
      if (!unvisited.has(nodeId)) return;

      const altDistance = (distances.get(current!) || 0) + distance;
      if (altDistance < (distances.get(nodeId) || Infinity)) {
        distances.set(nodeId, altDistance);
        previous.set(nodeId, current);
      }
    });
  }

  // Reconstruct path
  const path: string[] = [];
  let current: string | null = endId;
  
  while (current !== null) {
    path.unshift(current);
    current = previous.get(current) || null;
  }

  if (path[0] !== startId) return null; // No path found

  const totalDistance = distances.get(endId) || 0;
  const walkingSpeed = 1.4; // meters per second
  const estimatedTime = Math.ceil(totalDistance / walkingSpeed); // seconds

  // Generate step-by-step instructions
  const instructions = generateInstructions(path, nodes, edges);

  return {
    path,
    totalDistance,
    estimatedTime,
    instructions
  };
}

function generateInstructions(path: string[], nodes: Node[], edges: Edge[]): string[] {
  const instructions: string[] = [];
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  for (let i = 0; i < path.length - 1; i++) {
    const currentNode = nodeMap.get(path[i]);
    const nextNode = nodeMap.get(path[i + 1]);
    
    if (!currentNode || !nextNode) continue;

    const edge = edges.find(e => 
      (e.from === currentNode.id && e.to === nextNode.id) ||
      (e.to === currentNode.id && e.from === nextNode.id)
    );

    const distance = edge?.distance || 0;
    const direction = getDirection(currentNode, nextNode);

    if (i === 0) {
      instructions.push(`Start at ${currentNode.name}`);
    }

    if (currentNode.floor !== nextNode.floor) {
      instructions.push(`Take stairs/escalator to ${nextNode.floor} floor`);
    }

    instructions.push(`${direction} for ${distance}m to ${nextNode.name}`);

    if (i === path.length - 2) {
      instructions.push(`You have arrived at ${nextNode.name}`);
    }
  }

  return instructions;
}

function getDirection(from: Node, to: Node): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  if (angle >= -45 && angle < 45) return "Go straight ahead";
  if (angle >= 45 && angle < 135) return "Turn right";
  if (angle >= 135 || angle < -135) return "Go back";
  return "Turn left";
}

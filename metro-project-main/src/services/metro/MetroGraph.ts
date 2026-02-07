/**
 * MetroGraph Class
 * Represents the metro network as a weighted, undirected graph
 */

import { Edge, AdjacencyNode, MetroGraph as MetroGraphType } from '@/types/metro';
import { EDGES } from '@/data/metro/edges';

/**
 * MetroGraph - Graph data structure for metro network
 * Supports dynamic station addition and bidirectional edges
 */
export class MetroGraph {
  private adjacencyList: MetroGraphType;
  private stationSet: Set<string>;

  constructor() {
    this.adjacencyList = new Map();
    this.stationSet = new Set();
    this.loadEdges(EDGES);
  }

  /**
   * Load edges from edge data array
   * Creates bidirectional connections automatically
   * @param edges Array of edge definitions
   */
  private loadEdges(edges: Edge[]): void {
    edges.forEach(edge => {
      this.addEdge(edge.from, edge.to, edge.distance, edge.time);
    });
  }

  /**
   * Add a bidirectional edge between two stations
   * @param from Source station name
   * @param to Destination station name
   * @param distance Distance in meters
   * @param time Time in minutes
   */
  public addEdge(from: string, to: string, distance: number, time: number): void {
    // Add stations to the set
    this.stationSet.add(from);
    this.stationSet.add(to);

    // Initialize adjacency lists if needed
    if (!this.adjacencyList.has(from)) {
      this.adjacencyList.set(from, []);
    }
    if (!this.adjacencyList.has(to)) {
      this.adjacencyList.set(to, []);
    }

    // Add bidirectional edges
    const fromList = this.adjacencyList.get(from)!;
    const toList = this.adjacencyList.get(to)!;

    // Avoid duplicates
    if (!fromList.some(n => n.stationId === to)) {
      fromList.push({ stationId: to, distance, time });
    }
    if (!toList.some(n => n.stationId === from)) {
      toList.push({ stationId: from, distance, time });
    }
  }

  /**
   * Add a new station to the graph
   * @param stationName Name of the station
   */
  public addStation(stationName: string): void {
    if (!this.stationSet.has(stationName)) {
      this.stationSet.add(stationName);
      this.adjacencyList.set(stationName, []);
    }
  }

  /**
   * Get all neighbors of a station
   * @param stationName Name of the station
   * @returns Array of adjacent nodes or empty array
   */
  public getNeighbors(stationName: string): AdjacencyNode[] {
    return this.adjacencyList.get(stationName) || [];
  }

  /**
   * Check if a station exists in the graph
   * @param stationName Name of the station
   * @returns True if station exists
   */
  public hasStation(stationName: string): boolean {
    return this.stationSet.has(stationName);
  }

  /**
   * Get all station names in the graph
   * @returns Array of station names
   */
  public getAllStations(): string[] {
    return Array.from(this.stationSet).sort();
  }

  /**
   * Get the total number of stations
   * @returns Number of stations
   */
  public getStationCount(): number {
    return this.stationSet.size;
  }

  /**
   * Get the adjacency list (for algorithm use)
   * @returns The internal adjacency list map
   */
  public getAdjacencyList(): MetroGraphType {
    return this.adjacencyList;
  }
}

// Singleton instance for global use
let metroGraphInstance: MetroGraph | null = null;

/**
 * Get the singleton MetroGraph instance
 * @returns MetroGraph singleton
 */
export const getMetroGraph = (): MetroGraph => {
  if (!metroGraphInstance) {
    metroGraphInstance = new MetroGraph();
  }
  return metroGraphInstance;
};

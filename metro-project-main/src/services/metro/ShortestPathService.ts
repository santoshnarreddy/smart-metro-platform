/**
 * ShortestPathService
 * Implements Dijkstra's algorithm for finding shortest paths
 * Supports both distance and time-based optimization
 */

import { PathMetric, ShortestPathResult, PathApiResponse, AdjacencyNode } from '@/types/metro';
import { getMetroGraph, MetroGraph } from './MetroGraph';
import { getStationLine } from '@/data/metro/stations';

/**
 * Priority Queue implementation using min-heap
 * Optimized for Dijkstra's algorithm
 */
class PriorityQueue<T> {
  private heap: { item: T; priority: number }[] = [];

  public enqueue(item: T, priority: number): void {
    this.heap.push({ item, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  public dequeue(): T | undefined {
    if (this.heap.length === 0) return undefined;
    
    const min = this.heap[0];
    const last = this.heap.pop()!;
    
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    
    return min.item;
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex].priority <= this.heap[index].priority) break;
      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;

      if (leftChild < length && this.heap[leftChild].priority < this.heap[smallest].priority) {
        smallest = leftChild;
      }
      if (rightChild < length && this.heap[rightChild].priority < this.heap[smallest].priority) {
        smallest = rightChild;
      }
      if (smallest === index) break;

      [this.heap[smallest], this.heap[index]] = [this.heap[index], this.heap[smallest]];
      index = smallest;
    }
  }
}

/**
 * ShortestPathService Class
 * Provides API-like methods for route calculation
 */
export class ShortestPathService {
  private graph: MetroGraph;

  constructor() {
    this.graph = getMetroGraph();
  }

  /**
   * Find shortest path by distance (meters)
   * @param source Source station name
   * @param destination Destination station name
   * @returns PathApiResponse with route details
   */
  public getShortestPathByDistance(source: string, destination: string): PathApiResponse {
    return this.findShortestPath(source, destination, 'distance');
  }

  /**
   * Find shortest path by time (minutes)
   * @param source Source station name
   * @param destination Destination station name
   * @returns PathApiResponse with route details
   */
  public getShortestPathByTime(source: string, destination: string): PathApiResponse {
    return this.findShortestPath(source, destination, 'time');
  }

  /**
   * Core Dijkstra's algorithm implementation
   * @param source Source station name
   * @param destination Destination station name
   * @param metric Optimization metric ('distance' or 'time')
   * @returns PathApiResponse with route or error
   */
  private findShortestPath(
    source: string,
    destination: string,
    metric: PathMetric
  ): PathApiResponse {
    // Validation: Invalid station names
    if (!this.graph.hasStation(source)) {
      return {
        success: false,
        error: `Invalid source station: "${source}". Station not found in the network.`
      };
    }

    if (!this.graph.hasStation(destination)) {
      return {
        success: false,
        error: `Invalid destination station: "${destination}". Station not found in the network.`
      };
    }

    // Validation: Same station
    if (source === destination) {
      return {
        success: false,
        error: 'Source and destination cannot be the same station.'
      };
    }

    // Initialize data structures
    const distances = new Map<string, number>();
    const times = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const visited = new Set<string>();
    const pq = new PriorityQueue<string>();

    // Initialize all stations
    this.graph.getAllStations().forEach(station => {
      distances.set(station, Infinity);
      times.set(station, Infinity);
      previous.set(station, null);
    });

    // Set source
    distances.set(source, 0);
    times.set(source, 0);
    pq.enqueue(source, 0);

    // Dijkstra's main loop
    while (!pq.isEmpty()) {
      const current = pq.dequeue()!;

      if (visited.has(current)) continue;
      visited.add(current);

      // Early exit if destination reached
      if (current === destination) break;

      // Process neighbors
      const neighbors = this.graph.getNeighbors(current);
      for (const neighbor of neighbors) {
        if (visited.has(neighbor.stationId)) continue;

        const currentDist = distances.get(current)!;
        const currentTime = times.get(current)!;

        const newDist = currentDist + neighbor.distance;
        const newTime = currentTime + neighbor.time;

        // Get the weight based on metric
        const currentWeight = metric === 'distance' ? distances.get(neighbor.stationId)! : times.get(neighbor.stationId)!;
        const newWeight = metric === 'distance' ? newDist : newTime;

        if (newWeight < currentWeight) {
          distances.set(neighbor.stationId, newDist);
          times.set(neighbor.stationId, newTime);
          previous.set(neighbor.stationId, current);
          pq.enqueue(neighbor.stationId, newWeight);
        }
      }
    }

    // Reconstruct path
    const path: string[] = [];
    let current: string | null = destination;

    while (current !== null) {
      path.unshift(current);
      current = previous.get(current) || null;
    }

    // Check if path was found (disconnected nodes)
    if (path[0] !== source) {
      return {
        success: false,
        error: `No route found between "${source}" and "${destination}". Stations may be disconnected.`
      };
    }

    // Calculate transfers
    const transfers = this.calculateTransfers(path);

    // Calculate fare
    const fare = this.calculateFare(path.length - 1, transfers);

    // Build result
    const result: ShortestPathResult = {
      path,
      totalDistance: distances.get(destination)!,
      totalTime: times.get(destination)!,
      noOfStations: path.length - 1,
      transfers,
      fare,
      optimizedBy: metric
    };

    return {
      success: true,
      data: result
    };
  }

  /**
   * Calculate number of line transfers in a path
   * @param path Array of station names
   * @returns Number of transfers
   */
  private calculateTransfers(path: string[]): number {
    if (path.length < 2) return 0;

    let transfers = 0;
    let currentLine = getStationLine(path[0]);

    for (let i = 1; i < path.length; i++) {
      const stationLine = getStationLine(path[i]);
      if (stationLine && stationLine !== currentLine) {
        transfers++;
        currentLine = stationLine;
      }
    }

    // First line change doesn't count as transfer
    return Math.max(0, transfers - 1);
  }

  /**
   * Calculate fare based on stations and transfers
   * @param stationCount Number of stations traveled
   * @param transfers Number of transfers
   * @returns Fare in INR
   */
  private calculateFare(stationCount: number, transfers: number): number {
    let fare = 10; // Base fare

    if (stationCount > 10) fare = 25;
    else if (stationCount > 5) fare = 20;
    else if (stationCount > 2) fare = 15;

    // Add ₹5 for each transfer
    fare += transfers * 5;

    return fare;
  }

  /**
   * Get all available stations
   * @returns Array of station names
   */
  public getAvailableStations(): string[] {
    return this.graph.getAllStations();
  }

  /**
   * Convert result to JSON string (API response format)
   * @param result ShortestPathResult
   * @returns JSON string
   */
  public toJson(result: ShortestPathResult): string {
    return JSON.stringify({
      path: result.path,
      totalDistance: result.totalDistance,
      totalTime: result.totalTime,
      noOfStations: result.noOfStations
    }, null, 2);
  }
}

// Singleton instance
let serviceInstance: ShortestPathService | null = null;

/**
 * Get the singleton ShortestPathService instance
 * @returns ShortestPathService singleton
 */
export const getShortestPathService = (): ShortestPathService => {
  if (!serviceInstance) {
    serviceInstance = new ShortestPathService();
  }
  return serviceInstance;
};

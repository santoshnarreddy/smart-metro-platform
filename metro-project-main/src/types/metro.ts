/**
 * Metro System Type Definitions
 * Clean, type-safe interfaces for the metro routing system
 */

/**
 * Represents a metro station node
 */
export interface Station {
  id: string;
  name: string;
  line: MetroLine;
  isInterchange: boolean;
}

/**
 * Represents a connection between two stations
 */
export interface Edge {
  from: string;
  to: string;
  distance: number; // in meters
  time: number; // in minutes
}

/**
 * Metro line identifiers
 */
export type MetroLine = 'Red' | 'Blue' | 'Green';

/**
 * Graph adjacency list representation
 */
export interface AdjacencyNode {
  stationId: string;
  distance: number;
  time: number;
}

export type MetroGraph = Map<string, AdjacencyNode[]>;

/**
 * Metric types for shortest path calculation
 */
export type PathMetric = 'distance' | 'time';

/**
 * Result of shortest path calculation
 */
export interface ShortestPathResult {
  /** Ordered list of station names in the path */
  path: string[];
  /** Total distance in meters */
  totalDistance: number;
  /** Total time in minutes */
  totalTime: number;
  /** Number of stations (excluding start) */
  noOfStations: number;
  /** Number of line transfers */
  transfers: number;
  /** Calculated fare in INR */
  fare: number;
  /** The metric used for optimization */
  optimizedBy: PathMetric;
}

/**
 * API-like response format
 */
export interface PathApiResponse {
  success: boolean;
  data?: ShortestPathResult;
  error?: string;
}

// Utility functions for transport calculations

export interface TransportOption {
  type: 'bus' | 'train' | 'auto' | 'cab' | 'bike';
  name: string;
  distance: string;
  walkingTime: number;
  details: any;
}

/**
 * Calculate walking time based on distance
 * Standard walking speed: 80 meters per minute
 */
export function calculateWalkingTime(distanceStr: string): number {
  const distance = parseFloat(distanceStr);
  const unit = distanceStr.includes('km') ? 'km' : 'm';
  
  const meters = unit === 'km' ? distance * 1000 : distance;
  const walkingSpeed = 80; // meters per minute
  
  return Math.ceil(meters / walkingSpeed);
}

/**
 * Parse distance string to numeric value for comparison
 */
export function parseDistance(distanceStr: string): number {
  const distance = parseFloat(distanceStr);
  const unit = distanceStr.includes('km') ? 'km' : 'm';
  
  return unit === 'km' ? distance * 1000 : distance;
}

/**
 * Get all transport options from station data
 */
export function getAllTransportOptions(stationData: any): TransportOption[] {
  const options: TransportOption[] = [];
  
  if (stationData.lastMileOptions.buses) {
    stationData.lastMileOptions.buses.forEach((bus: any) => {
      options.push({
        type: 'bus',
        name: `Bus ${bus.routeNo} to ${bus.destination}`,
        distance: bus.stopDistance,
        walkingTime: calculateWalkingTime(bus.stopDistance),
        details: bus
      });
    });
  }
  
  if (stationData.lastMileOptions.trains) {
    stationData.lastMileOptions.trains.forEach((train: any) => {
      options.push({
        type: 'train',
        name: train.name,
        distance: train.distance,
        walkingTime: calculateWalkingTime(train.distance),
        details: train
      });
    });
  }
  
  if (stationData.lastMileOptions.autos) {
    stationData.lastMileOptions.autos.forEach((auto: any) => {
      options.push({
        type: 'auto',
        name: auto.standName,
        distance: auto.distance,
        walkingTime: calculateWalkingTime(auto.distance),
        details: auto
      });
    });
  }
  
  if (stationData.lastMileOptions.cabPickups) {
    stationData.lastMileOptions.cabPickups.forEach((cab: any) => {
      options.push({
        type: 'cab',
        name: cab.point,
        distance: cab.distance,
        walkingTime: calculateWalkingTime(cab.distance),
        details: cab
      });
    });
  }
  
  if (stationData.lastMileOptions.bikeRentals) {
    stationData.lastMileOptions.bikeRentals.forEach((bike: any) => {
      options.push({
        type: 'bike',
        name: `${bike.provider} Rental`,
        distance: bike.distance,
        walkingTime: calculateWalkingTime(bike.distance),
        details: bike
      });
    });
  }
  
  return options;
}

/**
 * Get fastest transport option (shortest walking distance)
 */
export function getFastestOption(options: TransportOption[]): TransportOption | null {
  if (options.length === 0) return null;
  
  return options.reduce((fastest, current) => {
    const fastestDist = parseDistance(fastest.distance);
    const currentDist = parseDistance(current.distance);
    return currentDist < fastestDist ? current : fastest;
  });
}

/**
 * Format walking time for display
 */
export function formatWalkingTime(minutes: number): string {
  if (minutes < 1) return 'Less than 1 min walk';
  if (minutes === 1) return '1 min walk';
  return `${minutes} mins walk`;
}

/**
 * Get transport icon based on type
 */
export function getTransportIcon(type: string): string {
  const icons: Record<string, string> = {
    bus: '🚌',
    train: '🚂',
    auto: '🛺',
    cab: '🚕',
    bike: '🚲'
  };
  return icons[type] || '🚶';
}

/**
 * Load station transport data
 */
export async function loadStationData(stationId: string): Promise<any> {
  try {
    const response = await import(`../data/transport/${stationId}.json`);
    return response.default;
  } catch (error) {
    console.error(`Failed to load data for station: ${stationId}`, error);
    return null;
  }
}

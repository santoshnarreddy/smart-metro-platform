// Journey state management using localStorage

interface JourneyState {
  // From Smart Parking
  parkingStation: string | null;
  
  // From Route Optimizer
  routeSource: string | null;
  routeDestination: string | null;
  
  // Actions
  setParkingStation: (station: string | null) => void;
  setRouteStations: (source: string | null, destination: string | null) => void;
  clearJourneyState: () => void;
}

// Simple in-memory state using localStorage for persistence
const STORAGE_KEY = 'metro_journey_state';

interface StoredState {
  parkingStation: string | null;
  routeSource: string | null;
  routeDestination: string | null;
}

const getStoredState = (): StoredState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading journey state:', e);
  }
  return { parkingStation: null, routeSource: null, routeDestination: null };
};

const saveState = (state: StoredState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving journey state:', e);
  }
};

// Custom hook to manage journey state
export const useJourneyState = () => {
  const storedState = getStoredState();

  const setParkingStation = (station: string | null) => {
    const current = getStoredState();
    const newState = { ...current, parkingStation: station };
    saveState(newState);
  };

  const setRouteStations = (source: string | null, destination: string | null) => {
    const current = getStoredState();
    const newState = { ...current, routeSource: source, routeDestination: destination };
    saveState(newState);
  };

  const clearJourneyState = () => {
    saveState({ parkingStation: null, routeSource: null, routeDestination: null });
  };

  /**
   * Get the appropriate source station based on priority:
   * 1. Route Optimizer source (highest priority)
   * 2. Parking station (lower priority)
   * 3. null (user enters manually)
   */
  const getBookingSource = (): string | null => {
    const state = getStoredState();
    return state.routeSource || state.parkingStation || null;
  };

  /**
   * Get the appropriate destination station:
   * Only from Route Optimizer, otherwise null
   */
  const getBookingDestination = (): string | null => {
    const state = getStoredState();
    return state.routeDestination || null;
  };

  return {
    ...storedState,
    setParkingStation,
    setRouteStations,
    clearJourneyState,
    getBookingSource,
    getBookingDestination,
  };
};

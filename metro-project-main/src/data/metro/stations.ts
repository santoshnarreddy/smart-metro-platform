/**
 * Metro Station Data
 * Complete station information for Hyderabad Metro
 */

import { Station, MetroLine } from '@/types/metro';

/**
 * All metro stations with their line assignments
 */
export const STATIONS: Station[] = [
  // Red Line (Miyapur to LB Nagar)
  { id: 'miyapur', name: 'Miyapur', line: 'Red', isInterchange: false },
  { id: 'jntu-college', name: 'JNTU College', line: 'Red', isInterchange: false },
  { id: 'kphb-colony', name: 'KPHB Colony', line: 'Red', isInterchange: false },
  { id: 'kukatpally', name: 'Kukatpally', line: 'Red', isInterchange: false },
  { id: 'balanagar', name: 'Balanagar', line: 'Red', isInterchange: false },
  { id: 'moosapet', name: 'Moosapet', line: 'Red', isInterchange: false },
  { id: 'bharat-nagar', name: 'Bharat Nagar', line: 'Red', isInterchange: false },
  { id: 'erragadda', name: 'Erragadda', line: 'Red', isInterchange: false },
  { id: 'esi-hospital', name: 'ESI Hospital', line: 'Red', isInterchange: false },
  { id: 'sr-nagar', name: 'SR Nagar', line: 'Red', isInterchange: false },
  { id: 'ameerpet', name: 'Ameerpet', line: 'Red', isInterchange: true },
  { id: 'panjagutta', name: 'Panjagutta', line: 'Red', isInterchange: false },
  { id: 'irrum-manzil', name: 'Irrum Manzil', line: 'Red', isInterchange: false },
  { id: 'khairatabad', name: 'Khairatabad', line: 'Red', isInterchange: false },
  { id: 'lakdi-ka-pul', name: 'Lakdi-ka-pul', line: 'Red', isInterchange: false },
  { id: 'assembly', name: 'Assembly', line: 'Red', isInterchange: false },
  { id: 'nampally', name: 'Nampally', line: 'Red', isInterchange: false },
  { id: 'gandhi-bhavan', name: 'Gandhi Bhavan', line: 'Red', isInterchange: false },
  { id: 'osmania-medical', name: 'Osmania Medical College', line: 'Red', isInterchange: false },
  { id: 'mg-bus-station', name: 'MG Bus Station', line: 'Red', isInterchange: true },
  { id: 'malakpet', name: 'Malakpet', line: 'Red', isInterchange: false },
  { id: 'new-market', name: 'New Market', line: 'Red', isInterchange: false },
  { id: 'moosarambagh', name: 'Moosarambagh', line: 'Red', isInterchange: false },
  { id: 'dilsukhnagar', name: 'Dilsukhnagar', line: 'Red', isInterchange: false },
  { id: 'chaitanyapuri', name: 'Chaitanyapuri', line: 'Red', isInterchange: false },
  { id: 'victoria-memorial', name: 'Victoria Memorial', line: 'Red', isInterchange: false },
  { id: 'lb-nagar', name: 'LB Nagar', line: 'Red', isInterchange: false },

  // Blue Line (Nagole to Raidurg)
  { id: 'nagole', name: 'Nagole', line: 'Blue', isInterchange: false },
  { id: 'uppal', name: 'Uppal', line: 'Blue', isInterchange: false },
  { id: 'stadium', name: 'Stadium', line: 'Blue', isInterchange: false },
  { id: 'ngri', name: 'NGRI', line: 'Blue', isInterchange: false },
  { id: 'habsiguda', name: 'Habsiguda', line: 'Blue', isInterchange: false },
  { id: 'tarnaka', name: 'Tarnaka', line: 'Blue', isInterchange: false },
  { id: 'mettuguda', name: 'Mettuguda', line: 'Blue', isInterchange: false },
  { id: 'secunderabad-east', name: 'Secunderabad East', line: 'Blue', isInterchange: false },
  { id: 'parade-ground', name: 'Parade Ground', line: 'Blue', isInterchange: true },
  { id: 'paradise', name: 'Paradise', line: 'Blue', isInterchange: false },
  { id: 'rasoolpura', name: 'Rasoolpura', line: 'Blue', isInterchange: false },
  { id: 'prakash-nagar', name: 'Prakash Nagar', line: 'Blue', isInterchange: false },
  { id: 'begumpet', name: 'Begumpet', line: 'Blue', isInterchange: false },
  { id: 'madhura-nagar', name: 'Madhura Nagar', line: 'Blue', isInterchange: false },
  { id: 'yousufguda', name: 'Yousufguda', line: 'Blue', isInterchange: false },
  { id: 'jubilee-hills-road5', name: 'Jubilee Hills Road No. 5', line: 'Blue', isInterchange: false },
  { id: 'jubilee-hills-checkpost', name: 'Jubilee Hills Checkpost', line: 'Blue', isInterchange: false },
  { id: 'peddamma-gudi', name: 'Peddamma Gudi', line: 'Blue', isInterchange: false },
  { id: 'madhapur', name: 'Madhapur', line: 'Blue', isInterchange: false },
  { id: 'durgam-cheruvu', name: 'Durgam Cheruvu', line: 'Blue', isInterchange: false },
  { id: 'hitech-city', name: 'Hitech City', line: 'Blue', isInterchange: false },
  { id: 'raidurg', name: 'Raidurg', line: 'Blue', isInterchange: false },

  // Green Line (JBS Parade Ground to MG Bus Station)
  { id: 'jbs-parade-ground', name: 'JBS Parade Ground', line: 'Green', isInterchange: true },
  { id: 'secunderabad-west', name: 'Secunderabad West', line: 'Green', isInterchange: false },
  { id: 'gandhi-hospital', name: 'Gandhi Hospital', line: 'Green', isInterchange: false },
  { id: 'musheerabad', name: 'Musheerabad', line: 'Green', isInterchange: false },
  { id: 'rtc-cross-roads', name: 'RTC Cross Roads', line: 'Green', isInterchange: false },
  { id: 'chikkadpally', name: 'Chikkadpally', line: 'Green', isInterchange: false },
  { id: 'narayanguda', name: 'Narayanguda', line: 'Green', isInterchange: false },
  { id: 'sultan-bazaar', name: 'Sultan Bazaar', line: 'Green', isInterchange: false },
];

/**
 * Get station by name
 */
export const getStationByName = (name: string): Station | undefined => {
  return STATIONS.find(s => s.name.toLowerCase() === name.toLowerCase());
};

/**
 * Get station line by name
 */
export const getStationLine = (name: string): MetroLine | undefined => {
  return getStationByName(name)?.line;
};

/**
 * Check if station is an interchange
 */
export const isInterchangeStation = (name: string): boolean => {
  return getStationByName(name)?.isInterchange ?? false;
};

/**
 * Get all station names
 */
export const getAllStationNames = (): string[] => {
  return STATIONS.map(s => s.name).sort();
};

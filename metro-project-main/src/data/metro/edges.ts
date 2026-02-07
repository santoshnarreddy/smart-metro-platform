/**
 * Metro Edge Data
 * Connections between stations with distance (meters) and time (minutes)
 */

import { Edge } from '@/types/metro';

/**
 * All metro connections with distance and time weights
 * Distance is in meters, time is in minutes
 * Average metro speed: ~35 km/h, plus station dwell time
 */
export const EDGES: Edge[] = [
  // Red Line (Miyapur to LB Nagar)
  { from: 'Miyapur', to: 'JNTU College', distance: 1200, time: 3 },
  { from: 'JNTU College', to: 'KPHB Colony', distance: 900, time: 2 },
  { from: 'KPHB Colony', to: 'Kukatpally', distance: 1100, time: 3 },
  { from: 'Kukatpally', to: 'Balanagar', distance: 1200, time: 3 },
  { from: 'Balanagar', to: 'Moosapet', distance: 800, time: 2 },
  { from: 'Moosapet', to: 'Bharat Nagar', distance: 1100, time: 3 },
  { from: 'Bharat Nagar', to: 'Erragadda', distance: 900, time: 2 },
  { from: 'Erragadda', to: 'ESI Hospital', distance: 1200, time: 3 },
  { from: 'ESI Hospital', to: 'SR Nagar', distance: 800, time: 2 },
  { from: 'SR Nagar', to: 'Ameerpet', distance: 1100, time: 3 },
  { from: 'Ameerpet', to: 'Panjagutta', distance: 900, time: 2 },
  { from: 'Panjagutta', to: 'Irrum Manzil', distance: 1200, time: 3 },
  { from: 'Irrum Manzil', to: 'Khairatabad', distance: 800, time: 2 },
  { from: 'Khairatabad', to: 'Lakdi-ka-pul', distance: 1100, time: 3 },
  { from: 'Lakdi-ka-pul', to: 'Assembly', distance: 900, time: 2 },
  { from: 'Assembly', to: 'Nampally', distance: 1200, time: 3 },
  { from: 'Nampally', to: 'Gandhi Bhavan', distance: 800, time: 2 },
  { from: 'Gandhi Bhavan', to: 'Osmania Medical College', distance: 1100, time: 3 },
  { from: 'Osmania Medical College', to: 'MG Bus Station', distance: 900, time: 2 },
  { from: 'MG Bus Station', to: 'Malakpet', distance: 1200, time: 3 },
  { from: 'Malakpet', to: 'New Market', distance: 800, time: 2 },
  { from: 'New Market', to: 'Moosarambagh', distance: 1100, time: 3 },
  { from: 'Moosarambagh', to: 'Dilsukhnagar', distance: 900, time: 2 },
  { from: 'Dilsukhnagar', to: 'Chaitanyapuri', distance: 1200, time: 3 },
  { from: 'Chaitanyapuri', to: 'Victoria Memorial', distance: 800, time: 2 },
  { from: 'Victoria Memorial', to: 'LB Nagar', distance: 1100, time: 3 },

  // Blue Line (Nagole to Raidurg)
  { from: 'Nagole', to: 'Uppal', distance: 1200, time: 3 },
  { from: 'Uppal', to: 'Stadium', distance: 800, time: 2 },
  { from: 'Stadium', to: 'NGRI', distance: 1100, time: 3 },
  { from: 'NGRI', to: 'Habsiguda', distance: 900, time: 2 },
  { from: 'Habsiguda', to: 'Tarnaka', distance: 1200, time: 3 },
  { from: 'Tarnaka', to: 'Mettuguda', distance: 800, time: 2 },
  { from: 'Mettuguda', to: 'Secunderabad East', distance: 1100, time: 3 },
  { from: 'Secunderabad East', to: 'Parade Ground', distance: 900, time: 2 },
  { from: 'Parade Ground', to: 'Paradise', distance: 1200, time: 3 },
  { from: 'Paradise', to: 'Rasoolpura', distance: 800, time: 2 },
  { from: 'Rasoolpura', to: 'Prakash Nagar', distance: 1100, time: 3 },
  { from: 'Prakash Nagar', to: 'Begumpet', distance: 900, time: 2 },
  { from: 'Begumpet', to: 'Ameerpet', distance: 1200, time: 3 },
  { from: 'Ameerpet', to: 'Madhura Nagar', distance: 800, time: 2 },
  { from: 'Madhura Nagar', to: 'Yousufguda', distance: 1100, time: 3 },
  { from: 'Yousufguda', to: 'Jubilee Hills Road No. 5', distance: 900, time: 2 },
  { from: 'Jubilee Hills Road No. 5', to: 'Jubilee Hills Checkpost', distance: 1200, time: 3 },
  { from: 'Jubilee Hills Checkpost', to: 'Peddamma Gudi', distance: 800, time: 2 },
  { from: 'Peddamma Gudi', to: 'Madhapur', distance: 1100, time: 3 },
  { from: 'Madhapur', to: 'Durgam Cheruvu', distance: 900, time: 2 },
  { from: 'Durgam Cheruvu', to: 'Hitech City', distance: 1200, time: 3 },
  { from: 'Hitech City', to: 'Raidurg', distance: 800, time: 2 },

  // Green Line (JBS Parade Ground to MG Bus Station)
  { from: 'JBS Parade Ground', to: 'Secunderabad West', distance: 1100, time: 3 },
  { from: 'Secunderabad West', to: 'Gandhi Hospital', distance: 900, time: 2 },
  { from: 'Gandhi Hospital', to: 'Musheerabad', distance: 1200, time: 3 },
  { from: 'Musheerabad', to: 'RTC Cross Roads', distance: 800, time: 2 },
  { from: 'RTC Cross Roads', to: 'Chikkadpally', distance: 1100, time: 3 },
  { from: 'Chikkadpally', to: 'Narayanguda', distance: 900, time: 2 },
  { from: 'Narayanguda', to: 'Sultan Bazaar', distance: 1200, time: 3 },
  { from: 'Sultan Bazaar', to: 'MG Bus Station', distance: 800, time: 2 },

  // Interchange connections (walking time between platforms)
  { from: 'Parade Ground', to: 'JBS Parade Ground', distance: 50, time: 1 },
  { from: 'MG Bus Station', to: 'Sultan Bazaar', distance: 50, time: 1 },
];

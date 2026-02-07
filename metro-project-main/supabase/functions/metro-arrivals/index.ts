import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Metro line colors
const lineColors = {
  'Blue': '#1e40af',
  'Red': '#dc2626',
  'Green': '#16a34a'
};

// Destinations for different lines
const destinations = {
  'Blue': ['Nagole', 'Miyapur', 'Raidurg'],
  'Red': ['LB Nagar', 'Jubilee Hills', 'Secunderabad'],
  'Green': ['JBS Parade Ground', 'MGBS', 'Uppal']
};

const trainNumbers = [
  'M101', 'M102', 'M103', 'M201', 'M202', 'M203', 
  'M301', 'M302', 'M303', 'M401', 'M402', 'M403'
];

const statuses = ['on-time', 'delayed', 'approaching', 'cancelled'];

// Generate realistic arrival times
const generateArrivalTimes = () => {
  const now = new Date();
  const arrivals = [];
  
  for (let i = 0; i < 3; i++) {
    const scheduledTime = new Date(now.getTime() + (i * 8 + Math.random() * 5) * 60000); // 8-13 minutes apart
    const delayMinutes = Math.random() < 0.7 ? 0 : Math.floor(Math.random() * 10) + 1; // 70% on time
    const estimatedTime = new Date(scheduledTime.getTime() + delayMinutes * 60000);
    
    const line = Object.keys(lineColors)[Math.floor(Math.random() * Object.keys(lineColors).length)];
    const status = delayMinutes === 0 ? 
      (Math.random() < 0.3 ? 'approaching' : 'on-time') : 
      (Math.random() < 0.1 ? 'cancelled' : 'delayed');
    
    arrivals.push({
      id: `arrival_${i}_${Date.now()}`,
      trainNumber: trainNumbers[Math.floor(Math.random() * trainNumbers.length)],
      destination: destinations[line][Math.floor(Math.random() * destinations[line].length)],
      platform: Math.floor(Math.random() * 4) + 1,
      scheduledTime: scheduledTime.toISOString(),
      estimatedTime: estimatedTime.toISOString(),
      delayMinutes,
      status,
      lineColor: lineColors[line]
    });
  }
  
  return arrivals.sort((a, b) => new Date(a.estimatedTime).getTime() - new Date(b.estimatedTime).getTime());
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { station } = await req.json();
    
    if (!station) {
      return new Response(
        JSON.stringify({ error: 'Station is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate dummy real-time data
    const arrivals = generateArrivalTimes();
    
    // Add some randomness to simulate real-time changes
    const response = {
      station,
      arrivals,
      lastUpdated: new Date().toISOString(),
      realTime: true
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in metro-arrivals function:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
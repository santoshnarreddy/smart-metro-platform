import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Intent patterns and responses
const INTENTS = {
  greeting: {
    patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
    responses: [
      "Hello! I'm your Smart Metro Assistant. How can I help you today?",
      "Hi there! I'm here to help with all your metro needs. What can I do for you?",
      "Welcome to Smart Metro! How may I assist you today?"
    ]
  },
  booking: {
    patterns: ['book', 'ticket', 'reserve', 'buy', 'purchase', 'travel'],
    responses: [
      "I can help you book metro tickets! You can book tickets through our booking system. Which stations are you traveling between?",
      "To book a ticket, please use our ticket booking feature. Do you need help finding the right stations?",
      "Great! You can book tickets for any metro line. Would you like me to guide you through the booking process?"
    ]
  },
  parking: {
    patterns: ['parking', 'park', 'car', 'vehicle', 'slot'],
    responses: [
      "I can help you with parking! Our Smart Parking system shows real-time availability at metro stations. Which station do you need parking at?",
      "You can book parking slots at metro stations through our Smart Parking feature. Would you like to check availability?",
      "Metro parking is available at most stations. I can help you find and book a parking slot. Which station interests you?"
    ]
  },
  directions: {
    patterns: ['direction', 'route', 'path', 'way', 'navigate', 'how to get', 'station'],
    responses: [
      "I can help you find the best route! Our Route Optimizer finds the shortest path between any metro stations. Where are you going?",
      "For directions, use our Route Optimizer feature. It shows the fastest route with transfers and timing. What's your destination?",
      "Let me help you navigate! Which stations are you traveling between? I can find the optimal route for you."
    ]
  },
  timings: {
    patterns: ['time', 'schedule', 'arrival', 'departure', 'when', 'timing'],
    responses: [
      "You can check live metro arrivals through our Live Arrivals feature. It shows real-time schedules with delay updates. Which station?",
      "Metro timings are available in real-time! Our Live Arrivals system tracks all metro lines. Do you need timing for a specific station?",
      "I can help with metro schedules! Check our Live Arrivals for up-to-date timing information. What station are you interested in?"
    ]
  },
  lostFound: {
    patterns: ['lost', 'found', 'missing', 'forgot', 'left behind', 'item'],
    responses: [
      "Sorry to hear you lost something! Our Lost & Found system can help you report lost items or search for found items. What did you lose?",
      "You can report lost items through our Lost & Found feature. It uses smart matching to connect lost and found reports. Can you describe the item?",
      "Our Lost & Found system helps reunite people with their belongings. Would you like to report a lost item or search for found items?"
    ]
  },
  smartCard: {
    patterns: ['smart card', 'balance', 'recharge', 'top up', 'reload', 'metro card'],
    responses: [
      "I can help with your metro card! Use our Smart Card feature to check balance and recharge. Do you need help with your card balance?",
      "Smart Card management is easy! You can check balance, recharge, and track usage through our Smart Card system. What do you need?",
      "Your metro smart card can be managed digitally! Check balance, recharge, and view transaction history. How can I help with your card?"
    ]
  },
  food: {
    patterns: ['food', 'eat', 'hungry', 'restaurant', 'stall', 'order', 'meal'],
    responses: [
      "Feeling hungry? Our Food Stalls feature lets you order from metro station vendors with UPI payments. Which station are you at?",
      "You can order food from metro station stalls through our app! Browse menus and pay with UPI. Need help finding food options?",
      "Food ordering is available at many metro stations! Use our Food Stalls feature to browse and order. Where would you like to order from?"
    ]
  },
  accessibility: {
    patterns: ['accessibility', 'disabled', 'wheelchair', 'assistance', 'help', 'special needs'],
    responses: [
      "We're committed to accessibility! Our Accessibility Assistance feature helps you request support at metro stations. What assistance do you need?",
      "Metro accessibility services are available! You can request assistance for wheelchair access, elevators, and more. How can we help?",
      "Our Accessibility feature connects you with station staff for assistance. Whether you need help with mobility or navigation, we're here to help!"
    ]
  },
  feedback: {
    patterns: ['feedback', 'complaint', 'suggestion', 'report', 'problem', 'issue'],
    responses: [
      "Your feedback is important! Use our Feedback system to share experiences, report issues, or make suggestions. What would you like to share?",
      "I'd love to hear your feedback! Our Feedback feature lets you report issues and track their resolution. What's on your mind?",
      "Thank you for wanting to share feedback! You can submit complaints, suggestions, or compliments through our Feedback system."
    ]
  }
};

function findIntent(message: string): { intent: string; confidence: number } {
  const normalizedMessage = message.toLowerCase();
  let bestMatch = { intent: 'default', confidence: 0 };

  for (const [intentName, intentData] of Object.entries(INTENTS)) {
    for (const pattern of intentData.patterns) {
      if (normalizedMessage.includes(pattern)) {
        const confidence = pattern.length / normalizedMessage.length;
        if (confidence > bestMatch.confidence) {
          bestMatch = { intent: intentName, confidence };
        }
      }
    }
  }

  return bestMatch;
}

function getRandomResponse(intent: string): string {
  const intentData = INTENTS[intent as keyof typeof INTENTS];
  if (intentData && intentData.responses) {
    const randomIndex = Math.floor(Math.random() * intentData.responses.length);
    return intentData.responses[randomIndex];
  }
  
  // Default responses
  const defaultResponses = [
    "I'm here to help with metro services! You can ask me about booking tickets, parking, directions, timings, lost items, smart cards, food, accessibility, or feedback.",
    "I can assist you with various metro services. Try asking about ticket booking, route planning, parking, or any other metro-related questions.",
    "How can I help you with metro services today? I can provide information about tickets, directions, parking, timings, and more!"
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, useAI = false } = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    // Rule-based fallback first
    const { intent, confidence } = findIntent(message);
    
    if (confidence > 0.3 && !useAI) {
      const response = getRandomResponse(intent);
      return new Response(JSON.stringify({ 
        response, 
        intent, 
        confidence,
        source: 'rule-based'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use OpenAI for complex queries
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    const systemPrompt = `You are a helpful Smart Metro Assistant. You help users with:

1. Ticket Booking - Help users book metro tickets between stations
2. Smart Parking - Assist with parking reservations at metro stations  
3. Route Planning - Provide optimal routes between metro stations
4. Live Arrivals - Give real-time metro timing information
5. Smart Card - Help with metro card balance and recharge
6. Food Ordering - Assist with ordering food from metro station stalls
7. Lost & Found - Help report or find lost items
8. Accessibility - Provide assistance information for special needs
9. Feedback - Help users submit feedback or complaints
10. Virtual E-Card - Help create digital metro cards
11. Offline Tickets - Assist with offline QR ticket generation
12. Voice Assistant - Provide voice-based help
13. Volunteer Signup - Help users become metro volunteers
14. General Information - Answer metro-related questions

Keep responses helpful, concise, and friendly. Always direct users to the appropriate feature when they need to take action.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      response: aiResponse,
      intent: 'ai-powered', 
      confidence: 1.0,
      source: 'openai'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chatbot-assistant function:', error);
    
    // Fallback response
    const fallbackResponse = "I'm sorry, I'm having trouble right now. Please try asking about metro tickets, parking, directions, timings, or other metro services!";
    
    return new Response(JSON.stringify({ 
      response: fallbackResponse,
      intent: 'error',
      confidence: 0,
      source: 'fallback',
      error: error.message
    }), {
      status: 200, // Return 200 to avoid breaking the UI
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
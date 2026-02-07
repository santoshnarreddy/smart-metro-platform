import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

interface VoiceAssistantProps {
  onTranscription?: (text: string, language: string) => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event) => void;
  onend: () => void;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onTranscription }) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en-US');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const languages = [
    { code: 'en-US', name: 'English', i18nCode: 'en' },
    { code: 'hi-IN', name: 'हिंदी', i18nCode: 'hi' },
    { code: 'te-IN', name: 'తెలుగు', i18nCode: 'te' },
    { code: 'ur-PK', name: 'اردو', i18nCode: 'ur' },
  ];

  useEffect(() => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser does not support speech recognition",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    if (recognitionRef.current) {
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = currentLanguage;

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
        
        if (finalTranscript) {
          setIsProcessing(true);
          processVoiceInput(finalTranscript);
          if (onTranscription) {
            const langObj = languages.find(l => l.code === currentLanguage);
            onTranscription(finalTranscript, langObj?.i18nCode || 'en');
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsProcessing(false);
        toast({
          title: "Speech Recognition Error",
          description: `Error: ${event.error}`,
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [currentLanguage]);

  const processVoiceInput = async (text: string) => {
    try {
      // Simple response generation based on common metro queries
      let responseText = '';
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes('metro') || lowerText.includes('train')) {
        responseText = getMetroResponse(lowerText);
      } else if (lowerText.includes('ticket') || lowerText.includes('book')) {
        responseText = getTicketResponse(lowerText);
      } else if (lowerText.includes('lost') || lowerText.includes('found')) {
        responseText = getLostFoundResponse(lowerText);
      } else if (lowerText.includes('food') || lowerText.includes('eat')) {
        responseText = getFoodResponse(lowerText);
      } else {
        responseText = getDefaultResponse();
      }

      setResponse(responseText);
      speakResponse(responseText);
    } catch (error) {
      console.error('Error processing voice input:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process voice input",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getMetroResponse = (text: string) => {
    const responses = {
      'en': "I can help you with metro services. You can book tickets, check arrivals, or find accessibility assistance.",
      'hi': "मैं मेट्रो सेवाओं में आपकी मदद कर सकता हूं। आप टिकट बुक कर सकते हैं, आगमन की जांच कर सकते हैं, या पहुंच सहायता पा सकते हैं।",
      'te': "నేను మెట్రో సేవలతో మీకు సహాయం చేయగలను. మీరు టిక్కెట్లను బుక్ చేయవచ్చు, రాకడను తనిఖీ చేయవచ్చు లేదా అందుబాటు సహాయతను కనుగొనవచ్చు.",
      'ur': "میں میٹرو سروسز میں آپ کی مدد کر سکتا ہوں۔ آپ ٹکٹ بک کر سکتے ہیں، آمد کی جانچ کر سکتے ہیں، یا رسائی کی مدد حاصل کر سکتے ہیں۔"
    };
    return responses[getCurrentI18nLanguage()] || responses['en'];
  };

  const getTicketResponse = (text: string) => {
    const responses = {
      'en': "To book a metro ticket, go to the booking section and select your source and destination stations.",
      'hi': "मेट्रो टिकट बुक करने के लिए, बुकिंग सेक्शन में जाएं और अपने स्रोत और गंतव्य स्टेशन चुनें।",
      'te': "మెట్రో టిక్కెట్ బుక్ చేయడానికి, బుకింగ్ విభాగానికి వెళ్లి మీ మూలం మరియు గమ్యస్థాన స్టేషన్లను ఎంచుకోండి.",
      'ur': "میٹرو ٹکٹ بک کرنے کے لیے، بکنگ سیکشن میں جائیں اور اپنے ماخذ اور منزل کے اسٹیشنز منتخب کریں۔"
    };
    return responses[getCurrentI18nLanguage()] || responses['en'];
  };

  const getLostFoundResponse = (text: string) => {
    const responses = {
      'en': "You can report lost items or check found items in the Lost & Found section. Upload images and provide details for better matching.",
      'hi': "आप खोई हुई वस्तुओं की रिपोर्ट कर सकते हैं या खोया और पाया सेक्शन में मिली हुई वस्तुओं की जांच कर सकते हैं। बेहतर मिलान के लिए छवियां अपलोड करें और विवरण प्रदान करें।",
      'te': "మీరు కోల్పోయిన వస్తువులను నివేదించవచ్చు లేదా కోల్పోయినవి & దొరికినవి విభాగంలో దొరికిన వస్తువులను తనిఖీ చేయవచ్చు। మెరుగైన మ్యాచింగ్ కోసం చిత్రాలను అప్‌లోడ్ చేయండి మరియు వివరాలను అందించండి।",
      'ur': "آپ کھویا اور ملا سیکشن میں گمشدہ اشیاء کی اطلاع دے سکتے ہیں یا ملی ہوئی اشیاء کی جانچ کر سکتے ہیں۔ بہتر میچنگ کے لیے تصاویر اپ لوڈ کریں اور تفصیلات فراہم کریں۔"
    };
    return responses[getCurrentI18nLanguage()] || responses['en'];
  };

  const getFoodResponse = (text: string) => {
    const responses = {
      'en': "Check out food stalls available at metro stations. You can browse menus and place orders for pickup.",
      'hi': "मेट्रो स्टेशनों पर उपलब्ध खाद्य स्टालों को देखें। आप मेनू ब्राउज़ कर सकते हैं और पिकअप के लिए ऑर्डर दे सकते हैं।",
      'te': "మెట్రో స్టేషన్లలో అందుబాటులో ఉన్న ఫుడ్ స్టాల్స్‌ను చూడండి. మీరు మెనుస్ బ్రౌజ్ చేయవచ్చు మరియు పికప్ కోసం ఆర్డర్లు చేయవచ్చు.",
      'ur': "میٹرو اسٹیشنوں پر دستیاب فوڈ اسٹالز دیکھیں۔ آپ مینو براؤز کر سکتے ہیں اور پک اپ کے لیے آرڈر دے سکتے ہیں۔"
    };
    return responses[getCurrentI18nLanguage()] || responses['en'];
  };

  const getDefaultResponse = () => {
    const responses = {
      'en': "I'm your metro assistant. I can help you with tickets, metro arrivals, lost & found, food orders, and accessibility assistance.",
      'hi': "मैं आपका मेट्रो सहायक हूं। मैं टिकट, मेट्रो आगमन, खोया और पाया, खाद्य ऑर्डर और पहुंच सहायता में आपकी मदद कर सकता हूं।",
      'te': "నేను మీ మెట్రో అసిస్టెంట్‌ని. టిక్కెట్లు, మెట్రో రాకడలు, కోల్పోయినవి & దొరికినవి, ఆహార ఆర్డర్లు మరియు అందుబాటు సహాయతతో నేను మీకు సహాయం చేయగలను.",
      'ur': "میں آپ کا میٹرو اسسٹنٹ ہوں۔ میں ٹکٹس، میٹرو کی آمد، کھویا اور ملا، فوڈ آرڈرز، اور رسائی کی مدد میں آپ کی مدد کر سکتا ہوں۔"
    };
    return responses[getCurrentI18nLanguage()] || responses['en'];
  };

  const getCurrentI18nLanguage = () => {
    const langObj = languages.find(l => l.code === currentLanguage);
    return langObj?.i18nCode || 'en';
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      synthesisRef.current = new SpeechSynthesisUtterance(text);
      synthesisRef.current.lang = currentLanguage;
      synthesisRef.current.rate = 0.9;
      synthesisRef.current.pitch = 1;
      
      window.speechSynthesis.speak(synthesisRef.current);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setResponse('');
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleLanguageChange = (langCode: string) => {
    setCurrentLanguage(langCode);
    const langObj = languages.find(l => l.code === langCode);
    if (langObj) {
      i18n.changeLanguage(langObj.i18nCode);
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.lang = langCode;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Metro Voice Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('voice.language_selection')}</label>
          <Select value={currentLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className={`w-16 h-16 rounded-full ${
              isListening 
                ? 'bg-destructive hover:bg-destructive/90' 
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {isListening ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>
        </div>

        <div className="text-center">
          {isListening ? (
            <p className="text-sm text-muted-foreground">{t('voice.listening')}</p>
          ) : isProcessing ? (
            <p className="text-sm text-muted-foreground">{t('voice.processing')}</p>
          ) : (
            <p className="text-sm text-muted-foreground">{t('voice.click_to_speak')}</p>
          )}
        </div>

        {transcript && (
          <div className="p-3 bg-secondary rounded-lg">
            <p className="text-sm font-medium mb-1">You said:</p>
            <p className="text-sm">{transcript}</p>
          </div>
        )}

        {response && (
          <div className="p-3 bg-primary/10 rounded-lg">
            <p className="text-sm font-medium mb-1">{t('voice.voice_response')}:</p>
            <p className="text-sm">{response}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceAssistant;
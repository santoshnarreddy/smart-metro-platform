import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Send, X, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  intent?: string;
  confidence?: number;
  source?: string;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "👋 Hello! I'm your Smart Metro Assistant. I can help you with ticket booking, parking, directions, timings, and more. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date(),
      intent: 'greeting',
      source: 'system'
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: currentMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chatbot-assistant', {
        body: { 
          message: currentMessage,
          useAI: currentMessage.length > 50 // Use AI for complex queries
        }
      });

      if (error) {
        throw error;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: 'bot',
        timestamp: new Date(),
        intent: data.intent,
        confidence: data.confidence,
        source: data.source
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment!",
        sender: 'bot',
        timestamp: new Date(),
        intent: 'error',
        source: 'fallback'
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Error",
        description: "Unable to connect to the assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    "Book a ticket",
    "Find parking",
    "Get directions", 
    "Check timings",
    "Smart card balance",
    "Report lost item"
  ];

  const handleQuickAction = (action: string) => {
    setCurrentMessage(action);
  };

  // Floating button when chat is closed
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-glow bg-gradient-primary hover:shadow-elegant transition-bounce z-50"
        size="lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-smooth ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      <Card className="h-full shadow-elegant border-primary/20 bg-card/95 backdrop-blur-lg">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between py-4 px-6 bg-gradient-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-white/20 text-white">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">Metro Assistant</CardTitle>
              <p className="text-xs text-primary-foreground/80">
                {isLoading ? 'Typing...' : 'Online'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-primary-foreground hover:bg-white/10 h-8 w-8 p-0"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-white/10 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[calc(100%-80px)]">
            {/* Messages */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.sender === 'bot' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                        {message.source && message.sender === 'bot' && (
                          <span className="ml-2">• {message.source}</span>
                        )}
                      </p>
                    </div>
                    
                    {message.sender === 'user' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-secondary">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted text-muted-foreground p-3 rounded-2xl">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-100"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            {messages.length <= 1 && (
              <div className="px-4 py-2 border-t bg-secondary/50">
                <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
                <div className="flex flex-wrap gap-1">
                  {quickActions.map((action) => (
                    <Button
                      key={action}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(action)}
                      className="text-xs h-7 px-2"
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t bg-background/50">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about metro services..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || isLoading}
                  className="bg-gradient-primary"
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ChatBot;
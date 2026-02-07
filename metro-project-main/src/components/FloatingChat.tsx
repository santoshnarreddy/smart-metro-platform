import { useState } from "react";
import { MessageCircle, X, Send, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your Metro Assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: message,
      sender: "user" as const,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage("");

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: "Thanks for your message! I'm here to help with metro tickets, routes, timings, and more. What specific information do you need?",
        sender: "bot" as const,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-metro-blue shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-glow-blue focus-ring float ${
          isOpen ? 'rotate-0' : ''
        }`}
        aria-label="Open chat assistant"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 z-40 w-80 max-w-[calc(100vw-3rem)] shadow-metro-lg animate-fade-up sm:w-96">
          <CardHeader className="border-b bg-gradient-metro-blue text-white">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="h-5 w-5" />
              Metro Assistant
            </CardTitle>
            <p className="text-sm text-blue-100">
              Ask me about tickets, routes, timings & more
            </p>
          </CardHeader>

          <CardContent className="p-0">
            {/* Messages Area */}
            <div className="max-h-96 min-h-[300px] overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                      msg.sender === 'user'
                        ? 'bg-gradient-metro-blue text-white'
                        : 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className={`mt-1 text-xs opacity-70 ${
                      msg.sender === 'user' ? 'text-blue-100' : 'text-neutral-500'
                    }`}>
                      {msg.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 focus-ring"
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  className="bg-gradient-metro-blue focus-ring"
                  disabled={!message.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="focus-ring"
                  aria-label="Voice input"
                >
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Quick Actions */}
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  "Book a ticket",
                  "Check timings",
                  "Find route",
                  "Smart card balance"
                ].map((action) => (
                  <Button
                    key={action}
                    variant="outline"
                    size="sm"
                    className="text-xs focus-ring"
                    onClick={() => setMessage(action)}
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default FloatingChat;
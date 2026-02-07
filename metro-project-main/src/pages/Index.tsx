import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AlertScroller from "@/components/AlertScroller";
import DashboardGrid from "@/components/DashboardGrid";
import VoiceAssistant from "@/components/VoiceAssistant";
import ModalBookTicket from "@/components/ModalBookTicket";
import FloatingChat from "@/components/FloatingChat";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-muted/30">
      <Header user={user} />
      <Hero user={user} />
      <div className="container mx-auto px-4 py-4">
        <AlertScroller />
      </div>
      <DashboardGrid user={user} />
      <div className="container mx-auto px-4 py-8" id="voice-assistant">
        <VoiceAssistant />
      </div>
      <ModalBookTicket>
        <span></span>
      </ModalBookTicket>
      <FloatingChat />
    </div>
  );
};

export default Index;

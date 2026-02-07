import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backgroundGradient?: boolean;
}

export default function PageLayout({ 
  children, 
  title, 
  subtitle, 
  showBackButton = true,
  backgroundGradient = true 
}: PageLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen ${backgroundGradient ? 'bg-gradient-to-br from-background via-background/50 to-muted/30' : 'bg-background'} p-4`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {showBackButton && (
          <Button 
            variant="outline" 
            onClick={() => navigate("/")} 
            className="mb-4 glass-effect hover:bg-white/20 border-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        )}

        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-metro-blue to-metro-green bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}
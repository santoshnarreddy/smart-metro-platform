import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, ChevronRight } from "lucide-react";
import { calculateWalkingTime, formatWalkingTime } from "@/utils/transportCalculator";

interface TransportCardProps {
  title: string;
  subtitle?: string;
  distance: string;
  icon: React.ReactNode;
  badges?: string[];
  onNavigate?: () => void;
  isFastest?: boolean;
}

export function TransportCard({ 
  title, 
  subtitle, 
  distance, 
  icon, 
  badges = [],
  onNavigate,
  isFastest = false
}: TransportCardProps) {
  const walkingTime = calculateWalkingTime(distance);

  return (
    <Card className={cn(
      "transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer",
      isFastest && "border-primary border-2"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex gap-3 flex-1">
            <div className="text-3xl">{icon}</div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  {subtitle && (
                    <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                  )}
                </div>
                {isFastest && (
                  <Badge variant="default" className="text-xs">
                    Fastest
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{distance}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatWalkingTime(walkingTime)}</span>
                </div>
              </div>

              {badges.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {badges.map((badge, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {badge}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {onNavigate && (
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={onNavigate}
              className="ml-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

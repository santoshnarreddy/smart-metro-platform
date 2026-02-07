import { Navigation, Clock, Footprints, Flag, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StepInstructionsProps {
  instructions: string[];
  totalDistance: number;
  estimatedTime: number;
  onClear?: () => void;
}

export default function StepInstructions({
  instructions,
  totalDistance,
  estimatedTime,
  onClear
}: StepInstructionsProps) {
  if (instructions.length === 0) {
    return (
      <Card className="glass-effect border-slate-200">
        <CardContent className="pt-12 pb-12 text-center">
          <Navigation className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Select a destination to see directions</p>
          <p className="text-slate-400 text-sm mt-2">Click on any facility on the map or list</p>
        </CardContent>
      </Card>
    );
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${minutes} min ${secs} sec` : `${minutes} min`;
  };

  return (
    <Card className="glass-effect border-metro-blue/20 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-metro-blue/10 to-metro-green/10 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Navigation className="h-5 w-5 text-metro-blue" />
            Navigation Guide
          </CardTitle>
          {onClear && (
            <button
              onClick={onClear}
              className="text-sm text-metro-red hover:text-metro-red/80 font-medium transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Footprints className="h-4 w-4 text-metro-green" />
            <span className="text-sm font-medium text-slate-700">{totalDistance}m</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-metro-blue" />
            <span className="text-sm font-medium text-slate-700">{formatTime(estimatedTime)}</span>
          </div>
        </div>
      </CardHeader>

      <ScrollArea className="h-[400px]">
        <CardContent className="pt-6 pb-6">
          <div className="space-y-4">
            {instructions.map((instruction, index) => {
              const isStart = index === 0;
              const isEnd = index === instructions.length - 1;
              
              return (
                <div key={index} className="flex gap-4 relative">
                  {/* Connecting line */}
                  {!isEnd && (
                    <div className="absolute left-[19px] top-10 w-0.5 h-full bg-gradient-to-b from-metro-blue to-metro-green" />
                  )}
                  
                  {/* Step number/icon */}
                  <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm shadow-md ${
                    isStart
                      ? "bg-metro-green text-white"
                      : isEnd
                      ? "bg-metro-red text-white"
                      : "bg-white text-metro-blue border-2 border-metro-blue"
                  }`}>
                    {isStart ? (
                      <MapPin className="h-5 w-5" />
                    ) : isEnd ? (
                      <Flag className="h-5 w-5" />
                    ) : (
                      index
                    )}
                  </div>
                  
                  {/* Instruction text */}
                  <div className={`flex-1 py-2 px-4 rounded-lg ${
                    isStart || isEnd
                      ? "bg-gradient-to-r from-slate-50 to-slate-100 border-l-4 border-metro-blue"
                      : "bg-slate-50"
                  }`}>
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">
                      {instruction}
                    </p>
                    {(isStart || isEnd) && (
                      <Badge className="mt-2" variant={isStart ? "default" : "destructive"}>
                        {isStart ? "Start Point" : "Destination"}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}

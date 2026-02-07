import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  lineColor: 'red' | 'blue' | 'green';
  user?: any;
  onClick?: () => void;
}

const FeatureCard = ({ 
  title, 
  description, 
  icon: Icon, 
  path, 
  lineColor, 
  user,
  onClick 
}: FeatureCardProps) => {
  const navigate = useNavigate();

  const colorClasses = {
    red: {
      border: 'border-metro-red',
      bg: 'bg-metro-red/10',
      text: 'text-metro-red',
      gradient: 'bg-gradient-metro-red',
      glow: 'hover:shadow-glow-red'
    },
    blue: {
      border: 'border-metro-blue',
      bg: 'bg-metro-blue/10',
      text: 'text-metro-blue',
      gradient: 'bg-gradient-metro-blue',
      glow: 'hover:shadow-glow-blue'
    },
    green: {
      border: 'border-metro-green',
      bg: 'bg-metro-green/10',
      text: 'text-metro-green',
      gradient: 'bg-gradient-metro-green',
      glow: 'hover:shadow-glow-green'
    }
  };

  const colors = colorClasses[lineColor];

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (path.startsWith('#')) {
      const element = document.getElementById(path.slice(1));
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(path);
    }
  };

  return (
    <Card 
      className={`metro-card cursor-pointer group ${colors.glow}`}
      onClick={handleClick}
      style={{ '--line-color': lineColor === 'red' ? '#D32F2F' : lineColor === 'blue' ? '#1565C0' : '#2E7D32' } as any}
    >
      <CardHeader className="space-y-4">
        {/* Icon with colored background */}
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg} transition-metro group-hover:scale-110`}>
          <Icon className={`h-6 w-6 ${colors.text}`} />
        </div>

        {/* Line color pill */}
        <div className="flex items-center justify-between">
          <div className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}>
            {lineColor.charAt(0).toUpperCase() + lineColor.slice(1)} Line
          </div>
        </div>

        <div>
          <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-opacity-80 transition-metro">
            {title}
          </CardTitle>
          <CardDescription className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            {description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <Button 
          className={`w-full ${colors.gradient} hover:shadow-lg focus-ring transition-metro font-semibold shimmer`}
        >
          Access Feature
        </Button>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
import FeatureCard from "./FeatureCard";
import { 
  Train, 
  Car, 
  CreditCard, 
  Wallet, 
  Route, 
  Clock, 
  UtensilsCrossed, 
  Heart, 
  MessageSquare, 
  Search, 
  QrCode, 
  User, 
  Mic,
  MapPin,
  Bus
} from "lucide-react";

interface DashboardGridProps {
  user?: any;
}

const features = [
  {
    title: "Book Tickets",
    description: "Select stations, choose travel time, and book your metro tickets instantly with secure payments",
    icon: Train,
    path: "/booking",
    lineColor: "blue" as const
  },
  {
    title: "Smart Parking",
    description: "Reserve parking spots at metro stations with real-time availability and digital payments",
    icon: Car,
    path: "/smart-parking",
    lineColor: "green" as const
  },
  {
    title: "Smart Card",
    description: "Check balance, recharge your metro smart card, and view transaction history digitally",
    icon: CreditCard,
    path: "/smart-card",
    lineColor: "red" as const
  },
  {
    title: "Virtual E-Card",
    description: "Create a digital contactless metro card with QR code for seamless contactless travel",
    icon: Wallet,
    path: "/virtual-card",
    lineColor: "blue" as const
  },
  {
    title: "Route Optimizer",
    description: "Find the shortest path between stations using smart algorithms and real-time data",
    icon: Route,
    path: "/route-optimizer",
    lineColor: "green" as const
  },
  {
    title: "Live Arrivals",
    description: "Get real-time metro arrival notifications with accurate delay status and ETAs",
    icon: Clock,
    path: "/metro-arrivals",
    lineColor: "red" as const
  },
  {
    title: "Station Navigation",
    description: "Indoor GPS navigation to help you find platforms, exits, and facilities inside stations",
    icon: MapPin,
    path: "/indoor-navigation",
    lineColor: "blue" as const
  },
  {
    title: "Post-Station Transport",
    description: "Find onward transport options from your destination station",
    icon: Bus,
    path: "/post-station-transport",
    lineColor: "green" as const
  },
  {
    title: "Offline Tickets",
    description: "Generate QR code tickets that work without internet connection for seamless travel",
    icon: QrCode,
    path: "/offline-tickets",
    lineColor: "red" as const
  },
  {
    title: "Feedback & Support",
    description: "Share your experience, report issues, and get help from our support team",
    icon: MessageSquare,
    path: "/feedback",
    lineColor: "red" as const
  },
  {
    title: "Lost & Found",
    description: "Report lost items or search for belongings with our smart matching system",
    icon: Search,
    path: "/lost-and-found",
    lineColor: "blue" as const
  },
  {
    title: "Accessibility Assistance",
    description: "Request special assistance for differently-abled passengers at metro stations",
    icon: Heart,
    path: "/accessibility-assistance",
    lineColor: "green" as const
  },
  {
    title: "Volunteer Program",
    description: "Join our volunteer program to help fellow passengers and earn community rewards",
    icon: User,
    path: "/volunteer-signup",
    lineColor: "red" as const
  },
  {
    title: "Voice Assistant",
    description: "Talk to our multilingual AI assistant for hands-free metro help and navigation",
    icon: Mic,
    path: "#voice-assistant",
    lineColor: "blue" as const,
    onClick: () => {
      const voiceSection = document.getElementById('voice-assistant');
      voiceSection?.scrollIntoView({ behavior: 'smooth' });
    }
  },
  {
    title: "Food Stalls",
    description: "Order delicious food from verified stalls at metro stations with UPI payments",
    icon: UtensilsCrossed,
    path: "/food-stalls",
    lineColor: "green" as const
  }
];

const DashboardGrid = ({ user }: DashboardGridProps) => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-display text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            Metro Services & Features
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
            Explore all the digital services available to make your metro journey smooth and convenient
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="animate-fade-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <FeatureCard
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                path={feature.path}
                lineColor={feature.lineColor}
                user={user}
                onClick={feature.onClick}
              />
            </div>
          ))}
        </div>

        {/* Stats section */}
        <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mb-2 font-display text-4xl font-bold text-metro-blue">66+</div>
            <p className="text-neutral-600 dark:text-neutral-400">Metro Stations</p>
          </div>
          <div className="text-center">
            <div className="mb-2 font-display text-4xl font-bold text-metro-red">3</div>
            <p className="text-neutral-600 dark:text-neutral-400">Metro Lines</p>
          </div>
          <div className="text-center">
            <div className="mb-2 font-display text-4xl font-bold text-metro-green">24/7</div>
            <p className="text-neutral-600 dark:text-neutral-400">Digital Booking</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardGrid;
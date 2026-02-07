import { Button } from "@/components/ui/button";
import { Train, ArrowRight, MapPin, Clock, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeroProps {
  user?: any;
}

const Hero = ({ user }: HeroProps) => {
  const navigate = useNavigate();

  const handleMainCTA = () => {
    if (user) {
      navigate("/booking");
    } else {
      navigate("/auth");
    }
  };

  return (
    <section className="relative overflow-hidden py-16 lg:py-24">
      {/* Background gradient */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Floating metro line graphics */}
      <div className="absolute left-0 top-1/4 h-2 w-32 bg-gradient-metro-red opacity-20" />
      <div className="absolute right-0 top-1/2 h-2 w-24 bg-gradient-metro-blue opacity-20" />
      <div className="absolute left-1/4 bottom-1/4 h-2 w-28 bg-gradient-metro-green opacity-20" />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-white/80 px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm backdrop-blur-sm dark:bg-neutral-800/80 dark:text-neutral-300">
            <Train className="h-4 w-4 text-metro-blue" />
            Hyderabad Metro Digital Platform
          </div>

          {/* Main heading */}
          <h1 className="mb-6 font-display text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-5xl lg:text-6xl animate-fade-up">
            Your Intelligent Metro
            <span className="bg-gradient-to-r from-metro-blue via-metro-red to-metro-green bg-clip-text text-transparent">
              {" "}Companion
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mb-8 text-xl leading-relaxed text-neutral-600 dark:text-neutral-400 animate-fade-up [animation-delay:200ms]">
            Book tickets, reserve parking, check arrivals, and manage your journey 
            seamlessly across all Hyderabad Metro lines
          </p>

          {/* CTA buttons */}
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:justify-center animate-fade-up [animation-delay:400ms]">
            <Button
              size="lg"
              onClick={handleMainCTA}
              className="group bg-gradient-metro-blue text-lg font-semibold shadow-lg hover:shadow-glow-blue focus-ring shimmer"
            >
              {user ? "Book Your Journey" : "Get Started"}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/route-optimizer")}
              className="border-2 text-lg font-semibold focus-ring"
            >
              Plan Route
              <MapPin className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 animate-fade-up [animation-delay:600ms]">
            <div className="flex items-center justify-center gap-3 rounded-xl bg-white/60 p-4 backdrop-blur-sm dark:bg-neutral-800/60">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-metro-red/10">
                <Train className="h-5 w-5 text-metro-red" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">Instant Booking</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Quick metro tickets</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 rounded-xl bg-white/60 p-4 backdrop-blur-sm dark:bg-neutral-800/60">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-metro-blue/10">
                <Clock className="h-5 w-5 text-metro-blue" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">Live Updates</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Real-time arrivals</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 rounded-xl bg-white/60 p-4 backdrop-blur-sm dark:bg-neutral-800/60">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-metro-green/10">
                <CreditCard className="h-5 w-5 text-metro-green" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">Smart Payments</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Digital wallet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
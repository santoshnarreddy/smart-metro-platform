import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Train, User, LogOut, Menu, X, Wallet } from "lucide-react";

interface HeaderProps {
  user?: any;
}

const Header = ({ user }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-md dark:bg-neutral-900/90">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-metro-blue">
              <Train className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Smart Metro
              </h1>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Hyderabad Metro
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="focus-ring"
            >
              Home
            </Button>
            {user && (
              <Button 
                variant="ghost" 
                onClick={() => navigate("/dashboard")}
                className="focus-ring"
              >
                Dashboard
              </Button>
            )}
            <Button 
              variant="ghost" 
              onClick={() => navigate("/metro-map")}
              className="focus-ring"
            >
              Map
            </Button>
            {user && (
              <Button 
                variant="ghost" 
                onClick={() => navigate("/wallet")}
                className="focus-ring text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Wallet
              </Button>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-metro-blue">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      Metro User
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="focus-ring"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => navigate("/auth")}
                className="bg-gradient-metro-blue hover:shadow-glow-blue focus-ring shimmer"
              >
                Sign In
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden focus-ring"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white/95 backdrop-blur-md dark:bg-neutral-900/95">
            <nav className="flex flex-col gap-2 p-4">
              <Button 
                variant="ghost" 
                onClick={() => {
                  navigate("/");
                  setMobileMenuOpen(false);
                }}
                className="justify-start focus-ring"
              >
                Home
              </Button>
              {user && (
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    navigate("/dashboard");
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start focus-ring"
                >
                  Dashboard
                </Button>
              )}
              <Button 
                variant="ghost" 
                onClick={() => {
                  navigate("/metro-map");
                  setMobileMenuOpen(false);
                }}
                className="justify-start focus-ring"
              >
                Map
              </Button>
              {user && (
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    navigate("/wallet");
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start focus-ring text-orange-500"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Wallet
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
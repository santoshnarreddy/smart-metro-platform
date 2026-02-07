import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, MapPin, Star, ShoppingCart } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import FoodStallMenu from "@/components/FoodStallMenu";
import Cart from "@/components/Cart";

interface FoodStall {
  id: string;
  name: string;
  station_name: string;
  description: string;
  image_url: string;
  rating: number;
  opening_hours: string;
  is_active: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  preparation_time: number;
  is_available: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const FoodStalls = () => {
  const [stalls, setStalls] = useState<FoodStall[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>("all");
  const [selectedStall, setSelectedStall] = useState<FoodStall | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  
  const location = useLocation();
  const selectedStationFromRoute = location.state?.selectedStation;

  useEffect(() => {
    if (selectedStationFromRoute) {
      setSelectedStation(selectedStationFromRoute);
    }
    fetchStalls();
  }, [selectedStationFromRoute]);

  const fetchStalls = async () => {
    try {
      const { data, error } = await supabase
        .from('food_stalls')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      setStalls(data || []);
    } catch (error) {
      console.error('Error fetching stalls:', error);
      toast({
        title: "Error",
        description: "Failed to load food stalls",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStalls = selectedStation === "all" 
    ? stalls 
    : stalls.filter(stall => stall.station_name === selectedStation);

  const uniqueStations = [...new Set(stalls.map(stall => stall.station_name))];

  const addToCart = (item: MenuItem, quantity: number = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity }];
    });
    
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart`,
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading food stalls...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Food Stalls</h1>
            <p className="text-muted-foreground">Discover delicious food at metro stations</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowCart(true)}
              className="relative"
            >
              <ShoppingCart className="h-4 w-4" />
              {getTotalItems() > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Station Filter */}
        <div className="mb-6">
          <Select value={selectedStation} onValueChange={setSelectedStation}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Select a station" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stations</SelectItem>
              {uniqueStations.map(station => (
                <SelectItem key={station} value={station}>
                  {station}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stalls Grid */}
        {filteredStalls.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No food stalls found for the selected station.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStalls.map((stall) => (
              <Card key={stall.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div 
                  onClick={() => setSelectedStall(stall)}
                  className="h-full"
                >
                  {stall.image_url && (
                    <div className="h-48 bg-muted">
                      <img
                        src={stall.image_url}
                        alt={stall.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{stall.name}</CardTitle>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{stall.rating}</span>
                      </div>
                    </div>
                    
                    <CardDescription>{stall.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{stall.station_name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{stall.opening_hours}</span>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Menu Modal */}
        {selectedStall && (
          <FoodStallMenu
            stall={selectedStall}
            onClose={() => setSelectedStall(null)}
            onAddToCart={addToCart}
          />
        )}

        {/* Cart Modal */}
        {showCart && (
          <Cart
            items={cartItems}
            onClose={() => setShowCart(false)}
            onUpdateQuantity={updateCartQuantity}
            onRemoveItem={removeFromCart}
          />
        )}
      </div>
    </div>
  );
};

export default FoodStalls;
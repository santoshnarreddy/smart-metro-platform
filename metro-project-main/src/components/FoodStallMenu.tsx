import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, Clock, IndianRupee } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FoodStall {
  id: string;
  name: string;
  station_name: string;
  description: string;
  image_url: string;
  rating: number;
  opening_hours: string;
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

interface FoodStallMenuProps {
  stall: FoodStall;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number) => void;
}

const FoodStallMenu = ({ stall, onClose, onAddToCart }: FoodStallMenuProps) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchMenuItems();
  }, [stall.id]);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('stall_id', stall.id)
        .eq('is_available', true)
        .order('category', { ascending: true });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(menuItems.map(item => item.category))];

  const updateQuantity = (itemId: string, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + change)
    }));
  };

  const handleAddToCart = (item: MenuItem) => {
    const quantity = quantities[item.id] || 1;
    onAddToCart(item, quantity);
    setQuantities(prev => ({ ...prev, [item.id]: 0 }));
  };

  const formatPrice = (priceInPaise: number) => {
    return (priceInPaise / 100).toFixed(2);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{stall.name}</DialogTitle>
          <p className="text-muted-foreground">{stall.description}</p>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading menu...</p>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No menu items available</p>
          </div>
        ) : (
          <Tabs defaultValue={categories[0]} className="w-full">
            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}>
              {categories.map(category => (
                <TabsTrigger key={category} value={category} className="capitalize">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map(category => (
              <TabsContent key={category} value={category} className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuItems
                    .filter(item => item.category === category)
                    .map(item => (
                      <Card key={item.id} className="overflow-hidden">
                        {item.image_url && (
                          <div className="h-32 bg-muted">
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{item.name}</CardTitle>
                            <div className="flex items-center gap-1 text-lg font-bold text-primary">
                              <IndianRupee className="h-4 w-4" />
                              {formatPrice(item.price)}
                            </div>
                          </div>
                          
                          {item.description && (
                            <CardDescription>{item.description}</CardDescription>
                          )}
                        </CardHeader>
                        
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{item.preparation_time} min</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.id, -1)}
                                  disabled={(quantities[item.id] || 0) <= 0}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                
                                <span className="w-8 text-center font-medium">
                                  {quantities[item.id] || 0}
                                </span>
                                
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.id, 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <Button
                                size="sm"
                                onClick={() => handleAddToCart(item)}
                                disabled={(quantities[item.id] || 0) <= 0}
                              >
                                Add to Cart
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FoodStallMenu;
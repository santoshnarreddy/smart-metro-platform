import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Minus, Trash2, IndianRupee, ShoppingBag } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  preparation_time: number;
  quantity: number;
}

interface CartProps {
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
}

const metroStations = [
  "Miyapur", "JNTU College", "KPHB Colony", "Kukatpally", "Balanagar", "Moosapet",
  "Bharat Nagar", "Erragadda", "ESI Hospital", "SR Nagar", "Ameerpet", "Panjagutta",
  "Irrum Manzil", "Khairatabad", "Lakdi-ka-pul", "Assembly", "Nampally", "Gandhi Bhavan",
  "Osmania Medical College", "MG Bus Station", "Malakpet", "New Market", "Moosarambagh",
  "Dilsukhnagar", "Chaitanyapuri", "Victoria Memorial", "LB Nagar", "Nagole", "Uppal",
  "Stadium", "NGRI", "Habsiguda", "Tarnaka", "Mettuguda", "Secunderabad East",
  "Parade Ground", "Paradise", "Rasoolpura", "Prakash Nagar", "Begumpet", "Madhura Nagar",
  "Yousufguda", "Jubilee Hills Road No. 5", "Jubilee Hills Checkpost", "Peddamma Gudi",
  "Madhapur", "Durgam Cheruvu", "Hitech City", "Raidurg", "JBS Parade Ground",
  "Secunderabad West", "Gandhi Hospital", "Musheerabad", "RTC Cross Roads",
  "Chikkadpally", "Narayanguda", "Sultan Bazaar"
];

const Cart = ({ items, onClose, onUpdateQuantity, onRemoveItem }: CartProps) => {
  const [deliveryStation, setDeliveryStation] = useState("");
  const [notes, setNotes] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);

  const getTotalAmount = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const formatPrice = (priceInPaise: number) => {
    return (priceInPaise / 100).toFixed(2);
  };

  const handlePlaceOrder = async () => {
    if (!deliveryStation) {
      toast({
        title: "Error",
        description: "Please select a delivery station",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Your cart is empty",
        variant: "destructive",
      });
      return;
    }

    setIsOrdering(true);

    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to place an order",
          variant: "destructive",
        });
        return;
      }

      // Get the stall ID from the first item (assuming all items are from the same stall)
      const firstItem = items[0];
      const { data: menuItem } = await supabase
        .from('menu_items')
        .select('stall_id')
        .eq('id', firstItem.id)
        .single();

      if (!menuItem) {
        throw new Error('Unable to find stall information');
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          stall_id: menuItem.stall_id,
          total_amount: getTotalAmount(),
          delivery_station: deliveryStation,
          notes: notes || null,
          estimated_delivery: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes from now
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Order Placed Successfully!",
        description: `Your order will be delivered to ${deliveryStation} in about 30 minutes`,
      });

      // Clear cart and close modal
      items.forEach(item => onRemoveItem(item.id));
      onClose();

    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Your Cart ({items.length} items)
          </DialogTitle>
        </DialogHeader>

        {items.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cart Items */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {items.map(item => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-16 h-16 rounded object-cover"
                        />
                      )}
                      
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <div className="flex items-center gap-1 text-primary font-medium">
                          <IndianRupee className="h-3 w-3" />
                          {formatPrice(item.price)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => onRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount:</span>
                  <div className="flex items-center gap-1 text-primary">
                    <IndianRupee className="h-4 w-4" />
                    {formatPrice(getTotalAmount())}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="delivery-station">Delivery Station *</Label>
                  <Select value={deliveryStation} onValueChange={setDeliveryStation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select delivery station" />
                    </SelectTrigger>
                    <SelectContent>
                      {metroStations.map(station => (
                        <SelectItem key={station} value={station}>
                          {station}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Special Instructions (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions for your order..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Place Order Button */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Continue Shopping
              </Button>
              <Button 
                onClick={handlePlaceOrder} 
                disabled={isOrdering || !deliveryStation}
                className="flex-1"
              >
                {isOrdering ? "Placing Order..." : "Place Order via UPI"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Cart;
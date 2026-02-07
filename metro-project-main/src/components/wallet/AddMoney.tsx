import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Loader2 } from "lucide-react";

interface AddMoneyProps {
  onAddMoney: (amount: number) => Promise<boolean>;
  loading?: boolean;
}

const QUICK_AMOUNTS = [100, 200, 500, 1000];

const AddMoney = ({ onAddMoney, loading }: AddMoneyProps) => {
  const [amount, setAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAddMoney = async (value: number) => {
    if (value <= 0) return;
    
    setIsProcessing(true);
    const success = await onAddMoney(value);
    if (success) {
      setAmount("");
    }
    setIsProcessing(false);
  };

  const handleQuickAdd = (value: number) => {
    setAmount(value.toString());
    handleAddMoney(value);
  };

  const handleCustomAdd = () => {
    const value = parseInt(amount);
    if (!isNaN(value) && value > 0) {
      handleAddMoney(value);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5 text-metro-blue" />
          Add Money
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {QUICK_AMOUNTS.map((value) => (
            <Button
              key={value}
              variant="outline"
              onClick={() => handleQuickAdd(value)}
              disabled={isProcessing || loading}
              className="hover:bg-metro-blue hover:text-white transition-colors"
            >
              ₹{value}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or enter custom amount</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom-amount">Custom Amount (₹)</Label>
          <div className="flex gap-2">
            <Input
              id="custom-amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              className="flex-1"
            />
            <Button
              onClick={handleCustomAdd}
              disabled={!amount || parseInt(amount) <= 0 || isProcessing || loading}
              className="bg-metro-blue hover:bg-metro-blue/90"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Add"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddMoney;

import { Card, CardContent } from "@/components/ui/card";
import { Wallet } from "lucide-react";

interface WalletCardProps {
  balance: number;
  loading?: boolean;
}

const WalletCard = ({ balance, loading }: WalletCardProps) => {
  return (
    <Card className="bg-gradient-to-br from-metro-blue to-blue-700 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Metro Wallet</p>
              <p className="text-xs text-white/60">Your digital balance</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-white/70 text-sm mb-1">Current Balance</p>
          {loading ? (
            <div className="h-10 w-32 bg-white/20 rounded animate-pulse" />
          ) : (
            <p className="text-4xl font-bold">₹{balance}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletCard;

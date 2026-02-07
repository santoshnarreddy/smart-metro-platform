import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/PageLayout";
import WalletCard from "@/components/wallet/WalletCard";
import AddMoney from "@/components/wallet/AddMoney";
import WalletTransactionList from "@/components/wallet/WalletTransactionList";
import { useWallet } from "@/hooks/useWallet";

const Wallet = () => {
  const navigate = useNavigate();
  const { balance, transactions, loading, addMoney, isAuthenticated } = useWallet();

  if (!isAuthenticated) {
    return (
      <PageLayout title="Metro Wallet" subtitle="Your digital metro balance" showBackButton={true}>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">Sign in Required</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to access your Metro Wallet
          </p>
          <Button onClick={() => navigate("/auth")} className="bg-metro-blue hover:bg-metro-blue/90">
            Sign In
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Metro Wallet" subtitle="Manage your wallet balance and transactions" showBackButton={true}>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <WalletCard balance={balance} loading={loading} />
          <AddMoney onAddMoney={addMoney} loading={loading} />
        </div>

        {/* Right Column */}
        <div>
          <WalletTransactionList transactions={transactions} loading={loading} />
        </div>
      </div>
    </PageLayout>
  );
};

export default Wallet;

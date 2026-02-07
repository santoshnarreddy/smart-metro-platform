import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowDownCircle, ArrowUpCircle, History } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  amount: number;
  transaction_type: 'credit' | 'debit';
  purpose: string;
  description: string | null;
  created_at: string;
}

interface WalletTransactionListProps {
  transactions: Transaction[];
  loading?: boolean;
}

const WalletTransactionList = ({ transactions, loading }: WalletTransactionListProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No transactions yet</p>
            <p className="text-sm">Add money to get started</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {tx.transaction_type === 'credit' ? (
                      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <ArrowDownCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <ArrowUpCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{tx.purpose}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(tx.created_at), 'MMM dd, yyyy • hh:mm a')}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-semibold ${
                      tx.transaction_type === 'credit'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {tx.transaction_type === 'credit' ? '+' : '-'}₹{tx.amount}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletTransactionList;

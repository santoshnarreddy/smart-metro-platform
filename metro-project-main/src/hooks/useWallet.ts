import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WalletTransaction {
  id: string;
  amount: number;
  transaction_type: 'credit' | 'debit';
  purpose: string;
  description: string | null;
  created_at: string;
}

interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Check auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch wallet and transactions
  const fetchWallet = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch wallet
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (walletError) throw walletError;

      if (walletData) {
        setWallet(walletData as Wallet);
        
        // Fetch transactions
        const { data: txData, error: txError } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('wallet_id', walletData.id)
          .order('created_at', { ascending: false });

        if (txError) throw txError;
        setTransactions(txData as WalletTransaction[] || []);
      } else {
        // Create wallet if doesn't exist
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert({ user_id: userId, balance: 0 })
          .select()
          .single();

        if (createError) throw createError;
        setWallet(newWallet as Wallet);
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  // Add money to wallet
  const addMoney = async (amount: number): Promise<boolean> => {
    if (!wallet || !userId) {
      toast({
        title: "Error",
        description: "Please sign in to add money",
        variant: "destructive",
      });
      return false;
    }

    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return false;
    }

    try {
      const newBalance = wallet.balance + amount;
      
      // Update wallet balance
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', wallet.id);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: txError } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_id: wallet.id,
          user_id: userId,
          amount,
          transaction_type: 'credit',
          purpose: 'Wallet Top-up',
          description: `Added ₹${amount} to wallet`,
        });

      if (txError) throw txError;

      await fetchWallet();
      toast({
        title: "Success",
        description: `₹${amount} added to your wallet`,
      });
      return true;
    } catch (error) {
      console.error('Error adding money:', error);
      toast({
        title: "Error",
        description: "Failed to add money. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Deduct money from wallet
  const deductMoney = async (amount: number, purpose: string, description?: string): Promise<boolean> => {
    if (!wallet || !userId) {
      toast({
        title: "Error",
        description: "Please sign in to use wallet",
        variant: "destructive",
      });
      return false;
    }

    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return false;
    }

    if (wallet.balance < amount) {
      toast({
        title: "Insufficient Balance",
        description: "Your wallet doesn't have enough balance",
        variant: "destructive",
      });
      return false;
    }

    try {
      const newBalance = wallet.balance - amount;
      
      // Update wallet balance
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', wallet.id);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: txError } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_id: wallet.id,
          user_id: userId,
          amount,
          transaction_type: 'debit',
          purpose,
          description: description || `Spent ₹${amount} on ${purpose}`,
        });

      if (txError) throw txError;

      await fetchWallet();
      return true;
    } catch (error) {
      console.error('Error deducting money:', error);
      toast({
        title: "Error",
        description: "Payment failed. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    wallet,
    transactions,
    loading,
    balance: wallet?.balance || 0,
    addMoney,
    deductMoney,
    refreshWallet: fetchWallet,
    isAuthenticated: !!userId,
  };
};

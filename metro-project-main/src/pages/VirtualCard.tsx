import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Plus, ArrowLeft, QrCode, Wallet, History, User, CheckCircle, Search, XCircle, Link, Unlink, RefreshCw } from "lucide-react";
import QRCode from "qrcode";

// Mock virtual cards for verification testing
const MOCK_VIRTUAL_CARDS: Record<string, { holderName: string; balance: number; status: string }> = {
  "VC12345678": { holderName: "Demo User 1", balance: 50000, status: "active" },
  "VC87654321": { holderName: "Demo User 2", balance: 25000, status: "active" },
  "VC11223344": { holderName: "Demo User 3", balance: 100000, status: "active" },
};

// Mock Smart Card data (same as SmartCard.tsx for syncing)
const SMART_CARDS: Record<string, { balance: number; lastUsed: string; status: string; holderName?: string }> = {
  "1234567890": { balance: 245, lastUsed: "2024-01-20", status: "active", holderName: "Test User 1" },
  "0987654321": { balance: 89, lastUsed: "2024-01-19", status: "active", holderName: "Test User 2" },
  "1122334455": { balance: 500, lastUsed: "2024-01-21", status: "active", holderName: "Test User 3" },
};

interface VirtualCardData {
  id: string;
  card_number: string;
  holder_name: string;
  balance: number;
  status: string;
  profile_image_url?: string;
  created_at: string;
  linked_smart_card?: string | null;
}

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  payment_method: string;
  status: string;
  created_at: string;
}

const VirtualCard = () => {
  const [user, setUser] = useState<any>(null);
  const [virtualCard, setVirtualCard] = useState<VirtualCardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpCardNumber, setTopUpCardNumber] = useState("");
  const [verifyCardNumber, setVerifyCardNumber] = useState("");
  const [verificationResult, setVerificationResult] = useState<{ valid: boolean; data?: any } | null>(null);
  const [holderName, setHolderName] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showLinkCard, setShowLinkCard] = useState(false);
  const [smartCardNumber, setSmartCardNumber] = useState("");
  const [syncLoading, setSyncLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadVirtualCard();
      loadTransactions();
    }
  }, [user]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const loadVirtualCard = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('virtual_cards')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading virtual card:', error);
      return;
    }

    if (data) {
      setVirtualCard(data);
      generateQRCode(data);
    }
  };

  const loadTransactions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('virtual_card_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading transactions:', error);
      return;
    }

    setTransactions(data || []);
  };

  const generateQRCode = async (cardData: VirtualCardData) => {
    try {
      const qrData = JSON.stringify({
        type: 'metro_virtual_card',
        card_number: cardData.card_number,
        holder_name: cardData.holder_name,
        balance: cardData.balance,
        issued_at: cardData.created_at
      });
      
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const generateCardNumber = () => {
    return 'VC' + Date.now().toString().slice(-8);
  };

  const handleCreateCard = async () => {
    if (!holderName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full name to create the virtual card",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const cardNumber = generateCardNumber();
      
      const { data, error } = await supabase
        .from('virtual_cards')
        .insert([
          {
            user_id: user.id,
            card_number: cardNumber,
            holder_name: holderName.trim(),
            balance: 24500, // Default balance of ₹245 (stored in paise) - synced with Smart Card
            status: 'active'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setVirtualCard(data);
      generateQRCode(data);
      setShowCreateCard(false);
      setHolderName("");
      
      toast({
        title: "Virtual Card Created!",
        description: "Your Metro E-Card has been successfully created",
      });
    } catch (error) {
      console.error('Error creating virtual card:', error);
      toast({
        title: "Error",
        description: "Failed to create virtual card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCard = () => {
    if (!verifyCardNumber.trim()) {
      toast({
        title: "Card Number Required",
        description: "Please enter a virtual card number to verify",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const mockCard = MOCK_VIRTUAL_CARDS[verifyCardNumber.toUpperCase()];
      
      if (mockCard) {
        setVerificationResult({
          valid: true,
          data: {
            cardNumber: verifyCardNumber.toUpperCase(),
            ...mockCard
          }
        });
        toast({
          title: "Card Verified – Active",
          description: "This virtual card is valid and active",
        });
      } else {
        setVerificationResult({ valid: false });
        toast({
          title: "Invalid Card Number",
          description: "The card number you entered is not valid",
          variant: "destructive",
        });
      }
      setLoading(false);
    }, 1500);
  };

  const handleTopUp = async () => {
    const amount = parseInt(topUpAmount);
    if (!amount || amount < 10 || amount > 5000) {
      toast({
        title: "Invalid Amount",
        description: "Please enter an amount between ₹10 and ₹5000",
        variant: "destructive",
      });
      return;
    }

    // Check if using a specific card number or the user's own card
    const cardNumberToTopUp = topUpCardNumber.trim().toUpperCase() || virtualCard?.card_number;

    if (!cardNumberToTopUp) {
      toast({
        title: "Card Number Required",
        description: "Please enter a virtual card number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Check if the card exists in mock data
      const mockCard = MOCK_VIRTUAL_CARDS[cardNumberToTopUp];
      
      // If it's the user's own card
      if (virtualCard && cardNumberToTopUp === virtualCard.card_number) {
        // Simulate UPI payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        const newBalance = virtualCard.balance + (amount * 100);
        
        const { error: updateError } = await supabase
          .from('virtual_cards')
          .update({ balance: newBalance })
          .eq('id', virtualCard.id);

        if (updateError) throw updateError;

        const { error: transactionError } = await supabase
          .from('virtual_card_transactions')
          .insert([
            {
              card_id: virtualCard.id,
              user_id: user.id,
              amount: amount * 100,
              transaction_type: 'topup',
              description: `UPI Top-up of ₹${amount}`,
              payment_method: 'UPI',
              status: 'completed'
            }
          ]);

        if (transactionError) throw transactionError;

        setVirtualCard({ ...virtualCard, balance: newBalance });
        loadTransactions();
        
        toast({
          title: "Top-up Successful",
          description: `₹${amount} has been added to your virtual card. New balance: ₹${(newBalance / 100).toFixed(2)}`,
        });
      } else if (mockCard) {
        // For mock cards, simulate the top-up
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        MOCK_VIRTUAL_CARDS[cardNumberToTopUp].balance += amount * 100;
        
        toast({
          title: "Top-up Successful",
          description: `₹${amount} has been added to card ${cardNumberToTopUp}. New balance: ₹${(MOCK_VIRTUAL_CARDS[cardNumberToTopUp].balance / 100).toFixed(2)}`,
        });
      } else {
        toast({
          title: "Invalid Card Number",
          description: "The card number you entered is not valid",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      setShowTopUp(false);
      setTopUpAmount("");
      setTopUpCardNumber("");
    } catch (error) {
      console.error('Error during top-up:', error);
      toast({
        title: "Top-up Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLinkSmartCard = async () => {
    if (!smartCardNumber || smartCardNumber.length !== 10) {
      toast({
        title: "Invalid Card Number",
        description: "Please enter a valid 10-digit Smart Card number",
        variant: "destructive",
      });
      return;
    }

    // Check if Smart Card exists
    const smartCard = SMART_CARDS[smartCardNumber];
    if (!smartCard) {
      toast({
        title: "Smart Card Not Found",
        description: "The Smart Card number you entered is not registered. Try: 1234567890, 0987654321, or 1122334455",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Update virtual card with linked smart card
      const { error } = await supabase
        .from('virtual_cards')
        .update({ 
          linked_smart_card: smartCardNumber,
          balance: smartCard.balance * 100 // Convert rupees to paise
        })
        .eq('id', virtualCard!.id);

      if (error) throw error;

      // Update local state
      setVirtualCard({
        ...virtualCard!,
        linked_smart_card: smartCardNumber,
        balance: smartCard.balance * 100
      });

      setShowLinkCard(false);
      setSmartCardNumber("");

      toast({
        title: "Smart Card Linked Successfully!",
        description: `Balance synced: ₹${smartCard.balance.toFixed(2)}`,
      });
    } catch (error) {
      console.error('Error linking Smart Card:', error);
      toast({
        title: "Linking Failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkSmartCard = async () => {
    if (!virtualCard?.linked_smart_card) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('virtual_cards')
        .update({ linked_smart_card: null })
        .eq('id', virtualCard.id);

      if (error) throw error;

      setVirtualCard({
        ...virtualCard,
        linked_smart_card: null
      });

      toast({
        title: "Smart Card Unlinked",
        description: "Your Smart Card has been unlinked from this Virtual Card",
      });
    } catch (error) {
      console.error('Error unlinking Smart Card:', error);
      toast({
        title: "Error",
        description: "Failed to unlink Smart Card",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncBalance = async () => {
    if (!virtualCard?.linked_smart_card) return;

    const smartCard = SMART_CARDS[virtualCard.linked_smart_card];
    if (!smartCard) {
      toast({
        title: "Sync Failed",
        description: "Linked Smart Card not found",
        variant: "destructive",
      });
      return;
    }

    setSyncLoading(true);

    try {
      const newBalance = smartCard.balance * 100;

      const { error } = await supabase
        .from('virtual_cards')
        .update({ balance: newBalance })
        .eq('id', virtualCard.id);

      if (error) throw error;

      setVirtualCard({
        ...virtualCard,
        balance: newBalance
      });

      toast({
        title: "Balance Synced!",
        description: `Current balance: ₹${smartCard.balance.toFixed(2)}`,
      });
    } catch (error) {
      console.error('Error syncing balance:', error);
      toast({
        title: "Sync Failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button 
          variant="outline" 
          onClick={() => navigate("/")} 
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        {/* Card Verification Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Verify Virtual Card
            </CardTitle>
            <CardDescription>
              Enter a virtual card number to check if it's valid
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verify-card">Card Number</Label>
              <Input
                id="verify-card"
                placeholder="Enter virtual card number (e.g., VC12345678)"
                value={verifyCardNumber}
                onChange={(e) => {
                  setVerifyCardNumber(e.target.value.toUpperCase());
                  setVerificationResult(null);
                }}
              />
              <p className="text-xs text-muted-foreground">
                Try: VC12345678, VC87654321, or VC11223344
              </p>
            </div>
            <Button 
              onClick={handleVerifyCard} 
              disabled={loading || !verifyCardNumber.trim()}
              className="w-full"
            >
              {loading ? "Verifying..." : "Verify Card"}
            </Button>
            
            {/* Verification Result */}
            {verificationResult && (
              <div className={`p-4 rounded-lg ${verificationResult.valid ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'}`}>
                <div className="flex items-center gap-2">
                  {verificationResult.valid ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-green-700 dark:text-green-400">Card Verified – Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <span className="font-medium text-red-700 dark:text-red-400">Invalid Card Number</span>
                    </>
                  )}
                </div>
                {verificationResult.valid && verificationResult.data && (
                  <div className="mt-3 text-sm space-y-1">
                    <p><span className="text-muted-foreground">Card Number:</span> {verificationResult.data.cardNumber}</p>
                    <p><span className="text-muted-foreground">Holder Name:</span> {verificationResult.data.holderName}</p>
                    <p><span className="text-muted-foreground">Balance:</span> ₹{(verificationResult.data.balance / 100).toFixed(2)}</p>
                    <p><span className="text-muted-foreground">Status:</span> <Badge variant="secondary" className="bg-green-500 text-white">{verificationResult.data.status.toUpperCase()}</Badge></p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top-Up Any Card Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Top-Up Virtual Card
            </CardTitle>
            <CardDescription>
              Add money to any virtual card using UPI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showTopUp ? (
              <Button 
                onClick={() => setShowTopUp(true)} 
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Top-Up Now
              </Button>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="topup-card">Virtual Card Number</Label>
                  <Input
                    id="topup-card"
                    placeholder="Enter virtual card number"
                    value={topUpCardNumber}
                    onChange={(e) => setTopUpCardNumber(e.target.value.toUpperCase())}
                  />
                  <p className="text-xs text-muted-foreground">
                    Valid cards: VC12345678, VC87654321, VC11223344 {virtualCard ? `or ${virtualCard.card_number}` : ''}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Select Amount</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[100, 200, 500, 1000, 2000].map((amount) => (
                      <Button
                        key={amount}
                        variant={topUpAmount === amount.toString() ? "default" : "outline"}
                        onClick={() => setTopUpAmount(amount.toString())}
                        size="sm"
                      >
                        ₹{amount}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-topup-amount">Custom Amount</Label>
                  <Input
                    id="custom-topup-amount"
                    type="number"
                    placeholder="Enter amount (₹10 - ₹5000)"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    min="10"
                    max="5000"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleTopUp} 
                    disabled={loading || !topUpCardNumber.trim()} 
                    className="flex-1"
                  >
                    {loading ? "Processing..." : `Pay ₹${topUpAmount || 0} via UPI`}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowTopUp(false);
                      setTopUpAmount("");
                      setTopUpCardNumber("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Create Virtual Card */}
        {!virtualCard && !showCreateCard && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <CreditCard className="h-5 w-5" />
                Create Virtual Metro E-Card
              </CardTitle>
              <CardDescription>
                Generate a digital contactless metro card for seamless travel
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => setShowCreateCard(true)} size="lg" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create My E-Card
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Card Form */}
        {showCreateCard && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Create Your Virtual Card
              </CardTitle>
              <CardDescription>
                Enter your details to generate your personalized Metro E-Card
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="holder-name">Cardholder Name</Label>
                <Input
                  id="holder-name"
                  placeholder="Enter your full name"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateCard} 
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Creating..." : "Create E-Card"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateCard(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Virtual Card Display */}
        {virtualCard && (
          <>
            {/* Card Details */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-foreground opacity-10" />
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Metro E-Card
                  </div>
                  <Badge variant="secondary">{virtualCard.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Card Visual */}
                <div className="bg-gradient-to-r from-primary to-primary/80 p-6 rounded-lg text-primary-foreground relative">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm opacity-80">Metro Virtual Card</p>
                      <p className="font-mono text-lg font-bold">{virtualCard.card_number}</p>
                    </div>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={virtualCard.profile_image_url} />
                      <AvatarFallback className="bg-white/20">
                        {virtualCard.holder_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm opacity-80">Balance</p>
                      <p className="text-2xl font-bold">₹{(virtualCard.balance / 100).toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm opacity-80">Cardholder</p>
                      <p className="font-medium">{virtualCard.holder_name}</p>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                {qrCodeUrl && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Scan for contactless payment</p>
                    <div className="inline-block p-4 border rounded-lg bg-white">
                      <img src={qrCodeUrl} alt="Virtual Card QR Code" className="w-32 h-32" />
                    </div>
                  </div>
                )}

                {/* Linked Smart Card Section */}
                <div className="border-t pt-4">
                  {virtualCard.linked_smart_card ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Link className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">Linked Smart Card</span>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          {virtualCard.linked_smart_card}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleSyncBalance}
                          disabled={syncLoading}
                          className="flex-1"
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${syncLoading ? 'animate-spin' : ''}`} />
                          Sync Balance
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleUnlinkSmartCard}
                          disabled={loading}
                          className="text-destructive hover:text-destructive"
                        >
                          <Unlink className="h-4 w-4 mr-2" />
                          Unlink
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {!showLinkCard ? (
                        <Button 
                          variant="outline" 
                          onClick={() => setShowLinkCard(true)}
                          className="w-full"
                        >
                          <Link className="h-4 w-4 mr-2" />
                          Link Smart Card for Balance Sync
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="smart-card-number">Smart Card Number</Label>
                            <Input
                              id="smart-card-number"
                              placeholder="Enter 10-digit Smart Card number"
                              value={smartCardNumber}
                              onChange={(e) => setSmartCardNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                              maxLength={10}
                            />
                            <p className="text-xs text-muted-foreground">
                              Try: 1234567890, 0987654321, or 1122334455
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={handleLinkSmartCard}
                              disabled={loading || smartCardNumber.length !== 10}
                              className="flex-1"
                            >
                              {loading ? "Linking..." : "Link Card"}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setShowLinkCard(false);
                                setSmartCardNumber("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No transactions found</p>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            transaction.transaction_type === 'topup' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            <Wallet className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">₹{(transaction.amount / 100).toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">{transaction.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{new Date(transaction.created_at).toLocaleDateString()}</p>
                          <Badge variant="secondary" className="text-xs">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default VirtualCard;

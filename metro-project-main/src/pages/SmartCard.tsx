import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Wallet, History, Plus, ArrowLeft, User, CheckCircle } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { Checkbox } from "@/components/ui/checkbox";

// Mock smart card data for verification
const SMART_CARDS: Record<string, { balance: number; lastUsed: string; status: string; holderName?: string }> = {
  "1234567890": { balance: 245, lastUsed: "2024-01-20", status: "active", holderName: "Test User 1" },
  "0987654321": { balance: 89, lastUsed: "2024-01-19", status: "active", holderName: "Test User 2" },
  "1122334455": { balance: 500, lastUsed: "2024-01-21", status: "active", holderName: "Test User 3" },
};

// Store for generated cards (simulated backend)
const generatedCards: Record<string, any> = {};

interface RechargeRecord {
  id: string;
  amount: number;
  date: string;
  method: string;
  status: string;
}

interface NewCardFormData {
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  address: string;
  idProofNumber: string;
}

const SmartCard = () => {
  const [user, setUser] = useState<any>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardData, setCardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [showRecharge, setShowRecharge] = useState(false);
  const [rechargeHistory, setRechargeHistory] = useState<RechargeRecord[]>([]);
  const [showGenerateCard, setShowGenerateCard] = useState(false);
  const [generatedCardInfo, setGeneratedCardInfo] = useState<any>(null);
  const [newCardForm, setNewCardForm] = useState<NewCardFormData>({
    fullName: "",
    phoneNumber: "",
    email: "",
    dateOfBirth: "",
    address: "",
    idProofNumber: "",
  });
  const [payWithWallet, setPayWithWallet] = useState(false);
  const navigate = useNavigate();
  const { balance: walletBalance, deductMoney, isAuthenticated: walletAuthenticated } = useWallet();

  useEffect(() => {
    checkAuth();
    loadRechargeHistory();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const loadRechargeHistory = () => {
    const mockHistory: RechargeRecord[] = [
      { id: "1", amount: 100, date: "2024-01-20", method: "UPI", status: "completed" },
      { id: "2", amount: 50, date: "2024-01-18", method: "UPI", status: "completed" },
      { id: "3", amount: 200, date: "2024-01-15", method: "UPI", status: "completed" },
    ];
    setRechargeHistory(mockHistory);
  };

  const handleCardVerification = async () => {
    if (!cardNumber || cardNumber.length !== 10) {
      toast({
        title: "Invalid Card Number",
        description: "Please enter a valid 10-digit card number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Check in predefined cards first
      let card = SMART_CARDS[cardNumber as keyof typeof SMART_CARDS];
      
      // Also check in generated cards
      if (!card && generatedCards[cardNumber]) {
        card = generatedCards[cardNumber];
      }
      
      if (card) {
        setCardData({ ...card, cardNumber });
        toast({
          title: "Card Verified",
          description: "Your smart card has been successfully verified",
        });
      } else {
        toast({
          title: "Card Not Found",
          description: "The card number you entered is not registered",
          variant: "destructive",
        });
      }
      setLoading(false);
    }, 1500);
  };

  const handleRecharge = async () => {
    const amount = parseInt(rechargeAmount);
    if (!amount || amount < 10 || amount > 2000) {
      toast({
        title: "Invalid Amount",
        description: "Please enter an amount between ₹10 and ₹2000",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Handle wallet payment
    if (payWithWallet) {
      if (walletBalance < amount) {
        toast({
          title: "Insufficient Wallet Balance",
          description: `Your wallet balance (₹${walletBalance}) is less than the recharge amount (₹${amount})`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      const paymentSuccess = await deductMoney(amount, 'Smart Card Recharge', `Recharged card: ${cardData.cardNumber}`);
      if (!paymentSuccess) {
        setLoading(false);
        return;
      }
    }

    setTimeout(() => {
      const newBalance = cardData.balance + amount;
      setCardData({ ...cardData, balance: newBalance });
      
      // Update generated cards if applicable
      if (generatedCards[cardData.cardNumber]) {
        generatedCards[cardData.cardNumber].balance = newBalance;
      }
      
      const newRecord: RechargeRecord = {
        id: Date.now().toString(),
        amount,
        date: new Date().toISOString().split('T')[0],
        method: "UPI",
        status: "completed"
      };
      setRechargeHistory([newRecord, ...rechargeHistory]);
      
      toast({
        title: "Recharge Successful",
        description: `₹${amount} has been added to your card. New balance: ₹${newBalance}`,
      });
      
      setShowRecharge(false);
      setRechargeAmount("");
      setLoading(false);
    }, 2000);
  };

  const generateNewCardNumber = (): string => {
    let newNumber = "";
    for (let i = 0; i < 10; i++) {
      newNumber += Math.floor(Math.random() * 10).toString();
    }
    return newNumber;
  };

  const handleGenerateNewCard = () => {
    // Validate required fields
    if (!newCardForm.fullName.trim()) {
      toast({
        title: "Full Name Required",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return;
    }
    if (!newCardForm.phoneNumber.trim() || newCardForm.phoneNumber.length < 10) {
      toast({
        title: "Valid Phone Number Required",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      });
      return;
    }
    if (!newCardForm.email.trim() || !newCardForm.email.includes("@")) {
      toast({
        title: "Valid Email Required",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    if (!newCardForm.dateOfBirth) {
      toast({
        title: "Date of Birth Required",
        description: "Please enter your date of birth",
        variant: "destructive",
      });
      return;
    }
    if (!newCardForm.address.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter your address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const newCardNumber = generateNewCardNumber();
      const newCard = {
        cardNumber: newCardNumber,
        holderName: newCardForm.fullName.trim(),
        balance: 0,
        lastUsed: new Date().toISOString().split('T')[0],
        status: "active",
        phoneNumber: newCardForm.phoneNumber,
        email: newCardForm.email,
        dateOfBirth: newCardForm.dateOfBirth,
        address: newCardForm.address,
        idProofNumber: newCardForm.idProofNumber,
        createdAt: new Date().toISOString(),
      };

      // Store in simulated backend
      generatedCards[newCardNumber] = newCard;

      setGeneratedCardInfo(newCard);
      setShowGenerateCard(false);
      setLoading(false);

      toast({
        title: "Smart Card Generated!",
        description: `Your new card number is ${newCardNumber}`,
      });
    }, 2000);
  };

  const resetNewCardForm = () => {
    setNewCardForm({
      fullName: "",
      phoneNumber: "",
      email: "",
      dateOfBirth: "",
      address: "",
      idProofNumber: "",
    });
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

        {/* Generate New Card Button */}
        {!cardData && !showGenerateCard && !generatedCardInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Generate New Smart Card
              </CardTitle>
              <CardDescription>
                Don't have a smart card? Generate a new one by entering your details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowGenerateCard(true)} 
                className="w-full"
                variant="default"
              >
                <Plus className="h-4 w-4 mr-2" />
                Generate New Card
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Generate New Card Form */}
        {showGenerateCard && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Enter Your Details
              </CardTitle>
              <CardDescription>
                Fill in your details to generate a new smart card
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={newCardForm.fullName}
                  onChange={(e) => setNewCardForm({ ...newCardForm, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  placeholder="Enter 10-digit phone number"
                  value={newCardForm.phoneNumber}
                  onChange={(e) => setNewCardForm({ ...newCardForm, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  maxLength={10}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={newCardForm.email}
                  onChange={(e) => setNewCardForm({ ...newCardForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={newCardForm.dateOfBirth}
                  onChange={(e) => setNewCardForm({ ...newCardForm, dateOfBirth: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  placeholder="Enter your address"
                  value={newCardForm.address}
                  onChange={(e) => setNewCardForm({ ...newCardForm, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idProofNumber">ID Proof Number (Optional)</Label>
                <Input
                  id="idProofNumber"
                  placeholder="Aadhaar/PAN/Passport number"
                  value={newCardForm.idProofNumber}
                  onChange={(e) => setNewCardForm({ ...newCardForm, idProofNumber: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleGenerateNewCard} 
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Generating..." : "Generate Card"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowGenerateCard(false);
                    resetNewCardForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generated Card Display */}
        {generatedCardInfo && !cardData && (
          <Card className="border-green-500 bg-green-50 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                Smart Card Generated Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-primary to-primary/80 p-6 rounded-lg text-primary-foreground">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm opacity-80">Hyderabad Metro Smart Card</p>
                    <p className="font-mono text-xl font-bold mt-1">{generatedCardInfo.cardNumber}</p>
                  </div>
                  <CreditCard className="h-8 w-8" />
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm opacity-80">Card Holder</p>
                    <p className="font-medium">{generatedCardInfo.holderName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-80">Status</p>
                    <Badge variant="secondary" className="bg-green-500 text-white">
                      {generatedCardInfo.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{generatedCardInfo.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{generatedCardInfo.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Balance</p>
                  <p className="font-medium">₹{generatedCardInfo.balance}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Created On</p>
                  <p className="font-medium">{new Date(generatedCardInfo.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    setCardNumber(generatedCardInfo.cardNumber);
                    setCardData({
                      ...generatedCardInfo,
                      cardNumber: generatedCardInfo.cardNumber,
                    });
                    setGeneratedCardInfo(null);
                  }}
                  className="flex-1"
                >
                  Use This Card
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setGeneratedCardInfo(null);
                    resetNewCardForm();
                  }}
                >
                  Generate Another
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card Input */}
        {!cardData && !showGenerateCard && !generatedCardInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Enter Existing Smart Card Details
              </CardTitle>
              <CardDescription>
                Enter your 10-digit metro smart card number to check balance and recharge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-number">Card Number</Label>
                <Input
                  id="card-number"
                  placeholder="Enter 10-digit card number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground">
                  Try: 1234567890, 0987654321, or 1122334455
                </p>
              </div>
              <Button 
                onClick={handleCardVerification} 
                disabled={loading || cardNumber.length !== 10}
                className="w-full"
              >
                {loading ? "Verifying..." : "Verify Card"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Card Details */}
        {cardData && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Smart Card Balance
                  </div>
                  <Badge variant="secondary">{cardData.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Card Number</p>
                  <p className="font-mono text-lg">{cardData.cardNumber}</p>
                </div>
                {cardData.holderName && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Card Holder</p>
                    <p className="font-medium">{cardData.holderName}</p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-3xl font-bold text-primary">₹{cardData.balance}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Last Used</p>
                  <p className="text-sm">{new Date(cardData.lastUsed).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setShowRecharge(true)} className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Recharge
                  </Button>
                  <Button variant="outline" onClick={() => setCardData(null)} className="flex-1">
                    Change Card
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recharge Section */}
            {showRecharge && (
              <Card>
                <CardHeader>
                  <CardTitle>Recharge Your Card</CardTitle>
                  <CardDescription>Add money to your metro card using UPI</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Amount</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[50, 100, 200, 500, 1000].map((amount) => (
                        <Button
                          key={amount}
                          variant={rechargeAmount === amount.toString() ? "default" : "outline"}
                          onClick={() => setRechargeAmount(amount.toString())}
                          size="sm"
                        >
                          ₹{amount}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom-amount">Or Enter Custom Amount</Label>
                    <Input
                      id="custom-amount"
                      type="number"
                      placeholder="Enter amount (₹10 - ₹2000)"
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                      min="10"
                      max="2000"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleRecharge} disabled={loading} className="flex-1">
                      {loading ? "Processing..." : `Pay ₹${rechargeAmount || 0} via UPI`}
                    </Button>
                    <Button variant="outline" onClick={() => setShowRecharge(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recharge History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recharge History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rechargeHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No recharge history found</p>
                ) : (
                  <div className="space-y-3">
                    {rechargeHistory.map((record) => (
                      <div key={record.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">₹{record.amount}</p>
                          <p className="text-sm text-muted-foreground">{record.method}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{new Date(record.date).toLocaleDateString()}</p>
                          <Badge variant="secondary" className="text-xs">
                            {record.status}
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

export default SmartCard;

-- Create virtual cards table for digital metro e-cards
CREATE TABLE public.virtual_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  card_number TEXT UNIQUE NOT NULL,
  holder_name TEXT NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0, -- Balance in paise (₹1 = 100 paise)
  status TEXT NOT NULL DEFAULT 'active',
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create virtual card transactions table for tracking balance changes
CREATE TABLE public.virtual_card_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES public.virtual_cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL, -- Amount in paise
  transaction_type TEXT NOT NULL, -- 'topup', 'payment', 'refund'
  description TEXT,
  payment_method TEXT DEFAULT 'UPI',
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.virtual_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.virtual_card_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for virtual_cards
CREATE POLICY "Users can view their own virtual cards" 
ON public.virtual_cards 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own virtual cards" 
ON public.virtual_cards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own virtual cards" 
ON public.virtual_cards 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for virtual_card_transactions
CREATE POLICY "Users can view their own transactions" 
ON public.virtual_card_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
ON public.virtual_card_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_virtual_card_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_virtual_cards_updated_at
  BEFORE UPDATE ON public.virtual_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_virtual_card_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_virtual_cards_user_id ON public.virtual_cards(user_id);
CREATE INDEX idx_virtual_cards_card_number ON public.virtual_cards(card_number);
CREATE INDEX idx_virtual_card_transactions_card_id ON public.virtual_card_transactions(card_id);
CREATE INDEX idx_virtual_card_transactions_user_id ON public.virtual_card_transactions(user_id);
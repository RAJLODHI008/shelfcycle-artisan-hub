-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('store_staff', 'maker', 'admin');

-- Create enum for lot status
CREATE TYPE public.lot_status AS ENUM ('available', 'claimed', 'picked_up', 'returned', 'completed');

-- Create enum for maker tier
CREATE TYPE public.maker_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'maker',
  phone TEXT,
  address TEXT,
  kyc_verified BOOLEAN DEFAULT false,
  maker_tier maker_tier DEFAULT 'bronze',
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_claims INTEGER DEFAULT 0,
  successful_returns INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lots table for items to be upcycled
CREATE TABLE public.lots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  items_count INTEGER NOT NULL DEFAULT 1,
  estimated_weight_kg DECIMAL(10,2),
  expiry_date DATE,
  images TEXT[] DEFAULT '{}',
  status lot_status NOT NULL DEFAULT 'available',
  created_by UUID REFERENCES auth.users(id),
  claimed_by UUID REFERENCES auth.users(id),
  pickup_date TIMESTAMP WITH TIME ZONE,
  return_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create claims table for tracking lot claims
CREATE TABLE public.claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lot_id UUID NOT NULL REFERENCES public.lots(id) ON DELETE CASCADE,
  maker_id UUID NOT NULL REFERENCES auth.users(id),
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  pickup_scheduled_at TIMESTAMP WITH TIME ZONE,
  picked_up_at TIMESTAMP WITH TIME ZONE,
  return_scheduled_at TIMESTAMP WITH TIME ZONE,
  returned_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Create returned_products table for tracking upcycled items
CREATE TABLE public.returned_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  estimated_value DECIMAL(10,2),
  review_status TEXT DEFAULT 'pending',
  approved_for_sale BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returned_products ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for lots
CREATE POLICY "Everyone can view available lots" ON public.lots FOR SELECT USING (true);
CREATE POLICY "Store staff can create lots" ON public.lots FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'store_staff')
);
CREATE POLICY "Store staff and admin can update lots" ON public.lots FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('store_staff', 'admin'))
);

-- Create policies for claims
CREATE POLICY "Users can view their own claims" ON public.claims FOR SELECT USING (
  maker_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('store_staff', 'admin'))
);
CREATE POLICY "Makers can create claims" ON public.claims FOR INSERT WITH CHECK (
  maker_id = auth.uid() AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'maker')
);

-- Create policies for returned products
CREATE POLICY "Users can view returned products from their claims" ON public.returned_products FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.claims WHERE id = claim_id AND maker_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('store_staff', 'admin'))
);
CREATE POLICY "Makers can insert returned products for their claims" ON public.returned_products FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.claims WHERE id = claim_id AND maker_id = auth.uid())
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_lots_updated_at BEFORE UPDATE ON public.lots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_returned_products_updated_at BEFORE UPDATE ON public.returned_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'maker')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
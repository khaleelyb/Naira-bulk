-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'seller', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  discount_price DECIMAL(12,2),
  stock_quantity INTEGER DEFAULT 0,
  category TEXT,
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  variants JSONB DEFAULT '{}',
  specifications JSONB DEFAULT '{}',
  shipping_fee DECIMAL(10,2) DEFAULT 0,
  is_verified_seller BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create china_orders table
CREATE TABLE IF NOT EXISTS public.china_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  product_url TEXT,
  image_url TEXT,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  preferences JSONB DEFAULT '{}',
  shipping_method TEXT,
  destination TEXT NOT NULL,
  budget DECIMAL(12,2),
  status TEXT DEFAULT 'Pending',
  quotation_price DECIMAL(12,2),
  shipping_fee DECIMAL(12,2),
  estimated_delivery DATE,
  tracking_number TEXT,
  shipment_proof_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Storage setup (Buckets)
-- Run this in Supabase Storage UI to create buckets named 'products' and 'import-requests'

-- RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.china_orders ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Products policies
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Sellers can manage their own products" ON public.products 
  FOR ALL USING (auth.uid() = seller_id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- China Orders policies
CREATE POLICY "Users can view their own import orders" ON public.china_orders FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Users can insert their own import orders" ON public.china_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update import orders" ON public.china_orders FOR UPDATE USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- RyuTopup Supabase Schema (Games & Products Only)
-- Note: 'topup_transactions' already exists and is being used!

-- 1. Create Games Table
CREATE TABLE public.games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    developer TEXT,
    logo TEXT,
    cover TEXT,
    fields JSONB DEFAULT '[]'::jsonb, -- Array of objects: [{id, label, placeholder}]
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Products Table (Diamonds, Passes)
CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price BIGINT NOT NULL,
    original_price BIGINT NOT NULL,
    discount TEXT, -- e.g., "10%", "20%"
    icon TEXT,
    is_pass BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    is_flash_sale BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create Policies for Public Access (Read Only for public)
CREATE POLICY "Allow public read access to active games" 
ON public.games FOR SELECT 
USING (is_active = true);

CREATE POLICY "Allow public read access to active products" 
ON public.products FOR SELECT 
USING (is_active = true);

-- Admin Policies (Full Access for authenticated users)
CREATE POLICY "Allow admin full access to games" ON public.games FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin full access to products" ON public.products FOR ALL USING (auth.role() = 'authenticated');

-- To add the flash sale column to existing tables, run this manually in SQL Editor:
-- ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_flash_sale BOOLEAN DEFAULT false;

-- To enable Supabase Realtime for admin notifications, run this in SQL Editor:
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.topup_transactions;

-- To add Payment Gateway columns to an existing table, run this in SQL Editor:
-- ALTER TABLE public.topup_transactions ADD COLUMN IF NOT EXISTS pg_payment_number TEXT;
-- ALTER TABLE public.topup_transactions ADD COLUMN IF NOT EXISTS pg_expired_at TIMESTAMP WITH TIME ZONE;
-- ALTER TABLE public.topup_transactions ADD COLUMN IF NOT EXISTS pg_fee INTEGER;

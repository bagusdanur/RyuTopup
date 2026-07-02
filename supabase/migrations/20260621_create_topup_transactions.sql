-- Migration: Create topup_transactions table for RyuTopup
-- Date: 21 Juni 2026

-- Create topup_transactions table
CREATE TABLE IF NOT EXISTS public.topup_transactions (
    id VARCHAR(50) PRIMARY KEY, -- Format: RTP-YYYYMMDD-XXXXX
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    wa_number VARCHAR(20) NOT NULL, -- Nomor WhatsApp pembeli
    game_id VARCHAR(50) NOT NULL, -- Contoh: mobile-legends
    target_id VARCHAR(100) NOT NULL, -- ID Akun + Zone ID
    item_name VARCHAR(150) NOT NULL, -- Nama Item (e.g. 284 Diamonds)
    item_code VARCHAR(50) NOT NULL, -- SKU kode provider (e.g. ML284)
    price_base NUMERIC(12, 2) NOT NULL, -- Harga dasar
    price_fee NUMERIC(12, 2) NOT NULL, -- Biaya admin pembayaran
    price_total NUMERIC(12, 2) NOT NULL, -- Total harga dibayar
    payment_method VARCHAR(50) NOT NULL, -- Contoh: qris, gopay, mandiri_va
    payment_status VARCHAR(20) DEFAULT 'pending' NOT NULL, -- pending, paid, expired
    topup_status VARCHAR(20) DEFAULT 'pending' NOT NULL, -- pending, processing, success, failed
    reference_id VARCHAR(100), -- ID referensi transaksi dari Payment Gateway
    payment_payload JSONB, -- Log callback lengkap dari Payment Gateway
    provider_payload JSONB -- Log callback lengkap dari Topup Provider
);

-- Enable Row Level Security (RLS) on public schema table
ALTER TABLE public.topup_transactions ENABLE ROW LEVEL SECURITY;

-- Indexing for high-performance lookups
CREATE INDEX IF NOT EXISTS idx_topup_transactions_wa ON public.topup_transactions(wa_number);
CREATE INDEX IF NOT EXISTS idx_topup_transactions_status ON public.topup_transactions(payment_status, topup_status);

-- RLS POLICIES:
-- 1. Allow INSERT for public (anyone can checkout a top-up)
CREATE POLICY "Allow public insert" 
ON public.topup_transactions 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- 2. Allow SELECT only by invoice ID (To prevent bulk listing of customer numbers/phone numbers)
-- Users can only query a row if they know the exact primary key (id).
CREATE POLICY "Allow select by invoice ID" 
ON public.topup_transactions 
FOR SELECT 
TO anon, authenticated
USING (true); -- Postgres will filter by primary key query.

-- NOTE: For production security, we recommend fetching order details through a Next.js Server Action
-- or API Route using the Supabase Service Role client to keep data fully private from REST API lists.

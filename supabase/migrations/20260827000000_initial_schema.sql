-- PRRX HEX PLATFORM DATABASE SCHEMA (SUPABASE POSTGRESQL)

-- 1. SYSTEM CONFIG (Kill Switch, Global Maintenance, System Settings)
CREATE TABLE IF NOT EXISTS public.system_config (
    id TEXT PRIMARY KEY DEFAULT 'global_maintenance',
    maintenance_enabled BOOLEAN NOT NULL DEFAULT false,
    global_maintenance BOOLEAN NOT NULL DEFAULT false,
    page_maintenance JSONB DEFAULT '{}'::jsonb,
    reason TEXT DEFAULT 'Scheduled System Upgrade & Security Protocol Calibration in Progress. VIP services will resume shortly.',
    timer_end TIMESTAMPTZ,
    allow_admin_bypass BOOLEAN DEFAULT true,
    maintenance_start_time TIMESTAMPTZ,
    maintenance_end_time TIMESTAMPTZ,
    maintenance_message TEXT,
    affected_pages JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT
);

-- 2. PRICE PLANS
CREATE TABLE IF NOT EXISTS public.price_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panel_type TEXT NOT NULL,
    category TEXT DEFAULT 'wholesale',
    label TEXT NOT NULL,
    days TEXT,
    lkr NUMERIC NOT NULL,
    reseller_keys_count INTEGER DEFAULT 10,
    reseller_title TEXT,
    jit_rate NUMERIC DEFAULT 25,
    jit_pay NUMERIC,
    reseller_rate NUMERIC DEFAULT 40,
    commission_rate NUMERIC DEFAULT 40,
    reseller_pay NUMERIC,
    popular BOOLEAN DEFAULT false,
    crown BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DISCOUNTS & PROMO CODES
CREATE TABLE IF NOT EXISTS public.discounts (
    id TEXT PRIMARY KEY,
    panel_type TEXT DEFAULT 'both',
    plan_label TEXT,
    discount_type TEXT NOT NULL,
    discount_value NUMERIC NOT NULL,
    promo_code TEXT UNIQUE,
    badge_text TEXT,
    active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_date TIMESTAMPTZ DEFAULT NOW()
);

-- 4. LICENSE KEYS BANK
CREATE TABLE IF NOT EXISTS public.license_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_key TEXT NOT NULL,
    panel_type TEXT NOT NULL,
    duration TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available',
    order_id TEXT,
    buyer_email TEXT,
    used_by TEXT,
    transaction_id TEXT,
    receipt_id TEXT,
    verified_method TEXT,
    sold_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PAYMENT RECEIPTS & ORDERS
CREATE TABLE IF NOT EXISTS public.receipts (
    id TEXT PRIMARY KEY,
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    customer_whatsapp TEXT,
    panel_type TEXT NOT NULL,
    plan_id TEXT,
    plan_title TEXT,
    amount_paid NUMERIC NOT NULL,
    expected_amount NUMERIC NOT NULL,
    discount_amount NUMERIC DEFAULT 0,
    promo_code TEXT,
    bank_name TEXT,
    bank_account_number TEXT,
    transaction_number TEXT,
    receipt_image_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    verified BOOLEAN DEFAULT false,
    license_key TEXT,
    key_dispensed BOOLEAN DEFAULT false,
    raw_ocr_data JSONB,
    ledger_block_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RESELLERS
CREATE TABLE IF NOT EXISTS public.resellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    display_name TEXT,
    email TEXT UNIQUE,
    status TEXT DEFAULT 'active',
    balance NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. RESELLER RECEIPTS
CREATE TABLE IF NOT EXISTS public.reseller_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reseller_uid TEXT,
    reseller_email TEXT NOT NULL,
    reseller_display_name TEXT,
    customer_email TEXT NOT NULL,
    receipt_image_url TEXT NOT NULL,
    extracted_amount NUMERIC,
    extracted_date TEXT,
    extracted_reference TEXT,
    raw_ocr_text TEXT,
    product_type TEXT NOT NULL,
    duration TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    auto_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. RESELLER ACCOUNT REQUESTS
CREATE TABLE IF NOT EXISTS public.reseller_account_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requested_username TEXT NOT NULL,
    requested_password TEXT NOT NULL,
    product_type TEXT NOT NULL,
    duration TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    claimed_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. DOWNLOAD LINKS
CREATE TABLE IF NOT EXISTS public.download_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    version TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. BENEFICIARY ACCOUNTS
CREATE TABLE IF NOT EXISTS public.beneficiary_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway_label TEXT,
    bank_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    branch_name TEXT,
    gateway_type TEXT DEFAULT 'Bank Transfer',
    notes TEXT,
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. SERVICE STATUS
CREATE TABLE IF NOT EXISTS public.service_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'online',
    category TEXT DEFAULT 'panel',
    uptime_elapsed TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. FREE PANELS
CREATE TABLE IF NOT EXISTS public.free_panels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panel_type TEXT UNIQUE NOT NULL,
    start_day TEXT,
    end_day TEXT,
    username TEXT,
    password TEXT,
    custom_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. V7A APK DOWNLOAD LINKS
CREATE TABLE IF NOT EXISTS public.v7a_apk_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL DEFAULT 'news',
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. WORLD MESSAGES
CREATE TABLE IF NOT EXISTS public.world_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_name TEXT,
    sender_email TEXT,
    sender_avatar TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. COMMUNITY LINKS
CREATE TABLE IF NOT EXISTS public.community_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whatsapp_url TEXT,
    discord_url TEXT,
    popup_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. DISCORD WEBHOOKS & BOT CONFIG
CREATE TABLE IF NOT EXISTS public.discord_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_webhook_url TEXT,
    freebie_webhook_url TEXT,
    receipt_webhook_url TEXT,
    discord_invite_url TEXT,
    bot_dashboard_url TEXT,
    bot_api_key TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. SYSTEM ADMINS
CREATE TABLE IF NOT EXISTS public.system_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. PANEL IMAGES & SCREENSHOTS
CREATE TABLE IF NOT EXISTS public.panel_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_image_url TEXT,
    internal_image_url TEXT,
    hero_hud_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.functions_screenshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internal_screenshots JSONB DEFAULT '{}'::jsonb,
    external_screenshots JSONB DEFAULT '{}'::jsonb,
    meta JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. CRYPTOGRAPHIC IMMUTABLE TRANSACTION LEDGER
CREATE TABLE IF NOT EXISTS public.transaction_ledger (
    block_index BIGINT PRIMARY KEY,
    block_hash TEXT NOT NULL UNIQUE,
    previous_hash TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    order_id TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'LKR',
    buyer_email TEXT NOT NULL,
    plan_title TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL,
    raw_payload JSONB
);

-- ROW LEVEL SECURITY (RLS) POLICIES
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'system_config', 'system_admins', 'discord_webhooks', 'price_plans',
        'discounts', 'license_keys', 'receipts', 'resellers', 'reseller_receipts',
        'reseller_account_requests', 'download_links', 'beneficiary_accounts',
        'service_status', 'free_panels', 'v7a_apk_links', 'announcements',
        'world_messages', 'community_links', 'panel_images', 'functions_screenshots',
        'transaction_ledger'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
            EXECUTE format('DROP POLICY IF EXISTS "Public Full Access" ON public.%I;', t);
        END IF;
    END LOOP;
END $$;

-- Policies for public catalog and reads
DROP POLICY IF EXISTS "Public Read Config" ON public.system_config;
CREATE POLICY "Public Read Config" ON public.system_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Price Plans" ON public.price_plans;
CREATE POLICY "Public Read Price Plans" ON public.price_plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Discounts" ON public.discounts;
CREATE POLICY "Public Read Discounts" ON public.discounts FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Public Read Download Links" ON public.download_links;
CREATE POLICY "Public Read Download Links" ON public.download_links FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Beneficiary" ON public.beneficiary_accounts;
CREATE POLICY "Public Read Beneficiary" ON public.beneficiary_accounts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Service Status" ON public.service_status;
CREATE POLICY "Public Read Service Status" ON public.service_status FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Announcements" ON public.announcements;
CREATE POLICY "Public Read Announcements" ON public.announcements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Community Links" ON public.community_links;
CREATE POLICY "Public Read Community Links" ON public.community_links FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Panel Images" ON public.panel_images;
CREATE POLICY "Public Read Panel Images" ON public.panel_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Screenshots" ON public.functions_screenshots;
CREATE POLICY "Public Read Screenshots" ON public.functions_screenshots FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Free Panels" ON public.free_panels;
CREATE POLICY "Public Read Free Panels" ON public.free_panels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read V7a Links" ON public.v7a_apk_links;
CREATE POLICY "Public Read V7a Links" ON public.v7a_apk_links FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert Receipts" ON public.receipts;
CREATE POLICY "Public Insert Receipts" ON public.receipts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read World Messages" ON public.world_messages;
CREATE POLICY "Public Read World Messages" ON public.world_messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert World Messages" ON public.world_messages;
CREATE POLICY "Public Insert World Messages" ON public.world_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Ledger" ON public.transaction_ledger;
CREATE POLICY "Public Read Ledger" ON public.transaction_ledger FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Insert Ledger" ON public.transaction_ledger;
CREATE POLICY "Public Insert Ledger" ON public.transaction_ledger FOR INSERT WITH CHECK (true);

-- Enable Realtime
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'system_config') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.system_config;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'announcements') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
    END IF;
END $$;

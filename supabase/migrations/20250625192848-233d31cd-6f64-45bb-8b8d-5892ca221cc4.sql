
-- Add promo code support columns to leads_fresh table
ALTER TABLE leads_fresh
ADD COLUMN IF NOT EXISTS promo_code text,
ADD COLUMN IF NOT EXISTS promo_code_discount_percent integer,
ADD COLUMN IF NOT EXISTS promo_code_plan_override text,
ADD COLUMN IF NOT EXISTS discounted_price numeric;


-- Add unique constraint on email column in drip_marketing table
ALTER TABLE drip_marketing
ADD CONSTRAINT drip_marketing_email_key UNIQUE (email);

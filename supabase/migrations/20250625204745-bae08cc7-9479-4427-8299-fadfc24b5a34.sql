
-- Add the missing unique constraint for the anchor_address table
-- This will allow the upsert operation to work correctly
ALTER TABLE anchor_address
ADD CONSTRAINT anchor_address_unique_address
UNIQUE (address_line1, city, state, zip_code);

-- Optional: Add NOT NULL constraints to prevent incomplete address records
ALTER TABLE anchor_address
ALTER COLUMN address_line1 SET NOT NULL,
ALTER COLUMN city SET NOT NULL,
ALTER COLUMN state SET NOT NULL,
ALTER COLUMN zip_code SET NOT NULL;

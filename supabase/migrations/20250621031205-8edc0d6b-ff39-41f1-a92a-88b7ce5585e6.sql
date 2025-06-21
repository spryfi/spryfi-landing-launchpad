
-- Add qualification_source column to anchor_address table if it doesn't exist
ALTER TABLE anchor_address 
ADD COLUMN IF NOT EXISTS qualification_source TEXT;

-- Add raw_bot_data column for storing bot qualification data
ALTER TABLE anchor_address 
ADD COLUMN IF NOT EXISTS raw_bot_data JSONB;

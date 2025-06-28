
-- Add lead_id column to provisioning_sessions table to support pre-checkout router configuration
ALTER TABLE provisioning_sessions ADD COLUMN IF NOT EXISTS lead_id uuid;

-- Add comment to clarify the relationship
COMMENT ON COLUMN provisioning_sessions.lead_id IS 'Links provisioning session to lead before checkout completion';

-- Add new columns to contact_messages for advanced contact form
ALTER TABLE contact_messages 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'general',
ADD COLUMN IF NOT EXISTS service_type text,
ADD COLUMN IF NOT EXISTS attachment_url text;

-- Add comment for documentation
COMMENT ON COLUMN contact_messages.type IS 'Type of message: general, complaint, job_application, investor';
COMMENT ON COLUMN contact_messages.service_type IS 'For investors: station_management, franchise, facility_rental';
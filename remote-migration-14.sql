-- Add showOnMain column to inquiries table
ALTER TABLE inquiries ADD COLUMN showOnMain INTEGER DEFAULT 0;

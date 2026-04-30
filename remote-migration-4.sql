-- Add status column to posts table
ALTER TABLE posts ADD COLUMN status TEXT DEFAULT 'public';

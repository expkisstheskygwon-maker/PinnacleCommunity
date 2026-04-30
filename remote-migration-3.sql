-- Add status, points, attendanceCount columns to users table
ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active';
ALTER TABLE users ADD COLUMN points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN attendanceCount INTEGER DEFAULT 0;

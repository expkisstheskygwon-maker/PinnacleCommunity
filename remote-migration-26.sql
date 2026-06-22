-- Add attendanceStreak column to users table (default 0)
ALTER TABLE users ADD COLUMN attendanceStreak INTEGER DEFAULT 0;

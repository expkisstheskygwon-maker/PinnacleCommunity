-- Add isHidden column to main_menus table
ALTER TABLE main_menus ADD COLUMN isHidden INTEGER DEFAULT 0;

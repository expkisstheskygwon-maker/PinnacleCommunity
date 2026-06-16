-- Add isAdminWrite column to main_menus table
ALTER TABLE main_menus ADD COLUMN isAdminWrite INTEGER DEFAULT 0;

-- Set notices, guide, spotlight as admin-writeable by default
UPDATE main_menus SET isAdminWrite = 1 WHERE menuId IN ('notices', 'guide', 'spotlight');

-- Update analysis label to '분석/결과'
UPDATE main_menus SET label = '분석/결과', labelEn = 'Prediction/Result' WHERE menuId = 'analysis';

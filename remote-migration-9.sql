-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default values for footer
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('footer_description', '피나클 사용자를 위한 정보 허브. 가입부터 배당 분석까지, 신뢰할 수 있는 정보와 실사용자 경험을 한곳에서 제공합니다.');
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('footer_copyright', '© 2026 피나클 커뮤니티. 본 사이트는 피나클(Pinnacle) 공식 사이트가 아닙니다. 독립적인 사용자 커뮤니티입니다.');

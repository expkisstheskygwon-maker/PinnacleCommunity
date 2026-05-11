-- Create site_settings table for dynamic configuration
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial top bar message
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('top_bar_message', '✨ Insight Hub: 피나클 커뮤니티는 24시간 가장 빠르고 정확한 실시간 정보를 제공합니다');
INSERT OR IGNORE INTO site_settings (key, value) VALUES ('top_bar_message_en', '✨ Insight Hub: Pinnacle Community provides the fastest and most accurate real-time information 24/7');

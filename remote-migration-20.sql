-- Create main_menus table for dynamic navigation configuration
CREATE TABLE IF NOT EXISTS main_menus (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  menuId TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  labelEn TEXT NOT NULL,
  icon TEXT NOT NULL,
  href TEXT NOT NULL,
  sortOrder INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial default main site menus in current order
INSERT OR IGNORE INTO main_menus (menuId, label, labelEn, icon, href, sortOrder) VALUES ('home', '홈', 'Home', 'Home', '/', 10);
INSERT OR IGNORE INTO main_menus (menuId, label, labelEn, icon, href, sortOrder) VALUES ('odds', '배당/경기', 'Odds', 'TrendingUp', '/odds', 20);
INSERT OR IGNORE INTO main_menus (menuId, label, labelEn, icon, href, sortOrder) VALUES ('analysis', '분석/칼럼', 'Analysis', 'BarChart3', '/analysis', 30);
INSERT OR IGNORE INTO main_menus (menuId, label, labelEn, icon, href, sortOrder) VALUES ('spotlight', '스포트라이트', 'Spotlight', 'Star', '/spotlight', 40);
INSERT OR IGNORE INTO main_menus (menuId, label, labelEn, icon, href, sortOrder) VALUES ('concepts', '개념 탑재', 'Concepts', 'Lightbulb', '/concepts', 50);
INSERT OR IGNORE INTO main_menus (menuId, label, labelEn, icon, href, sortOrder) VALUES ('community', '커뮤니티', 'Forum', 'Users', '/community', 60);
INSERT OR IGNORE INTO main_menus (menuId, label, labelEn, icon, href, sortOrder) VALUES ('guide', '가이드', 'Guide', 'BookOpen', '/guide', 70);
INSERT OR IGNORE INTO main_menus (menuId, label, labelEn, icon, href, sortOrder) VALUES ('qna', 'Q&A', 'Q&A', 'HelpCircle', '/qna', 75);
INSERT OR IGNORE INTO main_menus (menuId, label, labelEn, icon, href, sortOrder) VALUES ('notices', '공지/이슈', 'Notices', 'Bell', '/notices', 80);
INSERT OR IGNORE INTO main_menus (menuId, label, labelEn, icon, href, sortOrder) VALUES ('mypage', '마이페이지', 'My Page', 'User', '/mypage', 90);

-- Create betting_records table
CREATE TABLE IF NOT EXISTS betting_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  sport TEXT NOT NULL,
  league TEXT,
  match TEXT,
  market TEXT NOT NULL,
  selection TEXT NOT NULL,
  odds REAL NOT NULL,
  stake REAL NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, won, lost, void, half-won, half-lost
  resultAmount REAL DEFAULT 0,
  betDate DATETIME DEFAULT CURRENT_TIMESTAMP,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_betting_records_userId ON betting_records(userId);
CREATE INDEX IF NOT EXISTS idx_betting_records_status ON betting_records(status);

-- Update categories to match the new direction
-- Remove old community categories if they were in the DB (they weren't, but just in case)
DELETE FROM post_categories WHERE type = 'community' AND name IN ('경기 토론', '픽 공유');

-- Insert new community categories
INSERT OR IGNORE INTO post_categories (type, name) VALUES ('community', '자유게시판');
INSERT OR IGNORE INTO post_categories (type, name) VALUES ('community', '베팅 복기');
INSERT OR IGNORE INTO post_categories (type, name) VALUES ('community', '심리/자금관리');
INSERT OR IGNORE INTO post_categories (type, name) VALUES ('community', '전략 실험실');
INSERT OR IGNORE INTO post_categories (type, name) VALUES ('community', '이벤트/랭킹');

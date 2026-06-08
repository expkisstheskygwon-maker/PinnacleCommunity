-- remote-migration-17.sql
-- Virtual Betting and Point Economy Schema Updates

-- 1. Create points_logs table
CREATE TABLE IF NOT EXISTS points_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL, -- 'bet_stake', 'bet_win', 'attendance', 'post_write', 'comment_write', 'shop_buy', 'pick_unlock', 'recharge'
  referenceId INTEGER, -- links to relevant records (e.g. betting_records.id, posts.id)
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- 2. Create user_inventory table
CREATE TABLE IF NOT EXISTS user_inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  itemType TEXT NOT NULL, -- 'odds_booster', 'bet_insurance', 'color_tag'
  quantity INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  UNIQUE(userId, itemType)
);

-- 3. Create post_purchases table
CREATE TABLE IF NOT EXISTS post_purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  postId INTEGER NOT NULL,
  price INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (postId) REFERENCES posts(id),
  UNIQUE(userId, postId)
);

-- 4. Alter betting_records to add isVirtual, appliedItem, and matchId
ALTER TABLE betting_records ADD COLUMN isVirtual INTEGER DEFAULT 0;
ALTER TABLE betting_records ADD COLUMN appliedItem TEXT;
ALTER TABLE betting_records ADD COLUMN matchId TEXT;

-- 5. Alter posts to support locked posts
ALTER TABLE posts ADD COLUMN isLocked INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN pointPrice INTEGER DEFAULT 0;

-- 6. Alter users to support nickname coloring and daily recharge limit
ALTER TABLE users ADD COLUMN nicknameColor TEXT;
ALTER TABLE users ADD COLUMN lastRechargeDate TEXT;

-- Indexing for speed
CREATE INDEX IF NOT EXISTS idx_points_logs_userId ON points_logs(userId);
CREATE INDEX IF NOT EXISTS idx_user_inventory_userId ON user_inventory(userId);
CREATE INDEX IF NOT EXISTS idx_post_purchases_userId ON post_purchases(userId);

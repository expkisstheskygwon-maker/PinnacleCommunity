-- 1. Add new columns to the posts table
ALTER TABLE posts ADD COLUMN sentiment TEXT;
ALTER TABLE posts ADD COLUMN experiment_meta TEXT; -- JSON string storing { hypothesis, target, totalRounds, currentRound, roi }

-- 2. Clear old categories of type 'concepts' and register the new 5
DELETE FROM post_categories WHERE type = 'concepts';
INSERT INTO post_categories (type, name) VALUES ('concepts', 'experiments');
INSERT INTO post_categories (type, name) VALUES ('concepts', 'fails');
INSERT INTO post_categories (type, name) VALUES ('concepts', 'gamification');
INSERT INTO post_categories (type, name) VALUES ('concepts', 'flex');
INSERT INTO post_categories (type, name) VALUES ('concepts', 'sentiment');

-- 3. Create reward log table to enforce exactly-once point rewards
CREATE TABLE IF NOT EXISTS reward_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  postId INTEGER NOT NULL,
  rewardType TEXT NOT NULL, -- e.g. 'fails_comfort'
  amount INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (postId) REFERENCES posts(id),
  UNIQUE(postId, rewardType)
);

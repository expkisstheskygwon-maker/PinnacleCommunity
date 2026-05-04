-- User Interests Table
CREATE TABLE IF NOT EXISTS user_interests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  category TEXT NOT NULL, -- 'sport', 'league', 'team', 'country'
  value TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- User Favorites Table (Matches)
CREATE TABLE IF NOT EXISTS user_favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  matchId TEXT NOT NULL, -- Match ID from API-Sports
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- User Bets Table (Matches)
CREATE TABLE IF NOT EXISTS user_bets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  matchId TEXT NOT NULL, -- Match ID from API-Sports
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_user_interests_userId ON user_interests(userId);
CREATE INDEX IF NOT EXISTS idx_user_favorites_userId ON user_favorites(userId);
CREATE INDEX IF NOT EXISTS idx_user_bets_userId ON user_bets(userId);

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN avatar TEXT;
ALTER TABLE users ADD COLUMN score INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1;

-- Posts Table
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  authorId INTEGER NOT NULL,
  category TEXT NOT NULL,
  tags TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (authorId) REFERENCES users(id)
);

-- Index for posts
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_authorId ON posts(authorId);

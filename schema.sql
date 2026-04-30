-- Pinnacle Community User Table Schema
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  nickname TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  referralCode TEXT,
  avatar TEXT,
  score INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active',
  points INTEGER DEFAULT 0,
  attendanceCount INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_userId ON users(userId);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Posts Table
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  authorId INTEGER NOT NULL,
  category TEXT NOT NULL,
  tags TEXT,
  image TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (authorId) REFERENCES users(id)
);

-- Index for posts
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_authorId ON posts(authorId);

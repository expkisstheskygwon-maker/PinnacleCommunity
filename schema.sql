-- Pinnacle Community User Table Schema
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  nickname TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  referralCode TEXT,
  avatar TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_userId ON users(userId);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

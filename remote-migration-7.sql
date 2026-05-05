-- Notifications table for user alerts (match events, messages, system notices)
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  type TEXT NOT NULL,        -- 'match_start', 'goal', 'half_time', 'match_end', 'message', 'system'
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  readAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId);
CREATE INDEX IF NOT EXISTS idx_notifications_readAt ON notifications(readAt);

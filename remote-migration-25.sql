-- 1. Add betMoney column to users table (default 100,000 BM)
ALTER TABLE users ADD COLUMN betMoney INTEGER DEFAULT 100000;

-- 2. Create bet_money_logs table
CREATE TABLE IF NOT EXISTS bet_money_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL, -- 'recharge', 'bet_stake', 'bet_win', 'bet_refund', 'exchange_in'
  referenceId INTEGER,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- 3. Create index on userId for faster queries
CREATE INDEX IF NOT EXISTS idx_bet_money_logs_userId ON bet_money_logs(userId);

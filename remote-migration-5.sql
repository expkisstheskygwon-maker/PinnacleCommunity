-- Drop existing post_categories table if it exists to ensure clean schema
DROP TABLE IF EXISTS post_categories;

-- Add post_categories table for dynamic category management
CREATE TABLE IF NOT EXISTS post_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL, -- e.g., 'notices', 'guide', etc.
  name TEXT NOT NULL, -- e.g., '점검 공지', '사기주의'
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Initial data for existing categories
INSERT INTO post_categories (type, name) VALUES ('notices', '점검 공지');
INSERT INTO post_categories (type, name) VALUES ('notices', '사기주의');
INSERT INTO post_categories (type, name) VALUES ('notices', '장애/지연');
INSERT INTO post_categories (type, name) VALUES ('notices', '정책 변경');

INSERT INTO post_categories (type, name) VALUES ('guide', '가입 가이드');
INSERT INTO post_categories (type, name) VALUES ('guide', '입출금 가이드');
INSERT INTO post_categories (type, name) VALUES ('guide', '배팅 가이드');
INSERT INTO post_categories (type, name) VALUES ('guide', '기타');

INSERT INTO post_categories (type, name) VALUES ('qna', '가입/인증');
INSERT INTO post_categories (type, name) VALUES ('qna', '결제/입출금');
INSERT INTO post_categories (type, name) VALUES ('qna', '배당/정산');
INSERT INTO post_categories (type, name) VALUES ('qna', '계정/보안');

INSERT INTO post_categories (type, name) VALUES ('analysis', '초보 가이드');
INSERT INTO post_categories (type, name) VALUES ('analysis', '배당 이해');
INSERT INTO post_categories (type, name) VALUES ('analysis', '라인 변동');
INSERT INTO post_categories (type, name) VALUES ('analysis', '전략/리스크');

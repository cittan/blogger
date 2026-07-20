ALTER TABLE posts ADD COLUMN is_pinned INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_posts_pinned ON posts(is_pinned);

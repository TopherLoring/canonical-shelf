ALTER TABLE feedback ADD COLUMN anonymous_key TEXT;
ALTER TABLE feedback ADD COLUMN status TEXT NOT NULL DEFAULT 'new';
ALTER TABLE feedback ADD COLUMN reviewer_response TEXT;
ALTER TABLE feedback ADD COLUMN responded_at TEXT;
ALTER TABLE feedback ADD COLUMN updated_at TEXT;

CREATE INDEX IF NOT EXISTS feedback_anonymous_key_created_at
  ON feedback(anonymous_key, created_at);
CREATE INDEX IF NOT EXISTS feedback_user_created_at
  ON feedback(user_id, created_at);
CREATE INDEX IF NOT EXISTS feedback_status_created_at
  ON feedback(status, created_at);

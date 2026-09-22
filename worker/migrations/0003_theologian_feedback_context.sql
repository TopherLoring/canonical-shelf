ALTER TABLE feedback ADD COLUMN review_reason TEXT;
ALTER TABLE feedback ADD COLUMN context_json TEXT;

CREATE INDEX IF NOT EXISTS feedback_review_reason_created_at
  ON feedback(review_reason, created_at);

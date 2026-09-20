CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  contact TEXT,
  route TEXT NOT NULL,
  client_created_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS feedback_created_at
  ON feedback(created_at);

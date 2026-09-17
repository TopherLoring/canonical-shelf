CREATE TABLE IF NOT EXISTS learner_state (
  user_id TEXT PRIMARY KEY NOT NULL,
  snapshot_json TEXT NOT NULL,
  cursor INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS learner_mutation (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS learner_mutation_user_time
  ON learner_mutation(user_id, occurred_at);

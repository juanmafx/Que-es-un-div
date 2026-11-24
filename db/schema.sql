PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS test_runs (
  run_id TEXT PRIMARY KEY CHECK (length(run_id) BETWEEN 1 AND 64),
  commit_sha TEXT CHECK (commit_sha IS NULL OR length(commit_sha) = 40),
  node_version TEXT NOT NULL CHECK (length(node_version) > 0),
  started_at TEXT NOT NULL CHECK (started_at GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]T*Z'),
  duration_ms REAL NOT NULL CHECK (duration_ms >= 0),
  passed INTEGER NOT NULL CHECK (passed >= 0),
  failed INTEGER NOT NULL CHECK (failed >= 0),
  skipped INTEGER NOT NULL DEFAULT 0 CHECK (skipped >= 0)
) STRICT;

CREATE TABLE IF NOT EXISTS test_case_results (
  run_id TEXT NOT NULL REFERENCES test_runs (run_id) ON DELETE CASCADE,
  suite TEXT NOT NULL CHECK (length(suite) > 0),
  name TEXT NOT NULL CHECK (length(name) > 0),
  status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'skipped')),
  duration_ms REAL NOT NULL CHECK (duration_ms >= 0),
  PRIMARY KEY (run_id, suite, name)
) STRICT, WITHOUT ROWID;

CREATE INDEX IF NOT EXISTS idx_test_case_results_status
  ON test_case_results (status, run_id);

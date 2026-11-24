-- ZZZ 3.4.4 Combat Simulator & Ops D1 Schema (zzcal-sim-ops)

CREATE TABLE IF NOT EXISTS anomaly_reports (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  status TEXT NOT NULL DEFAULT 'open',
  category TEXT NOT NULL DEFAULT 'other',
  message TEXT NOT NULL DEFAULT '',
  step_idx INTEGER,
  engine TEXT NOT NULL DEFAULT 'sun344',
  spec_version TEXT NOT NULL DEFAULT '',
  preset_id TEXT,
  summary_json TEXT,
  snapshot_json TEXT,
  ip_hash TEXT,
  resolution_note TEXT
);

CREATE INDEX IF NOT EXISTS idx_anomaly_reports_status_created
  ON anomaly_reports (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_anomaly_reports_created
  ON anomaly_reports (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_anomaly_reports_ip_created
  ON anomaly_reports (ip_hash, created_at DESC);

CREATE TABLE IF NOT EXISTS spec_releases (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  version TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  files_json TEXT NOT NULL DEFAULT '{}',
  is_active INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_spec_releases_active
  ON spec_releases (is_active, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_spec_releases_created
  ON spec_releases (created_at DESC);

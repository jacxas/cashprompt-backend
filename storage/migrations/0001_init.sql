-- MVP v0: esquema base actualizado (SQLite)
-- Nota: habilitar llaves foráneas por conexión en runtime:
-- PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS models (
  model_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS model_variants (
  variant_id TEXT PRIMARY KEY,
  model_id TEXT NOT NULL,
  quant TEXT,
  format TEXT NOT NULL,
  revision TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  FOREIGN KEY (model_id) REFERENCES models(model_id) ON DELETE CASCADE,
  UNIQUE(model_id, quant, format, revision)
);

CREATE TABLE IF NOT EXISTS projects (
  project_id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
  UNIQUE(project_id, name)
);

CREATE TABLE IF NOT EXISTS jobs (
  job_id TEXT PRIMARY KEY,
  session_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('chat', 't2i', 'i2i', 't2v', 'i2v')),
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'failed', 'canceled')),
  model_id TEXT,
  variant_id TEXT,
  parent_job_id TEXT,
  created_at TEXT NOT NULL,
  started_at TEXT,
  finished_at TEXT,
  error_message TEXT,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE SET NULL,
  FOREIGN KEY (model_id) REFERENCES models(model_id) ON DELETE SET NULL,
  FOREIGN KEY (variant_id) REFERENCES model_variants(variant_id) ON DELETE SET NULL,
  FOREIGN KEY (parent_job_id) REFERENCES jobs(job_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS job_outputs (
  output_id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  output_path TEXT NOT NULL,
  sidecar_path TEXT NOT NULL,
  format TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
  UNIQUE(job_id, output_path)
);

CREATE TABLE IF NOT EXISTS events (
  event_id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error')),
  message TEXT NOT NULL,
  payload_json TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_model_variants_model_id ON model_variants(model_id);
CREATE INDEX IF NOT EXISTS idx_sessions_project_id ON sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_jobs_session_id ON jobs(session_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_model_id ON jobs(model_id);
CREATE INDEX IF NOT EXISTS idx_job_outputs_job_id ON job_outputs(job_id);
CREATE INDEX IF NOT EXISTS idx_events_entity ON events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

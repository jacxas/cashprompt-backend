-- MVP v0: esquema mínimo alineado con documentación

CREATE TABLE IF NOT EXISTS models (
  model_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS model_variants (
  variant_id TEXT PRIMARY KEY,
  model_id TEXT NOT NULL,
  quant TEXT,
  format TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (model_id) REFERENCES models(model_id)
);

CREATE TABLE IF NOT EXISTS projects (
  project_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

CREATE TABLE IF NOT EXISTS jobs (
  job_id TEXT PRIMARY KEY,
  session_id TEXT,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  model_id TEXT,
  variant_id TEXT,
  created_at TEXT NOT NULL,
  started_at TEXT,
  finished_at TEXT,
  FOREIGN KEY (session_id) REFERENCES sessions(session_id),
  FOREIGN KEY (model_id) REFERENCES models(model_id),
  FOREIGN KEY (variant_id) REFERENCES model_variants(variant_id)
);

CREATE TABLE IF NOT EXISTS job_outputs (
  output_id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  output_path TEXT NOT NULL,
  sidecar_path TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (job_id) REFERENCES jobs(job_id)
);

CREATE TABLE IF NOT EXISTS events (
  event_id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL
);

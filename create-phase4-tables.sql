-- Phase 4 Evidence Collection Tables
-- Simplified creation script

-- Evidence Sources
CREATE TABLE IF NOT EXISTS evidence_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_name TEXT UNIQUE NOT NULL,
  source_type TEXT NOT NULL,
  integration_status TEXT DEFAULT 'active',
  api_endpoint TEXT,
  authentication_method TEXT,
  collection_frequency_hours INTEGER DEFAULT 24,
  evidence_types_supported TEXT,
  automation_capability REAL DEFAULT 0.0,
  reliability_score REAL DEFAULT 0.5,
  last_successful_collection DATETIME,
  consecutive_failures INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Evidence Collection Jobs
CREATE TABLE IF NOT EXISTS evidence_collection_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_name TEXT NOT NULL,
  compliance_framework TEXT NOT NULL,
  control_objective TEXT NOT NULL,
  evidence_type TEXT NOT NULL,
  collection_method TEXT NOT NULL,
  automation_level TEXT DEFAULT 'manual',
  target_frequency TEXT NOT NULL,
  evidence_source_id INTEGER,
  collection_script TEXT,
  validation_rules TEXT,
  quality_threshold REAL DEFAULT 0.7,
  assigned_collector TEXT,
  job_status TEXT DEFAULT 'active',
  priority_level INTEGER DEFAULT 3,
  estimated_effort_hours REAL DEFAULT 1.0,
  success_rate REAL DEFAULT 0.0,
  average_collection_time_minutes INTEGER DEFAULT 60,
  last_execution_date DATETIME,
  next_scheduled_date DATETIME,
  created_by TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Evidence Execution History
CREATE TABLE IF NOT EXISTS evidence_execution_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  collection_job_id INTEGER,
  execution_date DATETIME NOT NULL,
  execution_status TEXT NOT NULL,
  execution_method TEXT NOT NULL,
  evidence_count_collected INTEGER DEFAULT 0,
  quality_score REAL DEFAULT 0.0,
  validation_results TEXT,
  execution_duration_minutes INTEGER DEFAULT 0,
  collector_name TEXT,
  automation_percentage REAL DEFAULT 0.0,
  issues_encountered TEXT,
  resolution_actions TEXT,
  artifacts_generated INTEGER DEFAULT 0,
  storage_location TEXT,
  file_size_mb REAL DEFAULT 0.0,
  evidence_hash TEXT,
  compliance_coverage_percentage REAL DEFAULT 0.0,
  review_status TEXT DEFAULT 'pending',
  reviewed_by TEXT,
  reviewed_at DATETIME,
  approved BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Evidence Artifacts
CREATE TABLE IF NOT EXISTS evidence_artifacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  execution_history_id INTEGER,
  artifact_name TEXT NOT NULL,
  artifact_type TEXT NOT NULL,
  file_path TEXT,
  file_size_bytes INTEGER DEFAULT 0,
  mime_type TEXT,
  artifact_hash TEXT,
  collection_timestamp DATETIME NOT NULL,
  evidence_category TEXT NOT NULL,
  compliance_control_mapping TEXT,
  quality_rating REAL DEFAULT 0.0,
  validation_status TEXT DEFAULT 'pending',
  retention_period_days INTEGER DEFAULT 2555,
  access_classification TEXT DEFAULT 'internal',
  encryption_status TEXT DEFAULT 'encrypted',
  backup_status TEXT DEFAULT 'pending',
  audit_trail TEXT,
  metadata_json TEXT,
  created_by TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
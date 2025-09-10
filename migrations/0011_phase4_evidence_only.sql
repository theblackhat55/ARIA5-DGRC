-- ARIA5.1 Phase 4: Evidence Auto-Collection (Conflict-Free Migration)
-- Migration: 0011_phase4_evidence_only.sql
-- Target: 60%+ compliance evidence automation

-- ================================================================
-- EVIDENCE COLLECTION AUTOMATION TABLES (PHASE 4 ONLY)
-- ================================================================

-- Evidence Sources Registry
CREATE TABLE IF NOT EXISTS evidence_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_name TEXT UNIQUE NOT NULL,
  source_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  automation_level TEXT DEFAULT 'manual',
  collection_frequency TEXT DEFAULT 'on_demand',
  api_endpoint TEXT,
  auth_method TEXT,
  last_collection_at DATETIME,
  collection_status TEXT DEFAULT 'idle',
  success_rate REAL DEFAULT 0.0,
  avg_collection_time INTEGER DEFAULT 0,
  total_evidence_collected INTEGER DEFAULT 0,
  automated_evidence_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  configuration_json TEXT,
  error_message TEXT
);

-- Evidence Collection Jobs
CREATE TABLE IF NOT EXISTS evidence_collection_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_name TEXT NOT NULL,
  compliance_framework_id INTEGER,
  control_reference TEXT,
  evidence_type TEXT NOT NULL,
  collection_method TEXT NOT NULL,
  automation_status TEXT DEFAULT 'manual',
  target_automation_date DATETIME,
  automation_confidence REAL DEFAULT 0.0,
  collection_schedule TEXT,
  retention_days INTEGER DEFAULT 365,
  is_critical BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 3,
  created_by TEXT NOT NULL,
  assigned_to TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_execution_at DATETIME,
  next_execution_at DATETIME,
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0
);

-- Evidence Collection Execution History
CREATE TABLE IF NOT EXISTS evidence_execution_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER REFERENCES evidence_collection_jobs(id),
  source_id INTEGER REFERENCES evidence_sources(id),
  execution_id TEXT NOT NULL,
  execution_type TEXT NOT NULL,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  execution_status TEXT DEFAULT 'running',
  records_processed INTEGER DEFAULT 0,
  records_successful INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  evidence_artifacts_created INTEGER DEFAULT 0,
  execution_time_seconds INTEGER,
  automation_level TEXT NOT NULL,
  confidence_score REAL DEFAULT 0.0,
  data_quality_score REAL DEFAULT 0.0,
  triggered_by TEXT,
  error_details TEXT,
  performance_metrics TEXT,
  artifacts_stored_path TEXT,
  checksum_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Evidence Artifacts Storage
CREATE TABLE IF NOT EXISTS evidence_artifacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  execution_id INTEGER REFERENCES evidence_execution_history(id),
  job_id INTEGER REFERENCES evidence_collection_jobs(id),
  artifact_name TEXT NOT NULL,
  artifact_type TEXT NOT NULL,
  file_format TEXT NOT NULL,
  file_size_bytes INTEGER,
  storage_location TEXT NOT NULL,
  public_url TEXT,
  access_level TEXT DEFAULT 'restricted',
  collection_method TEXT NOT NULL,
  source_system TEXT NOT NULL,
  source_timestamp DATETIME,
  compliance_mapping TEXT,
  evidence_quality_score REAL DEFAULT 0.0,
  is_automated BOOLEAN DEFAULT FALSE,
  validation_status TEXT DEFAULT 'pending',
  validation_details TEXT,
  retention_until DATETIME,
  checksum_md5 TEXT,
  checksum_sha256 TEXT,
  metadata_json TEXT,
  tags TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  collected_by TEXT,
  reviewed_by TEXT,
  reviewed_at DATETIME
);

-- Evidence Validation Rules
CREATE TABLE IF NOT EXISTS evidence_validation_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rule_name TEXT UNIQUE NOT NULL,
  evidence_type TEXT NOT NULL,
  validation_method TEXT NOT NULL,
  rule_expression TEXT NOT NULL,
  severity_level TEXT DEFAULT 'medium',
  is_active BOOLEAN DEFAULT TRUE,
  auto_fix_enabled BOOLEAN DEFAULT FALSE,
  auto_fix_script TEXT,
  failure_action TEXT DEFAULT 'flag',
  description TEXT,
  compliance_references TEXT,
  created_by TEXT NOT NULL,
  success_rate REAL DEFAULT 0.0,
  total_validations INTEGER DEFAULT 0,
  successful_validations INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Evidence Validation Results
CREATE TABLE IF NOT EXISTS evidence_validation_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artifact_id INTEGER REFERENCES evidence_artifacts(id),
  rule_id INTEGER REFERENCES evidence_validation_rules(id),
  validation_status TEXT NOT NULL,
  validation_score REAL DEFAULT 0.0,
  validation_message TEXT,
  validation_details TEXT,
  auto_fixed BOOLEAN DEFAULT FALSE,
  fix_applied TEXT,
  reviewed_by TEXT,
  review_status TEXT DEFAULT 'pending',
  review_comments TEXT,
  validated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME
);

-- Compliance Control Evidence Requirements
CREATE TABLE IF NOT EXISTS compliance_control_evidence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  control_id TEXT NOT NULL,
  framework_name TEXT NOT NULL,
  evidence_requirement_name TEXT NOT NULL,
  evidence_type TEXT NOT NULL,
  evidence_frequency TEXT NOT NULL,
  automation_feasibility TEXT DEFAULT 'unknown',
  automation_priority INTEGER DEFAULT 3,
  current_collection_method TEXT DEFAULT 'manual',
  target_automation_level TEXT DEFAULT 'semi_automated',
  estimated_automation_effort TEXT,
  automation_roi_score REAL DEFAULT 0.0,
  compliance_criticality TEXT DEFAULT 'medium',
  auditor_acceptance_level TEXT DEFAULT 'manual_review',
  evidence_description TEXT,
  collection_guidance TEXT,
  validation_criteria TEXT,
  sample_artifacts TEXT,
  responsible_team TEXT,
  backup_collection_method TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Evidence Automation Metrics
CREATE TABLE IF NOT EXISTS evidence_automation_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_date DATE NOT NULL,
  framework_name TEXT NOT NULL,
  total_evidence_requirements INTEGER NOT NULL,
  automated_evidence_count INTEGER DEFAULT 0,
  semi_automated_evidence_count INTEGER DEFAULT 0,
  manual_evidence_count INTEGER DEFAULT 0,
  automation_percentage REAL GENERATED ALWAYS AS (
    CASE 
      WHEN total_evidence_requirements > 0 
      THEN (automated_evidence_count * 1.0 / total_evidence_requirements) * 100
      ELSE 0 
    END
  ) STORED,
  evidence_quality_average REAL DEFAULT 0.0,
  collection_time_average_minutes INTEGER DEFAULT 0,
  validation_success_rate REAL DEFAULT 0.0,
  auditor_acceptance_rate REAL DEFAULT 0.0,
  cost_savings_estimate REAL DEFAULT 0.0,
  target_automation_percentage REAL DEFAULT 60.0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Evidence Audit Trail
CREATE TABLE IF NOT EXISTS evidence_audit_trail (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  event_description TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  performed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  before_state TEXT,
  after_state TEXT,
  risk_level TEXT DEFAULT 'low',
  compliance_impact TEXT,
  additional_metadata TEXT,
  correlation_id TEXT
);

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_evidence_sources_automation ON evidence_sources(automation_level);
CREATE INDEX IF NOT EXISTS idx_evidence_jobs_framework ON evidence_collection_jobs(compliance_framework_id);
CREATE INDEX IF NOT EXISTS idx_evidence_execution_status ON evidence_execution_history(execution_status);
CREATE INDEX IF NOT EXISTS idx_evidence_artifacts_type ON evidence_artifacts(artifact_type);
CREATE INDEX IF NOT EXISTS idx_compliance_control_framework ON compliance_control_evidence(framework_name);

-- ================================================================
-- INITIAL DATA SEEDING
-- ================================================================

-- Insert Default Evidence Sources
INSERT OR IGNORE INTO evidence_sources (source_name, source_type, automation_level, collection_frequency, configuration_json) VALUES
('microsoft_defender', 'technical', 'fully_automated', 'real_time', '{"endpoint": "graph.microsoft.com", "scope": "SecurityEvents.Read.All"}'),
('servicenow_itsm', 'procedural', 'semi_automated', 'daily', '{"endpoint": "instance.service-now.com", "table": "incident"}'),
('azure_audit_logs', 'administrative', 'fully_automated', 'hourly', '{"endpoint": "management.azure.com", "resource": "auditLogs"}'),
('github_security', 'technical', 'fully_automated', 'real_time', '{"endpoint": "api.github.com", "events": ["security_advisory", "code_scanning"]}'),
('manual_uploads', 'administrative', 'manual', 'on_demand', '{"supported_formats": ["pdf", "docx", "xlsx", "png", "jpg"]}');

-- Insert Default Compliance Control Evidence Requirements
INSERT OR IGNORE INTO compliance_control_evidence (control_id, framework_name, evidence_requirement_name, evidence_type, evidence_frequency, automation_feasibility, automation_priority) VALUES
('NIST-800-53-AC-1', 'NIST-800-53', 'Access Control Policy Document', 'policy', 'annual', 'low', 3),
('NIST-800-53-AC-2', 'NIST-800-53', 'Account Management Procedures', 'procedure', 'continuous', 'high', 1),
('SOC2-CC6.1', 'SOC2', 'Logical Access Controls', 'log', 'continuous', 'high', 1),
('SOC2-CC7.1', 'SOC2', 'System Monitoring Controls', 'log', 'continuous', 'high', 1),
('ISO-27001-A.9.1.1', 'ISO-27001', 'Access Control Policy', 'policy', 'annual', 'low', 3),
('PCI-DSS-1.1', 'PCI-DSS', 'Firewall Configuration Standards', 'configuration', 'quarterly', 'high', 1);

-- Insert Default Evidence Validation Rules
INSERT OR IGNORE INTO evidence_validation_rules (rule_name, evidence_type, validation_method, rule_expression, severity_level, description, created_by) VALUES
('JSON_Format_Validation', 'configuration', 'format_check', '{"type": "json_schema_validation"}', 'medium', 'Validates that configuration evidence is in valid JSON format', 'system'),
('Log_Timestamp_Validation', 'log', 'content_validation', '{"regex": "\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}"}', 'high', 'Ensures log entries have valid timestamps', 'system'),
('Document_Signature_Validation', 'document', 'content_validation', '{"check_digital_signature": true}', 'high', 'Validates digital signatures on policy documents', 'system');

-- ================================================================
-- SYSTEM INTEGRATION SETUP
-- ================================================================

-- Create system components registry if not exists
CREATE TABLE IF NOT EXISTS system_components (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  component_name TEXT UNIQUE NOT NULL,
  component_type TEXT NOT NULL,
  status TEXT DEFAULT 'inactive',
  version TEXT DEFAULT '1.0.0',
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  configuration TEXT,
  health_status TEXT DEFAULT 'unknown'
);

-- Register Phase 4 component
INSERT OR REPLACE INTO system_components (
  component_name, component_type, status, version, configuration
) VALUES (
  'phase4_evidence_automation', 'evidence_engine', 'active', '1.0.0',
  '{"automation_target": 60, "collection_frequency": 15, "enable_real_time": true}'
);

-- ================================================================
-- MIGRATION COMPLETION
-- ================================================================

-- Record migration completion
INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES ('0011_phase4_evidence_only', CURRENT_TIMESTAMP);
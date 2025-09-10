-- ARIA5.1 Phase 4: Advanced Automation - Evidence Auto-Collection
-- Migration: 0010_phase4_evidence_automation.sql
-- Target: 60%+ compliance evidence automation

-- ================================================================
-- EVIDENCE COLLECTION AUTOMATION TABLES
-- ================================================================

-- Evidence Sources Registry
CREATE TABLE IF NOT EXISTS evidence_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_name TEXT UNIQUE NOT NULL, -- 'microsoft_defender', 'servicenow', 'azure_audit', 'github_logs'
  source_type TEXT NOT NULL, -- 'technical', 'procedural', 'administrative', 'physical'
  is_active BOOLEAN DEFAULT TRUE,
  automation_level TEXT DEFAULT 'manual', -- 'manual', 'semi_automated', 'fully_automated'
  collection_frequency TEXT DEFAULT 'on_demand', -- 'real_time', 'hourly', 'daily', 'weekly', 'on_demand'
  api_endpoint TEXT,
  auth_method TEXT, -- 'oauth', 'api_key', 'certificate', 'service_principal'
  last_collection_at DATETIME,
  collection_status TEXT DEFAULT 'idle', -- 'idle', 'collecting', 'success', 'error'
  success_rate REAL DEFAULT 0.0, -- Percentage of successful collections (0.0-1.0)
  avg_collection_time INTEGER DEFAULT 0, -- Average collection time in seconds
  total_evidence_collected INTEGER DEFAULT 0,
  automated_evidence_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  configuration_json TEXT, -- JSON configuration for source-specific settings
  error_message TEXT
);

-- Evidence Collection Jobs
CREATE TABLE IF NOT EXISTS evidence_collection_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_name TEXT NOT NULL,
  compliance_framework_id INTEGER REFERENCES compliance_frameworks(id),
  control_reference TEXT, -- e.g., 'NIST-800-53-AC-1', 'ISO-27001-A.9.1.1'
  evidence_type TEXT NOT NULL, -- 'configuration', 'log', 'screenshot', 'document', 'report'
  collection_method TEXT NOT NULL, -- 'api_pull', 'webhook', 'scheduled_export', 'real_time_stream'
  automation_status TEXT DEFAULT 'manual', -- 'manual', 'semi_automated', 'fully_automated'
  target_automation_date DATETIME,
  automation_confidence REAL DEFAULT 0.0, -- Confidence in automation accuracy (0.0-1.0)
  collection_schedule TEXT, -- Cron expression for scheduled collections
  retention_days INTEGER DEFAULT 365,
  is_critical BOOLEAN DEFAULT FALSE,
  priority INTEGER DEFAULT 3, -- 1=Critical, 2=High, 3=Medium, 4=Low, 5=Info
  created_by TEXT NOT NULL,
  assigned_to TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'completed', 'failed', 'archived'
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
  execution_id TEXT NOT NULL, -- Unique identifier for this execution
  execution_type TEXT NOT NULL, -- 'scheduled', 'manual', 'triggered', 'real_time'
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  execution_status TEXT DEFAULT 'running', -- 'running', 'completed', 'failed', 'timeout', 'cancelled'
  records_processed INTEGER DEFAULT 0,
  records_successful INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  evidence_artifacts_created INTEGER DEFAULT 0,
  execution_time_seconds INTEGER,
  automation_level TEXT NOT NULL, -- 'manual', 'semi_automated', 'fully_automated'
  confidence_score REAL DEFAULT 0.0, -- Quality confidence of collected evidence
  data_quality_score REAL DEFAULT 0.0, -- Data completeness and accuracy score
  triggered_by TEXT, -- 'system', 'user', 'integration', 'schedule'
  error_details TEXT,
  performance_metrics TEXT, -- JSON metrics for execution performance
  artifacts_stored_path TEXT, -- Where evidence artifacts are stored
  checksum_hash TEXT, -- Evidence integrity verification
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Evidence Artifacts Storage
CREATE TABLE IF NOT EXISTS evidence_artifacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  execution_id INTEGER REFERENCES evidence_execution_history(id),
  job_id INTEGER REFERENCES evidence_collection_jobs(id),
  artifact_name TEXT NOT NULL,
  artifact_type TEXT NOT NULL, -- 'log_file', 'config_export', 'screenshot', 'report', 'certificate'
  file_format TEXT NOT NULL, -- 'json', 'xml', 'csv', 'pdf', 'png', 'txt', 'zip'
  file_size_bytes INTEGER,
  storage_location TEXT NOT NULL, -- R2 bucket path or local storage path
  public_url TEXT, -- If artifact can be accessed via public URL
  access_level TEXT DEFAULT 'restricted', -- 'public', 'internal', 'restricted', 'confidential'
  collection_method TEXT NOT NULL, -- 'api_export', 'screen_capture', 'log_extraction', 'manual_upload'
  source_system TEXT NOT NULL, -- Original system where evidence was collected
  source_timestamp DATETIME, -- When the evidence was originally created in source system
  compliance_mapping TEXT, -- JSON array of compliance controls this evidence supports
  evidence_quality_score REAL DEFAULT 0.0, -- Automated quality assessment
  is_automated BOOLEAN DEFAULT FALSE,
  validation_status TEXT DEFAULT 'pending', -- 'pending', 'valid', 'invalid', 'manual_review'
  validation_details TEXT, -- Details about validation checks performed
  retention_until DATETIME, -- When this evidence expires and can be deleted
  checksum_md5 TEXT, -- File integrity verification
  checksum_sha256 TEXT, -- Enhanced file integrity verification
  metadata_json TEXT, -- Additional metadata about the evidence
  tags TEXT, -- Comma-separated tags for categorization
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
  evidence_type TEXT NOT NULL, -- Type of evidence this rule applies to
  validation_method TEXT NOT NULL, -- 'format_check', 'content_validation', 'cross_reference', 'ai_analysis'
  rule_expression TEXT NOT NULL, -- Validation logic (JSON, regex, or script)
  severity_level TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  is_active BOOLEAN DEFAULT TRUE,
  auto_fix_enabled BOOLEAN DEFAULT FALSE,
  auto_fix_script TEXT, -- Automated correction script if applicable
  failure_action TEXT DEFAULT 'flag', -- 'flag', 'reject', 'quarantine', 'auto_fix'
  description TEXT,
  compliance_references TEXT, -- Compliance controls requiring this validation
  created_by TEXT NOT NULL,
  success_rate REAL DEFAULT 0.0, -- Historical success rate of this rule
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
  validation_status TEXT NOT NULL, -- 'pass', 'fail', 'warning', 'skipped'
  validation_score REAL DEFAULT 0.0, -- Numeric score if applicable (0.0-1.0)
  validation_message TEXT,
  validation_details TEXT, -- Detailed results or error information
  auto_fixed BOOLEAN DEFAULT FALSE,
  fix_applied TEXT, -- Description of automated fix if applied
  reviewed_by TEXT,
  review_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  review_comments TEXT,
  validated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME
);

-- ================================================================
-- COMPLIANCE EVIDENCE MAPPING
-- ================================================================

-- Enhanced Compliance Control Evidence Requirements
CREATE TABLE IF NOT EXISTS compliance_control_evidence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  control_id TEXT NOT NULL, -- e.g., 'NIST-800-53-AC-1', 'SOC2-CC6.1'
  framework_name TEXT NOT NULL, -- 'NIST-800-53', 'SOC2', 'ISO-27001', 'PCI-DSS'
  evidence_requirement_name TEXT NOT NULL,
  evidence_type TEXT NOT NULL, -- 'policy', 'procedure', 'configuration', 'log', 'test_result'
  evidence_frequency TEXT NOT NULL, -- 'once', 'annual', 'semi_annual', 'quarterly', 'monthly', 'continuous'
  automation_feasibility TEXT DEFAULT 'unknown', -- 'high', 'medium', 'low', 'manual_only'
  automation_priority INTEGER DEFAULT 3, -- 1=Must automate, 2=Should automate, 3=Could automate
  current_collection_method TEXT DEFAULT 'manual', -- 'manual', 'semi_automated', 'fully_automated'
  target_automation_level TEXT DEFAULT 'semi_automated',
  estimated_automation_effort TEXT, -- 'low', 'medium', 'high', 'very_high'
  automation_roi_score REAL DEFAULT 0.0, -- Return on investment for automation (0.0-1.0)
  compliance_criticality TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  auditor_acceptance_level TEXT DEFAULT 'manual_review', -- 'automated_accepted', 'manual_review', 'manual_required'
  evidence_description TEXT,
  collection_guidance TEXT, -- Instructions for evidence collection
  validation_criteria TEXT, -- What makes this evidence valid/complete
  sample_artifacts TEXT, -- Examples of good evidence artifacts
  responsible_team TEXT, -- Team responsible for providing this evidence
  backup_collection_method TEXT, -- Alternative collection if automation fails
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Evidence Collection Automation Metrics
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
  semi_automation_percentage REAL GENERATED ALWAYS AS (
    CASE 
      WHEN total_evidence_requirements > 0 
      THEN ((automated_evidence_count + semi_automated_evidence_count) * 1.0 / total_evidence_requirements) * 100
      ELSE 0 
    END
  ) STORED,
  evidence_quality_average REAL DEFAULT 0.0,
  collection_time_average_minutes INTEGER DEFAULT 0,
  validation_success_rate REAL DEFAULT 0.0,
  auditor_acceptance_rate REAL DEFAULT 0.0,
  cost_savings_estimate REAL DEFAULT 0.0, -- Estimated cost savings from automation
  target_automation_percentage REAL DEFAULT 60.0, -- Target: 60%+ automation
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- INTEGRATION CONNECTORS FOR EVIDENCE SOURCES
-- ================================================================

-- External System Connectors
CREATE TABLE IF NOT EXISTS evidence_source_connectors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  connector_name TEXT UNIQUE NOT NULL,
  connector_type TEXT NOT NULL, -- 'defender_api', 'servicenow_api', 'azure_logs', 'github_api'
  system_name TEXT NOT NULL, -- Human-readable system name
  base_url TEXT NOT NULL,
  api_version TEXT,
  authentication_type TEXT NOT NULL, -- 'oauth2', 'api_key', 'certificate', 'service_principal'
  credential_reference TEXT, -- Reference to stored credentials (not actual credentials)
  connection_status TEXT DEFAULT 'disconnected', -- 'connected', 'disconnected', 'error', 'testing'
  last_health_check DATETIME,
  health_check_interval_minutes INTEGER DEFAULT 15,
  rate_limit_requests_per_minute INTEGER DEFAULT 60,
  rate_limit_remaining INTEGER DEFAULT 60,
  rate_limit_reset_time DATETIME,
  supported_evidence_types TEXT, -- JSON array of evidence types this connector can collect
  connector_capabilities TEXT, -- JSON object describing connector features
  configuration_schema TEXT, -- JSON schema for connector configuration
  configuration_data TEXT, -- Actual configuration (encrypted if sensitive)
  is_production_ready BOOLEAN DEFAULT FALSE,
  maintenance_window TEXT, -- When this connector should not be used
  performance_metrics TEXT, -- JSON metrics about connector performance
  error_threshold INTEGER DEFAULT 5, -- Number of consecutive errors before marking as unhealthy
  current_error_count INTEGER DEFAULT 0,
  last_error_time DATETIME,
  last_error_message TEXT,
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Evidence Collection Templates
CREATE TABLE IF NOT EXISTS evidence_collection_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_name TEXT UNIQUE NOT NULL,
  template_description TEXT,
  compliance_framework TEXT NOT NULL, -- Which framework this template supports
  evidence_type TEXT NOT NULL,
  connector_id INTEGER REFERENCES evidence_source_connectors(id),
  collection_frequency TEXT NOT NULL,
  collection_query TEXT, -- API query or filter expression
  data_transformation_script TEXT, -- How to transform raw data into evidence
  validation_rules TEXT, -- JSON array of validation rule IDs to apply
  retention_policy TEXT, -- How long to retain collected evidence
  notification_settings TEXT, -- JSON configuration for notifications
  is_template_active BOOLEAN DEFAULT TRUE,
  automation_confidence REAL DEFAULT 0.0, -- Confidence in this template's automation
  success_rate REAL DEFAULT 0.0, -- Historical success rate
  usage_count INTEGER DEFAULT 0, -- How many jobs use this template
  last_used_at DATETIME,
  created_by TEXT NOT NULL,
  template_version TEXT DEFAULT '1.0',
  template_tags TEXT, -- Comma-separated tags for categorization
  estimated_execution_time_minutes INTEGER DEFAULT 5,
  resource_requirements TEXT, -- JSON describing compute/memory needs
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- AUDIT TRAIL AND COMPLIANCE REPORTING
-- ================================================================

-- Evidence Audit Trail
CREATE TABLE IF NOT EXISTS evidence_audit_trail (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL, -- 'collection_started', 'collection_completed', 'validation_performed', 'artifact_accessed'
  entity_type TEXT NOT NULL, -- 'job', 'artifact', 'source', 'template'
  entity_id INTEGER NOT NULL, -- ID of the affected entity
  event_description TEXT NOT NULL,
  performed_by TEXT NOT NULL, -- User or system component that performed the action
  performed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  before_state TEXT, -- JSON snapshot of state before change
  after_state TEXT, -- JSON snapshot of state after change
  risk_level TEXT DEFAULT 'low', -- 'low', 'medium', 'high' based on action sensitivity
  compliance_impact TEXT, -- How this change affects compliance posture
  additional_metadata TEXT, -- JSON for any additional context
  correlation_id TEXT -- For tracking related events across systems
);

-- Compliance Reporting Views and Summaries
CREATE TABLE IF NOT EXISTS compliance_evidence_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_date DATE NOT NULL,
  framework_name TEXT NOT NULL,
  control_family TEXT, -- e.g., 'Access Control', 'System and Communications Protection'
  total_controls INTEGER NOT NULL,
  controls_with_evidence INTEGER DEFAULT 0,
  evidence_coverage_percentage REAL GENERATED ALWAYS AS (
    CASE 
      WHEN total_controls > 0 
      THEN (controls_with_evidence * 1.0 / total_controls) * 100
      ELSE 0 
    END
  ) STORED,
  automated_evidence_percentage REAL DEFAULT 0.0,
  evidence_quality_average REAL DEFAULT 0.0,
  last_collection_date DATETIME,
  next_collection_due DATETIME,
  gaps_identified INTEGER DEFAULT 0,
  remediation_items INTEGER DEFAULT 0,
  audit_readiness_score REAL DEFAULT 0.0, -- Overall readiness for audit (0.0-1.0)
  notes TEXT,
  generated_by TEXT DEFAULT 'system',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ================================================================

-- Evidence Sources Indexes
CREATE INDEX IF NOT EXISTS idx_evidence_sources_type ON evidence_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_evidence_sources_automation ON evidence_sources(automation_level);
CREATE INDEX IF NOT EXISTS idx_evidence_sources_status ON evidence_sources(collection_status);

-- Evidence Collection Jobs Indexes
CREATE INDEX IF NOT EXISTS idx_evidence_jobs_framework ON evidence_collection_jobs(compliance_framework_id);
CREATE INDEX IF NOT EXISTS idx_evidence_jobs_status ON evidence_collection_jobs(status);
CREATE INDEX IF NOT EXISTS idx_evidence_jobs_automation ON evidence_collection_jobs(automation_status);
CREATE INDEX IF NOT EXISTS idx_evidence_jobs_next_execution ON evidence_collection_jobs(next_execution_at);
CREATE INDEX IF NOT EXISTS idx_evidence_jobs_priority ON evidence_collection_jobs(priority);

-- Evidence Execution History Indexes
CREATE INDEX IF NOT EXISTS idx_evidence_execution_job ON evidence_execution_history(job_id);
CREATE INDEX IF NOT EXISTS idx_evidence_execution_status ON evidence_execution_history(execution_status);
CREATE INDEX IF NOT EXISTS idx_evidence_execution_date ON evidence_execution_history(started_at);
CREATE INDEX IF NOT EXISTS idx_evidence_execution_automation ON evidence_execution_history(automation_level);

-- Evidence Artifacts Indexes
CREATE INDEX IF NOT EXISTS idx_evidence_artifacts_job ON evidence_artifacts(job_id);
CREATE INDEX IF NOT EXISTS idx_evidence_artifacts_type ON evidence_artifacts(artifact_type);
CREATE INDEX IF NOT EXISTS idx_evidence_artifacts_validation ON evidence_artifacts(validation_status);
CREATE INDEX IF NOT EXISTS idx_evidence_artifacts_automated ON evidence_artifacts(is_automated);
CREATE INDEX IF NOT EXISTS idx_evidence_artifacts_retention ON evidence_artifacts(retention_until);

-- Compliance Control Evidence Indexes
CREATE INDEX IF NOT EXISTS idx_compliance_control_framework ON compliance_control_evidence(framework_name);
CREATE INDEX IF NOT EXISTS idx_compliance_control_automation ON compliance_control_evidence(automation_feasibility);
CREATE INDEX IF NOT EXISTS idx_compliance_control_priority ON compliance_control_evidence(automation_priority);

-- Audit Trail Indexes
CREATE INDEX IF NOT EXISTS idx_evidence_audit_entity ON evidence_audit_trail(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_evidence_audit_performed ON evidence_audit_trail(performed_at);
CREATE INDEX IF NOT EXISTS idx_evidence_audit_user ON evidence_audit_trail(performed_by);

-- ================================================================
-- INITIAL DATA SEEDING
-- ================================================================

-- Insert Default Evidence Sources
INSERT OR IGNORE INTO evidence_sources (source_name, source_type, automation_level, collection_frequency, configuration_json) VALUES
('microsoft_defender', 'technical', 'fully_automated', 'real_time', '{"endpoint": "graph.microsoft.com", "scope": "SecurityEvents.Read.All"}'),
('servicenow_itsm', 'procedural', 'semi_automated', 'daily', '{"endpoint": "instance.service-now.com", "table": "incident"}'),
('azure_audit_logs', 'administrative', 'fully_automated', 'hourly', '{"endpoint": "management.azure.com", "resource": "auditLogs"}'),
('github_security', 'technical', 'fully_automated', 'real_time', '{"endpoint": "api.github.com", "events": ["security_advisory", "code_scanning"]}'),
('okta_access_logs', 'administrative', 'semi_automated', 'daily', '{"endpoint": "okta.com/api/v1", "events": ["authentication", "authorization"]}'),
('aws_cloudtrail', 'technical', 'fully_automated', 'real_time', '{"service": "cloudtrail", "region": "us-east-1"}'),
('manual_uploads', 'administrative', 'manual', 'on_demand', '{"supported_formats": ["pdf", "docx", "xlsx", "png", "jpg"]}');

-- Insert Default Evidence Collection Templates
INSERT OR IGNORE INTO evidence_collection_templates (template_name, template_description, compliance_framework, evidence_type, collection_frequency, is_template_active) VALUES
('NIST_AC1_Policy_Documents', 'Access Control Policy and Procedures Documentation', 'NIST-800-53', 'document', 'annual', TRUE),
('SOC2_CC61_Security_Monitoring', 'Continuous Security Monitoring Evidence', 'SOC2', 'log', 'daily', TRUE),
('ISO27001_A91_Access_Reviews', 'User Access Review Documentation', 'ISO-27001', 'report', 'quarterly', TRUE),
('PCI_DSS_Firewall_Config', 'Firewall Configuration Evidence', 'PCI-DSS', 'configuration', 'monthly', TRUE),
('GDPR_Data_Processing_Records', 'Data Processing Activity Records', 'GDPR', 'document', 'continuous', TRUE);

-- Insert Default Compliance Control Evidence Requirements
INSERT OR IGNORE INTO compliance_control_evidence (control_id, framework_name, evidence_requirement_name, evidence_type, evidence_frequency, automation_feasibility, automation_priority) VALUES
('NIST-800-53-AC-1', 'NIST-800-53', 'Access Control Policy Document', 'policy', 'annual', 'low', 3),
('NIST-800-53-AC-2', 'NIST-800-53', 'Account Management Procedures', 'procedure', 'continuous', 'high', 1),
('NIST-800-53-AU-2', 'NIST-800-53', 'Audit Event Configuration', 'configuration', 'monthly', 'high', 1),
('SOC2-CC6.1', 'SOC2', 'Logical Access Controls', 'log', 'continuous', 'high', 1),
('SOC2-CC7.1', 'SOC2', 'System Monitoring Controls', 'log', 'continuous', 'high', 1),
('ISO-27001-A.9.1.1', 'ISO-27001', 'Access Control Policy', 'policy', 'annual', 'low', 3),
('ISO-27001-A.9.2.1', 'ISO-27001', 'User Registration Procedures', 'procedure', 'continuous', 'medium', 2),
('PCI-DSS-1.1', 'PCI-DSS', 'Firewall Configuration Standards', 'configuration', 'quarterly', 'high', 1),
('PCI-DSS-2.1', 'PCI-DSS', 'Vendor Default Password Changes', 'configuration', 'continuous', 'high', 1);

-- Insert Default Evidence Validation Rules
INSERT OR IGNORE INTO evidence_validation_rules (rule_name, evidence_type, validation_method, rule_expression, severity_level, description, created_by) VALUES
('JSON_Format_Validation', 'configuration', 'format_check', '{"type": "json_schema_validation"}', 'medium', 'Validates that configuration evidence is in valid JSON format', 'system'),
('Log_Timestamp_Validation', 'log', 'content_validation', '{"regex": "\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}"}', 'high', 'Ensures log entries have valid timestamps', 'system'),
('Document_Signature_Validation', 'document', 'content_validation', '{"check_digital_signature": true}', 'high', 'Validates digital signatures on policy documents', 'system'),
('File_Size_Validation', 'screenshot', 'format_check', '{"max_size_mb": 10, "min_size_kb": 1}', 'low', 'Validates screenshot file sizes are within acceptable range', 'system'),
('Certificate_Expiry_Validation', 'certificate', 'content_validation', '{"check_expiry_date": true, "warn_days_before": 30}', 'critical', 'Validates SSL/TLS certificate expiry dates', 'system');

-- ================================================================
-- VIEWS FOR REPORTING AND ANALYTICS
-- ================================================================

-- Evidence Automation Coverage View
CREATE VIEW IF NOT EXISTS v_evidence_automation_coverage AS
SELECT 
  ce.framework_name,
  COUNT(*) as total_requirements,
  SUM(CASE WHEN ce.current_collection_method = 'fully_automated' THEN 1 ELSE 0 END) as automated_count,
  SUM(CASE WHEN ce.current_collection_method = 'semi_automated' THEN 1 ELSE 0 END) as semi_automated_count,
  SUM(CASE WHEN ce.current_collection_method = 'manual' THEN 1 ELSE 0 END) as manual_count,
  ROUND((SUM(CASE WHEN ce.current_collection_method = 'fully_automated' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) as automation_percentage,
  ROUND(((SUM(CASE WHEN ce.current_collection_method = 'fully_automated' THEN 1 ELSE 0 END) + 
         SUM(CASE WHEN ce.current_collection_method = 'semi_automated' THEN 1 ELSE 0 END)) * 100.0 / COUNT(*)), 2) as total_automation_percentage
FROM compliance_control_evidence ce
GROUP BY ce.framework_name;

-- Evidence Collection Performance View
CREATE VIEW IF NOT EXISTS v_evidence_collection_performance AS
SELECT 
  j.compliance_framework_id,
  j.automation_status,
  COUNT(*) as job_count,
  AVG(h.execution_time_seconds) as avg_execution_time,
  AVG(h.confidence_score) as avg_confidence_score,
  AVG(h.data_quality_score) as avg_quality_score,
  SUM(h.records_successful) as total_successful_records,
  SUM(h.records_failed) as total_failed_records,
  ROUND((SUM(h.records_successful) * 100.0 / NULLIF(SUM(h.records_successful) + SUM(h.records_failed), 0)), 2) as success_rate_percentage
FROM evidence_collection_jobs j
LEFT JOIN evidence_execution_history h ON j.id = h.job_id
WHERE j.status = 'active'
GROUP BY j.compliance_framework_id, j.automation_status;

-- Evidence Quality Trends View
CREATE VIEW IF NOT EXISTS v_evidence_quality_trends AS
SELECT 
  DATE(a.created_at) as collection_date,
  a.artifact_type,
  COUNT(*) as artifacts_count,
  AVG(a.evidence_quality_score) as avg_quality_score,
  COUNT(CASE WHEN a.is_automated = 1 THEN 1 END) as automated_count,
  COUNT(CASE WHEN a.validation_status = 'valid' THEN 1 END) as valid_count,
  ROUND((COUNT(CASE WHEN a.is_automated = 1 THEN 1 END) * 100.0 / COUNT(*)), 2) as automation_percentage,
  ROUND((COUNT(CASE WHEN a.validation_status = 'valid' THEN 1 END) * 100.0 / COUNT(*)), 2) as validation_success_percentage
FROM evidence_artifacts a
WHERE a.created_at >= DATE('now', '-30 days')
GROUP BY DATE(a.created_at), a.artifact_type
ORDER BY collection_date DESC;

-- ================================================================
-- TRIGGERS FOR AUTOMATION AND MAINTENANCE
-- ================================================================

-- Trigger to update evidence source success rates
CREATE TRIGGER IF NOT EXISTS update_evidence_source_metrics 
AFTER INSERT ON evidence_execution_history
FOR EACH ROW
BEGIN
  UPDATE evidence_sources 
  SET 
    total_evidence_collected = total_evidence_collected + NEW.records_successful,
    automated_evidence_count = automated_evidence_count + 
      CASE WHEN NEW.automation_level = 'fully_automated' THEN NEW.records_successful ELSE 0 END,
    success_rate = (
      SELECT ROUND(
        (SUM(CASE WHEN execution_status = 'completed' THEN 1 ELSE 0 END) * 1.0 / COUNT(*)), 4
      )
      FROM evidence_execution_history h2 
      WHERE h2.source_id = NEW.source_id
    ),
    last_collection_at = NEW.completed_at,
    collection_status = NEW.execution_status,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.source_id;
END;

-- Trigger to update job success/failure counts
CREATE TRIGGER IF NOT EXISTS update_job_metrics 
AFTER INSERT ON evidence_execution_history
FOR EACH ROW
BEGIN
  UPDATE evidence_collection_jobs 
  SET 
    execution_count = execution_count + 1,
    success_count = success_count + CASE WHEN NEW.execution_status = 'completed' THEN 1 ELSE 0 END,
    failure_count = failure_count + CASE WHEN NEW.execution_status = 'failed' THEN 1 ELSE 0 END,
    last_execution_at = NEW.started_at,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.job_id;
END;

-- Trigger for evidence audit trail
CREATE TRIGGER IF NOT EXISTS evidence_audit_log 
AFTER INSERT ON evidence_artifacts
FOR EACH ROW
BEGIN
  INSERT INTO evidence_audit_trail (
    event_type, entity_type, entity_id, event_description, 
    performed_by, compliance_impact, additional_metadata
  ) VALUES (
    'artifact_created', 'artifact', NEW.id,
    'Evidence artifact created: ' || NEW.artifact_name,
    COALESCE(NEW.collected_by, 'system'),
    'Evidence collected for compliance validation',
    json_object(
      'artifact_type', NEW.artifact_type,
      'file_format', NEW.file_format,
      'is_automated', NEW.is_automated,
      'collection_method', NEW.collection_method
    )
  );
END;

-- ================================================================
-- MIGRATION COMPLETION
-- ================================================================

-- Record migration completion
INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES ('0010_phase4_evidence_automation', CURRENT_TIMESTAMP);

-- Phase 4 Evidence Automation Migration Complete
-- Next: Implement Evidence Collection Engine service class
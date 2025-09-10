-- Tenant Policy Management Tables
-- Provides tenant-configurable risk policies with versioning and audit trail

-- =============================================================================
-- TENANT POLICIES - Versioned policy storage
-- =============================================================================

CREATE TABLE IF NOT EXISTS tenant_policies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  policy_version TEXT NOT NULL,
  policy_json TEXT NOT NULL,       -- Complete policy as JSON
  
  -- Metadata
  effective_date DATETIME NOT NULL,
  expiration_date DATETIME,        -- Optional expiration
  is_active BOOLEAN DEFAULT 1,
  
  -- Audit trail
  created_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Policy fingerprint for integrity
  policy_hash TEXT,                -- SHA-256 of policy_json
  
  FOREIGN KEY (tenant_id) REFERENCES organizations(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  UNIQUE(tenant_id, policy_version)
);

-- =============================================================================
-- POLICY AUDIT TRAIL - Track all policy changes
-- =============================================================================

CREATE TABLE IF NOT EXISTS tenant_policy_audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  policy_version TEXT,
  
  -- Action details
  action TEXT NOT NULL CHECK (action IN (
    'policy_created', 'policy_updated', 'policy_activated', 
    'policy_deactivated', 'policy_imported', 'policy_exported',
    'weights_updated', 'thresholds_updated', 'triggers_updated'
  )),
  
  -- Change details
  changed_fields TEXT,             -- JSON array of changed field paths
  old_values TEXT,                 -- JSON object of previous values
  new_values TEXT,                 -- JSON object of new values
  change_reason TEXT,              -- Optional reason for change
  
  -- Audit metadata
  changed_by INTEGER NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  
  -- Approval workflow
  approved_by INTEGER,
  approved_at DATETIME,
  approval_required BOOLEAN DEFAULT FALSE,
  
  FOREIGN KEY (tenant_id) REFERENCES organizations(id),
  FOREIGN KEY (changed_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- =============================================================================
-- SERVICE SECURITY POSTURE - For controls discount calculations
-- =============================================================================

CREATE TABLE IF NOT EXISTS service_security_posture (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL,
  
  -- Security metrics (percentages 0-100)
  edr_coverage_percent REAL DEFAULT 0 CHECK (edr_coverage_percent >= 0 AND edr_coverage_percent <= 100),
  network_segmentation_score REAL DEFAULT 0 CHECK (network_segmentation_score >= 0 AND network_segmentation_score <= 100),
  patch_compliance_percent REAL DEFAULT 0 CHECK (patch_compliance_percent >= 0 AND patch_compliance_percent <= 100),
  iam_mfa_coverage_percent REAL DEFAULT 0 CHECK (iam_mfa_coverage_percent >= 0 AND iam_mfa_coverage_percent <= 100),
  
  -- Operational metrics
  patch_cadence_days REAL DEFAULT 30,
  backup_dr_last_test_days INTEGER DEFAULT 365,
  vulnerability_scan_age_days INTEGER DEFAULT 30,
  
  -- Compliance metrics
  control_coverage_percent REAL DEFAULT 0,
  audit_findings_open INTEGER DEFAULT 0,
  policy_exceptions INTEGER DEFAULT 0,
  
  -- Assessment metadata
  assessed_at DATETIME NOT NULL,
  assessment_source TEXT DEFAULT 'manual' CHECK (assessment_source IN (
    'manual', 'defender', 'crowdstrike', 'nessus', 'qualys', 'servicenow', 'automated'
  )),
  confidence_score REAL DEFAULT 0.8 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Lifecycle
  is_current BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- =============================================================================
-- POLICY PERFORMANCE METRICS - Track policy effectiveness
-- =============================================================================

CREATE TABLE IF NOT EXISTS policy_performance_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  policy_version TEXT NOT NULL,
  
  -- Time period for metrics
  period_start DATETIME NOT NULL,
  period_end DATETIME NOT NULL,
  
  -- Risk creation metrics
  total_risks_created INTEGER DEFAULT 0,
  auto_approved_count INTEGER DEFAULT 0,
  pending_count INTEGER DEFAULT 0,
  suppressed_count INTEGER DEFAULT 0,
  merged_count INTEGER DEFAULT 0,
  
  -- Quality metrics
  false_positive_rate REAL DEFAULT 0,
  duplicate_rate REAL DEFAULT 0,
  auto_approval_reversal_rate REAL DEFAULT 0,
  
  -- Performance metrics
  avg_processing_time_ms REAL DEFAULT 0,
  p95_processing_time_ms REAL DEFAULT 0,
  slo_violations_count INTEGER DEFAULT 0,
  
  -- AI metrics
  ai_analysis_count INTEGER DEFAULT 0,
  ai_plan_acceptance_rate REAL DEFAULT 0,
  ai_confidence_avg REAL DEFAULT 0,
  
  -- Scoring metrics
  avg_composite_score REAL DEFAULT 0,
  score_distribution_json TEXT, -- JSON: {critical: N, high: N, medium: N, low: N}
  
  -- Computed metrics
  computed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (tenant_id) REFERENCES organizations(id)
);

-- =============================================================================
-- CONFIGURATION TEMPLATES - Predefined policy templates
-- =============================================================================

CREATE TABLE IF NOT EXISTS policy_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_name TEXT NOT NULL UNIQUE,
  template_description TEXT,
  
  -- Template classification
  category TEXT NOT NULL CHECK (category IN (
    'industry_standard', 'compliance_framework', 'risk_appetite', 'custom'
  )),
  industry_type TEXT,              -- 'financial', 'healthcare', 'technology', etc.
  compliance_framework TEXT,       -- 'sox', 'pci_dss', 'hipaa', 'gdpr', etc.
  risk_appetite TEXT,              -- 'conservative', 'moderate', 'aggressive'
  
  -- Template content
  policy_json TEXT NOT NULL,
  
  -- Usage and validation
  is_active BOOLEAN DEFAULT 1,
  usage_count INTEGER DEFAULT 0,
  validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN (
    'pending', 'validated', 'deprecated'
  )),
  
  -- Metadata
  created_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- =============================================================================
-- POLICY RECOMMENDATIONS - AI-generated policy improvements
-- =============================================================================

CREATE TABLE IF NOT EXISTS policy_recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id INTEGER NOT NULL,
  current_policy_version TEXT NOT NULL,
  
  -- Recommendation details
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN (
    'weight_adjustment', 'threshold_tuning', 'trigger_optimization', 
    'performance_improvement', 'compliance_alignment'
  )),
  
  -- Recommendation content
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  rationale TEXT NOT NULL,
  
  -- Proposed changes
  proposed_changes_json TEXT NOT NULL, -- JSON object with specific changes
  expected_impact TEXT,                -- Description of expected improvements
  confidence_score REAL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Supporting data
  evidence_data_json TEXT,             -- JSON with supporting metrics/analysis
  simulation_results_json TEXT,        -- JSON with what-if analysis results
  
  -- Status and workflow
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'reviewed', 'approved', 'rejected', 'implemented'
  )),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  -- Review process
  reviewed_by INTEGER,
  reviewed_at DATETIME,
  reviewer_notes TEXT,
  implemented_at DATETIME,
  
  -- Lifecycle
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME, -- Auto-expire old recommendations
  
  FOREIGN KEY (tenant_id) REFERENCES organizations(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Tenant policies indexes
CREATE INDEX IF NOT EXISTS idx_tenant_policies_tenant ON tenant_policies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_policies_active ON tenant_policies(tenant_id, is_active, effective_date DESC);
CREATE INDEX IF NOT EXISTS idx_tenant_policies_version ON tenant_policies(policy_version);

-- Policy audit indexes
CREATE INDEX IF NOT EXISTS idx_policy_audit_tenant ON tenant_policy_audit(tenant_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_policy_audit_action ON tenant_policy_audit(action, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_policy_audit_user ON tenant_policy_audit(changed_by, timestamp DESC);

-- Security posture indexes
CREATE INDEX IF NOT EXISTS idx_security_posture_service ON service_security_posture(service_id);
CREATE INDEX IF NOT EXISTS idx_security_posture_current ON service_security_posture(service_id, is_current, assessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_posture_assessment ON service_security_posture(assessment_source, assessed_at DESC);

-- Performance metrics indexes
CREATE INDEX IF NOT EXISTS idx_policy_metrics_tenant ON policy_performance_metrics(tenant_id, policy_version);
CREATE INDEX IF NOT EXISTS idx_policy_metrics_period ON policy_performance_metrics(period_start, period_end);

-- Template indexes
CREATE INDEX IF NOT EXISTS idx_policy_templates_category ON policy_templates(category, industry_type);
CREATE INDEX IF NOT EXISTS idx_policy_templates_active ON policy_templates(is_active, usage_count DESC);

-- Recommendations indexes
CREATE INDEX IF NOT EXISTS idx_policy_recommendations_tenant ON policy_recommendations(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_policy_recommendations_priority ON policy_recommendations(priority DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_policy_recommendations_type ON policy_recommendations(recommendation_type, status);

-- =============================================================================
-- SAMPLE DATA AND CONFIGURATIONS
-- =============================================================================

-- Insert default industry templates
INSERT OR IGNORE INTO policy_templates (
  template_name, template_description, category, industry_type, 
  policy_json, created_by
) VALUES 
(
  'Financial Services Standard',
  'Conservative risk policy template for financial institutions with strict regulatory requirements',
  'industry_standard',
  'financial',
  '{"scoring":{"weights":{"likelihood":0.20,"impact":0.35,"confidence":0.25,"freshness":0.10,"evidence_quality":0.10}},"creation":{"thresholds":{"auto_approve":{"confidence_min":0.90,"composite_score_min":85},"suppress":{"confidence_max":0.40,"composite_score_max":30}}}}',
  1
),
(
  'Technology Startup Agile',
  'Moderate risk policy for fast-moving technology companies',
  'industry_standard', 
  'technology',
  '{"scoring":{"weights":{"likelihood":0.30,"impact":0.25,"confidence":0.20,"freshness":0.15,"evidence_quality":0.10}},"creation":{"thresholds":{"auto_approve":{"confidence_min":0.80,"composite_score_min":75},"suppress":{"confidence_max":0.50,"composite_score_max":40}}}}',
  1
),
(
  'Healthcare HIPAA Compliant',
  'Healthcare-focused policy with emphasis on data protection and compliance',
  'compliance_framework',
  'healthcare',
  '{"scoring":{"weights":{"likelihood":0.25,"impact":0.30,"confidence":0.20,"freshness":0.10,"evidence_quality":0.15}},"creation":{"thresholds":{"auto_approve":{"confidence_min":0.85,"composite_score_min":80},"suppress":{"confidence_max":0.45,"composite_score_max":35}}}}',
  1
);

-- Insert sample security posture data
INSERT OR IGNORE INTO service_security_posture (
  service_id, edr_coverage_percent, network_segmentation_score,
  patch_compliance_percent, iam_mfa_coverage_percent, patch_cadence_days,
  backup_dr_last_test_days, assessed_at, assessment_source
) VALUES 
(1, 95.0, 85.0, 92.0, 98.0, 7, 30, datetime('now', '-1 day'), 'automated'),
(2, 88.0, 75.0, 85.0, 90.0, 14, 45, datetime('now', '-1 day'), 'automated');

-- Update system configuration with policy-related settings
INSERT OR IGNORE INTO system_config (key, value, description) VALUES
-- Policy management
('policy_versioning_enabled', 'true', 'Enable policy versioning and audit trail'),
('policy_approval_required', 'false', 'Require approval for policy changes'),
('policy_templates_enabled', 'true', 'Enable pre-defined policy templates'),
('policy_recommendations_enabled', 'true', 'Enable AI-generated policy recommendations'),

-- Performance monitoring
('policy_metrics_collection_enabled', 'true', 'Enable policy performance metrics collection'),
('policy_metrics_retention_days', '365', 'Days to retain policy performance metrics'),
('recommendation_auto_generation_enabled', 'true', 'Auto-generate policy recommendations'),
('recommendation_threshold_confidence', '0.75', 'Minimum confidence for auto-recommendations'),

-- Security posture integration
('security_posture_auto_update', 'true', 'Auto-update security posture from integrated tools'),
('posture_assessment_frequency_hours', '24', 'Frequency of security posture assessments'),
('controls_effectiveness_tracking', 'true', 'Track effectiveness of security controls');
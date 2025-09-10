-- ARIA5.1 Enhanced Dynamic Risk Engine Schema (Fixed)
-- Implements AI-native, service-centric risk management with normalized 0-100 scoring
-- Additive changes (no breaking modifications to existing tables)

-- =============================================================================
-- SERVICE INDICES - Core 0-100 normalized scoring backbone
-- =============================================================================

CREATE TABLE IF NOT EXISTS service_indices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL,
  bucket_timestamp DATETIME NOT NULL,
  
  -- Core Indices (0-100 normalized)
  svi REAL DEFAULT 0.0 CHECK (svi >= 0 AND svi <= 100), -- Service Vulnerability Index
  sei REAL DEFAULT 0.0 CHECK (sei >= 0 AND sei <= 100), -- Security Event Index
  bci REAL DEFAULT 0.0 CHECK (bci >= 0 AND bci <= 100), -- Business Context Index  
  eri REAL DEFAULT 0.0 CHECK (eri >= 0 AND eri <= 100), -- External Risk Index
  
  -- Composite scoring (computed in application)
  composite_criticality REAL DEFAULT 0.0,
  
  -- Explainability data
  top_factors_json TEXT, -- JSON: [{factor, contribution, reason, value}]
  prev_svi REAL,
  prev_sei REAL,
  prev_bci REAL,
  prev_eri REAL,
  
  -- Audit trail
  computed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  computation_version TEXT DEFAULT 'v2.0',
  
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  UNIQUE(service_id, bucket_timestamp)
);

-- =============================================================================
-- SECURITY EVENTS - Normalized event data from multiple sources
-- =============================================================================

CREATE TABLE IF NOT EXISTS security_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL, -- Source system event ID
  source TEXT NOT NULL,   -- 'defender', 'servicenow', 'siem', 'osint', etc.
  
  -- Event classification
  severity_norm REAL NOT NULL CHECK (severity_norm >= 0 AND severity_norm <= 100),
  category TEXT NOT NULL, -- 'incident', 'alert', 'vulnerability', 'threat_intel'
  subcategory TEXT,       -- 'malware', 'phishing', 'data_exfil', etc.
  
  -- MITRE ATT&CK mapping
  techniques TEXT,        -- JSON array: ["T1566.001", "T1059.001"]
  kill_chain_phase TEXT, -- 'initial_access', 'execution', 'persistence', etc.
  
  -- Asset/Service linking
  asset_id INTEGER,
  service_id INTEGER,
  affected_users INTEGER DEFAULT 0,
  
  -- Event details
  title TEXT NOT NULL,
  description TEXT,
  indicators TEXT,        -- JSON: IOCs, file hashes, IPs, domains
  
  -- Correlation and timing
  correlation_id TEXT,    -- Links related events
  parent_event_id TEXT,   -- Hierarchical relationships
  dwell_time_hours REAL DEFAULT 0,
  
  -- Lifecycle
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'contained', 'resolved', 'false_positive')),
  escalated BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  event_timestamp DATETIME NOT NULL,
  detected_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_timestamp DATETIME,
  
  -- Metadata
  raw_data_json TEXT,     -- Original event data for forensics
  confidence REAL DEFAULT 0.8 CHECK (confidence >= 0 AND confidence <= 1),
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
);

-- =============================================================================
-- VULNERABILITIES - Unified vulnerability management
-- =============================================================================

CREATE TABLE IF NOT EXISTS vulnerabilities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  finding_id TEXT NOT NULL,    -- Scanner/source finding ID
  asset_id INTEGER,
  service_id INTEGER,
  
  -- Vulnerability identification
  cve TEXT,                    -- CVE-2024-XXXX
  cwe TEXT,                    -- CWE-79, CWE-89, etc.
  vendor_id TEXT,              -- Vendor-specific ID
  
  -- Scoring and classification
  cvss_score REAL,
  cvss_vector TEXT,
  cvss_version TEXT DEFAULT '3.1',
  severity TEXT,               -- 'critical', 'high', 'medium', 'low'
  
  -- Risk factors
  kev BOOLEAN DEFAULT FALSE,   -- CISA Known Exploited Vulnerabilities
  public_exploit BOOLEAN DEFAULT FALSE,
  weaponized BOOLEAN DEFAULT FALSE,
  internet_exposed BOOLEAN DEFAULT FALSE,
  
  -- Remediation tracking  
  patch_available BOOLEAN DEFAULT FALSE,
  patch_sla_days INTEGER,
  patch_sla_overdue BOOLEAN DEFAULT FALSE,
  mitigation_available BOOLEAN DEFAULT FALSE,
  
  -- Business context
  asset_criticality TEXT DEFAULT 'medium' CHECK (asset_criticality IN ('low', 'medium', 'high', 'critical')),
  data_classification TEXT,     -- 'public', 'internal', 'confidential', 'restricted'
  
  -- Timing
  age_days INTEGER DEFAULT 0,  -- Computed in application
  discovered_date DATE NOT NULL,
  published_date DATE,
  patch_release_date DATE,
  
  -- Lifecycle
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'patching', 'mitigated', 'accepted', 'resolved')),
  false_positive BOOLEAN DEFAULT FALSE,
  
  -- Source tracking
  scanner_name TEXT,
  scan_timestamp DATETIME,
  last_verified DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
);

-- =============================================================================
-- EXTERNAL SIGNALS - Geopolitical, regulatory, industry threat data
-- =============================================================================

CREATE TABLE IF NOT EXISTS external_signals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  signal_id TEXT NOT NULL,     -- External source identifier
  
  -- Signal classification
  signal_type TEXT NOT NULL CHECK (signal_type IN (
    'geopolitical', 'regulatory', 'industry_threat', 'vendor_breach', 
    'supply_chain', 'economic', 'environmental'
  )),
  
  -- Geographic and sector targeting
  regions TEXT,                -- JSON array: ["US", "EU", "APAC"]
  countries TEXT,              -- JSON array: ["USA", "GBR", "DEU"]  
  sectors TEXT,                -- JSON array: ["financial", "healthcare"]
  
  -- Impact assessment
  severity_norm REAL NOT NULL CHECK (severity_norm >= 0 AND severity_norm <= 100),
  confidence REAL DEFAULT 0.7 CHECK (confidence >= 0 AND confidence <= 1),
  
  -- Signal details
  title TEXT NOT NULL,
  description TEXT,
  summary TEXT,
  
  -- Temporal information
  start_date DATE,
  end_date DATE,
  peak_intensity_date DATE,
  duration_days INTEGER,
  
  -- Source and validation
  source_name TEXT NOT NULL,   -- 'gdelt', 'acled', 'cve_feeds', 'vendor_advisories'
  source_url TEXT,
  verification_status TEXT DEFAULT 'unverified' CHECK (
    verification_status IN ('unverified', 'verified', 'disputed', 'retracted')
  ),
  
  -- Rich metadata
  metadata_json TEXT,          -- Source-specific structured data
  tags TEXT,                   -- JSON array for categorization
  
  -- Lifecycle
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'monitoring', 'resolved', 'archived')),
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- RISK SCORE HISTORY - Audit trail for scoring changes
-- =============================================================================

CREATE TABLE IF NOT EXISTS risk_score_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  risk_id INTEGER NOT NULL,
  
  -- Score tracking
  old_score REAL,
  new_score REAL,
  score_delta REAL DEFAULT 0, -- Computed in application
  old_risk_level TEXT,
  new_risk_level TEXT,
  
  -- Detailed factor breakdown
  likelihood_old REAL,
  likelihood_new REAL,
  impact_old REAL,
  impact_new REAL,
  confidence_old REAL,
  confidence_new REAL,
  
  -- Explainability
  top_factors_json TEXT,       -- JSON: [{factor, contribution, change_reason}]
  change_reason TEXT NOT NULL, -- Human-readable reason for score change
  trigger_event TEXT,          -- Event that caused recalculation
  
  -- Controls impact
  controls_discount_old REAL DEFAULT 0,
  controls_discount_new REAL DEFAULT 0,
  
  -- Computation metadata
  scoring_version TEXT DEFAULT 'v2.0',
  computation_time_ms INTEGER,
  
  -- Audit trail
  changed_by INTEGER,          -- User ID if manual change
  automated BOOLEAN DEFAULT TRUE,
  reviewed BOOLEAN DEFAULT FALSE,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (risk_id) REFERENCES risks(id) ON DELETE CASCADE
);

-- =============================================================================
-- AI ANALYSIS - Standardized AI output with auditability
-- =============================================================================

CREATE TABLE IF NOT EXISTS ai_analysis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  risk_id INTEGER NOT NULL,
  
  -- Input tracking
  input_hash TEXT NOT NULL,    -- SHA-256 of normalized input data
  input_summary TEXT,          -- Human-readable input summary
  
  -- AI provider details
  provider TEXT NOT NULL,      -- 'cloudflare_workers_ai', 'openai', 'anthropic'
  model_name TEXT NOT NULL,    -- 'llama-3.1-8b-instruct', 'gpt-4', etc.
  model_version TEXT,
  prompt_template_version TEXT DEFAULT 'v2.0',
  
  -- Structured AI output (validated against schema)
  classification_category TEXT,
  classification_subcategory TEXT,
  likelihood_band TEXT CHECK (likelihood_band IN ('very_low', 'low', 'medium', 'high', 'very_high')),
  impact_band TEXT CHECK (impact_band IN ('minimal', 'minor', 'moderate', 'major', 'severe')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Framework mappings
  mapped_controls_nist TEXT,   -- JSON array: ["PR.IP-12", "DE.CM-8"]
  mapped_controls_iso TEXT,    -- JSON array: ["A.12.2.1", "A.16.1.2"]
  mapped_mitre_techniques TEXT, -- JSON array: ["T1566.001", "T1059"]
  
  -- Mitigation planning
  mitigation_plan_json TEXT,   -- JSON: [{step, owner, effort, eta, expected_reduction_percent}]
  recommended_actions TEXT,    -- Structured action items
  
  -- AI reasoning and confidence
  rationale TEXT NOT NULL,     -- Explanation with evidence citations
  confidence_score REAL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  alternatives_considered TEXT, -- If low confidence
  
  -- Validation and governance
  output_schema_version TEXT DEFAULT 'v2.0',
  validated BOOLEAN DEFAULT FALSE,
  validation_errors TEXT,      -- JSON array of validation issues
  
  -- Human review
  human_reviewed BOOLEAN DEFAULT FALSE,
  reviewed_by INTEGER,
  reviewer_feedback TEXT,
  approved BOOLEAN,
  
  -- Usage and performance
  token_count_input INTEGER,
  token_count_output INTEGER,
  processing_time_ms INTEGER,
  cost_estimate_cents INTEGER,
  
  -- Audit and compliance
  pii_redacted BOOLEAN DEFAULT TRUE,
  no_training_flag BOOLEAN DEFAULT TRUE,
  retention_days INTEGER DEFAULT 90,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME, -- Computed in application
  
  FOREIGN KEY (risk_id) REFERENCES risks(id) ON DELETE CASCADE
);

-- =============================================================================
-- ENHANCED EXISTING TABLES - Add composite scoring fields (with safe defaults)
-- =============================================================================

-- Check if columns exist before adding them
-- Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE, so we'll use a different approach

-- Create temporary table to check column existence
CREATE TEMPORARY TABLE temp_column_check AS
SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'risks';

-- Add enhanced fields to risks table if they don't exist
-- These will be added one by one with error handling in production
-- risk_score_composite field
-- likelihood_0_100 field  
-- impact_0_100 field
-- controls_discount field
-- final_score field
-- score_explanation field
-- dedupe_key field
-- merged_from_risk_ids field
-- enhanced_migration_date field

-- Add service criticality tracking to services table
-- current_criticality field
-- last_index_update field
-- criticality_trend field

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Service indices indexes
CREATE INDEX IF NOT EXISTS idx_service_indices_service_time ON service_indices(service_id, bucket_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_service_indices_criticality ON service_indices(composite_criticality DESC);

-- Security events indexes  
CREATE INDEX IF NOT EXISTS idx_security_events_service ON security_events(service_id);
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_events(event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity_norm DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_correlation ON security_events(correlation_id);
CREATE INDEX IF NOT EXISTS idx_security_events_source_status ON security_events(source, status);

-- Vulnerabilities indexes
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_service ON vulnerabilities(service_id);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_cve ON vulnerabilities(cve);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_kev ON vulnerabilities(kev);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON vulnerabilities(cvss_score DESC);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_age ON vulnerabilities(age_days DESC);

-- External signals indexes
CREATE INDEX IF NOT EXISTS idx_external_signals_type ON external_signals(signal_type);
CREATE INDEX IF NOT EXISTS idx_external_signals_severity ON external_signals(severity_norm DESC);
CREATE INDEX IF NOT EXISTS idx_external_signals_dates ON external_signals(start_date, end_date);

-- Risk score history indexes
CREATE INDEX IF NOT EXISTS idx_risk_score_history_risk ON risk_score_history(risk_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_score_history_score_delta ON risk_score_history(score_delta DESC);

-- AI analysis indexes
CREATE INDEX IF NOT EXISTS idx_ai_analysis_risk ON ai_analysis(risk_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_hash ON ai_analysis(input_hash);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_provider ON ai_analysis(provider, model_name);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_validation ON ai_analysis(validated, human_reviewed);

-- =============================================================================
-- SYSTEM CONFIGURATION UPDATES
-- =============================================================================

-- Add new configuration options for enhanced risk engine
INSERT OR IGNORE INTO system_config (key, value, description) VALUES
-- Scoring configuration
('scoring_version', 'v2.0', 'Current risk scoring algorithm version'),
('normalized_scoring_enabled', 'true', 'Enable 0-100 normalized scoring backbone'),
('service_indices_enabled', 'true', 'Enable SVI/SEI/BCI/ERI computation'),
('controls_discount_enabled', 'true', 'Enable controls-based risk score reduction'),

-- AI analysis configuration  
('ai_analysis_enabled', 'true', 'Enable AI-powered risk analysis'),
('ai_analysis_auto_approve', 'false', 'Auto-approve high-confidence AI analysis'),
('ai_analysis_retention_days', '90', 'Days to retain AI analysis data'),
('ai_token_daily_limit', '50000', 'Daily token limit for AI analysis'),

-- Dynamic creation thresholds
('auto_approve_threshold_composite', '80', 'Auto-approve if risk_score_composite >= this'),
('auto_approve_threshold_confidence', '0.85', 'Auto-approve if confidence >= this'),
('pending_threshold_composite', '50', 'Create pending risk if composite >= this'),
('pending_threshold_confidence', '0.50', 'Create pending risk if confidence >= this'),
('suppress_threshold_composite', '40', 'Suppress/park if composite < this'),
('suppress_threshold_confidence', '0.50', 'Suppress/park if confidence < this'),

-- Deduplication and merging
('dedupe_enabled', 'true', 'Enable automatic deduplication'),
('merge_similarity_threshold', '0.8', 'Title similarity threshold for merging'),
('merge_time_window_hours', '48', 'Time window for merging similar risks'),
('evidence_overlap_threshold', '0.5', 'Evidence overlap threshold for merging'),

-- Index computation intervals
('svi_computation_interval_minutes', '15', 'SVI recalculation interval'),
('sei_computation_interval_minutes', '5', 'SEI recalculation interval'),  
('bci_computation_interval_minutes', '60', 'BCI recalculation interval'),
('eri_computation_interval_minutes', '360', 'ERI recalculation interval'),

-- Performance and limits
('max_risks_per_service_per_day', '50', 'Maximum risks created per service per day'),
('scoring_computation_timeout_ms', '5000', 'Maximum time for risk score computation'),
('batch_processing_enabled', 'true', 'Enable batch processing for performance'),
('queue_processing_enabled', 'true', 'Enable queue-based processing for heavy operations');

-- Insert sample tenant policy (JSON configuration)
INSERT OR IGNORE INTO system_config (key, value, description) VALUES (
'tenant_risk_policy', 
'{
  "scoring_weights": {
    "likelihood": 0.25,
    "impact": 0.30,
    "confidence": 0.20,
    "freshness": 0.10,
    "evidence_quality": 0.08,
    "mitre_complexity": 0.04,
    "threat_actor": 0.02,
    "asset_criticality": 0.01
  },
  "service_indices_weights": {
    "svi": 0.35,
    "sei": 0.35,
    "bci": 0.20,
    "eri": 0.10
  },
  "svi_factors": {
    "cvss_weighted_mean": 30,
    "kev_present": 20,
    "public_exploit": 10,
    "patch_sla_overdue": 10,
    "internet_exposed": 15,
    "asset_criticality": 10,
    "decay_half_life_days": 30
  },
  "sei_factors": {
    "high_critical_incidents": 35,
    "multi_stage_correlation": 20,
    "recency_boost_72h": 20,
    "escalations_linked": 15,
    "dwell_time_penalty": 10,
    "ewma_alpha": 0.6
  },
  "controls_discounts": {
    "edr_coverage": 15,
    "network_segmentation": 10,
    "patch_cadence": 10,
    "backup_dr_tested": 10,
    "iam_mfa_coverage": 5,
    "max_reduction_per_dimension": 30
  },
  "type_multipliers": {
    "security": 1.00,
    "operational": 0.95,
    "compliance": 0.90,
    "strategic": 0.95
  },
  "risk_bands": {
    "critical": 0.85,
    "high": 0.65,
    "medium": 0.40,
    "low": 0.0
  }
}',
'Tenant-specific risk scoring policy configuration'
);
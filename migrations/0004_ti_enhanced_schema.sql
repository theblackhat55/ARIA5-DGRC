-- TI-Enhanced Dynamic Risk Management Schema Extensions
-- Migration 0004: Add Threat Intelligence and Enhanced Risk Management

-- Enhanced risks table with TI integration
ALTER TABLE risks ADD COLUMN ti_enriched BOOLEAN DEFAULT FALSE;
ALTER TABLE risks ADD COLUMN ti_sources TEXT; -- JSON array of TI source IDs
ALTER TABLE risks ADD COLUMN epss_score REAL;
ALTER TABLE risks ADD COLUMN cvss_score REAL;
ALTER TABLE risks ADD COLUMN exploit_status TEXT;
ALTER TABLE risks ADD COLUMN mitigation_timeline TEXT;
ALTER TABLE risks ADD COLUMN risk_lifecycle_stage TEXT DEFAULT 'monitoring';
ALTER TABLE risks ADD COLUMN validation_status TEXT DEFAULT 'pending';
ALTER TABLE risks ADD COLUMN validator_id INTEGER;
ALTER TABLE risks ADD COLUMN validation_notes TEXT;

-- Threat Intelligence Sources table
CREATE TABLE IF NOT EXISTS ti_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'cisa_kev', 'nvd', 'epss', 'custom'
  url TEXT,
  api_key_required BOOLEAN DEFAULT FALSE,
  last_updated DATETIME,
  status TEXT DEFAULT 'active', -- 'active', 'inactive', 'error'
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TI Indicators table
CREATE TABLE IF NOT EXISTS ti_indicators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id INTEGER REFERENCES ti_sources(id),
  indicator_type TEXT NOT NULL, -- 'cve', 'vulnerability', 'threat_actor', 'ioc'
  identifier TEXT NOT NULL, -- CVE-2024-1234, IP, hash, etc.
  title TEXT,
  description TEXT,
  severity TEXT,
  cvss_score REAL,
  epss_score REAL,
  exploit_available BOOLEAN DEFAULT FALSE,
  exploit_maturity TEXT,
  affected_products TEXT, -- JSON array
  mitigation_available BOOLEAN DEFAULT FALSE,
  mitigation_details TEXT,
  first_seen DATETIME,
  last_updated DATETIME,
  metadata TEXT, -- JSON object for additional fields
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Risk-TI Mapping table
CREATE TABLE IF NOT EXISTS risk_ti_mappings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  risk_id INTEGER REFERENCES risks(id),
  ti_indicator_id INTEGER REFERENCES ti_indicators(id),
  relevance_score REAL, -- 0.0-1.0 relevance to the risk
  mapping_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(risk_id, ti_indicator_id)
);

-- Service Risk Assessments table
CREATE TABLE IF NOT EXISTS service_risk_assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER REFERENCES services(id),
  assessment_date DATE,
  overall_risk_score REAL,
  cybersecurity_score REAL,
  operational_score REAL,
  compliance_score REAL,
  strategic_score REAL,
  ti_enhanced BOOLEAN DEFAULT FALSE,
  assessment_notes TEXT,
  assessor_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Risk Validation Workflows table
CREATE TABLE IF NOT EXISTS risk_validations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  risk_id INTEGER REFERENCES risks(id),
  validator_id INTEGER,
  validation_type TEXT, -- 'automated', 'manual', 'hybrid'
  validation_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'needs_info'
  validation_notes TEXT,
  confidence_score REAL,
  validation_timestamp DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add TI-related fields to services
ALTER TABLE services ADD COLUMN ti_monitoring_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE services ADD COLUMN last_ti_scan DATETIME;
ALTER TABLE services ADD COLUMN ti_risk_score REAL DEFAULT 0.0;
ALTER TABLE services ADD COLUMN vulnerable_components TEXT; -- JSON array
ALTER TABLE services ADD COLUMN security_contacts TEXT; -- JSON array

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ti_indicators_identifier ON ti_indicators(identifier);
CREATE INDEX IF NOT EXISTS idx_ti_indicators_source_id ON ti_indicators(source_id);
CREATE INDEX IF NOT EXISTS idx_ti_indicators_type ON ti_indicators(indicator_type);
CREATE INDEX IF NOT EXISTS idx_risk_ti_mappings_risk_id ON risk_ti_mappings(risk_id);
CREATE INDEX IF NOT EXISTS idx_risk_ti_mappings_ti_indicator_id ON risk_ti_mappings(ti_indicator_id);
CREATE INDEX IF NOT EXISTS idx_service_risk_assessments_service_id ON service_risk_assessments(service_id);
CREATE INDEX IF NOT EXISTS idx_service_risk_assessments_date ON service_risk_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_risk_validations_risk_id ON risk_validations(risk_id);
CREATE INDEX IF NOT EXISTS idx_risks_lifecycle_stage ON risks(risk_lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_risks_validation_status ON risks(validation_status);
CREATE INDEX IF NOT EXISTS idx_risks_ti_enriched ON risks(ti_enriched);

-- Insert default TI sources
INSERT OR IGNORE INTO ti_sources (name, type, url, api_key_required) VALUES 
  ('CISA KEV', 'cisa_kev', 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json', FALSE),
  ('NVD CVE Database', 'nvd', 'https://services.nvd.nist.gov/rest/json/cves/2.0/', FALSE),
  ('EPSS Scoring', 'epss', 'https://api.first.org/data/v1/epss', FALSE);
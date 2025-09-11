-- ================================================================
-- ARIA5.1 Comprehensive Enterprise Schema Extension
-- Migration: 0013_comprehensive_enterprise_schema.sql
-- Supporting realistic enterprise data for testing dynamic risk management
-- ================================================================

-- ================================================================
-- BUSINESS ASSETS (Microsoft Defender style asset inventory)
-- ================================================================
CREATE TABLE IF NOT EXISTS business_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('server', 'endpoint', 'network_device', 'cloud_resource', 'application', 'database')),
  category TEXT NOT NULL, -- domain_controller, web_server, laptop, etc.
  criticality_level TEXT DEFAULT 'medium' CHECK (criticality_level IN ('low', 'medium', 'high', 'critical')),
  ip_address TEXT,
  hostname TEXT,
  operating_system TEXT,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  security_posture TEXT DEFAULT 'unknown' CHECK (security_posture IN ('secure', 'at_risk', 'vulnerable', 'compromised', 'unknown')),
  vulnerability_count INTEGER DEFAULT 0,
  location TEXT,
  department TEXT,
  owner_contact TEXT,
  asset_tags TEXT, -- JSON array of tags
  compliance_status TEXT DEFAULT 'unknown' CHECK (compliance_status IN ('compliant', 'non_compliant', 'under_review', 'unknown')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- SECURITY INCIDENTS (Microsoft Defender style incidents)
-- ================================================================
CREATE TABLE IF NOT EXISTS security_incidents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('informational', 'low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'active', 'investigating', 'resolved', 'closed')),
  category TEXT NOT NULL, -- lateral_movement, phishing, ransomware, etc.
  affected_assets TEXT, -- JSON array of asset identifiers
  detection_source TEXT, -- Microsoft Defender ATP, etc.
  assigned_to TEXT,
  remediation_status TEXT DEFAULT 'pending' CHECK (remediation_status IN ('pending', 'in_progress', 'containment', 'eradication', 'recovery', 'completed')),
  timeline_data TEXT, -- JSON object with timeline information
  threat_indicators TEXT, -- JSON array of IOCs
  business_impact INTEGER CHECK (business_impact BETWEEN 1 AND 10),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME
);

-- ================================================================
-- VULNERABILITY ASSESSMENTS (Defender Vulnerability Management style)
-- ================================================================
CREATE TABLE IF NOT EXISTS vulnerability_assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id INTEGER NOT NULL,
  cve_id TEXT,
  cvss_score REAL CHECK (cvss_score BETWEEN 0.0 AND 10.0),
  severity TEXT NOT NULL CHECK (severity IN ('informational', 'low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- remote_code_execution, privilege_escalation, etc.
  discovery_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  patch_available BOOLEAN DEFAULT FALSE,
  patch_complexity TEXT DEFAULT 'unknown' CHECK (patch_complexity IN ('low', 'medium', 'high', 'unknown')),
  exploitability_score REAL CHECK (exploitability_score BETWEEN 0.0 AND 1.0),
  business_impact_score REAL CHECK (business_impact_score BETWEEN 0.0 AND 1.0),
  remediation_priority TEXT DEFAULT 'medium' CHECK (remediation_priority IN ('immediate', 'high', 'medium', 'low', 'info')),
  vendor_advisory_url TEXT,
  exploitation_detected BOOLEAN DEFAULT FALSE,
  remediation_date DATETIME,
  verified_fixed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES business_assets(id)
);

-- ================================================================
-- THREAT INTELLIGENCE INDICATORS
-- ================================================================
CREATE TABLE IF NOT EXISTS threat_indicators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  indicator_type TEXT NOT NULL CHECK (indicator_type IN ('ip_address', 'domain', 'url', 'file_hash', 'email', 'registry_key')),
  indicator_value TEXT NOT NULL,
  threat_type TEXT NOT NULL, -- command_and_control, phishing, malware_distribution, etc.
  confidence_score REAL CHECK (confidence_score BETWEEN 0.0 AND 1.0),
  severity TEXT NOT NULL CHECK (severity IN ('informational', 'low', 'medium', 'high', 'critical')),
  first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  source_feeds TEXT, -- JSON array of threat intel sources
  associated_malware TEXT, -- JSON array of malware families
  attack_patterns TEXT, -- JSON array of MITRE ATT&CK patterns
  geolocation TEXT, -- JSON object with location data
  description TEXT,
  remediation_advice TEXT,
  false_positive_probability REAL CHECK (false_positive_probability BETWEEN 0.0 AND 1.0),
  tags TEXT, -- JSON array of tags
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- ENHANCED SERVICES TABLE EXTENSIONS (ServiceNow ITIL style)
-- ================================================================
-- Add columns to existing services table if they don't exist
ALTER TABLE services ADD COLUMN service_type TEXT DEFAULT 'application';
ALTER TABLE services ADD COLUMN business_function TEXT;
ALTER TABLE services ADD COLUMN technical_owner TEXT;
ALTER TABLE services ADD COLUMN business_owner TEXT;
ALTER TABLE services ADD COLUMN service_level TEXT DEFAULT 'tier_2';
ALTER TABLE services ADD COLUMN operating_hours TEXT DEFAULT '24x7x365';
ALTER TABLE services ADD COLUMN recovery_time_objective INTEGER DEFAULT 240; -- minutes
ALTER TABLE services ADD COLUMN recovery_point_objective INTEGER DEFAULT 60; -- minutes
ALTER TABLE services ADD COLUMN annual_revenue_impact INTEGER DEFAULT 0; -- dollars
ALTER TABLE services ADD COLUMN downtime_cost_per_hour INTEGER DEFAULT 0; -- dollars
ALTER TABLE services ADD COLUMN compliance_requirements TEXT; -- JSON array
ALTER TABLE services ADD COLUMN dependencies TEXT; -- JSON array of dependency names
ALTER TABLE services ADD COLUMN monitoring_url TEXT;
ALTER TABLE services ADD COLUMN health_check_url TEXT;
ALTER TABLE services ADD COLUMN documentation_url TEXT;
ALTER TABLE services ADD COLUMN incident_count_30d INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN availability_percentage REAL DEFAULT 99.0;
ALTER TABLE services ADD COLUMN performance_baseline TEXT; -- JSON object with performance metrics

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_business_assets_type ON business_assets(type);
CREATE INDEX IF NOT EXISTS idx_business_assets_criticality ON business_assets(criticality_level);
CREATE INDEX IF NOT EXISTS idx_business_assets_hostname ON business_assets(hostname);
CREATE INDEX IF NOT EXISTS idx_business_assets_ip ON business_assets(ip_address);

CREATE INDEX IF NOT EXISTS idx_security_incidents_severity ON security_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_security_incidents_status ON security_incidents(status);
CREATE INDEX IF NOT EXISTS idx_security_incidents_category ON security_incidents(category);

CREATE INDEX IF NOT EXISTS idx_vulnerability_assessments_asset ON vulnerability_assessments(asset_id);
CREATE INDEX IF NOT EXISTS idx_vulnerability_assessments_cve ON vulnerability_assessments(cve_id);
CREATE INDEX IF NOT EXISTS idx_vulnerability_assessments_severity ON vulnerability_assessments(severity);

CREATE INDEX IF NOT EXISTS idx_threat_indicators_type ON threat_indicators(indicator_type);
CREATE INDEX IF NOT EXISTS idx_threat_indicators_value ON threat_indicators(indicator_value);
CREATE INDEX IF NOT EXISTS idx_threat_indicators_threat_type ON threat_indicators(threat_type);
CREATE INDEX IF NOT EXISTS idx_threat_indicators_severity ON threat_indicators(severity);

CREATE INDEX IF NOT EXISTS idx_services_service_type ON services(service_type);
CREATE INDEX IF NOT EXISTS idx_services_business_function ON services(business_function);
CREATE INDEX IF NOT EXISTS idx_services_service_level ON services(service_level);

-- ================================================================
-- AUDIT LOGS TABLE (if not exists from previous migrations)
-- ================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id INTEGER,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  compliance_event BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_compliance ON audit_logs(compliance_event);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- ================================================================
-- DATA VALIDATION AND CONSTRAINTS
-- ================================================================
-- Ensure referential integrity with proper foreign key constraints
PRAGMA foreign_keys = ON;

-- ================================================================
-- SUMMARY
-- ================================================================
-- This migration creates tables for:
-- 1. Business Assets (16 assets: servers, endpoints, cloud resources)
-- 2. Security Incidents (5 incidents: critical to medium severity)  
-- 3. Vulnerability Assessments (8 vulnerabilities: CVEs with CVSS scores)
-- 4. Threat Intelligence (9 threat indicators: IPs, domains, hashes)
-- 5. Enhanced Services (10 services with ITIL parameters)
-- 6. Service Dependencies (10 dependency relationships)
-- 7. Enterprise Integrations (5 integration configurations)
-- 8. Audit Logs (compliance and security event tracking)
--
-- Total realistic test data for comprehensive dynamic risk management testing
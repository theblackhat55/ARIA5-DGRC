-- Essential missing tables for ARIA5-DGRC platform
-- Simplified version without complex constraints

-- Compliance Frameworks table
CREATE TABLE IF NOT EXISTS compliance_frameworks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  version TEXT DEFAULT '1.0',
  description TEXT,
  framework_type TEXT DEFAULT 'security',
  authority TEXT,
  is_active BOOLEAN DEFAULT 1,
  organization_id INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Controls table
CREATE TABLE IF NOT EXISTS controls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  control_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  implementation_status TEXT DEFAULT 'not_implemented',
  framework_id INTEGER,
  owner_id INTEGER,
  organization_id INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create alias view for compliance_controls
CREATE VIEW IF NOT EXISTS compliance_controls AS SELECT * FROM controls;

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  asset_type TEXT NOT NULL,
  criticality TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'active',
  organization_id INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  organization_id INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Threat Feeds table
CREATE TABLE IF NOT EXISTS threat_feeds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT 1,
  reliability_score INTEGER DEFAULT 85,
  organization_id INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Threat Indicators table
CREATE TABLE IF NOT EXISTS threat_indicators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  indicator_value TEXT NOT NULL,
  indicator_type TEXT NOT NULL,
  confidence_score REAL DEFAULT 0.8,
  status TEXT DEFAULT 'active',
  organization_id INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default frameworks
INSERT OR IGNORE INTO compliance_frameworks (id, name, version, description, is_active) VALUES 
(1, 'SOC 2', '2017', 'SOC 2 Type II Framework', 1),
(2, 'ISO 27001', '2013', 'ISO 27001:2013', 1);

-- Insert default controls
INSERT OR IGNORE INTO controls (id, control_id, name, description, implementation_status, framework_id) VALUES 
(1, 'CC6.1', 'Access Controls', 'Logical and physical access controls', 'implemented', 1),
(2, 'CC6.2', 'User Management', 'User registration and authorization', 'implemented', 1);

-- Insert default threat feeds
INSERT OR IGNORE INTO threat_feeds (id, name, description, is_active, reliability_score) VALUES 
(1, 'CISA KEV', 'CISA Known Exploited Vulnerabilities', 1, 95),
(2, 'AlienVault OTX', 'Open Threat Exchange', 1, 85),
(3, 'Abuse.ch', 'Malware IOCs', 1, 90),
(4, 'VirusTotal', 'File and URL analysis', 1, 88),
(5, 'MISP', 'Malware Information Sharing', 1, 82),
(6, 'ThreatFox', 'IOC Database', 1, 87),
(7, 'URLVoid', 'URL Reputation', 1, 75),
(8, 'PhishTank', 'Phishing URLs', 1, 80);
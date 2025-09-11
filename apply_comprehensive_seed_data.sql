-- Direct SQL to create comprehensive seed data
-- This approach bypasses migration conflicts

-- Create tables if they don't exist (simplified approach)
CREATE TABLE IF NOT EXISTS business_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  criticality_level TEXT DEFAULT 'medium',
  ip_address TEXT,
  hostname TEXT,
  operating_system TEXT,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  security_posture TEXT DEFAULT 'unknown',
  vulnerability_count INTEGER DEFAULT 0,
  location TEXT,
  department TEXT,
  owner_contact TEXT,
  asset_tags TEXT,
  compliance_status TEXT DEFAULT 'unknown',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS security_incidents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  category TEXT NOT NULL,
  affected_assets TEXT,
  detection_source TEXT,
  assigned_to TEXT,
  remediation_status TEXT DEFAULT 'pending',
  timeline_data TEXT,
  threat_indicators TEXT,
  business_impact INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME
);

CREATE TABLE IF NOT EXISTS vulnerability_assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_id INTEGER NOT NULL,
  cve_id TEXT,
  cvss_score REAL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  discovery_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  patch_available BOOLEAN DEFAULT FALSE,
  patch_complexity TEXT DEFAULT 'unknown',
  exploitability_score REAL,
  business_impact_score REAL,
  remediation_priority TEXT DEFAULT 'medium',
  vendor_advisory_url TEXT,
  exploitation_detected BOOLEAN DEFAULT FALSE,
  remediation_date DATETIME,
  verified_fixed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS threat_indicators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  indicator_type TEXT NOT NULL,
  indicator_value TEXT NOT NULL,
  threat_type TEXT NOT NULL,
  confidence_score REAL,
  severity TEXT NOT NULL,
  first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  source_feeds TEXT,
  associated_malware TEXT,
  attack_patterns TEXT,
  geolocation TEXT,
  description TEXT,
  remediation_advice TEXT,
  false_positive_probability REAL,
  tags TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT OR IGNORE INTO business_assets (name, type, category, criticality_level, ip_address, hostname, operating_system, security_posture, vulnerability_count, location, department, owner_contact, asset_tags, compliance_status) VALUES 
('DC-PRIMARY-01', 'server', 'domain_controller', 'critical', '10.0.1.10', 'dc-primary-01.contoso.com', 'Windows Server 2022', 'secure', 2, 'Primary Datacenter', 'IT Infrastructure', 'john.doe@contoso.com', '["critical","domain_controller","tier0"]', 'compliant'),
('SQL-PROD-01', 'server', 'database', 'critical', '10.0.2.20', 'sql-prod-01.contoso.com', 'Windows Server 2022', 'at_risk', 8, 'Primary Datacenter', 'Database Team', 'alice.smith@contoso.com', '["critical","database","production"]', 'non_compliant'),
('WEB-PROD-01', 'server', 'web_server', 'high', '10.0.3.30', 'web-prod-01.contoso.com', 'Ubuntu Server 22.04', 'secure', 3, 'DMZ', 'Web Team', 'bob.johnson@contoso.com', '["high","web_server","public_facing"]', 'compliant'),
('EXCHANGE-01', 'server', 'email_server', 'critical', '10.0.4.40', 'exchange-01.contoso.com', 'Windows Server 2019', 'vulnerable', 12, 'Primary Datacenter', 'Messaging Team', 'messaging@contoso.com', '["critical","email","exchange"]', 'non_compliant'),
('LAPTOP-CEO-01', 'endpoint', 'laptop', 'high', '10.0.10.100', 'laptop-ceo-01.contoso.com', 'Windows 11 Enterprise', 'secure', 1, 'Executive Floor', 'Executive', 'ceo@contoso.com', '["high","executive","mobile"]', 'compliant');

INSERT OR IGNORE INTO security_incidents (title, description, severity, status, category, affected_assets, detection_source, assigned_to, remediation_status, threat_indicators, business_impact) VALUES
('Potential Lateral Movement Detected', 'Suspicious PowerShell execution and network connections observed from SQL-PROD-02 attempting to access domain controllers.', 'critical', 'active', 'lateral_movement', '["SQL-PROD-02", "DC-PRIMARY-01"]', 'Microsoft Defender ATP', 'security@contoso.com', 'in_progress', '["powershell.exe", "net.exe", "mimikatz"]', 9),
('Ransomware Indicators on File Server', 'File system monitoring detected rapid encryption of files on FILESERVER-01.', 'critical', 'active', 'ransomware', '["FILESERVER-01"]', 'Microsoft Defender ATP', 'security@contoso.com', 'containment', '["vssadmin.exe", "wbadmin.exe", "conti.exe"]', 10),
('Phishing Campaign Targeting Executives', 'Coordinated spear-phishing emails targeting C-level executives.', 'high', 'investigating', 'phishing', '["LAPTOP-CEO-01"]', 'Microsoft Defender for Office 365', 'security@contoso.com', 'analysis', '["fake-microsoft-login.com"]', 8);

INSERT OR IGNORE INTO vulnerability_assessments (asset_id, cve_id, cvss_score, severity, title, description, category, patch_available, exploitability_score, business_impact_score, remediation_priority, exploitation_detected) VALUES
(2, 'CVE-2023-36884', 9.8, 'critical', 'Microsoft Office Remote Code Execution', 'A remote code execution vulnerability exists in Microsoft Office when it fails to properly handle objects in memory.', 'remote_code_execution', 1, 0.95, 0.90, 'immediate', 0),
(4, 'CVE-2023-23397', 9.8, 'critical', 'Microsoft Outlook Elevation of Privilege', 'An elevation of privilege vulnerability exists in Microsoft Outlook.', 'elevation_of_privilege', 1, 0.98, 0.95, 'immediate', 1),
(3, 'CVE-2023-4911', 7.8, 'high', 'GNU C Library Buffer Overflow', 'A buffer overflow vulnerability in GNU C library ld.so dynamic loader.', 'buffer_overflow', 1, 0.75, 0.70, 'high', 0);

INSERT OR IGNORE INTO threat_indicators (indicator_type, indicator_value, threat_type, confidence_score, severity, source_feeds, associated_malware, attack_patterns, description, tags) VALUES
('ip_address', '198.51.100.42', 'command_and_control', 0.95, 'critical', '["Microsoft Threat Intelligence", "VirusTotal"]', '["Cobalt Strike", "Metasploit"]', '["T1071.001", "T1090"]', 'Known C2 infrastructure used by APT41 group for lateral movement and data exfiltration.', '["apt41", "cobalt_strike", "active_threat"]'),
('domain', 'fake-microsoft-login.com', 'phishing', 0.92, 'high', '["PhishTank", "Microsoft Defender"]', '["Credential Harvester"]', '["T1566.002", "T1556.001"]', 'Credential harvesting site mimicking Microsoft Office 365 login page.', '["phishing", "credential_harvesting", "office365_spoof"]'),
('file_hash', 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456', 'ransomware', 0.98, 'critical', '["Mandiant", "CrowdStrike"]', '["Conti Ransomware"]', '["T1486", "T1490"]', 'Conti ransomware payload with advanced evasion techniques.', '["conti", "ransomware", "healthcare_targeting"]');

-- Update services with realistic data
UPDATE services SET 
  description = 'Enterprise SQL Server cluster hosting mission-critical applications and customer data with high availability configuration',
  criticality_level = 'critical',
  confidentiality_score = 5,
  integrity_score = 5,
  availability_score = 4,
  status = 'active'
WHERE name LIKE '%database%' OR name LIKE '%SQL%' LIMIT 1;

UPDATE services SET 
  description = 'Public-facing customer portal providing account management, billing, support ticketing, and product information access',
  criticality_level = 'high', 
  confidentiality_score = 4,
  integrity_score = 4,
  availability_score = 4,
  status = 'active'
WHERE name LIKE '%web%' OR name LIKE '%portal%' LIMIT 1;
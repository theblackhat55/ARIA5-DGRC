-- ================================================================
-- ARIA5.1 REALISTIC ENTERPRISE SEED DATA
-- Compatible with existing schema - realistic enterprise test data
-- ================================================================

-- Clear existing test data (keep essential records)
DELETE FROM incidents WHERE id > 1;
DELETE FROM vulnerabilities WHERE id > 1; 
DELETE FROM threat_indicators WHERE id > 1;
DELETE FROM assets WHERE id > 1;
DELETE FROM dynamic_risks WHERE id > 5;
DELETE FROM service_risks WHERE risk_id > 5;

-- ================================================================
-- REALISTIC ENTERPRISE ASSETS (Microsoft Defender style)
-- ================================================================
INSERT OR IGNORE INTO assets (name, description, asset_type, criticality, status) VALUES 

-- Critical Infrastructure 
('DC-PRIMARY-01', 'Primary Active Directory Domain Controller - Windows Server 2022 with 5000+ user accounts and GPOs', 'server', 'Critical', 'active'),
('SQL-PROD-CLUSTER', 'Production SQL Server Always-On Cluster - hosting 847 databases including financial and customer data', 'server', 'Critical', 'active'),
('EXCHANGE-HYBRID-01', 'Microsoft Exchange Server 2019 - hybrid configuration serving 5000+ mailboxes', 'server', 'Critical', 'at_risk'),
('FW-PERIMETER-MAIN', 'Palo Alto PA-5220 Perimeter Firewall - processing 2.8M sessions daily', 'network_device', 'Critical', 'active'),

-- High Priority Infrastructure
('WEB-CLUSTER-PROD', 'Production Web Server Cluster - 4 nodes serving customer portal (50K+ daily users)', 'server', 'High', 'active'),
('LB-F5-PRIMARY', 'F5 BIG-IP Load Balancer - distributing 2.3M requests daily to web tier', 'network_device', 'High', 'active'),
('SIEM-SPLUNK-01', 'Splunk Enterprise SIEM - ingesting 15K events/sec from 2500+ sources', 'server', 'High', 'active'),
('BACKUP-VEEAM-01', 'Veeam Backup & Replication Server - managing 247TB of backup data', 'server', 'High', 'active'),

-- Cloud Infrastructure
('AZURE-PROD-RG', 'Azure Production Resource Group - 127 VMs, 34 databases, 12 web apps', 'cloud_resource', 'High', 'active'), 
('AWS-S3-BACKUPS', 'AWS S3 Backup Storage - 534TB of encrypted backup data across 3 regions', 'cloud_resource', 'Medium', 'active'),
('OFFICE365-TENANT', 'Microsoft 365 Tenant - 5000 users, Teams, SharePoint, OneDrive', 'cloud_resource', 'High', 'active'),

-- User Endpoints (Sample)
('LAPTOP-EXEC-POOL', 'Executive Laptop Pool - 25 Windows 11 Enterprise devices for C-level staff', 'endpoint', 'High', 'active'),
('DEV-WORKSTATIONS', 'Development Workstation Pool - 89 high-spec workstations for engineering team', 'endpoint', 'Medium', 'active'),
('BYOD-MOBILE-FLEET', 'BYOD Mobile Device Fleet - 1200+ managed iOS/Android devices', 'endpoint', 'Medium', 'monitored');

-- ================================================================
-- SECURITY INCIDENTS (Microsoft Defender ATP style)
-- ================================================================
INSERT OR IGNORE INTO incidents (title, description, severity, status, asset_id, incident_type) VALUES

-- Critical Active Incidents
('APT-Like Lateral Movement Campaign', 'Advanced persistent threat indicators detected: PowerShell empire modules, credential dumping (mimikatz signatures), and WMI lateral movement across 15 domain controllers and file servers. Timeline spans 72 hours with evidence of data staging for exfiltration.', 'Critical', 'Active', 1, 'security_breach'),

('Conti Ransomware Deployment Detected', 'Ransomware execution detected on FILESERVER-03 with rapid file encryption (15,420 files affected). Shadow copy deletion, backup service disruption, and ransom note deployment confirmed. Immediate containment enacted.', 'Critical', 'Contained', 8, 'ransomware'),

('Supply Chain Compromise - SolarWinds Style', 'Backdoored software update detected in production environment affecting monitoring infrastructure. SUNBURST-like beacon behavior to command and control servers observed from 8 systems.', 'Critical', 'Investigating', 7, 'supply_chain_attack'),

-- High Priority Incidents  
('Executive Spear Phishing Campaign', 'Coordinated spear-phishing targeting C-suite executives using fake Microsoft 365 security alerts. 4 of 12 targets clicked malicious links. Credential harvesting attempts and MFA bypass detected.', 'High', 'Investigating', 12, 'phishing'),

('Insider Threat - Privilege Abuse', 'Database administrator account (DBA-THOMPSON) accessed 23 sensitive customer databases outside normal hours using administrative tools. 2.3M customer records queried and exported to personal cloud storage.', 'High', 'Under_Review', 2, 'insider_threat'),

('Cloud Cryptojacking Operation', 'Unauthorized cryptocurrency mining containers deployed in Azure Kubernetes cluster. 47 mining pods consuming $23,000/month in compute resources. Initial access via compromised service principal.', 'Medium', 'Mitigated', 9, 'cryptojacking');

-- ================================================================  
-- VULNERABILITIES (Defender Vulnerability Management style)
-- ================================================================
INSERT OR IGNORE INTO vulnerabilities (asset_id, cve_id, cvss_score, severity, status, title, description) VALUES

-- Critical Vulnerabilities (actively exploited)
(1, 'CVE-2023-36884', 9.8, 'Critical', 'Open', 'Microsoft Office RCE - Zero-Click Exploitation', 'Remote code execution via specially crafted Office documents. Active exploitation detected in the wild by APT28 and APT29 groups. Affects all Office versions prior to security update.'),

(3, 'CVE-2023-23397', 9.8, 'Critical', 'Open', 'Microsoft Outlook NTLM Relay Attack', 'Elevation of privilege vulnerability allowing NTLM credential theft via malformed calendar invitations. Exploited by Russian state-sponsored actors since March 2023.'),

(2, 'CVE-2023-34362', 9.8, 'Critical', 'Patching', 'MOVEit Transfer SQL Injection', 'SQL injection vulnerability in MOVEit Transfer leading to unauthorized file access and data exfiltration. Exploited by Cl0p ransomware group affecting 600+ organizations globally.'),

-- High Severity Vulnerabilities  
(4, 'CVE-2023-38545', 7.5, 'High', 'Open', 'curl SOCKS5 Heap Buffer Overflow', 'Heap buffer overflow in curl SOCKS5 proxy handshake could lead to remote code execution. Present in curl versions 7.69.0 to 8.3.0 used by multiple applications.'),

(5, 'CVE-2023-4863', 8.8, 'High', 'Mitigated', 'libwebp Buffer Overflow (WebP 0-Day)', 'Heap buffer overflow in WebP image processing library. Exploited via malicious images in web browsers and messaging applications. Affects Chrome, Firefox, and Android.'),

(6, 'CVE-2023-36802', 7.8, 'High', 'Open', 'Microsoft Streaming Service Proxy LPE', 'Local privilege escalation in Windows Streaming Service Proxy. Allows standard users to gain SYSTEM privileges via DLL hijacking. Affects Windows 10/11 and Server 2019/2022.'),

-- Medium Severity Vulnerabilities
(7, 'CVE-2023-36049', 5.9, 'Medium', 'Scheduled', '.NET Denial of Service', 'Denial of service vulnerability in .NET Framework and .NET when processing malformed X.509 certificates. Could cause application crashes in certificate validation scenarios.'),

(11, 'CVE-2023-5217', 6.5, 'Medium', 'Open', 'libvpx VP8 Buffer Overflow', 'Buffer overflow in VP8 video codec implementation could lead to heap corruption. Affects video processing in browsers and multimedia applications.'),

(13, 'CVE-2023-44487', 7.5, 'Medium', 'Mitigated', 'HTTP/2 Rapid Reset Attack', 'HTTP/2 protocol vulnerability allowing denial of service via rapid stream reset attacks. Affects web servers and load balancers with HTTP/2 support.');

-- ================================================================
-- THREAT INTELLIGENCE INDICATORS (Enterprise threat feeds)
-- ================================================================  
INSERT OR IGNORE INTO threat_indicators (indicator_type, indicator_value, threat_type, confidence_level, severity, source, description) VALUES

-- Active C2 Infrastructure  
('ip_address', '198.51.100.42', 'command_and_control', 'High', 'Critical', 'Microsoft Threat Intelligence', 'APT41 command and control server hosting Cobalt Strike beacons. Active since 2024-01-10. Associated with financial services targeting campaign.'),

('domain', 'secure-update-microsoft.net', 'phishing', 'High', 'Critical', 'PhishTank + Microsoft Defender', 'Typosquatting domain hosting fake Microsoft security update pages. Used in spear-phishing campaigns targeting IT administrators.'),

('file_hash', 'SHA256:f2ca1bb6c7e907d06dafe4687d2e37d7', 'malware', 'Very High', 'Critical', 'Mandiant + CrowdStrike', 'Conti ransomware payload with process hollowing and anti-VM detection. Compiled 2024-01-12, detected in 23 organizations.'),

-- Nation State Indicators (APT Groups)
('ip_address', '203.0.113.50', 'reconnaissance', 'High', 'High', 'US-CERT + CISA', 'Lazarus Group (APT38) infrastructure scanning for Exchange vulnerabilities (CVE-2023-23397). Active reconnaissance against financial sector.'),

('domain', 'govt-contractor-portal.org', 'espionage', 'Very High', 'Critical', 'NSA Cybersecurity Advisory', 'APT29 (Cozy Bear) command domain mimicking legitimate government contractor portal. Used in supply chain attacks against defense contractors.'),

('url', 'https://teamviewer-update.org/download/patch.exe', 'malware_distribution', 'High', 'High', 'Hybrid Analysis + VirusTotal', 'Fake TeamViewer update hosting SUNBURST-variant backdoor. Targets remote access software users in corporate environments.'),

-- Commodity Malware & Botnets
('ip_address', '192.0.2.100', 'botnet', 'Medium', 'Medium', 'Spamhaus + Abuse.ch', 'Emotet botnet command server (epoch 5). Distributing TrickBot and Cobalt Strike payloads via spam campaigns targeting healthcare sector.'),

('domain', 'office365-security-alert.com', 'phishing', 'High', 'High', 'Anti-Phishing Working Group', 'Business email compromise (BEC) domain spoofing Microsoft security alerts. Used in CEO fraud schemes targeting finance departments.'),

('file_hash', 'SHA256:e3b0c44298fc1c149afbf4c8996fb924', 'trojan', 'High', 'High', 'Malware Bazaar', 'Qakbot banking trojan (version 404.85) with advanced evasion. Drops Cobalt Strike for post-exploitation activities.'),

-- IoT & Infrastructure Threats  
('ip_address', '172.16.0.55', 'iot_exploitation', 'Medium', 'Medium', 'Shodan + GreyNoise', 'Mirai botnet variant targeting Hikvision cameras with default credentials. Used in DDoS attacks against critical infrastructure.'),

('domain', 'firmware-update-cisco.net', 'supply_chain_attack', 'High', 'High', 'Cisco Talos Intelligence', 'Fake Cisco firmware update site distributing modified router firmware with persistent backdoors. Targets network infrastructure.'),

-- Vulnerability Exploitation
('ip_address', '198.51.100.89', 'vulnerability_exploitation', 'High', 'High', 'Shadowserver Foundation', 'Mass exploitation of MOVEit Transfer servers (CVE-2023-34362). Cl0p ransomware group data theft operations against managed file transfer services.');

-- ================================================================
-- DYNAMIC RISKS (Based on current threat landscape)
-- ================================================================
INSERT OR IGNORE INTO dynamic_risks (title, description, category, probability, impact, confidence_score, source, organization_id) VALUES

-- Active Campaign Risks
('APT41 Financial Sector Campaign', 'Ongoing sophisticated campaign by APT41 (Chinese state-sponsored group) targeting financial institutions using zero-day exploits in Microsoft Office and custom malware. High probability of lateral movement and data exfiltration if initial compromise occurs.', 'nation_state_threat', 4, 5, 0.92, 'threat_intelligence', 1),

('Cl0p Ransomware MOVEit Exploitation', 'Active exploitation of MOVEit Transfer vulnerability (CVE-2023-34362) by Cl0p ransomware operators. Mass data theft campaign affecting managed file transfer services globally with public leak threats.', 'ransomware', 5, 4, 0.95, 'vulnerability_analysis', 1), 

('Microsoft Exchange Zero-Day Campaign', 'Exploitation of CVE-2023-23397 (Outlook NTLM relay) by multiple threat actors including APT28 and APT29. Credential theft and lateral movement targeting organizations with hybrid Exchange deployments.', 'vulnerability_exploitation', 4, 4, 0.88, 'threat_intelligence', 1),

-- Emerging Threat Patterns  
('Supply Chain Backdoor Risk', 'Increased supply chain attacks targeting software update mechanisms following SolarWinds pattern. Threat actors compromising legitimate software vendors to distribute backdoored updates to enterprise customers.', 'supply_chain_attack', 3, 5, 0.75, 'threat_pattern_analysis', 1),

('Cloud Infrastructure Cryptojacking', 'Persistent unauthorized cryptocurrency mining in cloud environments through compromised service principals and container orchestration platforms. Resource theft and potential data access via elevated privileges.', 'cloud_threat', 4, 3, 0.82, 'cloud_security_analysis', 1),

('AI-Enhanced Social Engineering', 'Sophisticated phishing and business email compromise campaigns using AI-generated content, voice cloning, and deepfake technologies to target executives and finance personnel with unprecedented success rates.', 'social_engineering', 3, 4, 0.70, 'behavioral_analysis', 1),

-- Insider Threat Patterns
('Privileged Access Abuse', 'Database administrators and system administrators accessing sensitive data outside business hours and normal job functions. Pattern indicates potential insider threat or compromised privileged accounts.', 'insider_threat', 3, 4, 0.65, 'behavioral_monitoring', 1),

('Shadow IT Cloud Services', 'Unauthorized cloud services and SaaS applications used by business units without IT approval. Creates data exfiltration risks and compliance violations with limited visibility and control.', 'shadow_it', 4, 3, 0.78, 'cloud_discovery', 1);

-- ================================================================
-- LINK RISKS TO SERVICES (Service-centric risk model)
-- ================================================================
INSERT OR IGNORE INTO service_risks (service_id, risk_id, weight) VALUES
-- Link APT41 campaign to critical services
(1, (SELECT id FROM dynamic_risks WHERE title LIKE 'APT41%' LIMIT 1), 0.9),  -- Active Directory
(2, (SELECT id FROM dynamic_risks WHERE title LIKE 'APT41%' LIMIT 1), 0.8),  -- Database services

-- Link Exchange vulnerability to email services  
(1, (SELECT id FROM dynamic_risks WHERE title LIKE '%Exchange Zero-Day%' LIMIT 1), 0.95),

-- Link cloud threats to cloud services
(1, (SELECT id FROM dynamic_risks WHERE title LIKE '%Cloud Infrastructure%' LIMIT 1), 0.7),
(2, (SELECT id FROM dynamic_risks WHERE title LIKE '%Cloud Infrastructure%' LIMIT 1), 0.6),

-- Link insider threats to data services
(2, (SELECT id FROM dynamic_risks WHERE title LIKE 'Privileged Access%' LIMIT 1), 0.85),
(1, (SELECT id FROM dynamic_risks WHERE title LIKE 'Shadow IT%' LIMIT 1), 0.6);

-- ================================================================
-- UPDATE SYSTEM METRICS WITH REALISTIC VALUES  
-- ================================================================
INSERT OR REPLACE INTO system_config (key, value, description) VALUES
('total_assets_monitored', '2847', 'Total assets under security monitoring'),
('active_threats_detected', '156', 'Active threats detected in last 30 days'),
('critical_vulnerabilities', '23', 'Critical vulnerabilities requiring immediate attention'),  
('threat_intelligence_feeds', '847', 'Threat intelligence indicators processed daily'),
('security_incidents_30d', '89', 'Security incidents in last 30 days'),
('automation_coverage', '73.2', 'Percentage of security processes automated'),
('mean_time_to_detect', '4.7', 'Average hours to detect security incidents'),
('mean_time_to_respond', '2.3', 'Average hours to respond to critical incidents'),
('compliance_score', '87.4', 'Overall compliance posture score (percentage)'),
('risk_appetite_threshold', '15', 'Maximum acceptable risk score threshold');

-- ================================================================
-- SUMMARY REPORT
-- ================================================================
SELECT 'ENTERPRISE SEED DATA DEPLOYMENT SUMMARY:' as status;
SELECT COUNT(*) as 'Total Assets' FROM assets;
SELECT COUNT(*) as 'Security Incidents' FROM incidents;  
SELECT COUNT(*) as 'Vulnerabilities' FROM vulnerabilities;
SELECT COUNT(*) as 'Threat Indicators' FROM threat_indicators;
SELECT COUNT(*) as 'Dynamic Risks' FROM dynamic_risks;
SELECT COUNT(*) as 'Services' FROM services;
SELECT COUNT(*) as 'Service-Risk Links' FROM service_risks;

SELECT 'CRITICAL METRICS:' as metrics;
SELECT 
  (SELECT COUNT(*) FROM vulnerabilities WHERE severity = 'Critical') as 'Critical Vulns',
  (SELECT COUNT(*) FROM incidents WHERE severity = 'Critical') as 'Critical Incidents',
  (SELECT COUNT(*) FROM threat_indicators WHERE severity = 'Critical') as 'Critical Threats',
  (SELECT COUNT(*) FROM assets WHERE criticality = 'Critical') as 'Critical Assets';
-- ================================================================
-- ARIA5.1 COMPREHENSIVE ENTERPRISE SEED DATA
-- Realistic data simulating Microsoft Defender, ServiceNow, and Threat Intelligence
-- ================================================================

-- Clear existing test data (for clean testing)
DELETE FROM audit_logs WHERE id > 0;
DELETE FROM integration_events WHERE id > 0;
DELETE FROM enterprise_integrations WHERE id > 0;
DELETE FROM threat_indicators WHERE id > 0;
DELETE FROM vulnerability_assessments WHERE id > 0;
DELETE FROM security_incidents WHERE id > 0;
DELETE FROM business_assets WHERE id > 0;
DELETE FROM service_dependencies WHERE id > 0;
DELETE FROM service_risks WHERE id > 0;
DELETE FROM risks WHERE id > 2; -- Keep demo risks
DELETE FROM services WHERE id > 2; -- Keep demo services

-- ================================================================
-- MICROSOFT DEFENDER STYLE ASSETS & SECURITY DATA
-- ================================================================

-- Business Assets (Defender-style device/server inventory)
INSERT INTO business_assets (name, type, category, criticality_level, ip_address, hostname, operating_system, last_seen, security_posture, vulnerability_count, location, department, owner_contact, asset_tags, compliance_status) VALUES

-- Critical Infrastructure
('DC-PRIMARY-01', 'server', 'domain_controller', 'critical', '10.0.1.10', 'dc-primary-01.contoso.com', 'Windows Server 2022', datetime('now', '-2 hours'), 'secure', 2, 'Primary Datacenter', 'IT Infrastructure', 'john.doe@contoso.com', '["critical","domain_controller","tier0"]', 'compliant'),
('DC-SECONDARY-01', 'server', 'domain_controller', 'critical', '10.0.1.11', 'dc-secondary-01.contoso.com', 'Windows Server 2022', datetime('now', '-1 hour'), 'secure', 1, 'Secondary Datacenter', 'IT Infrastructure', 'john.doe@contoso.com', '["critical","domain_controller","tier0"]', 'compliant'),
('SQL-PROD-01', 'server', 'database', 'critical', '10.0.2.20', 'sql-prod-01.contoso.com', 'Windows Server 2022', datetime('now', '-30 minutes'), 'at_risk', 8, 'Primary Datacenter', 'Database Team', 'alice.smith@contoso.com', '["critical","database","production"]', 'non_compliant'),
('SQL-PROD-02', 'server', 'database', 'critical', '10.0.2.21', 'sql-prod-02.contoso.com', 'Windows Server 2019', datetime('now', '-45 minutes'), 'vulnerable', 15, 'Primary Datacenter', 'Database Team', 'alice.smith@contoso.com', '["critical","database","production","legacy"]', 'non_compliant'),

-- Web Infrastructure
('WEB-PROD-01', 'server', 'web_server', 'high', '10.0.3.30', 'web-prod-01.contoso.com', 'Ubuntu Server 22.04', datetime('now', '-15 minutes'), 'secure', 3, 'DMZ', 'Web Team', 'bob.johnson@contoso.com', '["high","web_server","public_facing"]', 'compliant'),
('WEB-PROD-02', 'server', 'web_server', 'high', '10.0.3.31', 'web-prod-02.contoso.com', 'Ubuntu Server 20.04', datetime('now', '-20 minutes'), 'at_risk', 7, 'DMZ', 'Web Team', 'bob.johnson@contoso.com', '["high","web_server","public_facing","legacy"]', 'under_review'),
('LB-PROD-01', 'network_device', 'load_balancer', 'high', '10.0.3.10', 'lb-prod-01.contoso.com', 'F5 BIG-IP', datetime('now', '-10 minutes'), 'secure', 1, 'DMZ', 'Network Team', 'network@contoso.com', '["high","load_balancer","public_facing"]', 'compliant'),

-- Email & Communication
('EXCHANGE-01', 'server', 'email_server', 'critical', '10.0.4.40', 'exchange-01.contoso.com', 'Windows Server 2019', datetime('now', '-25 minutes'), 'vulnerable', 12, 'Primary Datacenter', 'Messaging Team', 'messaging@contoso.com', '["critical","email","exchange"]', 'non_compliant'),
('TEAMS-SFB-01', 'server', 'collaboration', 'high', '10.0.4.45', 'teams-sfb-01.contoso.com', 'Windows Server 2022', datetime('now', '-35 minutes'), 'secure', 2, 'Primary Datacenter', 'Messaging Team', 'messaging@contoso.com', '["high","teams","collaboration"]', 'compliant'),

-- Security Infrastructure  
('SIEM-PRIMARY', 'server', 'security_tool', 'critical', '10.0.5.50', 'siem-primary.contoso.com', 'CentOS 8', datetime('now', '-5 minutes'), 'secure', 1, 'Security SOC', 'Security Team', 'security@contoso.com', '["critical","siem","security_monitoring"]', 'compliant'),
('FW-PERIMETER-01', 'network_device', 'firewall', 'critical', '203.0.113.1', 'fw-perimeter-01.contoso.com', 'Palo Alto PAN-OS 11.0', datetime('now', '-40 minutes'), 'secure', 0, 'Perimeter', 'Security Team', 'security@contoso.com', '["critical","firewall","perimeter"]', 'compliant'),
('IDS-01', 'server', 'security_tool', 'high', '10.0.5.55', 'ids-01.contoso.com', 'Ubuntu Server 22.04', datetime('now', '-50 minutes'), 'secure', 2, 'Security SOC', 'Security Team', 'security@contoso.com', '["high","ids","security_monitoring"]', 'compliant'),

-- User Endpoints (Sample)
('LAPTOP-CEO-01', 'endpoint', 'laptop', 'high', '10.0.10.100', 'laptop-ceo-01.contoso.com', 'Windows 11 Enterprise', datetime('now', '-1 hour'), 'secure', 1, 'Executive Floor', 'Executive', 'ceo@contoso.com', '["high","executive","mobile"]', 'compliant'),
('LAPTOP-DEV-15', 'endpoint', 'laptop', 'medium', '10.0.12.115', 'laptop-dev-15.contoso.com', 'macOS Ventura 13.6', datetime('now', '-3 hours'), 'at_risk', 5, 'Development Floor', 'Engineering', 'dev15@contoso.com', '["medium","development","byod"]', 'under_review'),
('WS-FINANCE-08', 'endpoint', 'workstation', 'medium', '10.0.11.108', 'ws-finance-08.contoso.com', 'Windows 11 Pro', datetime('now', '-2 hours'), 'secure', 2, 'Finance Floor', 'Finance', 'finance08@contoso.com', '["medium","finance","workstation"]', 'compliant'),

-- Cloud Infrastructure
('AZ-VM-WEB-01', 'cloud_resource', 'virtual_machine', 'high', '52.224.15.101', 'az-vm-web-01.contoso.com', 'Ubuntu Server 22.04', datetime('now', '-30 minutes'), 'secure', 1, 'Azure East US 2', 'Cloud Team', 'cloud@contoso.com', '["high","azure","public_cloud"]', 'compliant'),
('AZ-SQL-DB-PROD', 'cloud_resource', 'database', 'critical', 'contoso-sql.database.windows.net', 'contoso-sql-prod', 'Azure SQL Database', datetime('now', '-15 minutes'), 'secure', 0, 'Azure East US 2', 'Cloud Team', 'cloud@contoso.com', '["critical","azure","managed_service"]', 'compliant'),
('AWS-S3-BACKUPS', 'cloud_resource', 'storage', 'high', 'contoso-backups.s3.amazonaws.com', 'contoso-backups-bucket', 'Amazon S3', datetime('now', '-1 hour'), 'secure', 0, 'AWS US-East-1', 'Cloud Team', 'cloud@contoso.com', '["high","aws","backup_storage"]', 'compliant');

-- ================================================================
-- SECURITY INCIDENTS (Defender-style alerts and incidents)
-- ================================================================

INSERT INTO security_incidents (title, description, severity, status, category, affected_assets, detection_source, assigned_to, remediation_status, timeline_data, threat_indicators, business_impact) VALUES

-- Critical Active Incidents
('Potential Lateral Movement Detected', 'Suspicious PowerShell execution and network connections observed from SQL-PROD-02 attempting to access domain controllers. Multiple failed authentication attempts detected.', 'critical', 'active', 'lateral_movement', '["SQL-PROD-02", "DC-PRIMARY-01", "DC-SECONDARY-01"]', 'Microsoft Defender ATP', 'security@contoso.com', 'in_progress', '{"detection_time": "2024-01-15T14:30:00Z", "first_seen": "2024-01-15T14:25:00Z", "last_activity": "2024-01-15T15:45:00Z"}', '["powershell.exe", "net.exe", "mimikatz", "10.0.2.21", "krbtgt"]', 9),

('Ransomware Indicators on File Server', 'File system monitoring detected rapid encryption of files on FILESERVER-01. Shadow copy deletion and suspicious process behavior observed.', 'critical', 'active', 'ransomware', '["FILESERVER-01", "BACKUP-SRV-01"]', 'Microsoft Defender ATP', 'security@contoso.com', 'containment', '{"detection_time": "2024-01-15T16:15:00Z", "files_affected": 15420, "shadow_copies_deleted": true}', '["vssadmin.exe", "wbadmin.exe", "conti.exe", ".encrypted", "ransom_note.txt"]', 10),

-- High Priority Incidents  
('Phishing Campaign Targeting Executives', 'Coordinated spear-phishing emails targeting C-level executives. Multiple clicks on malicious links detected. Credential harvesting attempt identified.', 'high', 'investigating', 'phishing', '["LAPTOP-CEO-01", "LAPTOP-CFO-01", "LAPTOP-CTO-01"]', 'Microsoft Defender for Office 365', 'security@contoso.com', 'analysis', '{"campaign_start": "2024-01-15T09:00:00Z", "emails_sent": 12, "clicks_detected": 4}', '["fake-microsoft-login.com", "credential-harvester.php", "executive@fakeco.com"]', 8),

('Vulnerability Exploitation Attempt', 'Active exploitation attempts detected against Exchange Server CVE-2023-23397. Multiple external IP addresses attempting to exploit vulnerability.', 'high', 'active', 'vulnerability_exploitation', '["EXCHANGE-01"]', 'Microsoft Defender ATP', 'security@contoso.com', 'patching', '{"cve_id": "CVE-2023-23397", "exploit_attempts": 47, "source_countries": ["CN", "RU", "KP"]}', '["CVE-2023-23397", "outlook.exe", "ntlm_relay", "203.0.113.50"]', 7),

-- Medium Priority Incidents
('Suspicious Network Traffic to Known Bad IPs', 'Workstation WS-FINANCE-08 communicating with known malicious IP addresses. Possible malware infection or data exfiltration.', 'medium', 'investigating', 'network_anomaly', '["WS-FINANCE-08"]', 'Network IDS', 'security@contoso.com', 'analysis', '{"suspicious_connections": 23, "data_transferred": "15.7 MB", "duration": "2 hours"}', '["198.51.100.42", "tor_exit_node", "suspicious_dns_queries"]', 5),

('Privilege Escalation Attempt', 'User account DEV15 attempting to access administrative shares and execute elevated commands. Potential insider threat or compromised account.', 'medium', 'investigating', 'privilege_escalation', '["LAPTOP-DEV-15", "DC-PRIMARY-01"]', 'Microsoft Defender ATP', 'security@contoso.com', 'monitoring', '{"failed_attempts": 15, "targeted_shares": ["admin$", "c$", "sysvol"]}', '["net_use", "psexec", "dev15@contoso.com", "privilege_escalation"]', 6);

-- ================================================================
-- VULNERABILITY ASSESSMENTS (Defender Vulnerability Management style)
-- ================================================================

INSERT INTO vulnerability_assessments (asset_id, cve_id, cvss_score, severity, title, description, category, discovery_date, patch_available, patch_complexity, exploitability_score, business_impact_score, remediation_priority, vendor_advisory_url, exploitation_detected) VALUES

-- Critical Vulnerabilities
((SELECT id FROM business_assets WHERE hostname = 'sql-prod-02.contoso.com'), 'CVE-2023-36884', 9.8, 'critical', 'Microsoft Office Remote Code Execution', 'A remote code execution vulnerability exists in Microsoft Office when it fails to properly handle objects in memory. An attacker could exploit this by sending a specially crafted file.', 'remote_code_execution', datetime('now', '-5 days'), TRUE, 'medium', 0.95, 0.90, 'immediate', 'https://msrc.microsoft.com/update-guide/en-US/vulnerability/CVE-2023-36884', FALSE),

((SELECT id FROM business_assets WHERE hostname = 'sql-prod-02.contoso.com'), 'CVE-2023-35384', 9.0, 'critical', 'Windows HTML Platform Security Feature Bypass', 'A security feature bypass vulnerability exists in the Windows HTML Platform when it fails to properly validate input.', 'security_bypass', datetime('now', '-8 days'), TRUE, 'low', 0.85, 0.85, 'immediate', 'https://msrc.microsoft.com/update-guide/en-US/vulnerability/CVE-2023-35384', FALSE),

((SELECT id FROM business_assets WHERE hostname = 'exchange-01.contoso.com'), 'CVE-2023-23397', 9.8, 'critical', 'Microsoft Outlook Elevation of Privilege', 'An elevation of privilege vulnerability exists in Microsoft Outlook when Outlook does not properly validate AppendOLEInfo data.', 'elevation_of_privilege', datetime('now', '-12 days'), TRUE, 'high', 0.98, 0.95, 'immediate', 'https://msrc.microsoft.com/update-guide/en-US/vulnerability/CVE-2023-23397', TRUE),

-- High Vulnerabilities
((SELECT id FROM business_assets WHERE hostname = 'web-prod-02.contoso.com'), 'CVE-2023-4911', 7.8, 'high', 'GNU C Library Buffer Overflow', 'A buffer overflow vulnerability in GNU C library ld.so dynamic loader could allow local privilege escalation.', 'buffer_overflow', datetime('now', '-3 days'), TRUE, 'medium', 0.75, 0.70, 'high', 'https://nvd.nist.gov/vuln/detail/CVE-2023-4911', FALSE),

((SELECT id FROM business_assets WHERE hostname = 'web-prod-01.contoso.com'), 'CVE-2023-32233', 7.4, 'high', 'Linux Kernel Use After Free', 'A use-after-free vulnerability in the Linux kernel netfilter subsystem could lead to local privilege escalation.', 'use_after_free', datetime('now', '-6 days'), TRUE, 'low', 0.65, 0.60, 'high', 'https://nvd.nist.gov/vuln/detail/CVE-2023-32233', FALSE),

((SELECT id FROM business_assets WHERE hostname = 'laptop-dev-15.contoso.com'), 'CVE-2023-40477', 6.5, 'medium', 'macOS Kernel Information Disclosure', 'An information disclosure vulnerability exists in the macOS kernel that could allow an attacker to read sensitive information.', 'information_disclosure', datetime('now', '-4 days'), TRUE, 'low', 0.45, 0.40, 'medium', 'https://support.apple.com/en-us/HT213940', FALSE),

-- Medium Vulnerabilities
((SELECT id FROM business_assets WHERE hostname = 'ws-finance-08.contoso.com'), 'CVE-2023-36563', 5.3, 'medium', 'Microsoft WordPad Information Disclosure', 'An information disclosure vulnerability exists in Microsoft WordPad when it fails to properly handle objects in memory.', 'information_disclosure', datetime('now', '-2 days'), TRUE, 'low', 0.35, 0.30, 'medium', 'https://msrc.microsoft.com/update-guide/en-US/vulnerability/CVE-2023-36563', FALSE),

((SELECT id FROM business_assets WHERE hostname = 'laptop-ceo-01.contoso.com'), 'CVE-2023-36049', 4.3, 'low', 'Microsoft .NET Denial of Service', 'A denial of service vulnerability exists in Microsoft .NET when it fails to properly handle web requests.', 'denial_of_service', datetime('now', '-1 day'), TRUE, 'low', 0.25, 0.20, 'low', 'https://msrc.microsoft.com/update-guide/en-US/vulnerability/CVE-2023-36049', FALSE);

-- ================================================================
-- SERVICENOW STYLE SERVICES WITH ITIL PARAMETERS
-- ================================================================

INSERT INTO services (name, description, criticality_level, confidentiality_score, integrity_score, availability_score, owner_id, service_type, business_function, technical_owner, business_owner, service_level, operating_hours, recovery_time_objective, recovery_point_objective, annual_revenue_impact, downtime_cost_per_hour, compliance_requirements, dependencies, monitoring_url, health_check_url, documentation_url, incident_count_30d, availability_percentage, performance_baseline) VALUES

-- Tier 0 - Mission Critical Services
('Active Directory Domain Services', 'Enterprise identity and authentication service providing centralized user management, authentication, and authorization for all corporate resources.', 'critical', 5, 5, 5, 1, 'infrastructure', 'identity_management', 'john.doe@contoso.com', 'it-director@contoso.com', 'tier_0', '24x7x365', 15, 5, 50000000, 125000, '["SOX","SOC2","ISO27001"]', '["DNS","DHCP","PKI"]', 'https://monitor.contoso.com/ad', 'https://dc-primary-01.contoso.com/health', 'https://docs.contoso.com/ad', 2, 99.95, '{"response_time_ms": 45, "cpu_utilization": 25, "memory_utilization": 40}'),

('Primary Database Cluster', 'Mission-critical SQL Server cluster hosting enterprise applications, financial systems, and customer data with high availability configuration.', 'critical', 5, 5, 4, 1, 'database', 'data_management', 'alice.smith@contoso.com', 'cto@contoso.com', 'tier_0', '24x7x365', 30, 15, 75000000, 200000, '["SOX","PCI-DSS","GDPR","SOC2"]', '["ActiveDirectory","BackupServices","NetworkStorage"]', 'https://monitor.contoso.com/sql', 'https://sql-prod-01.contoso.com/health', 'https://docs.contoso.com/database', 5, 99.87, '{"response_time_ms": 120, "cpu_utilization": 65, "memory_utilization": 75, "disk_io": 850}'),

('Email and Collaboration Platform', 'Microsoft Exchange and Teams integration providing enterprise email, calendaring, and unified communications for 5000+ users.', 'critical', 4, 4, 5, 1, 'communication', 'business_communication', 'messaging@contoso.com', 'cio@contoso.com', 'tier_0', '24x7x365', 60, 30, 25000000, 85000, '["SOC2","ISO27001","HIPAA"]', '["ActiveDirectory","NetworkServices","Office365"]', 'https://monitor.contoso.com/exchange', 'https://exchange-01.contoso.com/health', 'https://docs.contoso.com/email', 8, 99.92, '{"mailbox_response_ms": 200, "message_delivery_time_s": 15, "calendar_sync_time_s": 30}'),

-- Tier 1 - Business Critical Services  
('Customer Portal Web Application', 'Public-facing customer portal providing account management, billing, support ticketing, and product information access.', 'high', 4, 4, 4, 2, 'web_application', 'customer_service', 'bob.johnson@contoso.com', 'customer-success@contoso.com', 'tier_1', '24x7x365', 120, 60, 15000000, 45000, '["PCI-DSS","SOC2","GDPR"]', '["DatabaseCluster","CDN","PaymentGateway"]', 'https://monitor.contoso.com/portal', 'https://portal.contoso.com/api/health', 'https://docs.contoso.com/portal', 12, 99.85, '{"page_load_time_ms": 1200, "api_response_time_ms": 300, "concurrent_users": 2500}'),

('Financial ERP System', 'SAP-based enterprise resource planning system managing accounting, procurement, payroll, and financial reporting functions.', 'high', 5, 5, 3, 2, 'enterprise_application', 'financial_management', 'erp-admin@contoso.com', 'cfo@contoso.com', 'tier_1', '6am-10pm Mon-Fri, 8am-6pm Weekends', 240, 120, 30000000, 75000, '["SOX","SOC2","ISO27001","GAAP"]', '["DatabaseCluster","ActiveDirectory","BackupServices"]', 'https://monitor.contoso.com/sap', 'https://erp.contoso.com/health', 'https://docs.contoso.com/erp', 3, 99.78, '{"transaction_time_ms": 800, "report_generation_time_s": 45, "concurrent_sessions": 500}'),

('Network Infrastructure Services', 'Core networking services including DNS, DHCP, load balancing, and firewall management ensuring enterprise connectivity.', 'high', 3, 4, 5, 1, 'network', 'network_infrastructure', 'network@contoso.com', 'infrastructure-manager@contoso.com', 'tier_1', '24x7x365', 30, 0, 10000000, 95000, '["SOC2","ISO27001"]', '["PowerSystems","CoolingSystem","ISPConnections"]', 'https://monitor.contoso.com/network', 'https://fw-perimeter-01.contoso.com/health', 'https://docs.contoso.com/network', 4, 99.96, '{"dns_resolution_time_ms": 25, "dhcp_lease_time_s": 2, "firewall_throughput_gbps": 8.5}'),

-- Tier 2 - Important Services
('Human Resources Information System', 'Workday-based HRIS managing employee records, benefits administration, performance management, and compliance reporting.', 'medium', 4, 4, 3, 2, 'enterprise_application', 'human_resources', 'hr-systems@contoso.com', 'chro@contoso.com', 'tier_2', '6am-8pm Mon-Fri', 480, 240, 5000000, 15000, '["SOC2","GDPR","CCPA"]', '["ActiveDirectory","PayrollSystem","BackupServices"]', 'https://monitor.contoso.com/workday', 'https://hr.contoso.com/health', 'https://docs.contoso.com/hr', 6, 99.65, '{"login_time_ms": 1500, "report_generation_time_s": 120, "data_sync_time_m": 30}'),

('Development and Testing Platform', 'Kubernetes-based development platform providing CI/CD pipelines, testing environments, and application deployment automation.', 'medium', 3, 3, 3, 2, 'platform', 'software_development', 'devops@contoso.com', 'vp-engineering@contoso.com', 'tier_2', '24x7 (dev environments), 6am-10pm (prod deployments)', 960, 480, 2000000, 8000, '["SOC2"]', '["GitRepository","ContainerRegistry","MonitoringServices"]', 'https://monitor.contoso.com/k8s', 'https://k8s.contoso.com/healthz', 'https://docs.contoso.com/devops', 15, 99.45, '{"build_time_s": 180, "deployment_time_s": 300, "test_execution_time_s": 420}'),

-- Tier 3 - Standard Services
('Employee Knowledge Base', 'Confluence-based internal wiki and documentation system providing company policies, procedures, and technical documentation.', 'medium', 3, 2, 2, 2, 'knowledge_management', 'information_sharing', 'knowledge@contoso.com', 'operations-manager@contoso.com', 'tier_3', '6am-10pm Mon-Fri', 1440, 720, 500000, 2000, '["SOC2"]', '["ActiveDirectory","SearchServices","BackupServices"]', 'https://monitor.contoso.com/confluence', 'https://wiki.contoso.com/health', 'https://docs.contoso.com/wiki', 8, 99.25, '{"search_response_time_ms": 800, "page_load_time_ms": 2000, "concurrent_users": 200}'),

('Security Information and Event Management', 'Splunk Enterprise SIEM providing security monitoring, incident detection, compliance reporting, and threat hunting capabilities.', 'high', 4, 5, 4, 1, 'security', 'security_monitoring', 'security@contoso.com', 'ciso@contoso.com', 'tier_1', '24x7x365', 60, 30, 8000000, 35000, '["SOC2","ISO27001","NIST"]', '["NetworkDevices","Endpoints","SecurityTools"]', 'https://monitor.contoso.com/splunk', 'https://siem-primary.contoso.com/health', 'https://docs.contoso.com/siem', 7, 99.88, '{"log_ingestion_rate_eps": 15000, "search_response_time_s": 8, "alert_processing_time_s": 30}');

-- ================================================================
-- THREAT INTELLIGENCE FEEDS DATA
-- ================================================================

INSERT INTO threat_indicators (indicator_type, indicator_value, threat_type, confidence_score, severity, first_seen, last_seen, source_feeds, associated_malware, attack_patterns, geolocation, description, remediation_advice, false_positive_probability, tags) VALUES

-- Active Threat Actor Infrastructure
('ip_address', '198.51.100.42', 'command_and_control', 0.95, 'critical', datetime('now', '-2 days'), datetime('now', '-2 hours'), '["Microsoft Threat Intelligence", "AlienVault OTX", "VirusTotal"]', '["Cobalt Strike", "Metasploit", "Empire"]', '["T1071.001", "T1090", "T1105"]', '{"country": "CN", "asn": "AS4134", "org": "Chinanet"}', 'Known C2 infrastructure used by APT41 group for lateral movement and data exfiltration campaigns targeting financial institutions.', 'Block at perimeter firewall, monitor for internal communications, hunt for beacons on endpoints.', 0.05, '["apt41", "cobalt_strike", "financial_sector", "active_threat"]'),

('domain', 'fake-microsoft-login.com', 'phishing', 0.92, 'high', datetime('now', '-5 days'), datetime('now', '-4 hours'), '["PhishTank", "SANS ISC", "Microsoft Defender"]', '["Credential Harvester", "Browser Stealer"]', '["T1566.002", "T1556.001", "T1539"]', '{"country": "RU", "registrar": "NameCheap", "creation_date": "2024-01-10"}', 'Credential harvesting site mimicking Microsoft Office 365 login page. Used in targeted spear-phishing campaigns against executives.', 'Block domain in DNS, email security gateway. Educate users on phishing indicators.', 0.02, '["phishing", "credential_harvesting", "executive_targeting", "office365_spoof"]'),

('file_hash', 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456', 'ransomware', 0.98, 'critical', datetime('now', '-7 days'), datetime('now', '-1 day'), '["Mandiant", "CrowdStrike", "Microsoft Threat Intelligence"]', '["Conti Ransomware", "TrickBot Loader"]', '["T1486", "T1490", "T1083", "T1082"]', '{"first_seen_country": "US", "distribution_method": "phishing"}', 'Conti ransomware payload with advanced evasion techniques. Targets Windows systems, encrypts files, deletes shadow copies.', 'Deploy endpoint detection rules, ensure backups are offline, patch Exchange vulnerabilities.', 0.01, '["conti", "ransomware", "trickbot", "healthcare_targeting"]'),

-- Vulnerability Exploitation Attempts
('ip_address', '203.0.113.50', 'vulnerability_exploitation', 0.88, 'high', datetime('now', '-10 days'), datetime('now', '-3 hours'), '["Shadowserver", "GreyNoise", "Shodan"]', '["Web Shell", "Remote Access Tool"]', '["T1190", "T1505.003", "T1133"]', '{"country": "KP", "asn": "AS131279", "org": "Korea Telecom"}', 'IP address actively scanning for and exploiting CVE-2023-23397 (Exchange Server). Part of coordinated campaign.', 'Block IP address, patch Exchange servers immediately, monitor for web shells and persistence.', 0.08, '["cve-2023-23397", "exchange_exploit", "apt_campaign", "north_korea"]'),

('url', 'http://malicious-update.example.com/patch.exe', 'malware_distribution', 0.85, 'high', datetime('now', '-3 days'), datetime('now', '-6 hours'), '["URLVoid", "Hybrid Analysis", "Joe Sandbox"]', '["Emotet", "QBot", "IcedID"]', '["T1566.002", "T1204.002", "T1055"]', '{"hosting_country": "NL", "ip": "192.0.2.15", "ssl_cert": "invalid"}', 'Fake software update site distributing banking trojans. Uses legitimate software branding to deceive users.', 'Block URL in web proxy, educate users on software update procedures, deploy application whitelisting.', 0.12, '["emotet", "qbot", "fake_updates", "banking_trojan"]'),

-- Nation State Indicators
('domain', 'secure-gov-portal.net', 'espionage', 0.94, 'critical', datetime('now', '-15 days'), datetime('now', '-1 day'), '["US-CERT", "NSA Cybersecurity", "Microsoft Threat Intelligence"]', '["SUNBURST", "TEARDROP", "BEACON"]', '["T1195.002", "T1078.004", "T1550.002"]', '{"country": "RU", "registrar": "NameSilo", "creation_date": "2024-01-01"}', 'Command and control domain associated with SVR (APT29/Cozy Bear) operations targeting government contractors.', 'Block domain immediately, hunt for SUNBURST indicators, review supply chain security.', 0.03, '["apt29", "cozy_bear", "supply_chain", "government_targeting"]'),

('file_hash', 'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567a', 'backdoor', 0.96, 'critical', datetime('now', '-12 days'), datetime('now', '-2 days'), '["FireEye", "Mandiant", "CISA"]', '["SUNBURST Backdoor", "BEACON Implant"]', '["T1195.002", "T1574.002", "T1027"]', '{"compilation_timestamp": "2024-01-03", "pdb_path": "C:\\temp\\build"}', 'SolarWinds supply chain backdoor variant with updated evasion techniques. Maintains persistence via DLL hijacking.', 'Isolate affected systems, rebuild from clean images, review code signing certificates, audit supply chain.', 0.02, '["solarwinds", "supply_chain", "apt29", "dll_hijacking"]'),

-- Commodity Malware
('ip_address', '192.0.2.100', 'botnet', 0.78, 'medium', datetime('now', '-20 days'), datetime('now', '-8 hours'), '["Spamhaus", "Abuse.ch", "MalwareBazaar"]', '["Emotet", "TrickBot", "BazarLoader"]', '["T1071.001", "T1573.002", "T1059.003"]', '{"country": "US", "asn": "AS7922", "org": "Comcast Cable"}', 'Compromised residential IP participating in Emotet botnet operations. Used for spam distribution and lateral movement.', 'Block IP temporarily, notify ISP abuse contact, monitor for similar behavioral patterns.', 0.25, '["emotet", "botnet", "compromised_host", "residential_ip"]'),

('domain', 'download-office-update.org', 'malware_distribution', 0.82, 'medium', datetime('now', '-8 days'), datetime('now', '-12 hours'), '["OpenPhish", "PhishTank", "SURBL"]', '["Office Macro Malware", "Dridex Banking Trojan"]', '["T1566.001", "T1204.002", "T1059.005"]', '{"country": "PA", "registrar": "PublicDomainRegistry", "creation_date": "2024-01-08"}', 'Malicious domain hosting fake Microsoft Office updates containing macro-enabled documents with Dridex payload.', 'Block domain, disable macros by default, educate users on legitimate update channels.', 0.15, '["dridex", "office_macros", "banking_trojan", "fake_updates"]'),

-- IoT and Infrastructure Threats
('ip_address', '172.16.0.55', 'iot_botnet', 0.75, 'medium', datetime('now', '-5 days'), datetime('now', '-4 hours'), '["IoT Inspector", "Shodan", "BinaryEdge"]', '["Mirai Variant", "IoT Botnet Agent"]', '["T1498.001", "T1090", "T1557.001"]', '{"device_type": "IP Camera", "vendor": "Hikvision", "firmware": "outdated"}', 'Compromised IoT device participating in DDoS attacks and cryptomining operations. Default credentials suspected.', 'Change default credentials, update firmware, segment IoT networks, monitor network traffic.', 0.30, '["mirai", "iot_botnet", "ddos", "default_credentials"]');

-- ================================================================
-- SERVICE DEPENDENCIES AND RELATIONSHIPS
-- ================================================================

-- Critical Service Dependencies
INSERT INTO service_dependencies (service_id, depends_on_service_id, dependency_type, criticality) VALUES
((SELECT id FROM services WHERE name = 'Primary Database Cluster'), (SELECT id FROM services WHERE name = 'Active Directory Domain Services'), 'functional', 'high'),
((SELECT id FROM services WHERE name = 'Email and Collaboration Platform'), (SELECT id FROM services WHERE name = 'Active Directory Domain Services'), 'functional', 'high'),
((SELECT id FROM services WHERE name = 'Customer Portal Web Application'), (SELECT id FROM services WHERE name = 'Primary Database Cluster'), 'data', 'high'),
((SELECT id FROM services WHERE name = 'Financial ERP System'), (SELECT id FROM services WHERE name = 'Primary Database Cluster'), 'data', 'high'),
((SELECT id FROM services WHERE name = 'Financial ERP System'), (SELECT id FROM services WHERE name = 'Active Directory Domain Services'), 'functional', 'medium'),
((SELECT id FROM services WHERE name = 'Human Resources Information System'), (SELECT id FROM services WHERE name = 'Active Directory Domain Services'), 'functional', 'medium'),
((SELECT id FROM services WHERE name = 'Customer Portal Web Application'), (SELECT id FROM services WHERE name = 'Network Infrastructure Services'), 'infrastructure', 'high'),
((SELECT id FROM services WHERE name = 'Email and Collaboration Platform'), (SELECT id FROM services WHERE name = 'Network Infrastructure Services'), 'infrastructure', 'high'),
((SELECT id FROM services WHERE name = 'Development and Testing Platform'), (SELECT id FROM services WHERE name = 'Network Infrastructure Services'), 'infrastructure', 'medium'),
((SELECT id FROM services WHERE name = 'Employee Knowledge Base'), (SELECT id FROM services WHERE name = 'Active Directory Domain Services'), 'functional', 'low');

-- ================================================================
-- ENTERPRISE INTEGRATIONS CONFIGURATION
-- ================================================================

INSERT INTO enterprise_integrations (integration_name, integration_type, status, endpoint_url, authentication_type, sync_frequency, last_sync, next_sync, sync_status, performance_metrics, avg_response_time_ms, events_per_hour, uptime_percent, health_status, integration_version, created_by) VALUES

('Microsoft Defender for Endpoint', 'microsoft_defender', 'active', 'https://api.securitycenter.microsoft.com', 'oauth2', 'every_15min', datetime('now', '-10 minutes'), datetime('now', '+5 minutes'), 'success', '{"alerts_processed": 1247, "endpoints_monitored": 2847}', 350, 450, 99.2, 'healthy', '1.0.2024.01', 'security@contoso.com'),

('ServiceNow IT Service Management', 'servicenow', 'active', 'https://contoso.service-now.com/api', 'api_key', 'hourly', datetime('now', '-45 minutes'), datetime('now', '+15 minutes'), 'success', '{"incidents_synced": 156, "changes_synced": 23}', 280, 180, 98.8, 'healthy', 'Utah Release', 'it-admin@contoso.com'),

('Splunk Enterprise SIEM', 'siem', 'active', 'https://splunk.contoso.com:8089', 'api_key', 'every_5min', datetime('now', '-3 minutes'), datetime('now', '+2 minutes'), 'success', '{"events_indexed": 15000, "searches_executed": 89}', 120, 3600, 99.5, 'healthy', '9.1.2', 'security@contoso.com'),

('Microsoft Sentinel', 'sentinel', 'active', 'https://management.azure.com', 'oauth2', 'realtime', datetime('now', '-1 minute'), datetime('now', '+1 minute'), 'syncing', '{"incidents_created": 34, "analytics_rules": 127}', 420, 720, 97.9, 'degraded', '2024-01-15', 'cloud-security@contoso.com'),

('Qualys Vulnerability Management', 'custom', 'active', 'https://qualysapi.qualys.com', 'api_key', 'daily', datetime('now', '-18 hours'), datetime('now', '+6 hours'), 'success', '{"vulnerabilities_found": 8943, "assets_scanned": 2847}', 850, 50, 99.1, 'healthy', '4.22.1', 'vulnerability-mgmt@contoso.com');

-- ================================================================
-- AUDIT LOGGING FOR COMPLIANCE
-- ================================================================

INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent, session_id, compliance_event) VALUES
(1, 'login', 'authentication', NULL, 'Successful login from corporate network', '10.0.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/91.0.864.59', 'sess_abc123', TRUE),
(1, 'view_risk', 'risk', 1, 'Viewed risk details: SQL Server vulnerability assessment', '10.0.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/91.0.864.59', 'sess_abc123', TRUE),
(2, 'create_service', 'service', 8, 'Created new service: Customer Analytics Platform', '10.0.2.50', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15', 'sess_def456', TRUE),
(1, 'approve_risk', 'risk', 3, 'Approved risk mitigation plan for Exchange Server vulnerabilities', '10.0.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/91.0.864.59', 'sess_abc123', TRUE),
(2, 'modify_service', 'service', 2, 'Updated service criticality level from high to critical', '10.0.2.50', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15', 'sess_def456', TRUE);

-- ================================================================
-- SUMMARY STATISTICS
-- ================================================================

-- Update system configuration with realistic metrics
UPDATE system_config SET value = 'true', updated_at = CURRENT_TIMESTAMP WHERE key = 'risk_cascade_enabled';
UPDATE system_config SET value = '0.85', updated_at = CURRENT_TIMESTAMP WHERE key = 'risk_cascade_threshold';
UPDATE system_config SET value = 'true', updated_at = CURRENT_TIMESTAMP WHERE key = 'approval_workflow_enabled';

-- Insert additional system metrics
INSERT OR REPLACE INTO system_config (key, value, description, updated_at) VALUES
('threat_intel_last_update', datetime('now', '-15 minutes'), 'Last threat intelligence feed update timestamp', CURRENT_TIMESTAMP),
('vulnerability_scan_last_run', datetime('now', '-2 hours'), 'Last comprehensive vulnerability scan completion', CURRENT_TIMESTAMP),
('integration_health_score', '0.97', 'Overall health score of enterprise integrations (0.0-1.0)', CURRENT_TIMESTAMP),
('automation_coverage_percent', '73.5', 'Percentage of processes with automation coverage', CURRENT_TIMESTAMP),
('compliance_posture_score', '0.88', 'Overall compliance posture score (0.0-1.0)', CURRENT_TIMESTAMP);

-- Display summary of created data
SELECT 'SEED DATA SUMMARY:' as summary;
SELECT COUNT(*) as total_assets FROM business_assets;
SELECT COUNT(*) as total_services FROM services;
SELECT COUNT(*) as total_incidents FROM security_incidents;
SELECT COUNT(*) as total_vulnerabilities FROM vulnerability_assessments;
SELECT COUNT(*) as total_threat_indicators FROM threat_indicators;
SELECT COUNT(*) as total_integrations FROM enterprise_integrations;
SELECT COUNT(*) as total_dependencies FROM service_dependencies;

PRAGMA foreign_key_check;
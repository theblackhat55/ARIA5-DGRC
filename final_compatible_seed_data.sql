-- ================================================================
-- FINAL COMPATIBLE ENTERPRISE SEED DATA
-- Exact schema match for existing ARIA5.1 database
-- ================================================================

-- Clear existing test data safely
DELETE FROM incidents WHERE id > 1;
DELETE FROM vulnerabilities WHERE id > 1;
DELETE FROM threat_indicators WHERE id > 1;
DELETE FROM assets WHERE id > 1;

-- ================================================================
-- REALISTIC ENTERPRISE ASSETS
-- ================================================================
INSERT OR IGNORE INTO assets (name, description, asset_type, criticality, status) VALUES 

-- Critical Infrastructure (Tier 0)
('DC-PRIMARY-01', 'Primary Active Directory Domain Controller - Windows Server 2022 managing 5000+ user accounts, 200+ group policies, and enterprise authentication services', 'server', 'Critical', 'active'),
('SQL-PROD-CLUSTER', 'Production SQL Server Always-On Availability Group - 4-node cluster hosting 847 databases including financial systems, customer PII, and business analytics', 'server', 'Critical', 'active'),
('EXCHANGE-HYBRID-01', 'Microsoft Exchange Server 2019 - hybrid on-premises deployment serving 5000+ mailboxes with Office 365 integration and mobile device support', 'server', 'Critical', 'active'),
('AZURE-PROD-TENANT', 'Microsoft Azure Production Tenant - 127 virtual machines, 34 SQL databases, 450+ managed identities across 12 resource groups', 'cloud_service', 'Critical', 'active'),

-- High Priority Infrastructure (Tier 1)
('WEB-CLUSTER-DMZ', 'Customer-facing web application cluster - 6 load-balanced nginx servers serving 50,000+ daily users with e-commerce and customer portal', 'server', 'High', 'active'),
('SIEM-SPLUNK-MAIN', 'Splunk Enterprise Security SIEM - ingesting 15,000 events/second from 2,500+ sources with 90-day retention and real-time analytics', 'security_appliance', 'High', 'active'),
('FW-PALO-PERIMETER', 'Palo Alto PA-5220 Next-Generation Firewall - primary perimeter security processing 2.8M sessions/day with advanced threat prevention', 'network_device', 'Critical', 'active'),
('BACKUP-VEEAM-PROD', 'Veeam Backup & Replication v12 - managing 247TB of backup data with 15-minute RPO for Tier 0 systems and 4-hour RPO for Tier 1', 'server', 'High', 'active'),

-- Business Applications (Tier 2)
('ERP-SAP-PROD', 'SAP ERP Central Component (ECC) 6.0 - financial accounting, procurement, supply chain management serving 2,000+ concurrent users', 'application', 'High', 'active'),
('CRM-SALESFORCE', 'Salesforce Enterprise Edition - customer relationship management platform with 15M+ customer records and sales pipeline analytics', 'cloud_service', 'Medium', 'active'),
('SHAREPOINT-FARM', 'SharePoint Server 2019 Farm - document management and collaboration platform with 500+ site collections and 2TB+ content', 'server', 'Medium', 'active'),

-- Security Infrastructure
('EDR-CROWDSTRIKE', 'CrowdStrike Falcon Complete - endpoint detection and response protecting 2,847 endpoints with real-time behavioral monitoring', 'security_service', 'High', 'active'),
('VULNERABILITY-QUALYS', 'Qualys VMDR - vulnerability management and compliance scanning for 2,847 assets with weekly authenticated scans', 'security_service', 'Medium', 'active');

-- ================================================================
-- SECURITY INCIDENTS 
-- ================================================================
INSERT OR IGNORE INTO incidents (title, description, severity, status) VALUES

-- Critical Active Incidents
('APT41 Lateral Movement Campaign - ACTIVE RESPONSE', 'Advanced persistent threat campaign detected across domain infrastructure. PowerShell Empire framework deployment confirmed with credential dumping (mimikatz signatures) and lateral movement across 15 domain controllers. Evidence suggests Chinese state-sponsored APT41 group based on custom tooling and TTPs. Data staging directory discovered on compromised file server containing 2.3GB of sensitive financial documents. C2 communication to known APT41 infrastructure confirmed. 72-hour dwell time estimated with ongoing exfiltration attempts.', 'critical', 'active'),

('Conti Ransomware Deployment - CONTAINED', 'Conti ransomware variant executed on FILESERVER-03 resulting in encryption of 15,420 files across shared network drives. Shadow copy deletion and Windows backup service tampering confirmed via forensic analysis. Ransomware note demands 50 Bitcoin ($2.1M USD) with 72-hour payment deadline. Affected system immediately isolated and forensic disk images captured. No evidence of lateral spread to additional systems. Backup restoration initiated from offline tape library.', 'critical', 'contained'),

('Supply Chain Backdoor - SolarWinds Pattern', 'Suspicious network beacon behavior detected from monitoring infrastructure matching SUNBURST backdoor communication patterns. Eight affected systems including SIEM and network monitoring platforms communicating with domain generation algorithm (DGA) domains resolving to known APT29 infrastructure. Software supply chain compromise suspected via trojanized monitoring agent update package distributed through legitimate vendor channels.', 'critical', 'investigating'),

-- High Priority Incidents  
('Executive Spear Phishing - BEC Campaign', 'Sophisticated business email compromise attempt targeting C-suite executives using AI-generated voice cloning technology and convincing Microsoft 365 security alert spoofing. Four of twelve targeted executives clicked malicious links leading to credential harvesting infrastructure. Multi-factor authentication bypass attempts detected using real-time phishing kits. Finance team received fraudulent wire transfer instructions via compromised email thread appearing to originate from CEO.', 'high', 'investigating'),

('Insider Threat - Database Administrator Anomaly', 'Behavioral analytics detected anomalous database access pattern from DBA account THOMPSON-ADMIN. Account accessed 23 sensitive customer databases during non-business hours (02:00-04:00) over five consecutive nights. 2.3M customer records queried and exported to CSV format. Personal Microsoft OneDrive uploads detected from DBA workstation coinciding with database exports. HR investigation initiated for potential policy violations and data theft.', 'high', 'under_review'),

('Cloud Cryptojacking - Azure Kubernetes Compromise', 'Unauthorized cryptocurrency mining containers deployed in production Azure Kubernetes Service cluster consuming $23,000/month in compute resources. 47 Monero mining pods discovered through anomalous CPU utilization monitoring. Initial access gained via compromised service principal with cluster-admin privileges. Mining pool communication detected to known cryptojacking infrastructure. All unauthorized containers terminated and service principal credentials rotated.', 'medium', 'mitigated');

-- ================================================================
-- VULNERABILITIES (Using exact existing schema)
-- ================================================================
INSERT OR IGNORE INTO vulnerabilities (name, description, vulnerability_type, category, severity, cvss_score, cve_id, exploitability_score, impact_score, affected_systems, remediation_status, remediation_priority) VALUES

-- Critical Vulnerabilities (CVSS 9.0+)
('Microsoft Outlook NTLM Relay Zero-Click', 'Elevation of privilege vulnerability in Microsoft Outlook allowing NTLM credential theft via specially crafted calendar appointments without user interaction. Actively exploited by APT28 (Fancy Bear) and APT29 (Cozy Bear) in targeted campaigns against government and critical infrastructure since March 2023.', 'privilege_escalation', 'Authentication Bypass', 'Critical', 9.8, 'CVE-2023-23397', 5, 5, 'EXCHANGE-HYBRID-01, All Outlook Clients', 'Open', 'Immediate'),

('Microsoft Office RCE RTF Processing', 'Remote code execution vulnerability in Microsoft Office when processing RTF documents allowing arbitrary code execution in user context. Exploited in zero-day attacks by Storm-0978 threat group targeting defense and government sectors with weaponized documents.', 'remote_code_execution', 'Document Processing', 'Critical', 9.8, 'CVE-2023-36884', 5, 5, 'All Office Installations, Email Systems', 'Patching', 'Immediate'),

('Progress MOVEit Transfer SQL Injection', 'SQL injection vulnerability in MOVEit Transfer managed file transfer application leading to unauthorized database access and file extraction. Mass exploitation by Cl0p ransomware group resulted in data theft from 600+ organizations worldwide including healthcare and financial institutions.', 'sql_injection', 'Web Application', 'Critical', 9.8, 'CVE-2023-34362', 5, 5, 'File Transfer Systems, Partner Integration', 'Emergency_Patch', 'Immediate'),

-- High Severity Vulnerabilities (CVSS 7.0-8.9)  
('Windows Streaming Service Proxy LPE', 'Local privilege escalation vulnerability in Windows Streaming Service Proxy allowing standard users to gain SYSTEM privileges through DLL hijacking techniques. Affects domain controllers and member servers running Windows Server 2019/2022.', 'privilege_escalation', 'Operating System', 'High', 7.8, 'CVE-2023-36802', 4, 4, 'DC-PRIMARY-01, Windows Servers', 'Open', 'High'),

('curl SOCKS5 Proxy Buffer Overflow', 'Heap buffer overflow in curl SOCKS5 proxy authentication could lead to remote code execution. Affects curl versions 7.69.0 through 8.3.0 used extensively in web applications, API integrations, and automated systems.', 'buffer_overflow', 'Network Library', 'High', 8.8, 'CVE-2023-38545', 4, 4, 'WEB-CLUSTER-DMZ, API Systems', 'Open', 'High'),

('WebP Image Processing Buffer Overflow', 'Heap buffer overflow in libwebp WebP image processing library allowing remote code execution via malicious images. Initially discovered as zero-day exploited against journalists and civil society organizations by commercial spyware.', 'buffer_overflow', 'Image Processing', 'High', 8.8, 'CVE-2023-4863', 4, 4, 'Web Applications, Browsers', 'Mitigated', 'High'),

-- Medium Severity Vulnerabilities (CVSS 4.0-6.9)
('.NET Framework Certificate DoS', 'Denial of service vulnerability in .NET Framework when processing malformed X.509 certificates during certificate chain validation. Could cause application crashes and service disruptions in certificate-dependent applications.', 'denial_of_service', 'Framework', 'Medium', 5.9, 'CVE-2023-36049', 3, 3, '.NET Applications, Web Services', 'Scheduled', 'Medium'),

('libvpx VP8 Video Codec Overflow', 'Buffer overflow vulnerability in VP8 video codec implementation within libvpx library could lead to heap corruption and potential code execution. Affects video processing in web browsers and multimedia applications.', 'buffer_overflow', 'Media Processing', 'Medium', 6.5, 'CVE-2023-5217', 3, 3, 'SHAREPOINT-FARM, Media Systems', 'Open', 'Medium'),

('HTTP/2 Rapid Reset DoS Attack', 'HTTP/2 protocol implementation vulnerability allowing denial of service attacks through rapid stream creation and cancellation. Exploited to launch record-breaking DDoS attacks exceeding 398 million requests per second.', 'denial_of_service', 'Network Protocol', 'Medium', 7.5, 'CVE-2023-44487', 3, 4, 'FW-PALO-PERIMETER, Load Balancers', 'Mitigated', 'Medium');

-- ================================================================
-- THREAT INTELLIGENCE INDICATORS  
-- ================================================================
INSERT OR IGNORE INTO threat_indicators (indicator_type, indicator_value, confidence_score) VALUES

-- Active C2 Infrastructure (High Confidence)
('ip', '198.51.100.42', 0.95),
('domain', 'secure-ms-updates.net', 0.98), 
('hash', 'f2ca1bb6c7e907d06dafe4687d2e37d7fd05cff6', 0.98),

-- Nation-State Attribution (Government Sources)
('ip', '203.0.113.50', 0.90),
('domain', 'contractor-secure-portal.org', 0.90),

-- Commodity Cybercrime (Medium-High Confidence) 
('ip', '192.0.2.100', 0.75),
('domain', 'microsoft-security-center.org', 0.85),
('hash', 'e3b0c44298fc1c149afbf4c8996fb924275a5b1e', 0.85),

-- Emerging Threats & IOCs
('url', 'http://malicious-payload-site.com/exploit', 0.70),
('hash', 'd58e3582afa99040e27b92b13c8f2280', 0.80);

-- ================================================================
-- SYSTEM METRICS UPDATE 
-- ================================================================
INSERT OR REPLACE INTO system_config (key, value, description) VALUES
-- Enterprise Asset Metrics  
('total_managed_assets', '2847', 'Total IT assets under security management including endpoints, servers, and cloud resources'),
('critical_asset_count', '47', 'Business-critical assets requiring enhanced monitoring and incident response procedures'),
('security_incidents_30d', '89', 'Security incidents reported and investigated in the last 30 days across all severity levels'),
('critical_vulnerabilities_open', '23', 'Critical CVSS 9.0+ vulnerabilities requiring immediate remediation and executive attention'),
('threat_indicators_active', '2847', 'Active threat intelligence indicators being monitored for matches against internal telemetry'),

-- Operational Security Metrics
('mean_time_to_detect_hours', '4.7', 'Average time from initial compromise to security incident detection'),
('mean_time_to_respond_hours', '2.3', 'Average time from incident detection to response team activation'),  
('automation_coverage_percent', '73.2', 'Percentage of security processes with partial or full automation implementation'),
('compliance_score_weighted', '87.4', 'Weighted average compliance score across SOC2, ISO27001, and regulatory frameworks'),
('insider_threat_risk_score', '18.7', 'Current insider threat risk assessment score based on behavioral analytics');

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================
SELECT '====== ENTERPRISE DATA DEPLOYMENT VERIFICATION ======' as status;

SELECT 'ASSETS:' as category,
  COUNT(*) as total,
  COUNT(CASE WHEN criticality = 'Critical' THEN 1 END) as critical,
  COUNT(CASE WHEN criticality = 'High' THEN 1 END) as high
FROM assets;

SELECT 'INCIDENTS:' as category,
  COUNT(*) as total,  
  COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active
FROM incidents;

SELECT 'VULNERABILITIES:' as category,
  COUNT(*) as total,
  COUNT(CASE WHEN severity = 'Critical' THEN 1 END) as critical,
  ROUND(AVG(cvss_score), 2) as avg_cvss
FROM vulnerabilities;

SELECT 'THREAT INTEL:' as category,
  COUNT(*) as total_indicators,
  COUNT(CASE WHEN confidence_score >= 0.9 THEN 1 END) as high_confidence,
  ROUND(AVG(confidence_score), 3) as avg_confidence
FROM threat_indicators;

SELECT 'DYNAMIC RISK PLATFORM STATUS: ✅ ENTERPRISE-READY' as final_status;
-- ================================================================
-- ARIA5.1 COMPATIBLE ENTERPRISE SEED DATA  
-- Works with existing schema - realistic enterprise test data
-- ================================================================

-- ================================================================
-- ENTERPRISE ASSETS (using existing assets table structure)
-- ================================================================
INSERT OR IGNORE INTO assets (name, description, asset_type, criticality, status) VALUES 

-- Critical Infrastructure (Tier 0)
('DC-PRIMARY-01', 'Primary Active Directory Domain Controller - Windows Server 2022, managing 5000+ users, 200+ GPOs, and enterprise authentication services', 'server', 'Critical', 'active'),
('SQL-PROD-CLUSTER', 'Production SQL Server Always-On Availability Group - 4 nodes hosting 847 databases including financial systems and customer PII data', 'server', 'Critical', 'active'),
('EXCHANGE-HYBRID-01', 'Microsoft Exchange Server 2019 - hybrid on-premises deployment serving 5000+ mailboxes with Office 365 integration', 'server', 'Critical', 'active'),
('AZURE-PROD-TENANT', 'Microsoft Azure Production Tenant - 127 VMs, 34 SQL databases, 450+ managed identities across 12 resource groups', 'cloud_service', 'Critical', 'active'),

-- High Priority Systems (Tier 1) 
('WEB-CLUSTER-DMZ', 'Customer-facing web application cluster - 6 load-balanced servers serving 50K+ daily users with customer portal and e-commerce', 'server', 'High', 'active'),
('SIEM-SPLUNK-MAIN', 'Splunk Enterprise Security SIEM - ingesting 15K events/second from 2500+ sources with 90-day retention', 'security_appliance', 'High', 'active'),
('FW-PALO-PERIMETER', 'Palo Alto PA-5220 Next-Gen Firewall - primary perimeter security processing 2.8M sessions/day with threat prevention', 'network_device', 'Critical', 'active'),
('BACKUP-VEEAM-PROD', 'Veeam Backup & Replication v12 - managing 247TB backup data with 15-minute RPO for Tier 0 systems', 'server', 'High', 'active'),

-- Business Applications (Tier 2)
('ERP-SAP-PROD', 'SAP ERP Central Component (ECC) 6.0 - financial accounting, procurement, and supply chain management for 2000+ users', 'application', 'High', 'active'),
('CRM-SALESFORCE', 'Salesforce Enterprise - customer relationship management with 15M+ customer records and sales pipeline data', 'cloud_service', 'Medium', 'active'),
('SHAREPOINT-FARM', 'SharePoint Server 2019 Farm - document management and collaboration platform with 500+ site collections', 'server', 'Medium', 'active'),

-- Security Infrastructure (Tier 1)
('EDR-CROWDSTRIKE', 'CrowdStrike Falcon Complete - endpoint detection and response protecting 2847 endpoints with real-time monitoring', 'security_service', 'High', 'active'),
('VULNERABILITY-QUALYS', 'Qualys VMDR - vulnerability management and compliance scanning for 2847 assets with weekly scan cycles', 'security_service', 'Medium', 'active'),

-- Development Infrastructure (Tier 3)
('JENKINS-CI-CD', 'Jenkins Enterprise - CI/CD pipeline automation with 89 build agents supporting 200+ development projects', 'server', 'Medium', 'active'),
('GIT-ENTERPRISE', 'GitLab Enterprise - source code repository hosting 1500+ repositories with 300+ active developers', 'server', 'Medium', 'active');

-- ================================================================
-- SECURITY INCIDENTS (using existing incidents table structure)  
-- ================================================================
INSERT OR IGNORE INTO incidents (title, description, severity, status) VALUES

-- Critical Active Incidents (requiring immediate response)
('APT41 Lateral Movement Campaign - ACTIVE', 'Advanced persistent threat campaign detected: PowerShell Empire framework deployment, credential dumping via mimikatz, and lateral movement across 15 domain-joined systems. Evidence suggests Chinese state-sponsored APT41 group based on TTPs. Data staging directory found on compromised file server with 2.3GB of financial documents. Timeline indicates 72-hour dwell time with ongoing C2 communication to known APT41 infrastructure.', 'critical', 'active'),

('Conti Ransomware Deployment - CONTAINED', 'Conti ransomware variant executed on FILESERVER-03 resulting in encryption of 15,420 files across shared drives. Shadow copy deletion and backup service tampering confirmed. Ransomware note demands 50 Bitcoin ($2.1M USD) with 72-hour deadline. System isolated and forensic imaging completed. No evidence of lateral spread to other systems. Backup restoration in progress.', 'critical', 'contained'),

('Supply Chain Backdoor - SolarWinds Style', 'Suspicious network beacon behavior detected from monitoring infrastructure matching SUNBURST backdoor patterns. Affected systems communicating with DGA domains resolving to known APT29 infrastructure. Software supply chain compromise suspected via trojanized update package. 8 systems affected including SIEM and network monitoring platforms.', 'critical', 'investigating'),

-- High Priority Security Events
('Executive Spear Phishing - BEC Attempt', 'Sophisticated business email compromise attempt targeting CEO and CFO using AI-generated voice cloning and convincing Microsoft 365 security alert spoofs. 4 of 12 targeted executives clicked malicious links leading to credential harvesting site. Multi-factor authentication bypass attempts detected. Finance team received fraudulent wire transfer instructions via compromised email thread.', 'high', 'investigating'),

('Insider Threat - Database Administrator', 'Anomalous database access pattern detected: DBA account THOMPSON-ADMIN accessed 23 sensitive customer databases during non-business hours (2:00-4:00 AM) over 5 consecutive days. 2.3M customer records queried and exported to CSV files. Personal OneDrive uploads detected from DBA workstation. HR investigation initiated for policy violations and potential data theft.', 'high', 'under_review'),

('Cloud Cryptojacking - Azure Kubernetes', 'Unauthorized cryptocurrency mining containers deployed in production Azure Kubernetes Service cluster. 47 Monero mining pods consuming $23,000/month in compute resources. Initial access gained via compromised service principal with cluster-admin privileges. Mining operation detected through anomalous CPU utilization and outbound network traffic to mining pools.', 'medium', 'mitigated'),

-- Medium Priority Incidents (monitoring and analysis phase)
('Shadow IT - Unauthorized SaaS Usage', 'Discovery of 127 unauthorized SaaS applications in use across organization without IT approval or security review. High-risk applications include file sharing (Dropbox, Google Drive), communication (Slack, Discord), and development tools (GitHub personal accounts). Potential data exfiltration risk and compliance violations identified.', 'medium', 'open'),

('Phishing Campaign - Office 365 Themes', 'Large-scale phishing campaign targeting employees with fake Microsoft 365 security notifications claiming account compromise. 847 phishing emails delivered with 89 users clicking malicious links (10.5% click rate). Credential harvesting site hosted on compromised WordPress sites. No successful account compromises detected due to MFA enforcement.', 'medium', 'monitoring');

-- ================================================================
-- VULNERABILITIES (using existing vulnerabilities table structure)
-- ================================================================  
INSERT OR IGNORE INTO vulnerabilities (asset_id, cve_id, cvss_score, severity, status, title, description) VALUES

-- Critical Vulnerabilities (CVSS 9.0+) - Immediate Action Required
((SELECT id FROM assets WHERE name = 'EXCHANGE-HYBRID-01' LIMIT 1), 'CVE-2023-23397', 9.8, 'Critical', 'Open', 'Microsoft Outlook Privilege Escalation (Zero-Click)', 'Elevation of privilege vulnerability in Microsoft Outlook allowing NTLM credential theft via specially crafted calendar appointments. No user interaction required. Actively exploited by APT28 (Fancy Bear) and APT29 (Cozy Bear) in targeted campaigns against government and critical infrastructure. Affects Outlook 2013, 2016, 2019, 2021, and Microsoft 365.'),

((SELECT id FROM assets WHERE name = 'SQL-PROD-CLUSTER' LIMIT 1), 'CVE-2023-36884', 9.8, 'Critical', 'Patching', 'Microsoft Office Remote Code Execution (RTF Processing)', 'Remote code execution vulnerability in Microsoft Office when processing RTF documents. Allows attackers to execute arbitrary code in the context of the current user. Exploited in zero-day attacks by Storm-0978 threat group targeting defense and government sectors. Affects Office 2016, 2019, 2021, and Microsoft 365 Apps.'),

((SELECT id FROM assets WHERE name = 'WEB-CLUSTER-DMZ' LIMIT 1), 'CVE-2023-34362', 9.8, 'Critical', 'Emergency_Patch', 'Progress MOVEit Transfer SQL Injection (Mass Exploitation)', 'SQL injection vulnerability in MOVEit Transfer managed file transfer application leading to unauthorized database access and file extraction. Mass exploitation by Cl0p ransomware group resulted in data theft from 600+ organizations worldwide. Critical for any organization using MOVEit Transfer for secure file exchange.'),

-- High Severity Vulnerabilities (CVSS 7.0-8.9) - Priority Patching
((SELECT id FROM assets WHERE name = 'DC-PRIMARY-01' LIMIT 1), 'CVE-2023-36802', 7.8, 'High', 'Open', 'Windows Streaming Service Proxy LPE', 'Local privilege escalation vulnerability in Windows Streaming Service Proxy allowing standard users to gain SYSTEM privileges through DLL hijacking techniques. Affects domain controllers and member servers running Windows Server 2019/2022 and Windows 10/11. Could facilitate lateral movement in Active Directory environments.'),

((SELECT id FROM assets WHERE name = 'WEB-CLUSTER-DMZ' LIMIT 1), 'CVE-2023-38545', 8.8, 'High', 'Open', 'curl SOCKS5 Proxy Heap Buffer Overflow', 'Heap buffer overflow in curl SOCKS5 proxy authentication could lead to remote code execution. Affects curl versions 7.69.0 through 8.3.0 used in web applications, API integrations, and automated scripts. Particularly dangerous in server environments processing untrusted proxy configurations.'),

((SELECT id FROM assets WHERE name = 'AZURE-PROD-TENANT' LIMIT 1), 'CVE-2023-4863', 8.8, 'High', 'Mitigated', 'WebP Image Processing Buffer Overflow (Citizen Lab 0-Day)', 'Heap buffer overflow in libwebp WebP image processing library allowing remote code execution via malicious images. Initially discovered being exploited against journalists and civil society. Affects web browsers, messaging applications, and image processing services in cloud environments.'),

-- Medium Severity Vulnerabilities (CVSS 4.0-6.9) - Scheduled Maintenance
((SELECT id FROM assets WHERE name = 'SIEM-SPLUNK-MAIN' LIMIT 1), 'CVE-2023-36049', 5.9, 'Medium', 'Scheduled', '.NET Framework Denial of Service', 'Denial of service vulnerability in .NET Framework when processing malformed X.509 certificates during certificate chain validation. Could cause application crashes and service disruptions in .NET-based applications and services including Splunk .NET connectors and Windows services.'),

((SELECT id FROM assets WHERE name = 'SHAREPOINT-FARM' LIMIT 1), 'CVE-2023-5217', 6.5, 'Medium', 'Open', 'libvpx VP8 Video Codec Buffer Overflow', 'Buffer overflow vulnerability in VP8 video codec implementation within libvpx library could lead to heap corruption and potential code execution. Affects video processing capabilities in web browsers and multimedia applications including SharePoint video streaming features.'),

((SELECT id FROM assets WHERE name = 'FW-PALO-PERIMETER' LIMIT 1), 'CVE-2023-44487', 7.5, 'Medium', 'Mitigated', 'HTTP/2 Rapid Reset DoS (Zero-Day)', 'HTTP/2 protocol implementation vulnerability allowing denial of service attacks through rapid stream creation and cancellation. Exploited to launch record-breaking DDoS attacks exceeding 398 million requests per second. Affects web servers, load balancers, and reverse proxies with HTTP/2 support.');

-- ================================================================
-- THREAT INTELLIGENCE INDICATORS (using existing threat_indicators table)
-- ================================================================
INSERT OR IGNORE INTO threat_indicators (indicator_type, indicator_value, threat_type, confidence_level, severity, source, description) VALUES

-- Active Command & Control Infrastructure (High Confidence)
('ip', '198.51.100.42', 'c2_server', 'High', 'Critical', 'Microsoft Threat Intelligence Center', 'APT41 command and control server hosting custom backdoors and Cobalt Strike Team Server. Active C2 infrastructure since January 2024. Associated with financial services targeting campaign Operation "CashOut". Geolocation: China ASN4134 (Chinanet). Block immediately and hunt for beacons.'),

('domain', 'secure-ms-updates.net', 'phishing', 'Very_High', 'Critical', 'Anti-Phishing Working Group', 'Typosquatting domain impersonating Microsoft security updates used in supply chain attacks against IT administrators. Hosts fake Windows Defender and Office update pages with embedded JavaScript credential stealers. Registered via privacy proxy, hosted on bulletproof infrastructure.'),

('hash', 'f2ca1bb6c7e907d06dafe4687d2e37d7fd05cff6', 'ransomware', 'Very_High', 'Critical', 'Mandiant Threat Intelligence', 'Conti ransomware payload (v3.0) with advanced evasion: process hollowing, anti-VM detection, and encrypted configuration. Compiled January 12, 2024. Detected in 23 organizations across healthcare and manufacturing verticals. Uses ChaCha20 encryption with RSA-2048 key exchange.'),

-- Nation-State Threat Actors (Attributable Campaigns)  
('ip', '203.0.113.50', 'reconnaissance', 'High', 'High', 'US-CERT + CISA Alert AA23-347A', 'Lazarus Group (APT38/Hidden Cobra) scanning infrastructure targeting Exchange servers for CVE-2023-23397 exploitation. Part of "Operation Dream Job" campaign using fake job opportunities to target cryptocurrency and financial organizations. North Korea state-sponsored activity.'),

('domain', 'contractor-secure-portal.org', 'watering_hole', 'High', 'Critical', 'NSA Cybersecurity Advisory', 'APT29 (Cozy Bear/SVR) watering hole attack domain spoofing government contractor portals. Used in supply chain compromise attempts against defense industrial base. Serves SUNBURST-variant backdoors via fake software update mechanisms. Russian Foreign Intelligence Service (SVR) attribution confirmed.'),

('url', 'https://teamviewer-patch.org/critical-update/install.msi', 'trojanized_software', 'High', 'High', 'Recorded Future + VirusTotal', 'Trojanized TeamViewer installer hosting custom backdoor with keylogging and screen capture capabilities. Targets remote work environments and managed service providers. MSI package signed with stolen code signing certificate from legitimate software vendor.'),

-- Commodity Malware & Cybercrime (Medium-High Confidence)
('ip', '192.0.2.100', 'botnet_c2', 'Medium', 'Medium', 'Abuse.ch Botnet Tracker', 'Emotet epoch 5 command and control server distributing banking trojans (QakBot, IcedID) and Cobalt Strike beacons. Residential IP compromise via malicious email attachments. Part of TA570 threat group operations targeting healthcare and education sectors.'),

('domain', 'microsoft-security-center.org', 'bec_phishing', 'High', 'High', 'Microsoft Security Intelligence', 'Business Email Compromise (BEC) domain used in CEO fraud schemes targeting finance departments. Spoofs Microsoft Security Center alerts to create urgency. Linked to West African cybercrime syndicates with $50M+ in fraudulent wire transfers across 200+ victim organizations.'),

('hash', 'e3b0c44298fc1c149afbf4c8996fb924275a5b1e', 'banking_trojan', 'High', 'High', 'MalwareBazaar + ANY.RUN', 'QakBot banking trojan version 404.85 with web injection capabilities targeting 67 financial institutions. Advanced evasion techniques include AMSI bypass, ETW patching, and sandbox detection. Drops Cobalt Strike for post-exploitation and human-operated ransomware deployment.'),

-- Emerging Threats & Zero-Days (Developing Intelligence)
('cve', 'CVE-2024-0001', 'zero_day_exploit', 'Medium', 'High', 'Google Threat Analysis Group', 'Suspected zero-day vulnerability in popular VPN client software being exploited by APT groups. Technical details limited. Recommend immediate review of VPN client configurations and network segmentation. Vendor notification and coordinated disclosure in progress.'),

('ioc', 'android.process.acore.exe', 'masquerading', 'High', 'Medium', 'Elastic Security Research', 'Windows malware masquerading as Android system process to evade detection. Indicates sophisticated APT tooling adapted for Windows environments. Associated with supply chain attacks targeting mobile device management platforms and Android development environments.');

-- ================================================================  
-- DYNAMIC RISKS (Contextual risk scenarios based on current environment)
-- ================================================================
INSERT OR IGNORE INTO dynamic_risks (title, description, category, probability, impact, confidence_score, source, organization_id) VALUES

-- Active Threat Campaign Risks (Current & Ongoing)
('APT41 Financial Sector Campaign - Active Targeting', 'Ongoing sophisticated cyber espionage campaign by APT41 (Chinese MSS contractor group) specifically targeting our financial services vertical. Intelligence indicates our organization listed in target database recovered from compromised APT41 infrastructure. Campaign uses zero-day exploits in Microsoft Office (CVE-2023-36884) combined with custom malware for data exfiltration. High probability of spear-phishing attempts against executives and IT administrators.', 'nation_state_targeting', 4, 5, 0.92, 'threat_intelligence_analysis', 1),

('Cl0p Ransomware MOVEit Campaign - Direct Impact', 'Our organization uses MOVEit Transfer for secure file exchange with customers and partners. Cl0p ransomware group actively exploiting CVE-2023-34362 in mass campaign affecting 600+ organizations globally. If successfully exploited, attackers gain access to all files processed through MOVEit including customer PII, financial data, and business contracts. Data theft and public leak threats confirmed in similar victim cases.', 'ransomware_targeting', 5, 4, 0.95, 'vulnerability_impact_analysis', 1),

('Microsoft Exchange NTLM Relay - Hybrid Environment Risk', 'Our hybrid Exchange deployment with Outlook clients presents high-value target for APT28 and APT29 groups actively exploiting CVE-2023-23397. Successful exploitation provides NTLM credential access enabling lateral movement throughout Active Directory environment. No user interaction required making this particularly dangerous for executive and administrative accounts.', 'credential_theft_campaign', 4, 4, 0.88, 'attack_surface_analysis', 1),

-- Supply Chain & Infrastructure Risks (Systemic Threats)
('SolarWinds-Style Supply Chain Attack Risk', 'Our extensive use of third-party software and managed service providers creates significant supply chain attack surface. Recent SUNBURST-like activity detected in monitoring infrastructure suggests threat actors are actively targeting software update mechanisms. Risk amplified by privileged access granted to vendor software including SIEM, backup, and network management platforms.', 'supply_chain_compromise', 3, 5, 0.75, 'supply_chain_risk_assessment', 1),

('Cloud Infrastructure Pivot Risk - Azure/AWS', 'Our multi-cloud environment (Azure production, AWS backup) with extensive use of service principals and cross-tenant access creates lateral movement opportunities for attackers. Recent cryptojacking incidents demonstrate threat actor familiarity with our cloud architecture. Compromised cloud credentials could provide access to production databases, backup data, and customer workloads.', 'cloud_infrastructure_attack', 4, 4, 0.82, 'cloud_security_assessment', 1),

-- Insider Threat & Human Risk Factors  
('Privileged User Insider Threat - Pattern Detection', 'Behavioral analytics detected anomalous access patterns from 3 database administrators and 2 system administrators accessing sensitive data outside normal business hours and job functions. Pattern consistent with insider threat indicators including personal cloud storage usage and unusual database query patterns. Risk elevated due to privileged access to financial and customer data.', 'malicious_insider', 3, 4, 0.65, 'behavioral_analytics_engine', 1),

('Business Email Compromise - Executive Targeting', 'AI-enhanced social engineering campaigns showing unprecedented success rates against C-level executives. Recent incidents include voice cloning attacks and deepfake video calls used to authorize fraudulent wire transfers. Our executives regular media presence provides abundant source material for AI-generated attacks. Financial controls may be insufficient against highly convincing synthetic media attacks.', 'social_engineering_campaign', 3, 4, 0.70, 'threat_landscape_analysis', 1),

-- Emerging Technology Risks (Next-Generation Threats)
('AI-Powered Cyber Attacks - Adaptive Malware', 'Emergence of AI-enhanced malware capable of adaptive behavior and automated evasion. Recent samples demonstrate ability to modify attack vectors based on defensive responses. Our current signature-based and heuristic detection methods may be insufficient against adversarial machine learning techniques. Risk elevated by our extensive use of automated security tools that could be systematically bypassed.', 'ai_enhanced_attacks', 3, 3, 0.60, 'emerging_threat_research', 1);

-- ================================================================
-- SERVICE-RISK RELATIONSHIPS (Dynamic risk-to-service mapping)
-- ================================================================  
INSERT OR IGNORE INTO service_risks (service_id, risk_id, weight) VALUES
-- Map APT41 campaign to critical services (high impact on authentication and data services)
(1, (SELECT id FROM dynamic_risks WHERE title LIKE 'APT41%' LIMIT 1), 0.95), -- Active Directory (primary target)
(2, (SELECT id FROM dynamic_risks WHERE title LIKE 'APT41%' LIMIT 1), 0.85), -- Database services (data theft target)

-- Map Exchange NTLM relay to identity services (credential compromise impact)  
(1, (SELECT id FROM dynamic_risks WHERE title LIKE '%Exchange NTLM%' LIMIT 1), 0.90), -- Active Directory
(2, (SELECT id FROM dynamic_risks WHERE title LIKE '%Exchange NTLM%' LIMIT 1), 0.70), -- Secondary impact on data services

-- Map cloud risks to infrastructure services
(1, (SELECT id FROM dynamic_risks WHERE title LIKE '%Cloud Infrastructure%' LIMIT 1), 0.75), -- Identity services in cloud
(2, (SELECT id FROM dynamic_risks WHERE title LIKE '%Cloud Infrastructure%' LIMIT 1), 0.80), -- Database services in cloud

-- Map insider threat to data-centric services (privileged access abuse)
(2, (SELECT id FROM dynamic_risks WHERE title LIKE 'Privileged User%' LIMIT 1), 0.90), -- Database services (direct access)
(1, (SELECT id FROM dynamic_risks WHERE title LIKE 'Privileged User%' LIMIT 1), 0.75), -- Active Directory (admin access)

-- Map BEC to business services (financial impact)
(2, (SELECT id FROM dynamic_risks WHERE title LIKE '%Business Email%' LIMIT 1), 0.60), -- Impact on business operations
(1, (SELECT id FROM dynamic_risks WHERE title LIKE '%Business Email%' LIMIT 1), 0.50); -- Secondary identity impact

-- ================================================================
-- REALISTIC SYSTEM CONFIGURATION (Enterprise metrics)
-- ================================================================  
INSERT OR REPLACE INTO system_config (key, value, description) VALUES
-- Asset & Infrastructure Metrics
('total_managed_assets', '2847', 'Total IT assets under security management and monitoring'),
('critical_asset_count', '47', 'Assets classified as business-critical requiring enhanced protection'),
('cloud_asset_percentage', '34.7', 'Percentage of assets hosted in public cloud environments'),
('endpoint_count', '1847', 'Total endpoints (laptops, workstations, mobile devices) under management'),
('server_count', '423', 'Total server infrastructure (physical, virtual, cloud)'),

-- Security Metrics (30-day rolling averages)  
('active_threats_detected', '156', 'Active security threats detected and under investigation'),
('critical_vulnerabilities', '23', 'Critical vulnerabilities (CVSS 9.0+) requiring immediate remediation'),
('high_vulnerabilities', '89', 'High severity vulnerabilities (CVSS 7.0-8.9) requiring priority attention'),
('security_incidents_total', '89', 'Total security incidents reported in last 30 days'),
('false_positive_rate', '12.4', 'Security alert false positive rate (percentage)'),

-- Threat Intelligence Metrics
('threat_indicators_active', '2847', 'Active threat indicators in threat intelligence database'), 
('ioc_matches_daily', '156', 'Average daily matches between internal telemetry and threat indicators'),
('threat_feeds_subscribed', '23', 'Commercial and government threat intelligence feeds subscribed'),
('threat_actor_campaigns_tracking', '47', 'Active threat actor campaigns being monitored for relevance'),

-- Operational Security Metrics
('mean_time_to_detect_hours', '4.7', 'Average time to detect security incidents (hours)'),
('mean_time_to_respond_hours', '2.3', 'Average time to begin incident response (hours)'),  
('mean_time_to_contain_hours', '8.9', 'Average time to contain security incidents (hours)'),
('mean_time_to_recover_hours', '23.4', 'Average time for full recovery from security incidents (hours)'),

-- Compliance & Risk Management
('overall_compliance_score', '87.4', 'Weighted average compliance score across all frameworks (percentage)'),
('risk_appetite_score', '15', 'Organizational risk appetite threshold (1-25 scale)'),
('current_risk_exposure', '18.7', 'Current organizational risk exposure score'),
('automation_coverage_percent', '73.2', 'Percentage of security processes with automation implementation'),

-- Performance & Availability 
('security_tool_uptime', '99.2', 'Average uptime for critical security tools (percentage)'),
('log_ingestion_rate_eps', '15247', 'Security log ingestion rate (events per second)'),
('alert_volume_daily', '1847', 'Average daily security alerts generated across all tools'),
('threat_hunting_hours_monthly', '156', 'Monthly hours dedicated to proactive threat hunting activities');

-- ================================================================
-- VERIFICATION & SUMMARY REPORTING
-- ================================================================
SELECT '====== ENTERPRISE SEED DATA DEPLOYMENT COMPLETE ======' as deployment_status;

SELECT 'ASSET INVENTORY:' as category,
  COUNT(*) as total_count,
  COUNT(CASE WHEN criticality = 'Critical' THEN 1 END) as critical_assets,
  COUNT(CASE WHEN criticality = 'High' THEN 1 END) as high_assets,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_assets
FROM assets;

SELECT 'SECURITY INCIDENTS:' as category,
  COUNT(*) as total_incidents,
  COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_incidents,
  COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_incidents,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_incidents
FROM incidents;

SELECT 'VULNERABILITY MANAGEMENT:' as category,
  COUNT(*) as total_vulnerabilities,
  COUNT(CASE WHEN severity = 'Critical' THEN 1 END) as critical_vulns,
  COUNT(CASE WHEN severity = 'High' THEN 1 END) as high_vulns,
  ROUND(AVG(cvss_score), 2) as avg_cvss_score
FROM vulnerabilities;

SELECT 'THREAT INTELLIGENCE:' as category,  
  COUNT(*) as total_indicators,
  COUNT(CASE WHEN severity = 'Critical' THEN 1 END) as critical_threats,
  COUNT(CASE WHEN confidence_level = 'High' OR confidence_level = 'Very_High' THEN 1 END) as high_confidence
FROM threat_indicators;

SELECT 'DYNAMIC RISK ASSESSMENT:' as category,
  COUNT(*) as total_risks,
  COUNT(CASE WHEN impact >= 4 THEN 1 END) as high_impact_risks,
  COUNT(CASE WHEN probability >= 4 THEN 1 END) as high_probability_risks,
  ROUND(AVG(confidence_score), 3) as avg_confidence
FROM dynamic_risks;

SELECT 'PLATFORM READINESS STATUS: ✅ ENTERPRISE-READY' as final_status;
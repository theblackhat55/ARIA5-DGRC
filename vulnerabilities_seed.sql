-- ================================================================
-- ENTERPRISE VULNERABILITIES DATA
-- Schema-compatible version for existing vulnerabilities table
-- ================================================================

-- Clear existing vulnerability test data
DELETE FROM vulnerabilities WHERE id > 1;

-- Insert realistic enterprise vulnerabilities
INSERT OR IGNORE INTO vulnerabilities (name, description, vulnerability_type, category, severity, cvss_score, cve_id, exploitability_score, impact_score, affected_systems, remediation_status, remediation_priority) VALUES

-- Critical Technical Vulnerabilities (CVSS 9.0+)
('Microsoft Outlook NTLM Relay Zero-Click', 'Elevation of privilege vulnerability in Microsoft Outlook allowing NTLM credential theft via specially crafted calendar appointments without user interaction. Actively exploited by APT28 (Fancy Bear) and APT29 (Cozy Bear) in targeted campaigns against government and critical infrastructure since March 2023.', 'Technical', 'Authentication Bypass', 'Critical', 9.8, 'CVE-2023-23397', 5, 5, 'EXCHANGE-HYBRID-01, All Outlook Clients', 'Open', 'Immediate'),

('Microsoft Office RCE RTF Processing', 'Remote code execution vulnerability in Microsoft Office when processing RTF documents allowing arbitrary code execution in user context. Exploited in zero-day attacks by Storm-0978 threat group targeting defense and government sectors with weaponized documents.', 'Technical', 'Document Processing', 'Critical', 9.8, 'CVE-2023-36884', 5, 5, 'All Office Installations, Email Systems', 'Patching', 'Immediate'),

('Progress MOVEit Transfer SQL Injection', 'SQL injection vulnerability in MOVEit Transfer managed file transfer application leading to unauthorized database access and file extraction. Mass exploitation by Cl0p ransomware group resulted in data theft from 600+ organizations worldwide including healthcare and financial institutions.', 'Technical', 'Web Application', 'Critical', 9.8, 'CVE-2023-34362', 5, 5, 'File Transfer Systems, Partner Integration', 'Emergency_Patch', 'Immediate'),

-- High Severity Technical Vulnerabilities (CVSS 7.0-8.9)  
('Windows Streaming Service Proxy LPE', 'Local privilege escalation vulnerability in Windows Streaming Service Proxy allowing standard users to gain SYSTEM privileges through DLL hijacking techniques. Affects domain controllers and member servers running Windows Server 2019/2022.', 'Technical', 'Operating System', 'High', 7.8, 'CVE-2023-36802', 4, 4, 'DC-PRIMARY-01, Windows Servers', 'Open', 'High'),

('curl SOCKS5 Proxy Buffer Overflow', 'Heap buffer overflow in curl SOCKS5 proxy authentication could lead to remote code execution. Affects curl versions 7.69.0 through 8.3.0 used extensively in web applications, API integrations, and automated systems.', 'Technical', 'Network Library', 'High', 8.8, 'CVE-2023-38545', 4, 4, 'WEB-CLUSTER-DMZ, API Systems', 'Open', 'High'),

('WebP Image Processing Buffer Overflow', 'Heap buffer overflow in libwebp WebP image processing library allowing remote code execution via malicious images. Initially discovered as zero-day exploited against journalists and civil society organizations by commercial spyware.', 'Technical', 'Image Processing', 'High', 8.8, 'CVE-2023-4863', 4, 4, 'Web Applications, Browsers', 'Mitigated', 'High'),

-- Procedural Vulnerabilities
('Privileged Account Management Gap', 'Insufficient privileged account management procedures allowing domain administrators to retain elevated privileges beyond required operational windows. Risk of credential misuse or compromise during extended privileged sessions.', 'Procedural', 'Access Management', 'High', 7.2, NULL, 3, 4, 'All Domain Controllers, Admin Workstations', 'Open', 'High'),

('Backup Verification Process Missing', 'Absence of systematic backup integrity verification processes resulting in undetected corruption of backup data. Critical business continuity risk if corrupted backups discovered during disaster recovery scenarios.', 'Procedural', 'Business Continuity', 'Medium', 6.8, NULL, 2, 4, 'BACKUP-VEEAM-PROD, Backup Infrastructure', 'Scheduled', 'Medium'),

-- Physical Security Vulnerabilities  
('Data Center Tailgating Risk', 'Physical access controls at primary data center facility insufficient to prevent unauthorized personnel following authorized individuals through secure entry points. Risk of unauthorized physical access to critical infrastructure.', 'Physical', 'Physical Access', 'Medium', 5.5, NULL, 2, 3, 'DC-PRIMARY-01, Physical Infrastructure', 'Open', 'Medium');

-- Verification Query
SELECT 'VULNERABILITIES LOADED:' as status,
  COUNT(*) as total,
  COUNT(CASE WHEN severity = 'Critical' THEN 1 END) as critical,
  COUNT(CASE WHEN severity = 'High' THEN 1 END) as high,
  COUNT(CASE WHEN severity = 'Medium' THEN 1 END) as medium,
  ROUND(AVG(cvss_score), 2) as avg_cvss
FROM vulnerabilities;
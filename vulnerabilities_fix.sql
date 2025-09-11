-- ================================================================
-- VULNERABILITIES - CORRECT SCHEMA MATCH
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

-- Verification
SELECT 'VULNERABILITIES ADDED:' as status, COUNT(*) as total FROM vulnerabilities;
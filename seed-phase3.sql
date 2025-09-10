-- Phase 3 Risk Management Framework - Seed Data
-- Comprehensive threat modeling and risk assessment data

-- Insert Threat Sources
INSERT OR IGNORE INTO threat_sources (id, name, category, subcategory, description, likelihood_score, sophistication_level, motivation, capability_level, geographic_region, attack_vectors) VALUES
(1, 'Cybercriminal Organizations', 'Adversarial', 'Groups', 'Organized criminal groups focused on financial gain through cyber attacks', 4, 'High', 'Financial', 'High', 'Global', '["Ransomware", "Financial Fraud", "Data Theft", "BEC"]'),
(2, 'Nation-State APT Groups', 'Adversarial', 'Nation States', 'Advanced Persistent Threat groups sponsored by nation-states', 3, 'Advanced', 'Political', 'Nation-State', 'Global', '["Spear Phishing", "Zero-day Exploits", "Supply Chain", "Infrastructure Attacks"]'),
(3, 'Hacktivist Groups', 'Adversarial', 'Groups', 'Ideologically motivated groups targeting organizations for political reasons', 2, 'Medium', 'Ideological', 'Medium', 'Global', '["Website Defacement", "DDoS", "Data Leaks", "Social Engineering"]'),
(4, 'Malicious Insiders', 'Adversarial', 'Individuals', 'Employees or contractors with authorized access who act maliciously', 2, 'Medium', 'Personal', 'Medium', 'Internal', '["Data Theft", "Sabotage", "Fraud", "Privilege Abuse"]'),
(5, 'Script Kiddies', 'Adversarial', 'Individuals', 'Low-skill attackers using readily available tools and techniques', 3, 'Low', 'Personal', 'Low', 'Global', '["Automated Scanning", "Known Exploits", "Social Engineering", "Defacement"]'),
(6, 'Employee Error', 'Non-Adversarial', 'Human Error', 'Unintentional mistakes by employees leading to security incidents', 4, 'Low', 'None', 'Low', 'Internal', '["Misconfiguration", "Accidental Deletion", "Wrong Recipients", "Weak Passwords"]'),
(7, 'System Failures', 'Non-Adversarial', 'System Failures', 'Hardware and software failures causing security or availability issues', 3, 'Low', 'None', 'Low', 'Internal', '["Hardware Failure", "Software Bugs", "Capacity Issues", "Integration Failures"]'),
(8, 'Natural Disasters', 'Non-Adversarial', 'Environmental', 'Natural events that can impact business operations and security', 2, 'Low', 'None', 'Low', 'Geographic', '["Earthquakes", "Floods", "Fires", "Power Outages"]'),
(9, 'Supply Chain Compromises', 'Adversarial', 'Groups', 'Attacks targeting third-party suppliers and vendors', 2, 'High', 'Financial', 'High', 'Global', '["Software Supply Chain", "Hardware Tampering", "Third-party Breaches", "Vendor Compromise"]'),
(10, 'Infrastructure Outages', 'Non-Adversarial', 'Infrastructure Outages', 'External infrastructure failures affecting business operations', 3, 'Low', 'None', 'Low', 'External', '["ISP Failures", "Cloud Outages", "DNS Issues", "CDN Problems"]');

-- Insert Threat Events
INSERT OR IGNORE INTO threat_events (id, name, description, threat_source_id, event_type, attack_method, impact_level, frequency_estimate, mitre_technique_id, kill_chain_phase) VALUES
(1, 'Ransomware Attack', 'Malicious software encrypts critical systems and demands payment for decryption', 1, 'Attack', 'Ransomware', 'Critical', 'Occasional', 'T1486', 'Actions on Objectives'),
(2, 'Data Exfiltration', 'Unauthorized extraction of sensitive business or customer data', 2, 'Attack', 'Data Theft', 'High', 'Occasional', 'T1041', 'Exfiltration'),
(3, 'Phishing Campaign', 'Email-based attacks designed to steal credentials or deliver malware', 1, 'Attack', 'Phishing', 'Medium', 'Likely', 'T1566', 'Initial Access'),
(4, 'DDoS Attack', 'Distributed denial of service attacks targeting web services', 3, 'Attack', 'Network Flood', 'Medium', 'Occasional', 'T1498', 'Impact'),
(5, 'Insider Data Theft', 'Employee or contractor stealing sensitive information', 4, 'Attack', 'Data Theft', 'High', 'Unlikely', 'T1005', 'Collection'),
(6, 'Accidental Data Deletion', 'Employee accidentally deletes critical business data', 6, 'Error', 'Human Error', 'Medium', 'Occasional', 'N/A', 'N/A'),
(7, 'System Configuration Error', 'Misconfiguration leading to security exposure or service disruption', 6, 'Error', 'Misconfiguration', 'Medium', 'Likely', 'N/A', 'N/A'),
(8, 'Hardware Failure', 'Critical hardware component failure causing system outage', 7, 'Failure', 'Hardware Failure', 'High', 'Occasional', 'N/A', 'N/A'),
(9, 'Software Vulnerability Exploitation', 'Attackers exploiting known or zero-day vulnerabilities', 1, 'Attack', 'Exploit', 'High', 'Likely', 'T1190', 'Initial Access'),
(10, 'Cloud Service Outage', 'Third-party cloud provider experiencing service disruption', 10, 'Failure', 'Service Outage', 'Medium', 'Occasional', 'N/A', 'N/A');

-- Insert Vulnerabilities
INSERT OR IGNORE INTO vulnerabilities (id, name, description, vulnerability_type, category, severity, cvss_score, exploitability_score, impact_score, remediation_effort) VALUES
(1, 'Unpatched Operating Systems', 'Server operating systems missing critical security patches', 'Technical', 'Software', 'High', 8.5, 4, 4, 'Medium'),
(2, 'Weak Password Policy', 'Inadequate password complexity requirements enabling credential attacks', 'Procedural', 'Process', 'Medium', 6.2, 3, 3, 'Low'),
(3, 'Unsecured Database Access', 'Database systems accessible without proper authentication controls', 'Technical', 'Configuration', 'Critical', 9.2, 5, 5, 'High'),
(4, 'Insufficient Access Controls', 'Users having excessive permissions beyond job requirements', 'Procedural', 'Process', 'Medium', 5.8, 3, 3, 'Medium'),
(5, 'Outdated Web Applications', 'Web applications running on outdated frameworks with known vulnerabilities', 'Technical', 'Software', 'High', 7.8, 4, 4, 'High'),
(6, 'Inadequate Backup Procedures', 'Backup systems not tested or not covering all critical data', 'Procedural', 'Process', 'Medium', 5.5, 2, 4, 'Medium'),
(7, 'Unsecured Network Protocols', 'Use of unencrypted protocols for sensitive data transmission', 'Technical', 'Configuration', 'High', 7.2, 4, 3, 'Medium'),
(8, 'Physical Security Gaps', 'Inadequate physical controls for server rooms and workstations', 'Physical', 'Physical', 'Medium', 5.0, 2, 3, 'Low'),
(9, 'Insufficient Security Training', 'Employees lack awareness of current security threats and procedures', 'Personnel', 'Training', 'Medium', 6.0, 3, 3, 'Low'),
(10, 'Inadequate Incident Response', 'Lack of documented and tested incident response procedures', 'Procedural', 'Process', 'High', 6.8, 2, 4, 'Medium');

-- Insert Phase 3 Assets (Primary and Supporting)
INSERT OR IGNORE INTO phase3_assets (id, name, asset_type, category, subcategory, criticality, confidentiality_impact, integrity_impact, availability_impact, business_function, estimated_value, revenue_dependency) VALUES
-- Primary Assets (Core Business)
(1, 'Customer Database', 'Primary', 'Data', 'Customer PII', 'Critical', 'High', 'High', 'Medium', 'Customer Management', 5000000.00, 2000000.00),
(2, 'Financial Transaction System', 'Primary', 'Systems', 'Financial Processing', 'Critical', 'High', 'High', 'High', 'Payment Processing', 10000000.00, 5000000.00),
(3, 'E-commerce Platform', 'Primary', 'Applications', 'Web Application', 'High', 'Medium', 'High', 'High', 'Online Sales', 3000000.00, 1500000.00),
(4, 'Intellectual Property', 'Primary', 'Data', 'Trade Secrets', 'Critical', 'High', 'High', 'Low', 'Product Development', 15000000.00, 3000000.00),
(5, 'Brand Reputation', 'Primary', 'Reputation', 'Public Trust', 'Critical', 'Medium', 'High', 'Low', 'Marketing & Sales', 8000000.00, 4000000.00),

-- Supporting Assets (Infrastructure)
(6, 'Web Servers', 'Supporting', 'Infrastructure', 'Computing', 'High', 'Low', 'Medium', 'High', 'Web Hosting', 200000.00, 500000.00),
(7, 'Database Servers', 'Supporting', 'Infrastructure', 'Data Storage', 'Critical', 'High', 'High', 'High', 'Data Management', 500000.00, 1000000.00),
(8, 'Network Infrastructure', 'Supporting', 'Infrastructure', 'Networking', 'High', 'Low', 'Medium', 'High', 'Connectivity', 300000.00, 800000.00),
(9, 'Backup Systems', 'Supporting', 'Systems', 'Data Protection', 'High', 'High', 'High', 'Medium', 'Business Continuity', 150000.00, 2000000.00),
(10, 'Security Monitoring Tools', 'Supporting', 'Systems', 'Security', 'Medium', 'Medium', 'Medium', 'Medium', 'Threat Detection', 100000.00, 200000.00),
(11, 'Employee Workstations', 'Supporting', 'Infrastructure', 'Computing', 'Medium', 'Medium', 'Low', 'Medium', 'Productivity', 400000.00, 300000.00),
(12, 'Cloud Infrastructure', 'Supporting', 'Infrastructure', 'Cloud Services', 'High', 'Medium', 'High', 'High', 'Service Delivery', 600000.00, 1200000.00);

-- Insert Security Controls
INSERT OR IGNORE INTO security_controls (id, name, control_id, control_type, control_category, description, effectiveness_rating, implementation_status, compliance_frameworks) VALUES
-- Preventive Controls
(1, 'Firewall Protection', 'NET-001', 'Preventive', 'Technological', 'Network firewalls blocking unauthorized access attempts', 4, 'Implemented', '["ISO27001", "NIST", "SOC2"]'),
(2, 'Access Control Lists', 'IAM-001', 'Preventive', 'Technological', 'Role-based access controls limiting system access', 4, 'Implemented', '["ISO27001", "NIST", "SOC2"]'),
(3, 'Security Awareness Training', 'HR-001', 'Preventive', 'People', 'Regular cybersecurity training for all employees', 3, 'Implemented', '["ISO27001", "NIST"]'),
(4, 'Patch Management', 'SYS-001', 'Preventive', 'Technological', 'Automated system for applying security patches', 4, 'Implemented', '["ISO27001", "NIST", "SOC2"]'),
(5, 'Data Encryption', 'DATA-001', 'Preventive', 'Technological', 'Encryption of sensitive data at rest and in transit', 5, 'Implemented', '["ISO27001", "NIST", "SOC2", "PCI"]'),

-- Detective Controls  
(6, 'Security Information Event Management', 'MON-001', 'Detective', 'Technological', 'SIEM system for real-time security monitoring', 4, 'Implemented', '["ISO27001", "NIST", "SOC2"]'),
(7, 'Intrusion Detection System', 'MON-002', 'Detective', 'Technological', 'Network-based intrusion detection and alerting', 3, 'Implemented', '["ISO27001", "NIST"]'),
(8, 'Vulnerability Scanning', 'VULN-001', 'Detective', 'Technological', 'Regular automated vulnerability assessments', 4, 'Implemented', '["ISO27001", "NIST", "SOC2"]'),
(9, 'Log Monitoring', 'LOG-001', 'Detective', 'Technological', 'Centralized logging and analysis of security events', 3, 'Implemented', '["ISO27001", "SOC2"]'),
(10, 'Security Audits', 'AUDIT-001', 'Detective', 'Organizational', 'Regular internal and external security assessments', 4, 'Implemented', '["ISO27001", "SOC2"]'),

-- Corrective Controls
(11, 'Incident Response Plan', 'INC-001', 'Corrective', 'Organizational', 'Documented procedures for security incident handling', 3, 'Implemented', '["ISO27001", "NIST", "SOC2"]'),
(12, 'Backup and Recovery', 'BCM-001', 'Corrective', 'Technological', 'Automated backup and disaster recovery procedures', 4, 'Implemented', '["ISO27001", "NIST", "SOC2"]'),
(13, 'Forensic Analysis Capability', 'FOR-001', 'Corrective', 'Organizational', 'Digital forensics tools and procedures', 2, 'In Progress', '["ISO27001", "NIST"]'),
(14, 'System Isolation Procedures', 'INC-002', 'Corrective', 'Technological', 'Ability to quickly isolate compromised systems', 3, 'Implemented', '["ISO27001", "NIST"]'),
(15, 'Communication Plan', 'COM-001', 'Corrective', 'Organizational', 'Crisis communication procedures for security incidents', 3, 'Implemented', '["ISO27001", "SOC2"]');

-- Insert Risk Relationships
INSERT OR IGNORE INTO risk_relationships (relationship_type, source_type, source_id, target_type, target_id, relationship_strength, confidence_level) VALUES
-- Threat Sources → Threat Events
('threatens', 'threat_source', 1, 'threat_event', 1, 'High', 'High'),  -- Cybercriminals → Ransomware
('threatens', 'threat_source', 1, 'threat_event', 3, 'High', 'High'),  -- Cybercriminals → Phishing  
('threatens', 'threat_source', 2, 'threat_event', 2, 'High', 'High'),  -- Nation States → Data Exfiltration
('threatens', 'threat_source', 3, 'threat_event', 4, 'High', 'High'),  -- Hacktivists → DDoS
('threatens', 'threat_source', 4, 'threat_event', 5, 'High', 'High'),  -- Insiders → Data Theft
('threatens', 'threat_source', 6, 'threat_event', 6, 'High', 'High'),  -- Human Error → Data Deletion
('threatens', 'threat_source', 7, 'threat_event', 8, 'High', 'High'),  -- System Failures → Hardware Failure

-- Threat Events → Vulnerabilities (Exploitation)
('exploits', 'threat_event', 1, 'vulnerability', 1, 'High', 'High'),   -- Ransomware → Unpatched Systems
('exploits', 'threat_event', 3, 'vulnerability', 2, 'High', 'High'),   -- Phishing → Weak Passwords
('exploits', 'threat_event', 2, 'vulnerability', 3, 'High', 'High'),   -- Data Exfiltration → Unsecured DB
('exploits', 'threat_event', 9, 'vulnerability', 5, 'High', 'High'),   -- Vuln Exploitation → Outdated Apps

-- Vulnerabilities → Assets (Impact)
('impacts', 'vulnerability', 1, 'asset', 7, 'High', 'High'),           -- Unpatched Systems → Database Servers
('impacts', 'vulnerability', 3, 'asset', 1, 'High', 'High'),           -- Unsecured DB → Customer Database
('impacts', 'vulnerability', 5, 'asset', 3, 'High', 'High'),           -- Outdated Apps → E-commerce Platform

-- Controls → Threats/Vulnerabilities (Mitigation)  
('mitigates', 'control', 1, 'threat_event', 1, 'Medium', 'High'),      -- Firewall → Ransomware
('mitigates', 'control', 4, 'vulnerability', 1, 'High', 'High'),       -- Patch Management → Unpatched Systems
('mitigates', 'control', 5, 'vulnerability', 3, 'High', 'High'),       -- Encryption → Unsecured DB
('mitigates', 'control', 6, 'threat_event', 2, 'Medium', 'High'),      -- SIEM → Data Exfiltration

-- Controls → Assets (Protection)
('protects', 'control', 1, 'asset', 6, 'High', 'High'),                -- Firewall → Web Servers
('protects', 'control', 2, 'asset', 1, 'High', 'High'),                -- Access Control → Customer Database  
('protects', 'control', 5, 'asset', 2, 'High', 'High'),                -- Encryption → Financial System
('protects', 'control', 12, 'asset', 1, 'High', 'High');               -- Backup → Customer Database

-- Insert Sample Risk Assessments
INSERT OR IGNORE INTO risk_assessments (id, assessment_name, threat_source_id, threat_event_id, vulnerability_id, asset_id, inherent_likelihood, inherent_impact, inherent_risk_score, residual_likelihood, residual_impact, residual_risk_score, risk_level, risk_treatment, risk_owner) VALUES
(1, 'Ransomware Risk to Database Servers', 1, 1, 1, 7, 4, 5, 20, 2, 4, 8, 'High', 'Mitigate', 'IT Security Team'),
(2, 'Data Exfiltration Risk to Customer Database', 2, 2, 3, 1, 3, 5, 15, 2, 3, 6, 'Medium', 'Mitigate', 'Data Protection Officer'),
(3, 'Phishing Risk to E-commerce Platform', 1, 3, 2, 3, 4, 4, 16, 2, 3, 6, 'Medium', 'Mitigate', 'Security Awareness Team'),
(4, 'Hardware Failure Risk to Financial System', 7, 8, 6, 2, 3, 5, 15, 2, 2, 4, 'Low', 'Accept', 'Infrastructure Team'),
(5, 'Insider Threat to Intellectual Property', 4, 5, 4, 4, 2, 5, 10, 1, 4, 4, 'Low', 'Mitigate', 'HR Security Team');

-- Insert Compliance Framework Mappings
INSERT OR IGNORE INTO compliance_framework_mappings (id, framework_name, framework_version, control_reference, control_title, mapped_security_control_id, compliance_status) VALUES
-- ISO 27001 Mappings
(1, 'ISO 27001', '2022', 'A.5.1', 'Information security policies', 3, 'Compliant'),
(2, 'ISO 27001', '2022', 'A.9.1', 'Access control policy', 2, 'Compliant'),
(3, 'ISO 27001', '2022', 'A.10.1', 'Cryptographic controls', 5, 'Compliant'),
(4, 'ISO 27001', '2022', 'A.12.1', 'Operational procedures', 11, 'Compliant'),
(5, 'ISO 27001', '2022', 'A.12.6', 'Management of technical vulnerabilities', 8, 'Compliant'),

-- NIST CSF Mappings  
(6, 'NIST CSF', '2.0', 'PR.AC-1', 'Identity and access management', 2, 'Compliant'),
(7, 'NIST CSF', '2.0', 'PR.DS-1', 'Data-at-rest protection', 5, 'Compliant'),
(8, 'NIST CSF', '2.0', 'DE.CM-1', 'Network monitoring', 6, 'Compliant'),
(9, 'NIST CSF', '2.0', 'RS.RP-1', 'Response plan execution', 11, 'Compliant'),
(10, 'NIST CSF', '2.0', 'RC.RP-1', 'Recovery plan execution', 12, 'Compliant'),

-- SOC 2 Mappings
(11, 'SOC 2', 'Type II', 'CC6.1', 'Logical access controls', 2, 'Compliant'),
(12, 'SOC 2', 'Type II', 'CC6.3', 'Access removal controls', 2, 'Compliant'),
(13, 'SOC 2', 'Type II', 'CC7.1', 'System monitoring', 6, 'Compliant'),
(14, 'SOC 2', 'Type II', 'A1.2', 'Backup and recovery', 12, 'Compliant'),
(15, 'SOC 2', 'Type II', 'CC7.4', 'Incident response', 11, 'Compliant');
-- ARIA5-DGRC Phase 1 Seed Data
-- Essential demo data for Dynamic GRC platform

-- Insert admin user with proper PBKDF2 hash (password: demo123)
INSERT OR IGNORE INTO users (
  id, username, email, password_hash, password_salt, 
  first_name, last_name, role, organization_id, is_active
) VALUES (
  1, 
  'admin', 
  'admin@aria5-dgrc.com', 
  'e438e5e8a36e5f632b9f04800f0b91c251f99e66e1756340e8560cbaf238ba664037f5b859cbaa522b16449e9a956b635decd3af3201ef83f97f6b73dc4b91d4', 
  'secure_salt_2025',
  'ARIA5', 
  'Administrator', 
  'admin', 
  1, 
  1
);

-- Insert demo services for testing
INSERT OR IGNORE INTO services (
  name, description, criticality_level, 
  confidentiality_score, integrity_score, availability_score,
  owner_id, organization_id, status
) VALUES
('Customer Database', 'Primary customer data repository', 'critical', 5, 5, 4, 1, 1, 'active'),
('Web Application', 'Customer-facing web application', 'high', 3, 4, 5, 1, 1, 'active'),
('Payment Gateway', 'Payment processing service', 'critical', 5, 5, 5, 1, 1, 'active'),
('Email Service', 'Email notification system', 'medium', 2, 3, 3, 1, 1, 'active'),
('Analytics Platform', 'Business intelligence and analytics', 'medium', 3, 3, 2, 1, 1, 'active');

-- Insert demo service dependencies
INSERT OR IGNORE INTO service_dependencies (
  service_id, depends_on_service_id, dependency_type, criticality
) VALUES
(2, 1, 'data', 'high'),        -- Web App depends on Database
(2, 3, 'functional', 'high'),  -- Web App depends on Payment Gateway
(2, 4, 'functional', 'medium'), -- Web App depends on Email Service
(5, 1, 'data', 'medium'),      -- Analytics depends on Database
(5, 2, 'data', 'low');         -- Analytics depends on Web App

-- Insert demo risks with various statuses
INSERT OR IGNORE INTO risks (
  title, description, category, source, confidence_score,
  owner_id, organization_id, probability, impact, status, approval_status
) VALUES
('SQL Injection Vulnerability', 'Database vulnerable to SQL injection attacks', 'Security', 'ai_analysis', 0.9, 1, 1, 4, 5, 'pending', 'pending'),
('DDoS Attack Risk', 'Web application susceptible to distributed denial of service', 'Security', 'threat_intel', 0.8, 1, 1, 3, 4, 'active', 'approved'),
('Payment Data Breach', 'Risk of payment information exposure', 'Security', 'manual', 1.0, 1, 1, 2, 5, 'active', 'approved'),
('Email Service Outage', 'Email service may become unavailable', 'Operational', 'external_api', 0.7, 1, 1, 3, 2, 'active', 'approved'),
('Compliance Violation', 'Risk of failing regulatory compliance audit', 'Compliance', 'manual', 1.0, 1, 1, 2, 4, 'pending', 'pending');

-- Map risks to services for cascading
INSERT OR IGNORE INTO service_risks (service_id, risk_id, weight) VALUES
(1, 1, 1.0),  -- Database → SQL Injection (primary impact)
(2, 1, 0.8),  -- Web App → SQL Injection (cascaded impact)
(2, 2, 1.0),  -- Web App → DDoS (primary impact)
(3, 3, 1.0),  -- Payment Gateway → Data Breach (primary impact)
(2, 3, 0.6),  -- Web App → Data Breach (cascaded impact)
(4, 4, 1.0),  -- Email Service → Outage (primary impact)
(2, 4, 0.3),  -- Web App → Email Outage (cascaded impact)
(1, 5, 0.7),  -- Database → Compliance (cascaded impact)
(3, 5, 0.9);  -- Payment Gateway → Compliance (high cascaded impact)

-- Update system config with phase 1 settings
INSERT OR REPLACE INTO system_config (key, value, description) VALUES
('platform_version', '5.1.0-phase1', 'Current platform version'),
('last_migration', '0002_seed_data_phase1', 'Last applied migration'),
('setup_complete', 'true', 'Phase 1 setup completion status'),
('demo_mode', 'true', 'Enable demo mode with sample data');
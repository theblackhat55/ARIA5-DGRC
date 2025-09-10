-- Phase 1 Dynamic Risk Foundation - Seed Data (Schema Matched)
-- Service-centric architecture with CIA triad scoring and dynamic risk examples

-- Insert Business Services with CIA Triad Scoring (matching current schema)
INSERT OR IGNORE INTO business_services (
  id, name, description, business_owner, technical_owner, 
  confidentiality_impact, integrity_impact, availability_impact, 
  criticality_level, business_impact_tier, revenue_dependency, 
  customer_facing, service_status, deployment_environment
) VALUES
-- Core Revenue Services (Critical)
(1, 'E-commerce Platform', 'Main customer-facing e-commerce website and API', 'Sarah Chen', 'Mike Rodriguez', 4, 5, 5, 'Critical', 1, TRUE, TRUE, 'Active', 'Production'),
(2, 'Payment Processing System', 'Credit card and payment transaction processing', 'David Kim', 'Alex Thompson', 5, 5, 5, 'Critical', 1, TRUE, FALSE, 'Active', 'Production'),
(3, 'Customer Database', 'Primary customer data and PII storage system', 'Lisa Wang', 'Tom Wilson', 5, 4, 4, 'Critical', 1, TRUE, FALSE, 'Active', 'Production'),
(4, 'Order Management System', 'Order processing, fulfillment and inventory', 'John Davis', 'Emma Johnson', 3, 5, 4, 'High', 2, TRUE, FALSE, 'Active', 'Production'),

-- Customer Service & Support (High)
(5, 'Customer Support Portal', 'Help desk, ticketing and knowledge base', 'Maria Garcia', 'Chris Lee', 3, 3, 4, 'High', 2, FALSE, TRUE, 'Active', 'Production'),
(6, 'CRM System', 'Customer relationship management and sales', 'Robert Taylor', 'Jessica Brown', 4, 4, 3, 'High', 2, TRUE, FALSE, 'Active', 'Production'),
(7, 'Live Chat System', 'Real-time customer chat support', 'Susan Miller', 'Daniel White', 2, 2, 4, 'Medium', 3, FALSE, TRUE, 'Active', 'Production'),

-- Core Infrastructure Services (High)
(8, 'Active Directory', 'Identity and access management system', 'Kevin Anderson', 'Rachel Green', 4, 5, 4, 'High', 2, FALSE, FALSE, 'Active', 'Production'),
(9, 'Email System', 'Corporate email and communication platform', 'Amy Clark', 'Steve Harris', 3, 3, 4, 'Medium', 3, FALSE, FALSE, 'Active', 'Production'),
(10, 'File Storage System', 'Shared file storage and collaboration', 'Brian Lewis', 'Nicole Adams', 3, 4, 3, 'Medium', 3, FALSE, FALSE, 'Active', 'Production'),

-- Data & Analytics Services (Medium-High)
(11, 'Data Warehouse', 'Business intelligence and analytics data store', 'Jennifer Martinez', 'Paul Turner', 4, 4, 3, 'High', 2, TRUE, FALSE, 'Active', 'Production'),
(12, 'Reporting System', 'Business reporting and dashboard platform', 'Michael Wright', 'Laura Scott', 3, 4, 3, 'Medium', 3, FALSE, FALSE, 'Active', 'Production'),
(13, 'Backup System', 'Enterprise backup and disaster recovery', 'Gary Cooper', 'Helen King', 4, 5, 5, 'High', 2, FALSE, FALSE, 'Active', 'Production'),

-- Development & DevOps (Medium)
(14, 'CI/CD Pipeline', 'Continuous integration and deployment system', 'Ryan Mitchell', 'Sophia Davis', 2, 4, 3, 'Medium', 3, FALSE, FALSE, 'Active', 'Production'),
(15, 'Source Code Repository', 'Git repository and version control system', 'Nathan Phillips', 'Grace Wilson', 4, 5, 3, 'Medium', 3, FALSE, FALSE, 'Active', 'Production'),
(16, 'Monitoring System', 'Application and infrastructure monitoring', 'Lisa Campbell', 'James Moore', 2, 3, 4, 'Medium', 3, FALSE, FALSE, 'Active', 'Production'),

-- Security Services (High)  
(17, 'SIEM Platform', 'Security information and event management', 'Marcus Johnson', 'Karen Martinez', 4, 4, 4, 'High', 2, FALSE, FALSE, 'Active', 'Production'),
(18, 'Vulnerability Scanner', 'Automated security vulnerability assessment', 'Diana Rodriguez', 'Tony Garcia', 3, 3, 3, 'Medium', 3, FALSE, FALSE, 'Active', 'Production'),
(19, 'Firewall Management', 'Network security and access control', 'Victor Brown', 'Amanda Taylor', 3, 4, 5, 'High', 2, FALSE, FALSE, 'Active', 'Production'),

-- External Facing Services (High)
(20, 'Corporate Website', 'Public marketing and information website', 'Michelle Lee', 'Andrew Clark', 2, 3, 3, 'Medium', 3, FALSE, TRUE, 'Active', 'Production'),
(21, 'API Gateway', 'External API management and rate limiting', 'Carlos Rodriguez', 'Samantha White', 3, 4, 5, 'High', 2, FALSE, TRUE, 'Active', 'Production'),
(22, 'Content Delivery Network', 'Global content distribution and caching', 'Patricia Davis', 'Kevin Thompson', 1, 2, 5, 'Medium', 3, FALSE, TRUE, 'Active', 'Production');

-- Insert Service-Asset Relationships (Risk Cascading)
INSERT OR IGNORE INTO service_assets (service_id, asset_id, dependency_type, impact_weight, criticality_level, relationship_notes) VALUES
-- E-commerce Platform dependencies
(1, 1, 'depends_on', 2.0, 'Critical', 'E-commerce platform runs on web servers'),
(1, 3, 'depends_on', 1.5, 'High', 'E-commerce connects to database servers'),
(1, 21, 'depends_on', 1.8, 'High', 'E-commerce uses API gateway for external APIs'),

-- Payment Processing dependencies  
(2, 3, 'depends_on', 2.5, 'Critical', 'Payment system requires secure database access'),
(2, 19, 'depends_on', 2.0, 'Critical', 'Payment processing requires firewall protection'),
(2, 8, 'depends_on', 1.8, 'High', 'Payment system uses AD for authentication'),

-- Customer Database dependencies
(3, 3, 'hosts_on', 3.0, 'Critical', 'Customer data hosted on database servers'),
(3, 13, 'depends_on', 2.2, 'High', 'Customer DB protected by backup system'),
(3, 8, 'depends_on', 1.5, 'Medium', 'Database authentication via Active Directory'),

-- Order Management dependencies
(4, 1, 'depends_on', 1.8, 'High', 'Order system runs on application servers'),
(4, 3, 'depends_on', 2.0, 'Critical', 'Order management uses customer database'),
(4, 2, 'depends_on', 2.5, 'Critical', 'Order processing integrates with payments'),

-- Infrastructure service dependencies
(8, 2, 'hosts_on', 2.5, 'Critical', 'Active Directory hosted on dedicated servers'),
(9, 2, 'hosts_on', 1.8, 'High', 'Email system runs on messaging servers'),
(10, 4, 'hosts_on', 2.0, 'High', 'File storage uses dedicated storage servers');

-- Insert Dynamic Risks (Auto-Generated Examples vs Manual)
INSERT OR IGNORE INTO dynamic_risks (
  id, title, description, service_id, risk_type, 
  likelihood, impact, risk_score, confidence_score, 
  source_type, generation_method, auto_approved, 
  created_at, last_updated
) VALUES
-- Auto-Generated Dynamic Risks (High Confidence)
(1, 'High CPU Usage on Payment System', 'CPU utilization exceeded 85% threshold for 15+ minutes on payment processing servers', 2, 'Performance', 4, 5, 20, 0.92, 'Infrastructure Monitoring', 'Auto-Generated', TRUE, datetime('now', '-2 hours'), datetime('now', '-5 minutes')),
(2, 'Elevated Failed Login Attempts', 'Suspicious authentication patterns detected: 150+ failed logins in 10 minutes', 8, 'Security', 3, 4, 12, 0.88, 'SIEM Alert', 'Auto-Generated', TRUE, datetime('now', '-1 hour'), datetime('now', '-10 minutes')),
(3, 'Database Connection Pool Exhaustion', 'Customer database connection pool at 95% capacity, potential service degradation', 3, 'Performance', 4, 4, 16, 0.85, 'Database Monitoring', 'Auto-Generated', TRUE, datetime('now', '-30 minutes'), datetime('now', '-2 minutes')),
(4, 'SSL Certificate Expiring Soon', 'E-commerce platform SSL certificate expires in 7 days', 1, 'Compliance', 2, 3, 6, 0.98, 'Certificate Monitor', 'Auto-Generated', TRUE, datetime('now', '-6 hours'), datetime('now', '-1 hour')),

-- Auto-Generated Dynamic Risks (Medium Confidence - Requires Review)  
(5, 'Unusual Network Traffic Pattern', 'Abnormal outbound traffic detected from API Gateway: 300% increase', 21, 'Security', 3, 3, 9, 0.65, 'Network Monitoring', 'Auto-Generated', FALSE, datetime('now', '-45 minutes'), datetime('now', '-15 minutes')),
(6, 'Backup Verification Failure', 'Automated backup integrity check failed for customer database', 13, 'Operational', 2, 5, 10, 0.72, 'Backup System', 'Auto-Generated', FALSE, datetime('now', '-3 hours'), datetime('now', '-1 hour')),
(7, 'Memory Leak Suspected', 'CRM system memory usage trending upward: 40% increase over 24 hours', 6, 'Performance', 3, 3, 9, 0.68, 'Application Monitoring', 'Auto-Generated', FALSE, datetime('now', '-8 hours'), datetime('now', '-30 minutes')),

-- Manual Risks (Traditional GRC Process)
(8, 'Third-Party Payment Processor Risk Assessment', 'Annual review of payment processor security controls and compliance status', 2, 'Third Party', 2, 4, 8, 1.0, 'Manual Assessment', 'Manual Entry', TRUE, datetime('now', '-2 days'), datetime('now', '-2 days')),
(9, 'GDPR Compliance Gap Analysis', 'Quarterly review of customer data handling procedures for GDPR compliance', 3, 'Compliance', 3, 3, 9, 1.0, 'Manual Assessment', 'Manual Entry', TRUE, datetime('now', '-1 week'), datetime('now', '-1 week')),
(10, 'Disaster Recovery Plan Update', 'Annual update and testing of business continuity procedures', 13, 'Operational', 2, 4, 8, 1.0, 'Manual Assessment', 'Manual Entry', TRUE, datetime('now', '-1 month'), datetime('now', '-1 month'));

-- Insert Risk Score History (Service-Level CIA Calculations)
INSERT OR IGNORE INTO risk_score_history (service_id, confidentiality_score, integrity_score, availability_score, composite_score, calculation_timestamp, calculation_method) VALUES
-- E-commerce Platform (Service ID: 1)
(1, 3.2, 4.8, 4.6, 4.2, datetime('now', '-1 hour'), 'Dynamic Risk Aggregation'),
(1, 3.0, 4.5, 4.8, 4.1, datetime('now', '-2 hours'), 'Dynamic Risk Aggregation'),
(1, 2.8, 4.2, 4.5, 3.8, datetime('now', '-3 hours'), 'Dynamic Risk Aggregation'),

-- Payment Processing (Service ID: 2) 
(2, 4.8, 4.9, 4.2, 4.6, datetime('now', '-1 hour'), 'Dynamic Risk Aggregation'),
(2, 4.5, 4.8, 4.0, 4.4, datetime('now', '-2 hours'), 'Dynamic Risk Aggregation'),
(2, 4.2, 4.6, 3.8, 4.2, datetime('now', '-3 hours'), 'Dynamic Risk Aggregation'),

-- Customer Database (Service ID: 3)
(3, 4.6, 4.2, 3.8, 4.2, datetime('now', '-1 hour'), 'Dynamic Risk Aggregation'),
(3, 4.4, 4.0, 3.6, 4.0, datetime('now', '-2 hours'), 'Dynamic Risk Aggregation'),
(3, 4.2, 3.8, 3.4, 3.8, datetime('now', '-3 hours'), 'Dynamic Risk Aggregation');

-- Insert Integration Sources (External System Configuration)
INSERT OR IGNORE INTO integration_sources (
  id, name, source_type, endpoint_url, authentication_method, 
  polling_interval, last_sync, sync_status, risk_generation_enabled, 
  confidence_threshold, auto_approval_threshold
) VALUES
(1, 'Datadog Infrastructure Monitoring', 'Monitoring', 'https://api.datadoghq.com/api/v1/metrics', 'API_KEY', 300, datetime('now', '-5 minutes'), 'Connected', TRUE, 0.80, 0.90),
(2, 'Splunk SIEM Platform', 'SIEM', 'https://splunk.company.com:8089/services/search', 'TOKEN', 180, datetime('now', '-3 minutes'), 'Connected', TRUE, 0.75, 0.85),
(3, 'AWS CloudWatch', 'Infrastructure', 'https://monitoring.us-east-1.amazonaws.com', 'AWS_IAM', 600, datetime('now', '-8 minutes'), 'Connected', TRUE, 0.85, 0.92),
(4, 'Qualys Vulnerability Scanner', 'Vulnerability', 'https://qualysapi.qualys.com/api/2.0/fo/', 'BASIC_AUTH', 86400, datetime('now', '-2 hours'), 'Connected', TRUE, 0.70, 0.80),
(5, 'CertBot SSL Monitor', 'Certificate', 'https://api.company.com/certificates', 'API_KEY', 43200, datetime('now', '-6 hours'), 'Connected', TRUE, 0.95, 0.98);

-- Insert Risk Approval Queue (ML Confidence Workflow)
INSERT OR IGNORE INTO risk_approval_queue (
  risk_id, assigned_to, priority_level, confidence_score, 
  ml_recommendation, review_reason, created_at, due_date
) VALUES
(5, 'security-team@company.com', 'High', 0.65, 'REVIEW_REQUIRED', 'Network anomaly below auto-approval threshold', datetime('now', '-45 minutes'), datetime('now', '+2 hours')),
(6, 'ops-team@company.com', 'Critical', 0.72, 'REVIEW_REQUIRED', 'Backup failure requires immediate attention', datetime('now', '-3 hours'), datetime('now', '+1 hour')),
(7, 'dev-team@company.com', 'Medium', 0.68, 'REVIEW_REQUIRED', 'Memory trend analysis needs validation', datetime('now', '-8 hours'), datetime('now', '+4 hours'));

-- Insert Service Risk Aggregation (Real-Time Service Scoring)
INSERT OR IGNORE INTO service_risk_aggregation (
  service_id, active_risks_count, avg_risk_score, max_risk_score, 
  trending_direction, last_calculated, calculation_confidence
) VALUES
(1, 2, 13.0, 20, 'Stable', datetime('now', '-5 minutes'), 0.89),
(2, 1, 20.0, 20, 'Increasing', datetime('now', '-5 minutes'), 0.92),
(3, 2, 13.0, 16, 'Decreasing', datetime('now', '-5 minutes'), 0.87),
(6, 1, 9.0, 9, 'Stable', datetime('now', '-5 minutes'), 0.68),
(8, 1, 12.0, 12, 'Increasing', datetime('now', '-5 minutes'), 0.88),
(13, 1, 10.0, 10, 'Critical', datetime('now', '-5 minutes'), 0.72),
(21, 1, 9.0, 9, 'Stable', datetime('now', '-5 minutes'), 0.65);

-- Insert sample asset records to support service-asset relationships
INSERT OR IGNORE INTO assets (id, name, type, criticality, owner, location) VALUES
(1, 'Web Application Servers', 'Server', 'Critical', 'Infrastructure Team', 'AWS US-East-1'),
(2, 'Database Servers', 'Server', 'Critical', 'Database Team', 'AWS US-East-1'),
(3, 'Customer Database Instance', 'Database', 'Critical', 'Database Team', 'AWS RDS'),
(4, 'File Storage Array', 'Storage', 'High', 'Infrastructure Team', 'On-Premises DC'),
(19, 'Corporate Firewall Cluster', 'Network', 'Critical', 'Security Team', 'Network DMZ'),
(21, 'API Gateway Load Balancer', 'Network', 'High', 'Infrastructure Team', 'AWS ALB');

-- Verify data insertion
SELECT 'Business Services Inserted:' as summary, COUNT(*) as count FROM business_services
UNION ALL
SELECT 'Dynamic Risks Created:', COUNT(*) FROM dynamic_risks  
UNION ALL
SELECT 'Service-Asset Relationships:', COUNT(*) FROM service_assets
UNION ALL  
SELECT 'Integration Sources Configured:', COUNT(*) FROM integration_sources
UNION ALL
SELECT 'Risk Approval Queue Items:', COUNT(*) FROM risk_approval_queue
UNION ALL
SELECT 'Service Risk Aggregations:', COUNT(*) FROM service_risk_aggregation;
-- Phase 1 Dynamic Risk Foundation - Seed Data
-- Service-centric architecture with CIA triad scoring and dynamic risk examples

-- Insert Business Services with CIA Triad Scoring (20+ services target)
INSERT OR IGNORE INTO business_services (id, name, description, business_owner, technical_owner, service_type, confidentiality_impact, integrity_impact, availability_impact, criticality_level, business_function, revenue_impact) VALUES
-- Core Revenue Services (Critical)
(1, 'E-commerce Platform', 'Main customer-facing e-commerce website and API', 'Sarah Chen', 'Mike Rodriguez', 'Application', 4, 5, 5, 'Critical', 'Online Sales', 2000000.00),
(2, 'Payment Processing System', 'Credit card and payment transaction processing', 'David Kim', 'Alex Thompson', 'Application', 5, 5, 5, 'Critical', 'Financial Processing', 5000000.00),
(3, 'Customer Database', 'Primary customer data and PII storage system', 'Lisa Wang', 'Tom Wilson', 'Data', 5, 4, 4, 'Critical', 'Customer Management', 1500000.00),
(4, 'Order Management System', 'Order processing, fulfillment and inventory', 'John Davis', 'Emma Johnson', 'Application', 3, 5, 4, 'High', 'Order Processing', 1200000.00),

-- Customer Service & Support (High)
(5, 'Customer Support Portal', 'Help desk, ticketing and knowledge base', 'Maria Garcia', 'Chris Lee', 'Application', 3, 3, 4, 'High', 'Customer Support', 300000.00),
(6, 'CRM System', 'Customer relationship management and sales', 'Robert Taylor', 'Jessica Brown', 'Application', 4, 4, 3, 'High', 'Sales Management', 800000.00),
(7, 'Live Chat System', 'Real-time customer chat support', 'Susan Miller', 'Daniel White', 'Application', 2, 2, 4, 'Medium', 'Customer Engagement', 150000.00),

-- Core Infrastructure Services (High)
(8, 'Active Directory', 'Identity and access management system', 'Kevin Anderson', 'Rachel Green', 'Infrastructure', 4, 5, 4, 'High', 'Identity Management', 200000.00),
(9, 'Email System', 'Corporate email and communication platform', 'Amy Clark', 'Steve Harris', 'Infrastructure', 3, 3, 4, 'Medium', 'Communication', 100000.00),
(10, 'File Storage System', 'Shared file storage and collaboration', 'Brian Lewis', 'Nicole Adams', 'Infrastructure', 3, 4, 3, 'Medium', 'File Management', 75000.00),

-- Data & Analytics Services (Medium-High)
(11, 'Data Warehouse', 'Business intelligence and analytics data store', 'Jennifer Martinez', 'Paul Turner', 'Data', 4, 4, 3, 'High', 'Business Analytics', 500000.00),
(12, 'Reporting System', 'Business reporting and dashboard platform', 'Michael Wright', 'Laura Scott', 'Application', 3, 4, 3, 'Medium', 'Business Intelligence', 200000.00),
(13, 'Backup System', 'Enterprise backup and disaster recovery', 'Gary Cooper', 'Helen King', 'Infrastructure', 4, 5, 5, 'High', 'Data Protection', 300000.00),

-- Development & DevOps (Medium)
(14, 'CI/CD Pipeline', 'Continuous integration and deployment system', 'Ryan Mitchell', 'Sophia Davis', 'Infrastructure', 2, 4, 3, 'Medium', 'Software Development', 50000.00),
(15, 'Source Code Repository', 'Git repository and version control system', 'Nathan Phillips', 'Grace Wilson', 'Infrastructure', 4, 5, 3, 'Medium', 'Development', 100000.00),
(16, 'Monitoring System', 'Application and infrastructure monitoring', 'Lisa Campbell', 'James Moore', 'Infrastructure', 2, 3, 4, 'Medium', 'Operations', 80000.00),

-- Security Services (High)  
(17, 'SIEM Platform', 'Security information and event management', 'Marcus Johnson', 'Karen Martinez', 'Infrastructure', 4, 4, 4, 'High', 'Security Operations', 150000.00),
(18, 'Vulnerability Scanner', 'Automated security vulnerability assessment', 'Diana Rodriguez', 'Tony Garcia', 'Infrastructure', 3, 3, 3, 'Medium', 'Security Assessment', 60000.00),
(19, 'Firewall Management', 'Network security and access control', 'Victor Brown', 'Amanda Taylor', 'Infrastructure', 3, 4, 5, 'High', 'Network Security', 200000.00),

-- External Facing Services (High)
(20, 'Corporate Website', 'Public marketing and information website', 'Michelle Lee', 'Andrew Clark', 'Application', 2, 3, 3, 'Medium', 'Marketing', 120000.00),
(21, 'API Gateway', 'External API management and rate limiting', 'Carlos Rodriguez', 'Samantha White', 'Infrastructure', 3, 4, 5, 'High', 'API Management', 400000.00),
(22, 'Content Delivery Network', 'Global content distribution and caching', 'Patricia Davis', 'Kevin Thompson', 'Infrastructure', 1, 2, 5, 'Medium', 'Content Delivery', 180000.00);

-- Insert Service-Asset Relationships (Risk Cascading)
INSERT OR IGNORE INTO service_assets (service_id, asset_id, dependency_type, impact_weight, criticality, relationship_description) VALUES
-- E-commerce Platform dependencies
(1, 1, 'depends_on', 2.0, 'Critical', 'E-commerce platform runs on web servers'),
(1, 3, 'depends_on', 1.5, 'High', 'E-commerce connects to database servers'),
(1, 21, 'depends_on', 1.8, 'High', 'E-commerce uses API gateway for external APIs'),

-- Payment Processing dependencies  
(2, 3, 'depends_on', 2.5, 'Critical', 'Payment system requires secure database access'),
(2, 19, 'depends_on', 2.0, 'Critical', 'Payment processing requires firewall protection'),
(2, 8, 'depends_on', 1.5, 'High', 'Payment system uses Active Directory for authentication'),

-- Customer Database dependencies
(3, 3, 'critical_to', 3.0, 'Critical', 'Customer data stored on database servers'),
(3, 13, 'depends_on', 2.0, 'High', 'Customer database backed up by backup system'),
(3, 19, 'depends_on', 1.5, 'High', 'Database protected by firewall'),

-- Additional key relationships
(4, 1, 'depends_on', 1.5, 'High', 'Order management uses web infrastructure'),
(4, 3, 'depends_on', 2.0, 'High', 'Order system connects to customer database'),
(11, 3, 'depends_on', 1.8, 'High', 'Data warehouse extracts from customer database'),
(17, 16, 'supports', 1.2, 'Medium', 'SIEM monitors infrastructure via monitoring system');

-- Insert Integration Sources (External System Connectors)
INSERT OR IGNORE INTO integration_sources (id, source_name, is_active, sync_interval_minutes, sync_status, total_syncs, api_endpoint) VALUES
(1, 'microsoft_defender', TRUE, 10, 'success', 144, 'https://graph.microsoft.com/v1.0/security'),
(2, 'servicenow', FALSE, 15, 'idle', 0, 'https://company.service-now.com/api'),
(3, 'jira', FALSE, 20, 'idle', 0, 'https://company.atlassian.net/rest/api/3'),
(4, 'threat_intel', TRUE, 30, 'success', 48, 'https://otx.alienvault.com/api/v1'),
(5, 'asset_monitor', TRUE, 5, 'success', 288, 'internal://asset-discovery'),
(6, 'vulnerability_scanner', TRUE, 60, 'success', 12, 'https://qualys.com/api/2.0');

-- Insert Sample Dynamic Risks (Auto-generated Examples)
INSERT OR IGNORE INTO dynamic_risks (id, source_system, source_id, confidence_score, auto_generated, approval_status, title, description, category, severity_level, probability, impact, risk_score, service_id, asset_id, ai_summary) VALUES
-- High-confidence auto-approved risks
(1, 'defender', 'DEF-2024-001', 0.92, TRUE, 'auto_approved', 'Critical Security Alert: Suspicious Login Activity', 'Multiple failed login attempts detected from unusual geographic locations targeting payment processing system', 'Security', 'High', 80, 90, 72, 2, NULL, 'AI Analysis: High-confidence security incident indicating potential credential stuffing attack against payment system. Immediate investigation recommended.'),
(2, 'threat_intel', 'TI-CVE-2024-001', 0.88, TRUE, 'auto_approved', 'Critical Vulnerability: Zero-day Exploit Detected', 'CISA KEV vulnerability affecting web server infrastructure with active exploitation detected', 'Vulnerability', 'Critical', 90, 85, 77, 1, 1, 'AI Analysis: Zero-day vulnerability with confirmed exploitation in the wild. Affects customer-facing e-commerce platform. Patch immediately.'),

-- Medium-confidence pending review
(3, 'asset_monitor', 'AM-2024-003', 0.65, TRUE, 'pending', 'Database Performance Degradation', 'Customer database showing 40% performance decrease over past 24 hours, potentially impacting service availability', 'Operational', 'Medium', 60, 70, 42, 3, 3, 'AI Analysis: Performance degradation pattern suggests resource exhaustion. Monitor for service impact and consider scaling resources.'),
(4, 'servicenow', 'INC0012345', 0.58, TRUE, 'pending', 'Network Infrastructure Change Request', 'Planned firewall rule changes may impact API gateway connectivity during maintenance window', 'Change Management', 'Medium', 40, 60, 24, 21, NULL, 'AI Analysis: Planned change with moderate risk to API services. Ensure proper testing and rollback procedures are in place.'),

-- Manual risks for comparison
(5, 'manual', NULL, 0.0, FALSE, 'manually_approved', 'Third-Party Vendor Risk Assessment', 'Annual risk assessment identified elevated risk in payment processor vendor due to recent security incidents', 'Third Party', 'Medium', 50, 80, 40, 2, NULL, 'Manual assessment by risk team. Requires ongoing monitoring and vendor security review.'),
(6, 'manual', NULL, 0.0, FALSE, 'manually_approved', 'Compliance Gap: Data Retention Policy', 'Customer data retention practices not fully aligned with GDPR requirements, potential regulatory risk', 'Compliance', 'High', 70, 60, 42, 3, NULL, 'Identified during compliance audit. Legal review and policy updates required.');

-- Insert Risk Score History (Real-time Updates)
INSERT OR IGNORE INTO risk_score_history (risk_id, old_score, new_score, score_delta, change_reason, change_source, updated_by, processing_time_ms, cascade_depth) VALUES
-- Risk escalation example
(1, 60, 72, 12, 'Security incident severity upgraded based on additional IOCs detected', 'automated', 'system', 145, 0),
(1, 72, 72, 0, 'Risk score maintained after security team review', 'manual', 'security_analyst', 0, 0),

-- Risk mitigation example  
(2, 85, 77, -8, 'Partial mitigation applied - affected systems isolated', 'automated', 'system', 89, 1),
(2, 77, 65, -12, 'Patch applied to affected infrastructure', 'manual', 'infrastructure_team', 0, 2),

-- Performance monitoring
(3, 35, 42, 7, 'Database performance degradation worsened', 'automated', 'monitoring_system', 234, 0),
(4, 30, 24, -6, 'Change request approved with additional safeguards', 'manual', 'change_board', 0, 0);

-- Insert Risk Approval Queue (Current Pending Items)
INSERT OR IGNORE INTO risk_approval_queue (risk_id, approval_type, priority, ml_recommendation, ml_confidence, ml_reasoning, assigned_reviewer, queued_at, target_decision_by) VALUES
(3, 'manual', 'medium', 'review', 0.65, 'Medium confidence score requires human validation. Performance impact unclear.', 'infrastructure_team', datetime('now', '-2 hours'), datetime('now', '+22 hours')),
(4, 'manual', 'low', 'approve', 0.58, 'Change management process followed. Low risk with proper controls.', 'change_manager', datetime('now', '-1 hour'), datetime('now', '+23 hours'));

-- Insert Service Risk Aggregation (Current State)
INSERT OR IGNORE INTO service_risk_aggregation (service_id, total_risks, critical_risks, high_risks, medium_risks, low_risks, aggregate_risk_score, cia_weighted_score, trend_direction, last_calculation_at) VALUES
(1, 2, 1, 1, 0, 0, 75, 82.5, 'deteriorating', datetime('now', '-5 minutes')), -- E-commerce Platform
(2, 2, 0, 1, 1, 0, 68, 88.2, 'improving', datetime('now', '-5 minutes')), -- Payment Processing  
(3, 2, 0, 0, 2, 0, 45, 65.0, 'stable', datetime('now', '-5 minutes')), -- Customer Database
(21, 1, 0, 0, 1, 0, 24, 35.8, 'stable', datetime('now', '-5 minutes')), -- API Gateway
(8, 0, 0, 0, 0, 0, 5, 12.5, 'stable', datetime('now', '-5 minutes')), -- Active Directory
(17, 0, 0, 0, 0, 0, 8, 15.2, 'stable', datetime('now', '-5 minutes')); -- SIEM Platform
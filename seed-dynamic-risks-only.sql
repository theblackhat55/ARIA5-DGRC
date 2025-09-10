-- Insert Dynamic Risks (Auto-Generated Examples vs Manual) - Matching Actual Schema
INSERT OR IGNORE INTO dynamic_risks (
  id, source_system, source_id, confidence_score, auto_generated, 
  approval_status, approval_required, title, description, category,
  severity_level, probability, impact, service_id, status, 
  assigned_to, created_at, updated_at, last_assessed_at
) VALUES
-- Auto-Generated Dynamic Risks (High Confidence)
(1, 'Infrastructure Monitoring', 'ALERT_CPU_001', 0.92, TRUE, 'approved', FALSE, 'High CPU Usage on Payment System', 'CPU utilization exceeded 85% threshold for 15+ minutes on payment processing servers', 'Performance', 'High', 80, 90, 2, 'active', 'ops-team@company.com', datetime('now', '-2 hours'), datetime('now', '-5 minutes'), datetime('now', '-5 minutes')),
(2, 'SIEM Alert', 'SEC_ALERT_002', 0.88, TRUE, 'approved', FALSE, 'Elevated Failed Login Attempts', 'Suspicious authentication patterns detected: 150+ failed logins in 10 minutes', 'Security', 'Medium', 60, 80, 8, 'active', 'security-team@company.com', datetime('now', '-1 hour'), datetime('now', '-10 minutes'), datetime('now', '-10 minutes')),
(3, 'Database Monitoring', 'DB_POOL_003', 0.85, TRUE, 'approved', FALSE, 'Database Connection Pool Exhaustion', 'Customer database connection pool at 95% capacity, potential service degradation', 'Performance', 'High', 80, 80, 3, 'active', 'dba-team@company.com', datetime('now', '-30 minutes'), datetime('now', '-2 minutes'), datetime('now', '-2 minutes')),
(4, 'Certificate Monitor', 'CERT_EXP_004', 0.98, TRUE, 'approved', FALSE, 'SSL Certificate Expiring Soon', 'E-commerce platform SSL certificate expires in 7 days', 'Compliance', 'Low', 40, 60, 1, 'active', 'security-team@company.com', datetime('now', '-6 hours'), datetime('now', '-1 hour'), datetime('now', '-1 hour')),

-- Auto-Generated Dynamic Risks (Medium Confidence - Requires Review)  
(5, 'Network Monitoring', 'NET_ANOM_005', 0.65, TRUE, 'pending', TRUE, 'Unusual Network Traffic Pattern', 'Abnormal outbound traffic detected from API Gateway: 300% increase', 'Security', 'Medium', 60, 60, 21, 'active', 'security-team@company.com', datetime('now', '-45 minutes'), datetime('now', '-15 minutes'), datetime('now', '-15 minutes')),
(6, 'Backup System', 'BCK_FAIL_006', 0.72, TRUE, 'pending', TRUE, 'Backup Verification Failure', 'Automated backup integrity check failed for customer database', 'Operational', 'Critical', 40, 100, 13, 'active', 'ops-team@company.com', datetime('now', '-3 hours'), datetime('now', '-1 hour'), datetime('now', '-1 hour')),
(7, 'Application Monitoring', 'MEM_LEAK_007', 0.68, TRUE, 'pending', TRUE, 'Memory Leak Suspected', 'CRM system memory usage trending upward: 40% increase over 24 hours', 'Performance', 'Medium', 60, 60, 6, 'active', 'dev-team@company.com', datetime('now', '-8 hours'), datetime('now', '-30 minutes'), datetime('now', '-30 minutes')),

-- Manual Risks (Traditional GRC Process)
(8, 'Manual Assessment', 'GRC_ASSESS_008', 1.0, FALSE, 'approved', FALSE, 'Third-Party Payment Processor Risk Assessment', 'Annual review of payment processor security controls and compliance status', 'Third Party', 'Medium', 40, 80, 2, 'active', 'risk-team@company.com', datetime('now', '-2 days'), datetime('now', '-2 days'), datetime('now', '-2 days')),
(9, 'Manual Assessment', 'GDPR_REVIEW_009', 1.0, FALSE, 'approved', FALSE, 'GDPR Compliance Gap Analysis', 'Quarterly review of customer data handling procedures for GDPR compliance', 'Compliance', 'Medium', 60, 60, 3, 'active', 'compliance-team@company.com', datetime('now', '-1 week'), datetime('now', '-1 week'), datetime('now', '-1 week')),
(10, 'Manual Assessment', 'DR_PLAN_010', 1.0, FALSE, 'approved', FALSE, 'Disaster Recovery Plan Update', 'Annual update and testing of business continuity procedures', 'Operational', 'Medium', 40, 80, 13, 'active', 'ops-team@company.com', datetime('now', '-1 month'), datetime('now', '-1 month'), datetime('now', '-1 month'));

SELECT 'Dynamic Risks Created:' as summary, COUNT(*) as count FROM dynamic_risks;
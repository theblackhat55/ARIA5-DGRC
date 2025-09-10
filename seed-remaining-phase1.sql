-- Insert Risk Score History (Service-Level CIA Calculations) - Matching Schema
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

-- Insert Integration Sources (External System Configuration) - Check schema first
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

-- Insert Risk Approval Queue (ML Confidence Workflow) - Check schema first  
INSERT OR IGNORE INTO risk_approval_queue (
  risk_id, assigned_to, priority_level, confidence_score, 
  ml_recommendation, review_reason, created_at, due_date
) VALUES
(5, 'security-team@company.com', 'High', 0.65, 'REVIEW_REQUIRED', 'Network anomaly below auto-approval threshold', datetime('now', '-45 minutes'), datetime('now', '+2 hours')),
(6, 'ops-team@company.com', 'Critical', 0.72, 'REVIEW_REQUIRED', 'Backup failure requires immediate attention', datetime('now', '-3 hours'), datetime('now', '+1 hour')),
(7, 'dev-team@company.com', 'Medium', 0.68, 'REVIEW_REQUIRED', 'Memory trend analysis needs validation', datetime('now', '-8 hours'), datetime('now', '+4 hours'));

-- Insert Service Risk Aggregation (Real-Time Service Scoring) - Check schema first
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

-- Verify data insertion
SELECT 'Risk Score History:' as summary, COUNT(*) as count FROM risk_score_history
UNION ALL
SELECT 'Integration Sources:', COUNT(*) FROM integration_sources  
UNION ALL
SELECT 'Risk Approval Queue:', COUNT(*) FROM risk_approval_queue
UNION ALL
SELECT 'Service Risk Aggregations:', COUNT(*) FROM service_risk_aggregation;
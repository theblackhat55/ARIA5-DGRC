-- ARIA5.1 Phase 5: Executive Intelligence - Service-Level Business Impact
-- Migration: 0012_phase5_executive_intelligence.sql
-- Target: Executive dashboard with service-centric risk view and financial impact analysis

-- ================================================================
-- EXECUTIVE INTELLIGENCE TABLES
-- ================================================================

-- Business Impact Models
CREATE TABLE IF NOT EXISTS business_impact_models (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_name TEXT UNIQUE NOT NULL,
  model_type TEXT NOT NULL, -- 'financial', 'operational', 'reputational', 'regulatory'
  industry_sector TEXT, -- 'financial_services', 'healthcare', 'technology', 'manufacturing'
  model_description TEXT,
  calculation_method TEXT NOT NULL, -- 'revenue_based', 'cost_based', 'hybrid', 'regulatory_fine'
  base_parameters TEXT, -- JSON configuration for model parameters
  created_by TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  validation_status TEXT DEFAULT 'pending', -- 'pending', 'validated', 'deprecated'
  last_calibration_date DATETIME,
  accuracy_score REAL DEFAULT 0.0, -- Historical accuracy of predictions (0.0-1.0)
  usage_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Service Financial Profiles
CREATE TABLE IF NOT EXISTS service_financial_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER REFERENCES services(id),
  annual_revenue_impact REAL DEFAULT 0.0, -- Annual revenue this service generates
  annual_cost_to_operate REAL DEFAULT 0.0, -- Annual operational costs
  downtime_cost_per_hour REAL DEFAULT 0.0, -- Cost per hour if service is down
  regulatory_fine_potential REAL DEFAULT 0.0, -- Potential regulatory fines
  customer_impact_factor REAL DEFAULT 1.0, -- Customer base affected (multiplier)
  sla_penalty_costs REAL DEFAULT 0.0, -- SLA breach penalty costs
  recovery_cost_estimate REAL DEFAULT 0.0, -- Cost to recover from major incident
  reputation_impact_value REAL DEFAULT 0.0, -- Quantified reputation impact
  currency TEXT DEFAULT 'USD',
  fiscal_year INTEGER DEFAULT 2025,
  last_updated_by TEXT,
  data_source TEXT, -- 'manual', 'erp_integration', 'finance_system'
  confidence_level REAL DEFAULT 0.5, -- Confidence in financial data accuracy
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Executive Risk Summaries
CREATE TABLE IF NOT EXISTS executive_risk_summaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  summary_date DATE NOT NULL,
  reporting_period TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly'
  total_services_monitored INTEGER NOT NULL,
  critical_services_at_risk INTEGER DEFAULT 0,
  high_risk_services INTEGER DEFAULT 0,
  medium_risk_services INTEGER DEFAULT 0,
  low_risk_services INTEGER DEFAULT 0,
  total_financial_exposure REAL DEFAULT 0.0,
  critical_financial_exposure REAL DEFAULT 0.0,
  potential_regulatory_fines REAL DEFAULT 0.0,
  estimated_downtime_costs REAL DEFAULT 0.0,
  risk_trend_direction TEXT DEFAULT 'stable', -- 'increasing', 'decreasing', 'stable'
  risk_velocity_score REAL DEFAULT 0.0, -- Rate of risk change
  top_risk_category TEXT, -- Highest category of risk
  executive_action_required BOOLEAN DEFAULT FALSE,
  board_escalation_needed BOOLEAN DEFAULT FALSE,
  currency TEXT DEFAULT 'USD',
  generated_by TEXT DEFAULT 'system',
  reviewed_by TEXT,
  review_status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'approved'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Service Risk Aggregations
CREATE TABLE IF NOT EXISTS service_risk_aggregations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER REFERENCES services(id),
  aggregation_date DATE NOT NULL,
  aggregation_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  direct_risk_score REAL NOT NULL, -- Direct risks to this service
  cascaded_risk_score REAL NOT NULL, -- Risks cascaded from dependencies
  total_risk_score REAL NOT NULL, -- Combined risk score
  financial_impact_estimate REAL DEFAULT 0.0,
  probability_of_impact REAL DEFAULT 0.0, -- Probability of financial impact occurring
  expected_loss_value REAL DEFAULT 0.0, -- Expected financial loss (impact * probability)
  risk_contributors TEXT, -- JSON array of contributing risk factors
  mitigation_effectiveness REAL DEFAULT 0.0, -- Effectiveness of current mitigations
  residual_risk_score REAL DEFAULT 0.0, -- Risk after mitigations
  trend_indicator TEXT DEFAULT 'stable', -- 'improving', 'degrading', 'stable'
  compliance_impact_score REAL DEFAULT 0.0, -- Impact on compliance posture
  business_continuity_score REAL DEFAULT 0.0, -- Impact on business continuity
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Executive KPI Dashboards
CREATE TABLE IF NOT EXISTS executive_kpi_dashboards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dashboard_name TEXT UNIQUE NOT NULL,
  dashboard_type TEXT NOT NULL, -- 'ceo', 'cro', 'ciso', 'board', 'audit_committee'
  target_audience TEXT NOT NULL, -- Executive role or committee
  refresh_frequency TEXT DEFAULT 'daily', -- 'real_time', 'hourly', 'daily', 'weekly'
  kpi_configuration TEXT, -- JSON configuration of KPIs to display
  visualization_settings TEXT, -- JSON settings for charts and displays
  alert_thresholds TEXT, -- JSON configuration of alert levels
  is_active BOOLEAN DEFAULT TRUE,
  access_permissions TEXT, -- JSON array of allowed users/roles
  last_generated DATETIME,
  generation_status TEXT DEFAULT 'pending', -- 'pending', 'generating', 'ready', 'error'
  created_by TEXT NOT NULL,
  approved_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Business Impact Incidents
CREATE TABLE IF NOT EXISTS business_impact_incidents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  incident_id TEXT UNIQUE NOT NULL, -- Reference to external incident ID
  service_id INTEGER REFERENCES services(id),
  incident_title TEXT NOT NULL,
  incident_start_time DATETIME NOT NULL,
  incident_end_time DATETIME,
  duration_minutes INTEGER,
  severity_level TEXT NOT NULL, -- 'sev1', 'sev2', 'sev3', 'sev4'
  actual_financial_impact REAL DEFAULT 0.0, -- Actual measured financial impact
  estimated_financial_impact REAL DEFAULT 0.0, -- Initially estimated impact
  customers_affected INTEGER DEFAULT 0,
  services_affected INTEGER DEFAULT 1,
  revenue_lost REAL DEFAULT 0.0,
  sla_penalties_incurred REAL DEFAULT 0.0,
  recovery_costs REAL DEFAULT 0.0,
  regulatory_fines REAL DEFAULT 0.0,
  reputation_impact_score REAL DEFAULT 0.0,
  root_cause_category TEXT,
  lessons_learned TEXT,
  prevention_actions TEXT,
  impact_accuracy_score REAL DEFAULT 0.0, -- How accurate was the prediction
  currency TEXT DEFAULT 'USD',
  recorded_by TEXT,
  validated_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Executive Decision Support
CREATE TABLE IF NOT EXISTS executive_decision_support (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  decision_id TEXT UNIQUE NOT NULL,
  decision_type TEXT NOT NULL, -- 'investment', 'mitigation', 'strategic', 'operational'
  decision_title TEXT NOT NULL,
  decision_description TEXT,
  risk_context TEXT, -- JSON describing related risks
  financial_implications REAL DEFAULT 0.0,
  recommended_action TEXT NOT NULL,
  alternative_options TEXT, -- JSON array of alternative options
  cost_benefit_analysis TEXT, -- JSON analysis results
  risk_reduction_potential REAL DEFAULT 0.0, -- Expected risk reduction (%)
  implementation_timeframe TEXT, -- 'immediate', 'short_term', 'medium_term', 'long_term'
  resource_requirements TEXT, -- JSON describing needed resources
  success_metrics TEXT, -- JSON array of success criteria
  approval_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'deferred'
  approved_by TEXT,
  approval_date DATETIME,
  implementation_status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed', 'cancelled'
  actual_outcomes TEXT, -- JSON describing actual results
  roi_achieved REAL DEFAULT 0.0, -- Actual return on investment
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Risk Appetite and Tolerance
CREATE TABLE IF NOT EXISTS risk_appetite_framework (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  framework_name TEXT UNIQUE NOT NULL,
  business_area TEXT NOT NULL, -- 'overall', 'operational', 'financial', 'strategic', 'compliance'
  risk_category TEXT NOT NULL,
  appetite_level TEXT NOT NULL, -- 'low', 'medium', 'high'
  tolerance_threshold REAL NOT NULL, -- Numeric threshold for risk tolerance
  tolerance_unit TEXT DEFAULT 'risk_score', -- 'risk_score', 'financial_impact', 'percentage'
  escalation_threshold REAL NOT NULL, -- When to escalate to executives
  board_threshold REAL NOT NULL, -- When to escalate to board
  current_exposure REAL DEFAULT 0.0, -- Current exposure level
  utilization_percentage REAL GENERATED ALWAYS AS (
    CASE 
      WHEN tolerance_threshold > 0 
      THEN (current_exposure / tolerance_threshold) * 100
      ELSE 0 
    END
  ) STORED,
  review_frequency TEXT DEFAULT 'quarterly', -- How often to review thresholds
  last_review_date DATETIME,
  next_review_date DATETIME,
  approved_by TEXT,
  approval_date DATETIME,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- FINANCIAL IMPACT CALCULATIONS
-- ================================================================

-- Service Dependency Costs
CREATE TABLE IF NOT EXISTS service_dependency_costs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_service_id INTEGER REFERENCES services(id),
  dependent_service_id INTEGER REFERENCES services(id),
  dependency_type TEXT NOT NULL, -- 'critical', 'important', 'optional'
  cost_amplification_factor REAL DEFAULT 1.0, -- How dependency affects costs
  failure_propagation_probability REAL DEFAULT 0.0, -- Probability failure spreads
  recovery_complexity_score REAL DEFAULT 1.0, -- How complex to recover
  sla_impact_factor REAL DEFAULT 1.0, -- How dependency affects SLAs
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(parent_service_id, dependent_service_id)
);

-- Cost Models and Templates
CREATE TABLE IF NOT EXISTS cost_calculation_models (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_name TEXT UNIQUE NOT NULL,
  industry_type TEXT, -- Industry-specific cost models
  model_formula TEXT NOT NULL, -- Mathematical formula for calculations
  parameter_definitions TEXT, -- JSON defining required parameters
  example_calculation TEXT, -- Example showing how to use the model
  accuracy_range TEXT, -- Expected accuracy range (e.g., "±15%")
  model_source TEXT, -- 'industry_standard', 'internal', 'consultant', 'research'
  validation_data TEXT, -- JSON with validation test cases
  is_default BOOLEAN DEFAULT FALSE,
  created_by TEXT NOT NULL,
  reviewed_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- EXECUTIVE REPORTING AND ANALYTICS
-- ================================================================

-- Executive Reports
CREATE TABLE IF NOT EXISTS executive_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id TEXT UNIQUE NOT NULL,
  report_type TEXT NOT NULL, -- 'monthly_executive', 'quarterly_board', 'incident_impact', 'annual_summary'
  report_title TEXT NOT NULL,
  reporting_period_start DATE NOT NULL,
  reporting_period_end DATE NOT NULL,
  generated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  report_status TEXT DEFAULT 'generating', -- 'generating', 'ready', 'delivered', 'archived'
  target_audience TEXT, -- JSON array of intended recipients
  key_metrics TEXT, -- JSON object with key metrics
  executive_summary TEXT,
  risk_highlights TEXT, -- JSON array of key risks to highlight
  financial_summary TEXT, -- JSON object with financial impact summary
  recommendations TEXT, -- JSON array of recommended actions
  appendix_data TEXT, -- JSON with detailed supporting data
  distribution_list TEXT, -- JSON array of email addresses
  delivered_at DATETIME,
  file_location TEXT, -- Location of generated report file
  file_format TEXT DEFAULT 'pdf', -- 'pdf', 'excel', 'powerpoint'
  created_by TEXT NOT NULL,
  approved_by TEXT,
  approval_date DATETIME
);

-- Trend Analysis
CREATE TABLE IF NOT EXISTS executive_trend_analysis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  analysis_date DATE NOT NULL,
  analysis_type TEXT NOT NULL, -- 'risk_trends', 'financial_trends', 'service_performance'
  time_period TEXT NOT NULL, -- '30_days', '90_days', '12_months'
  trend_direction TEXT NOT NULL, -- 'improving', 'degrading', 'stable'
  trend_velocity REAL DEFAULT 0.0, -- Rate of change
  statistical_significance REAL DEFAULT 0.0, -- P-value of trend
  confidence_interval REAL DEFAULT 0.95, -- Confidence level
  key_drivers TEXT, -- JSON array of factors driving the trend
  predicted_trajectory TEXT, -- JSON with future predictions
  recommendation_priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  recommended_actions TEXT, -- JSON array of suggested actions
  impact_if_no_action TEXT, -- Predicted impact of inaction
  monitoring_metrics TEXT, -- JSON array of metrics to watch
  created_by TEXT DEFAULT 'system',
  reviewed_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ================================================================

-- Executive Intelligence Indexes
CREATE INDEX IF NOT EXISTS idx_service_financial_profiles_service ON service_financial_profiles(service_id);
CREATE INDEX IF NOT EXISTS idx_executive_risk_summaries_date ON executive_risk_summaries(summary_date);
CREATE INDEX IF NOT EXISTS idx_service_risk_aggregations_service_date ON service_risk_aggregations(service_id, aggregation_date);
CREATE INDEX IF NOT EXISTS idx_business_impact_incidents_service ON business_impact_incidents(service_id);
CREATE INDEX IF NOT EXISTS idx_business_impact_incidents_date ON business_impact_incidents(incident_start_time);
CREATE INDEX IF NOT EXISTS idx_executive_decision_support_status ON executive_decision_support(approval_status);
CREATE INDEX IF NOT EXISTS idx_risk_appetite_framework_category ON risk_appetite_framework(risk_category);
CREATE INDEX IF NOT EXISTS idx_executive_reports_type_date ON executive_reports(report_type, generated_date);

-- ================================================================
-- INITIAL DATA SEEDING
-- ================================================================

-- Insert Default Business Impact Models
INSERT OR IGNORE INTO business_impact_models (model_name, model_type, calculation_method, model_description, base_parameters, created_by) VALUES
('Technology Service Revenue Impact', 'financial', 'revenue_based', 'Calculates revenue impact based on service downtime and customer usage patterns', '{"hourly_revenue_factor": 1.0, "customer_churn_rate": 0.02, "recovery_time_hours": 2}', 'system'),
('Healthcare Compliance Fine Model', 'regulatory', 'regulatory_fine', 'Estimates potential HIPAA and healthcare compliance fines', '{"base_fine": 50000, "record_multiplier": 100, "breach_severity_factor": 2.0}', 'system'),
('Financial Services Operational Risk', 'operational', 'cost_based', 'Operational risk model for financial services', '{"operational_cost_multiplier": 1.5, "regulatory_capital_impact": 0.08}', 'system'),
('E-commerce Reputation Impact', 'reputational', 'hybrid', 'Quantifies reputation impact for e-commerce platforms', '{"brand_value_percentage": 0.05, "customer_lifetime_value": 500, "social_media_amplification": 1.8}', 'system');

-- Insert Default Risk Appetite Framework
INSERT OR IGNORE INTO risk_appetite_framework (framework_name, business_area, risk_category, appetite_level, tolerance_threshold, escalation_threshold, board_threshold, approved_by) VALUES
('Overall Enterprise Risk', 'overall', 'aggregate', 'medium', 75.0, 80.0, 90.0, 'system'),
('Operational Risk Tolerance', 'operational', 'operational', 'medium', 70.0, 75.0, 85.0, 'system'),
('Financial Risk Limits', 'financial', 'financial', 'low', 60.0, 65.0, 75.0, 'system'),
('Compliance Risk Boundaries', 'compliance', 'regulatory', 'low', 50.0, 60.0, 70.0, 'system'),
('Strategic Risk Parameters', 'strategic', 'strategic', 'high', 80.0, 85.0, 95.0, 'system');

-- Insert Default Cost Calculation Models
INSERT OR IGNORE INTO cost_calculation_models (model_name, industry_type, model_formula, parameter_definitions, created_by, is_default) VALUES
('Basic Downtime Cost Model', 'technology', '(hourly_revenue * downtime_hours) + (recovery_cost * complexity_factor)', '{"hourly_revenue": "number", "downtime_hours": "number", "recovery_cost": "number", "complexity_factor": "number"}', 'system', TRUE),
('SLA Penalty Calculator', 'general', 'contract_value * penalty_percentage * breach_duration_ratio', '{"contract_value": "number", "penalty_percentage": "number", "breach_duration_ratio": "number"}', 'system', TRUE),
('Regulatory Fine Estimator', 'regulated', 'base_fine + (affected_records * per_record_fine) * severity_multiplier', '{"base_fine": "number", "affected_records": "number", "per_record_fine": "number", "severity_multiplier": "number"}', 'system', TRUE);

-- Insert Default Executive KPI Dashboards
INSERT OR IGNORE INTO executive_kpi_dashboards (dashboard_name, dashboard_type, target_audience, kpi_configuration, created_by, is_active) VALUES
('CEO Risk Overview', 'ceo', 'Chief Executive Officer', '{"primary_kpis": ["total_risk_exposure", "critical_services_at_risk", "financial_impact"], "refresh_rate": "daily"}', 'system', TRUE),
('CRO Risk Management', 'cro', 'Chief Risk Officer', '{"primary_kpis": ["risk_by_category", "mitigation_effectiveness", "trend_analysis"], "refresh_rate": "real_time"}', 'system', TRUE),
('CISO Security Posture', 'ciso', 'Chief Information Security Officer', '{"primary_kpis": ["security_risks", "compliance_gaps", "incident_impact"], "refresh_rate": "real_time"}', 'system', TRUE),
('Board Risk Summary', 'board', 'Board of Directors', '{"primary_kpis": ["enterprise_risk_appetite", "regulatory_compliance", "strategic_risks"], "refresh_rate": "weekly"}', 'system', TRUE);

-- ================================================================
-- VIEWS FOR EXECUTIVE REPORTING
-- ================================================================

-- Executive Risk Overview
CREATE VIEW IF NOT EXISTS v_executive_risk_overview AS
SELECT 
  s.id as service_id,
  s.name as service_name,
  s.criticality_level,
  sra.total_risk_score,
  sra.financial_impact_estimate,
  sra.expected_loss_value,
  sfp.annual_revenue_impact,
  sfp.downtime_cost_per_hour,
  CASE 
    WHEN sra.total_risk_score >= 80 THEN 'Critical'
    WHEN sra.total_risk_score >= 60 THEN 'High'
    WHEN sra.total_risk_score >= 40 THEN 'Medium'
    ELSE 'Low'
  END as risk_category,
  sra.trend_indicator,
  sra.aggregation_date
FROM services s
LEFT JOIN service_risk_aggregations sra ON s.id = sra.service_id
LEFT JOIN service_financial_profiles sfp ON s.id = sfp.service_id
WHERE sra.aggregation_date = (
  SELECT MAX(aggregation_date) 
  FROM service_risk_aggregations sra2 
  WHERE sra2.service_id = s.id
)
ORDER BY sra.total_risk_score DESC, sfp.annual_revenue_impact DESC;

-- Financial Impact Summary
CREATE VIEW IF NOT EXISTS v_financial_impact_summary AS
SELECT 
  COUNT(*) as total_services,
  SUM(CASE WHEN sra.total_risk_score >= 80 THEN 1 ELSE 0 END) as critical_risk_services,
  SUM(CASE WHEN sra.total_risk_score >= 60 THEN 1 ELSE 0 END) as high_risk_services,
  SUM(sfp.annual_revenue_impact) as total_revenue_at_risk,
  SUM(sra.financial_impact_estimate) as total_financial_exposure,
  SUM(sra.expected_loss_value) as total_expected_loss,
  AVG(sra.total_risk_score) as average_risk_score,
  MAX(sra.aggregation_date) as as_of_date
FROM services s
JOIN service_risk_aggregations sra ON s.id = sra.service_id
JOIN service_financial_profiles sfp ON s.id = sfp.service_id
WHERE sra.aggregation_date = (
  SELECT MAX(aggregation_date) 
  FROM service_risk_aggregations
);

-- ================================================================
-- TRIGGERS FOR AUTOMATION
-- ================================================================

-- Trigger to update risk appetite utilization
CREATE TRIGGER IF NOT EXISTS update_risk_appetite_exposure 
AFTER INSERT ON service_risk_aggregations
FOR EACH ROW
BEGIN
  UPDATE risk_appetite_framework 
  SET 
    current_exposure = (
      SELECT AVG(total_risk_score) 
      FROM service_risk_aggregations sra
      JOIN services s ON sra.service_id = s.id
      WHERE sra.aggregation_date = NEW.aggregation_date
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE business_area = 'overall' AND risk_category = 'aggregate';
END;

-- Trigger to create executive alerts for threshold breaches
CREATE TRIGGER IF NOT EXISTS executive_risk_threshold_alert 
AFTER INSERT ON service_risk_aggregations
FOR EACH ROW
WHEN NEW.total_risk_score >= 80 OR NEW.financial_impact_estimate >= 1000000
BEGIN
  INSERT INTO executive_decision_support (
    decision_id, decision_type, decision_title, decision_description,
    financial_implications, recommended_action, approval_status, created_by
  ) VALUES (
    'ALERT-' || datetime('now') || '-' || NEW.service_id,
    'mitigation',
    'High Risk Service Alert: ' || (SELECT name FROM services WHERE id = NEW.service_id),
    'Service risk score of ' || NEW.total_risk_score || ' exceeds executive threshold',
    NEW.financial_impact_estimate,
    'Immediate risk assessment and mitigation planning required',
    'pending',
    'system'
  );
END;

-- ================================================================
-- MIGRATION COMPLETION
-- ================================================================

-- Record migration completion
INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES ('0012_phase5_executive_intelligence', CURRENT_TIMESTAMP);

-- Phase 5 Executive Intelligence Migration Complete
-- Next: Implement Executive Dashboard service class
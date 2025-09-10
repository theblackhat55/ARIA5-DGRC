-- Phase 5 Executive Intelligence Tables
-- Simplified creation script

-- Business Impact Models
CREATE TABLE IF NOT EXISTS business_impact_models (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_name TEXT UNIQUE NOT NULL,
  model_type TEXT NOT NULL,
  industry_sector TEXT,
  model_description TEXT,
  calculation_method TEXT NOT NULL,
  base_parameters TEXT,
  created_by TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  validation_status TEXT DEFAULT 'pending',
  last_calibration_date DATETIME,
  accuracy_score REAL DEFAULT 0.0,
  usage_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Service Financial Profiles
CREATE TABLE IF NOT EXISTS service_financial_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER,
  annual_revenue_impact REAL DEFAULT 0.0,
  annual_cost_to_operate REAL DEFAULT 0.0,
  downtime_cost_per_hour REAL DEFAULT 0.0,
  regulatory_fine_potential REAL DEFAULT 0.0,
  customer_impact_factor REAL DEFAULT 1.0,
  sla_penalty_costs REAL DEFAULT 0.0,
  recovery_cost_estimate REAL DEFAULT 0.0,
  reputation_impact_value REAL DEFAULT 0.0,
  currency TEXT DEFAULT 'USD',
  fiscal_year INTEGER DEFAULT 2025,
  last_updated_by TEXT,
  data_source TEXT,
  confidence_level REAL DEFAULT 0.5,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Executive Risk Summaries
CREATE TABLE IF NOT EXISTS executive_risk_summaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  summary_date DATE NOT NULL,
  reporting_period TEXT NOT NULL,
  total_services_monitored INTEGER NOT NULL,
  critical_services_at_risk INTEGER DEFAULT 0,
  high_risk_services INTEGER DEFAULT 0,
  medium_risk_services INTEGER DEFAULT 0,
  low_risk_services INTEGER DEFAULT 0,
  total_financial_exposure REAL DEFAULT 0.0,
  critical_financial_exposure REAL DEFAULT 0.0,
  potential_regulatory_fines REAL DEFAULT 0.0,
  estimated_downtime_costs REAL DEFAULT 0.0,
  risk_trend_direction TEXT DEFAULT 'stable',
  risk_velocity_score REAL DEFAULT 0.0,
  top_risk_category TEXT,
  executive_action_required BOOLEAN DEFAULT FALSE,
  board_escalation_needed BOOLEAN DEFAULT FALSE,
  currency TEXT DEFAULT 'USD',
  generated_by TEXT DEFAULT 'system',
  reviewed_by TEXT,
  review_status TEXT DEFAULT 'pending',
  business_impact_score REAL DEFAULT 0.0,
  financial_impact_estimate REAL DEFAULT 0.0,
  recommended_actions TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Service Risk Aggregations
CREATE TABLE IF NOT EXISTS service_risk_aggregations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER,
  aggregation_date DATE NOT NULL,
  aggregation_type TEXT NOT NULL,
  direct_risk_score REAL NOT NULL,
  cascaded_risk_score REAL NOT NULL,
  total_risk_score REAL NOT NULL,
  financial_impact_estimate REAL DEFAULT 0.0,
  probability_of_impact REAL DEFAULT 0.0,
  expected_loss_value REAL DEFAULT 0.0,
  risk_contributors TEXT,
  mitigation_effectiveness REAL DEFAULT 0.0,
  residual_risk_score REAL DEFAULT 0.0,
  trend_indicator TEXT DEFAULT 'stable',
  compliance_impact_score REAL DEFAULT 0.0,
  business_continuity_score REAL DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Risk Appetite Framework
CREATE TABLE IF NOT EXISTS risk_appetite_framework (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  risk_category TEXT UNIQUE NOT NULL,
  appetite_threshold REAL NOT NULL,
  tolerance_limit REAL NOT NULL,
  current_exposure REAL DEFAULT 0.0,
  measurement_unit TEXT NOT NULL,
  review_frequency TEXT NOT NULL,
  owner_role TEXT NOT NULL,
  escalation_threshold REAL NOT NULL,
  status TEXT DEFAULT 'within_appetite',
  last_review_date DATE,
  next_review_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Executive Recommendations
CREATE TABLE IF NOT EXISTS executive_recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recommendation_type TEXT NOT NULL,
  priority_level INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  business_justification TEXT,
  estimated_effort TEXT,
  potential_risk_reduction REAL DEFAULT 0.0,
  financial_impact REAL DEFAULT 0.0,
  implementation_timeline TEXT,
  assigned_to TEXT,
  status TEXT DEFAULT 'active',
  decision_deadline DATE,
  approval_required BOOLEAN DEFAULT TRUE,
  approved_by TEXT,
  approved_at DATETIME,
  implementation_started_at DATETIME,
  completed_at DATETIME,
  effectiveness_score REAL DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
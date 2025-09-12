-- AI-Native Phases 4-8 Database Schema
-- Implementation Date: 2025-09-12
-- Supports: Evidence Collection, Executive Intelligence, Advanced Analytics, Enterprise Scale, Integration Platform

-- ===================================
-- PHASE 4: Evidence Collection & Learning System
-- ===================================

-- Compliance Evidence Storage
CREATE TABLE IF NOT EXISTS compliance_evidence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  evidence_type TEXT NOT NULL,
  framework TEXT NOT NULL,
  requirement_id TEXT NOT NULL,
  evidence_data TEXT NOT NULL, -- JSON format
  collection_method TEXT NOT NULL, -- 'automated', 'manual', 'hybrid'
  validation_status TEXT DEFAULT 'pending', -- 'pending', 'validated', 'rejected'
  collection_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  validation_timestamp DATETIME,
  organization_id INTEGER NOT NULL,
  collected_by TEXT,
  validator TEXT,
  confidence_score REAL DEFAULT 0.0,
  metadata TEXT, -- JSON format
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Audit Packages
CREATE TABLE IF NOT EXISTS audit_packages (
  id TEXT PRIMARY KEY, -- UUID
  title TEXT NOT NULL,
  scope TEXT NOT NULL,
  frameworks TEXT NOT NULL, -- JSON array
  status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'approved'
  created_by TEXT NOT NULL,
  organization_id INTEGER NOT NULL,
  evidence_count INTEGER DEFAULT 0,
  completion_percentage REAL DEFAULT 0.0,
  audit_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Evidence to Audit Package mapping
CREATE TABLE IF NOT EXISTS audit_package_evidence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  audit_package_id TEXT NOT NULL,
  evidence_id INTEGER NOT NULL,
  requirement_mapping TEXT, -- JSON format
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (audit_package_id) REFERENCES audit_packages(id),
  FOREIGN KEY (evidence_id) REFERENCES compliance_evidence(id)
);

-- Evidence Collection Recommendations
CREATE TABLE IF NOT EXISTS evidence_recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id INTEGER NOT NULL,
  framework TEXT NOT NULL,
  requirement_id TEXT NOT NULL,
  recommendation_type TEXT NOT NULL, -- 'missing', 'update', 'validation'
  priority TEXT NOT NULL, -- 'high', 'medium', 'low'
  recommendation TEXT NOT NULL,
  ai_generated BOOLEAN DEFAULT TRUE,
  confidence_score REAL DEFAULT 0.0,
  status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'completed', 'dismissed'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- ===================================
-- PHASE 5: Executive Intelligence & Reporting
-- ===================================

-- Executive Summaries
CREATE TABLE IF NOT EXISTS executive_summaries (
  id TEXT PRIMARY KEY, -- UUID
  organization_id INTEGER NOT NULL,
  summary_type TEXT NOT NULL, -- 'monthly', 'quarterly', 'incident', 'board'
  title TEXT NOT NULL,
  executive_summary TEXT NOT NULL, -- Main summary content
  key_metrics TEXT NOT NULL, -- JSON format
  strategic_recommendations TEXT NOT NULL, -- JSON array
  risk_highlights TEXT NOT NULL, -- JSON array
  compliance_status TEXT NOT NULL, -- JSON format
  generated_by TEXT NOT NULL, -- AI model identifier
  generation_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  approval_status TEXT DEFAULT 'draft', -- 'draft', 'approved', 'distributed'
  approved_by TEXT,
  approved_at DATETIME,
  distribution_list TEXT, -- JSON array of recipients
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Board Reports
CREATE TABLE IF NOT EXISTS board_reports (
  id TEXT PRIMARY KEY, -- UUID
  organization_id INTEGER NOT NULL,
  reporting_period TEXT NOT NULL,
  board_meeting_date DATETIME NOT NULL,
  report_content TEXT NOT NULL, -- Full report in JSON format
  executive_summary TEXT NOT NULL,
  risk_dashboard TEXT NOT NULL, -- JSON format
  compliance_overview TEXT NOT NULL, -- JSON format
  strategic_initiatives TEXT NOT NULL, -- JSON array
  financial_impact TEXT NOT NULL, -- JSON format
  status TEXT DEFAULT 'draft', -- 'draft', 'review', 'approved', 'presented'
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Predictive Analysis Results
CREATE TABLE IF NOT EXISTS predictive_analysis (
  id TEXT PRIMARY KEY, -- UUID
  organization_id INTEGER NOT NULL,
  analysis_type TEXT NOT NULL, -- 'risk_forecast', 'compliance_prediction', 'threat_analysis'
  forecast_period TEXT NOT NULL, -- '3 months', '6 months', '1 year'
  predictions TEXT NOT NULL, -- JSON format with predictions
  confidence_intervals TEXT NOT NULL, -- JSON format
  model_metadata TEXT NOT NULL, -- JSON format with model info
  risk_scenarios TEXT NOT NULL, -- JSON array of scenarios
  recommendations TEXT NOT NULL, -- JSON array
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  model_version TEXT NOT NULL,
  accuracy_score REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Strategic Recommendations
CREATE TABLE IF NOT EXISTS strategic_recommendations (
  id TEXT PRIMARY KEY, -- UUID
  organization_id INTEGER NOT NULL,
  recommendation_category TEXT NOT NULL, -- 'risk', 'compliance', 'security', 'operational'
  priority TEXT NOT NULL, -- 'critical', 'high', 'medium', 'low'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  rationale TEXT NOT NULL,
  implementation_steps TEXT NOT NULL, -- JSON array
  estimated_effort TEXT,
  estimated_cost TEXT,
  expected_impact TEXT NOT NULL, -- JSON format
  target_completion DATETIME,
  status TEXT DEFAULT 'proposed', -- 'proposed', 'approved', 'in_progress', 'completed', 'rejected'
  created_by TEXT NOT NULL,
  approved_by TEXT,
  assigned_to TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- ===================================
-- PHASE 6: Advanced Analytics & Mobile Platform
-- ===================================

-- Predictive Models
CREATE TABLE IF NOT EXISTS predictive_models (
  id TEXT PRIMARY KEY, -- UUID
  organization_id INTEGER NOT NULL,
  model_name TEXT NOT NULL,
  model_type TEXT NOT NULL, -- 'risk_prediction', 'threat_detection', 'compliance_forecast'
  algorithm TEXT NOT NULL, -- 'random_forest', 'neural_network', 'linear_regression', etc.
  training_data_period TEXT NOT NULL,
  accuracy_score REAL NOT NULL,
  precision_score REAL,
  recall_score REAL,
  f1_score REAL,
  model_parameters TEXT NOT NULL, -- JSON format
  feature_importance TEXT NOT NULL, -- JSON format
  validation_results TEXT NOT NULL, -- JSON format
  deployment_status TEXT DEFAULT 'training', -- 'training', 'validated', 'deployed', 'retired'
  deployment_date DATETIME,
  last_retrained DATETIME,
  performance_metrics TEXT, -- JSON format with recent performance
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Mobile Analytics Sessions
CREATE TABLE IF NOT EXISTS mobile_analytics_sessions (
  id TEXT PRIMARY KEY, -- UUID
  user_id TEXT NOT NULL,
  organization_id INTEGER NOT NULL,
  session_start DATETIME DEFAULT CURRENT_TIMESTAMP,
  session_end DATETIME,
  device_type TEXT NOT NULL, -- 'mobile', 'tablet', 'desktop'
  platform TEXT NOT NULL, -- 'ios', 'android', 'web'
  dashboard_views TEXT, -- JSON array of viewed dashboards
  interactions TEXT, -- JSON array of user interactions
  performance_metrics TEXT, -- JSON format with load times, etc.
  session_duration INTEGER, -- seconds
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Cross-Platform Analytics
CREATE TABLE IF NOT EXISTS cross_platform_analytics (
  id TEXT PRIMARY KEY, -- UUID
  organization_id INTEGER NOT NULL,
  analysis_date DATE DEFAULT CURRENT_DATE,
  platforms TEXT NOT NULL, -- JSON array of platforms analyzed
  usage_metrics TEXT NOT NULL, -- JSON format
  performance_metrics TEXT NOT NULL, -- JSON format
  user_behavior_patterns TEXT NOT NULL, -- JSON format
  cross_platform_insights TEXT NOT NULL, -- JSON array
  optimization_recommendations TEXT NOT NULL, -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Advanced Reports
CREATE TABLE IF NOT EXISTS advanced_reports (
  id TEXT PRIMARY KEY, -- UUID
  organization_id INTEGER NOT NULL,
  report_type TEXT NOT NULL, -- 'comprehensive', 'risk_deep_dive', 'compliance_audit', 'trend_analysis'
  title TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  report_data TEXT NOT NULL, -- JSON format with full report data
  visualizations TEXT NOT NULL, -- JSON array of chart/graph configs
  insights TEXT NOT NULL, -- JSON array of key insights
  recommendations TEXT NOT NULL, -- JSON array
  generated_by TEXT NOT NULL, -- AI model or user
  generation_time INTEGER NOT NULL, -- milliseconds
  report_size INTEGER NOT NULL, -- bytes
  access_level TEXT DEFAULT 'internal', -- 'public', 'internal', 'restricted', 'confidential'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- ===================================
-- PHASE 7: Enterprise Scale & Multi-tenancy
-- ===================================

-- Tenant Configurations
CREATE TABLE IF NOT EXISTS tenant_configurations (
  id TEXT PRIMARY KEY, -- Tenant UUID
  organization_name TEXT NOT NULL,
  subscription_tier TEXT NOT NULL, -- 'starter', 'professional', 'enterprise', 'custom'
  admin_email TEXT NOT NULL,
  configuration_data TEXT NOT NULL, -- JSON format with all tenant config
  deployment_status TEXT DEFAULT 'provisioning', -- 'provisioning', 'active', 'suspended', 'terminated'
  deployment_date DATETIME,
  resource_limits TEXT NOT NULL, -- JSON format with limits
  feature_flags TEXT NOT NULL, -- JSON format with enabled features
  custom_branding TEXT, -- JSON format with branding config
  sso_configuration TEXT, -- JSON format with SSO settings
  security_settings TEXT NOT NULL, -- JSON format
  billing_configuration TEXT, -- JSON format
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Enterprise Deployments
CREATE TABLE IF NOT EXISTS enterprise_deployments (
  id TEXT PRIMARY KEY, -- UUID
  tenant_id TEXT NOT NULL,
  deployment_type TEXT NOT NULL, -- 'cloud', 'hybrid', 'on_premises'
  deployment_config TEXT NOT NULL, -- JSON format
  infrastructure_config TEXT NOT NULL, -- JSON format
  scaling_configuration TEXT NOT NULL, -- JSON format
  monitoring_endpoints TEXT NOT NULL, -- JSON array
  deployment_status TEXT DEFAULT 'planned', -- 'planned', 'deploying', 'active', 'maintenance', 'failed'
  deployment_date DATETIME,
  last_health_check DATETIME,
  performance_metrics TEXT, -- JSON format
  resource_usage TEXT, -- JSON format
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenant_configurations(id)
);

-- Scalability Metrics
CREATE TABLE IF NOT EXISTS scalability_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT,
  metric_type TEXT NOT NULL, -- 'performance', 'resource_usage', 'user_load', 'throughput'
  metric_name TEXT NOT NULL,
  metric_value REAL NOT NULL,
  metric_unit TEXT NOT NULL,
  measurement_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  aggregation_period TEXT, -- 'minute', 'hour', 'day'
  metadata TEXT, -- JSON format
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenant_configurations(id)
);

-- Enterprise Monitoring
CREATE TABLE IF NOT EXISTS enterprise_monitoring (
  id TEXT PRIMARY KEY, -- UUID
  tenant_id TEXT NOT NULL,
  monitoring_type TEXT NOT NULL, -- 'infrastructure', 'application', 'security', 'business'
  alert_level TEXT NOT NULL, -- 'info', 'warning', 'error', 'critical'
  alert_title TEXT NOT NULL,
  alert_description TEXT NOT NULL,
  alert_data TEXT NOT NULL, -- JSON format
  resolution_status TEXT DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'false_positive'
  acknowledged_by TEXT,
  acknowledged_at DATETIME,
  resolved_by TEXT,
  resolved_at DATETIME,
  resolution_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenant_configurations(id)
);

-- ===================================
-- PHASE 8: Integration Platform & Partner Ecosystem
-- ===================================

-- Integration Connectors
CREATE TABLE IF NOT EXISTS integration_connectors (
  id TEXT PRIMARY KEY, -- UUID
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'security_tool', 'compliance_platform', 'ticketing_system', 'siem', etc.
  category TEXT NOT NULL, -- 'security', 'compliance', 'operations', 'analytics'
  organization_id INTEGER NOT NULL,
  configuration TEXT NOT NULL, -- JSON format with connector config
  authentication_config TEXT NOT NULL, -- JSON format (encrypted)
  status TEXT DEFAULT 'configured', -- 'configured', 'active', 'error', 'disabled'
  last_sync DATETIME,
  sync_frequency TEXT DEFAULT 'hourly', -- 'real_time', 'minutes', 'hourly', 'daily'
  data_flow_direction TEXT DEFAULT 'bidirectional', -- 'inbound', 'outbound', 'bidirectional'
  error_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  last_error TEXT,
  performance_metrics TEXT, -- JSON format
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Partner Integrations
CREATE TABLE IF NOT EXISTS partner_integrations (
  id TEXT PRIMARY KEY, -- UUID
  partner_name TEXT NOT NULL,
  partner_type TEXT NOT NULL, -- 'technology_partner', 'service_provider', 'vendor'
  integration_type TEXT NOT NULL, -- 'api', 'webhook', 'data_feed', 'marketplace'
  partnership_tier TEXT NOT NULL, -- 'certified', 'verified', 'community'
  integration_config TEXT NOT NULL, -- JSON format
  api_documentation_url TEXT,
  support_contact TEXT,
  certification_level TEXT, -- 'basic', 'advanced', 'premium'
  marketplace_listing TEXT, -- JSON format
  revenue_sharing_config TEXT, -- JSON format
  status TEXT DEFAULT 'active', -- 'active', 'deprecated', 'maintenance', 'suspended'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Data Flow Orchestrations
CREATE TABLE IF NOT EXISTS data_flow_orchestrations (
  id TEXT PRIMARY KEY, -- UUID
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  organization_id INTEGER NOT NULL,
  source_connectors TEXT NOT NULL, -- JSON array of connector IDs
  destination_connectors TEXT NOT NULL, -- JSON array of connector IDs
  transformation_rules TEXT NOT NULL, -- JSON format
  scheduling_config TEXT NOT NULL, -- JSON format
  error_handling_config TEXT NOT NULL, -- JSON format
  retry_policy TEXT NOT NULL, -- JSON format
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'error', 'completed'
  last_execution DATETIME,
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  average_execution_time INTEGER, -- milliseconds
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Integration Marketplace
CREATE TABLE IF NOT EXISTS integration_marketplace (
  id TEXT PRIMARY KEY, -- UUID
  integration_name TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'security', 'compliance', 'operations', 'analytics'
  description TEXT NOT NULL,
  features TEXT NOT NULL, -- JSON array
  pricing_model TEXT, -- 'free', 'freemium', 'subscription', 'usage_based'
  pricing_details TEXT, -- JSON format
  installation_instructions TEXT NOT NULL,
  documentation_url TEXT,
  support_url TEXT,
  rating REAL DEFAULT 0.0, -- Average rating 0-5
  review_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  compatibility_requirements TEXT, -- JSON format
  certification_status TEXT DEFAULT 'pending', -- 'pending', 'certified', 'rejected'
  marketplace_status TEXT DEFAULT 'draft', -- 'draft', 'published', 'archived'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Integration Analytics
CREATE TABLE IF NOT EXISTS integration_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id INTEGER NOT NULL,
  connector_id TEXT,
  metric_type TEXT NOT NULL, -- 'sync_performance', 'error_rate', 'data_volume', 'api_calls'
  metric_value REAL NOT NULL,
  metric_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  additional_data TEXT, -- JSON format
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (connector_id) REFERENCES integration_connectors(id)
);

-- Integration Workflows
CREATE TABLE IF NOT EXISTS integration_workflows (
  id TEXT PRIMARY KEY, -- UUID
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  organization_id INTEGER NOT NULL,
  workflow_definition TEXT NOT NULL, -- JSON format with workflow steps
  trigger_configuration TEXT NOT NULL, -- JSON format
  action_configuration TEXT NOT NULL, -- JSON format
  approval_requirements TEXT, -- JSON format
  notification_settings TEXT NOT NULL, -- JSON format
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'archived'
  execution_count INTEGER DEFAULT 0,
  success_rate REAL DEFAULT 0.0,
  average_execution_time INTEGER, -- milliseconds
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- ===================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ===================================

-- Phase 4 Indexes
CREATE INDEX IF NOT EXISTS idx_compliance_evidence_org_framework ON compliance_evidence(organization_id, framework);
CREATE INDEX IF NOT EXISTS idx_compliance_evidence_timestamp ON compliance_evidence(collection_timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_packages_org_status ON audit_packages(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_evidence_recommendations_org ON evidence_recommendations(organization_id, status);

-- Phase 5 Indexes  
CREATE INDEX IF NOT EXISTS idx_executive_summaries_org ON executive_summaries(organization_id, generation_timestamp);
CREATE INDEX IF NOT EXISTS idx_board_reports_org_meeting ON board_reports(organization_id, board_meeting_date);
CREATE INDEX IF NOT EXISTS idx_predictive_analysis_org_type ON predictive_analysis(organization_id, analysis_type);
CREATE INDEX IF NOT EXISTS idx_strategic_recommendations_org_status ON strategic_recommendations(organization_id, status);

-- Phase 6 Indexes
CREATE INDEX IF NOT EXISTS idx_predictive_models_org_status ON predictive_models(organization_id, deployment_status);
CREATE INDEX IF NOT EXISTS idx_mobile_analytics_user_org ON mobile_analytics_sessions(user_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_cross_platform_analytics_org_date ON cross_platform_analytics(organization_id, analysis_date);
CREATE INDEX IF NOT EXISTS idx_advanced_reports_org_type ON advanced_reports(organization_id, report_type);

-- Phase 7 Indexes
CREATE INDEX IF NOT EXISTS idx_tenant_configurations_status ON tenant_configurations(deployment_status);
CREATE INDEX IF NOT EXISTS idx_enterprise_deployments_tenant ON enterprise_deployments(tenant_id, deployment_status);
CREATE INDEX IF NOT EXISTS idx_scalability_metrics_tenant_timestamp ON scalability_metrics(tenant_id, measurement_timestamp);
CREATE INDEX IF NOT EXISTS idx_enterprise_monitoring_tenant_alert ON enterprise_monitoring(tenant_id, alert_level);

-- Phase 8 Indexes
CREATE INDEX IF NOT EXISTS idx_integration_connectors_org_status ON integration_connectors(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_partner_integrations_type ON partner_integrations(partner_type, status);
CREATE INDEX IF NOT EXISTS idx_data_flow_orchestrations_org ON data_flow_orchestrations(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_integration_marketplace_category ON integration_marketplace(category, marketplace_status);
CREATE INDEX IF NOT EXISTS idx_integration_analytics_org_timestamp ON integration_analytics(organization_id, metric_timestamp);
CREATE INDEX IF NOT EXISTS idx_integration_workflows_org ON integration_workflows(organization_id, status);
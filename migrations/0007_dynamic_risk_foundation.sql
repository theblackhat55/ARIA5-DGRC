-- Phase 1: Dynamic Risk Foundation Database Schema
-- Vision-aligned service-centric architecture with real-time risk processing

-- Business Services - Service-centric architecture foundation
CREATE TABLE IF NOT EXISTS business_services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  business_owner TEXT,
  technical_owner TEXT,
  
  -- CIA Triad Scoring (1-5 scale for impact assessment)
  confidentiality_impact INTEGER DEFAULT 3 CHECK (confidentiality_impact BETWEEN 1 AND 5),
  integrity_impact INTEGER DEFAULT 3 CHECK (integrity_impact BETWEEN 1 AND 5), 
  availability_impact INTEGER DEFAULT 3 CHECK (availability_impact BETWEEN 1 AND 5),
  
  -- Service criticality and business context
  criticality_level TEXT DEFAULT 'Medium' CHECK (criticality_level IN ('Low', 'Medium', 'High', 'Critical')),
  business_impact_tier INTEGER DEFAULT 3 CHECK (business_impact_tier BETWEEN 1 AND 5),
  revenue_dependency BOOLEAN DEFAULT FALSE,
  customer_facing BOOLEAN DEFAULT FALSE,
  
  -- Service status and operational data
  service_status TEXT DEFAULT 'Active' CHECK (service_status IN ('Active', 'Inactive', 'Deprecated', 'Planned')),
  deployment_environment TEXT DEFAULT 'Production' CHECK (deployment_environment IN ('Development', 'Staging', 'Production')),
  
  -- Timestamps for audit trail
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Dynamic Risks - Auto-generated risk pipeline with ML confidence scoring
CREATE TABLE IF NOT EXISTS dynamic_risks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Source system tracking for auto-generation
  source_system TEXT NOT NULL CHECK (source_system IN ('manual', 'defender', 'servicenow', 'jira', 'threat_intel', 'asset_monitor')),
  source_id TEXT, -- External system identifier for correlation
  source_url TEXT, -- Link back to source system
  
  -- ML confidence and approval workflow
  confidence_score REAL DEFAULT 0.0 CHECK (confidence_score BETWEEN 0.0 AND 1.0),
  auto_generated BOOLEAN DEFAULT FALSE,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'auto_approved', 'manually_approved', 'rejected', 'under_review')),
  approval_required BOOLEAN DEFAULT TRUE,
  
  -- Risk content and classification
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'Operational',
  severity_level TEXT DEFAULT 'Medium' CHECK (severity_level IN ('Low', 'Medium', 'High', 'Critical')),
  
  -- Risk scoring (1-100 scale)
  probability INTEGER DEFAULT 50 CHECK (probability BETWEEN 1 AND 100),
  impact INTEGER DEFAULT 50 CHECK (impact BETWEEN 1 AND 100),
  risk_score INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN (probability * impact / 100) >= 80 THEN 100
      WHEN (probability * impact / 100) >= 60 THEN 80  
      WHEN (probability * impact / 100) >= 40 THEN 60
      WHEN (probability * impact / 100) >= 20 THEN 40
      ELSE 20
    END
  ) STORED,
  
  -- Relationships to existing entities
  service_id INTEGER REFERENCES business_services(id) ON DELETE SET NULL,
  asset_id INTEGER REFERENCES assets(id) ON DELETE SET NULL,
  
  -- Workflow and lifecycle management
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'on_hold', 'transferred')),
  assigned_to TEXT,
  due_date DATE,
  
  -- Approval tracking
  approved_by TEXT,
  approved_at DATETIME,
  rejection_reason TEXT,
  
  -- Timestamps for real-time processing
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_assessed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Service-Asset Relationships - Enable risk cascading between services and assets
CREATE TABLE IF NOT EXISTS service_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL REFERENCES business_services(id) ON DELETE CASCADE,
  asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  
  -- Dependency modeling for risk cascade calculations
  dependency_type TEXT DEFAULT 'depends_on' CHECK (dependency_type IN ('depends_on', 'supports', 'critical_to', 'backup_for')),
  impact_weight REAL DEFAULT 1.0 CHECK (impact_weight BETWEEN 0.0 AND 5.0), -- Multiplier for risk cascade
  
  -- Service-asset relationship metadata
  criticality_level TEXT DEFAULT 'Medium' CHECK (criticality_level IN ('Low', 'Medium', 'High', 'Critical')),
  relationship_notes TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure unique service-asset pairs
  UNIQUE(service_id, asset_id)
);

-- Risk Score History - Track real-time risk score changes (<15min updates)
CREATE TABLE IF NOT EXISTS risk_score_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  risk_id INTEGER NOT NULL REFERENCES dynamic_risks(id) ON DELETE CASCADE,
  
  -- Score change tracking
  old_score INTEGER,
  new_score INTEGER,
  score_delta INTEGER GENERATED ALWAYS AS (new_score - COALESCE(old_score, 0)) STORED,
  
  -- Change attribution and reasoning  
  change_reason TEXT NOT NULL,
  change_source TEXT NOT NULL CHECK (change_source IN ('manual', 'automated', 'cascade', 'ml_prediction', 'integration_sync')),
  change_trigger TEXT, -- What triggered this change
  
  -- User and system tracking
  updated_by TEXT,
  system_context TEXT, -- Additional context for automated changes
  
  -- Performance tracking for <15min updates target
  change_latency_seconds INTEGER, -- Time from trigger to score update
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Integration Sources - External system status and sync management
CREATE TABLE IF NOT EXISTS integration_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  
  -- Integration configuration
  is_active BOOLEAN DEFAULT FALSE,
  api_endpoint TEXT,
  sync_interval_minutes INTEGER DEFAULT 15 CHECK (sync_interval_minutes > 0), -- Target: <15min updates
  
  -- Status tracking and monitoring
  last_sync_at DATETIME,
  next_sync_at DATETIME,
  sync_status TEXT DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'success', 'error', 'disabled')),
  consecutive_failures INTEGER DEFAULT 0,
  
  -- Error handling and diagnostics
  last_error_message TEXT,
  last_error_at DATETIME,
  health_check_url TEXT,
  
  -- Performance metrics
  avg_sync_duration_seconds INTEGER DEFAULT 0,
  total_risks_generated INTEGER DEFAULT 0,
  success_rate_percentage REAL DEFAULT 100.0,
  
  -- Configuration metadata
  config_json TEXT, -- JSON configuration for integration-specific settings
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Service Risk Scores - Calculated service-level risk aggregation 
CREATE TABLE IF NOT EXISTS service_risk_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL REFERENCES business_services(id) ON DELETE CASCADE,
  
  -- CIA Triad risk scoring
  confidentiality_risk INTEGER DEFAULT 0 CHECK (confidentiality_risk BETWEEN 0 AND 100),
  integrity_risk INTEGER DEFAULT 0 CHECK (integrity_risk BETWEEN 0 AND 100),
  availability_risk INTEGER DEFAULT 0 CHECK (availability_risk BETWEEN 0 AND 100),
  
  -- Aggregated risk metrics
  direct_risk_count INTEGER DEFAULT 0, -- Risks directly assigned to service
  cascaded_risk_count INTEGER DEFAULT 0, -- Risks from related assets
  total_risk_score INTEGER DEFAULT 0 CHECK (total_risk_score BETWEEN 0 AND 100),
  
  -- Business impact calculations
  business_impact_score INTEGER DEFAULT 0 CHECK (business_impact_score BETWEEN 0 AND 100),
  financial_impact_estimate REAL DEFAULT 0.0,
  
  -- Risk trend analysis
  risk_trend TEXT DEFAULT 'stable' CHECK (risk_trend IN ('increasing', 'decreasing', 'stable', 'volatile')),
  trend_percentage REAL DEFAULT 0.0, -- Week-over-week change
  
  -- Timestamps for real-time updates
  calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure unique service scoring
  UNIQUE(service_id)
);

-- Indexes for performance optimization (real-time queries)
CREATE INDEX IF NOT EXISTS idx_dynamic_risks_source_system ON dynamic_risks(source_system);
CREATE INDEX IF NOT EXISTS idx_dynamic_risks_approval_status ON dynamic_risks(approval_status);
CREATE INDEX IF NOT EXISTS idx_dynamic_risks_confidence_score ON dynamic_risks(confidence_score);
CREATE INDEX IF NOT EXISTS idx_dynamic_risks_service_id ON dynamic_risks(service_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_risks_created_at ON dynamic_risks(created_at);
CREATE INDEX IF NOT EXISTS idx_dynamic_risks_risk_score ON dynamic_risks(risk_score);

CREATE INDEX IF NOT EXISTS idx_business_services_criticality ON business_services(criticality_level);
CREATE INDEX IF NOT EXISTS idx_business_services_status ON business_services(service_status);

CREATE INDEX IF NOT EXISTS idx_service_assets_service_id ON service_assets(service_id);
CREATE INDEX IF NOT EXISTS idx_service_assets_asset_id ON service_assets(asset_id);

CREATE INDEX IF NOT EXISTS idx_risk_score_history_risk_id ON risk_score_history(risk_id);
CREATE INDEX IF NOT EXISTS idx_risk_score_history_created_at ON risk_score_history(created_at);

CREATE INDEX IF NOT EXISTS idx_integration_sources_active ON integration_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_integration_sources_next_sync ON integration_sources(next_sync_at);

CREATE INDEX IF NOT EXISTS idx_service_risk_scores_service_id ON service_risk_scores(service_id);
CREATE INDEX IF NOT EXISTS idx_service_risk_scores_total_risk ON service_risk_scores(total_risk_score);

-- Seed initial business services for testing and demonstration
INSERT OR IGNORE INTO business_services (name, description, business_owner, technical_owner, confidentiality_impact, integrity_impact, availability_impact, criticality_level, customer_facing, revenue_dependency) VALUES
('Customer Portal', 'Primary customer-facing web application for account management and services', 'Product Manager', 'Platform Team', 4, 5, 5, 'Critical', TRUE, TRUE),
('Payment Processing', 'Core payment processing and transaction management system', 'Finance Director', 'Security Team', 5, 5, 4, 'Critical', TRUE, TRUE),
('Internal CRM', 'Customer relationship management system for sales and support', 'Sales Director', 'IT Operations', 3, 4, 3, 'High', FALSE, FALSE),
('Email Marketing', 'Automated email marketing and customer communication platform', 'Marketing Manager', 'DevOps Team', 2, 3, 2, 'Medium', TRUE, FALSE),
('Employee Portal', 'Internal employee self-service portal for HR and IT requests', 'HR Manager', 'IT Support', 3, 2, 3, 'Medium', FALSE, FALSE),
('Data Analytics', 'Business intelligence and analytics reporting platform', 'Data Officer', 'Analytics Team', 4, 3, 2, 'High', FALSE, FALSE),
('API Gateway', 'Central API management and routing infrastructure service', 'Technical Architect', 'Platform Team', 3, 5, 5, 'Critical', TRUE, TRUE),
('Backup Systems', 'Automated backup and disaster recovery infrastructure', 'IT Manager', 'Infrastructure Team', 5, 4, 4, 'High', FALSE, FALSE);

-- Seed integration sources for Phase 1 implementation
INSERT OR IGNORE INTO integration_sources (source_name, display_name, is_active, sync_interval_minutes, health_check_url, config_json) VALUES
('microsoft_defender', 'Microsoft Defender for Cloud', FALSE, 15, '/api/integrations/defender/health', '{"endpoint": "https://management.azure.com", "version": "2023-01-01"}'),
('servicenow', 'ServiceNow ITSM', FALSE, 20, '/api/integrations/servicenow/health', '{"instance": "company", "api_version": "v1"}'),
('jira', 'Atlassian Jira', FALSE, 30, '/api/integrations/jira/health', '{"server": "company.atlassian.net", "project_key": "RISK"}'),
('threat_intel', 'Threat Intelligence Feeds', FALSE, 60, '/api/integrations/threat-intel/health', '{"feeds": ["otx", "cisa", "misp"], "confidence_threshold": 0.7}'),
('asset_monitor', 'Asset Monitoring System', TRUE, 10, '/api/integrations/assets/health', '{"monitoring_enabled": true, "alert_threshold": "high"}');
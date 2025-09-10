-- Phase 1: Dynamic Risk Foundation - Service-Centric Architecture (Fixed)
-- Vision: Transform static GRC into dynamic, AI-enabled risk intelligence platform

-- Business Services - Core service catalog with CIA triad scoring
CREATE TABLE IF NOT EXISTS business_services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  business_owner TEXT,
  technical_owner TEXT,
  service_type TEXT DEFAULT 'Application',
  
  -- CIA Triad Scoring (1-5 scale for business impact assessment)
  confidentiality_impact INTEGER DEFAULT 1,
  integrity_impact INTEGER DEFAULT 1, 
  availability_impact INTEGER DEFAULT 1,
  
  -- Business Context
  criticality_level TEXT DEFAULT 'Medium',
  business_function TEXT,
  revenue_impact DECIMAL(15,2) DEFAULT 0.00,
  regulatory_requirements TEXT,
  
  -- Service Health & Status
  operational_status TEXT DEFAULT 'Active',
  last_assessment_date DATETIME,
  next_assessment_date DATETIME,
  
  -- Risk Scoring Cache (calculated dynamically)
  current_risk_score INTEGER DEFAULT 0,
  risk_trend TEXT DEFAULT 'Stable',
  last_risk_update DATETIME,
  
  -- Audit Trail
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Dynamic Risks - Auto-generated risk pipeline with ML confidence scoring
CREATE TABLE IF NOT EXISTS dynamic_risks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Risk Source Attribution  
  source_system TEXT NOT NULL,
  source_id TEXT,
  source_url TEXT,
  
  -- ML Confidence & Automation
  confidence_score REAL DEFAULT 0.0,
  auto_generated BOOLEAN DEFAULT FALSE,
  approval_status TEXT DEFAULT 'pending',
  
  -- Risk Content
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Operational',
  severity_level TEXT DEFAULT 'Medium',
  
  -- Risk Assessment
  probability INTEGER DEFAULT 50,
  impact INTEGER DEFAULT 50,  
  risk_score INTEGER DEFAULT 0,
  
  -- Service & Asset Relationships
  service_id INTEGER,
  asset_id INTEGER,
  
  -- Workflow Management
  status TEXT DEFAULT 'active',
  assigned_to TEXT,
  approval_required BOOLEAN DEFAULT TRUE,
  approved_by TEXT,
  approved_at DATETIME,
  
  -- AI Enhancement
  ai_summary TEXT,
  recommended_actions TEXT,
  related_risks TEXT,
  
  -- Audit Trail
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Service-Asset Relationships - Risk cascade modeling
CREATE TABLE IF NOT EXISTS service_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL,
  asset_id INTEGER NOT NULL,
  
  -- Relationship Type & Impact
  dependency_type TEXT DEFAULT 'depends_on',
  impact_weight REAL DEFAULT 1.0,
  criticality TEXT DEFAULT 'Medium',
  
  -- Relationship Context
  relationship_description TEXT,
  failure_impact TEXT,
  recovery_time_estimate INTEGER,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  verified_at DATETIME,
  verified_by TEXT,
  
  -- Audit Trail
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Risk Score History - Real-time update tracking (<15 minute target)
CREATE TABLE IF NOT EXISTS risk_score_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  risk_id INTEGER NOT NULL,
  
  -- Score Changes
  old_score INTEGER,
  new_score INTEGER,
  score_delta INTEGER,
  
  -- Change Attribution
  change_reason TEXT,
  change_source TEXT,
  change_details TEXT,
  
  -- Change Context
  updated_by TEXT,
  external_trigger_id TEXT,
  
  -- Performance Tracking
  processing_time_ms INTEGER,
  cascade_depth INTEGER DEFAULT 0,
  
  -- Audit Trail
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Integration Sources - External system connector status
CREATE TABLE IF NOT EXISTS integration_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_name TEXT UNIQUE NOT NULL,
  
  -- Connection Configuration
  is_active BOOLEAN DEFAULT FALSE,
  api_endpoint TEXT,
  authentication_method TEXT DEFAULT 'api_key',
  
  -- Sync Configuration
  sync_interval_minutes INTEGER DEFAULT 15,
  last_sync_at DATETIME,
  next_sync_at DATETIME,
  
  -- Status Monitoring
  sync_status TEXT DEFAULT 'idle',
  last_success_at DATETIME,
  consecutive_failures INTEGER DEFAULT 0,
  error_message TEXT,
  
  -- Performance Metrics
  total_syncs INTEGER DEFAULT 0,
  total_risks_generated INTEGER DEFAULT 0,
  avg_sync_duration_ms INTEGER DEFAULT 0,
  
  -- Configuration
  config_json TEXT,
  rate_limit_per_hour INTEGER DEFAULT 1000,
  
  -- Audit Trail
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Risk Approval Queue - ML-powered approval workflow
CREATE TABLE IF NOT EXISTS risk_approval_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  risk_id INTEGER NOT NULL,
  
  -- Approval Context
  approval_type TEXT DEFAULT 'manual',
  priority TEXT DEFAULT 'medium',
  
  -- ML Analysis
  ml_recommendation TEXT,
  ml_confidence REAL DEFAULT 0.0,
  ml_reasoning TEXT,
  
  -- Queue Management
  queue_position INTEGER,
  assigned_reviewer TEXT,
  escalation_level INTEGER DEFAULT 1,
  
  -- Timing
  queued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  target_decision_by DATETIME,
  reviewed_at DATETIME,
  
  -- Decision
  decision TEXT,
  decision_notes TEXT,
  decided_by TEXT,
  decided_at DATETIME,
  
  -- Metrics
  time_in_queue_minutes INTEGER,
  sla_met BOOLEAN
);

-- Service Risk Aggregation - Real-time service-level risk scoring
CREATE TABLE IF NOT EXISTS service_risk_aggregation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL,
  
  -- Risk Metrics
  total_risks INTEGER DEFAULT 0,
  critical_risks INTEGER DEFAULT 0,
  high_risks INTEGER DEFAULT 0,
  medium_risks INTEGER DEFAULT 0,
  low_risks INTEGER DEFAULT 0,
  
  -- Score Calculations
  aggregate_risk_score INTEGER DEFAULT 0,
  cia_weighted_score REAL DEFAULT 0.0,
  asset_cascade_score REAL DEFAULT 0.0,
  
  -- Trend Analysis
  score_7d_avg REAL DEFAULT 0.0,
  score_30d_avg REAL DEFAULT 0.0,  
  trend_direction TEXT DEFAULT 'stable',
  trend_confidence REAL DEFAULT 0.0,
  
  -- Update Tracking
  last_calculation_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  calculation_duration_ms INTEGER,
  risks_processed INTEGER DEFAULT 0,
  
  -- Performance Targets
  target_score INTEGER DEFAULT 20,
  score_vs_target INTEGER DEFAULT 0,
  
  -- Audit Trail
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_business_services_criticality ON business_services(criticality_level);
CREATE INDEX IF NOT EXISTS idx_business_services_status ON business_services(operational_status);
CREATE INDEX IF NOT EXISTS idx_dynamic_risks_source ON dynamic_risks(source_system);
CREATE INDEX IF NOT EXISTS idx_dynamic_risks_status ON dynamic_risks(approval_status);
CREATE INDEX IF NOT EXISTS idx_dynamic_risks_service ON dynamic_risks(service_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_risks_confidence ON dynamic_risks(confidence_score);
CREATE INDEX IF NOT EXISTS idx_service_assets_service ON service_assets(service_id);
CREATE INDEX IF NOT EXISTS idx_service_assets_asset ON service_assets(asset_id);
CREATE INDEX IF NOT EXISTS idx_risk_score_history_risk ON risk_score_history(risk_id);
CREATE INDEX IF NOT EXISTS idx_integration_sources_active ON integration_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_approval_queue_priority ON risk_approval_queue(priority);
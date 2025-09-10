-- Phase 1: Dynamic Risk Foundation - Service-Centric Architecture
-- Vision: Transform static GRC into dynamic, AI-enabled risk intelligence platform
-- Target: 90%+ automated risk discovery with <15 minute update cycles

-- Business Services - Core service catalog with CIA triad scoring
CREATE TABLE IF NOT EXISTS business_services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  business_owner TEXT,
  technical_owner TEXT,
  service_type TEXT DEFAULT 'Application' CHECK (service_type IN ('Application', 'Infrastructure', 'Data', 'Process')),
  
  -- CIA Triad Scoring (1-5 scale for business impact assessment)
  confidentiality_impact INTEGER DEFAULT 1 CHECK (confidentiality_impact BETWEEN 1 AND 5),
  integrity_impact INTEGER DEFAULT 1 CHECK (integrity_impact BETWEEN 1 AND 5), 
  availability_impact INTEGER DEFAULT 1 CHECK (availability_impact BETWEEN 1 AND 5),
  
  -- Business Context
  criticality_level TEXT DEFAULT 'Medium' CHECK (criticality_level IN ('Low', 'Medium', 'High', 'Critical')),
  business_function TEXT, -- Core business process this service supports
  revenue_impact DECIMAL(15,2) DEFAULT 0.00, -- Revenue at risk if service compromised
  regulatory_requirements TEXT, -- JSON array of applicable regulations
  
  -- Service Health & Status
  operational_status TEXT DEFAULT 'Active' CHECK (operational_status IN ('Active', 'Inactive', 'Deprecated', 'Development')),
  last_assessment_date DATETIME,
  next_assessment_date DATETIME,
  
  -- Risk Scoring Cache (calculated dynamically)
  current_risk_score INTEGER DEFAULT 0, -- Aggregated risk score (0-100)
  risk_trend TEXT DEFAULT 'Stable' CHECK (risk_trend IN ('Improving', 'Stable', 'Deteriorating')),
  last_risk_update DATETIME,
  
  -- Audit Trail
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Dynamic Risks - Auto-generated risk pipeline with ML confidence scoring
CREATE TABLE IF NOT EXISTS dynamic_risks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Risk Source Attribution  
  source_system TEXT NOT NULL CHECK (source_system IN ('manual', 'defender', 'servicenow', 'jira', 'threat_intel', 'asset_monitor', 'automation')),
  source_id TEXT, -- External system identifier (ticket ID, incident ID, etc.)
  source_url TEXT, -- Link back to source system
  
  -- ML Confidence & Automation
  confidence_score REAL DEFAULT 0.0 CHECK (confidence_score BETWEEN 0.0 AND 1.0), -- ML confidence (0.0-1.0)
  auto_generated BOOLEAN DEFAULT FALSE,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'auto_approved', 'manually_approved', 'rejected', 'under_review')),
  
  -- Risk Content
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Operational',
  severity_level TEXT DEFAULT 'Medium' CHECK (severity_level IN ('Low', 'Medium', 'High', 'Critical')),
  
  -- Risk Assessment
  probability INTEGER DEFAULT 50 CHECK (probability BETWEEN 1 AND 100), -- Likelihood percentage
  impact INTEGER DEFAULT 50 CHECK (impact BETWEEN 1 AND 100), -- Impact percentage  
  risk_score INTEGER DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100), -- Calculated: probability * impact / 100
  
  -- Service & Asset Relationships
  service_id INTEGER REFERENCES business_services(id),
  asset_id INTEGER REFERENCES assets(id),
  
  -- Workflow Management
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'on_hold', 'transferred')),
  assigned_to TEXT,
  approval_required BOOLEAN DEFAULT TRUE,
  approved_by TEXT,
  approved_at DATETIME,
  
  -- AI Enhancement
  ai_summary TEXT, -- AI-generated risk summary
  recommended_actions TEXT, -- JSON array of AI-suggested mitigations
  related_risks TEXT, -- JSON array of related risk IDs
  
  -- Audit Trail
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Service-Asset Relationships - Risk cascade modeling
CREATE TABLE IF NOT EXISTS service_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL REFERENCES business_services(id),
  asset_id INTEGER NOT NULL REFERENCES assets(id),
  
  -- Relationship Type & Impact
  dependency_type TEXT DEFAULT 'depends_on' CHECK (dependency_type IN ('depends_on', 'supports', 'critical_to', 'uses', 'provides')),
  impact_weight REAL DEFAULT 1.0 CHECK (impact_weight BETWEEN 0.0 AND 5.0), -- Multiplier for risk cascade calculation
  criticality TEXT DEFAULT 'Medium' CHECK (criticality IN ('Low', 'Medium', 'High', 'Critical')),
  
  -- Relationship Context
  relationship_description TEXT,
  failure_impact TEXT, -- What happens if this relationship fails
  recovery_time_estimate INTEGER, -- Estimated recovery time in hours
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  verified_at DATETIME,
  verified_by TEXT,
  
  -- Audit Trail
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure unique service-asset pairs
  UNIQUE(service_id, asset_id)
);

-- Risk Score History - Real-time update tracking (<15 minute target)
CREATE TABLE IF NOT EXISTS risk_score_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  risk_id INTEGER NOT NULL REFERENCES dynamic_risks(id),
  
  -- Score Changes
  old_score INTEGER,
  new_score INTEGER,
  score_delta INTEGER, -- Calculated: new_score - old_score
  
  -- Change Attribution
  change_reason TEXT,
  change_source TEXT CHECK (change_source IN ('manual', 'automated', 'cascade', 'ml_prediction', 'external_event')),
  change_details TEXT, -- JSON with specific change information
  
  -- Change Context
  updated_by TEXT,
  external_trigger_id TEXT, -- Reference to external event that caused change
  
  -- Performance Tracking
  processing_time_ms INTEGER, -- Time taken to process this update
  cascade_depth INTEGER DEFAULT 0, -- How many cascade levels this update triggered
  
  -- Audit Trail
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Integration Sources - External system connector status
CREATE TABLE IF NOT EXISTS integration_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_name TEXT UNIQUE NOT NULL CHECK (source_name IN ('microsoft_defender', 'servicenow', 'jira', 'threat_intel', 'asset_monitor', 'vulnerability_scanner')),
  
  -- Connection Configuration
  is_active BOOLEAN DEFAULT FALSE,
  api_endpoint TEXT,
  authentication_method TEXT DEFAULT 'api_key' CHECK (authentication_method IN ('api_key', 'oauth', 'certificate', 'basic_auth')),
  
  -- Sync Configuration
  sync_interval_minutes INTEGER DEFAULT 15 CHECK (sync_interval_minutes >= 5), -- <15min updates target
  last_sync_at DATETIME,
  next_sync_at DATETIME,
  
  -- Status Monitoring
  sync_status TEXT DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'error', 'success', 'disabled')),
  last_success_at DATETIME,
  consecutive_failures INTEGER DEFAULT 0,
  error_message TEXT,
  
  -- Performance Metrics
  total_syncs INTEGER DEFAULT 0,
  total_risks_generated INTEGER DEFAULT 0,
  avg_sync_duration_ms INTEGER DEFAULT 0,
  
  -- Configuration
  config_json TEXT, -- JSON with source-specific configuration
  rate_limit_per_hour INTEGER DEFAULT 1000,
  
  -- Audit Trail
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Risk Approval Queue - ML-powered approval workflow
CREATE TABLE IF NOT EXISTS risk_approval_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  risk_id INTEGER NOT NULL REFERENCES dynamic_risks(id),
  
  -- Approval Context
  approval_type TEXT DEFAULT 'manual' CHECK (approval_type IN ('manual', 'auto_high_confidence', 'auto_low_risk', 'escalated')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  
  -- ML Analysis
  ml_recommendation TEXT CHECK (ml_recommendation IN ('approve', 'reject', 'review', 'escalate')),
  ml_confidence REAL DEFAULT 0.0 CHECK (ml_confidence BETWEEN 0.0 AND 1.0),
  ml_reasoning TEXT, -- AI explanation for recommendation
  
  -- Queue Management
  queue_position INTEGER,
  assigned_reviewer TEXT,
  escalation_level INTEGER DEFAULT 1,
  
  -- Timing
  queued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  target_decision_by DATETIME, -- SLA target
  reviewed_at DATETIME,
  
  -- Decision
  decision TEXT CHECK (decision IN ('approved', 'rejected', 'needs_more_info', 'escalated')),
  decision_notes TEXT,
  decided_by TEXT,
  decided_at DATETIME,
  
  -- Metrics
  time_in_queue_minutes INTEGER, -- Calculated when decision made
  sla_met BOOLEAN, -- Whether target_decision_by was met
  
  UNIQUE(risk_id) -- Each risk can only be in queue once
);

-- Service Risk Aggregation - Real-time service-level risk scoring
CREATE TABLE IF NOT EXISTS service_risk_aggregation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL REFERENCES business_services(id),
  
  -- Risk Metrics
  total_risks INTEGER DEFAULT 0,
  critical_risks INTEGER DEFAULT 0,
  high_risks INTEGER DEFAULT 0,
  medium_risks INTEGER DEFAULT 0,
  low_risks INTEGER DEFAULT 0,
  
  -- Score Calculations
  aggregate_risk_score INTEGER DEFAULT 0 CHECK (aggregate_risk_score BETWEEN 0 AND 100),
  cia_weighted_score REAL DEFAULT 0.0, -- CIA triad weighted score
  asset_cascade_score REAL DEFAULT 0.0, -- Risk cascaded from dependent assets
  
  -- Trend Analysis
  score_7d_avg REAL DEFAULT 0.0, -- 7-day rolling average
  score_30d_avg REAL DEFAULT 0.0, -- 30-day rolling average  
  trend_direction TEXT DEFAULT 'stable' CHECK (trend_direction IN ('improving', 'stable', 'deteriorating')),
  trend_confidence REAL DEFAULT 0.0,
  
  -- Update Tracking
  last_calculation_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  calculation_duration_ms INTEGER,
  risks_processed INTEGER DEFAULT 0,
  
  -- Performance Targets
  target_score INTEGER DEFAULT 20, -- Target risk score for this service
  score_vs_target INTEGER DEFAULT 0, -- Current score - target score
  
  -- Audit Trail
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(service_id) -- One aggregation record per service
);

-- Create indexes for performance (real-time <15min updates)
CREATE INDEX IF NOT EXISTS idx_business_services_criticality ON business_services(criticality_level);
CREATE INDEX IF NOT EXISTS idx_business_services_status ON business_services(operational_status);
CREATE INDEX IF NOT EXISTS idx_business_services_risk_score ON business_services(current_risk_score);

CREATE INDEX IF NOT EXISTS idx_dynamic_risks_source ON dynamic_risks(source_system);
CREATE INDEX IF NOT EXISTS idx_dynamic_risks_status ON dynamic_risks(approval_status);
CREATE INDEX IF NOT EXISTS idx_dynamic_risks_service ON dynamic_risks(service_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_risks_confidence ON dynamic_risks(confidence_score);
CREATE INDEX IF NOT EXISTS idx_dynamic_risks_auto_generated ON dynamic_risks(auto_generated);

CREATE INDEX IF NOT EXISTS idx_service_assets_service ON service_assets(service_id);
CREATE INDEX IF NOT EXISTS idx_service_assets_asset ON service_assets(asset_id);
CREATE INDEX IF NOT EXISTS idx_service_assets_active ON service_assets(is_active);

CREATE INDEX IF NOT EXISTS idx_risk_score_history_risk ON risk_score_history(risk_id);
CREATE INDEX IF NOT EXISTS idx_risk_score_history_date ON risk_score_history(updated_at);
CREATE INDEX IF NOT EXISTS idx_risk_score_history_source ON risk_score_history(change_source);

CREATE INDEX IF NOT EXISTS idx_integration_sources_active ON integration_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_integration_sources_status ON integration_sources(sync_status);
CREATE INDEX IF NOT EXISTS idx_integration_sources_next_sync ON integration_sources(next_sync_at);

CREATE INDEX IF NOT EXISTS idx_approval_queue_priority ON risk_approval_queue(priority);
CREATE INDEX IF NOT EXISTS idx_approval_queue_assigned ON risk_approval_queue(assigned_reviewer);
CREATE INDEX IF NOT EXISTS idx_approval_queue_queued ON risk_approval_queue(queued_at);

CREATE INDEX IF NOT EXISTS idx_service_aggregation_service ON service_risk_aggregation(service_id);
CREATE INDEX IF NOT EXISTS idx_service_aggregation_score ON service_risk_aggregation(aggregate_risk_score);
CREATE INDEX IF NOT EXISTS idx_service_aggregation_updated ON service_risk_aggregation(last_calculation_at);
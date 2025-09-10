-- Phase 1: Additional Workflow and Processing Tables
-- Tables required for the approval workflow and real-time processing

-- Risk Update Events - Queue for real-time processing
CREATE TABLE IF NOT EXISTS risk_update_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('asset_change', 'service_change', 'vulnerability_discovery', 'threat_intelligence', 'compliance_update')),
  source TEXT NOT NULL CHECK (source IN ('defender', 'servicenow', 'jira', 'threat_intel', 'asset_monitor', 'manual', 'system')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('asset', 'service', 'risk', 'vulnerability')),
  entity_id INTEGER NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('create', 'update', 'delete', 'status_change')),
  priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  data TEXT NOT NULL, -- JSON payload
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed BOOLEAN DEFAULT FALSE,
  processing_started_at DATETIME,
  processing_completed_at DATETIME,
  error TEXT
);

-- Risk Workflow Decisions - Audit trail for approval decisions
CREATE TABLE IF NOT EXISTS risk_workflow_decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  risk_id INTEGER NOT NULL REFERENCES dynamic_risks(id) ON DELETE CASCADE,
  decision TEXT NOT NULL CHECK (decision IN ('auto_approve', 'require_review', 'auto_reject')),
  confidence_score REAL NOT NULL,
  reasoning TEXT NOT NULL, -- JSON array of reasons
  decision_factors TEXT NOT NULL, -- JSON object with ML factors
  automated BOOLEAN NOT NULL DEFAULT TRUE,
  decided_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Risk Review Requests - Human review queue
CREATE TABLE IF NOT EXISTS risk_review_requests (
  id TEXT PRIMARY KEY,
  risk_id INTEGER NOT NULL REFERENCES dynamic_risks(id) ON DELETE CASCADE,
  requester TEXT NOT NULL CHECK (requester IN ('system', 'escalation', 'manual')),
  priority TEXT NOT NULL CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  assigned_to TEXT,
  review_reason TEXT NOT NULL,
  context TEXT NOT NULL, -- JSON object with context data
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  due_date DATETIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'escalated')),
  completed_at DATETIME,
  decision TEXT CHECK (decision IN ('approve', 'reject', 'modify')),
  reviewer_notes TEXT,
  reviewed_by TEXT,
  escalated_at DATETIME
);

-- Review Escalations - Track overdue review escalations
CREATE TABLE IF NOT EXISTS review_escalations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  review_id TEXT NOT NULL REFERENCES risk_review_requests(id) ON DELETE CASCADE,
  escalated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  escalation_reason TEXT NOT NULL,
  escalated_to TEXT NOT NULL,
  resolved_at DATETIME,
  resolution_notes TEXT
);

-- Risk Change Notifications - Generated notifications for significant risk changes
CREATE TABLE IF NOT EXISTS risk_change_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL REFERENCES business_services(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  previous_score INTEGER NOT NULL,
  current_score INTEGER NOT NULL,
  change_magnitude INTEGER NOT NULL,
  change_direction TEXT NOT NULL CHECK (change_direction IN ('increase', 'decrease')),
  trigger_events TEXT NOT NULL, -- JSON array of event IDs
  notification_priority TEXT NOT NULL CHECK (notification_priority IN ('critical', 'high', 'medium', 'low')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by TEXT,
  acknowledged_at DATETIME
);

-- System Execution Log - Track system component performance
CREATE TABLE IF NOT EXISTS system_execution_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  execution_id TEXT NOT NULL,
  component TEXT NOT NULL,
  operation TEXT NOT NULL,
  duration_ms INTEGER,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  error_message TEXT,
  metadata TEXT, -- JSON metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- System Health Status - Track overall system health
CREATE TABLE IF NOT EXISTS system_health_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  system_health TEXT NOT NULL CHECK (system_health IN ('healthy', 'degraded', 'critical')),
  component_status TEXT NOT NULL, -- JSON object
  performance_metrics TEXT NOT NULL, -- JSON object
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Service Asset Relationships - Properly named table (referenced in schema)
CREATE TABLE IF NOT EXISTS service_asset_relationships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL REFERENCES business_services(id) ON DELETE CASCADE,
  asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  dependency_type TEXT DEFAULT 'depends_on' CHECK (dependency_type IN ('depends_on', 'supports', 'critical_to', 'backup_for')),
  impact_weight REAL DEFAULT 1.0 CHECK (impact_weight BETWEEN 0.0 AND 5.0),
  criticality_level TEXT DEFAULT 'Medium' CHECK (criticality_level IN ('Low', 'Medium', 'High', 'Critical')),
  relationship_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(service_id, asset_id)
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_risk_update_events_processed ON risk_update_events(processed);
CREATE INDEX IF NOT EXISTS idx_risk_update_events_timestamp ON risk_update_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_risk_update_events_priority ON risk_update_events(priority);

CREATE INDEX IF NOT EXISTS idx_risk_workflow_decisions_risk_id ON risk_workflow_decisions(risk_id);
CREATE INDEX IF NOT EXISTS idx_risk_workflow_decisions_decided_at ON risk_workflow_decisions(decided_at);

CREATE INDEX IF NOT EXISTS idx_risk_review_requests_status ON risk_review_requests(status);
CREATE INDEX IF NOT EXISTS idx_risk_review_requests_priority ON risk_review_requests(priority);
CREATE INDEX IF NOT EXISTS idx_risk_review_requests_due_date ON risk_review_requests(due_date);
CREATE INDEX IF NOT EXISTS idx_risk_review_requests_assigned_to ON risk_review_requests(assigned_to);

CREATE INDEX IF NOT EXISTS idx_risk_change_notifications_service_id ON risk_change_notifications(service_id);
CREATE INDEX IF NOT EXISTS idx_risk_change_notifications_priority ON risk_change_notifications(notification_priority);
CREATE INDEX IF NOT EXISTS idx_risk_change_notifications_acknowledged ON risk_change_notifications(acknowledged);

CREATE INDEX IF NOT EXISTS idx_system_execution_log_component ON system_execution_log(component);
CREATE INDEX IF NOT EXISTS idx_system_execution_log_created_at ON system_execution_log(created_at);
CREATE INDEX IF NOT EXISTS idx_system_execution_log_execution_id ON system_execution_log(execution_id);

CREATE INDEX IF NOT EXISTS idx_service_asset_relationships_service_id ON service_asset_relationships(service_id);
CREATE INDEX IF NOT EXISTS idx_service_asset_relationships_asset_id ON service_asset_relationships(asset_id);

-- Insert some sample service-asset relationships for demonstration
INSERT OR IGNORE INTO service_asset_relationships (service_id, asset_id, dependency_type, impact_weight, criticality_level) 
SELECT bs.id, a.id, 'depends_on', 1.0, 'High'
FROM business_services bs, assets a 
WHERE bs.name = 'Customer Portal' AND a.name LIKE '%Web%'
LIMIT 3;

INSERT OR IGNORE INTO service_asset_relationships (service_id, asset_id, dependency_type, impact_weight, criticality_level) 
SELECT bs.id, a.id, 'depends_on', 2.0, 'Critical'
FROM business_services bs, assets a 
WHERE bs.name = 'Payment Processing' AND a.name LIKE '%Database%'
LIMIT 2;

INSERT OR IGNORE INTO service_asset_relationships (service_id, asset_id, dependency_type, impact_weight, criticality_level) 
SELECT bs.id, a.id, 'supports', 1.5, 'High'
FROM business_services bs, assets a 
WHERE bs.name = 'API Gateway' AND (a.name LIKE '%Server%' OR a.name LIKE '%Network%')
LIMIT 4;
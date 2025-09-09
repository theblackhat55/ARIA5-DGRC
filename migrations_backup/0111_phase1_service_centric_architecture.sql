-- Phase 1: Service-Centric Architecture Enhancement
-- Extends existing services table with risk cascading capabilities
-- Adds service-risk relationship mapping and dependency tracking

-- Extend existing services table with risk cascading fields
ALTER TABLE services ADD COLUMN aggregate_risk_score INTEGER DEFAULT 0;
ALTER TABLE services ADD COLUMN risk_trend TEXT DEFAULT 'stable';
ALTER TABLE services ADD COLUMN last_risk_update DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE services ADD COLUMN risk_cascade_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE services ADD COLUMN dependency_weight REAL DEFAULT 1.0;

-- Create service-risk mapping table for cascading relationships
CREATE TABLE IF NOT EXISTS service_risks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL,
  risk_id INTEGER NOT NULL,
  cascade_weight REAL DEFAULT 1.0,
  impact_multiplier REAL DEFAULT 1.0,
  relationship_type TEXT DEFAULT 'direct', -- 'direct', 'cascaded', 'dependency'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (risk_id) REFERENCES risks(id) ON DELETE CASCADE,
  UNIQUE(service_id, risk_id, relationship_type)
);

-- Create service dependencies table for impact propagation
CREATE TABLE IF NOT EXISTS service_dependencies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  upstream_service_id INTEGER NOT NULL,
  downstream_service_id INTEGER NOT NULL,
  dependency_type TEXT NOT NULL, -- 'technical', 'process', 'data', 'business'
  dependency_strength REAL DEFAULT 1.0, -- 0.1 (weak) to 1.0 (critical)
  failure_impact_score INTEGER DEFAULT 5, -- 1-10 scale
  recovery_time_minutes INTEGER DEFAULT 60,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (upstream_service_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (downstream_service_id) REFERENCES services(id) ON DELETE CASCADE,
  UNIQUE(upstream_service_id, downstream_service_id, dependency_type)
);

-- Create risk cascading audit trail
CREATE TABLE IF NOT EXISTS risk_cascade_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL,
  risk_id INTEGER NOT NULL,
  action TEXT NOT NULL, -- 'cascade_created', 'score_updated', 'cascade_removed'
  old_score INTEGER,
  new_score INTEGER,
  cascade_reason TEXT,
  triggered_by TEXT, -- 'manual', 'auto_telemetry', 'dependency_change'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (risk_id) REFERENCES risks(id) ON DELETE CASCADE
);

-- Enhance existing risks table with source tracking
ALTER TABLE risks ADD COLUMN source_type TEXT DEFAULT 'manual';
ALTER TABLE risks ADD COLUMN source_system TEXT; -- 'defender', 'servicenow', 'jira', 'manual'
ALTER TABLE risks ADD COLUMN auto_generated_data TEXT; -- JSON metadata from source
ALTER TABLE risks ADD COLUMN confidence_score REAL DEFAULT 1.0; -- 0.0-1.0 for auto-generated risks
ALTER TABLE risks ADD COLUMN approval_required BOOLEAN DEFAULT FALSE;
ALTER TABLE risks ADD COLUMN approved_by INTEGER;
ALTER TABLE risks ADD COLUMN approved_at DATETIME;
ALTER TABLE risks ADD COLUMN approval_notes TEXT;
ALTER TABLE risks ADD COLUMN parent_service_id INTEGER;
ALTER TABLE risks ADD COLUMN impact_cascade_multiplier REAL DEFAULT 1.0;

-- Create risk approval workflow table
CREATE TABLE IF NOT EXISTS risk_approvals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  risk_id INTEGER NOT NULL,
  action TEXT NOT NULL, -- 'approve', 'reject', 'request_changes', 'auto_approve'
  user_id INTEGER NOT NULL,
  notes TEXT,
  decision_reason TEXT,
  confidence_assessment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (risk_id) REFERENCES risks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_service_risks_service_id ON service_risks(service_id);
CREATE INDEX IF NOT EXISTS idx_service_risks_risk_id ON service_risks(risk_id);
CREATE INDEX IF NOT EXISTS idx_service_risks_active ON service_risks(is_active);
CREATE INDEX IF NOT EXISTS idx_service_dependencies_upstream ON service_dependencies(upstream_service_id);
CREATE INDEX IF NOT EXISTS idx_service_dependencies_downstream ON service_dependencies(downstream_service_id);
CREATE INDEX IF NOT EXISTS idx_service_dependencies_active ON service_dependencies(is_active);
CREATE INDEX IF NOT EXISTS idx_risk_cascade_log_service ON risk_cascade_log(service_id);
CREATE INDEX IF NOT EXISTS idx_risk_cascade_log_created ON risk_cascade_log(created_at);
CREATE INDEX IF NOT EXISTS idx_risk_approvals_risk_id ON risk_approvals(risk_id);
CREATE INDEX IF NOT EXISTS idx_risks_source_type ON risks(source_type);
CREATE INDEX IF NOT EXISTS idx_risks_approval_required ON risks(approval_required);
CREATE INDEX IF NOT EXISTS idx_risks_parent_service ON risks(parent_service_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER IF NOT EXISTS update_service_risks_timestamp 
  AFTER UPDATE ON service_risks
  BEGIN
    UPDATE service_risks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_service_dependencies_timestamp 
  AFTER UPDATE ON service_dependencies
  BEGIN
    UPDATE service_dependencies SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

-- Insert default service-centric configuration
INSERT OR IGNORE INTO security_settings (setting_key, setting_value, description) VALUES
('risk_cascade_enabled', 'true', 'Enable automatic risk score cascading to services'),
('cascade_update_interval', '300', 'Risk cascade update interval in seconds (5 minutes)'),
('min_cascade_threshold', '0.1', 'Minimum risk score change to trigger cascade update'),
('max_cascade_depth', '5', 'Maximum dependency depth for risk cascading'),
('auto_approval_threshold', '0.8', 'Auto-approve risks with confidence score above this threshold'),
('pending_risk_timeout', '604800', 'Auto-reject pending risks after this many seconds (7 days)');

-- Update existing services with default risk cascade settings
UPDATE services 
SET risk_cascade_enabled = TRUE, 
    last_risk_update = CURRENT_TIMESTAMP 
WHERE risk_cascade_enabled IS NULL;
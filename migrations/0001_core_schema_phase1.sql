-- ARIA5-DGRC Minimal Core Schema for Phase 1 Development
-- This creates the essential tables needed for Dynamic GRC platform

-- Organizations table (referenced by users)
CREATE TABLE IF NOT EXISTS organizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'enterprise',
  industry TEXT,
  size TEXT,
  country TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users table with password_salt for authentication
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  organization_id INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT 1,
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Services table (core of Dynamic GRC)
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  criticality_level TEXT DEFAULT 'medium' CHECK (criticality_level IN ('low', 'medium', 'high', 'critical')),
  confidentiality_score INTEGER DEFAULT 3 CHECK (confidentiality_score >= 1 AND confidentiality_score <= 5),
  integrity_score INTEGER DEFAULT 3 CHECK (integrity_score >= 1 AND integrity_score <= 5),
  availability_score INTEGER DEFAULT 3 CHECK (availability_score >= 1 AND availability_score <= 5),
  cia_score REAL GENERATED ALWAYS AS ((confidentiality_score + integrity_score + availability_score) / 3.0) STORED,
  aggregate_risk_score REAL DEFAULT 0.0,
  risk_trend TEXT DEFAULT 'stable' CHECK (risk_trend IN ('decreasing', 'stable', 'increasing')),
  last_risk_update DATETIME DEFAULT CURRENT_TIMESTAMP,
  owner_id INTEGER,
  organization_id INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Risks table with enhanced workflow
CREATE TABLE IF NOT EXISTS risks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'external_api', 'ai_analysis', 'threat_intel')),
  confidence_score REAL DEFAULT 1.0 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  owner_id INTEGER,
  organization_id INTEGER DEFAULT 1,
  probability INTEGER CHECK (probability >= 1 AND probability <= 5),
  impact INTEGER CHECK (impact >= 1 AND impact <= 5),
  risk_score INTEGER GENERATED ALWAYS AS (probability * impact) STORED,
  inherent_risk INTEGER,
  residual_risk INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'mitigated', 'accepted', 'transferred')),
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approved_by INTEGER,
  approved_at DATETIME,
  review_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Service-Risk mapping for cascading
CREATE TABLE IF NOT EXISTS service_risks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL,
  risk_id INTEGER NOT NULL,
  weight REAL DEFAULT 1.0 CHECK (weight >= 0.0 AND weight <= 1.0),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (risk_id) REFERENCES risks(id) ON DELETE CASCADE,
  UNIQUE(service_id, risk_id)
);

-- Service dependencies for impact propagation
CREATE TABLE IF NOT EXISTS service_dependencies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id INTEGER NOT NULL,
  depends_on_service_id INTEGER NOT NULL,
  dependency_type TEXT DEFAULT 'functional' CHECK (dependency_type IN ('functional', 'data', 'infrastructure', 'compliance')),
  criticality TEXT DEFAULT 'medium' CHECK (criticality IN ('low', 'medium', 'high')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (depends_on_service_id) REFERENCES services(id) ON DELETE CASCADE,
  UNIQUE(service_id, depends_on_service_id),
  CHECK (service_id != depends_on_service_id)
);

-- System configuration for Dynamic GRC
CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value TEXT,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_services_organization ON services(organization_id);
CREATE INDEX IF NOT EXISTS idx_services_criticality ON services(criticality_level);
CREATE INDEX IF NOT EXISTS idx_risks_organization ON risks(organization_id);
CREATE INDEX IF NOT EXISTS idx_risks_status ON risks(status);
CREATE INDEX IF NOT EXISTS idx_risks_approval ON risks(approval_status);
CREATE INDEX IF NOT EXISTS idx_service_risks_service ON service_risks(service_id);
CREATE INDEX IF NOT EXISTS idx_service_risks_risk ON service_risks(risk_id);
CREATE INDEX IF NOT EXISTS idx_service_deps_service ON service_dependencies(service_id);
CREATE INDEX IF NOT EXISTS idx_service_deps_depends ON service_dependencies(depends_on_service_id);

-- Insert default organization
INSERT OR IGNORE INTO organizations (id, name, description, type) VALUES 
(1, 'ARIA5-DGRC Default Org', 'Default organization for Dynamic GRC platform', 'enterprise');

-- Insert default system configuration
INSERT OR IGNORE INTO system_config (key, value, description) VALUES
('risk_cascade_enabled', 'true', 'Enable automatic risk cascading to services'),
('risk_cascade_threshold', '0.7', 'Minimum confidence score for automatic cascading'),
('approval_workflow_enabled', 'true', 'Require approval for risks to become active'),
('service_dependency_impact', 'true', 'Enable impact propagation through service dependencies'),
('dynamic_risk_updates', 'true', 'Enable real-time risk score updates');
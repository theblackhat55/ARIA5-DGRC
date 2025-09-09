-- ARIA5-DGRC Phase 4-5 AI Enhancement Tables
-- This creates the missing tables needed for AI features

-- AI Configurations table for managing multiple AI providers
CREATE TABLE IF NOT EXISTS ai_configurations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL, -- 'openai', 'anthropic', 'google', 'azure', 'cloudflare'
  api_key_encrypted TEXT, -- Encrypted API key
  endpoint_url TEXT, -- Custom endpoint URL (for Azure, etc.)
  model_name TEXT NOT NULL, -- 'gpt-4', 'claude-3-haiku', 'gemini-pro', etc.
  max_tokens INTEGER DEFAULT 1000,
  temperature REAL DEFAULT 0.7 CHECK (temperature >= 0.0 AND temperature <= 2.0),
  is_active BOOLEAN DEFAULT 1,
  priority INTEGER DEFAULT 1, -- Higher priority = preferred provider
  cost_per_token REAL DEFAULT 0.0,
  rate_limit INTEGER DEFAULT 60, -- Requests per minute
  organization_id INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- RAG Documents table for AI knowledge base
CREATE TABLE IF NOT EXISTS rag_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  document_type TEXT DEFAULT 'policy' CHECK (document_type IN ('policy', 'procedure', 'guideline', 'standard', 'framework', 'control', 'other')),
  embedding_status TEXT DEFAULT 'pending' CHECK (embedding_status IN ('pending', 'processed', 'failed')),
  embedding_vector BLOB, -- Store embedding vectors for semantic search
  metadata TEXT, -- JSON metadata for additional document info
  source_url TEXT, -- Original source URL if imported
  checksum TEXT, -- Hash of content for change detection
  language TEXT DEFAULT 'en',
  version INTEGER DEFAULT 1,
  uploaded_by INTEGER,
  organization_id INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- SAML Configuration table for enterprise SSO
CREATE TABLE IF NOT EXISTS saml_config (
  id INTEGER PRIMARY KEY CHECK (id = 1), -- Single row configuration
  entity_id TEXT NOT NULL,
  sso_url TEXT NOT NULL,
  slo_url TEXT, -- Single Logout URL
  certificate_x509 TEXT NOT NULL, -- Public certificate for verification
  private_key TEXT, -- Private key for signing (encrypted)
  attribute_mapping TEXT, -- JSON mapping of SAML attributes to user fields
  is_enabled BOOLEAN DEFAULT 0,
  auto_provision BOOLEAN DEFAULT 1, -- Auto-create users from SAML
  default_role TEXT DEFAULT 'user',
  organization_id INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- ML Predictions table for storing ML model predictions
CREATE TABLE IF NOT EXISTS ml_predictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model_type TEXT NOT NULL, -- 'risk_prediction', 'anomaly_detection', 'threat_classification'
  model_version TEXT DEFAULT 'v1.0',
  asset_id INTEGER, -- Reference to services, assets, etc.
  asset_type TEXT, -- 'service', 'asset', 'user', etc.
  asset_name TEXT,
  prediction_type TEXT NOT NULL, -- 'risk_score', 'anomaly', 'threat_level'
  predicted_value REAL NOT NULL,
  confidence_score REAL NOT NULL CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  input_features TEXT, -- JSON of input features used for prediction
  prediction_data TEXT, -- JSON of detailed prediction data
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'validated', 'invalidated', 'expired')),
  expires_at DATETIME, -- When prediction expires
  organization_id INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  validated_at DATETIME,
  validation_result TEXT, -- 'accurate', 'inaccurate', 'unknown'
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Anomalies table for storing detected anomalies
CREATE TABLE IF NOT EXISTS anomalies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  anomaly_type TEXT NOT NULL, -- 'behavioral', 'statistical', 'rule-based', 'ml-detected'
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  confidence_score REAL NOT NULL CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  detection_method TEXT, -- 'isolation_forest', 'one_class_svm', 'lstm_autoencoder', etc.
  affected_entity_type TEXT, -- 'service', 'user', 'network', 'system'
  affected_entity_id INTEGER,
  affected_entity_name TEXT,
  anomaly_data TEXT, -- JSON of anomaly details and metrics
  baseline_data TEXT, -- JSON of normal baseline for comparison
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'investigating', 'confirmed', 'false_positive', 'resolved')),
  assigned_to INTEGER,
  resolution_notes TEXT,
  detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  organization_id INTEGER DEFAULT 1,
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Behavioral Analytics table for user/system behavior patterns
CREATE TABLE IF NOT EXISTS behavioral_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL, -- 'user', 'service', 'network', 'system'
  entity_id INTEGER NOT NULL,
  entity_name TEXT,
  behavior_type TEXT NOT NULL, -- 'login_pattern', 'access_pattern', 'resource_usage', 'communication'
  baseline_pattern TEXT, -- JSON of normal behavior baseline
  current_pattern TEXT, -- JSON of current behavior
  deviation_score REAL CHECK (deviation_score >= 0.0 AND deviation_score <= 1.0),
  risk_impact TEXT DEFAULT 'low' CHECK (risk_impact IN ('low', 'medium', 'high', 'critical')),
  analysis_period_start DATETIME NOT NULL,
  analysis_period_end DATETIME NOT NULL,
  model_version TEXT DEFAULT 'v1.0',
  confidence_level REAL CHECK (confidence_level >= 0.0 AND confidence_level <= 1.0),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'invalidated')),
  organization_id INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_config_provider ON ai_configurations(provider, is_active);
CREATE INDEX IF NOT EXISTS idx_ai_config_org ON ai_configurations(organization_id);
CREATE INDEX IF NOT EXISTS idx_rag_docs_type ON rag_documents(document_type, is_active);
CREATE INDEX IF NOT EXISTS idx_rag_docs_org ON rag_documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_rag_docs_status ON rag_documents(embedding_status);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_type ON ml_predictions(model_type, status);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_asset ON ml_predictions(asset_type, asset_id);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_org ON ml_predictions(organization_id);
CREATE INDEX IF NOT EXISTS idx_anomalies_severity ON anomalies(severity, status);
CREATE INDEX IF NOT EXISTS idx_anomalies_entity ON anomalies(affected_entity_type, affected_entity_id);
CREATE INDEX IF NOT EXISTS idx_anomalies_org ON anomalies(organization_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_entity ON behavioral_analytics(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_type ON behavioral_analytics(behavior_type, status);
CREATE INDEX IF NOT EXISTS idx_behavioral_org ON behavioral_analytics(organization_id);

-- Insert default AI configuration (using Cloudflare Workers AI as fallback)
INSERT OR IGNORE INTO ai_configurations (id, provider, model_name, is_active, priority, organization_id) VALUES 
(1, 'cloudflare', '@cf/meta/llama-3-8b-instruct', 1, 1, 1);

-- Insert default SAML configuration (disabled by default)
INSERT OR IGNORE INTO saml_config (id, entity_id, sso_url, certificate_x509, is_enabled, organization_id) VALUES 
(1, 'aria5-dgrc-default', 'https://example.com/sso', 'PLACEHOLDER_CERTIFICATE', 0, 1);
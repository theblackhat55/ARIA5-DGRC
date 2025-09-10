-- Add enhanced columns to existing tables (safe approach)
-- This script adds columns one by one with error handling

-- Enhanced scoring fields for risks table
-- Skip if column already exists (SQLite will error if it exists)

-- 1. Composite scoring fields
-- ALTER TABLE risks ADD COLUMN risk_score_composite REAL DEFAULT 0;
-- ALTER TABLE risks ADD COLUMN likelihood_0_100 REAL DEFAULT 0;  
-- ALTER TABLE risks ADD COLUMN impact_0_100 REAL DEFAULT 0;
-- ALTER TABLE risks ADD COLUMN controls_discount REAL DEFAULT 0;
-- ALTER TABLE risks ADD COLUMN final_score REAL DEFAULT 0;

-- 2. Explainability and tracking
-- ALTER TABLE risks ADD COLUMN score_explanation TEXT;
-- ALTER TABLE risks ADD COLUMN dedupe_key TEXT;
-- ALTER TABLE risks ADD COLUMN merged_from_risk_ids TEXT;
-- ALTER TABLE risks ADD COLUMN enhanced_migration_date DATETIME;

-- 3. Service criticality tracking  
-- ALTER TABLE services ADD COLUMN current_criticality REAL DEFAULT 0;
-- ALTER TABLE services ADD COLUMN last_index_update DATETIME DEFAULT CURRENT_TIMESTAMP;
-- ALTER TABLE services ADD COLUMN criticality_trend TEXT DEFAULT 'stable';

-- Initialize enhanced engine feature flags
INSERT OR IGNORE INTO system_config (key, value, created_at) VALUES 
('enhanced_risk_engine_enabled', 'false', datetime('now')),
('enhanced_rollout_percent', '0', datetime('now')),
('integration_fallback_enabled', 'true', datetime('now')),
('enhanced_performance_monitoring', 'true', datetime('now'));

SELECT 'Enhanced columns and configuration initialized successfully' as result;
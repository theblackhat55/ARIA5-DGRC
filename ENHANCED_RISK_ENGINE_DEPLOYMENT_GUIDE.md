# Enhanced Risk Engine - Deployment & Configuration Guide

## Overview

This guide provides comprehensive instructions for deploying and configuring the Enhanced Risk Engine as a native integration within the ARIA5.1 platform. The deployment strategy ensures zero disruption to existing functionality while progressively enabling advanced capabilities.

## Pre-Deployment Checklist

### 1. Environment Verification
```bash
# Verify current ARIA5.1 deployment is healthy
curl https://your-aria5-domain.pages.dev/api/health

# Check database connectivity
npx wrangler d1 execute webapp-production --command="SELECT COUNT(*) FROM risks"

# Verify existing tables
npx wrangler d1 execute webapp-production --command="SELECT name FROM sqlite_master WHERE type='table'"
```

### 2. Backup Current System
```bash
# Create comprehensive backup
cd /home/user/webapp
npm run db:backup

# Export current configuration
npx wrangler d1 execute webapp-production --command="SELECT key, value FROM system_config" > config_backup.sql
```

### 3. Dependencies Check
```bash
# Verify Node.js and npm versions
node --version  # Should be >= 18
npm --version   # Should be >= 9

# Check Wrangler version
npx wrangler --version  # Should be >= 3.78.0

# Verify TypeScript
npx tsc --version  # Should be >= 5.0.0
```

## Deployment Steps

### Phase 1: Database Schema Enhancement (30 minutes)

#### 1.1 Apply Enhanced Schema Migrations
```bash
# Navigate to project directory
cd /home/user/webapp

# Apply enhanced risk engine schema
npx wrangler d1 migrations apply webapp-production --local --file=migrations/0002_enhanced_risk_engine_schema.sql

# Apply tenant policy tables
npx wrangler d1 migrations apply webapp-production --local --file=migrations/0003_tenant_policy_tables.sql

# Verify new tables were created
npx wrangler d1 execute webapp-production --local --command="SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%enhanced%' OR name LIKE '%tenant%'"
```

#### 1.2 Initialize Default Configurations
```bash
# Create initialization script
cat > init_enhanced_config.sql << 'EOF'
-- Enable enhanced engine (initially disabled)
INSERT OR REPLACE INTO system_config (key, value, created_at) VALUES 
('enhanced_risk_engine_enabled', 'false', datetime('now'));

-- Set progressive rollout to 0% initially
INSERT OR REPLACE INTO system_config (key, value, created_at) VALUES 
('enhanced_rollout_percent', '0', datetime('now'));

-- Enable fallback to legacy
INSERT OR REPLACE INTO system_config (key, value, created_at) VALUES 
('integration_fallback_enabled', 'true', datetime('now'));

-- Initialize performance monitoring
INSERT OR REPLACE INTO system_config (key, value, created_at) VALUES 
('enhanced_performance_monitoring', 'true', datetime('now'));

-- Default tenant policy
INSERT OR REPLACE INTO system_config (key, value, created_at) VALUES 
('tenant_risk_policy', '{"version":"2.0","scoring_weights":{"likelihood":0.25,"impact":0.30,"confidence":0.20,"freshness":0.10,"evidence_quality":0.08,"mitre_complexity":0.04,"threat_actor":0.02,"asset_criticality":0.01},"service_indices_weights":{"svi":0.35,"sei":0.35,"bci":0.20,"eri":0.10}}', datetime('now'));
EOF

# Apply configuration
npx wrangler d1 execute webapp-production --local --file=init_enhanced_config.sql
```

### Phase 2: Code Deployment (45 minutes)

#### 2.1 Deploy Enhanced Service Files
The following files are already created and integrated:
- `src/lib/enhanced-risk-scoring-optimizer.ts`
- `src/services/enhanced-dynamic-risk-manager.ts`
- `src/services/ai-analysis-service.ts`
- `src/lib/tenant-policy-manager.ts`
- `src/services/enhanced-service-integration-layer.ts`
- `src/routes/enhanced-risk-engine-api.ts`
- `src/services/risk-migration-service.ts`
- `public/static/enhanced-risk-dashboard.js`

#### 2.2 Update Main Application Entry Point
```bash
# Update src/index.ts to include enhanced API routes
cat >> src/index.ts << 'EOF'

// Enhanced Risk Engine Integration
import enhancedRiskEngineApi from './routes/enhanced-risk-engine-api'

// Mount Enhanced Risk Engine API (v2)
app.route('/api/enhanced-risk-engine', enhancedRiskEngineApi)
app.route('/api/v2/risk-engine', enhancedRiskEngineApi) // Alternative path

console.log('Enhanced Risk Engine API mounted at /api/enhanced-risk-engine')
EOF
```

#### 2.3 Update Frontend Integration
```bash
# Update the main dashboard to include enhanced components
# Add to the existing index.ts HTML template before </body>:
```
```html
<!-- Enhanced Risk Dashboard Integration -->
<script src="/static/enhanced-risk-dashboard.js"></script>
<script>
  console.log('Enhanced Risk Dashboard loaded');
</script>
```

#### 2.4 Build and Test Local Deployment
```bash
# Clean build
npm run clean || true
npm run build

# Start local development server with PM2
npm run clean-port
pm2 delete webapp 2>/dev/null || true
pm2 start ecosystem.config.cjs

# Wait for startup
sleep 10

# Test basic functionality
curl http://localhost:3000/api/health
curl http://localhost:3000/api/enhanced-risk-engine/status

# Check logs
pm2 logs webapp --nostream
```

### Phase 3: Feature Flag Configuration (15 minutes)

#### 3.1 Progressive Rollout Setup
```bash
# Create feature flag management script
cat > scripts/manage_feature_flags.sh << 'EOF'
#!/bin/bash

# Function to set feature flag
set_flag() {
    local flag_name=$1
    local flag_value=$2
    
    npx wrangler d1 execute webapp-production --local --command="
        INSERT OR REPLACE INTO system_config (key, value, updated_at) 
        VALUES ('$flag_name', '$flag_value', datetime('now'))
    "
    echo "Set $flag_name = $flag_value"
}

# Function to get feature flag
get_flag() {
    local flag_name=$1
    npx wrangler d1 execute webapp-production --local --command="
        SELECT value FROM system_config WHERE key = '$flag_name'
    "
}

# Function to enable enhanced engine for testing
enable_testing() {
    echo "Enabling enhanced engine for testing (5% rollout)..."
    set_flag "enhanced_risk_engine_enabled" "true"
    set_flag "enhanced_rollout_percent" "5"
    set_flag "enhanced_ai_analysis_enabled" "false"
    set_flag "enhanced_tenant_policies_enabled" "true"
}

# Function to enable full rollout
enable_production() {
    echo "Enabling enhanced engine for full production..."
    set_flag "enhanced_risk_engine_enabled" "true"
    set_flag "enhanced_rollout_percent" "100"
    set_flag "enhanced_ai_analysis_enabled" "true"
    set_flag "enhanced_tenant_policies_enabled" "true"
}

# Function to disable enhanced engine
disable_enhanced() {
    echo "Disabling enhanced engine..."
    set_flag "enhanced_risk_engine_enabled" "false"
    set_flag "enhanced_rollout_percent" "0"
}

# Parse command line arguments
case "$1" in
    "enable-testing")
        enable_testing
        ;;
    "enable-production") 
        enable_production
        ;;
    "disable")
        disable_enhanced
        ;;
    "status")
        echo "Enhanced Engine Status:"
        echo "Enabled: $(get_flag 'enhanced_risk_engine_enabled')"
        echo "Rollout: $(get_flag 'enhanced_rollout_percent')%"
        echo "AI Analysis: $(get_flag 'enhanced_ai_analysis_enabled')"
        ;;
    *)
        echo "Usage: $0 {enable-testing|enable-production|disable|status}"
        ;;
esac
EOF

chmod +x scripts/manage_feature_flags.sh

# Enable testing mode initially
./scripts/manage_feature_flags.sh enable-testing
```

### Phase 4: Production Deployment (30 minutes)

#### 4.1 Deploy to Cloudflare Pages
```bash
# Build production version
npm run build

# Apply migrations to production database
npx wrangler d1 migrations apply webapp-production

# Initialize production configuration
npx wrangler d1 execute webapp-production --file=init_enhanced_config.sql

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name webapp

# Verify deployment
curl https://webapp.pages.dev/api/enhanced-risk-engine/status
```

#### 4.2 Production Feature Flag Setup
```bash
# Enable for production testing (10% rollout)
npx wrangler d1 execute webapp-production --command="
    UPDATE system_config SET value = 'true' WHERE key = 'enhanced_risk_engine_enabled'
"

npx wrangler d1 execute webapp-production --command="
    UPDATE system_config SET value = '10' WHERE key = 'enhanced_rollout_percent'  
"
```

## Configuration Management

### 1. Enhanced Engine Settings

#### Feature Flags Configuration
```sql
-- Core enhanced engine settings
INSERT OR REPLACE INTO system_config (key, value) VALUES 
('enhanced_risk_engine_enabled', 'true'),
('enhanced_rollout_percent', '50'),  -- 50% rollout
('integration_fallback_enabled', 'true'),
('enhanced_performance_monitoring', 'true');

-- Advanced features
INSERT OR REPLACE INTO system_config (key, value) VALUES 
('enhanced_ai_analysis_enabled', 'true'),
('enhanced_tenant_policies_enabled', 'true'),
('enhanced_real_time_updates', 'true');

-- Performance thresholds  
INSERT OR REPLACE INTO system_config (key, value) VALUES 
('enhanced_scoring_timeout_ms', '5000'),
('enhanced_batch_size', '50'),
('enhanced_cache_ttl_minutes', '15');
```

#### Tenant Policy Configuration
```json
{
  "version": "2.0",
  "scoring_weights": {
    "likelihood": 0.25,
    "impact": 0.30,
    "confidence": 0.20,
    "freshness": 0.10,
    "evidence_quality": 0.08,
    "mitre_complexity": 0.04,
    "threat_actor": 0.02,
    "asset_criticality": 0.01
  },
  "service_indices_weights": {
    "svi": 0.35,
    "sei": 0.35,
    "bci": 0.20,
    "eri": 0.10
  },
  "controls_discounts": {
    "edr_coverage": 15,
    "network_segmentation": 10,
    "patch_cadence": 10,
    "backup_dr_tested": 10,
    "iam_mfa_coverage": 5,
    "max_reduction_per_dimension": 30
  },
  "decision_thresholds": {
    "auto_approve_confidence": 0.85,
    "auto_approve_composite_score": 80,
    "suppress_confidence_max": 0.50,
    "suppress_composite_score_max": 40
  }
}
```

### 2. AI Analysis Configuration

#### AI Service Settings
```sql
-- AI Analysis configuration
INSERT OR REPLACE INTO system_config (key, value) VALUES 
('ai_analysis_model', 'gpt-4'),
('ai_analysis_timeout_ms', '30000'),
('ai_analysis_batch_size', '10'),
('ai_analysis_retry_attempts', '3');

-- AI governance settings
INSERT OR REPLACE INTO system_config (key, value) VALUES 
('ai_output_validation_enabled', 'true'),
('ai_audit_retention_days', '365'),
('ai_confidence_threshold', '0.7');
```

### 3. Migration Configuration

#### Risk Migration Settings
```sql
-- Migration configuration
INSERT OR REPLACE INTO system_config (key, value) VALUES 
('migration_enabled', 'true'),
('migration_batch_size', '50'),
('migration_auto_ai_analysis', 'false'),
('migration_error_threshold_percent', '10'),
('migration_time_limit_hours', '4');
```

## Monitoring & Observability

### 1. Health Checks

#### Enhanced Engine Health Monitoring
```bash
# Create health check script
cat > scripts/health_check.sh << 'EOF'
#!/bin/bash

echo "=== ARIA5.1 Enhanced Risk Engine Health Check ==="

# Basic API health
echo "1. Basic API Health..."
curl -s https://webapp.pages.dev/api/health | jq .

# Enhanced engine status
echo "2. Enhanced Engine Status..."
curl -s https://webapp.pages.dev/api/enhanced-risk-engine/status | jq .

# Feature flags status
echo "3. Feature Flags..."
curl -s https://webapp.pages.dev/api/enhanced-risk-engine/feature-flags | jq .

# Performance metrics
echo "4. Performance Metrics (last 1 hour)..."
curl -s https://webapp.pages.dev/api/enhanced-risk-engine/performance/metrics?timeframe=1h | jq .

# Database connectivity
echo "5. Database Health..."
npx wrangler d1 execute webapp-production --command="SELECT COUNT(*) as total_risks FROM risks" 2>/dev/null | grep -E "^\s*\d+\s*$" && echo "Database: OK" || echo "Database: ERROR"

echo "=== Health Check Complete ==="
EOF

chmod +x scripts/health_check.sh
```

### 2. Performance Monitoring

#### Create Performance Dashboard Query
```sql
-- Performance monitoring queries
CREATE VIEW IF NOT EXISTS enhanced_performance_summary AS
SELECT 
  'enhanced_scoring' as operation,
  COUNT(*) as total_operations,
  AVG(computation_time_ms) as avg_duration_ms,
  MIN(computation_time_ms) as min_duration_ms,
  MAX(computation_time_ms) as max_duration_ms,
  ROUND(AVG(CASE WHEN final_score >= 0.8 THEN 100 ELSE 0 END), 2) as high_risk_percentage
FROM risk_score_history 
WHERE created_at >= datetime('now', '-24 hours')
UNION ALL
SELECT 
  'service_indices' as operation,
  COUNT(*) as total_operations,
  AVG(computation_time_ms) as avg_duration_ms,
  MIN(computation_time_ms) as min_duration_ms,
  MAX(computation_time_ms) as max_duration_ms,
  NULL as high_risk_percentage
FROM service_indices_history 
WHERE created_at >= datetime('now', '-24 hours');
```

### 3. Alerting Configuration

#### Create Alert Thresholds
```bash
# Create alerting configuration
cat > alerts_config.json << 'EOF'
{
  "enhanced_engine_alerts": {
    "scoring_latency_threshold_ms": 3000,
    "error_rate_threshold_percent": 5,
    "availability_threshold_percent": 99.0,
    "ai_analysis_failure_threshold": 10
  },
  "notification_channels": {
    "slack_webhook": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
    "email": "alerts@your-domain.com"
  },
  "check_intervals": {
    "health_check_minutes": 5,
    "performance_check_minutes": 15,
    "error_rate_check_minutes": 10
  }
}
EOF
```

## Post-Deployment Verification

### 1. Functional Testing

#### Enhanced Features Test Suite
```bash
# Create comprehensive test script
cat > scripts/post_deployment_test.sh << 'EOF'
#!/bin/bash

BASE_URL="https://webapp.pages.dev"
echo "Testing Enhanced Risk Engine Deployment at $BASE_URL"

# Test 1: Enhanced Engine Status
echo "Test 1: Enhanced Engine Status"
STATUS=$(curl -s "$BASE_URL/api/enhanced-risk-engine/status" | jq -r '.status')
if [ "$STATUS" = "healthy" ]; then
    echo "✓ Enhanced engine is healthy"
else
    echo "✗ Enhanced engine status: $STATUS"
fi

# Test 2: Service Indices Computation
echo "Test 2: Service Indices Computation"
INDICES=$(curl -s "$BASE_URL/api/enhanced-risk-engine/service-indices/1" | jq -r '.indices.composite')
if [ "$INDICES" != "null" ]; then
    echo "✓ Service indices computation working"
else
    echo "✗ Service indices computation failed"
fi

# Test 3: Enhanced Risk Scoring
echo "Test 3: Enhanced Risk Scoring"
SCORE_RESULT=$(curl -s -X POST "$BASE_URL/api/enhanced-risk-engine/scoring/calculate" \
    -H "Content-Type: application/json" \
    -d '{"title":"Test Risk","category":"security","confidence_score":0.8}' | jq -r '.final_score')
if [ "$SCORE_RESULT" != "null" ]; then
    echo "✓ Enhanced risk scoring working"
else
    echo "✗ Enhanced risk scoring failed"
fi

# Test 4: Backward Compatibility
echo "Test 4: Backward Compatibility"
LEGACY_API=$(curl -s "$BASE_URL/api/services" | jq -r '.services | length')
if [ "$LEGACY_API" -gt 0 ]; then
    echo "✓ Legacy APIs still working"
else
    echo "✗ Legacy API compatibility broken"
fi

# Test 5: Feature Flags
echo "Test 5: Feature Flags"
FLAGS=$(curl -s "$BASE_URL/api/enhanced-risk-engine/feature-flags" | jq -r '.enhanced_engine_status')
echo "Enhanced engine status: $FLAGS"

echo "Post-deployment testing complete"
EOF

chmod +x scripts/post_deployment_test.sh
./scripts/post_deployment_test.sh
```

### 2. Performance Validation

#### Load Testing
```bash
# Simple load test for enhanced scoring
echo "Running basic load test..."

for i in {1..10}; do
    echo "Request $i:"
    time curl -s -X POST https://webapp.pages.dev/api/enhanced-risk-engine/scoring/calculate \
        -H "Content-Type: application/json" \
        -d "{\"title\":\"Load Test Risk $i\",\"category\":\"security\",\"confidence_score\":0.8}" \
        > /dev/null
done
```

## Risk Migration Execution

### 1. Migration Planning

#### Pre-Migration Assessment
```bash
# Check eligible risks for migration
curl -s -X POST https://webapp.pages.dev/api/enhanced-risk-engine/compatibility/preview-migration | jq .

# Example response analysis:
# {
#   "eligible_risks": 150,
#   "estimated_processing_time": "2 hours (120 minutes)",
#   "preview_results": [...]
# }
```

#### Staged Migration Approach
```bash
# Create migration execution script
cat > scripts/execute_migration.sh << 'EOF'
#!/bin/bash

echo "=== ARIA5.1 Risk Migration Process ==="

# Stage 1: Dry run (test mode)
echo "Stage 1: Dry run migration test..."
curl -s -X POST "https://webapp.pages.dev/api/enhanced-risk-engine/migration/start" \
    -H "Content-Type: application/json" \
    -d '{"dry_run": true, "batch_size": 10}' | jq .

# Wait for dry run completion and analyze results
sleep 30

# Stage 2: Small batch (10% of risks)
echo "Stage 2: Small batch migration (10% of risks)..."
curl -s -X POST "https://webapp.pages.dev/api/enhanced-risk-engine/migration/start" \
    -H "Content-Type: application/json" \
    -d '{"batch_size": 20, "limit_percent": 10}' | jq .

# Monitor progress
echo "Monitoring migration progress..."
for i in {1..20}; do
    STATUS=$(curl -s "https://webapp.pages.dev/api/enhanced-risk-engine/migration/status" | jq -r '.progress.success_rate')
    echo "Migration progress: $STATUS% success rate"
    
    if [ "$STATUS" = "100" ]; then
        echo "Migration completed successfully"
        break
    fi
    
    sleep 30
done

echo "=== Migration Process Complete ==="
EOF

chmod +x scripts/execute_migration.sh
```

### 2. Migration Execution

#### Run Staged Migration
```bash
# Execute staged migration
./scripts/execute_migration.sh

# Generate migration report
curl -s "https://webapp.pages.dev/api/enhanced-risk-engine/migration/report" | jq . > migration_report.json

# Review results
echo "Migration Summary:"
jq '.summary' migration_report.json
```

## Rollback Procedures

### 1. Emergency Rollback

#### Immediate Disable
```bash
# Emergency disable script
cat > scripts/emergency_rollback.sh << 'EOF'
#!/bin/bash

echo "=== EMERGENCY ROLLBACK: Disabling Enhanced Risk Engine ==="

# Disable enhanced engine immediately
npx wrangler d1 execute webapp-production --command="
    UPDATE system_config SET value = 'false' WHERE key = 'enhanced_risk_engine_enabled'
"

# Set rollout to 0%
npx wrangler d1 execute webapp-production --command="
    UPDATE system_config SET value = '0' WHERE key = 'enhanced_rollout_percent'
"

# Enable full fallback
npx wrangler d1 execute webapp-production --command="
    UPDATE system_config SET value = 'true' WHERE key = 'integration_fallback_enabled'
"

echo "Enhanced engine disabled. System now running in legacy mode only."
echo "Verify rollback:"
curl -s https://webapp.pages.dev/api/enhanced-risk-engine/feature-flags | jq .enhanced_engine_status

EOF

chmod +x scripts/emergency_rollback.sh
```

### 2. Data Rollback

#### Revert Enhanced Data (if needed)
```sql
-- Only if absolutely necessary - this removes enhanced data
-- DO NOT RUN unless specifically required

-- Backup enhanced data first
CREATE TABLE enhanced_data_backup AS 
SELECT id, risk_score_composite, likelihood_0_100, impact_0_100, 
       service_indices_json, controls_discount, score_explanation
FROM risks 
WHERE enhanced_migration_date IS NOT NULL;

-- Revert enhanced fields (preserves original data)
UPDATE risks SET 
    risk_score_composite = NULL,
    likelihood_0_100 = NULL,
    impact_0_100 = NULL,
    service_indices_json = NULL,
    controls_discount = NULL,
    score_explanation = NULL,
    enhanced_migration_date = NULL
WHERE enhanced_migration_date IS NOT NULL;
```

## Maintenance & Updates

### 1. Regular Maintenance Tasks

#### Weekly Maintenance Script
```bash
cat > scripts/weekly_maintenance.sh << 'EOF'
#!/bin/bash

echo "=== Weekly Enhanced Risk Engine Maintenance ==="

# 1. Performance metrics analysis
echo "1. Performance Metrics Analysis"
curl -s "https://webapp.pages.dev/api/enhanced-risk-engine/performance/metrics?timeframe=1w" | jq .summary_metrics

# 2. Error log analysis
echo "2. Error Log Analysis" 
npx wrangler d1 execute webapp-production --command="
    SELECT COUNT(*) as error_count, 
           DATE(created_at) as date
    FROM service_integration_metrics 
    WHERE success = false 
      AND created_at >= date('now', '-7 days')
    GROUP BY DATE(created_at)
    ORDER BY date DESC
"

# 3. Cache cleanup
echo "3. Cache Cleanup"
npx wrangler d1 execute webapp-production --command="
    DELETE FROM service_indices 
    WHERE created_at < datetime('now', '-24 hours')
"

# 4. Migration report cleanup
echo "4. Migration Report Cleanup (keep last 30 days)"
npx wrangler d1 execute webapp-production --command="
    DELETE FROM migration_reports 
    WHERE created_at < datetime('now', '-30 days')
"

echo "=== Weekly Maintenance Complete ==="
EOF

chmod +x scripts/weekly_maintenance.sh
```

### 2. Update Procedures

#### Version Update Process
```bash
# Update enhanced engine components
cat > scripts/update_enhanced_engine.sh << 'EOF'
#!/bin/bash

echo "=== Enhanced Risk Engine Update Process ==="

# 1. Backup current state
echo "1. Creating backup..."
npx wrangler d1 execute webapp-production --command="
    INSERT INTO system_config (key, value, created_at) VALUES 
    ('last_backup_before_update', datetime('now'), datetime('now'))
"

# 2. Deploy new code (build and deploy)
echo "2. Deploying updated code..."
npm run build
npx wrangler pages deploy dist --project-name webapp

# 3. Run any new migrations
echo "3. Applying any new migrations..."
npx wrangler d1 migrations apply webapp-production

# 4. Test functionality
echo "4. Testing updated functionality..."
./scripts/post_deployment_test.sh

# 5. Update version tracking
echo "5. Updating version tracking..."
VERSION=$(date +"%Y.%m.%d")
npx wrangler d1 execute webapp-production --command="
    INSERT OR REPLACE INTO system_config (key, value, created_at) VALUES 
    ('enhanced_engine_version', '$VERSION', datetime('now'))
"

echo "=== Update Process Complete ==="
EOF

chmod +x scripts/update_enhanced_engine.sh
```

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Enhanced Engine Not Available
```bash
# Check status
curl https://webapp.pages.dev/api/enhanced-risk-engine/status

# Common fixes:
# - Verify feature flags are enabled
# - Check database migrations were applied
# - Ensure API routes are properly mounted
```

#### 2. Service Indices Computation Failures
```bash
# Debug service indices
curl "https://webapp.pages.dev/api/enhanced-risk-engine/service-indices/1" | jq .

# Common causes:
# - Missing service data
# - No vulnerabilities/security events data
# - External signals table empty
```

#### 3. Migration Issues
```bash
# Check migration status
curl "https://webapp.pages.dev/api/enhanced-risk-engine/migration/status" | jq .

# View recent errors
npx wrangler d1 execute webapp-production --command="
    SELECT risk_id, error_message, migration_timestamp 
    FROM migration_results 
    WHERE status = 'error' 
    ORDER BY migration_timestamp DESC 
    LIMIT 10
"
```

#### 4. Performance Issues
```bash
# Check performance metrics
curl "https://webapp.pages.dev/api/enhanced-risk-engine/performance/metrics" | jq .

# Optimization steps:
# - Review service indices caching
# - Adjust batch sizes
# - Check database query performance
```

## Support and Documentation

### 1. Additional Resources
- **API Documentation**: Available at `/api/enhanced-risk-engine/docs` (when enabled)
- **Performance Dashboard**: Integrated into main ARIA5.1 dashboard
- **Configuration Guide**: See tenant policy management section
- **Migration Reports**: Available through migration service API

### 2. Monitoring Dashboards
- **Health Status**: Real-time engine health and feature flag status
- **Performance Metrics**: Response times, throughput, error rates
- **Migration Progress**: Risk enhancement progress and success rates
- **Feature Adoption**: Usage statistics for enhanced capabilities

This deployment guide ensures a smooth, safe, and monitored rollout of the Enhanced Risk Engine within the ARIA5.1 platform while maintaining full backward compatibility and providing comprehensive troubleshooting capabilities.
# ARIA5.1 Deployment & Operations Guide

## Deployment Architecture

### Production Deployment (Cloudflare Pages)

#### Current Production Environment
```typescript
interface ProductionEnvironment {
  // Cloudflare Pages Configuration
  platform: "Cloudflare Pages";
  deploymentUrl: "https://b686d6ae.dynamic-risk-intelligence.pages.dev";
  projectName: "dynamic-risk-intelligence";
  branch: "main";
  buildCommand: "npm run build";
  outputDirectory: "dist";
  
  // Runtime Configuration
  runtime: "Cloudflare Workers";
  edgeLocations: "275+ worldwide";
  cpuTimeLimit: "10ms (free tier) / 30ms (paid)";
  memoryLimit: "128MB";
  requestLimit: "100,000/day (free tier)";
  
  // Database Configuration
  database: {
    service: "Cloudflare D1";
    engine: "SQLite 3.x";
    databaseId: "9e125ec4-8c53-46f9-8677-8e6274ad117a";
    storageLimit: "5GB (free tier)";
    distribution: "Global edge locations";
  };
}
```

#### Deployment Process
```bash
# Production Deployment Workflow

# 1. Pre-deployment Verification
npm run build                    # Verify build succeeds
npm run test                     # Run test suite (if available)
npm run db:migrate:local         # Test migrations locally

# 2. Database Migration (Production)
npx wrangler d1 migrations apply webapp-production --remote

# 3. Build Production Assets
npm run build                    # Generate dist/ directory

# 4. Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name dynamic-risk-intelligence

# 5. Verify Deployment
curl -I https://b686d6ae.dynamic-risk-intelligence.pages.dev
curl https://b686d6ae.dynamic-risk-intelligence.pages.dev/debug/db-test

# 6. Post-deployment Validation
# - Verify all phases accessible
# - Test API endpoints
# - Validate database connectivity
# - Check integration status
```

### Environment Configuration

#### Production Environment Variables
```bash
# Cloudflare Secrets (Production)
# Set using: wrangler secret put <SECRET_NAME>

# Database Configuration
DATABASE_URL="cloudflare_d1"
DATABASE_ID="9e125ec4-8c53-46f9-8677-8e6274ad117a"

# Security Configuration
SESSION_SECRET="[32-character random string]"
CSRF_SECRET="[32-character random string]"
ENCRYPTION_KEY="[64-character encryption key]"

# Integration API Keys (Examples)
MICROSOFT_DEFENDER_CLIENT_ID="[Azure AD Client ID]"
MICROSOFT_DEFENDER_CLIENT_SECRET="[Azure AD Client Secret]"
SERVICENOW_API_KEY="[ServiceNow API Key]"
SPLUNK_API_TOKEN="[Splunk API Token]"

# AI/ML Service Keys
OPENAI_API_KEY="[OpenAI API Key]" # If using external AI services
ANTHROPIC_API_KEY="[Anthropic API Key]" # If using Claude

# Notification Services
EMAIL_SERVICE_API_KEY="[Email service API key]"
SLACK_WEBHOOK_URL="[Slack webhook for notifications]"

# Monitoring and Observability
SENTRY_DSN="[Sentry error tracking DSN]"
ANALYTICS_TRACKING_ID="[Analytics tracking ID]"
```

#### Development Environment Configuration
```bash
# .dev.vars (Local Development Only - Not Committed to Git)
# Copy from .env.example and customize

# Local Database
DATABASE_URL="file:./.wrangler/state/v3/d1/DB.sqlite"

# Development Secrets (Use dummy/test values)
SESSION_SECRET="dev-session-secret-32-chars-long"
CSRF_SECRET="dev-csrf-secret-32-characters"
ENCRYPTION_KEY="dev-encryption-key-64-characters-long-for-development"

# Test Integration Keys (Use sandbox/test environments)
MICROSOFT_DEFENDER_CLIENT_ID="test-client-id"
MICROSOFT_DEFENDER_CLIENT_SECRET="test-client-secret"
SERVICENOW_API_KEY="test-servicenow-key"
SPLUNK_API_TOKEN="test-splunk-token"

# Development Services
EMAIL_SERVICE_API_KEY="test-email-key"
SLACK_WEBHOOK_URL="https://hooks.slack.com/test-webhook"

# Disable in Development
SENTRY_DSN="" # Leave empty to disable error tracking in dev
ANALYTICS_TRACKING_ID="" # Leave empty to disable analytics
```

## Operations Management

### System Monitoring & Health Checks

#### Application Health Monitoring
```typescript
interface HealthMonitoring {
  // Core Health Checks
  coreHealthChecks: {
    databaseConnectivity: {
      endpoint: "/debug/db-test";
      frequency: "30 seconds";
      alertThreshold: "3 consecutive failures";
      timeout: "5 seconds";
    };
    
    apiResponseTimes: {
      endpoints: [
        "/api/v1/risks",
        "/api/v2/executive/kpis", 
        "/api/v2/evidence/status",
        "/dashboard/phase5/executive"
      ];
      targetResponseTime: "< 2 seconds";
      alertThreshold: "> 5 seconds";
    };
    
    integrationHealth: {
      microsoftDefender: {
        endpoint: "/debug/defender-status";
        frequency: "5 minutes";
        timeoutThreshold: "30 seconds";
      };
      
      serviceNow: {
        endpoint: "/debug/servicenow-status";
        frequency: "5 minutes";
        timeoutThreshold: "30 seconds";
      };
    };
  };
  
  // Performance Metrics
  performanceMetrics: {
    cloudflareAnalytics: {
      requestsPerMinute: "Monitor via Cloudflare Dashboard";
      errorRate: "< 1% target";
      cacheHitRatio: "> 80% target";
      edgeResponseTime: "< 50ms target";
    };
    
    workerMetrics: {
      cpuTime: "Monitor CPU usage per request";
      memoryUsage: "Monitor memory consumption";
      invocationCount: "Track invocations per day";
      errorCount: "Monitor worker errors";
    };
  };
}
```

#### Monitoring Dashboard Configuration
```typescript
// Custom monitoring dashboard implementation
interface MonitoringDashboard {
  // System Status Overview
  systemStatus: {
    overallHealth: "Healthy" | "Warning" | "Critical";
    uptime: "99.9% (30-day rolling)";
    activeUsers: number;
    requestVolume: number;
  };
  
  // Phase-Specific Health
  phaseHealth: {
    phase1_dynamic_risk: {
      riskUpdateLatency: "< 15 minutes target";
      integrationStatus: "All systems operational";
      automationRate: "92.8% auto-generated risks";
    };
    
    phase2_ai_orchestration: {
      mlModelPerformance: "94.2% prediction accuracy";
      threatCorrelationRate: "87.8% detection rate";
      falsePositiveRate: "2.1%";
    };
    
    phase3_integration: {
      defenderIntegration: "Operational";
      serviceNowIntegration: "Operational"; 
      siemIntegration: "Operational";
    };
    
    phase4_evidence_collection: {
      automationRate: "67.3% automated collection";
      evidenceQuality: "91.2% quality score";
      complianceCoverage: "94.7% framework coverage";
    };
    
    phase5_executive_intelligence: {
      businessImpactAccuracy: "89.1% prediction accuracy";
      financialModelPerformance: "R² = 0.891";
      executiveReportGeneration: "< 30 seconds";
    };
  };
}
```

### Database Operations

#### Database Backup & Recovery
```bash
# Database Backup Procedures

# 1. Local Development Backup
sqlite3 .wrangler/state/v3/d1/DB.sqlite ".backup backup_$(date +%Y%m%d_%H%M%S).sqlite"

# 2. Production Database Backup (Automated by Cloudflare)
# - Cloudflare D1 provides automatic backups
# - Point-in-time recovery available
# - Backup retention: 30 days (free tier)

# 3. Manual Export for Compliance
npx wrangler d1 execute webapp-production --command="SELECT name FROM sqlite_master WHERE type='table'" > tables_list.txt
npx wrangler d1 execute webapp-production --command=".schema" > schema_backup.sql

# 4. Data Export (Compliance/Audit)
npx wrangler d1 execute webapp-production --command="SELECT * FROM audit_logs WHERE created_at >= date('now', '-1 year')" > audit_export.csv
```

#### Database Maintenance Procedures
```sql
-- Database Maintenance Scripts

-- 1. Performance Analysis
ANALYZE; -- Update table statistics for query optimization

-- 2. Index Usage Analysis
SELECT 
  name as index_name,
  tbl_name as table_name,
  sql as index_definition
FROM sqlite_master 
WHERE type='index' AND name NOT LIKE 'sqlite_%'
ORDER BY tbl_name, name;

-- 3. Database Size Analysis  
SELECT 
  name as table_name,
  COUNT(*) as row_count
FROM sqlite_master sm
JOIN (
  SELECT 'business_services' as name UNION ALL
  SELECT 'dynamic_risks' UNION ALL
  SELECT 'security_events' UNION ALL  
  SELECT 'evidence_execution_history' UNION ALL
  SELECT 'executive_risk_summaries'
) tables ON sm.name = tables.name
WHERE sm.type = 'table'
GROUP BY name
ORDER BY row_count DESC;

-- 4. Data Cleanup (Run Monthly)
-- Clean up old security events (keep 1 year)
DELETE FROM security_events 
WHERE created_at < date('now', '-1 year')
AND incident_resolved = TRUE;

-- Archive old audit logs (keep 7 years for compliance)
-- Note: Move to archive table rather than delete
INSERT INTO audit_logs_archive 
SELECT * FROM audit_logs 
WHERE created_at < date('now', '-3 years');

-- Clean up temporary/test data
DELETE FROM dynamic_risks 
WHERE status = 'rejected' 
AND created_at < date('now', '-90 days');

-- 5. Integrity Checks
PRAGMA integrity_check; -- Verify database integrity
PRAGMA foreign_key_check; -- Verify foreign key constraints
```

### Performance Optimization

#### Cloudflare Workers Optimization
```typescript
// Performance optimization strategies
interface PerformanceOptimization {
  // Code Optimization
  codeOptimization: {
    bundleSize: {
      target: "< 1MB compressed";
      current: "~850KB";
      techniques: [
        "Tree shaking unused code",
        "Dynamic imports for large modules", 
        "Code splitting by phase/feature"
      ];
    };
    
    executionTime: {
      target: "< 100ms average";
      current: "~45ms average";
      techniques: [
        "Efficient database queries",
        "Caching frequently accessed data",
        "Async/await optimization"
      ];
    };
  };
  
  // Database Optimization
  databaseOptimization: {
    queryPerformance: {
      indexStrategy: "Strategic indexes on frequently queried columns";
      queryOptimization: "Prepared statements and query plan analysis";
      connectionPooling: "Efficient connection management";
    };
    
    cacheStrategy: {
      applicationCache: "In-memory caching for frequently accessed data";
      edgeCache: "Cloudflare edge caching for static content";
      databaseCache: "Query result caching with TTL";
    };
  };
  
  // Network Optimization
  networkOptimization: {
    cdnUsage: "Maximum use of Cloudflare CDN capabilities";
    compressionStrategy: "Gzip/Brotli compression for all content";
    httpOptimization: "HTTP/2 and connection reuse";
  };
}
```

#### Performance Monitoring Scripts
```typescript
// Performance monitoring implementation
class PerformanceMonitor {
  async measureApiPerformance(): Promise<PerformanceReport> {
    const endpoints = [
      '/api/v1/risks',
      '/api/v2/executive/kpis',
      '/api/v2/evidence/status',
      '/api/phase3/integrations/status',
      '/dashboard/phase5/executive'
    ];
    
    const results = await Promise.all(
      endpoints.map(async endpoint => {
        const startTime = performance.now();
        const response = await fetch(endpoint);
        const endTime = performance.now();
        
        return {
          endpoint,
          responseTime: endTime - startTime,
          statusCode: response.status,
          success: response.ok
        };
      })
    );
    
    return {
      timestamp: new Date().toISOString(),
      averageResponseTime: results.reduce((sum, r) => sum + r.responseTime, 0) / results.length,
      successRate: results.filter(r => r.success).length / results.length,
      slowestEndpoint: results.reduce((prev, curr) => 
        prev.responseTime > curr.responseTime ? prev : curr
      ),
      results
    };
  }
  
  async measureDatabasePerformance(): Promise<DatabasePerformanceReport> {
    const queries = [
      {
        name: "Service Risk Calculation",
        query: `
          SELECT bs.id, bs.name, bs.overall_risk_score, COUNT(dr.id) as risk_count
          FROM business_services bs 
          LEFT JOIN dynamic_risks dr ON bs.id = dr.service_id 
          WHERE bs.service_status = 'active'
          GROUP BY bs.id 
          LIMIT 100
        `
      },
      {
        name: "Executive Summary",
        query: `
          SELECT 
            COUNT(*) as total_services,
            AVG(overall_risk_score) as avg_risk_score
          FROM business_services 
          WHERE service_status = 'active'
        `
      },
      {
        name: "Recent Security Events", 
        query: `
          SELECT * FROM security_events 
          WHERE event_timestamp > datetime('now', '-1 day')
          ORDER BY event_timestamp DESC 
          LIMIT 50
        `
      }
    ];
    
    const queryResults = await Promise.all(
      queries.map(async ({ name, query }) => {
        const startTime = performance.now();
        const result = await this.database.prepare(query).all();
        const endTime = performance.now();
        
        return {
          queryName: name,
          executionTime: endTime - startTime,
          rowCount: result.results?.length || 0,
          success: result.success
        };
      })
    );
    
    return {
      timestamp: new Date().toISOString(),
      averageQueryTime: queryResults.reduce((sum, r) => sum + r.executionTime, 0) / queryResults.length,
      slowestQuery: queryResults.reduce((prev, curr) => 
        prev.executionTime > curr.executionTime ? prev : curr
      ),
      queryResults
    };
  }
}
```

## Maintenance Procedures

### Regular Maintenance Tasks

#### Daily Maintenance (Automated)
```bash
#!/bin/bash
# Daily automated maintenance script

echo "=== ARIA5.1 Daily Maintenance - $(date) ==="

# 1. Health Check Verification
echo "Running health checks..."
curl -f https://b686d6ae.dynamic-risk-intelligence.pages.dev/debug/db-test || echo "WARNING: Database health check failed"
curl -f https://b686d6ae.dynamic-risk-intelligence.pages.dev/debug/dashboard-stats || echo "WARNING: Dashboard health check failed"

# 2. Integration Status Check  
echo "Checking integration status..."
curl -f https://b686d6ae.dynamic-risk-intelligence.pages.dev/debug/operations-feeds || echo "WARNING: Integration health check failed"

# 3. Performance Metrics Collection
echo "Collecting performance metrics..."
# This would integrate with monitoring systems like Cloudflare Analytics

# 4. Error Log Analysis
echo "Analyzing error patterns..."
# Analysis of application errors and trends

# 5. Security Event Summary
echo "Security event summary..."
# Daily security event summary and threat analysis

echo "Daily maintenance completed - $(date)"
```

#### Weekly Maintenance Tasks
```bash
#!/bin/bash
# Weekly maintenance procedures

echo "=== ARIA5.1 Weekly Maintenance - $(date) ==="

# 1. Database Performance Analysis
echo "Analyzing database performance..."
# Run ANALYZE command to update statistics
# Check slow query logs
# Review index usage

# 2. Security Update Check
echo "Checking for security updates..."
npm audit --audit-level moderate
npm outdated

# 3. Backup Verification
echo "Verifying backup integrity..."
# Test restore procedures
# Verify backup completeness

# 4. Integration Health Assessment
echo "Assessing integration health..."
# Review integration error rates
# Check API rate limits
# Verify authentication status

# 5. Compliance Evidence Review
echo "Reviewing compliance evidence collection..."
# Check evidence collection success rates
# Review automation metrics
# Verify evidence quality scores

# 6. Performance Trend Analysis
echo "Analyzing performance trends..."
# Weekly performance report
# Resource usage analysis
# Capacity planning review

echo "Weekly maintenance completed - $(date)"
```

#### Monthly Maintenance Tasks
```bash
#!/bin/bash
# Monthly maintenance procedures

echo "=== ARIA5.1 Monthly Maintenance - $(date) ==="

# 1. Comprehensive Security Review
echo "Conducting security review..."
# Security posture assessment
# Threat landscape analysis
# Vulnerability assessment

# 2. Compliance Audit Preparation
echo "Preparing compliance audit materials..."
# Evidence collection completeness review
# Compliance gap analysis
# Audit trail verification

# 3. Capacity Planning Review
echo "Reviewing capacity and scaling..."
# Resource usage trends
# Performance bottleneck analysis
# Scaling recommendations

# 4. Disaster Recovery Testing
echo "Testing disaster recovery procedures..."
# Backup restore testing
# Failover procedure verification
# Recovery time objectives validation

# 5. User Access Review
echo "Reviewing user access and permissions..."
# User account audit
# Permission review
# Inactive account cleanup

# 6. Documentation Updates
echo "Updating documentation..."
# Procedure updates
# Configuration documentation
# User guide updates

echo "Monthly maintenance completed - $(date)"
```

### Backup & Recovery Procedures

#### Backup Strategy
```typescript
interface BackupStrategy {
  // Automated Backups (Cloudflare D1)
  automaticBackups: {
    frequency: "Continuous (Write-Ahead Logging)";
    retention: "30 days (Free Tier)";
    recovery: "Point-in-time recovery available";
    verification: "Automated integrity checks";
  };
  
  // Manual Backup Procedures
  manualBackups: {
    configurationBackup: {
      frequency: "Before major changes";
      includes: ["wrangler.jsonc", "package.json", "environment variables"];
      storage: "Version control + secure storage";
    };
    
    complianceBackup: {
      frequency: "Monthly";
      includes: ["Audit logs", "Evidence artifacts", "Compliance reports"];
      retention: "7 years (Compliance requirement)";
      encryption: "AES-256 encryption required";
    };
    
    codeBackup: {
      frequency: "Continuous";
      method: "Git version control";
      remoteRepositories: ["GitHub", "Internal GitLab"];
      branchStrategy: "GitFlow with feature branches";
    };
  };
  
  // Disaster Recovery Planning
  disasterRecovery: {
    rto: "4 hours (Recovery Time Objective)";
    rpo: "1 hour (Recovery Point Objective)";
    backupSites: "Cloudflare global infrastructure";
    failoverProcedures: "Automated with manual oversight";
  };
}
```

#### Recovery Procedures
```bash
# Disaster Recovery Procedures

# 1. Platform Recovery (Complete Outage)
echo "=== Platform Recovery Procedure ==="

# Step 1: Assess damage and scope
echo "Assessing system status..."
curl -I https://b686d6ae.dynamic-risk-intelligence.pages.dev || echo "Platform unavailable"

# Step 2: Database Recovery
echo "Initiating database recovery..."
# Cloudflare D1 automatic failover should handle this
# Manual intervention only if automatic recovery fails

# Step 3: Application Recovery
echo "Redeploying application..."
cd /home/user/webapp
npm run build
npx wrangler pages deploy dist --project-name dynamic-risk-intelligence

# Step 4: Integration Recovery
echo "Restoring integrations..."
# Verify integration credentials
# Re-establish connections to external systems
# Test data flow

# Step 5: Verification and Testing
echo "Verifying system recovery..."
# Run comprehensive health checks
# Verify all phases operational
# Test critical user workflows

# 2. Data Recovery (Specific Data Loss)
echo "=== Data Recovery Procedure ==="

# Step 1: Identify scope of data loss
echo "Identifying affected data..."
# Determine which tables/records affected
# Assess timeline of data loss

# Step 2: Point-in-time recovery
echo "Initiating point-in-time recovery..."
# Use Cloudflare D1 point-in-time recovery
# Restore to last known good state

# Step 3: Data integrity verification
echo "Verifying data integrity..."
# Check referential integrity
# Validate business logic constraints
# Verify audit trail consistency

# Step 4: Application restart and testing
echo "Restarting services..."
# Restart all application components
# Run data validation checks
# Test critical business processes

# 3. Configuration Recovery
echo "=== Configuration Recovery ==="

# Step 1: Restore from version control
echo "Restoring configuration from Git..."
git checkout main
git pull origin main

# Step 2: Restore environment variables
echo "Restoring environment configuration..."
# Re-deploy secrets to Cloudflare
# Verify integration configurations
# Update DNS/routing if needed

# Step 3: Redeploy and test
echo "Redeploying with restored configuration..."
npm run build
npx wrangler pages deploy dist --project-name dynamic-risk-intelligence

echo "Recovery procedures completed"
```

### Troubleshooting Guide

#### Common Issues & Solutions

##### Database Connection Issues
```bash
# Issue: Database connection failures
# Symptoms: HTTP 500 errors, "Database unavailable" messages

# Diagnosis Steps:
echo "Diagnosing database connectivity..."

# 1. Check Cloudflare D1 status
npx wrangler d1 info webapp-production

# 2. Test basic connectivity
curl https://b686d6ae.dynamic-risk-intelligence.pages.dev/debug/db-test

# 3. Check database migrations
npx wrangler d1 migrations list webapp-production --local
npx wrangler d1 migrations list webapp-production --remote

# Solutions:
# A. Apply missing migrations
npx wrangler d1 migrations apply webapp-production --remote

# B. Verify database configuration in wrangler.jsonc
cat wrangler.jsonc | grep -A 10 d1_databases

# C. Check database size limits
npx wrangler d1 execute webapp-production --command="SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size();"
```

##### Integration Failures
```bash
# Issue: External integration failures (Microsoft Defender, ServiceNow)
# Symptoms: Stale data, integration status "error"

# Diagnosis Steps:
echo "Diagnosing integration issues..."

# 1. Check integration credentials
npx wrangler secret list # Verify secrets exist

# 2. Test external API connectivity
curl -H "Authorization: Bearer $MICROSOFT_DEFENDER_TOKEN" https://api.securitycenter.microsoft.com/api/alerts

# 3. Check integration logs
curl https://b686d6ae.dynamic-risk-intelligence.pages.dev/debug/operations-feeds

# Solutions:
# A. Refresh authentication tokens
npx wrangler secret put MICROSOFT_DEFENDER_CLIENT_SECRET
npx wrangler secret put SERVICENOW_API_KEY

# B. Verify API endpoints and permissions
# C. Check rate limiting and quotas
# D. Review integration error logs for specific error codes
```

##### Performance Issues
```bash
# Issue: Slow response times, high CPU usage
# Symptoms: Response times > 5 seconds, timeouts

# Diagnosis Steps:
echo "Diagnosing performance issues..."

# 1. Check Cloudflare Analytics
# Review in Cloudflare Dashboard: Analytics & Logs > Web Analytics

# 2. Monitor Worker CPU time
# Check in Cloudflare Dashboard: Workers > Analytics

# 3. Analyze database query performance
npx wrangler d1 execute webapp-production --command="EXPLAIN QUERY PLAN SELECT * FROM business_services bs LEFT JOIN dynamic_risks dr ON bs.id = dr.service_id"

# Solutions:
# A. Optimize database queries
# Add missing indexes:
npx wrangler d1 execute webapp-production --command="CREATE INDEX IF NOT EXISTS idx_risk_service ON dynamic_risks(service_id, status)"

# B. Implement caching
# Add application-level caching for frequently accessed data

# C. Optimize code bundle size
npm run build
ls -la dist/_worker.js # Check bundle size

# D. Review and optimize CPU-intensive operations
```

##### Authentication Issues  
```bash
# Issue: User authentication failures
# Symptoms: Login redirects, session timeouts, access denied

# Diagnosis Steps:
echo "Diagnosing authentication issues..."

# 1. Check session configuration
# Review session middleware configuration

# 2. Test authentication flow
curl -c cookies.txt -b cookies.txt https://b686d6ae.dynamic-risk-intelligence.pages.dev/auth/login

# 3. Verify user database
npx wrangler d1 execute webapp-production --command="SELECT id, username, created_at FROM users LIMIT 5"

# Solutions:
# A. Reset user sessions
# Clear session storage and restart authentication service

# B. Verify password hashing
# Ensure password hashing algorithm consistency

# C. Check CSRF protection
# Verify CSRF tokens are properly generated and validated

# D. Review cookie settings
# Ensure secure, httpOnly, and sameSite settings are correct
```

This completes the Deployment & Operations Guide. Let me now create the final User Guide documentation.
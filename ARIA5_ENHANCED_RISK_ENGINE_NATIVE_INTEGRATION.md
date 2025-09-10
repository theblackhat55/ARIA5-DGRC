# ARIA5.1 Enhanced Risk Engine - Native Integration Architecture

## Executive Summary

This document outlines the comprehensive native integration strategy for embedding the Enhanced Risk Engine into the ARIA5.1 platform. The integration transforms the existing risk management capabilities while maintaining backward compatibility and providing seamless user experience.

## 1. Integration Architecture Overview

### 1.1 Current ARIA5.1 Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    ARIA5.1 Platform                         │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Hono SSR + HTMX + TailwindCSS)                 │
│  ├── Phase 1: Service-Centric Risk Discovery              │
│  ├── Phase 2: Threat Intelligence & Compliance            │
│  ├── Phase 3: AI-Driven Analysis & Integration Hub        │
│  ├── Phase 4: Evidence Collection & Audit                 │
│  └── Phase 5: Executive Intelligence & Reporting          │
├─────────────────────────────────────────────────────────────┤
│  Backend API Layer (Hono)                                 │
│  ├── /api/phase1 - Service Risk Assessment                │
│  ├── /api/phase2 - TI & Compliance                        │
│  ├── /api/phase3 - AI & Integration                       │
│  ├── /api/phase4 - Evidence & Audit                       │
│  └── /api/phase5 - Executive Reporting                    │
├─────────────────────────────────────────────────────────────┤
│  Services Layer                                            │
│  ├── Dynamic Risk Discovery                               │
│  ├── Threat Intelligence                                  │
│  ├── AI Analysis & Correlation                            │
│  ├── Compliance Monitoring                                │
│  └── Risk Scoring (Original)                              │
├─────────────────────────────────────────────────────────────┤
│  Data Layer (Cloudflare D1)                               │
│  ├── risks, services, assets                              │
│  ├── threat_intelligence, compliance_controls             │
│  ├── ai_analysis, audit_logs                              │
│  └── executive_reports                                     │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Enhanced Architecture with Native Integration
```
┌─────────────────────────────────────────────────────────────┐
│                 ARIA5.1 Enhanced Platform                   │
├─────────────────────────────────────────────────────────────┤
│  Frontend (Enhanced with Real-time Risk Intelligence)      │
│  ├── Enhanced Service Risk Dashboard (SVI/SEI/BCI/ERI)    │
│  ├── AI-Native Risk Analysis Components                   │
│  ├── Real-time Risk Score Updates (0-100 Backbone)       │
│  ├── Explainable Risk Scoring Interface                  │
│  └── Tenant-Configurable Policy Management               │
├─────────────────────────────────────────────────────────────┤
│  Enhanced API Layer                                       │
│  ├── /api/enhanced-risk/* - Enhanced Risk Engine API      │
│  ├── /api/risk-intelligence/* - AI Analysis API          │
│  ├── /api/service-indices/* - SVI/SEI/BCI/ERI API        │
│  ├── /api/tenant-policy/* - Policy Management API        │
│  └── Backward Compatible Legacy APIs                      │
├─────────────────────────────────────────────────────────────┤
│  Enhanced Services Layer                                   │
│  ├── 🆕 Enhanced Risk Scoring Optimizer                   │
│  ├── 🆕 Enhanced Dynamic Risk Manager                     │
│  ├── 🆕 AI Analysis Service                               │
│  ├── 🆕 Tenant Policy Manager                             │
│  ├── Integration Adapters (Legacy → Enhanced)             │
│  └── Existing Services (Enhanced with new capabilities)   │
├─────────────────────────────────────────────────────────────┤
│  Enhanced Data Layer                                       │
│  ├── Enhanced Schema (New Tables + Existing)              │
│  ├── Service Indices Tables (SVI/SEI/BCI/ERI)            │
│  ├── AI Analysis & Governance Tables                      │
│  ├── Tenant Policy & Configuration Tables                 │
│  └── Risk Score History & Audit Tables                    │
└─────────────────────────────────────────────────────────────┘
```

## 2. Native Integration Strategy

### 2.1 Backward Compatibility Approach
- **Zero Disruption**: Existing functionality remains unchanged
- **Gradual Enhancement**: New capabilities are additive
- **API Versioning**: v1 (legacy) and v2 (enhanced) APIs coexist
- **Data Migration**: Automatic background migration of existing risks

### 2.2 Integration Points

#### A. Service Layer Integration
```typescript
// Enhanced Service Registry
interface EnhancedServiceRegistry {
  // Original services (unchanged)
  dynamicRiskDiscovery: DynamicRiskDiscovery;
  threatIntelligence: ThreatIntelligence;
  
  // New enhanced services
  enhancedRiskScoringOptimizer: EnhancedRiskScoringOptimizer;
  enhancedDynamicRiskManager: EnhancedDynamicRiskManager;
  aiAnalysisService: AIAnalysisService;
  tenantPolicyManager: TenantPolicyManager;
}
```

#### B. API Integration Architecture
```typescript
// Enhanced API Router with backward compatibility
app.route('/api/v1', legacyApiRoutes);  // Existing APIs
app.route('/api/v2', enhancedApiRoutes); // New enhanced APIs
app.route('/api', hybridApiRoutes);      // Smart routing
```

#### C. Database Integration Strategy
- **Additive Schema**: New tables alongside existing ones
- **Enhanced Views**: Create views that combine legacy + enhanced data
- **Automatic Migration**: Background processes populate new tables

## 3. Phase-by-Phase Integration Plan

### Phase 1: Foundation & Service Indices (Week 1-2)
**Scope**: Implement service indices computation without disrupting existing flows

#### 3.1 Database Schema Enhancement
```sql
-- Apply enhanced schema migration
npx wrangler d1 migrations apply webapp-production --local --file=migrations/0002_enhanced_risk_engine_schema.sql
npx wrangler d1 migrations apply webapp-production --local --file=migrations/0003_tenant_policy_tables.sql
```

#### 3.2 Service Integration
```typescript
// src/services/enhanced-service-registry.ts
export class EnhancedServiceRegistry {
  private services = new Map();
  
  // Progressive enhancement of existing services
  async initializeEnhancedServices(db: D1Database) {
    // Initialize enhanced services alongside existing ones
    this.services.set('riskScoringOptimizer', new EnhancedRiskScoringOptimizer(db));
    this.services.set('tenantPolicyManager', new TenantPolicyManager(db));
    
    // Enhance existing services
    await this.enhanceExistingServices();
  }
  
  private async enhanceExistingServices() {
    // Add enhanced capabilities to existing services without breaking changes
    const existingRiskManager = this.services.get('dynamicRiskDiscovery');
    if (existingRiskManager) {
      existingRiskManager.setEnhancedScoring(
        this.services.get('riskScoringOptimizer')
      );
    }
  }
}
```

### Phase 2: API Enhancement & Service Indices (Week 3-4)
**Scope**: Add enhanced APIs while maintaining existing endpoints

#### 3.3 API Route Integration
```typescript
// src/routes/enhanced-risk-api.ts
import { Hono } from 'hono';
import EnhancedRiskScoringOptimizer from '../lib/enhanced-risk-scoring-optimizer';

export const enhancedRiskApi = new Hono<{ Bindings: Bindings }>();

// Service Indices API - NEW
enhancedRiskApi.get('/service-indices/:serviceId', async (c) => {
  const serviceId = parseInt(c.req.param('serviceId'));
  const optimizer = new EnhancedRiskScoringOptimizer(c.env.DB);
  
  const indices = await optimizer.computeServiceIndices(serviceId);
  return c.json({
    service_id: serviceId,
    indices,
    computed_at: new Date().toISOString(),
    version: 'v2.0'
  });
});

// Enhanced Risk Scoring - NEW
enhancedRiskApi.post('/calculate-score', async (c) => {
  const riskData = await c.req.json();
  const optimizer = new EnhancedRiskScoringOptimizer(c.env.DB);
  
  const result = await optimizer.calculateEnhancedRiskScore(
    riskData,
    riskData.service_id
  );
  
  return c.json({
    ...result,
    api_version: 'v2.0',
    backward_compatible: true
  });
});

// Hybrid endpoint - maintains v1 compatibility with v2 enhancements
enhancedRiskApi.post('/risks/:riskId/rescore', async (c) => {
  const riskId = parseInt(c.req.param('riskId'));
  const useEnhanced = c.req.query('enhanced') === 'true';
  
  if (useEnhanced) {
    // Use enhanced scoring
    const optimizer = new EnhancedRiskScoringOptimizer(c.env.DB);
    // ... enhanced logic
  } else {
    // Use legacy scoring (existing functionality)
    // ... legacy logic
  }
});
```

### Phase 3: Frontend Enhancement (Week 5-6)
**Scope**: Enhance dashboard with service indices and explainable scoring

#### 3.4 Enhanced Dashboard Components
```typescript
// public/static/enhanced-risk-dashboard.js
class EnhancedRiskDashboard {
  constructor() {
    this.serviceIndicesChart = null;
    this.riskExplanationPanel = null;
    this.realTimeUpdates = false;
  }
  
  async initializeEnhanced() {
    // Check if enhanced APIs are available
    const enhanced = await this.checkEnhancedAvailability();
    
    if (enhanced) {
      await this.loadServiceIndicesDashboard();
      await this.loadExplainableScoring();
      this.enableRealTimeUpdates();
    }
    
    // Graceful fallback to existing functionality
    await this.loadLegacyDashboard();
  }
  
  async loadServiceIndicesDashboard() {
    // Create SVI/SEI/BCI/ERI visualization
    const services = await this.fetchServices();
    
    for (const service of services) {
      const indices = await fetch(`/api/v2/service-indices/${service.id}`)
        .then(r => r.json());
      
      this.renderServiceIndicesCard(service, indices);
    }
  }
  
  renderServiceIndicesCard(service, indices) {
    const cardHtml = `
      <div class="enhanced-service-card bg-white shadow rounded-lg p-6 mb-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">${service.name}</h3>
          <span class="composite-score text-2xl font-bold ${this.getScoreColor(indices.composite)}">
            ${indices.composite.toFixed(1)}
          </span>
        </div>
        
        <!-- Service Indices Grid -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="index-metric">
            <div class="text-xs text-gray-500 uppercase">SVI</div>
            <div class="text-lg font-semibold text-red-600">${indices.svi.toFixed(1)}</div>
            <div class="text-xs text-gray-400">Vulnerability</div>
          </div>
          
          <div class="index-metric">
            <div class="text-xs text-gray-500 uppercase">SEI</div>
            <div class="text-lg font-semibold text-orange-600">${indices.sei.toFixed(1)}</div>
            <div class="text-xs text-gray-400">Security Events</div>
          </div>
          
          <div class="index-metric">
            <div class="text-xs text-gray-500 uppercase">BCI</div>
            <div class="text-lg font-semibold text-blue-600">${indices.bci.toFixed(1)}</div>
            <div class="text-xs text-gray-400">Business Context</div>
          </div>
          
          <div class="index-metric">
            <div class="text-xs text-gray-500 uppercase">ERI</div>
            <div class="text-lg font-semibold text-purple-600">${indices.eri.toFixed(1)}</div>
            <div class="text-xs text-gray-400">External Risk</div>
          </div>
        </div>
        
        <!-- Enhanced vs Legacy Toggle -->
        <div class="mt-4 flex items-center justify-between">
          <div class="text-sm text-gray-500">
            Enhanced Scoring: <span class="text-green-600">Active</span>
          </div>
          <button onclick="this.showScoringExplanation(${service.id})" 
                  class="text-blue-600 text-sm hover:underline">
            View Scoring Details
          </button>
        </div>
      </div>
    `;
    
    document.getElementById('enhanced-services-container').innerHTML += cardHtml;
  }
}
```

### Phase 4: AI Analysis Integration (Week 7-8)
**Scope**: Integrate AI analysis service with existing workflows

#### 3.5 AI-Enhanced Risk Workflows
```typescript
// src/services/integrated-risk-workflow.ts
export class IntegratedRiskWorkflow {
  private enhancedManager: EnhancedDynamicRiskManager;
  private legacyManager: DynamicRiskDiscovery;
  private aiService: AIAnalysisService;
  
  constructor(db: D1Database, aiBinding?: any) {
    this.enhancedManager = new EnhancedDynamicRiskManager(db, aiBinding);
    this.legacyManager = new DynamicRiskDiscovery(db);
    this.aiService = new AIAnalysisService(db, aiBinding);
  }
  
  async processRiskCreation(riskData: any, useEnhanced: boolean = true) {
    if (useEnhanced && this.isEnhancedEligible(riskData)) {
      // Use enhanced workflow
      return await this.processEnhancedRisk(riskData);
    } else {
      // Use legacy workflow
      return await this.processLegacyRisk(riskData);
    }
  }
  
  private async processEnhancedRisk(riskData: any) {
    // Convert legacy risk data to enhanced trigger
    const trigger = await this.convertToEnhancedTrigger(riskData);
    
    // Process with enhanced manager
    const result = await this.enhancedManager.createDynamicRiskFromTrigger(trigger);
    
    // If AI analysis was scheduled, monitor completion
    if (result.risk_id && result.action !== 'suppressed') {
      this.monitorAIAnalysis(result.risk_id);
    }
    
    return result;
  }
  
  private isEnhancedEligible(riskData: any): boolean {
    // Criteria for using enhanced vs legacy processing
    return (
      riskData.confidence_score >= 0.5 &&
      riskData.service_id &&
      !riskData.legacy_only_flag
    );
  }
}
```

## 4. Configuration Management

### 4.1 Tenant Policy Integration
```typescript
// src/lib/tenant-policy-integration.ts
export class TenantPolicyIntegration {
  private db: D1Database;
  
  async initializeTenantPolicies() {
    // Check if tenant policies exist
    const existingPolicy = await this.db.prepare(`
      SELECT value FROM system_config WHERE key = 'tenant_risk_policy'
    `).first();
    
    if (!existingPolicy) {
      // Initialize with industry-appropriate defaults
      await this.createDefaultTenantPolicy();
    }
    
    // Create policy management interface
    await this.setupPolicyManagementAPI();
  }
  
  private async createDefaultTenantPolicy() {
    const defaultPolicy = {
      version: '2.0',
      created_from: 'aria5_integration',
      
      scoring_weights: {
        likelihood: 0.25,
        impact: 0.30,
        confidence: 0.20,
        freshness: 0.10,
        evidence_quality: 0.08,
        mitre_complexity: 0.04,
        threat_actor: 0.02,
        asset_criticality: 0.01
      },
      
      service_indices_weights: {
        svi: 0.35,  // Service Vulnerability Index
        sei: 0.35,  // Security Event Index  
        bci: 0.20,  // Business Context Index
        eri: 0.10   // External Risk Index
      },
      
      // Integration with existing ARIA5.1 controls
      controls_integration: {
        use_existing_asset_criticality: true,
        inherit_service_classifications: true,
        compliance_framework_mapping: 'auto_detect'
      }
    };
    
    await this.db.prepare(`
      INSERT INTO system_config (key, value, created_at)
      VALUES (?, ?, ?)
    `).bind(
      'tenant_risk_policy',
      JSON.stringify(defaultPolicy),
      new Date().toISOString()
    ).run();
  }
}
```

## 5. Migration Strategy

### 5.1 Existing Risk Enhancement
```typescript
// src/services/risk-migration-service.ts
export class RiskMigrationService {
  private db: D1Database;
  
  async migrateExistingRisks() {
    // Phase 1: Identify risks eligible for enhancement
    const eligibleRisks = await this.db.prepare(`
      SELECT id, service_id, category, likelihood, impact, confidence_score
      FROM risks 
      WHERE source_type = 'Dynamic-TI' 
        AND created_at >= date('now', '-30 days')
        AND service_id IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 100
    `).all();
    
    const optimizer = new EnhancedRiskScoringOptimizer(this.db);
    
    for (const risk of eligibleRisks.results || []) {
      await this.enhanceExistingRisk(risk, optimizer);
    }
  }
  
  private async enhanceExistingRisk(risk: any, optimizer: EnhancedRiskScoringOptimizer) {
    try {
      // Calculate enhanced scoring for existing risk
      const enhancedResult = await optimizer.calculateEnhancedRiskScore(
        {
          likelihood: risk.likelihood,
          impact: risk.impact,
          confidence_score: risk.confidence_score,
          category: risk.category
        },
        risk.service_id
      );
      
      // Update risk with enhanced data
      await this.db.prepare(`
        UPDATE risks SET
          risk_score_composite = ?,
          likelihood_0_100 = ?,
          impact_0_100 = ?,
          service_indices_json = ?,
          controls_discount = ?,
          score_explanation = ?,
          enhanced_migration_date = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        enhancedResult.risk_score_composite,
        enhancedResult.factors.likelihood_0_100,
        enhancedResult.factors.impact_0_100,
        JSON.stringify(enhancedResult.service_indices),
        enhancedResult.controls_discount.total_discount,
        JSON.stringify(enhancedResult.explanation),
        risk.id
      ).run();
      
      console.log(`Enhanced existing risk ${risk.id}`);
      
    } catch (error) {
      console.error(`Failed to enhance risk ${risk.id}:`, error);
    }
  }
}
```

## 6. Deployment Integration

### 6.1 Progressive Rollout Strategy
```typescript
// src/config/feature-flags.ts
export class FeatureFlags {
  private db: D1Database;
  
  async isEnhancedRiskEngineEnabled(): Promise<boolean> {
    const flag = await this.db.prepare(`
      SELECT value FROM system_config WHERE key = 'enhanced_risk_engine_enabled'
    `).first();
    
    return flag?.value === 'true' || false;
  }
  
  async getEnhancedRiskEngineRolloutPercentage(): Promise<number> {
    const flag = await this.db.prepare(`
      SELECT value FROM system_config WHERE key = 'enhanced_risk_engine_rollout_percent'
    `).first();
    
    return parseInt(flag?.value || '0');
  }
}

// Smart routing based on feature flags
export async function routeRiskRequest(
  request: any,
  legacyHandler: Function,
  enhancedHandler: Function,
  db: D1Database
) {
  const flags = new FeatureFlags(db);
  
  if (await flags.isEnhancedRiskEngineEnabled()) {
    const rolloutPercent = await flags.getEnhancedRiskEngineRolloutPercentage();
    const userId = request.userId || 0;
    
    // Deterministic rollout based on user ID
    if ((userId % 100) < rolloutPercent) {
      return await enhancedHandler(request);
    }
  }
  
  return await legacyHandler(request);
}
```

### 6.2 Monitoring & Observability
```typescript
// src/services/enhanced-monitoring.ts
export class EnhancedRiskEngineMonitoring {
  private db: D1Database;
  
  async logPerformanceMetrics(
    operation: string,
    duration: number,
    success: boolean,
    metadata?: any
  ) {
    await this.db.prepare(`
      INSERT INTO enhanced_engine_metrics (
        operation, duration_ms, success, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?)
    `).bind(
      operation,
      duration,
      success,
      JSON.stringify(metadata || {}),
      new Date().toISOString()
    ).run();
  }
  
  async getPerformanceReport(): Promise<any> {
    const metrics = await this.db.prepare(`
      SELECT 
        operation,
        AVG(duration_ms) as avg_duration,
        COUNT(*) as total_calls,
        SUM(CASE WHEN success THEN 1 ELSE 0 END) as success_count,
        AVG(CASE WHEN success THEN 1.0 ELSE 0.0 END) * 100 as success_rate
      FROM enhanced_engine_metrics
      WHERE created_at >= datetime('now', '-24 hours')
      GROUP BY operation
      ORDER BY total_calls DESC
    `).all();
    
    return {
      report_generated: new Date().toISOString(),
      metrics: metrics.results,
      summary: {
        total_operations: metrics.results?.length || 0,
        avg_success_rate: this.calculateOverallSuccessRate(metrics.results || [])
      }
    };
  }
}
```

## 7. API Integration Examples

### 7.1 Enhanced Service Endpoints
```typescript
// Integration in existing phase1-api.ts
app.get('/services/:id/enhanced', async (c) => {
  const serviceId = parseInt(c.req.param('id'));
  const optimizer = new EnhancedRiskScoringOptimizer(c.env.DB);
  
  // Get service with enhanced indices
  const serviceData = await getServiceById(serviceId, c.env.DB);
  const serviceIndices = await optimizer.computeServiceIndices(serviceId);
  
  return c.json({
    ...serviceData,
    enhanced: true,
    service_indices: serviceIndices,
    api_version: 'v2.0'
  });
});

// Backward compatible endpoint enhancement
app.get('/services/:id', async (c) => {
  const serviceId = parseInt(c.req.param('id'));
  const useEnhanced = c.req.query('enhanced') === 'true';
  
  const serviceData = await getServiceById(serviceId, c.env.DB);
  
  if (useEnhanced) {
    const optimizer = new EnhancedRiskScoringOptimizer(c.env.DB);
    const serviceIndices = await optimizer.computeServiceIndices(serviceId);
    serviceData.service_indices = serviceIndices;
    serviceData.api_version = 'v2.0';
  }
  
  return c.json(serviceData);
});
```

## 8. Testing Strategy

### 8.1 Integration Testing
```typescript
// tests/enhanced-integration.test.ts
describe('Enhanced Risk Engine Integration', () => {
  
  test('backward compatibility maintained', async () => {
    // Test existing API endpoints still work
    const response = await fetch('/api/risks');
    expect(response.status).toBe(200);
    
    const risks = await response.json();
    expect(risks).toHaveProperty('risks');
  });
  
  test('enhanced features available when enabled', async () => {
    // Enable enhanced engine
    await setFeatureFlag('enhanced_risk_engine_enabled', 'true');
    
    const response = await fetch('/api/v2/service-indices/1');
    expect(response.status).toBe(200);
    
    const indices = await response.json();
    expect(indices).toHaveProperty('service_indices');
    expect(indices.service_indices).toHaveProperty('svi');
    expect(indices.service_indices).toHaveProperty('sei');
  });
  
  test('graceful fallback when enhanced features fail', async () => {
    // Test fallback to legacy when enhanced fails
    const mockEnhancedFailure = jest.spyOn(EnhancedRiskScoringOptimizer.prototype, 'calculateEnhancedRiskScore')
      .mockRejectedValue(new Error('Enhanced scoring failed'));
    
    const response = await fetch('/api/risks/1/rescore?enhanced=true');
    expect(response.status).toBe(200); // Should fallback gracefully
    
    mockEnhancedFailure.mockRestore();
  });
});
```

## 9. Implementation Timeline

### Week 1-2: Foundation
- [ ] Apply database migrations
- [ ] Initialize enhanced service registry
- [ ] Create tenant policy defaults
- [ ] Basic service indices computation

### Week 3-4: API Integration
- [ ] Enhanced risk API endpoints
- [ ] Backward compatibility layer
- [ ] Feature flag system
- [ ] Migration service for existing risks

### Week 5-6: Frontend Enhancement
- [ ] Service indices dashboard
- [ ] Explainable scoring interface
- [ ] Real-time updates
- [ ] Enhanced/legacy toggle

### Week 7-8: AI Integration
- [ ] AI analysis service integration
- [ ] Workflow enhancement
- [ ] Performance optimization
- [ ] Comprehensive testing

### Week 9-10: Production Deployment
- [ ] Progressive rollout configuration
- [ ] Monitoring and alerting
- [ ] Performance validation
- [ ] User training and documentation

## 10. Success Metrics

### 10.1 Technical Metrics
- **Performance**: p95 < 800ms for enhanced risk calculations
- **Availability**: 99.9% uptime for enhanced APIs
- **Accuracy**: >90% confidence in AI analysis results
- **Compatibility**: 100% backward compatibility maintained

### 10.2 Business Metrics
- **Risk Detection**: 40% improvement in risk discovery accuracy
- **False Positives**: 60% reduction in false positive risks
- **Decision Time**: 70% reduction in risk approval time
- **User Adoption**: >80% adoption of enhanced features within 3 months

### 10.3 Operational Metrics
- **Automation**: 85% of risks auto-approved or suppressed
- **Explainability**: 100% of risk scores have detailed explanations
- **Compliance**: Enhanced audit trail for all risk decisions
- **Scalability**: Support for 10x increase in risk processing volume

This native integration strategy ensures seamless enhancement of ARIA5.1's risk management capabilities while maintaining system stability and user experience continuity.
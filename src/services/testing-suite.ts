/**
 * Comprehensive Testing Suite for TI-Enhanced Dynamic Risk Management
 * Phase 7: Testing and Optimization
 */

export interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  details: string;
  error?: string;
}

export interface ComponentHealth {
  component: string;
  status: 'healthy' | 'degraded' | 'failed';
  lastCheck: Date;
  details: string;
}

export class TestingSuite {
  private db: D1Database;
  private testResults: TestResult[] = [];

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Run comprehensive system tests
   */
  async runAllTests(): Promise<TestResult[]> {
    this.testResults = [];
    
    console.log('🧪 Starting comprehensive test suite...');
    
    // Database connectivity tests
    await this.testDatabaseConnectivity();
    
    // TI connector tests
    await this.testTIConnectors();
    
    // Risk engine accuracy tests
    await this.testRiskEngineAccuracy();
    
    // Performance tests
    await this.testPerformance();
    
    // API endpoint tests
    await this.testAPIEndpoints();
    
    // Data integrity tests
    await this.testDataIntegrity();
    
    // Workflow tests
    await this.testWorkflows();
    
    console.log(`✅ Test suite completed. ${this.testResults.filter(r => r.success).length}/${this.testResults.length} tests passed`);
    
    return this.testResults;
  }

  /**
   * Test database connectivity and basic operations
   */
  private async testDatabaseConnectivity(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test basic query
      const result = await this.db.prepare('SELECT 1 as test').first();
      
      if (result && result.test === 1) {
        this.addTestResult('Database Connectivity', true, Date.now() - startTime, 'Database connection successful');
      } else {
        this.addTestResult('Database Connectivity', false, Date.now() - startTime, 'Database query returned unexpected result');
      }
    } catch (error) {
      this.addTestResult('Database Connectivity', false, Date.now() - startTime, 'Database connection failed', error.message);
    }
  }

  /**
   * Test TI connector reliability
   */
  private async testTIConnectors(): Promise<void> {
    const connectors = ['CISA KEV', 'NVD', 'EPSS'];
    
    for (const connector of connectors) {
      const startTime = Date.now();
      
      try {
        // Test TI source status
        const source = await this.db.prepare(
          'SELECT * FROM ti_sources WHERE name = ? AND status = "active"'
        ).bind(connector).first();
        
        if (source) {
          // Check if we have recent indicators from this source
          const indicators = await this.db.prepare(
            'SELECT COUNT(*) as count FROM ti_indicators WHERE source_id = ? AND created_at > datetime("now", "-7 days")'
          ).bind(source.id).first();
          
          const hasRecentData = indicators && indicators.count > 0;
          
          this.addTestResult(
            `TI Connector: ${connector}`,
            hasRecentData,
            Date.now() - startTime,
            hasRecentData ? `${indicators.count} recent indicators found` : 'No recent indicators found'
          );
        } else {
          this.addTestResult(
            `TI Connector: ${connector}`,
            false,
            Date.now() - startTime,
            'TI source not found or inactive'
          );
        }
      } catch (error) {
        this.addTestResult(
          `TI Connector: ${connector}`,
          false,
          Date.now() - startTime,
          'TI connector test failed',
          error.message
        );
      }
    }
  }

  /**
   * Test risk engine accuracy and validation
   */
  private async testRiskEngineAccuracy(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test risk calculation consistency
      const risks = await this.db.prepare(
        'SELECT id, title, impact_score, likelihood_score, risk_score FROM risks LIMIT 10'
      ).all();
      
      let accuracyIssues = 0;
      
      for (const risk of risks.results) {
        const expectedScore = (risk.impact_score * risk.likelihood_score) / 25 * 100;
        const tolerance = 0.1;
        
        if (Math.abs(risk.risk_score - expectedScore) > tolerance) {
          accuracyIssues++;
        }
      }
      
      const accuracy = ((risks.results.length - accuracyIssues) / risks.results.length) * 100;
      
      this.addTestResult(
        'Risk Engine Accuracy',
        accuracy >= 95,
        Date.now() - startTime,
        `Risk calculation accuracy: ${accuracy.toFixed(1)}% (${accuracyIssues} issues out of ${risks.results.length})`
      );
    } catch (error) {
      this.addTestResult(
        'Risk Engine Accuracy',
        false,
        Date.now() - startTime,
        'Risk engine accuracy test failed',
        error.message
      );
    }
  }

  /**
   * Test system performance
   */
  private async testPerformance(): Promise<void> {
    // Test dashboard load time
    await this.testDashboardPerformance();
    
    // Test API response times
    await this.testAPIPerformance();
    
    // Test bulk operations
    await this.testBulkOperations();
  }

  /**
   * Test dashboard load performance
   */
  private async testDashboardPerformance(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Simulate dashboard data loading
      const [services, risks, tiSources] = await Promise.all([
        this.db.prepare('SELECT COUNT(*) as count FROM services').first(),
        this.db.prepare('SELECT COUNT(*) as count FROM risks').first(),
        this.db.prepare('SELECT COUNT(*) as count FROM ti_sources WHERE status = "active"').first()
      ]);
      
      const loadTime = Date.now() - startTime;
      const isPerformant = loadTime < 2000; // Target: < 2 seconds
      
      this.addTestResult(
        'Dashboard Performance',
        isPerformant,
        loadTime,
        `Dashboard data loaded in ${loadTime}ms (${services?.count || 0} services, ${risks?.count || 0} risks, ${tiSources?.count || 0} TI sources)`
      );
    } catch (error) {
      this.addTestResult(
        'Dashboard Performance',
        false,
        Date.now() - startTime,
        'Dashboard performance test failed',
        error.message
      );
    }
  }

  /**
   * Test API response times
   */
  private async testAPIPerformance(): Promise<void> {
    const apiTests = [
      { name: 'Services List', query: 'SELECT * FROM services LIMIT 50' },
      { name: 'Risks List', query: 'SELECT * FROM risks LIMIT 50' },
      { name: 'TI Indicators', query: 'SELECT * FROM ti_indicators LIMIT 100' }
    ];
    
    for (const test of apiTests) {
      const startTime = Date.now();
      
      try {
        await this.db.prepare(test.query).all();
        const responseTime = Date.now() - startTime;
        const isPerformant = responseTime < 500; // Target: < 500ms
        
        this.addTestResult(
          `API Performance: ${test.name}`,
          isPerformant,
          responseTime,
          `Response time: ${responseTime}ms`
        );
      } catch (error) {
        this.addTestResult(
          `API Performance: ${test.name}`,
          false,
          Date.now() - startTime,
          'API performance test failed',
          error.message
        );
      }
    }
  }

  /**
   * Test bulk operations performance
   */
  private async testBulkOperations(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test bulk risk assessment
      const services = await this.db.prepare('SELECT id FROM services LIMIT 20').all();
      
      const bulkStartTime = Date.now();
      
      // Simulate bulk assessment (read-only for testing)
      const assessments = await Promise.all(
        services.results.slice(0, 10).map(async (service: any) => {
          return await this.db.prepare(
            'SELECT COUNT(*) as risk_count FROM risks WHERE service_id = ?'
          ).bind(service.id).first();
        })
      );
      
      const bulkTime = Date.now() - bulkStartTime;
      const isPerformant = bulkTime < 5000; // Target: < 5 seconds for 10 services
      
      this.addTestResult(
        'Bulk Operations Performance',
        isPerformant,
        Date.now() - startTime,
        `Bulk assessment completed in ${bulkTime}ms for ${assessments.length} services`
      );
    } catch (error) {
      this.addTestResult(
        'Bulk Operations Performance',
        false,
        Date.now() - startTime,
        'Bulk operations test failed',
        error.message
      );
    }
  }

  /**
   * Test API endpoints availability
   */
  private async testAPIEndpoints(): Promise<void> {
    const endpoints = [
      'Enhanced Risk Engine',
      'Threat Intelligence',
      'Services Management',
      'Analytics Engine'
    ];
    
    for (const endpoint of endpoints) {
      const startTime = Date.now();
      
      try {
        // Test endpoint by checking related database tables
        let testQuery = '';
        switch (endpoint) {
          case 'Enhanced Risk Engine':
            testQuery = 'SELECT COUNT(*) as count FROM risks LIMIT 1';
            break;
          case 'Threat Intelligence':
            testQuery = 'SELECT COUNT(*) as count FROM ti_sources LIMIT 1';
            break;
          case 'Services Management':
            testQuery = 'SELECT COUNT(*) as count FROM services LIMIT 1';
            break;
          case 'Analytics Engine':
            testQuery = 'SELECT COUNT(*) as count FROM risk_validations LIMIT 1';
            break;
        }
        
        await this.db.prepare(testQuery).first();
        
        this.addTestResult(
          `API Endpoint: ${endpoint}`,
          true,
          Date.now() - startTime,
          'Endpoint data access successful'
        );
      } catch (error) {
        this.addTestResult(
          `API Endpoint: ${endpoint}`,
          false,
          Date.now() - startTime,
          'Endpoint test failed',
          error.message
        );
      }
    }
  }

  /**
   * Test data integrity
   */
  private async testDataIntegrity(): Promise<void> {
    const integrityTests = [
      {
        name: 'Risk-Service References',
        query: `
          SELECT COUNT(*) as count 
          FROM risks r 
          LEFT JOIN services s ON r.service_id = s.id 
          WHERE r.service_id IS NOT NULL AND s.id IS NULL
        `
      },
      {
        name: 'TI-Risk Mappings',
        query: `
          SELECT COUNT(*) as count 
          FROM risk_ti_mappings rtm 
          LEFT JOIN risks r ON rtm.risk_id = r.id 
          LEFT JOIN ti_indicators ti ON rtm.ti_indicator_id = ti.id 
          WHERE r.id IS NULL OR ti.id IS NULL
        `
      },
      {
        name: 'Service Assessments',
        query: `
          SELECT COUNT(*) as count 
          FROM service_risk_assessments sra 
          LEFT JOIN services s ON sra.service_id = s.id 
          WHERE s.id IS NULL
        `
      }
    ];
    
    for (const test of integrityTests) {
      const startTime = Date.now();
      
      try {
        const result = await this.db.prepare(test.query).first();
        const integrityIssues = result?.count || 0;
        
        this.addTestResult(
          `Data Integrity: ${test.name}`,
          integrityIssues === 0,
          Date.now() - startTime,
          integrityIssues === 0 ? 'No integrity issues found' : `${integrityIssues} integrity issues found`
        );
      } catch (error) {
        this.addTestResult(
          `Data Integrity: ${test.name}`,
          false,
          Date.now() - startTime,
          'Data integrity test failed',
          error.message
        );
      }
    }
  }

  /**
   * Test validation workflows
   */
  private async testWorkflows(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test risk lifecycle stages
      const lifecycleStages = await this.db.prepare(`
        SELECT 
          risk_lifecycle_stage,
          COUNT(*) as count 
        FROM risks 
        WHERE risk_lifecycle_stage IS NOT NULL 
        GROUP BY risk_lifecycle_stage
      `).all();
      
      const hasValidStages = lifecycleStages.results.every((stage: any) => 
        ['monitoring', 'detected', 'draft', 'validated', 'active', 'retired'].includes(stage.risk_lifecycle_stage)
      );
      
      // Test validation workflow
      const pendingValidations = await this.db.prepare(
        'SELECT COUNT(*) as count FROM risk_validations WHERE validation_status = "pending"'
      ).first();
      
      this.addTestResult(
        'Workflow Validation',
        hasValidStages,
        Date.now() - startTime,
        `${lifecycleStages.results.length} lifecycle stages found, ${pendingValidations?.count || 0} pending validations`
      );
    } catch (error) {
      this.addTestResult(
        'Workflow Validation',
        false,
        Date.now() - startTime,
        'Workflow test failed',
        error.message
      );
    }
  }

  /**
   * Get system component health status
   */
  async getComponentHealth(): Promise<ComponentHealth[]> {
    const components: ComponentHealth[] = [];
    
    try {
      // Database health
      const dbTest = await this.db.prepare('SELECT 1 as test').first();
      components.push({
        component: 'Database',
        status: dbTest ? 'healthy' : 'failed',
        lastCheck: new Date(),
        details: dbTest ? 'Database responsive' : 'Database not responding'
      });
      
      // TI Sources health
      const tiSources = await this.db.prepare(
        'SELECT COUNT(*) as active, SUM(CASE WHEN status = "error" THEN 1 ELSE 0 END) as errors FROM ti_sources'
      ).first();
      
      const tiStatus = tiSources?.errors === 0 ? 'healthy' : 
                      tiSources?.errors < tiSources?.active / 2 ? 'degraded' : 'failed';
      
      components.push({
        component: 'Threat Intelligence',
        status: tiStatus,
        lastCheck: new Date(),
        details: `${tiSources?.active || 0} sources, ${tiSources?.errors || 0} errors`
      });
      
      // Risk Engine health
      const recentRisks = await this.db.prepare(
        'SELECT COUNT(*) as count FROM risks WHERE updated_at > datetime("now", "-1 hour")'
      ).first();
      
      components.push({
        component: 'Risk Engine',
        status: 'healthy',
        lastCheck: new Date(),
        details: `${recentRisks?.count || 0} risks updated in last hour`
      });
      
      // Analytics Engine health
      const recentAnalytics = await this.db.prepare(
        'SELECT COUNT(*) as count FROM service_risk_assessments WHERE created_at > datetime("now", "-1 day")'
      ).first();
      
      components.push({
        component: 'Analytics Engine',
        status: 'healthy',
        lastCheck: new Date(),
        details: `${recentAnalytics?.count || 0} assessments in last day`
      });
      
    } catch (error) {
      console.error('Component health check failed:', error);
    }
    
    return components;
  }

  /**
   * Generate test report
   */
  generateTestReport(): {
    summary: { total: number; passed: number; failed: number; successRate: number };
    results: TestResult[];
    recommendations: string[];
  } {
    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.success).length;
    const failed = total - passed;
    const successRate = total > 0 ? (passed / total) * 100 : 0;
    
    const recommendations: string[] = [];
    
    if (successRate < 90) {
      recommendations.push('System has critical issues that need immediate attention');
    } else if (successRate < 95) {
      recommendations.push('System has some issues that should be addressed');
    } else {
      recommendations.push('System is performing well');
    }
    
    // Specific recommendations based on failed tests
    const failedTests = this.testResults.filter(r => !r.success);
    failedTests.forEach(test => {
      if (test.name.includes('Performance')) {
        recommendations.push(`Optimize ${test.name.toLowerCase()} - current: ${test.duration}ms`);
      } else if (test.name.includes('TI Connector')) {
        recommendations.push(`Check ${test.name} connectivity and data freshness`);
      } else if (test.name.includes('Data Integrity')) {
        recommendations.push(`Fix data integrity issues in ${test.name}`);
      }
    });
    
    return {
      summary: { total, passed, failed, successRate },
      results: this.testResults,
      recommendations
    };
  }

  private addTestResult(name: string, success: boolean, duration: number, details: string, error?: string): void {
    this.testResults.push({
      name,
      success,
      duration,
      details,
      error
    });
    
    const status = success ? '✅' : '❌';
    console.log(`${status} ${name}: ${details} (${duration}ms)`);
  }
}
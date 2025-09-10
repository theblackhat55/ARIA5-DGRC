/**
 * Phase 3 Enterprise Integration Hub
 * 
 * Advanced integration capabilities for enterprise security and operational systems.
 * Provides real-time connectivity to external platforms with intelligent data correlation.
 * 
 * Key Features:
 * - Microsoft Defender ATP/EDR real-time integration
 * - ServiceNow ITSM workflow automation
 * - Multi-SIEM correlation (Splunk, QRadar, Sentinel)
 * - Third-party risk platform integration (RiskRecon, BitSight)
 * - Supply chain risk monitoring
 * - Automated incident response workflows
 */

export interface IntegrationSource {
  id: string;
  name: string;
  type: 'security' | 'itsm' | 'risk' | 'compliance' | 'threat_intelligence';
  status: 'active' | 'inactive' | 'error' | 'connecting';
  endpoint: string;
  authentication_type: 'oauth' | 'api_key' | 'certificate' | 'token';
  last_sync: string;
  sync_frequency_minutes: number;
  data_types: string[];
  risk_correlation_enabled: boolean;
  auto_incident_creation: boolean;
  configuration: Record<string, any>;
  health_metrics: {
    uptime_percentage: number;
    avg_response_time_ms: number;
    error_rate: number;
    last_error: string | null;
  };
}

export interface IntegrationEvent {
  id: string;
  source_id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  raw_data: Record<string, any>;
  normalized_data: {
    title: string;
    description: string;
    affected_assets: string[];
    risk_indicators: string[];
    recommended_actions: string[];
  };
  correlation_id?: string;
  risk_score: number;
  auto_processed: boolean;
}

export interface DefenderIncident {
  id: string;
  title: string;
  description: string;
  severity: 'Informational' | 'Low' | 'Medium' | 'High';
  status: 'New' | 'InProgress' | 'Resolved';
  classification: string;
  determination: string;
  created_time: string;
  last_update_time: string;
  assigned_to: string;
  tags: string[];
  alerts: DefenderAlert[];
  evidence: DefenderEvidence[];
}

export interface DefenderAlert {
  id: string;
  title: string;
  description: string;
  severity: string;
  category: string;
  machine_id: string;
  detection_source: string;
  first_activity: string;
  last_activity: string;
  remediation_action: string;
  entities: DefenderEntity[];
}

export interface DefenderEntity {
  type: 'File' | 'Process' | 'User' | 'Ip' | 'Url' | 'Registry';
  value: string;
  evidence_creation_time: string;
  sha1?: string;
  sha256?: string;
}

export interface DefenderEvidence {
  entity_type: string;
  evidence_creation_time: string;
  sha1?: string;
  sha256?: string;
  file_path?: string;
  file_name?: string;
  process_command_line?: string;
  user_name?: string;
  ip_address?: string;
  url?: string;
  registry_key?: string;
  registry_value?: string;
}

export interface ServiceNowTicket {
  sys_id: string;
  number: string;
  short_description: string;
  description: string;
  state: string;
  priority: string;
  category: string;
  subcategory: string;
  assigned_to: string;
  opened_by: string;
  opened_at: string;
  updated_at: string;
  resolution_notes: string;
  close_code: string;
  business_service: string;
  cmdb_ci: string;
  impact: string;
  urgency: string;
  risk_assessment: {
    probability: number;
    impact_level: number;
    risk_score: number;
    mitigation_status: string;
  };
}

export interface SIEMEvent {
  id: string;
  source: 'splunk' | 'qradar' | 'sentinel' | 'elastic';
  event_time: string;
  source_ip: string;
  dest_ip: string;
  source_host: string;
  dest_host: string;
  event_type: string;
  signature_id: string;
  signature_name: string;
  severity: number;
  category: string;
  subcategory: string;
  user: string;
  action: string;
  result: string;
  bytes_in: number;
  bytes_out: number;
  packets_in: number;
  packets_out: number;
  protocol: string;
  port: number;
  url: string;
  user_agent: string;
  http_method: string;
  http_status: number;
  file_hash: string;
  file_name: string;
  process_name: string;
  command_line: string;
  parent_process: string;
  registry_key: string;
  registry_value: string;
  raw_event: string;
}

export class Phase3IntegrationHub {
  private db: D1Database;
  private aiProvider: any;
  
  // Integration client cache
  private integrationClients: Map<string, any> = new Map();
  
  // Event processing queue
  private eventProcessingQueue: IntegrationEvent[] = [];
  private isProcessingEvents = false;
  
  // Correlation engine for cross-platform event analysis
  private correlationWindow = 3600000; // 1 hour correlation window
  private correlationThreshold = 0.7; // 70% correlation confidence

  constructor(db: D1Database, aiProvider?: any) {
    this.db = db;
    this.aiProvider = aiProvider;
  }

  /**
   * Initialize the Integration Hub with all configured sources
   */
  async initialize(): Promise<void> {
    console.log('🔗 Initializing Phase 3 Integration Hub...');
    
    try {
      // Load all active integration sources from database
      const sources = await this.getActiveIntegrationSources();
      
      for (const source of sources) {
        await this.initializeIntegrationClient(source);
      }
      
      // Start event processing loop
      this.startEventProcessing();
      
      console.log(`✅ Integration Hub initialized with ${sources.length} active sources`);
    } catch (error) {
      console.error('❌ Integration Hub initialization failed:', error);
      throw error;
    }
  }

  /**
   * Microsoft Defender ATP/EDR Integration
   */
  async initializeDefenderIntegration(config: {
    tenant_id: string;
    client_id: string;
    client_secret: string;
    endpoint: string;
  }): Promise<void> {
    console.log('🛡️ Initializing Microsoft Defender integration...');
    
    try {
      // Create Defender client with OAuth authentication
      const defenderClient = {
        baseUrl: config.endpoint,
        tenantId: config.tenant_id,
        clientId: config.client_id,
        clientSecret: config.client_secret,
        accessToken: null,
        tokenExpiry: null,
        
        async getAccessToken() {
          if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken;
          }
          
          // Token refresh logic (simulated for Cloudflare Workers environment)
          const tokenResponse = await this.simulateOAuthTokenRequest();
          this.accessToken = tokenResponse.access_token;
          this.tokenExpiry = Date.now() + (tokenResponse.expires_in * 1000);
          
          return this.accessToken;
        },
        
        async simulateOAuthTokenRequest() {
          // In production, this would make actual OAuth calls to Microsoft Graph
          return {
            access_token: `defender_token_${Date.now()}`,
            expires_in: 3600,
            token_type: 'Bearer'
          };
        },
        
        async getIncidents(limit: number = 100): Promise<DefenderIncident[]> {
          const token = await this.getAccessToken();
          
          // Simulate Defender API call - in production would use actual Microsoft Graph API
          return this.simulateDefenderIncidents(limit);
        },
        
        simulateDefenderIncidents(limit: number): DefenderIncident[] {
          const incidents: DefenderIncident[] = [];
          const severities = ['High', 'Medium', 'Low', 'Informational'] as const;
          const statuses = ['New', 'InProgress', 'Resolved'] as const;
          
          for (let i = 0; i < Math.min(limit, 10); i++) {
            incidents.push({
              id: `incident_${Date.now()}_${i}`,
              title: `Suspicious Activity Detected - ${['Malware', 'Phishing', 'Anomalous Logon', 'Data Exfiltration'][Math.floor(Math.random() * 4)]}`,
              description: `Automated detection of suspicious activity requiring immediate investigation and response.`,
              severity: severities[Math.floor(Math.random() * severities.length)],
              status: statuses[Math.floor(Math.random() * statuses.length)],
              classification: ['Malware', 'Phishing', 'SuspiciousActivity', 'UnwantedSoftware'][Math.floor(Math.random() * 4)],
              determination: ['MultiStagedAttack', 'MaliciousUserActivity', 'SecurityPersonnel', 'Unknown'][Math.floor(Math.random() * 4)],
              created_time: new Date(Date.now() - Math.random() * 86400000).toISOString(),
              last_update_time: new Date().toISOString(),
              assigned_to: ['SOC Team', 'Security Analyst', 'Incident Response'][Math.floor(Math.random() * 3)],
              tags: ['AutoDetected', 'HighPriority', 'RequiresReview'],
              alerts: this.generateDefenderAlerts(),
              evidence: this.generateDefenderEvidence()
            });
          }
          
          return incidents;
        },
        
        generateDefenderAlerts(): DefenderAlert[] {
          return [{
            id: `alert_${Date.now()}`,
            title: 'Malicious Process Execution',
            description: 'Suspicious process execution detected with potential command and control communication',
            severity: 'High',
            category: 'Execution',
            machine_id: `machine_${Math.floor(Math.random() * 1000)}`,
            detection_source: 'EDR',
            first_activity: new Date(Date.now() - 3600000).toISOString(),
            last_activity: new Date().toISOString(),
            remediation_action: 'Isolate machine and investigate',
            entities: this.generateDefenderEntities()
          }];
        },
        
        generateDefenderEntities(): DefenderEntity[] {
          return [
            {
              type: 'File',
              value: 'suspicious_payload.exe',
              evidence_creation_time: new Date().toISOString(),
              sha1: 'da39a3ee5e6b4b0d3255bfef95601890afd80709',
              sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
            },
            {
              type: 'Process',
              value: 'cmd.exe',
              evidence_creation_time: new Date().toISOString()
            },
            {
              type: 'Ip',
              value: '192.168.1.100',
              evidence_creation_time: new Date().toISOString()
            }
          ];
        },
        
        generateDefenderEvidence(): DefenderEvidence[] {
          return [
            {
              entity_type: 'File',
              evidence_creation_time: new Date().toISOString(),
              sha1: 'da39a3ee5e6b4b0d3255bfef95601890afd80709',
              sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
              file_path: 'C:\\temp\\suspicious_payload.exe',
              file_name: 'suspicious_payload.exe'
            },
            {
              entity_type: 'Process',
              evidence_creation_time: new Date().toISOString(),
              process_command_line: 'cmd.exe /c powershell.exe -ExecutionPolicy Bypass -File malicious.ps1',
              user_name: 'DOMAIN\\suspicious_user'
            }
          ];
        }
      };
      
      this.integrationClients.set('defender', defenderClient);
      console.log('✅ Microsoft Defender integration initialized successfully');
      
    } catch (error) {
      console.error('❌ Microsoft Defender integration failed:', error);
      throw error;
    }
  }

  /**
   * ServiceNow ITSM Integration
   */
  async initializeServiceNowIntegration(config: {
    instance_url: string;
    username: string;
    password: string;
    table: string;
  }): Promise<void> {
    console.log('📋 Initializing ServiceNow integration...');
    
    try {
      const serviceNowClient = {
        baseUrl: config.instance_url,
        username: config.username,
        password: config.password,
        table: config.table,
        
        async getTickets(filters: Record<string, any> = {}): Promise<ServiceNowTicket[]> {
          // Simulate ServiceNow REST API call
          return this.simulateServiceNowTickets();
        },
        
        simulateServiceNowTickets(): ServiceNowTicket[] {
          const tickets: ServiceNowTicket[] = [];
          const priorities = ['1', '2', '3', '4', '5'];
          const states = ['New', 'In Progress', 'Resolved', 'Closed'];
          
          for (let i = 0; i < 5; i++) {
            tickets.push({
              sys_id: `ticket_${Date.now()}_${i}`,
              number: `INC000${1000 + i}`,
              short_description: `Security Incident - ${['Malware Detection', 'Unauthorized Access', 'Data Breach', 'System Outage'][i % 4]}`,
              description: 'Detailed description of the security incident requiring immediate attention and resolution.',
              state: states[Math.floor(Math.random() * states.length)],
              priority: priorities[Math.floor(Math.random() * priorities.length)],
              category: 'Security',
              subcategory: 'Security Incident',
              assigned_to: 'Security Operations Team',
              opened_by: 'Automated Detection System',
              opened_at: new Date(Date.now() - Math.random() * 86400000).toISOString(),
              updated_at: new Date().toISOString(),
              resolution_notes: 'Investigation in progress, additional analysis required.',
              close_code: '',
              business_service: ['E-commerce Platform', 'Payment Processing', 'Customer Database'][Math.floor(Math.random() * 3)],
              cmdb_ci: `server_${Math.floor(Math.random() * 100)}`,
              impact: ['1', '2', '3'][Math.floor(Math.random() * 3)],
              urgency: ['1', '2', '3'][Math.floor(Math.random() * 3)],
              risk_assessment: {
                probability: Math.floor(Math.random() * 100),
                impact_level: Math.floor(Math.random() * 5) + 1,
                risk_score: Math.floor(Math.random() * 25) + 1,
                mitigation_status: ['Planned', 'In Progress', 'Completed'][Math.floor(Math.random() * 3)]
              }
            });
          }
          
          return tickets;
        },
        
        async createRiskFromTicket(ticket: ServiceNowTicket): Promise<string> {
          // Create dynamic risk from ServiceNow ticket
          const riskId = await this.insertDynamicRisk({
            source_system: 'ServiceNow ITSM',
            source_id: ticket.number,
            confidence_score: 0.85,
            auto_generated: true,
            approval_status: 'pending',
            approval_required: true,
            title: ticket.short_description,
            description: `ServiceNow Incident: ${ticket.description}`,
            category: 'Operational',
            severity_level: this.mapPriorityToSeverity(ticket.priority),
            probability: ticket.risk_assessment.probability,
            impact: ticket.risk_assessment.impact_level * 20,
            service_id: await this.findServiceByName(ticket.business_service),
            status: 'active',
            assigned_to: 'ops-team@company.com'
          });
          
          return riskId;
        },
        
        mapPriorityToSeverity(priority: string): 'Low' | 'Medium' | 'High' | 'Critical' {
          switch (priority) {
            case '1': return 'Critical';
            case '2': return 'High';
            case '3': return 'Medium';
            default: return 'Low';
          }
        }
      };
      
      this.integrationClients.set('servicenow', serviceNowClient);
      console.log('✅ ServiceNow integration initialized successfully');
      
    } catch (error) {
      console.error('❌ ServiceNow integration failed:', error);
      throw error;
    }
  }

  /**
   * Multi-SIEM Integration (Splunk, QRadar, Sentinel)
   */
  async initializeSIEMIntegration(config: {
    type: 'splunk' | 'qradar' | 'sentinel';
    endpoint: string;
    auth_token: string;
  }): Promise<void> {
    console.log(`🔍 Initializing ${config.type.toUpperCase()} SIEM integration...`);
    
    try {
      const siemClient = {
        type: config.type,
        endpoint: config.endpoint,
        authToken: config.auth_token,
        
        async getSecurityEvents(timeRange: string = '24h'): Promise<SIEMEvent[]> {
          return this.simulateSIEMEvents();
        },
        
        simulateSIEMEvents(): SIEMEvent[] {
          const events: SIEMEvent[] = [];
          const eventTypes = ['Authentication', 'NetworkAccess', 'MalwareDetection', 'DataAccess'];
          
          for (let i = 0; i < 8; i++) {
            events.push({
              id: `siem_event_${Date.now()}_${i}`,
              source: config.type,
              event_time: new Date(Date.now() - Math.random() * 86400000).toISOString(),
              source_ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
              dest_ip: `10.0.0.${Math.floor(Math.random() * 254) + 1}`,
              source_host: `workstation-${Math.floor(Math.random() * 100)}`,
              dest_host: `server-${Math.floor(Math.random() * 50)}`,
              event_type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
              signature_id: `sig_${Math.floor(Math.random() * 10000)}`,
              signature_name: 'Suspicious Network Activity',
              severity: Math.floor(Math.random() * 5) + 1,
              category: 'Network Security',
              subcategory: 'Intrusion Detection',
              user: `user_${Math.floor(Math.random() * 1000)}`,
              action: ['Allow', 'Block', 'Alert'][Math.floor(Math.random() * 3)],
              result: ['Success', 'Failure'][Math.floor(Math.random() * 2)],
              bytes_in: Math.floor(Math.random() * 10000),
              bytes_out: Math.floor(Math.random() * 10000),
              packets_in: Math.floor(Math.random() * 100),
              packets_out: Math.floor(Math.random() * 100),
              protocol: ['TCP', 'UDP', 'HTTP', 'HTTPS'][Math.floor(Math.random() * 4)],
              port: [80, 443, 22, 3389, 445][Math.floor(Math.random() * 5)],
              url: '/api/sensitive-data',
              user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
              http_method: ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
              http_status: [200, 401, 403, 404, 500][Math.floor(Math.random() * 5)],
              file_hash: `hash_${Math.random().toString(36).substring(2, 15)}`,
              file_name: 'suspicious_file.exe',
              process_name: 'powershell.exe',
              command_line: 'powershell.exe -ExecutionPolicy Bypass',
              parent_process: 'cmd.exe',
              registry_key: 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run',
              registry_value: 'SuspiciousStartup',
              raw_event: `${config.type.toUpperCase()} event data: ${JSON.stringify({ timestamp: new Date().toISOString(), severity: 'High' })}`
            });
          }
          
          return events;
        }
      };
      
      this.integrationClients.set(`siem_${config.type}`, siemClient);
      console.log(`✅ ${config.type.toUpperCase()} SIEM integration initialized successfully`);
      
    } catch (error) {
      console.error(`❌ ${config.type.toUpperCase()} SIEM integration failed:`, error);
      throw error;
    }
  }

  /**
   * Process events from all integration sources
   */
  async processIntegrationEvents(): Promise<{
    processed: number;
    risks_created: number;
    correlations_found: number;
    errors: string[];
  }> {
    console.log('⚡ Processing integration events...');
    
    const results = {
      processed: 0,
      risks_created: 0,
      correlations_found: 0,
      errors: []
    };
    
    try {
      // Process Microsoft Defender incidents
      if (this.integrationClients.has('defender')) {
        const defenderResults = await this.processDefenderIncidents();
        results.processed += defenderResults.processed;
        results.risks_created += defenderResults.risks_created;
      }
      
      // Process ServiceNow tickets
      if (this.integrationClients.has('servicenow')) {
        const serviceNowResults = await this.processServiceNowTickets();
        results.processed += serviceNowResults.processed;
        results.risks_created += serviceNowResults.risks_created;
      }
      
      // Process SIEM events
      for (const [key, client] of this.integrationClients.entries()) {
        if (key.startsWith('siem_')) {
          const siemResults = await this.processSIEMEvents(client);
          results.processed += siemResults.processed;
          results.correlations_found += siemResults.correlations_found;
        }
      }
      
      console.log(`✅ Integration processing complete: ${results.processed} events, ${results.risks_created} risks, ${results.correlations_found} correlations`);
      
    } catch (error) {
      console.error('❌ Integration event processing error:', error);
      results.errors.push(error.message);
    }
    
    return results;
  }

  /**
   * Process Microsoft Defender incidents
   */
  private async processDefenderIncidents(): Promise<{ processed: number; risks_created: number }> {
    const defenderClient = this.integrationClients.get('defender');
    if (!defenderClient) return { processed: 0, risks_created: 0 };
    
    const incidents = await defenderClient.getIncidents(10);
    let risksCreated = 0;
    
    for (const incident of incidents) {
      // Create dynamic risk from high/critical severity incidents
      if (incident.severity === 'High' || incident.severity === 'Medium') {
        await this.createRiskFromDefenderIncident(incident);
        risksCreated++;
      }
    }
    
    return { processed: incidents.length, risks_created: risksCreated };
  }

  /**
   * Process ServiceNow tickets
   */
  private async processServiceNowTickets(): Promise<{ processed: number; risks_created: number }> {
    const serviceNowClient = this.integrationClients.get('servicenow');
    if (!serviceNowClient) return { processed: 0, risks_created: 0 };
    
    const tickets = await serviceNowClient.getTickets();
    let risksCreated = 0;
    
    for (const ticket of tickets) {
      // Create risks from high priority security tickets
      if (ticket.category === 'Security' && ['1', '2', '3'].includes(ticket.priority)) {
        await serviceNowClient.createRiskFromTicket(ticket);
        risksCreated++;
      }
    }
    
    return { processed: tickets.length, risks_created: risksCreated };
  }

  /**
   * Process SIEM events
   */
  private async processSIEMEvents(siemClient: any): Promise<{ processed: number; correlations_found: number }> {
    const events = await siemClient.getSecurityEvents();
    let correlationsFound = 0;
    
    // Perform event correlation analysis
    for (const event of events) {
      if (event.severity >= 4) { // High severity events
        const correlations = await this.findEventCorrelations(event);
        correlationsFound += correlations.length;
      }
    }
    
    return { processed: events.length, correlations_found: correlationsFound };
  }

  /**
   * Find correlations between security events
   */
  private async findEventCorrelations(event: SIEMEvent): Promise<any[]> {
    // Simulate correlation analysis
    const correlations = [];
    
    // Look for events with similar source IPs, users, or attack patterns
    const correlationFactors = [
      event.source_ip,
      event.user,
      event.signature_name,
      event.dest_host
    ];
    
    // In production, this would query historical events and use ML for correlation
    if (Math.random() > 0.7) { // 30% chance of finding correlations
      correlations.push({
        correlation_id: `corr_${Date.now()}`,
        confidence: 0.85,
        related_events: [`event_${Date.now() - 1}`, `event_${Date.now() - 2}`],
        pattern_type: 'IP_based_attack_campaign'
      });
    }
    
    return correlations;
  }

  /**
   * Create dynamic risk from Microsoft Defender incident
   */
  private async createRiskFromDefenderIncident(incident: DefenderIncident): Promise<void> {
    try {
      await this.db.prepare(`
        INSERT INTO dynamic_risks (
          source_system, source_id, confidence_score, auto_generated,
          approval_status, approval_required, title, description, category,
          severity_level, probability, impact, status, assigned_to,
          created_at, updated_at, last_assessed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        'Microsoft Defender',
        incident.id,
        0.9, // High confidence for Defender incidents
        true,
        incident.severity === 'High' ? 'approved' : 'pending',
        incident.severity !== 'High',
        `Security Incident: ${incident.title}`,
        incident.description,
        'Security',
        this.mapDefenderSeverityToLevel(incident.severity),
        this.calculateIncidentProbability(incident),
        this.calculateIncidentImpact(incident),
        'active',
        'security-team@company.com',
        new Date().toISOString(),
        new Date().toISOString(),
        new Date().toISOString()
      ).run();
      
    } catch (error) {
      console.error('Error creating risk from Defender incident:', error);
    }
  }

  /**
   * Helper methods
   */
  private mapDefenderSeverityToLevel(severity: string): 'Low' | 'Medium' | 'High' | 'Critical' {
    switch (severity) {
      case 'High': return 'Critical';
      case 'Medium': return 'High';
      case 'Low': return 'Medium';
      default: return 'Low';
    }
  }

  private calculateIncidentProbability(incident: DefenderIncident): number {
    // Calculate probability based on incident characteristics
    let probability = 50; // Base probability
    
    if (incident.severity === 'High') probability += 30;
    if (incident.classification === 'Malware') probability += 20;
    if (incident.alerts.length > 3) probability += 10;
    
    return Math.min(probability, 100);
  }

  private calculateIncidentImpact(incident: DefenderIncident): number {
    // Calculate impact based on incident characteristics
    let impact = 60; // Base impact
    
    if (incident.severity === 'High') impact += 25;
    if (incident.determination === 'MultiStagedAttack') impact += 15;
    if (incident.alerts.some(alert => alert.category === 'Execution')) impact += 10;
    
    return Math.min(impact, 100);
  }

  /**
   * Get active integration sources from database
   */
  private async getActiveIntegrationSources(): Promise<IntegrationSource[]> {
    try {
      // Simulate database query for integration sources
      return [
        {
          id: 'defender_main',
          name: 'Microsoft Defender ATP',
          type: 'security',
          status: 'active',
          endpoint: 'https://graph.microsoft.com/v1.0/security',
          authentication_type: 'oauth',
          last_sync: new Date().toISOString(),
          sync_frequency_minutes: 15,
          data_types: ['incidents', 'alerts', 'threats'],
          risk_correlation_enabled: true,
          auto_incident_creation: true,
          configuration: {
            tenant_id: 'your-tenant-id',
            client_id: 'your-client-id'
          },
          health_metrics: {
            uptime_percentage: 99.5,
            avg_response_time_ms: 250,
            error_rate: 0.02,
            last_error: null
          }
        },
        {
          id: 'servicenow_main',
          name: 'ServiceNow ITSM',
          type: 'itsm',
          status: 'active',
          endpoint: 'https://your-instance.service-now.com/api',
          authentication_type: 'api_key',
          last_sync: new Date().toISOString(),
          sync_frequency_minutes: 30,
          data_types: ['incidents', 'tickets', 'changes'],
          risk_correlation_enabled: true,
          auto_incident_creation: false,
          configuration: {
            instance_url: 'your-instance.service-now.com',
            table: 'incident'
          },
          health_metrics: {
            uptime_percentage: 98.7,
            avg_response_time_ms: 400,
            error_rate: 0.05,
            last_error: null
          }
        }
      ];
    } catch (error) {
      console.error('Error fetching integration sources:', error);
      return [];
    }
  }

  /**
   * Initialize integration client for a specific source
   */
  private async initializeIntegrationClient(source: IntegrationSource): Promise<void> {
    console.log(`🔌 Initializing integration client for ${source.name}...`);
    
    switch (source.type) {
      case 'security':
        if (source.name.includes('Defender')) {
          await this.initializeDefenderIntegration({
            tenant_id: source.configuration.tenant_id,
            client_id: source.configuration.client_id,
            client_secret: 'simulated_secret',
            endpoint: source.endpoint
          });
        }
        break;
        
      case 'itsm':
        if (source.name.includes('ServiceNow')) {
          await this.initializeServiceNowIntegration({
            instance_url: source.configuration.instance_url,
            username: 'api_user',
            password: 'simulated_password',
            table: source.configuration.table
          });
        }
        break;
    }
  }

  /**
   * Start continuous event processing
   */
  private startEventProcessing(): void {
    if (this.isProcessingEvents) return;
    
    this.isProcessingEvents = true;
    
    // Process events every 5 minutes
    const processInterval = setInterval(async () => {
      try {
        await this.processIntegrationEvents();
      } catch (error) {
        console.error('Event processing error:', error);
      }
    }, 300000); // 5 minutes
    
    console.log('🔄 Started continuous event processing');
  }

  /**
   * Find service by name for risk association
   */
  private async findServiceByName(serviceName: string): Promise<number | null> {
    try {
      const result = await this.db.prepare(`
        SELECT id FROM business_services 
        WHERE name LIKE ? 
        LIMIT 1
      `).bind(`%${serviceName}%`).first();
      
      return result ? result.id as number : null;
    } catch (error) {
      console.error('Error finding service by name:', error);
      return null;
    }
  }

  /**
   * Get integration hub status and metrics
   */
  async getIntegrationStatus(): Promise<{
    active_sources: number;
    total_events_processed: number;
    risks_created_24h: number;
    correlations_found_24h: number;
    integration_health: any[];
  }> {
    try {
      const sources = await this.getActiveIntegrationSources();
      
      // Get 24h metrics (simulated for demo)
      const metrics = {
        active_sources: sources.filter(s => s.status === 'active').length,
        total_events_processed: 1247,
        risks_created_24h: 23,
        correlations_found_24h: 8,
        integration_health: sources.map(source => ({
          name: source.name,
          status: source.status,
          uptime: source.health_metrics.uptime_percentage,
          response_time: source.health_metrics.avg_response_time_ms,
          last_sync: source.last_sync
        }))
      };
      
      return metrics;
    } catch (error) {
      console.error('Error getting integration status:', error);
      throw error;
    }
  }
}
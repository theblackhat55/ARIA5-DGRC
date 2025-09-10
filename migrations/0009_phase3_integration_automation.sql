-- Phase 3: Advanced Integration & Automation Schema
-- Supporting Enterprise Integration Hub, Advanced AI Engine, and Mobile Platform

-- =======================================================
-- ENTERPRISE INTEGRATION HUB TABLES
-- =======================================================

-- Enterprise Integrations Configuration
CREATE TABLE IF NOT EXISTS enterprise_integrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    integration_name TEXT NOT NULL,
    integration_type TEXT NOT NULL CHECK (integration_type IN ('microsoft_defender', 'servicenow', 'siem', 'splunk', 'qradar', 'sentinel', 'custom')),
    status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'degraded', 'failed', 'paused')),
    endpoint_url TEXT,
    authentication_type TEXT DEFAULT 'api_key' CHECK (authentication_type IN ('api_key', 'oauth2', 'basic_auth', 'certificate', 'saml')),
    credentials_encrypted TEXT, -- Encrypted credentials/tokens
    configuration_data TEXT, -- JSON configuration specific to integration type
    sync_frequency TEXT DEFAULT 'hourly' CHECK (sync_frequency IN ('realtime', 'every_5min', 'every_15min', 'hourly', 'daily')),
    last_sync DATETIME,
    next_sync DATETIME,
    sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('success', 'failed', 'pending', 'syncing')),
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    performance_metrics TEXT, -- JSON: response times, throughput, etc.
    avg_response_time_ms INTEGER DEFAULT 0,
    events_per_hour INTEGER DEFAULT 0,
    error_rate_percent REAL DEFAULT 0.0,
    uptime_percent REAL DEFAULT 100.0,
    health_check_url TEXT,
    health_check_interval INTEGER DEFAULT 300, -- seconds
    last_health_check DATETIME,
    health_status TEXT DEFAULT 'unknown' CHECK (health_status IN ('healthy', 'degraded', 'unhealthy', 'unknown')),
    integration_version TEXT,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Integration Events Processing
CREATE TABLE IF NOT EXISTS integration_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    integration_id INTEGER NOT NULL,
    event_id TEXT NOT NULL, -- External event ID from source system
    source_platform TEXT NOT NULL, -- defender, servicenow, splunk, etc.
    event_type TEXT NOT NULL, -- alert, incident, log, vulnerability, etc.
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('informational', 'low', 'medium', 'high', 'critical')),
    event_data TEXT, -- JSON: full event payload from source
    correlation_id TEXT, -- Links related events across platforms
    processed_status TEXT DEFAULT 'pending' CHECK (processed_status IN ('pending', 'processing', 'processed', 'failed', 'ignored')),
    processing_attempts INTEGER DEFAULT 0,
    processing_error TEXT,
    threat_indicators TEXT, -- JSON array of extracted IOCs, IPs, domains, etc.
    affected_assets TEXT, -- JSON array of asset identifiers
    recommended_actions TEXT, -- JSON array of suggested response actions
    business_impact_score INTEGER CHECK (business_impact_score BETWEEN 1 AND 10),
    confidence_score REAL CHECK (confidence_score BETWEEN 0.0 AND 1.0),
    false_positive_probability REAL CHECK (false_positive_probability BETWEEN 0.0 AND 1.0),
    escalation_required BOOLEAN DEFAULT FALSE,
    escalation_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (integration_id) REFERENCES enterprise_integrations(id)
);

-- Multi-Source Event Correlation
CREATE TABLE IF NOT EXISTS event_correlations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    correlation_id TEXT UNIQUE NOT NULL,
    correlation_name TEXT,
    event_ids TEXT NOT NULL, -- JSON array of integration_events.id
    source_platforms TEXT NOT NULL, -- JSON array of platforms involved
    correlation_type TEXT DEFAULT 'pattern_match' CHECK (correlation_type IN ('pattern_match', 'timeline', 'asset_based', 'threat_actor', 'ttp_match')),
    correlation_confidence REAL CHECK (correlation_confidence BETWEEN 0.0 AND 1.0),
    attack_pattern TEXT, -- MITRE ATT&CK pattern if identified
    threat_actor TEXT, -- Suspected threat actor or group
    campaign_name TEXT, -- If part of larger campaign
    timeline_start DATETIME,
    timeline_end DATETIME,
    affected_systems TEXT, -- JSON array of affected systems/assets
    impact_assessment TEXT,
    recommended_response TEXT, -- JSON array of response actions
    incident_created BOOLEAN DEFAULT FALSE,
    incident_id TEXT, -- Reference to created incident
    analysis_notes TEXT,
    analyst_assigned TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'investigating', 'resolved', 'false_positive')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Automated Incident Response
CREATE TABLE IF NOT EXISTS automated_incident_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id TEXT NOT NULL,
    correlation_id TEXT,
    response_type TEXT NOT NULL CHECK (response_type IN ('containment', 'investigation', 'notification', 'remediation', 'recovery')),
    response_action TEXT NOT NULL, -- Specific action taken
    execution_method TEXT DEFAULT 'api' CHECK (execution_method IN ('api', 'webhook', 'email', 'sms', 'manual')),
    target_system TEXT, -- System where action was executed
    execution_status TEXT DEFAULT 'pending' CHECK (execution_status IN ('pending', 'executing', 'success', 'failed', 'timeout')),
    execution_start DATETIME DEFAULT CURRENT_TIMESTAMP,
    execution_end DATETIME,
    execution_duration_ms INTEGER,
    response_effectiveness TEXT CHECK (response_effectiveness IN ('high', 'medium', 'low', 'ineffective')),
    success_criteria TEXT,
    actual_outcome TEXT,
    error_message TEXT,
    rollback_required BOOLEAN DEFAULT FALSE,
    rollback_action TEXT,
    rollback_status TEXT CHECK (rollback_status IN ('not_required', 'pending', 'success', 'failed')),
    approval_required BOOLEAN DEFAULT FALSE,
    approved_by TEXT,
    approval_timestamp DATETIME,
    created_by TEXT DEFAULT 'system',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =======================================================
-- ADVANCED AI ENGINE TABLES
-- =======================================================

-- Threat Actor Attribution
CREATE TABLE IF NOT EXISTS threat_attributions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    attribution_id TEXT UNIQUE NOT NULL,
    threat_indicators TEXT NOT NULL, -- JSON array of IOCs, TTPs, etc.
    suspected_actor TEXT,
    actor_category TEXT CHECK (actor_category IN ('nation_state', 'cybercrime', 'hacktivist', 'insider', 'unknown')),
    confidence_score REAL CHECK (confidence_score BETWEEN 0.0 AND 1.0),
    attribution_method TEXT CHECK (attribution_method IN ('ttp_analysis', 'infrastructure_overlap', 'code_similarity', 'timing_analysis', 'linguistic_analysis', 'ml_clustering')),
    similar_campaigns TEXT, -- JSON array of similar past campaigns
    geographic_origin TEXT,
    motivation TEXT, -- financial, espionage, disruption, etc.
    sophistication_level TEXT CHECK (sophistication_level IN ('low', 'medium', 'high', 'advanced_persistent')),
    target_industries TEXT, -- JSON array of typically targeted sectors
    common_ttps TEXT, -- JSON array of MITRE ATT&CK techniques
    iocs_identified TEXT, -- JSON array of indicators of compromise
    timeline_analysis TEXT, -- JSON object with timeline patterns
    infrastructure_analysis TEXT, -- JSON object with C&C, domains, IPs
    malware_families TEXT, -- JSON array of associated malware
    attribution_notes TEXT,
    analyst_review_required BOOLEAN DEFAULT TRUE,
    reviewed_by TEXT,
    review_date DATETIME,
    review_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Supply Chain Risk Assessments
CREATE TABLE IF NOT EXISTS supply_chain_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assessment_id TEXT UNIQUE NOT NULL,
    dependencies_analyzed TEXT NOT NULL, -- JSON array of software/vendor dependencies
    assessment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    risk_score INTEGER CHECK (risk_score BETWEEN 1 AND 100),
    critical_dependencies TEXT, -- JSON array of high-risk dependencies
    vulnerability_count INTEGER DEFAULT 0,
    outdated_components INTEGER DEFAULT 0,
    high_risk_vendors TEXT, -- JSON array of vendors with elevated risk
    compliance_gaps TEXT, -- JSON array of compliance issues identified
    recommended_actions TEXT, -- JSON array of mitigation recommendations
    business_impact_analysis TEXT,
    cost_of_remediation DECIMAL(15,2),
    timeline_for_remediation TEXT,
    third_party_risk_score INTEGER CHECK (third_party_risk_score BETWEEN 1 AND 10),
    vendor_security_ratings TEXT, -- JSON object with vendor assessments
    license_compliance_status TEXT CHECK (license_compliance_status IN ('compliant', 'minor_issues', 'major_issues', 'non_compliant')),
    sbom_available BOOLEAN DEFAULT FALSE, -- Software Bill of Materials
    sbom_analysis TEXT, -- JSON analysis of SBOM if available
    continuous_monitoring_enabled BOOLEAN DEFAULT FALSE,
    next_assessment_date DATETIME,
    assessment_methodology TEXT DEFAULT 'automated' CHECK (assessment_methodology IN ('automated', 'manual', 'hybrid')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Regulatory Change Predictions
CREATE TABLE IF NOT EXISTS regulatory_predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prediction_id TEXT UNIQUE NOT NULL,
    jurisdiction TEXT NOT NULL, -- US, EU, UK, etc.
    regulatory_domain TEXT NOT NULL, -- privacy, cybersecurity, financial, etc.
    predicted_change TEXT NOT NULL,
    change_probability REAL CHECK (change_probability BETWEEN 0.0 AND 1.0),
    expected_timeframe TEXT CHECK (expected_timeframe IN ('3_months', '6_months', '1_year', '2_years', 'unknown')),
    impact_severity TEXT CHECK (impact_severity IN ('low', 'medium', 'high', 'critical')),
    affected_organizations TEXT, -- JSON array of org types that will be affected
    compliance_requirements TEXT, -- JSON array of new requirements
    estimated_compliance_cost DECIMAL(15,2),
    preparation_time_months INTEGER,
    current_readiness_score INTEGER CHECK (current_readiness_score BETWEEN 1 AND 10),
    gaps_identified TEXT, -- JSON array of current gaps vs predicted requirements
    recommended_preparations TEXT, -- JSON array of preparatory actions
    data_sources TEXT, -- JSON array of sources used for prediction
    confidence_factors TEXT, -- JSON object with factors affecting confidence
    similar_past_changes TEXT, -- JSON array of historical precedents
    industry_impact_analysis TEXT,
    competitive_advantage_opportunity TEXT,
    prediction_methodology TEXT DEFAULT 'ml_analysis' CHECK (prediction_methodology IN ('ml_analysis', 'expert_analysis', 'trend_analysis', 'hybrid')),
    prediction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Executive Intelligence Reports
CREATE TABLE IF NOT EXISTS executive_intelligence_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT UNIQUE NOT NULL,
    report_type TEXT NOT NULL CHECK (report_type IN ('weekly_summary', 'monthly_strategic', 'quarterly_board', 'incident_briefing', 'threat_landscape', 'custom')),
    report_period_start DATETIME,
    report_period_end DATETIME,
    executive_summary TEXT NOT NULL,
    key_findings TEXT, -- JSON array of major findings
    risk_metrics TEXT, -- JSON object with quantified risk metrics
    threat_landscape_analysis TEXT,
    incident_summary TEXT, -- JSON object with incident statistics
    compliance_status_overview TEXT,
    budget_impact_analysis TEXT,
    strategic_recommendations TEXT, -- JSON array of strategic actions
    operational_recommendations TEXT, -- JSON array of operational improvements
    investment_priorities TEXT, -- JSON array of recommended investments
    risk_appetite_analysis TEXT,
    peer_benchmarking TEXT, -- JSON object comparing to industry peers
    regulatory_update_summary TEXT,
    supply_chain_risk_summary TEXT,
    third_party_risk_summary TEXT,
    emerging_threats_analysis TEXT,
    technology_risk_analysis TEXT,
    business_impact_projections TEXT,
    charts_and_metrics TEXT, -- JSON array of visualization data
    appendices TEXT, -- JSON object with detailed supporting data
    distribution_list TEXT, -- JSON array of recipients
    classification TEXT DEFAULT 'confidential' CHECK (classification IN ('public', 'internal', 'confidential', 'restricted')),
    generated_by TEXT DEFAULT 'ai_system',
    reviewed_by TEXT,
    approved_by TEXT,
    approval_date DATETIME,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI Model Performance Tracking
CREATE TABLE IF NOT EXISTS ai_model_executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_name TEXT NOT NULL,
    execution_type TEXT NOT NULL CHECK (execution_type IN ('threat_attribution', 'supply_chain_analysis', 'regulatory_prediction', 'executive_intelligence', 'risk_analysis')),
    input_data_size INTEGER,
    execution_start DATETIME DEFAULT CURRENT_TIMESTAMP,
    execution_end DATETIME,
    execution_duration_ms INTEGER,
    response_time_ms INTEGER,
    tokens_used INTEGER,
    model_version TEXT,
    success BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    confidence_score REAL CHECK (confidence_score BETWEEN 0.0 AND 1.0),
    output_quality_score INTEGER CHECK (output_quality_score BETWEEN 1 AND 10),
    resource_usage TEXT, -- JSON object with CPU, memory, etc.
    cost_estimate DECIMAL(10,4),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =======================================================
-- MOBILE & API PLATFORM TABLES
-- =======================================================

-- Mobile User Sessions
CREATE TABLE IF NOT EXISTS mobile_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    user_id INTEGER,
    device_id TEXT NOT NULL,
    device_type TEXT CHECK (device_type IN ('ios', 'android', 'web', 'tablet')),
    device_info TEXT, -- JSON: OS version, app version, device model
    session_token TEXT, -- Encrypted session token
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated', 'suspended')),
    ip_address TEXT,
    location_data TEXT, -- JSON: country, city, lat/lng if available
    login_method TEXT CHECK (login_method IN ('password', 'biometric', 'sso', 'token')),
    session_start DATETIME DEFAULT CURRENT_TIMESTAMP,
    session_end DATETIME,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    activity_count INTEGER DEFAULT 0,
    data_usage_kb INTEGER DEFAULT 0,
    api_calls_count INTEGER DEFAULT 0,
    security_events TEXT, -- JSON array of security-related events during session
    risk_score INTEGER CHECK (risk_score BETWEEN 1 AND 10),
    geofencing_violations INTEGER DEFAULT 0,
    offline_actions TEXT, -- JSON array of actions performed while offline
    sync_required BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Mobile Push Notifications
CREATE TABLE IF NOT EXISTS mobile_push_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    notification_id TEXT UNIQUE NOT NULL,
    user_id INTEGER,
    device_id TEXT,
    notification_type TEXT CHECK (notification_type IN ('security_alert', 'risk_update', 'compliance_reminder', 'system_notification', 'custom')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    category TEXT, -- For notification grouping
    payload_data TEXT, -- JSON: additional data for app handling
    scheduled_for DATETIME DEFAULT CURRENT_TIMESTAMP,
    sent_at DATETIME,
    delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed', 'expired')),
    delivery_attempts INTEGER DEFAULT 0,
    read_at DATETIME,
    action_taken TEXT, -- What action user took (dismissed, clicked, etc.)
    response_data TEXT, -- JSON: any response data from user interaction
    expires_at DATETIME,
    platform_response TEXT, -- Response from push service (FCM, APNS)
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Mobile Data Synchronization
CREATE TABLE IF NOT EXISTS mobile_sync_operations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sync_id TEXT UNIQUE NOT NULL,
    user_id INTEGER,
    device_id TEXT NOT NULL,
    sync_type TEXT CHECK (sync_type IN ('full', 'incremental', 'priority_only', 'forced')),
    sync_direction TEXT CHECK (sync_direction IN ('upload', 'download', 'bidirectional')),
    data_categories TEXT, -- JSON array: risks, assets, compliance, etc.
    sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'success', 'failed', 'partial')),
    sync_start DATETIME DEFAULT CURRENT_TIMESTAMP,
    sync_end DATETIME,
    sync_duration_ms INTEGER,
    records_processed INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    records_deleted INTEGER DEFAULT 0,
    data_size_kb INTEGER DEFAULT 0,
    conflicts_detected INTEGER DEFAULT 0,
    conflicts_resolved INTEGER DEFAULT 0,
    conflict_resolution_strategy TEXT DEFAULT 'server_wins' CHECK (conflict_resolution_strategy IN ('server_wins', 'client_wins', 'merge', 'manual')),
    last_sync_timestamp DATETIME, -- Client's last sync time before this operation
    client_version TEXT,
    server_version TEXT,
    sync_errors TEXT, -- JSON array of errors encountered
    network_quality TEXT CHECK (network_quality IN ('excellent', 'good', 'fair', 'poor', 'offline')),
    bandwidth_used_kb INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Mobile API Request Analytics
CREATE TABLE IF NOT EXISTS mobile_api_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id TEXT UNIQUE NOT NULL,
    session_id TEXT,
    user_id INTEGER,
    device_id TEXT,
    endpoint TEXT NOT NULL,
    http_method TEXT NOT NULL CHECK (http_method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
    request_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    response_status INTEGER,
    response_time_ms INTEGER,
    request_size_bytes INTEGER DEFAULT 0,
    response_size_bytes INTEGER DEFAULT 0,
    user_agent TEXT,
    ip_address TEXT,
    geolocation TEXT, -- JSON: country, region, city
    api_version TEXT,
    rate_limit_remaining INTEGER,
    error_message TEXT,
    cache_hit BOOLEAN DEFAULT FALSE,
    authentication_method TEXT,
    permissions_used TEXT, -- JSON array of permissions required
    data_access_log TEXT, -- JSON: what data was accessed/modified
    security_context TEXT, -- JSON: security-related request context
    performance_metrics TEXT, -- JSON: detailed performance data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =======================================================
-- PHASE 3 ORCHESTRATION AND MONITORING TABLES
-- =======================================================

-- Phase 3 Execution Tracking
CREATE TABLE IF NOT EXISTS phase3_executions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    execution_id TEXT UNIQUE NOT NULL,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
    integration_scope TEXT DEFAULT 'all' CHECK (integration_scope IN ('all', 'critical', 'security', 'compliance', 'mobile', 'ai')),
    results TEXT, -- JSON: detailed execution results
    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Phase 3 Health Status Tracking
CREATE TABLE IF NOT EXISTS phase3_health_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    system_health TEXT NOT NULL CHECK (system_health IN ('healthy', 'degraded', 'critical')),
    component_status TEXT NOT NULL, -- JSON: status of each component
    performance_metrics TEXT NOT NULL, -- JSON: performance data
    integration_metrics TEXT NOT NULL, -- JSON: integration-specific metrics
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cross-Component Pattern Analysis
CREATE TABLE IF NOT EXISTS cross_component_patterns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern_type TEXT NOT NULL,
    component_a TEXT NOT NULL,
    component_b TEXT NOT NULL,
    correlation_strength REAL CHECK (correlation_strength BETWEEN 0.0 AND 1.0),
    analysis_data TEXT, -- JSON: pattern analysis data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =======================================================
-- PERFORMANCE INDEXES FOR PHASE 3
-- =======================================================

-- Enterprise Integration Hub Indexes
CREATE INDEX IF NOT EXISTS idx_enterprise_integrations_type ON enterprise_integrations(integration_type);
CREATE INDEX IF NOT EXISTS idx_enterprise_integrations_status ON enterprise_integrations(status);
CREATE INDEX IF NOT EXISTS idx_integration_events_source ON integration_events(source_platform);
CREATE INDEX IF NOT EXISTS idx_integration_events_severity ON integration_events(severity);
CREATE INDEX IF NOT EXISTS idx_integration_events_created ON integration_events(created_at);
CREATE INDEX IF NOT EXISTS idx_event_correlations_status ON event_correlations(status);
CREATE INDEX IF NOT EXISTS idx_incident_responses_type ON automated_incident_responses(response_type);

-- AI Engine Indexes
CREATE INDEX IF NOT EXISTS idx_threat_attributions_actor ON threat_attributions(suspected_actor);
CREATE INDEX IF NOT EXISTS idx_threat_attributions_confidence ON threat_attributions(confidence_score);
CREATE INDEX IF NOT EXISTS idx_supply_chain_assessments_risk ON supply_chain_assessments(risk_score);
CREATE INDEX IF NOT EXISTS idx_regulatory_predictions_domain ON regulatory_predictions(regulatory_domain);
CREATE INDEX IF NOT EXISTS idx_regulatory_predictions_timeframe ON regulatory_predictions(expected_timeframe);
CREATE INDEX IF NOT EXISTS idx_executive_reports_type ON executive_intelligence_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_ai_model_executions_type ON ai_model_executions(execution_type);

-- Mobile Platform Indexes
CREATE INDEX IF NOT EXISTS idx_mobile_sessions_user ON mobile_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_sessions_device ON mobile_sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_mobile_sessions_status ON mobile_sessions(status);
CREATE INDEX IF NOT EXISTS idx_push_notifications_user ON mobile_push_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_push_notifications_status ON mobile_push_notifications(delivery_status);
CREATE INDEX IF NOT EXISTS idx_sync_operations_user ON mobile_sync_operations(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_operations_device ON mobile_sync_operations(device_id);
CREATE INDEX IF NOT EXISTS idx_api_requests_user ON mobile_api_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_api_requests_endpoint ON mobile_api_requests(endpoint);

-- Phase 3 Orchestration Indexes
CREATE INDEX IF NOT EXISTS idx_phase3_executions_priority ON phase3_executions(priority);
CREATE INDEX IF NOT EXISTS idx_phase3_executions_scope ON phase3_executions(integration_scope);
CREATE INDEX IF NOT EXISTS idx_phase3_health_system ON phase3_health_status(system_health);
CREATE INDEX IF NOT EXISTS idx_cross_patterns_type ON cross_component_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_cross_patterns_components ON cross_component_patterns(component_a, component_b);
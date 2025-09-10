-- Phase 3: Comprehensive Risk Management Framework Enhancement
-- Based on industry-standard risk management methodologies
-- Implements threat sources → events → vulnerabilities → assets → controls workflow

-- Threat Sources Table
CREATE TABLE IF NOT EXISTS threat_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Adversarial', 'Non-Adversarial')),
    subcategory TEXT NOT NULL, -- 'Individuals', 'Groups', 'Nation States', 'Human Error', 'System Failures', etc.
    description TEXT,
    likelihood_score INTEGER DEFAULT 1 CHECK (likelihood_score BETWEEN 1 AND 5), -- 1-5 scale
    sophistication_level TEXT DEFAULT 'Medium' CHECK (sophistication_level IN ('Low', 'Medium', 'High', 'Advanced')),
    motivation TEXT, -- Financial, Political, Ideological, Personal, etc.
    capability_level TEXT DEFAULT 'Medium' CHECK (capability_level IN ('Low', 'Medium', 'High', 'Nation-State')),
    geographic_region TEXT,
    industry_targeting TEXT, -- JSON array of targeted industries
    attack_vectors TEXT, -- JSON array of common attack methods
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Threat Events Table  
CREATE TABLE IF NOT EXISTS threat_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    threat_source_id INTEGER NOT NULL,
    event_type TEXT DEFAULT 'Attack' CHECK (event_type IN ('Attack', 'Error', 'Failure', 'Disaster')),
    attack_method TEXT, -- Phishing, Malware, Physical Breach, etc.
    impact_level TEXT DEFAULT 'Medium' CHECK (impact_level IN ('Low', 'Medium', 'High', 'Critical')),
    frequency_estimate TEXT DEFAULT 'Occasional' CHECK (frequency_estimate IN ('Rare', 'Unlikely', 'Occasional', 'Likely', 'Frequent')),
    detection_difficulty TEXT DEFAULT 'Medium' CHECK (detection_difficulty IN ('Easy', 'Medium', 'Hard', 'Very Hard')),
    mitigation_complexity TEXT DEFAULT 'Medium' CHECK (mitigation_complexity IN ('Simple', 'Medium', 'Complex', 'Very Complex')),
    mitre_technique_id TEXT, -- MITRE ATT&CK technique mapping
    kill_chain_phase TEXT, -- Cyber Kill Chain phase
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (threat_source_id) REFERENCES threat_sources(id)
);

-- Enhanced Vulnerabilities Table
CREATE TABLE IF NOT EXISTS vulnerabilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    vulnerability_type TEXT NOT NULL CHECK (vulnerability_type IN ('Technical', 'Procedural', 'Physical', 'Personnel')),
    category TEXT, -- Software, Hardware, Configuration, Process, etc.
    severity TEXT DEFAULT 'Medium' CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    cvss_score REAL CHECK (cvss_score BETWEEN 0.0 AND 10.0),
    cve_id TEXT, -- CVE identifier if applicable
    exploitability_score INTEGER DEFAULT 3 CHECK (exploitability_score BETWEEN 1 AND 5),
    impact_score INTEGER DEFAULT 3 CHECK (impact_score BETWEEN 1 AND 5),
    affected_systems TEXT, -- JSON array of affected asset types
    exploitable_by TEXT, -- JSON array of threat_event_ids that can exploit this
    discovery_method TEXT, -- Vulnerability scan, Penetration test, Code review, etc.
    remediation_effort TEXT DEFAULT 'Medium' CHECK (remediation_effort IN ('Low', 'Medium', 'High', 'Very High')),
    remediation_status TEXT DEFAULT 'Open' CHECK (remediation_status IN ('Open', 'In Progress', 'Remediated', 'Accepted', 'Mitigated')),
    remediation_priority TEXT DEFAULT 'Medium' CHECK (remediation_priority IN ('Low', 'Medium', 'High', 'Critical')),
    first_discovered DATETIME DEFAULT CURRENT_TIMESTAMP,
    target_remediation_date DATETIME,
    actual_remediation_date DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced Assets Table (replaces existing assets if needed)
DROP TABLE IF EXISTS phase3_assets;
CREATE TABLE IF NOT EXISTS phase3_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('Primary', 'Supporting')),
    category TEXT NOT NULL CHECK (category IN ('Data', 'Systems', 'Applications', 'Infrastructure', 'Personnel', 'Reputation')),
    subcategory TEXT, -- Customer Data, Financial Systems, Web Applications, etc.
    business_function TEXT, -- Core business process this asset supports
    criticality TEXT DEFAULT 'Medium' CHECK (criticality IN ('Low', 'Medium', 'High', 'Critical')),
    confidentiality_impact TEXT DEFAULT 'Medium' CHECK (confidentiality_impact IN ('Low', 'Medium', 'High')),
    integrity_impact TEXT DEFAULT 'Medium' CHECK (integrity_impact IN ('Low', 'Medium', 'High')),
    availability_impact TEXT DEFAULT 'Medium' CHECK (availability_impact IN ('Low', 'Medium', 'High')),
    business_impact_description TEXT,
    regulatory_requirements TEXT, -- JSON array of applicable regulations
    data_classification TEXT CHECK (data_classification IN ('Public', 'Internal', 'Confidential', 'Restricted')),
    enabled_assets TEXT, -- JSON array: Supporting Assets enable Primary Assets
    depends_on_assets TEXT, -- JSON array: Dependencies on other assets
    geographic_location TEXT,
    owner_department TEXT,
    technical_owner TEXT,
    business_owner TEXT,
    estimated_value DECIMAL(15,2),
    replacement_cost DECIMAL(15,2),
    revenue_dependency DECIMAL(15,2), -- Revenue at risk if asset compromised
    recovery_time_objective INTEGER, -- RTO in hours
    recovery_point_objective INTEGER, -- RPO in hours
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced Controls Table
CREATE TABLE IF NOT EXISTS security_controls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    control_id TEXT UNIQUE, -- ISO 27001 A.5.1, NIST CSF PR.AC-1, etc.
    control_type TEXT NOT NULL CHECK (control_type IN ('Preventive', 'Detective', 'Corrective', 'Deterrent', 'Recovery', 'Compensating')),
    control_category TEXT NOT NULL CHECK (control_category IN ('Organizational', 'People', 'Physical', 'Technological')),
    control_class TEXT CHECK (control_class IN ('Administrative', 'Technical', 'Physical')), -- Alternative classification
    description TEXT,
    implementation_guidance TEXT,
    effectiveness_rating INTEGER DEFAULT 3 CHECK (effectiveness_rating BETWEEN 1 AND 5), -- 1-5 scale
    implementation_status TEXT DEFAULT 'Planned' CHECK (implementation_status IN ('Planned', 'In Progress', 'Implemented', 'Verified', 'Ineffective')),
    implementation_date DATETIME,
    last_review_date DATETIME,
    next_review_date DATETIME,
    testing_frequency TEXT DEFAULT 'Annual' CHECK (testing_frequency IN ('Continuous', 'Monthly', 'Quarterly', 'Annual', 'Biennial')),
    automation_level TEXT DEFAULT 'Manual' CHECK (automation_level IN ('Manual', 'Semi-Automated', 'Automated')),
    cost_estimate DECIMAL(15,2),
    maintenance_effort TEXT DEFAULT 'Medium' CHECK (maintenance_effort IN ('Low', 'Medium', 'High')),
    protects_assets TEXT, -- JSON array of asset_ids this control protects
    mitigates_threats TEXT, -- JSON array of threat_event_ids this control addresses  
    addresses_vulnerabilities TEXT, -- JSON array of vulnerability_ids this control remediates
    compliance_frameworks TEXT, -- JSON array: ISO27001, NIST, SOC2, etc.
    control_owner TEXT,
    technical_contact TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Security Events and Incidents Table
CREATE TABLE IF NOT EXISTS security_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_title TEXT NOT NULL,
    event_description TEXT,
    event_type TEXT DEFAULT 'Anomaly' CHECK (event_type IN ('Anomaly', 'Violation', 'Incident', 'False Positive')),
    severity TEXT DEFAULT 'Medium' CHECK (severity IN ('Informational', 'Low', 'Medium', 'High', 'Critical')),
    event_source TEXT, -- SIEM, IDS, Manual Report, etc.
    source_system TEXT, -- Which system detected the event
    source_vulnerability_id INTEGER,
    detected_by_control_id INTEGER,
    affected_assets TEXT, -- JSON array of affected asset_ids
    related_threat_events TEXT, -- JSON array of potentially related threat_event_ids
    incident_status TEXT DEFAULT 'New' CHECK (incident_status IN ('New', 'Investigating', 'Contained', 'Eradicated', 'Recovered', 'Closed', 'False Positive')),
    priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    assigned_to TEXT,
    reported_by TEXT,
    first_detected DATETIME DEFAULT CURRENT_TIMESTAMP,
    containment_time DATETIME,
    resolution_time DATETIME,
    business_impact TEXT,
    financial_impact DECIMAL(15,2),
    lessons_learned TEXT,
    corrective_actions TEXT, -- JSON array of actions taken
    evidence_collected TEXT, -- JSON array of evidence items
    external_notification_required BOOLEAN DEFAULT FALSE,
    regulatory_reporting_required BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_vulnerability_id) REFERENCES vulnerabilities(id),
    FOREIGN KEY (detected_by_control_id) REFERENCES security_controls(id)
);

-- Risk Relationships Mapping Table
CREATE TABLE IF NOT EXISTS risk_relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('exploits', 'impacts', 'enables', 'mitigates', 'protects', 'detects', 'depends_on', 'threatens')),
    source_type TEXT NOT NULL CHECK (source_type IN ('threat_source', 'threat_event', 'vulnerability', 'asset', 'control', 'security_event')),
    source_id INTEGER NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('threat_source', 'threat_event', 'vulnerability', 'asset', 'control', 'security_event')),
    target_id INTEGER NOT NULL,
    relationship_strength TEXT DEFAULT 'Medium' CHECK (relationship_strength IN ('Low', 'Medium', 'High')),
    confidence_level TEXT DEFAULT 'Medium' CHECK (confidence_level IN ('Low', 'Medium', 'High')),
    relationship_description TEXT,
    evidence TEXT, -- Supporting evidence for the relationship
    created_by TEXT,
    validated BOOLEAN DEFAULT FALSE,
    validation_date DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Risk Assessment Results Table  
CREATE TABLE IF NOT EXISTS risk_assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assessment_name TEXT NOT NULL,
    assessment_type TEXT DEFAULT 'Comprehensive' CHECK (assessment_type IN ('Comprehensive', 'Targeted', 'Continuous', 'Ad-hoc')),
    threat_source_id INTEGER,
    threat_event_id INTEGER,
    vulnerability_id INTEGER,
    asset_id INTEGER,
    inherent_likelihood INTEGER CHECK (inherent_likelihood BETWEEN 1 AND 5),
    inherent_impact INTEGER CHECK (inherent_impact BETWEEN 1 AND 5),
    inherent_risk_score INTEGER CHECK (inherent_risk_score BETWEEN 1 AND 25), -- likelihood * impact
    residual_likelihood INTEGER CHECK (residual_likelihood BETWEEN 1 AND 5),
    residual_impact INTEGER CHECK (residual_impact BETWEEN 1 AND 5),
    residual_risk_score INTEGER CHECK (residual_risk_score BETWEEN 1 AND 25),
    risk_treatment TEXT DEFAULT 'Mitigate' CHECK (risk_treatment IN ('Accept', 'Mitigate', 'Transfer', 'Avoid')),
    risk_level TEXT DEFAULT 'Medium' CHECK (risk_level IN ('Very Low', 'Low', 'Medium', 'High', 'Very High')),
    risk_appetite_exceeded BOOLEAN DEFAULT FALSE,
    applicable_controls TEXT, -- JSON array of control_ids that mitigate this risk
    control_effectiveness TEXT DEFAULT 'Medium' CHECK (control_effectiveness IN ('None', 'Low', 'Medium', 'High')),
    additional_controls_needed TEXT,
    risk_owner TEXT,
    assessment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    next_review_date DATETIME,
    assessment_methodology TEXT DEFAULT 'Qualitative' CHECK (assessment_methodology IN ('Qualitative', 'Quantitative', 'Hybrid')),
    notes TEXT,
    approved_by TEXT,
    approval_date DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (threat_source_id) REFERENCES threat_sources(id),
    FOREIGN KEY (threat_event_id) REFERENCES threat_events(id),  
    FOREIGN KEY (vulnerability_id) REFERENCES vulnerabilities(id),
    FOREIGN KEY (asset_id) REFERENCES phase3_assets(id)
);

-- Compliance Framework Mapping
CREATE TABLE IF NOT EXISTS compliance_framework_mappings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    framework_name TEXT NOT NULL, -- ISO 27001, NIST CSF, SOC 2, PCI DSS, etc.
    framework_version TEXT,
    control_reference TEXT NOT NULL, -- A.5.1, PR.AC-1, CC6.1, etc.
    control_title TEXT,
    control_description TEXT,
    control_category TEXT,
    mapped_security_control_id INTEGER,
    compliance_status TEXT DEFAULT 'Not Assessed' CHECK (compliance_status IN ('Compliant', 'Partially Compliant', 'Non-Compliant', 'Not Applicable', 'Not Assessed')),
    evidence_required TEXT,
    testing_procedure TEXT,
    last_assessment_date DATETIME,
    next_assessment_date DATETIME,
    gaps_identified TEXT,
    remediation_plan TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mapped_security_control_id) REFERENCES security_controls(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_threat_sources_category ON threat_sources(category);
CREATE INDEX IF NOT EXISTS idx_threat_events_source ON threat_events(threat_source_id);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON vulnerabilities(severity);
CREATE INDEX IF NOT EXISTS idx_assets_type ON phase3_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_assets_criticality ON phase3_assets(criticality);
CREATE INDEX IF NOT EXISTS idx_controls_type ON security_controls(control_type);
CREATE INDEX IF NOT EXISTS idx_controls_status ON security_controls(implementation_status);
CREATE INDEX IF NOT EXISTS idx_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_events_status ON security_events(incident_status);
CREATE INDEX IF NOT EXISTS idx_relationships_source ON risk_relationships(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_relationships_target ON risk_relationships(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_assessments_risk_level ON risk_assessments(risk_level);
CREATE INDEX IF NOT EXISTS idx_compliance_framework ON compliance_framework_mappings(framework_name);
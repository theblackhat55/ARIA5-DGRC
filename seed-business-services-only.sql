-- Phase 1 - Business Services Only
INSERT OR IGNORE INTO business_services (
  id, name, description, business_owner, technical_owner, 
  confidentiality_impact, integrity_impact, availability_impact, 
  criticality_level, business_impact_tier, revenue_dependency, 
  customer_facing, service_status, deployment_environment
) VALUES
-- Core Revenue Services (Critical)
(1, 'E-commerce Platform', 'Main customer-facing e-commerce website and API', 'Sarah Chen', 'Mike Rodriguez', 4, 5, 5, 'Critical', 1, TRUE, TRUE, 'Active', 'Production'),
(2, 'Payment Processing System', 'Credit card and payment transaction processing', 'David Kim', 'Alex Thompson', 5, 5, 5, 'Critical', 1, TRUE, FALSE, 'Active', 'Production'),
(3, 'Customer Database', 'Primary customer data and PII storage system', 'Lisa Wang', 'Tom Wilson', 5, 4, 4, 'Critical', 1, TRUE, FALSE, 'Active', 'Production'),
(4, 'Order Management System', 'Order processing, fulfillment and inventory', 'John Davis', 'Emma Johnson', 3, 5, 4, 'High', 2, TRUE, FALSE, 'Active', 'Production'),

-- Customer Service & Support (High)
(5, 'Customer Support Portal', 'Help desk, ticketing and knowledge base', 'Maria Garcia', 'Chris Lee', 3, 3, 4, 'High', 2, FALSE, TRUE, 'Active', 'Production'),
(6, 'CRM System', 'Customer relationship management and sales', 'Robert Taylor', 'Jessica Brown', 4, 4, 3, 'High', 2, TRUE, FALSE, 'Active', 'Production'),
(7, 'Live Chat System', 'Real-time customer chat support', 'Susan Miller', 'Daniel White', 2, 2, 4, 'Medium', 3, FALSE, TRUE, 'Active', 'Production'),

-- Core Infrastructure Services (High)
(8, 'Active Directory', 'Identity and access management system', 'Kevin Anderson', 'Rachel Green', 4, 5, 4, 'High', 2, FALSE, FALSE, 'Active', 'Production'),
(9, 'Email System', 'Corporate email and communication platform', 'Amy Clark', 'Steve Harris', 3, 3, 4, 'Medium', 3, FALSE, FALSE, 'Active', 'Production'),
(10, 'File Storage System', 'Shared file storage and collaboration', 'Brian Lewis', 'Nicole Adams', 3, 4, 3, 'Medium', 3, FALSE, FALSE, 'Active', 'Production'),

-- Data & Analytics Services (Medium-High)
(11, 'Data Warehouse', 'Business intelligence and analytics data store', 'Jennifer Martinez', 'Paul Turner', 4, 4, 3, 'High', 2, TRUE, FALSE, 'Active', 'Production'),
(12, 'Reporting System', 'Business reporting and dashboard platform', 'Michael Wright', 'Laura Scott', 3, 4, 3, 'Medium', 3, FALSE, FALSE, 'Active', 'Production'),
(13, 'Backup System', 'Enterprise backup and disaster recovery', 'Gary Cooper', 'Helen King', 4, 5, 5, 'High', 2, FALSE, FALSE, 'Active', 'Production'),

-- Development & DevOps (Medium)
(14, 'CI/CD Pipeline', 'Continuous integration and deployment system', 'Ryan Mitchell', 'Sophia Davis', 2, 4, 3, 'Medium', 3, FALSE, FALSE, 'Active', 'Production'),
(15, 'Source Code Repository', 'Git repository and version control system', 'Nathan Phillips', 'Grace Wilson', 4, 5, 3, 'Medium', 3, FALSE, FALSE, 'Active', 'Production'),
(16, 'Monitoring System', 'Application and infrastructure monitoring', 'Lisa Campbell', 'James Moore', 2, 3, 4, 'Medium', 3, FALSE, FALSE, 'Active', 'Production'),

-- Security Services (High)  
(17, 'SIEM Platform', 'Security information and event management', 'Marcus Johnson', 'Karen Martinez', 4, 4, 4, 'High', 2, FALSE, FALSE, 'Active', 'Production'),
(18, 'Vulnerability Scanner', 'Automated security vulnerability assessment', 'Diana Rodriguez', 'Tony Garcia', 3, 3, 3, 'Medium', 3, FALSE, FALSE, 'Active', 'Production'),
(19, 'Firewall Management', 'Network security and access control', 'Victor Brown', 'Amanda Taylor', 3, 4, 5, 'High', 2, FALSE, FALSE, 'Active', 'Production'),

-- External Facing Services (High)
(20, 'Corporate Website', 'Public marketing and information website', 'Michelle Lee', 'Andrew Clark', 2, 3, 3, 'Medium', 3, FALSE, TRUE, 'Active', 'Production'),
(21, 'API Gateway', 'External API management and rate limiting', 'Carlos Rodriguez', 'Samantha White', 3, 4, 5, 'High', 2, FALSE, TRUE, 'Active', 'Production'),
(22, 'Content Delivery Network', 'Global content distribution and caching', 'Patricia Davis', 'Kevin Thompson', 1, 2, 5, 'Medium', 3, FALSE, TRUE, 'Active', 'Production');

SELECT 'Business Services Inserted:' as summary, COUNT(*) as count FROM business_services;
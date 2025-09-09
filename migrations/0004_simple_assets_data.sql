-- Populate assets table with sample data matching actual schema
-- This provides essential asset inventory for the platform

INSERT OR IGNORE INTO assets (id, name, description, asset_type, criticality, organization_id, status) VALUES 
-- Critical Infrastructure Assets
(1, 'Primary Web Server', 'Main production web server hosting customer applications', 'server', 'Critical', 1, 'active'),
(2, 'Database Server - Primary', 'Primary customer database server with PII and financial data', 'server', 'Critical', 1, 'active'),
(3, 'Load Balancer', 'Primary load balancer for web traffic distribution', 'network_device', 'High', 1, 'active'),
(4, 'Firewall - Perimeter', 'Main perimeter firewall protecting internal network', 'network_device', 'Critical', 1, 'active'),

-- High Priority Assets
(5, 'Backup Database Server', 'Secondary database server for disaster recovery', 'server', 'High', 1, 'active'),
(6, 'Application Server - API', 'REST API server for mobile and web applications', 'server', 'High', 1, 'active'),
(7, 'Customer Portal', 'Self-service customer portal application', 'application', 'High', 1, 'active'),
(8, 'Core Switch', 'Main network switch for internal traffic', 'network_device', 'High', 1, 'active'),

-- Medium Priority Assets  
(9, 'Development Server', 'Development and testing environment server', 'server', 'Medium', 1, 'active'),
(10, 'File Server', 'Internal file sharing and document storage', 'server', 'Medium', 1, 'active'),
(11, 'VPN Gateway', 'Remote access VPN concentrator', 'network_device', 'Medium', 1, 'active'),
(12, 'Monitoring System', 'Network and system monitoring platform', 'application', 'Medium', 1, 'active'),

-- Employee Workstations
(13, 'Admin Workstation - Security', 'Security administrator workstation with elevated access', 'workstation', 'High', 1, 'active'),
(14, 'Admin Workstation - IT', 'IT administrator workstation for system management', 'workstation', 'High', 1, 'active'),
(15, 'Developer Workstation', 'Software development workstation with source code access', 'workstation', 'Medium', 1, 'active'),
(16, 'Finance Workstation', 'Finance department workstation with financial system access', 'workstation', 'High', 1, 'active'),

-- Cloud Services
(17, 'Email System', 'Microsoft 365 email and collaboration platform', 'cloud_service', 'High', 1, 'active'),
(18, 'Backup Storage', 'AWS S3 backup storage for critical data', 'cloud_service', 'High', 1, 'active'),
(19, 'CDN Service', 'CloudFlare CDN for web content delivery', 'cloud_service', 'Medium', 1, 'active'),

-- Databases
(20, 'Analytics Database', 'Business intelligence and analytics database', 'database', 'Medium', 1, 'active'),
(21, 'Log Database', 'Security and application log storage database', 'database', 'Medium', 1, 'active'),
(22, 'Configuration Database', 'System and application configuration database', 'database', 'High', 1, 'active'),

-- Additional Infrastructure
(23, 'DNS Server - Primary', 'Primary internal DNS server', 'server', 'High', 1, 'active'),
(24, 'DHCP Server', 'Network DHCP service for IP address management', 'server', 'Medium', 1, 'active'),
(25, 'Wireless Controller', 'Enterprise wireless network controller', 'network_device', 'Medium', 1, 'active');
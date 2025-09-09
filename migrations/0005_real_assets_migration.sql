-- Replace test assets with real assets from aria51-production database
-- This migration restores the original 32 assets from the complete ARIA51 platform

-- Clear existing test data
DELETE FROM assets;

-- Insert real assets from original aria51-production database
INSERT OR REPLACE INTO assets (name, description, asset_type, criticality, status, organization_id, created_at, updated_at) VALUES
('AI Risk Engine API', 'Systems - API Service', 'api', 'Critical', 'active', 1, '2025-09-06 07:07:43', '2025-09-06 07:07:43'),
('ARIA5 Platform Database', 'Systems - Database', 'database', 'Critical', 'active', 1, '2025-09-06 07:07:43', '2025-09-06 07:07:43'),
('Backup & Disaster Recovery Service', 'Systems - Infrastructure Service', 'service', 'Critical', 'active', 1, '2025-09-06 07:34:16', '2025-09-06 07:34:16'),
('Backup Storage', 'Systems - Storage', 'storage', 'High', 'active', 1, '2025-09-06 07:07:43', '2025-09-06 07:07:43'),
('Business Intelligence Dashboard', 'Systems - Analytics Service', 'application', 'Medium', 'active', 1, '2025-09-06 07:34:16', '2025-09-06 07:34:16'),
('Code Repository', 'Systems - Source Control', 'application', 'High', 'active', 1, '2025-09-06 07:07:43', '2025-09-06 07:07:43'),
('Container Orchestration Platform', 'Systems - Platform Service', 'platform', 'Critical', 'active', 1, '2025-09-06 07:34:16', '2025-09-06 07:34:16'),
('Core API Gateway', 'Systems - API Service', 'api', 'Critical', 'active', 1, '2025-09-06 07:34:16', '2025-09-06 07:34:16'),
('Customer Portal Service', 'Systems - Web Application', 'application', 'Critical', 'active', 1, '2025-09-06 07:34:16', '2025-09-06 07:34:16'),
('Customer Web Portal', 'Systems - Web Application', 'application', 'High', 'active', 1, '2025-09-06 07:07:43', '2025-09-06 07:07:43'),
('DB01', 'Systems - Database Server', 'database', 'Medium', 'active', 1, '2025-09-08 05:25:22', '2025-09-08 05:25:22'),
('Data Warehouse Service', 'Systems - Data Service', 'database', 'High', 'active', 1, '2025-09-06 07:34:16', '2025-09-06 07:34:16'),
('Database Server', 'Systems - server', 'server', 'Critical', 'active', 1, '2025-09-04 17:32:02', '2025-09-04 17:32:02'),
('Email & Notification Service', 'Systems - Communication Service', 'service', 'High', 'active', 1, '2025-09-06 07:34:16', '2025-09-06 07:34:16'),
('Email Service', 'Systems - service', 'service', 'Medium', 'active', 1, '2025-09-04 17:32:02', '2025-09-04 17:32:02'),
('Employee Workstations', 'Systems - Laptop', 'workstation', 'Medium', 'active', 1, '2025-09-06 07:07:43', '2025-09-06 07:07:43'),
('Identity & Authentication Service', 'Systems - Security Service', 'service', 'Critical', 'active', 1, '2025-09-06 07:34:16', '2025-09-06 07:34:16'),
('Kubernetes Cluster', 'Systems - Container Platform', 'platform', 'Critical', 'active', 1, '2025-09-06 07:07:43', '2025-09-06 07:07:43'),
('Log Aggregation & Monitoring', 'Systems - Infrastructure Service', 'service', 'High', 'active', 1, '2025-09-06 07:34:16', '2025-09-06 07:34:16'),
('Mobile Device Management', 'Infrastructure - MDM', 'service', 'Medium', 'active', 1, '2025-09-06 07:07:43', '2025-09-06 07:07:43'),
('Monitoring Platform', 'Infrastructure - SIEM', 'platform', 'High', 'active', 1, '2025-09-06 07:07:43', '2025-09-06 07:07:43'),
('Network Switches', 'Systems - Switch', 'network_device', 'High', 'active', 1, '2025-09-06 07:07:43', '2025-09-06 07:07:43'),
('Payment Processing Service', 'Systems - Financial Service', 'service', 'Critical', 'active', 1, '2025-09-06 07:34:16', '2025-09-06 07:34:16'),
('Real-time Analytics Engine', 'Systems - Analytics Service', 'service', 'High', 'active', 1, '2025-09-06 07:34:16', '2025-09-06 07:34:16'),
('SSO Identity Provider', 'Infrastructure - Identity Management', 'service', 'Critical', 'active', 1, '2025-09-06 07:07:43', '2025-09-06 07:07:43'),
('Security Information Event Management', 'Systems - Security Service', 'service', 'High', 'active', 1, '2025-09-06 07:34:16', '2025-09-06 07:34:16'),
('Third-Party Integration Hub', 'Systems - Integration Service', 'service', 'High', 'active', 1, '2025-09-06 07:34:16', '2025-09-06 07:34:16'),
('VPN Gateway', 'Systems - Firewall', 'network_device', 'High', 'active', 1, '2025-09-06 07:07:43', '2025-09-06 07:07:43'),
('Vulnerability Scanning Service', 'Systems - Security Service', 'service', 'High', 'active', 1, '2025-09-06 07:34:16', '2025-09-06 07:34:16'),
('Web Server 01', 'Systems - server', 'server', 'High', 'active', 1, '2025-09-04 17:32:02', '2025-09-04 17:32:02'),
('Webhook Management Service', 'Systems - Integration Service', 'service', 'Medium', 'active', 1, '2025-09-06 07:34:16', '2025-09-06 07:34:16'),
('web01', 'Web server hosting customer applications', 'server', 'Critical', 'active', 1, '2025-09-08 10:33:22', '2025-09-08 10:33:22');

-- Update statistics
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM assets) WHERE name = 'assets';
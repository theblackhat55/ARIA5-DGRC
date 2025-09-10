-- Insert sample asset records to support service-asset relationships
INSERT OR IGNORE INTO assets (id, name, description, asset_type, criticality, status, organization_id) VALUES
(1, 'Web Application Servers', 'Primary web servers hosting applications', 'Server', 'Critical', 'active', 1),
(2, 'Database Servers', 'Production database servers', 'Server', 'Critical', 'active', 1),
(3, 'Customer Database Instance', 'Customer data and PII storage', 'Database', 'Critical', 'active', 1),
(4, 'File Storage Array', 'Shared file storage system', 'Storage', 'High', 'active', 1),
(8, 'Active Directory Servers', 'Identity management servers', 'Server', 'High', 'active', 1),
(13, 'Backup Storage System', 'Enterprise backup infrastructure', 'Storage', 'High', 'active', 1),
(19, 'Corporate Firewall Cluster', 'Network security appliances', 'Network', 'Critical', 'active', 1),
(21, 'API Gateway Load Balancer', 'External API traffic management', 'Network', 'High', 'active', 1);

SELECT 'Assets Inserted:' as summary, COUNT(*) as count FROM assets;
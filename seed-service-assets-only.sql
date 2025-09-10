-- Insert Service-Asset Relationships (Risk Cascading)
INSERT OR IGNORE INTO service_assets (service_id, asset_id, dependency_type, impact_weight, criticality_level, relationship_notes) VALUES
-- E-commerce Platform dependencies
(1, 1, 'depends_on', 2.0, 'Critical', 'E-commerce platform runs on web servers'),
(1, 3, 'depends_on', 1.5, 'High', 'E-commerce connects to database servers'),
(1, 21, 'depends_on', 1.8, 'High', 'E-commerce uses API gateway for external APIs'),

-- Payment Processing dependencies  
(2, 3, 'depends_on', 2.5, 'Critical', 'Payment system requires secure database access'),
(2, 19, 'depends_on', 2.0, 'Critical', 'Payment processing requires firewall protection'),
(2, 8, 'depends_on', 1.8, 'High', 'Payment system uses AD for authentication'),

-- Customer Database dependencies
(3, 3, 'hosts_on', 3.0, 'Critical', 'Customer data hosted on database servers'),
(3, 13, 'depends_on', 2.2, 'High', 'Customer DB protected by backup system'),
(3, 8, 'depends_on', 1.5, 'Medium', 'Database authentication via Active Directory'),

-- Order Management dependencies
(4, 1, 'depends_on', 1.8, 'High', 'Order system runs on application servers'),
(4, 3, 'depends_on', 2.0, 'Critical', 'Order management uses customer database'),
(4, 2, 'depends_on', 2.5, 'Critical', 'Order processing integrates with payments'),

-- Infrastructure service dependencies
(8, 2, 'hosts_on', 2.5, 'Critical', 'Active Directory hosted on dedicated servers'),
(9, 2, 'hosts_on', 1.8, 'High', 'Email system runs on messaging servers'),
(10, 4, 'hosts_on', 2.0, 'High', 'File storage uses dedicated storage servers');

SELECT 'Service-Asset Relationships:' as summary, COUNT(*) as count FROM service_assets;
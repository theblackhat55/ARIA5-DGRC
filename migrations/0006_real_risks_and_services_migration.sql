-- Replace test risks and services with real data from aria51-production database
-- This migration restores the original 7 risks and 7 services from the complete ARIA51 platform

-- Clear existing test data
DELETE FROM risks;
DELETE FROM services;

-- Insert real risks from original aria51-production database
INSERT OR REPLACE INTO risks (title, description, category, subcategory, probability, impact, status, approval_status, organization_id, created_at, updated_at) VALUES
('Market Volatility Impact', 'Financial losses due to market fluctuations and economic uncertainty', 'operational', 'financial', 4, 3, 'active', 'approved', 1, '2025-09-06 09:38:24', '2025-09-06 09:38:24'),
('Regulatory Compliance Gap', 'Potential non-compliance with updated industry regulations', 'operational', 'compliance', 2, 4, 'active', 'approved', 1, '2025-09-06 09:38:24', '2025-09-06 09:38:24'),
('Supply Chain Disruption', 'Risk of critical supplier failure affecting production schedules', 'operational', 'supply_chain', 3, 4, 'active', 'approved', 1, '2025-09-06 09:38:24', '2025-09-06 09:38:24'),
('Technology Infrastructure Failure', 'Critical system failure leading to business disruption', 'operational', 'technology', 3, 5, 'active', 'approved', 1, '2025-09-06 09:38:24', '2025-09-06 09:38:24'),
('Abuse of LLM API Keys', 'Identified risk of abuse of LLM API keys in a critical system. API keys were not encrypted at rest and transit.', 'operational', 'security', 4, 5, 'mitigated', 'approved', 1, '2025-09-08 10:32:05', '2025-09-08 19:03:46'),
('Local Accounts Security Risk', 'There are local accounts on critical servers bypassing LAPS solution', 'operational', 'security', 4, 4, 'mitigated', 'approved', 1, '2025-09-08 06:23:14', '2025-09-08 07:16:14'),
('Weak Passwords', 'Weak passwords in critical systems', 'operational', 'security', 4, 4, 'accepted', 'approved', 1, '2025-09-08 05:22:34', '2025-09-08 07:17:17');

-- Insert real services from original aria51-production database  
INSERT OR REPLACE INTO services (name, description, criticality_level, confidentiality_score, integrity_score, availability_score, aggregate_risk_score, status, organization_id, created_at, updated_at) VALUES
('Customer Portal', 'Primary customer-facing web portal for account management and service requests', 'high', 4, 4, 4, 0.0, 'active', 1, '2025-09-08 09:30:20', '2025-09-08 09:30:20'),
('Data Backup Service', 'Automated backup and recovery service for critical data', 'high', 4, 5, 3, 0.0, 'active', 1, '2025-09-08 09:30:20', '2025-09-08 09:30:20'),
('Email Notification Service', 'Automated email notifications and alerts system', 'medium', 3, 3, 3, 0.0, 'active', 1, '2025-09-08 09:30:20', '2025-09-08 09:30:20'),
('HR Management System', 'Human resources management and employee services', 'medium', 2, 2, 2, 2.0, 'active', 1, '2025-09-08 19:05:36', '2025-09-08 19:05:36'),
('Payment Processing Service', 'Core payment processing and billing system', 'critical', 5, 5, 4, 0.0, 'active', 1, '2025-09-08 09:30:20', '2025-09-08 09:30:20'),
('Test Integration Service', 'Testing and integration service for development workflows', 'medium', 2, 2, 2, 2.0, 'active', 1, '2025-09-08 09:34:05', '2025-09-08 09:34:05'),
('Advanced Testing Platform', 'Comprehensive testing platform for quality assurance', 'medium', 2, 2, 2, 2.0, 'active', 1, '2025-09-08 09:49:12', '2025-09-08 09:49:12');

-- Update statistics
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM risks) WHERE name = 'risks';
UPDATE sqlite_sequence SET seq = (SELECT MAX(id) FROM services) WHERE name = 'services';
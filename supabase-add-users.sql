-- Add users and balances script
-- Run this AFTER the tables are created

-- 1. Insert default admin user
INSERT INTO users (username, email, password, role, "isActive") 
VALUES ('admin', 'admin@metachrome.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', true)
ON CONFLICT (username) DO NOTHING;

-- 2. Insert test user
INSERT INTO users (username, email, password, role, "isActive") 
VALUES ('testuser', 'test@metachrome.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', true)
ON CONFLICT (username) DO NOTHING;

-- 3. Insert another test user
INSERT INTO users (username, email, password, role, "isActive") 
VALUES ('user1', 'user1@metachrome.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', true)
ON CONFLICT (username) DO NOTHING;

-- 4. Add balances for all users
INSERT INTO balances ("userId", symbol, available) 
SELECT id, 'USD', 10000.00 
FROM users 
WHERE role = 'user'
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Users and balances added successfully!' as message;

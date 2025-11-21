-- Create admin_activity_logs table to track all admin activities
-- This table is append-only (no deletes) to maintain complete audit trail

CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id SERIAL PRIMARY KEY,

  -- Admin who performed the action
  admin_id UUID NOT NULL,
  admin_username VARCHAR(255) NOT NULL,
  admin_email VARCHAR(255),

  -- Action details
  action_type VARCHAR(100) NOT NULL, -- e.g., 'TRADING_CONTROL_CHANGE', 'BALANCE_UPDATE', 'VERIFICATION_APPROVAL'
  action_category VARCHAR(50) NOT NULL, -- e.g., 'TRADING', 'BALANCE', 'VERIFICATION', 'USER_MANAGEMENT'
  action_description TEXT NOT NULL, -- Human-readable description

  -- Target user (if applicable)
  target_user_id UUID,
  target_username VARCHAR(255),
  target_email VARCHAR(255),
  
  -- Action metadata (JSON for flexibility)
  metadata JSONB DEFAULT '{}',
  -- Examples:
  -- For trading control: {"previous_mode": "normal", "new_mode": "win", "duration": "30s"}
  -- For balance: {"previous_balance": 1000, "new_balance": 2000, "change": 1000, "reason": "Admin adjustment"}
  -- For verification: {"status": "approved", "document_type": "passport"}
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- IP address and user agent for security
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Prevent deletion
  is_deleted BOOLEAN DEFAULT FALSE,
  
  CONSTRAINT fk_admin
    FOREIGN KEY(admin_id) 
    REFERENCES users(id)
    ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_activity_logs_target_user_id ON admin_activity_logs(target_user_id);
CREATE INDEX idx_admin_activity_logs_action_type ON admin_activity_logs(action_type);
CREATE INDEX idx_admin_activity_logs_action_category ON admin_activity_logs(action_category);
CREATE INDEX idx_admin_activity_logs_created_at ON admin_activity_logs(created_at DESC);
CREATE INDEX idx_admin_activity_logs_metadata ON admin_activity_logs USING GIN (metadata);

-- Create a view for easy querying with user details
CREATE OR REPLACE VIEW admin_activity_logs_view AS
SELECT 
  aal.id,
  aal.admin_id,
  aal.admin_username,
  aal.admin_email,
  aal.action_type,
  aal.action_category,
  aal.action_description,
  aal.target_user_id,
  aal.target_username,
  aal.target_email,
  aal.metadata,
  aal.created_at,
  aal.ip_address,
  aal.user_agent,
  -- Join with users table to get current admin info
  u.username as current_admin_username,
  u.email as current_admin_email,
  u.role as admin_role
FROM admin_activity_logs aal
LEFT JOIN users u ON aal.admin_id = u.id
WHERE aal.is_deleted = FALSE
ORDER BY aal.created_at DESC;

-- Add comment to table
COMMENT ON TABLE admin_activity_logs IS 'Audit log for all admin activities. This table is append-only and records should never be deleted to maintain complete audit trail.';

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT ON admin_activity_logs TO authenticated;
-- GRANT SELECT ON admin_activity_logs_view TO authenticated;

-- Verification query
SELECT 'admin_activity_logs table created successfully!' as status;


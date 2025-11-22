-- Check the structure of users table to see what type the id column is
SELECT 
  column_name,
  data_type,
  udt_name,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name = 'id'
ORDER BY ordinal_position;

-- Check if there are any users with non-UUID IDs
SELECT 
  id,
  username,
  email,
  role,
  CASE 
    WHEN id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 'Valid UUID'
    ELSE 'NOT a UUID'
  END as id_format
FROM users
ORDER BY created_at DESC
LIMIT 10;


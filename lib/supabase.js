// SUPABASE ENABLED - Using Supabase PostgreSQL
// Supabase client for database operations
import { createClient } from '@supabase/supabase-js';
var supabaseUrl = process.env.SUPABASE_URL || 'https://pybsyzbxyliufkgywtpf.supabase.co';
var supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YnN5emJ4eWxpdWZrZ3l3dHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMjYzNDYsImV4cCI6MjA3MTgwMjM0Nn0.NYcOwg-jVmnImiAuAQ2vbEluQ-uT32Fkdbon1pIYAME';
var supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5YnN5emJ4eWxpdWZrZ3l3dHBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjIyNjM0NiwiZXhwIjoyMDcxODAyMzQ2fQ.moMf7dhuip8Tm8tsXdhUyvNYJwV6S2x9xdaHctVVXvE';
console.log('🔧 Supabase: ENABLED - Using Supabase PostgreSQL');
// Create Supabase clients
export var supabase = createClient(supabaseUrl, supabaseAnonKey);
export var supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
// Note: All database operations are handled by Drizzle ORM in server/storage.ts
// These Supabase clients can be used for additional Supabase-specific features like:
// - Real-time subscriptions
// - Storage (file uploads)
// - Edge functions

-- =====================================================
-- FIX CHAT FOREIGN KEY CONSTRAINTS
-- =====================================================
-- This fixes the two foreign keys that are blocking user deletion:
-- 1. chat_conversations.assigned_admin_id (NO ACTION -> SET NULL)
-- 2. chat_messages.sender_id (NO ACTION -> CASCADE)
-- =====================================================

-- Fix 1: chat_conversations.assigned_admin_id
-- When an admin is deleted, just set assigned_admin_id to NULL
ALTER TABLE public.chat_conversations
DROP CONSTRAINT IF EXISTS chat_conversations_assigned_admin_id_fkey;

ALTER TABLE public.chat_conversations
ADD CONSTRAINT chat_conversations_assigned_admin_id_fkey
FOREIGN KEY (assigned_admin_id) 
REFERENCES public.users(id) 
ON DELETE SET NULL;

-- Fix 2: chat_messages.sender_id
-- When a user is deleted, delete their messages too
ALTER TABLE public.chat_messages
DROP CONSTRAINT IF EXISTS chat_messages_sender_id_fkey;

ALTER TABLE public.chat_messages
ADD CONSTRAINT chat_messages_sender_id_fkey
FOREIGN KEY (sender_id) 
REFERENCES public.users(id) 
ON DELETE CASCADE;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Check that the constraints were updated correctly
SELECT
    tc.table_name,
    kcu.column_name,
    rc.delete_rule,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = 'users'
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('chat_conversations', 'chat_messages')
ORDER BY tc.table_name;

-- =====================================================
-- Expected Results:
-- chat_conversations.assigned_admin_id -> SET NULL
-- chat_messages.sender_id -> CASCADE
-- =====================================================


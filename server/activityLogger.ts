import { supabaseAdmin } from '../lib/supabase';
import type { Request } from 'express';
import { db } from './db';
import { adminActivityLogs } from '@shared/schema';

export interface ActivityLogData {
  adminId: string;
  adminUsername: string;
  adminEmail?: string;
  actionType: string;
  actionCategory: string;
  actionDescription: string;
  targetUserId?: string;
  targetUsername?: string;
  targetEmail?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log admin activity to the local database (Drizzle/PostgreSQL)
 */
async function logToLocalDatabase(data: ActivityLogData): Promise<boolean> {
  try {
    if (!db) {
      console.warn('⚠️ Local database not available');
      return false;
    }

    await db.insert(adminActivityLogs).values({
      adminId: data.adminId,
      adminUsername: data.adminUsername,
      adminEmail: data.adminEmail || null,
      actionType: data.actionType,
      actionCategory: data.actionCategory,
      actionDescription: data.actionDescription,
      targetUserId: data.targetUserId || null,
      targetUsername: data.targetUsername || null,
      targetEmail: data.targetEmail || null,
      metadata: data.metadata || {},
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      isDeleted: false,
    });

    console.log('✅ Activity logged to local DB:', {
      admin: data.adminUsername,
      action: data.actionType,
      target: data.targetUsername || 'N/A',
    });
    return true;
  } catch (error) {
    console.error('❌ Failed to log to local database:', error);
    return false;
  }
}

/**
 * Log admin activity to Supabase
 */
async function logToSupabase(data: ActivityLogData): Promise<boolean> {
  try {
    if (!supabaseAdmin) {
      return false;
    }

    const { error } = await supabaseAdmin
      .from('admin_activity_logs')
      .insert({
        admin_id: data.adminId,
        admin_username: data.adminUsername,
        admin_email: data.adminEmail,
        action_type: data.actionType,
        action_category: data.actionCategory,
        action_description: data.actionDescription,
        target_user_id: data.targetUserId,
        target_username: data.targetUsername,
        target_email: data.targetEmail,
        metadata: data.metadata || {},
        ip_address: data.ipAddress,
        user_agent: data.userAgent,
        is_deleted: false,
      });

    if (error) {
      console.error('❌ Supabase activity log error:', error);
      return false;
    }

    console.log('✅ Activity logged to Supabase:', {
      admin: data.adminUsername,
      action: data.actionType,
      target: data.targetUsername || 'N/A',
    });
    return true;
  } catch (error) {
    console.error('❌ Failed to log to Supabase:', error);
    return false;
  }
}

/**
 * Log admin activity to the database
 * This creates an immutable audit trail of all admin actions
 * Tries local DB first, then Supabase as fallback
 */
export async function logAdminActivity(data: ActivityLogData): Promise<void> {
  try {
    // Try local database first (Railway PostgreSQL)
    const localSuccess = await logToLocalDatabase(data);

    // If local DB failed and Supabase is available, try Supabase
    if (!localSuccess && supabaseAdmin) {
      await logToSupabase(data);
    }
  } catch (error) {
    // Log error but don't throw - we don't want logging failures to break the main operation
    console.error('❌ Failed to log activity:', error);
  }
}

/**
 * Extract IP address and user agent from request
 */
export function extractRequestMetadata(req: Request): { ipAddress?: string; userAgent?: string } {
  const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() 
    || req.headers['x-real-ip'] as string
    || req.socket.remoteAddress
    || undefined;
  
  const userAgent = req.headers['user-agent'] || undefined;
  
  return { ipAddress, userAgent };
}

/**
 * Helper to create activity log from request with admin user
 */
export async function logAdminActivityFromRequest(
  req: Request & { user?: any },
  actionType: string,
  actionCategory: string,
  actionDescription: string,
  targetUser?: { id: string; username?: string; email?: string },
  metadata?: Record<string, any>
): Promise<void> {
  const admin = req.user;
  if (!admin) {
    console.warn('⚠️ Cannot log activity: No admin user in request');
    return;
  }

  const { ipAddress, userAgent } = extractRequestMetadata(req);

  await logAdminActivity({
    adminId: admin.id,
    adminUsername: admin.username || admin.email || 'Unknown Admin',
    adminEmail: admin.email,
    actionType,
    actionCategory,
    actionDescription,
    targetUserId: targetUser?.id,
    targetUsername: targetUser?.username,
    targetEmail: targetUser?.email,
    metadata,
    ipAddress,
    userAgent,
  });
}

// Action type constants for consistency
export const ActionTypes = {
  // Trading controls
  TRADING_CONTROL_SET: 'TRADING_CONTROL_SET',
  TRADING_CONTROL_REMOVED: 'TRADING_CONTROL_REMOVED',
  
  // Balance management
  BALANCE_UPDATED: 'BALANCE_UPDATED',
  BALANCE_ADDED: 'BALANCE_ADDED',
  BALANCE_SUBTRACTED: 'BALANCE_SUBTRACTED',
  
  // Verification
  VERIFICATION_APPROVED: 'VERIFICATION_APPROVED',
  VERIFICATION_REJECTED: 'VERIFICATION_REJECTED',
  
  // Transactions
  DEPOSIT_APPROVED: 'DEPOSIT_APPROVED',
  DEPOSIT_REJECTED: 'DEPOSIT_REJECTED',
  WITHDRAWAL_APPROVED: 'WITHDRAWAL_APPROVED',
  WITHDRAWAL_REJECTED: 'WITHDRAWAL_REJECTED',
  
  // User management
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  USER_STATUS_CHANGED: 'USER_STATUS_CHANGED',
  USER_ROLE_CHANGED: 'USER_ROLE_CHANGED',
  USER_PASSWORD_RESET: 'USER_PASSWORD_RESET',
  
  // Chat
  CHAT_MESSAGE_SENT: 'CHAT_MESSAGE_SENT',
  CHAT_CONVERSATION_ASSIGNED: 'CHAT_CONVERSATION_ASSIGNED',
  
  // Redeem codes
  REDEEM_CODE_CREATED: 'REDEEM_CODE_CREATED',
  REDEEM_CODE_UPDATED: 'REDEEM_CODE_UPDATED',
  REDEEM_CODE_DELETED: 'REDEEM_CODE_DELETED',
} as const;

export const ActionCategories = {
  TRADING: 'TRADING',
  BALANCE: 'BALANCE',
  VERIFICATION: 'VERIFICATION',
  TRANSACTIONS: 'TRANSACTIONS',
  USER_MANAGEMENT: 'USER_MANAGEMENT',
  CHAT: 'CHAT',
  REDEEM_CODES: 'REDEEM_CODES',
  SYSTEM: 'SYSTEM',
} as const;


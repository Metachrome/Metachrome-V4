import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    email?: string;
    username?: string;
  };
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Authentication middleware
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
}

// Admin authentication middleware
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Admin privileges required' });
  }

  next();
}

// Super admin authentication middleware
export function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Super admin privileges required' });
  }

  next();
}

// Session-based authentication middleware
export function requireAuth(req: any, res: Response, next: NextFunction) {
  if (!req.session?.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  req.user = req.session.user;
  next();
}

// Session-based admin authentication middleware (also supports JWT)
export function requireSessionAdmin(req: any, res: Response, next: NextFunction) {
  let user = null;

  // First check for JWT token in Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      user = decoded;
    }
  }

  // Fallback to session-based authentication
  if (!user && req.session?.user) {
    user = req.session.user;
  }

  if (!user) {
    return res.status(401).json({ message: 'No token provided' });
  }

  if (user.role !== 'admin' && user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Admin privileges required' });
  }

  req.user = user;
  next();
}

// Session-based super admin authentication middleware (also supports JWT)
export function requireSessionSuperAdmin(req: any, res: Response, next: NextFunction) {
  let user = null;

  // First check for JWT token in Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      user = decoded;
    }
  }

  // Fallback to session-based authentication
  if (!user && req.session?.user) {
    user = req.session.user;
  }

  if (!user) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Accept both 'super_admin' and 'superadmin' roles
  if (user.role !== 'super_admin' && user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Super admin privileges required' });
  }

  req.user = user;
  next();
}

// Role-based permission checker
export function hasPermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    'user': 0,
    'admin': 1,
    'super_admin': 2
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

  return userLevel >= requiredLevel;
}

// Permission middleware factory
export function requirePermission(requiredRole: string) {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!hasPermission(req.session.user.role, requiredRole)) {
      return res.status(403).json({
        message: `${requiredRole.replace('_', ' ')} privileges required`
      });
    }

    req.user = req.session.user;
    next();
  };
}

// Input validation middleware
export function validateInput(schema: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      res.status(400).json({
        message: 'Invalid input data',
        errors: error.errors || error.message
      });
    }
  };
}

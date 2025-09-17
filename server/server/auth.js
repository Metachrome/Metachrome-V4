"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.authenticateToken = authenticateToken;
exports.requireAdmin = requireAdmin;
exports.requireSuperAdmin = requireSuperAdmin;
exports.requireAuth = requireAuth;
exports.requireSessionAdmin = requireSessionAdmin;
exports.requireSessionSuperAdmin = requireSessionSuperAdmin;
exports.hasPermission = hasPermission;
exports.requirePermission = requirePermission;
exports.validateInput = validateInput;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');
// Hash password
async function hashPassword(password) {
    return bcryptjs_1.default.hash(password, BCRYPT_ROUNDS);
}
// Verify password
async function verifyPassword(password, hashedPassword) {
    return bcryptjs_1.default.compare(password, hashedPassword);
}
// Generate JWT token
function generateToken(payload) {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}
// Verify JWT token
function verifyToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
}
// Authentication middleware
function authenticateToken(req, res, next) {
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
function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Admin privileges required' });
    }
    next();
}
// Super admin authentication middleware
function requireSuperAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    if (req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Super admin privileges required' });
    }
    next();
}
// Session-based authentication middleware
function requireAuth(req, res, next) {
    if (!req.session?.user) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    req.user = req.session.user;
    next();
}
// Session-based admin authentication middleware (also supports JWT)
function requireSessionAdmin(req, res, next) {
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
function requireSessionSuperAdmin(req, res, next) {
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
    if (user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Super admin privileges required' });
    }
    req.user = user;
    next();
}
// Role-based permission checker
function hasPermission(userRole, requiredRole) {
    const roleHierarchy = {
        'user': 0,
        'admin': 1,
        'super_admin': 2
    };
    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    return userLevel >= requiredLevel;
}
// Permission middleware factory
function requirePermission(requiredRole) {
    return (req, res, next) => {
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
function validateInput(schema) {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            res.status(400).json({
                message: 'Invalid input data',
                errors: error.errors || error.message
            });
        }
    };
}

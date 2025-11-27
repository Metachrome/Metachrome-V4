"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
var BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');
// Hash password
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, bcryptjs_1.default.hash(password, BCRYPT_ROUNDS)];
        });
    });
}
// Verify password
function verifyPassword(password, hashedPassword) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, bcryptjs_1.default.compare(password, hashedPassword)];
        });
    });
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
    var authHeader = req.headers['authorization'];
    var token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }
    var decoded = verifyToken(token);
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
    var _a;
    if (!((_a = req.session) === null || _a === void 0 ? void 0 : _a.user)) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    req.user = req.session.user;
    next();
}
// Session-based admin authentication middleware (also supports JWT)
function requireSessionAdmin(req, res, next) {
    var _a;
    var user = null;
    // First check for JWT token in Authorization header
    var authHeader = req.headers.authorization;
    var token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (token) {
        var decoded = verifyToken(token);
        if (decoded) {
            user = decoded;
        }
    }
    // Fallback to session-based authentication
    if (!user && ((_a = req.session) === null || _a === void 0 ? void 0 : _a.user)) {
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
    var _a;
    var user = null;
    // First check for JWT token in Authorization header
    var authHeader = req.headers.authorization;
    var token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (token) {
        var decoded = verifyToken(token);
        if (decoded) {
            user = decoded;
        }
    }
    // Fallback to session-based authentication
    if (!user && ((_a = req.session) === null || _a === void 0 ? void 0 : _a.user)) {
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
    var roleHierarchy = {
        'user': 0,
        'admin': 1,
        'super_admin': 2
    };
    var userLevel = roleHierarchy[userRole] || 0;
    var requiredLevel = roleHierarchy[requiredRole] || 0;
    return userLevel >= requiredLevel;
}
// Permission middleware factory
function requirePermission(requiredRole) {
    return function (req, res, next) {
        var _a;
        if (!((_a = req.session) === null || _a === void 0 ? void 0 : _a.user)) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        if (!hasPermission(req.session.user.role, requiredRole)) {
            return res.status(403).json({
                message: "".concat(requiredRole.replace('_', ' '), " privileges required")
            });
        }
        req.user = req.session.user;
        next();
    };
}
// Input validation middleware
function validateInput(schema) {
    return function (req, res, next) {
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

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
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { storage } from './storage';
// Helper function to get callback URL based on environment
function getCallbackURL(provider) {
    if (process.env.NODE_ENV === 'production') {
        // Support multiple production domains
        var domain = process.env.RAILWAY_DOMAIN || process.env.VERCEL_URL || 'www.metachrome.io';
        var protocol = domain.includes('localhost') ? 'http' : 'https';
        return "".concat(protocol, "://").concat(domain, "/api/auth/").concat(provider, "/callback");
    }
    return "http://localhost:5000/api/auth/".concat(provider, "/callback");
}
// Configure Google OAuth
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: getCallbackURL('google')
    }, function (accessToken, refreshToken, profile, done) { return __awaiter(void 0, void 0, void 0, function () {
        var user, error_1;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 5, , 6]);
                    console.log('🔐 Google OAuth callback received:', profile.id);
                    return [4 /*yield*/, storage.getUserByEmail(((_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value) || '')];
                case 1:
                    user = _e.sent();
                    if (!!user) return [3 /*break*/, 3];
                    return [4 /*yield*/, storage.createUser({
                            username: profile.displayName || "google_user_".concat(profile.id),
                            email: ((_d = (_c = profile.emails) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value) || '',
                            role: 'user',
                        })];
                case 2:
                    // Create new user
                    user = _e.sent();
                    console.log('✅ New Google user created:', user.id);
                    return [3 /*break*/, 4];
                case 3:
                    console.log('✅ Existing Google user found:', user.id);
                    _e.label = 4;
                case 4: return [2 /*return*/, done(null, user)];
                case 5:
                    error_1 = _e.sent();
                    console.error('❌ Google OAuth error:', error_1);
                    return [2 /*return*/, done(error_1, undefined)];
                case 6: return [2 /*return*/];
            }
        });
    }); }));
}
// Configure LinkedIn OAuth with OpenID Connect (Custom implementation)
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    passport.use('linkedin', new OAuth2Strategy({
        authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
        clientID: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        callbackURL: getCallbackURL('linkedin'),
        scope: ['openid', 'profile', 'email']
    }, function (accessToken, refreshToken, profile, done) { return __awaiter(void 0, void 0, void 0, function () {
        var response, linkedinProfile, user, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    console.log('🔐 LinkedIn OAuth callback received, fetching profile...');
                    return [4 /*yield*/, fetch('https://api.linkedin.com/v2/userinfo', {
                            headers: {
                                'Authorization': "Bearer ".concat(accessToken),
                                'Content-Type': 'application/json'
                            }
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("LinkedIn API error: ".concat(response.status, " ").concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    linkedinProfile = _a.sent();
                    console.log('✅ LinkedIn profile fetched:', linkedinProfile);
                    return [4 /*yield*/, storage.getUserByEmail(linkedinProfile.email || '')];
                case 3:
                    user = _a.sent();
                    if (!!user) return [3 /*break*/, 5];
                    return [4 /*yield*/, storage.createUser({
                            username: linkedinProfile.name || "linkedin_user_".concat(linkedinProfile.sub),
                            email: linkedinProfile.email || '',
                            firstName: linkedinProfile.given_name || '',
                            lastName: linkedinProfile.family_name || '',
                            role: 'user',
                        })];
                case 4:
                    // Create new user
                    user = _a.sent();
                    console.log('✅ New LinkedIn user created:', user.id);
                    return [3 /*break*/, 6];
                case 5:
                    console.log('✅ Existing LinkedIn user found:', user.id);
                    _a.label = 6;
                case 6: return [2 /*return*/, done(null, user)];
                case 7:
                    error_2 = _a.sent();
                    console.error('❌ LinkedIn OAuth error:', error_2);
                    return [2 /*return*/, done(error_2, undefined)];
                case 8: return [2 /*return*/];
            }
        });
    }); }));
}
// Configure Twitter OAuth
if (process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) {
    passport.use('twitter', new OAuth2Strategy({
        authorizationURL: 'https://twitter.com/i/oauth2/authorize',
        tokenURL: 'https://api.twitter.com/2/oauth2/token',
        clientID: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
        callbackURL: getCallbackURL('twitter'),
        scope: ['tweet.read', 'users.read']
    }, function (accessToken, refreshToken, profile, done) { return __awaiter(void 0, void 0, void 0, function () {
        var response, twitterData, twitterProfile, user, error_3;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 7, , 8]);
                    console.log('🔐 Twitter OAuth callback received, fetching profile...');
                    return [4 /*yield*/, fetch('https://api.twitter.com/2/users/me?user.fields=name,username,profile_image_url', {
                            headers: {
                                'Authorization': "Bearer ".concat(accessToken),
                                'Content-Type': 'application/json'
                            }
                        })];
                case 1:
                    response = _c.sent();
                    if (!response.ok) {
                        throw new Error("Twitter API error: ".concat(response.status, " ").concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    twitterData = _c.sent();
                    twitterProfile = twitterData.data;
                    console.log('✅ Twitter profile fetched:', twitterProfile);
                    return [4 /*yield*/, storage.getUserByEmail("".concat(twitterProfile.username, "@twitter.local"))];
                case 3:
                    user = _c.sent();
                    if (!!user) return [3 /*break*/, 5];
                    return [4 /*yield*/, storage.createUser({
                            username: twitterProfile.username || "twitter_user_".concat(twitterProfile.id),
                            email: "".concat(twitterProfile.username, "@twitter.local"), // Twitter doesn't provide email by default
                            firstName: ((_a = twitterProfile.name) === null || _a === void 0 ? void 0 : _a.split(' ')[0]) || '',
                            lastName: ((_b = twitterProfile.name) === null || _b === void 0 ? void 0 : _b.split(' ').slice(1).join(' ')) || '',
                            role: 'user',
                        })];
                case 4:
                    // Create new user
                    user = _c.sent();
                    console.log('✅ New Twitter user created:', user.id);
                    return [3 /*break*/, 6];
                case 5:
                    console.log('✅ Existing Twitter user found:', user.id);
                    _c.label = 6;
                case 6: return [2 /*return*/, done(null, user)];
                case 7:
                    error_3 = _c.sent();
                    console.error('❌ Twitter OAuth error:', error_3);
                    return [2 /*return*/, done(error_3, undefined)];
                case 8: return [2 /*return*/];
            }
        });
    }); }));
}
// Configure Apple OAuth (simplified for development - can be enhanced with proper Apple OAuth setup)
if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID) {
    // Apple OAuth implementation would require a more complex setup with private keys and JWT signing
    // For now, we'll create a placeholder that can be enhanced when proper Apple credentials are available
    console.log('Apple OAuth configuration detected but not fully implemented yet');
}
// Serialize/deserialize user for sessions
passport.serializeUser(function (user, done) {
    done(null, user.id);
});
passport.deserializeUser(function (id, done) { return __awaiter(void 0, void 0, void 0, function () {
    var user, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, storage.getUser(id)];
            case 1:
                user = _a.sent();
                done(null, user);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                done(error_4, null);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
export function setupOAuth(app) {
    // Trust proxy for Replit deployment
    app.set('trust proxy', 1);
    // Setup session middleware for OAuth
    var PostgreSqlStore = connectPg(session);
    app.use(session({
        store: new PostgreSqlStore({
            conString: process.env.DATABASE_URL,
            createTableIfMissing: false,
        }),
        secret: process.env.SESSION_SECRET || 'metachrome-dev-secret-2024',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: true, // Required for HTTPS (Replit uses HTTPS)
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: 'lax' // Allow cross-site requests for OAuth
        }
    }));
    // Initialize passport
    app.use(passport.initialize());
    app.use(passport.session());
    // Google OAuth routes
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
        app.get('/api/auth/google/callback', passport.authenticate('google', {
            failureRedirect: '/login?error=google_auth_failed',
            failureMessage: true
        }), function (req, res) {
            try {
                // Store user in session with hasPassword field
                var user = req.user;
                req.session.user = {
                    id: user.id,
                    username: user.username || undefined,
                    email: user.email || undefined,
                    role: user.role || 'user',
                    walletAddress: user.walletAddress || undefined,
                    hasPassword: !!user.password,
                };
                console.log('✅ Google login successful, user:', req.user);
                console.log('✅ Redirecting to dashboard');
                res.redirect('/dashboard');
            }
            catch (error) {
                console.error('❌ Error in Google callback:', error);
                res.redirect('/login?error=callback_error');
            }
        });
    }
    // LinkedIn OAuth routes
    if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
        app.get('/api/auth/linkedin', passport.authenticate('linkedin', { scope: ['openid', 'profile', 'email'] }));
        app.get('/api/auth/linkedin/callback', passport.authenticate('linkedin', {
            failureRedirect: '/login?error=linkedin_auth_failed',
            failureMessage: true
        }), function (req, res) {
            try {
                // Store user in session with hasPassword field
                var user = req.user;
                req.session.user = {
                    id: user.id,
                    username: user.username || undefined,
                    email: user.email || undefined,
                    role: user.role || 'user',
                    walletAddress: user.walletAddress || undefined,
                    hasPassword: !!user.password,
                };
                console.log('✅ LinkedIn login successful, user:', req.user);
                console.log('✅ Redirecting to dashboard');
                res.redirect('/dashboard');
            }
            catch (error) {
                console.error('❌ Error in LinkedIn callback:', error);
                res.redirect('/login?error=callback_error');
            }
        });
    }
    else {
        app.get('/api/auth/linkedin', function (req, res) {
            res.status(501).json({
                message: 'LinkedIn OAuth not configured. Please set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET environment variables.'
            });
        });
    }
    // Twitter OAuth routes
    if (process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) {
        app.get('/api/auth/twitter', passport.authenticate('twitter', { scope: ['tweet.read', 'users.read'] }));
        app.get('/api/auth/twitter/callback', passport.authenticate('twitter', {
            failureRedirect: '/login?error=twitter_auth_failed',
            failureMessage: true
        }), function (req, res) {
            try {
                // Store user in session with hasPassword field
                var user = req.user;
                req.session.user = {
                    id: user.id,
                    username: user.username || undefined,
                    email: user.email || undefined,
                    role: user.role || 'user',
                    walletAddress: user.walletAddress || undefined,
                    hasPassword: !!user.password,
                };
                console.log('✅ Twitter login successful, user:', req.user);
                console.log('✅ Redirecting to dashboard');
                res.redirect('/dashboard');
            }
            catch (error) {
                console.error('❌ Error in Twitter callback:', error);
                res.redirect('/login?error=callback_error');
            }
        });
    }
    else {
        app.get('/api/auth/twitter', function (req, res) {
            res.status(501).json({
                message: 'Twitter OAuth not configured. Please set TWITTER_CLIENT_ID and TWITTER_CLIENT_SECRET environment variables.'
            });
        });
    }
    // Apple OAuth routes (placeholder for future implementation)
    app.get('/api/auth/apple', function (req, res) {
        res.status(501).json({
            message: 'Apple OAuth coming soon. Apple OAuth requires complex setup with private keys and JWT signing. For now, please use Google, LinkedIn, or email authentication.'
        });
    });
}

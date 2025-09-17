"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupOAuth = setupOAuth;
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_oauth2_1 = require("passport-oauth2");
const express_session_1 = __importDefault(require("express-session"));
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
const storage_1 = require("./storage");
// Configure Google OAuth
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.NODE_ENV === 'production'
            ? `https://${process.env.VERCEL_URL || 'metachrome-v2.vercel.app'}/api/auth/google/callback`
            : `http://localhost:5000/api/auth/google/callback`
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log('🔐 Google OAuth callback received:', profile.id);
            // Check if user exists
            let user = await storage_1.storage.getUserByEmail(profile.emails?.[0]?.value || '');
            if (!user) {
                // Create new user
                user = await storage_1.storage.createUser({
                    username: profile.displayName || `google_user_${profile.id}`,
                    email: profile.emails?.[0]?.value || '',
                    role: 'user',
                });
                console.log('✅ New Google user created:', user.id);
            }
            else {
                console.log('✅ Existing Google user found:', user.id);
            }
            return done(null, user);
        }
        catch (error) {
            console.error('❌ Google OAuth error:', error);
            return done(error, undefined);
        }
    }));
}
// Configure LinkedIn OAuth with OpenID Connect (Custom implementation)
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    passport_1.default.use('linkedin', new passport_oauth2_1.Strategy({
        authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
        clientID: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        callbackURL: process.env.NODE_ENV === 'production'
            ? `https://${process.env.VERCEL_URL || 'metachrome-v2.vercel.app'}/api/auth/linkedin/callback`
            : `http://localhost:5000/api/auth/linkedin/callback`,
        scope: ['openid', 'profile', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log('🔐 LinkedIn OAuth callback received, fetching profile...');
            // Fetch user profile using OpenID Connect userinfo endpoint
            const response = await fetch('https://api.linkedin.com/v2/userinfo', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`);
            }
            const linkedinProfile = await response.json();
            console.log('✅ LinkedIn profile fetched:', linkedinProfile);
            // Check if user exists
            let user = await storage_1.storage.getUserByEmail(linkedinProfile.email || '');
            if (!user) {
                // Create new user
                user = await storage_1.storage.createUser({
                    username: linkedinProfile.name || `linkedin_user_${linkedinProfile.sub}`,
                    email: linkedinProfile.email || '',
                    firstName: linkedinProfile.given_name || '',
                    lastName: linkedinProfile.family_name || '',
                    role: 'user',
                });
                console.log('✅ New LinkedIn user created:', user.id);
            }
            else {
                console.log('✅ Existing LinkedIn user found:', user.id);
            }
            return done(null, user);
        }
        catch (error) {
            console.error('❌ LinkedIn OAuth error:', error);
            return done(error, undefined);
        }
    }));
}
// Configure Twitter OAuth
if (process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) {
    passport_1.default.use('twitter', new passport_oauth2_1.Strategy({
        authorizationURL: 'https://twitter.com/i/oauth2/authorize',
        tokenURL: 'https://api.twitter.com/2/oauth2/token',
        clientID: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
        callbackURL: process.env.NODE_ENV === 'production'
            ? `https://${process.env.VERCEL_URL || 'metachrome-v2.vercel.app'}/api/auth/twitter/callback`
            : `http://localhost:5000/api/auth/twitter/callback`,
        scope: ['tweet.read', 'users.read']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log('🔐 Twitter OAuth callback received, fetching profile...');
            // Fetch user profile using Twitter API v2
            const response = await fetch('https://api.twitter.com/2/users/me?user.fields=name,username,profile_image_url', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
            }
            const twitterData = await response.json();
            const twitterProfile = twitterData.data;
            console.log('✅ Twitter profile fetched:', twitterProfile);
            // Check if user exists
            let user = await storage_1.storage.getUserByEmail(`${twitterProfile.username}@twitter.local`);
            if (!user) {
                // Create new user
                user = await storage_1.storage.createUser({
                    username: twitterProfile.username || `twitter_user_${twitterProfile.id}`,
                    email: `${twitterProfile.username}@twitter.local`, // Twitter doesn't provide email by default
                    firstName: twitterProfile.name?.split(' ')[0] || '',
                    lastName: twitterProfile.name?.split(' ').slice(1).join(' ') || '',
                    role: 'user',
                });
                console.log('✅ New Twitter user created:', user.id);
            }
            else {
                console.log('✅ Existing Twitter user found:', user.id);
            }
            return done(null, user);
        }
        catch (error) {
            console.error('❌ Twitter OAuth error:', error);
            return done(error, undefined);
        }
    }));
}
// Configure Apple OAuth (simplified for development - can be enhanced with proper Apple OAuth setup)
if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID) {
    // Apple OAuth implementation would require a more complex setup with private keys and JWT signing
    // For now, we'll create a placeholder that can be enhanced when proper Apple credentials are available
    console.log('Apple OAuth configuration detected but not fully implemented yet');
}
// Serialize/deserialize user for sessions
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await storage_1.storage.getUser(id);
        done(null, user);
    }
    catch (error) {
        done(error, null);
    }
});
function setupOAuth(app) {
    // Trust proxy for Replit deployment
    app.set('trust proxy', 1);
    // Setup session middleware for OAuth
    const PostgreSqlStore = (0, connect_pg_simple_1.default)(express_session_1.default);
    app.use((0, express_session_1.default)({
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
    app.use(passport_1.default.initialize());
    app.use(passport_1.default.session());
    // Google OAuth routes
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        app.get('/api/auth/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
        app.get('/api/auth/google/callback', passport_1.default.authenticate('google', {
            failureRedirect: '/login?error=google_auth_failed',
            failureMessage: true
        }), (req, res) => {
            try {
                // Store user in session
                req.session.user = req.user;
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
        app.get('/api/auth/linkedin', passport_1.default.authenticate('linkedin', { scope: ['openid', 'profile', 'email'] }));
        app.get('/api/auth/linkedin/callback', passport_1.default.authenticate('linkedin', {
            failureRedirect: '/login?error=linkedin_auth_failed',
            failureMessage: true
        }), (req, res) => {
            try {
                // Store user in session
                req.session.user = req.user;
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
        app.get('/api/auth/linkedin', (req, res) => {
            res.status(501).json({
                message: 'LinkedIn OAuth not configured. Please set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET environment variables.'
            });
        });
    }
    // Twitter OAuth routes
    if (process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET) {
        app.get('/api/auth/twitter', passport_1.default.authenticate('twitter', { scope: ['tweet.read', 'users.read'] }));
        app.get('/api/auth/twitter/callback', passport_1.default.authenticate('twitter', {
            failureRedirect: '/login?error=twitter_auth_failed',
            failureMessage: true
        }), (req, res) => {
            try {
                // Store user in session
                req.session.user = req.user;
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
        app.get('/api/auth/twitter', (req, res) => {
            res.status(501).json({
                message: 'Twitter OAuth not configured. Please set TWITTER_CLIENT_ID and TWITTER_CLIENT_SECRET environment variables.'
            });
        });
    }
    // Apple OAuth routes (placeholder for future implementation)
    app.get('/api/auth/apple', (req, res) => {
        res.status(501).json({
            message: 'Apple OAuth coming soon. Apple OAuth requires complex setup with private keys and JWT signing. For now, please use Google, LinkedIn, or email authentication.'
        });
    });
}

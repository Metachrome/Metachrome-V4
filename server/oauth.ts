import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import { Strategy as AppleStrategy } from 'passport-apple';
import type { Express } from 'express';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { storage } from './storage';

// Configure Google OAuth
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `https://${process.env.REPLIT_DOMAINS || 'localhost:5000'}/api/auth/google/callback`
  },
  async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      console.log('🔐 Google OAuth callback received:', profile.id);
      
      // Check if user exists
      let user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          username: profile.displayName || `google_user_${profile.id}`,
          email: profile.emails?.[0]?.value || '',
          role: 'user',
        });
        console.log('✅ New Google user created:', user.id);
      } else {
        console.log('✅ Existing Google user found:', user.id);
      }
      
      return done(null, user);
    } catch (error) {
      console.error('❌ Google OAuth error:', error);
      return done(error as Error, undefined);
    }
  }));
}

// Configure LinkedIn OAuth with OpenID Connect (Custom implementation)
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  passport.use('linkedin', new OAuth2Strategy({
    authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: `https://${process.env.REPLIT_DOMAINS || 'localhost:5000'}/api/auth/linkedin/callback`,
    scope: ['openid', 'profile', 'email']
  },
  async (accessToken: string, refreshToken: string, profile: any, done: any) => {
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
      let user = await storage.getUserByEmail(linkedinProfile.email || '');
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          username: linkedinProfile.name || `linkedin_user_${linkedinProfile.sub}`,
          email: linkedinProfile.email || '',
          firstName: linkedinProfile.given_name || '',
          lastName: linkedinProfile.family_name || '',
          role: 'user',
        });
        console.log('✅ New LinkedIn user created:', user.id);
      } else {
        console.log('✅ Existing LinkedIn user found:', user.id);
      }
      
      return done(null, user);
    } catch (error) {
      console.error('❌ LinkedIn OAuth error:', error);
      return done(error as Error, undefined);
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
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export function setupOAuth(app: Express) {
  // Trust proxy for Replit deployment
  app.set('trust proxy', 1);
  
  // Setup session middleware for OAuth
  const PostgreSqlStore = connectPg(session);
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
    app.get('/api/auth/google',
      passport.authenticate('google', { scope: ['profile', 'email'] })
    );

    app.get('/api/auth/google/callback',
      passport.authenticate('google', { 
        failureRedirect: '/login?error=google_auth_failed',
        failureMessage: true
      }),
      (req, res) => {
        try {
          // Store user in session
          req.session.user = req.user as any;
          console.log('✅ Google login successful, user:', req.user);
          console.log('✅ Redirecting to dashboard');
          res.redirect('/dashboard');
        } catch (error) {
          console.error('❌ Error in Google callback:', error);
          res.redirect('/login?error=callback_error');
        }
      }
    );
  }

  // LinkedIn OAuth routes
  if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
    app.get('/api/auth/linkedin',
      passport.authenticate('linkedin', { scope: ['openid', 'profile', 'email'] })
    );

    app.get('/api/auth/linkedin/callback',
      passport.authenticate('linkedin', { 
        failureRedirect: '/login?error=linkedin_auth_failed',
        failureMessage: true
      }),
      (req, res) => {
        try {
          // Store user in session
          req.session.user = req.user as any;
          console.log('✅ LinkedIn login successful, user:', req.user);
          console.log('✅ Redirecting to dashboard');
          res.redirect('/dashboard');
        } catch (error) {
          console.error('❌ Error in LinkedIn callback:', error);
          res.redirect('/login?error=callback_error');
        }
      }
    );
  } else {
    app.get('/api/auth/linkedin', (req, res) => {
      res.status(501).json({ 
        message: 'LinkedIn OAuth not configured. Please set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET environment variables.' 
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
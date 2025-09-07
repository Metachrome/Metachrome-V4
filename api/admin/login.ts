import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`🔐 Admin Login API: ${req.method} ${req.url}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'POST') {
      console.log('❌ Method not allowed:', req.method);
      return res.status(405).json({ 
        success: false,
        message: "Method not allowed" 
      });
    }

    const { username, password } = req.body || {};
    console.log('🔐 Admin login attempt:', { 
      username, 
      password: password ? '***' : 'missing',
      bodyExists: !!req.body,
      bodyKeys: req.body ? Object.keys(req.body) : []
    });

    if (!username || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ 
        success: false, 
        message: "Username and password are required" 
      });
    }

    // Check for valid admin credentials
    if ((username === 'admin' && password === 'admin123') ||
        (username === 'superadmin' && password === 'superadmin123')) {
      
      const role = username === 'superadmin' ? 'super_admin' : 'admin';
      const user = {
        id: `${username}-001`,
        username,
        email: `${username}@metachrome.com`,
        role,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      };

      const token = `mock-jwt-token-${Date.now()}`;
      
      console.log('✅ Admin login successful:', { username, role });
      
      return res.json({
        success: true,
        token,
        user,
        message: `Welcome back, ${username}!`
      });
    } else {
      console.log('❌ Invalid admin credentials:', username);
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials"
      });
    }

  } catch (error) {
    console.error('❌ Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: "Admin login failed",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

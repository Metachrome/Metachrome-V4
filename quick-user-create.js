const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
  connectionString: 'postgresql://postgres:bBFdAzePWLqsrYyX@junction.proxy.rlwy.net:47738/railway'
});

async function createTestUser() {
  try {
    await client.connect();

    const walletAddress = '0x53dadcdfc372c98c43ab3b2c6238616650d19f58';
    const password = 'password123';

    console.log('🔍 Creating test user with wallet:', walletAddress);

    // Check if user already exists
    const existingUser = await client.query('SELECT * FROM users WHERE username = $1 OR wallet_address = $1', [walletAddress]);

    if (existingUser.rows.length > 0) {
      console.log('✅ User already exists, updating password...');
      const hashedPassword = await bcrypt.hash(password, 10);
      await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, existingUser.rows[0].id]);
      console.log('✅ Password updated');
    } else {
      console.log('Creating new user...');
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const result = await client.query(`
        INSERT INTO users (
          id, username, email, password_hash, balance, role, status,
          trading_mode, wallet_address, verification_status, created_at, last_login
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `, [
        `wallet-${Date.now()}`,
        walletAddress,
        walletAddress + '@wallet.local',
        hashedPassword,
        5000,
        'user',
        'active',
        'normal',
        walletAddress,
        'verified',
        new Date().toISOString(),
        new Date().toISOString()
      ]);

      console.log('✅ User created successfully:', result.rows[0].username);
    }

    console.log('🎯 LOGIN CREDENTIALS:');
    console.log('Username/Wallet:', walletAddress);
    console.log('Password:', password);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createTestUser();

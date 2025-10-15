const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
  connectionString: 'postgresql://postgres:bBFdAzePWLqsrYyX@junction.proxy.rlwy.net:47738/railway'
});

async function createWalletUser() {
  try {
    await client.connect();
    console.log('🔍 Creating wallet user...');

    const walletAddress = '0x53dadcdfc372c9843ab3b2c6238616650f19f58';
    const password = 'password123';

    // Check if user already exists
    const existingUser = await client.query('SELECT * FROM users WHERE username = $1 OR wallet_address = $1', [walletAddress]);

    if (existingUser.rows.length > 0) {
      console.log('✅ User already exists:', existingUser.rows[0].username);

      // Update password if needed
      const hashedPassword = await bcrypt.hash(password, 10);
      await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, existingUser.rows[0].id]);
      console.log('✅ Password updated for existing user');

    } else {
      console.log('Creating new user...');
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = 'wallet-' + Date.now();

      const result = await client.query('INSERT INTO users (id, username, email, password_hash, balance, role, status, trading_mode, wallet_address, verification_status, created_at, last_login) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *', [
        userId,
        walletAddress,
        walletAddress + '@wallet.local',
        hashedPassword,
        1000,
        'user',
        'active',
        'normal',
        walletAddress,
        'unverified',
        new Date().toISOString(),
        new Date().toISOString()
      ]);

      console.log('✅ New wallet user created:', result.rows[0].username);
    }

    console.log('🎯 LOGIN CREDENTIALS:');
    console.log('Username/Wallet:', walletAddress);
    console.log('Password:', password);

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await client.end();
  }
}

createWalletUser();

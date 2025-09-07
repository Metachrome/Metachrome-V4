import bcrypt from 'bcryptjs';

async function generateHashes() {
  console.log('🔧 Generating proper password hashes for demo mode...');
  
  const adminHash = await bcrypt.hash('admin123', 10);
  const superadminHash = await bcrypt.hash('superadmin123', 10);
  
  console.log('✅ Password hashes generated:');
  console.log('');
  console.log('admin123 hash:', adminHash);
  console.log('superadmin123 hash:', superadminHash);
  console.log('');
  console.log('🔑 Demo Credentials:');
  console.log('Username: admin, Password: admin123');
  console.log('Username: superadmin, Password: superadmin123');
}

generateHashes();

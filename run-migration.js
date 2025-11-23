import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Railway PostgreSQL Migration Helper\n');
console.log('📋 Instructions:');
console.log('1. Open Railway Dashboard → metachrome-db → Variables tab');
console.log('2. Copy the DATABASE_URL value');
console.log('3. Paste it below\n');

rl.question('Enter DATABASE_URL: ', (databaseUrl) => {
  if (!databaseUrl || databaseUrl.trim() === '') {
    console.error('❌ DATABASE_URL cannot be empty');
    rl.close();
    process.exit(1);
  }

  // Validate URL format
  if (!databaseUrl.startsWith('postgresql://')) {
    console.error('❌ Invalid DATABASE_URL format. Must start with postgresql://');
    rl.close();
    process.exit(1);
  }

  console.log('\n✅ DATABASE_URL set successfully!\n');
  
  // Set environment variable
  process.env.DATABASE_URL = databaseUrl.trim();

  console.log('🔄 Running migration steps...\n');

  try {
    // Step 1: Drop existing tables
    console.log('📋 Step 1: Dropping existing tables...');
    execSync('node drop-tables.js', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: databaseUrl.trim() }
    });

    // Step 2: Create tables
    console.log('\n📋 Step 2: Creating tables...');
    execSync('node setup-railway-postgres.js', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: databaseUrl.trim() }
    });

    // Step 3: Import data
    console.log('\n📋 Step 3: Importing data...');
    execSync('node import-data-to-railway.js supabase-export-1763882086572.json', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: databaseUrl.trim() }
    });

    // Step 4: Setup wallet addresses
    console.log('\n📋 Step 4: Setting up wallet addresses...');
    execSync('node setup-wallet-addresses.js', { 
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: databaseUrl.trim() }
    });

    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Next steps:');
    console.log('1. Update Railway app environment variables');
    console.log('2. Remove Supabase variables');
    console.log('3. Add DATABASE_URL reference to metachrome-db');
    console.log('4. Deploy and test');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
});


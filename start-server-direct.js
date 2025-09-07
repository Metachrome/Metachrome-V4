// Direct server starter to bypass npm script issues
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Starting server directly...');

// Set environment variables
process.env.NODE_ENV = 'production';
process.env.PORT = '4000';

console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT);

// Start the server directly
const serverPath = path.join(__dirname, 'server', 'index.ts');
console.log('Server path:', serverPath);

const child = spawn('npx', ['tsx', serverPath], {
  stdio: 'inherit',
  env: process.env,
  cwd: __dirname
});

child.on('error', (error) => {
  console.error('Failed to start server:', error);
});

child.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
});

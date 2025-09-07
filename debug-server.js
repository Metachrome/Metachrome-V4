// Debug server to test static file serving
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5001; // Use different port to avoid conflicts

// Debug: Check if files exist
const distPath = path.resolve(__dirname, 'dist', 'public');
console.log('Static files directory:', distPath);
console.log('Directory exists:', fs.existsSync(distPath));

if (fs.existsSync(distPath)) {
  const files = fs.readdirSync(distPath);
  console.log('Files in directory:', files);
  
  const assetsPath = path.join(distPath, 'assets');
  if (fs.existsSync(assetsPath)) {
    const assetFiles = fs.readdirSync(assetsPath);
    console.log('Asset files:', assetFiles);
  }
}

// Serve static files
app.use(express.static(distPath));

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Fallback to index.html
app.use('*', (req, res) => {
  console.log('Serving index.html for:', req.originalUrl);
  const indexPath = path.resolve(distPath, 'index.html');
  console.log('Index file path:', indexPath);
  console.log('Index file exists:', fs.existsSync(indexPath));
  res.sendFile(indexPath);
});

app.listen(port, '127.0.0.1', () => {
  console.log(`Debug server running on http://127.0.0.1:${port}`);
  console.log('Try accessing:');
  console.log(`  - http://127.0.0.1:${port}/`);
  console.log(`  - http://127.0.0.1:${port}/assets/index-B_rC7yha.css`);
  console.log(`  - http://127.0.0.1:${port}/assets/index-D6JHGSUG.js`);
});

console.log('Starting simple server...');

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3007;

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  if (req.url === '/') {
    const indexPath = path.join(__dirname, 'dist', 'public', 'index.html');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>Index file not found</h1>');
    }
  } else {
    // Serve static files
    const filePath = path.join(__dirname, 'dist', 'public', req.url);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath);
      res.writeHead(200);
      res.end(content);
    } else {
      res.writeHead(404);
      res.end('File not found');
    }
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Simple server running on http://localhost:${PORT}`);
});

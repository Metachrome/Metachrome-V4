const http = require('http');

const data = JSON.stringify({});

const options = {
  hostname: '127.0.0.1',
  port: 3001,
  path: '/api/auth',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer user-token-1234567890'
  }
};

console.log('Testing GET /api/auth endpoint...');
console.log('URL:', `http://${options.hostname}:${options.port}${options.path}`);
console.log('Headers:', options.headers);

const req = http.request(options, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);

  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log('Response:', responseData);
    try {
      const parsed = JSON.parse(responseData);
      console.log('Parsed response:', parsed);
    } catch (e) {
      console.log('Could not parse JSON response');
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.end();

const http = require('http');

const data = JSON.stringify({
  newPassword: 'password123'
});

const options = {
  hostname: '127.0.0.1',
  port: 3001,
  path: '/api/admin/users/user-angela/password',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer admin-token-123'
  }
};

console.log('Testing password update endpoint...');
console.log('URL:', `http://${options.hostname}:${options.port}${options.path}`);
console.log('Data:', data);

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

req.write(data);
req.end();

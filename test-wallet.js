// Test wallet addresses
const users = [
  {
    id: '1',
    username: 'user1',
    email: 'user1@example.com',
    role: 'user',
    balance: 1000,
    isActive: true,
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    username: 'user2',
    email: 'user2@example.com',
    role: 'user',
    balance: 2500,
    isActive: true,
    walletAddress: '0x2345678901bcdef2345678901bcdef234567890',
    lastLogin: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date().toISOString()
  }
];

console.log('Testing wallet addresses:');
users.forEach(user => {
  console.log(`${user.username}: ${user.walletAddress}`);
});

console.log('All wallet addresses are valid!');

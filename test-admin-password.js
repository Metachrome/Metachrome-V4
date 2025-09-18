const bcrypt = require('bcryptjs');

// Test the superadmin password hash
const storedHash = '$2a$10$tzXg/z.lQ0BRVQ/zI6pFEuZkgdFfR9Yu0Mx05/8DZC11w6dO/ksDe';
const testPassword = 'superadmin123';

console.log('🔐 Testing superadmin password...');
console.log('Stored hash:', storedHash);
console.log('Test password:', testPassword);

bcrypt.compare(testPassword, storedHash).then(result => {
    console.log('Password match result:', result);
    if (result) {
        console.log('✅ Password is correct!');
    } else {
        console.log('❌ Password does not match!');
        console.log('Generating new hash for superadmin123...');
        
        bcrypt.hash(testPassword, 10).then(newHash => {
            console.log('New hash:', newHash);
            console.log('You should update the users-data.json file with this new hash.');
        });
    }
}).catch(error => {
    console.error('Error testing password:', error);
});

import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';

interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  role: string;
  status: string;
  trading_mode: 'win' | 'normal' | 'lose';
  wallet_address?: string;
}

export default function SuperAdminTestPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [testResults, setTestResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Test inputs
  const [depositAmount, setDepositAmount] = useState('100');
  const [withdrawalAmount, setWithdrawalAmount] = useState('50');
  const [newPassword, setNewPassword] = useState('testpassword123');
  const [newWalletAddress, setNewWalletAddress] = useState('0x1234567890abcdef1234567890abcdef12345678');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const userData = await response.json();
        setUsers(userData);
        if (userData.length > 0 && !selectedUserId) {
          setSelectedUserId(userData[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const logResult = (testName: string, result: string, success: boolean) => {
    const timestamp = new Date().toLocaleTimeString();
    const status = success ? '✅' : '❌';
    const logEntry = `${timestamp} ${status} ${result}`;
    
    setTestResults(prev => ({
      ...prev,
      [testName]: logEntry
    }));

    toast({
      title: success ? "Test Passed" : "Test Failed",
      description: `${testName}: ${result}`,
      variant: success ? "default" : "destructive"
    });
  };

  const testTradingModeControl = async (mode: 'win' | 'normal' | 'lose') => {
    if (!selectedUserId) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/admin/trading-controls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId, controlType: mode })
      });

      if (response.ok) {
        const result = await response.json();
        logResult(`Trading Mode ${mode.toUpperCase()}`, result.message, true);
        await fetchUsers(); // Refresh to see changes
      } else {
        const error = await response.text();
        logResult(`Trading Mode ${mode.toUpperCase()}`, `Failed: ${error}`, false);
      }
    } catch (error) {
      logResult(`Trading Mode ${mode.toUpperCase()}`, `Error: ${error}`, false);
    } finally {
      setLoading(false);
    }
  };

  const testDeposit = async () => {
    if (!selectedUserId || !depositAmount) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/superadmin/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId,
          amount: Number(depositAmount),
          note: 'Test deposit from SuperAdmin test page'
        })
      });

      if (response.ok) {
        const result = await response.json();
        logResult('Deposit', result.message, true);
        await fetchUsers(); // Refresh to see balance change
      } else {
        const error = await response.text();
        logResult('Deposit', `Failed: ${error}`, false);
      }
    } catch (error) {
      logResult('Deposit', `Error: ${error}`, false);
    } finally {
      setLoading(false);
    }
  };

  const testWithdrawal = async () => {
    if (!selectedUserId || !withdrawalAmount) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/superadmin/withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId,
          amount: Number(withdrawalAmount),
          note: 'Test withdrawal from SuperAdmin test page'
        })
      });

      if (response.ok) {
        const result = await response.json();
        logResult('Withdrawal', result.message, true);
        await fetchUsers(); // Refresh to see balance change
      } else {
        const error = await response.text();
        logResult('Withdrawal', `Failed: ${error}`, false);
      }
    } catch (error) {
      logResult('Withdrawal', `Error: ${error}`, false);
    } finally {
      setLoading(false);
    }
  };

  const testPasswordChange = async () => {
    if (!selectedUserId || !newPassword) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/superadmin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId,
          newPassword: newPassword
        })
      });

      if (response.ok) {
        const result = await response.json();
        logResult('Password Change', result.message, true);
      } else {
        const error = await response.text();
        logResult('Password Change', `Failed: ${error}`, false);
      }
    } catch (error) {
      logResult('Password Change', `Error: ${error}`, false);
    } finally {
      setLoading(false);
    }
  };

  const testWalletUpdate = async () => {
    if (!selectedUserId || !newWalletAddress) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/superadmin/update-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId,
          walletAddress: newWalletAddress
        })
      });

      if (response.ok) {
        const result = await response.json();
        logResult('Wallet Update', result.message, true);
        await fetchUsers(); // Refresh to see wallet change
      } else {
        const error = await response.text();
        logResult('Wallet Update', `Failed: ${error}`, false);
      }
    } catch (error) {
      logResult('Wallet Update', `Error: ${error}`, false);
    } finally {
      setLoading(false);
    }
  };

  const testUserEdit = async () => {
    if (!selectedUserId) return;
    
    const selectedUser = users.find(u => u.id === selectedUserId);
    if (!selectedUser) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${selectedUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: selectedUser.username,
          email: selectedUser.email,
          balance: selectedUser.balance,
          role: selectedUser.role,
          status: 'active',
          trading_mode: selectedUser.trading_mode
        })
      });

      if (response.ok) {
        logResult('User Edit', 'User updated successfully', true);
        await fetchUsers(); // Refresh to see changes
      } else {
        const error = await response.text();
        logResult('User Edit', `Failed: ${error}`, false);
      }
    } catch (error) {
      logResult('User Edit', `Error: ${error}`, false);
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "Please select a user first",
        variant: "destructive"
      });
      return;
    }

    setTestResults({});
    
    // Run all tests sequentially
    await testTradingModeControl('win');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testTradingModeControl('lose');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testTradingModeControl('normal');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testDeposit();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testWithdrawal();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testPasswordChange();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testWalletUpdate();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testUserEdit();
  };

  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">🧪 SuperAdmin Feature Test Page</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Selection */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">👤 Select Test User</CardTitle>
            </CardHeader>
            <CardContent>
              <select 
                value={selectedUserId} 
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600"
              >
                <option value="">Select a user...</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username} - ${user.balance} - {user.trading_mode}
                  </option>
                ))}
              </select>
              
              {selectedUser && (
                <div className="mt-4 p-3 bg-gray-700 rounded">
                  <p className="text-white"><strong>Username:</strong> {selectedUser.username}</p>
                  <p className="text-white"><strong>Balance:</strong> ${selectedUser.balance}</p>
                  <p className="text-white"><strong>Trading Mode:</strong> {selectedUser.trading_mode}</p>
                  <p className="text-white"><strong>Status:</strong> {selectedUser.status}</p>
                  <p className="text-white"><strong>Wallet:</strong> {selectedUser.wallet_address || 'Not set'}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Controls */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">🎛️ Test Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Deposit Amount</label>
                <Input 
                  value={depositAmount} 
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">Withdrawal Amount</label>
                <Input 
                  value={withdrawalAmount} 
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">New Password</label>
                <Input 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm">New Wallet Address</label>
                <Input 
                  value={newWalletAddress} 
                  onChange={(e) => setNewWalletAddress(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Individual Tests */}
        <Card className="bg-gray-800 border-gray-700 mt-6">
          <CardHeader>
            <CardTitle className="text-white">🧪 Individual Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button onClick={() => testTradingModeControl('win')} disabled={loading} className="bg-green-600 hover:bg-green-700">
                🎯 Test WIN Mode
              </Button>
              <Button onClick={() => testTradingModeControl('lose')} disabled={loading} className="bg-red-600 hover:bg-red-700">
                🎯 Test LOSE Mode
              </Button>
              <Button onClick={() => testTradingModeControl('normal')} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                🎯 Test NORMAL Mode
              </Button>
              <Button onClick={testDeposit} disabled={loading} className="bg-green-600 hover:bg-green-700">
                💰 Test Deposit
              </Button>
              <Button onClick={testWithdrawal} disabled={loading} className="bg-red-600 hover:bg-red-700">
                💸 Test Withdrawal
              </Button>
              <Button onClick={testPasswordChange} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                🔑 Test Password
              </Button>
              <Button onClick={testWalletUpdate} disabled={loading} className="bg-orange-600 hover:bg-orange-700">
                👛 Test Wallet
              </Button>
              <Button onClick={testUserEdit} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                ✏️ Test User Edit
              </Button>
            </div>
            
            <div className="mt-6">
              <Button onClick={runAllTests} disabled={loading} className="bg-purple-600 hover:bg-purple-700 w-full">
                🚀 Run All Tests
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card className="bg-gray-800 border-gray-700 mt-6">
          <CardHeader>
            <CardTitle className="text-white">📊 Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {Object.entries(testResults).map(([testName, result]) => (
                <div key={testName} className="p-2 bg-gray-700 rounded">
                  <strong className="text-white">{testName}:</strong>
                  <span className="text-gray-300 ml-2">{result}</span>
                </div>
              ))}
              {Object.keys(testResults).length === 0 && (
                <p className="text-gray-400">No tests run yet. Click individual test buttons or "Run All Tests".</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

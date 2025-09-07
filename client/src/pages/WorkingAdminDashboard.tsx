import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from '../hooks/use-toast';
import {
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  Settings,
  Shield,
  Eye,
  Edit,
  Plus,
  RefreshCw,
  BarChart3,
  MessageSquare,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Clock,
  Target,
  PlayCircle,
  Minus,
  Key,
  Wallet,
  Send
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  balance: number;
  role: string;
  status: string;
  trading_mode: 'win' | 'normal' | 'lose';
  wallet_address?: string;
  wallet_history?: Array<{
    address: string;
    changed_at: string;
    changed_by: string;
  }>;
  created_at: string;
  last_login?: string;
}

interface Trade {
  id: string;
  user_id: string;
  symbol: string;
  amount: number;
  direction: 'up' | 'down';
  duration: number;
  entry_price: number;
  exit_price?: number;
  result?: 'win' | 'lose' | 'pending';
  profit?: number;
  created_at: string;
  expires_at: string;
  users?: { username: string };
}

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
  users?: { username: string };
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalTrades: number;
  pendingTrades: number;
  totalVolume: number;
  totalBalance: number;
}

export default function WorkingAdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    balance: 10000,
    role: 'user',
    trading_mode: 'normal'
  });

  // Super Admin specific states
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedUserForAction, setSelectedUserForAction] = useState<User | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [walletHistory, setWalletHistory] = useState<any[]>([]);

  // Get current user role
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isSuperAdmin = currentUser.role === 'super_admin' || currentUser.role === 'superadmin';

  console.log('🔧 Current user:', currentUser);
  console.log('🔧 Is Super Admin:', isSuperAdmin);

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching all data...');
      
      const [usersRes, tradesRes, transactionsRes, statsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/trades'),
        fetch('/api/admin/transactions'),
        fetch('/api/admin/stats')
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        console.log('👥 Users loaded:', usersData);
        setUsers(usersData);
      }

      if (tradesRes.ok) {
        const tradesData = await tradesRes.json();
        console.log('📈 Trades loaded:', tradesData);
        setTrades(tradesData);
      }

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        console.log('💰 Transactions loaded:', transactionsData);
        setTransactions(transactionsData);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        console.log('📊 Stats loaded:', statsData);
        setSystemStats(statsData);
      }

    } catch (error) {
      console.error('❌ Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Create new user
  const createUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('👤 Creating user:', newUser);
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ User created:', userData);
        toast({
          title: "Success",
          description: `User ${userData.username} created successfully!`
        });
        
        // Reset form
        setNewUser({
          username: '',
          email: '',
          password: '',
          balance: 10000,
          role: 'user',
          trading_mode: 'normal'
        });
        
        // Refresh data
        fetchData();
      } else {
        throw new Error('Failed to create user');
      }
    } catch (error) {
      console.error('❌ Error creating user:', error);
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive"
      });
    }
  };

  // Update trading mode
  const updateTradingMode = async (userId: string, mode: 'win' | 'normal' | 'lose') => {
    try {
      console.log('🎯 Updating trading mode:', userId, mode);
      const response = await fetch('/api/admin/trading-controls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, controlType: mode })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Trading mode updated:', result);
        toast({
          title: "Success",
          description: `Trading mode updated to ${mode.toUpperCase()}`
        });
        
        // Update local state
        setUsers(users.map(user => 
          user.id === userId ? { ...user, trading_mode: mode } : user
        ));
        
        // Refresh stats
        fetchData();
      } else {
        throw new Error('Failed to update trading mode');
      }
    } catch (error) {
      console.error('❌ Error updating trading mode:', error);
      toast({
        title: "Error",
        description: "Failed to update trading mode",
        variant: "destructive"
      });
    }
  };

  // Manual trade control
  const controlTrade = async (tradeId: string, action: 'win' | 'lose') => {
    try {
      console.log('🎮 Controlling trade:', tradeId, action);
      const response = await fetch(`/api/admin/trades/${tradeId}/control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Trade controlled:', result);
        toast({
          title: "Trade Controlled",
          description: `Trade set to ${action.toUpperCase()}`
        });

        // Update local state
        setTrades(trades.map(trade =>
          trade.id === tradeId ? { ...trade, result: action } : trade
        ));

        // Refresh data
        fetchData();
      } else {
        throw new Error('Failed to control trade');
      }
    } catch (error) {
      console.error('❌ Error controlling trade:', error);
      toast({
        title: "Error",
        description: "Failed to control trade",
        variant: "destructive"
      });
    }
  };

  // Modal state
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});

  // Debug effect to track editFormData changes
  useEffect(() => {
    console.log('📊 Edit form data updated:', editFormData);
  }, [editFormData]);

  // User action handlers
  const handleUserView = (user: any) => {
    console.log('👁️ Viewing user:', user);
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleUserEdit = (user: any) => {
    console.log('✏️ Editing user:', user);
    setSelectedUser(user);
    const formData = {
      username: user.username,
      email: user.email,
      balance: user.balance,
      trading_mode: user.trading_mode,
      role: user.role,
      status: user.status,
      wallet_address: user.wallet_address || ''
    };
    console.log('📝 Setting edit form data:', formData);
    setEditFormData(formData);
    setShowEditModal(true);
  };

  const handleSaveUserEdit = async () => {
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User updated successfully"
        });
        setShowEditModal(false);
        fetchData(); // Refresh all data including users list
      } else {
        throw new Error('Failed to update user');
      }
    } catch (error) {
      console.error('❌ Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      });
    }
  };

  // ===== SUPER ADMIN FUNCTIONS =====

  // Process deposit
  const handleDeposit = async () => {
    if (!selectedUserForAction || !depositAmount) return;

    try {
      const response = await fetch('/api/superadmin/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserForAction.id,
          amount: Number(depositAmount),
          note: `Admin deposit for ${selectedUserForAction.username}`
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: result.message
        });
        setDepositAmount('');
        setShowDepositModal(false);
        fetchData();
      } else {
        throw new Error('Failed to process deposit');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process deposit",
        variant: "destructive"
      });
    }
  };

  // Process withdrawal
  const handleWithdrawal = async () => {
    if (!selectedUserForAction || !withdrawalAmount) return;

    try {
      const response = await fetch('/api/superadmin/withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserForAction.id,
          amount: Number(withdrawalAmount),
          note: `Admin withdrawal for ${selectedUserForAction.username}`
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: result.message
        });
        setWithdrawalAmount('');
        setShowWithdrawalModal(false);
        fetchData();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process withdrawal');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive"
      });
    }
  };

  // Change password
  const handlePasswordChange = async () => {
    if (!selectedUserForAction || !newPassword) return;

    try {
      const response = await fetch('/api/superadmin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserForAction.id,
          newPassword
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: result.message
        });
        setNewPassword('');
        setShowPasswordModal(false);
        fetchData();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change password');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive"
      });
    }
  };

  // Update wallet address
  const handleWalletUpdate = async () => {
    if (!selectedUserForAction) return;

    try {
      const response = await fetch('/api/superadmin/update-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserForAction.id,
          walletAddress: newWalletAddress
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: result.message
        });

        // Update the selectedUserForAction with the new wallet address
        setSelectedUserForAction({
          ...selectedUserForAction,
          wallet_address: newWalletAddress
        });

        // Update the users list to reflect the change
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === selectedUserForAction.id
              ? { ...user, wallet_address: newWalletAddress }
              : user
          )
        );

        setNewWalletAddress('');
        // Don't close the modal immediately so user can see the updated address
        // setShowWalletModal(false);
        fetchData(); // Refresh the main data
      } else {
        throw new Error('Failed to update wallet address');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wallet address",
        variant: "destructive"
      });
    }
  };

  // Load wallet history
  const loadWalletHistory = async (userId: string) => {
    try {
      const response = await fetch(`/api/superadmin/wallet-history/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setWalletHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to load wallet history:', error);
      setWalletHistory([]);
    }
  };

  const openSuperAdminModal = (user: User, action: string) => {
    setSelectedUserForAction(user);
    setNewWalletAddress(user.wallet_address || '');

    switch (action) {
      case 'deposit':
        setShowDepositModal(true);
        break;
      case 'withdrawal':
        setShowWithdrawalModal(true);
        break;
      case 'password':
        setShowPasswordModal(true);
        break;
      case 'wallet':
        setShowWalletModal(true);
        loadWalletHistory(user.id); // Load wallet history when opening wallet modal
        break;
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getTradingModeBadge = (mode: string) => {
    const colors = {
      win: 'bg-green-600',
      normal: 'bg-blue-600',
      lose: 'bg-red-600'
    };
    return (
      <Badge className={`${colors[mode as keyof typeof colors]} text-white`}>
        {mode.toUpperCase()}
      </Badge>
    );
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = Date.now();
    const expiry = new Date(expiresAt).getTime();
    const remaining = Math.max(0, expiry - now);
    return Math.floor(remaining / 1000);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-purple-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">METACHROME Admin Dashboard</h1>
                <p className="text-sm text-gray-400">Complete Trading Platform Control</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={fetchData} 
                variant="outline" 
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <div className="flex items-center space-x-2 bg-gray-700 rounded-lg px-3 py-2">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">SA</span>
                </div>
                <div className="text-sm">
                  <div className="text-white font-medium">superadmin</div>
                  <div className="text-gray-400 text-xs">Super Admin</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-gray-800 border-gray-700">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="trades">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trades
            </TabsTrigger>
            <TabsTrigger value="transactions">
              <DollarSign className="w-4 h-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="controls">
              <Settings className="w-4 h-4 mr-2" />
              Controls
            </TabsTrigger>
            <TabsTrigger value="support">
              <MessageSquare className="w-4 h-4 mr-2" />
              Support
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* System Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Users</p>
                      <p className="text-3xl font-bold text-white">
                        {systemStats?.totalUsers || users.length}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Active Trades</p>
                      <p className="text-3xl font-bold text-white">
                        {Array.isArray(trades) ? trades.filter(t => t.result === 'pending').length : 0}
                      </p>
                    </div>
                    <Activity className="w-8 h-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Total Volume</p>
                      <p className="text-3xl font-bold text-white">
                        ${trades.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-orange-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Total Balance</p>
                      <p className="text-3xl font-bold text-white">
                        ${users.reduce((sum, u) => sum + u.balance, 0).toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
                <CardDescription className="text-gray-400">
                  Common administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="h-20 bg-blue-600 hover:bg-blue-700">
                    <div className="text-center">
                      <Users className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm">Manage Users</div>
                    </div>
                  </Button>
                  <Button className="h-20 bg-green-600 hover:bg-green-700">
                    <div className="text-center">
                      <Activity className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm">Monitor Trades</div>
                    </div>
                  </Button>
                  <Button className="h-20 bg-purple-600 hover:bg-purple-700">
                    <div className="text-center">
                      <Settings className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm">System Settings</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* User Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Users</p>
                      <p className="text-2xl font-bold text-white">{users.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Users</p>
                      <p className="text-2xl font-bold text-white">
                        {Array.isArray(users) ? users.filter(u => u.status === 'active').length : 0}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Balance</p>
                      <p className="text-2xl font-bold text-white">
                        ${users.reduce((sum, u) => sum + u.balance, 0).toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Controlled Users</p>
                      <p className="text-2xl font-bold text-white">
                        {Array.isArray(users) ? users.filter(u => u.trading_mode !== 'normal').length : 0}
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Create User Form */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Create New User</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Add new users to the trading platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <Input
                    placeholder="Username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Input
                    placeholder="Password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Input
                    placeholder="Balance"
                    type="number"
                    value={newUser.balance}
                    onChange={(e) => setNewUser({ ...newUser, balance: Number(e.target.value) })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={createUser}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Create User
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage all platform users and their trading settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border border-gray-700 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-700">
                        <TableHead className="text-gray-300">User</TableHead>
                        <TableHead className="text-gray-300">Email</TableHead>
                        <TableHead className="text-gray-300">Balance</TableHead>
                        <TableHead className="text-gray-300">Role</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Trading Mode</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(users) ? users.map((user) => (
                        <TableRow key={user.id} className="border-gray-700 hover:bg-gray-700/50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="text-white font-medium">{user.username}</div>
                                <div className="text-gray-400 text-sm">ID: {user.id ? user.id.slice(0, 8) : 'N/A'}...</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-white">{user.email}</TableCell>
                          <TableCell className="text-white font-medium">${user.balance.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'super_admin' ? 'default' : user.role === 'admin' ? 'secondary' : 'outline'}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={user.trading_mode}
                              onValueChange={(value: 'win' | 'normal' | 'lose') =>
                                updateTradingMode(user.id, value)
                              }
                            >
                              <SelectTrigger className="w-24 bg-gray-700 border-gray-600">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="win">
                                  <span className="text-green-600 font-bold">WIN</span>
                                </SelectItem>
                                <SelectItem value="normal">
                                  <span className="text-blue-600 font-bold">NORMAL</span>
                                </SelectItem>
                                <SelectItem value="lose">
                                  <span className="text-red-600 font-bold">LOSE</span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUserView(user)}
                                className="text-gray-400 hover:text-white"
                                title="View User Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUserEdit(user)}
                                className="text-gray-400 hover:text-white"
                                title="Edit User"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>

                              {/* Super Admin Only Buttons */}
                              {isSuperAdmin && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openSuperAdminModal(user, 'deposit')}
                                    className="text-green-400 hover:text-green-300"
                                    title="Deposit Money"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openSuperAdminModal(user, 'withdrawal')}
                                    className="text-red-400 hover:text-red-300"
                                    title="Withdraw Money"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openSuperAdminModal(user, 'password')}
                                    className="text-blue-400 hover:text-blue-300"
                                    title="Change Password"
                                  >
                                    <Key className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openSuperAdminModal(user, 'wallet')}
                                    className="text-purple-400 hover:text-purple-300"
                                    title="Update Wallet Address"
                                  >
                                    <Wallet className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )) : []}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trades Tab */}
          <TabsContent value="trades" className="space-y-6">
            {/* Trading Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Active Trades</p>
                      <p className="text-3xl font-bold text-white">
                        {Array.isArray(trades) ? trades.filter(t => t.result === 'pending').length : 0}
                      </p>
                    </div>
                    <PlayCircle className="w-8 h-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Win Rate</p>
                      <p className="text-3xl font-bold text-white">
                        {Array.isArray(trades) && trades.length > 0 ?
                          ((trades.filter(t => t.result === 'win').length / trades.filter(t => t.result !== 'pending').length) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Total Volume</p>
                      <p className="text-3xl font-bold text-white">
                        ${trades.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-orange-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Total P&L</p>
                      <p className="text-3xl font-bold text-white">
                        ${trades.reduce((sum, t) => sum + (t.profit || 0), 0).toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Trading Monitor */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Activity className="w-5 h-5" />
                      <span>Live Trading Monitor</span>
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Real-time trading activity with manual controls
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-400">Live</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border border-gray-700 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-700">
                        <TableHead className="text-gray-300">Trade ID</TableHead>
                        <TableHead className="text-gray-300">User</TableHead>
                        <TableHead className="text-gray-300">Symbol</TableHead>
                        <TableHead className="text-gray-300">Direction</TableHead>
                        <TableHead className="text-gray-300">Amount</TableHead>
                        <TableHead className="text-gray-300">Duration</TableHead>
                        <TableHead className="text-gray-300">Entry Price</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Time Left</TableHead>
                        <TableHead className="text-gray-300">Control</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(trades) ? trades.slice(0, 10).map((trade) => {
                        const secondsLeft = getTimeRemaining(trade.expires_at);

                        return (
                          <TableRow key={trade.id} className="border-gray-700 hover:bg-gray-700/50">
                            <TableCell>
                              <div className="text-white font-mono text-sm">
                                {trade.id ? trade.id.slice(0, 8) : 'N/A'}...
                              </div>
                            </TableCell>
                            <TableCell className="text-white">
                              {trade.users?.username || 'Unknown'}
                            </TableCell>
                            <TableCell className="text-white font-medium">{trade.symbol}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {trade.direction === 'up' ? (
                                  <ArrowUp className="w-4 h-4 text-green-500" />
                                ) : (
                                  <ArrowDown className="w-4 h-4 text-red-500" />
                                )}
                                <span className="text-white">{trade.direction.toUpperCase()}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-white">${trade.amount.toLocaleString()}</TableCell>
                            <TableCell className="text-white">{trade.duration}s</TableCell>
                            <TableCell className="text-white font-mono">${trade.entry_price}</TableCell>
                            <TableCell>
                              <Badge variant={
                                trade.result === 'win' ? 'default' :
                                trade.result === 'lose' ? 'destructive' :
                                'secondary'
                              }>
                                {trade.result || 'pending'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {trade.result === 'pending' ? (
                                <span className={`text-sm font-medium ${
                                  secondsLeft <= 10 ? 'text-red-400' : 'text-yellow-400'
                                }`}>
                                  {secondsLeft}s
                                </span>
                              ) : (
                                <span className="text-gray-400 text-sm">Completed</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {trade.result === 'pending' ? (
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => controlTrade(trade.id, 'win')}
                                    className="text-green-400 hover:text-green-300"
                                    title="Force Win"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => controlTrade(trade.id, 'lose')}
                                    className="text-red-400 hover:text-red-300"
                                    title="Force Lose"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      }) : []}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Financial Transactions</CardTitle>
                <CardDescription className="text-gray-400">
                  Monitor all financial transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border border-gray-700 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-700">
                        <TableHead className="text-gray-300">Transaction ID</TableHead>
                        <TableHead className="text-gray-300">User</TableHead>
                        <TableHead className="text-gray-300">Type</TableHead>
                        <TableHead className="text-gray-300">Amount</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(transactions) ? transactions.map((transaction) => (
                        <TableRow key={transaction.id} className="border-gray-700 hover:bg-gray-700/50">
                          <TableCell>
                            <div className="text-white font-mono text-sm">
                              {transaction.id ? transaction.id.slice(0, 8) : 'N/A'}...
                            </div>
                          </TableCell>
                          <TableCell className="text-white">
                            {transaction.users?.username || 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={transaction.type === 'deposit' ? 'default' : 'secondary'}>
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white font-medium">
                            ${transaction.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      )) : []}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Controls Tab */}
          <TabsContent value="controls" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">System Controls</CardTitle>
                <CardDescription className="text-gray-400">
                  Platform-wide controls and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3">Trading Controls</h3>
                    <div className="space-y-3">
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        Enable All Trading
                      </Button>
                      <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                        Pause Trading
                      </Button>
                      <Button className="w-full bg-red-600 hover:bg-red-700">
                        Emergency Stop
                      </Button>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3">Market Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Price Feed:</span>
                        <Badge className="bg-green-600">Live</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Auto Mode:</span>
                        <Badge className="bg-blue-600">Enabled</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Manual Override:</span>
                        <Badge variant="outline">Ready</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3">System Health</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Server:</span>
                        <Badge className="bg-green-600">Online</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Database:</span>
                        <Badge className="bg-green-600">Connected</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">WebSocket:</span>
                        <Badge className="bg-green-600">Active</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Support Center</CardTitle>
                <CardDescription className="text-gray-400">
                  User support and communication management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Support System</h3>
                  <p className="text-gray-400 mb-4">
                    Advanced support features coming soon
                  </p>
                  <Button variant="outline">
                    Configure Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">👤 User Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </Button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Username:</span>
                <span className="text-white font-medium">{selectedUser.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-white">{selectedUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Balance:</span>
                <span className="text-white font-medium">${selectedUser.balance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Role:</span>
                <span className="text-white">{selectedUser.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-white">{selectedUser.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Trading Mode:</span>
                <span className="text-white font-medium">{selectedUser.trading_mode.toUpperCase()}</span>
              </div>
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between items-start">
                  <span className="text-gray-400">Wallet Address:</span>
                  <div className="flex-1 ml-3">
                    {selectedUser.wallet_address ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-mono text-xs bg-gray-700 px-2 py-1 rounded break-all">
                            {selectedUser.wallet_address}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(selectedUser.wallet_address || '')}
                            className="text-gray-400 hover:text-white p-1"
                            title="Copy address"
                          >
                            📋
                          </Button>
                        </div>
                        {isSuperAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowUserModal(false);
                              openSuperAdminModal(selectedUser, 'wallet');
                            }}
                            className="text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-white text-xs"
                          >
                            🏦 Manage
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <span className="text-gray-500 italic text-sm">Not set</span>
                        {isSuperAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowUserModal(false);
                              openSuperAdminModal(selectedUser, 'wallet');
                            }}
                            className="text-purple-400 border-purple-400 hover:bg-purple-400 hover:text-white text-xs"
                          >
                            🏦 Set Address
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Created:</span>
                <span className="text-white">{new Date(selectedUser.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Login:</span>
                <span className="text-white">
                  {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => setShowUserModal(false)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* User Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">⚙️ Edit User</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-1">Username</label>
                <Input
                  value={editFormData.username || ''}
                  onChange={(e) => {
                    console.log('🔄 Username changed:', e.target.value);
                    setEditFormData({ ...editFormData, username: e.target.value });
                  }}
                  className="bg-gray-700 border-gray-600 text-white w-full focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter username"
                  autoComplete="off"
                  disabled={false}
                  readOnly={false}
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Email</label>
                <Input
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e) => {
                    console.log('📧 Email changed:', e.target.value);
                    setEditFormData({ ...editFormData, email: e.target.value });
                  }}
                  className="bg-gray-700 border-gray-600 text-white w-full focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email"
                  autoComplete="off"
                  disabled={false}
                  readOnly={false}
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Balance</label>
                <Input
                  type="number"
                  value={editFormData.balance || 0}
                  onChange={(e) => {
                    console.log('💰 Balance changed:', e.target.value);
                    setEditFormData({ ...editFormData, balance: Number(e.target.value) });
                  }}
                  className="bg-gray-700 border-gray-600 text-white w-full focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter balance"
                  step="0.01"
                  min="0"
                  disabled={false}
                  readOnly={false}
                />
              </div>

              {/* Wallet Address Section */}
              <div>
                <label className="text-gray-400 text-sm block mb-1">Wallet Address</label>
                <Input
                  value={editFormData.wallet_address || ''}
                  onChange={(e) => {
                    console.log('🔄 Wallet address changed:', e.target.value);
                    setEditFormData({ ...editFormData, wallet_address: e.target.value });
                  }}
                  placeholder="Enter wallet address (0x...)"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm block mb-1">Trading Mode</label>
                <Select
                  value={editFormData.trading_mode}
                  onValueChange={(value) => setEditFormData({ ...editFormData, trading_mode: value })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-full">
                    <SelectValue placeholder="Select trading mode" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="win" className="text-white hover:bg-gray-600">
                      <span className="text-green-400 font-bold">WIN</span>
                    </SelectItem>
                    <SelectItem value="normal" className="text-white hover:bg-gray-600">
                      <span className="text-blue-400 font-bold">NORMAL</span>
                    </SelectItem>
                    <SelectItem value="lose" className="text-white hover:bg-gray-600">
                      <span className="text-red-400 font-bold">LOSE</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Role</label>
                <Select
                  value={editFormData.role}
                  onValueChange={(value) => setEditFormData({ ...editFormData, role: value })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="user" className="text-white hover:bg-gray-600">User</SelectItem>
                    <SelectItem value="admin" className="text-white hover:bg-gray-600">Admin</SelectItem>
                    <SelectItem value="superadmin" className="text-white hover:bg-gray-600">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Status</label>
                <Select
                  value={editFormData.status}
                  onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="active" className="text-white hover:bg-gray-600">Active</SelectItem>
                    <SelectItem value="inactive" className="text-white hover:bg-gray-600">Inactive</SelectItem>
                    <SelectItem value="suspended" className="text-white hover:bg-gray-600">Suspended</SelectItem>
                    <SelectItem value="banned" className="text-white hover:bg-gray-600">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveUserEdit}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Super Admin Modals */}
      {isSuperAdmin && (
        <>
          {/* Deposit Modal */}
          {showDepositModal && selectedUserForAction && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">💰 Deposit to {selectedUserForAction.username}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm block mb-1">Amount ($)</label>
                    <Input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="Enter deposit amount"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="text-sm text-gray-400">
                    Current Balance: ${selectedUserForAction.balance.toLocaleString()}
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowDepositModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleDeposit} className="bg-green-600 hover:bg-green-700">
                    Process Deposit
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Withdrawal Modal */}
          {showWithdrawalModal && selectedUserForAction && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">💸 Withdraw from {selectedUserForAction.username}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm block mb-1">Amount ($)</label>
                    <Input
                      type="number"
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                      placeholder="Enter withdrawal amount"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="text-sm text-gray-400">
                    Current Balance: ${selectedUserForAction.balance.toLocaleString()}
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowWithdrawalModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleWithdrawal} className="bg-red-600 hover:bg-red-700">
                    Process Withdrawal
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Password Change Modal */}
          {showPasswordModal && selectedUserForAction && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">🔑 Change Password for {selectedUserForAction.username}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm block mb-1">New Password</label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="text-sm text-yellow-400">
                    ⚠️ This will immediately change the user's login password
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handlePasswordChange} className="bg-blue-600 hover:bg-blue-700">
                    Change Password
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Wallet Address Modal */}
          {showWalletModal && selectedUserForAction && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 border border-gray-700 max-h-[80vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-white mb-4">🏦 Manage Wallet for {selectedUserForAction.username}</h3>

                <div className="space-y-6">
                  {/* Current Wallet Info */}
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Current Wallet Address</h4>
                    <div className="text-sm">
                      {selectedUserForAction.wallet_address ? (
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-green-400 bg-gray-800 px-2 py-1 rounded">
                            {selectedUserForAction.wallet_address}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(selectedUserForAction.wallet_address || '')}
                            className="text-gray-400 hover:text-white p-1"
                            title="Copy address"
                          >
                            📋
                          </Button>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No wallet address set</span>
                      )}
                    </div>
                  </div>

                  {/* New Wallet Address Input */}
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">New Wallet Address</label>
                    <Input
                      value={newWalletAddress}
                      onChange={(e) => setNewWalletAddress(e.target.value)}
                      placeholder="Enter new wallet address"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  {/* Previous Wallet Addresses */}
                  {walletHistory.length > 0 && (
                    <div>
                      <h4 className="text-white font-medium mb-3">Previous Wallet Addresses</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {Array.isArray(walletHistory) ? walletHistory.map((wallet, index) => (
                          <div key={index} className="bg-gray-700 p-3 rounded flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-mono text-sm text-gray-300">
                                {wallet.address ? `${wallet.address.slice(0, 10)}...${wallet.address.slice(-8)}` : 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500">
                                Changed: {new Date(wallet.changed_at).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setNewWalletAddress(wallet.address)}
                                className="text-blue-400 hover:text-blue-300 text-xs"
                                title="Use this address"
                              >
                                Use
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigator.clipboard.writeText(wallet.address)}
                                className="text-gray-400 hover:text-white p-1"
                                title="Copy address"
                              >
                                📋
                              </Button>
                            </div>
                          </div>
                        )) : []}
                      </div>
                    </div>
                  )}

                  {/* Warning */}
                  <div className="bg-yellow-900/20 border border-yellow-600/30 p-3 rounded">
                    <div className="text-yellow-400 text-sm">
                      ⚠️ Changing the wallet address will move the current address to history
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowWalletModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleWalletUpdate}
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={!newWalletAddress || newWalletAddress === selectedUserForAction.wallet_address}
                  >
                    Update Wallet
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

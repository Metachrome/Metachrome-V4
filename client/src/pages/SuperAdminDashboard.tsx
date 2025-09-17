import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../hooks/use-toast';
import { useWebSocket } from '../hooks/useWebSocket';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
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
  Search,
  RefreshCw,
  BarChart3,
  MessageSquare,
  Bell,
  Monitor,
  PieChart,
  User,
  Key,
  UserX,
  Trash2,
  Lock,
  Unlock,
  UserCheck,
  Wallet,
  CreditCard,
  History,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  Globe,
  Smartphone,
  Filter,
  Download,
  Upload,
  Target,
  Zap,
  TrendingDown,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Edit,
  Settings
} from 'lucide-react';

// Helper function to safely parse balance values
const parseBalance = (balance: any): number => {
  if (typeof balance === 'number') {
    return balance;
  }
  if (typeof balance === 'string') {
    // Remove any formatting and parse as float
    const cleaned = balance.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// Helper function to format balance for display
const formatBalance = (balance: any): string => {
  const numericBalance = parseBalance(balance);
  // Round to 2 decimal places to avoid floating point precision issues
  const rounded = Math.round(numericBalance * 100) / 100;
  return rounded.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Helper function to calculate total balance safely
const calculateTotalBalance = (users: any[]): number => {
  return users.reduce((sum, user) => {
    const balance = parseBalance(user.balance);
    return sum + balance;
  }, 0);
};

// Core interfaces
interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  role: string;
  status: string;
  trading_mode: 'win' | 'normal' | 'lose';
  restrictions: string[];
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

interface TradingSettings {
  id: string;
  duration: number;
  min_amount: number;
  profit_percentage: number;
  enabled: boolean;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  bannedUsers: number;
  totalTrades: number;
  pendingTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalTransactions: number;
  pendingTransactions: number;
  totalVolume: number;
  totalBalance: number;
}

export default function SuperAdminDashboard() {
  console.log('🚀 SuperAdminDashboard component is rendering!');

  const { user, isLoading } = useAuth();
  const { lastMessage, connected } = useWebSocket();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: '',
    email: '',
    password: '',
    balance: 10000,
    role: 'user',
    trading_mode: 'normal'
  });

  // Balance update state
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceUpdateData, setBalanceUpdateData] = useState({
    userId: '',
    amount: '',
    action: 'add' // 'add' or 'subtract'
  });

  // Password update state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUpdateData, setPasswordUpdateData] = useState({
    userId: '',
    username: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Receipt viewer state
  const [selectedReceipt, setSelectedReceipt] = useState<{url: string, filename: string} | null>(null);

  // Wallet update state
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletUpdateData, setWalletUpdateData] = useState({
    userId: '',
    walletAddress: ''
  });

  // User edit state
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [userEditData, setUserEditData] = useState({
    userId: '',
    username: '',
    email: '',
    balance: '',
    walletAddress: '',
    tradingMode: 'normal',
    role: 'user',
    status: 'active'
  });

  // Data fetching with real-time refresh
  const { data: users, refetch: refetchUsers } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: !!user && (user.role === 'super_admin' || user.role === 'admin'),
    // refetchInterval: 3000, // Temporarily disabled to stop auto-refresh
    staleTime: 0, // Always consider data stale
    cacheTime: 1000 // Short cache time
  });

  const { data: trades, refetch: refetchTrades } = useQuery<Trade[]>({
    queryKey: ['/api/admin/trades'],
    enabled: !!user && (user.role === 'super_admin' || user.role === 'admin')
  });

  const { data: transactions, refetch: refetchTransactions } = useQuery<Transaction[]>({
    queryKey: ['/api/admin/transactions'],
    enabled: !!user && (user.role === 'super_admin' || user.role === 'admin')
  });

  const { data: pendingRequests, refetch: refetchPendingRequests } = useQuery<{
    deposits: any[];
    withdrawals: any[];
    total: number;
  }>({
    queryKey: ['/api/admin/pending-requests'],
    enabled: !!user && user.role === 'super_admin',
    refetchInterval: 5000 // Refresh every 5 seconds for real-time updates
  });

  const { data: tradingSettings, refetch: refetchTradingSettings } = useQuery<TradingSettings[]>({
    queryKey: ['/api/admin/trading-settings'],
    enabled: !!user && user.role === 'super_admin'
  });

  const { data: systemStats, refetch: refetchSystemStats } = useQuery<SystemStats>({
    queryKey: ['/api/superadmin/system-stats'],
    enabled: !!user && user.role === 'super_admin'
  });

  // Handle WebSocket updates for real-time admin dashboard sync
  useEffect(() => {
    if (lastMessage?.type === 'balance_update' || lastMessage?.type === 'admin_balance_monitor') {
      console.log('🔄 ADMIN: Real-time balance update received:', lastMessage.data);

      // Refresh all data when any balance changes
      refetchUsers();
      refetchSystemStats();
      refetchTrades();
      refetchTransactions();
    }

    // Handle real-time transaction updates
    if (lastMessage?.type === 'transaction_created' || lastMessage?.type === 'admin_transaction_update') {
      console.log('💰 ADMIN: Real-time transaction update received:', lastMessage.data);

      // Only refresh the necessary data to prevent loops
      refetchTransactions();
      refetchUsers(); // Update user balances
      refetchSystemStats(); // Update total volume, etc.

      // Invalidate specific queries only (reduced to prevent excessive refetching)
      queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/superadmin/system-stats'] });

      // Show notification for balance changes
      if (lastMessage.data.changeType === 'spot_buy' || lastMessage.data.changeType === 'spot_sell' ||
          lastMessage.data.changeType === 'deposit' || lastMessage.data.changeType === 'withdrawal' ||
          lastMessage.data.changeType === 'trade_start' || lastMessage.data.changeType === 'trade_win' ||
          lastMessage.data.changeType === 'trade_lose') {
        toast({
          title: "Balance Updated",
          description: `${lastMessage.data.username}: ${lastMessage.data.changeType} - New balance: ${lastMessage.data.newBalance} USDT`,
          duration: 3000
        });
      }
    }

    // Handle pending request notifications
    if (lastMessage?.type === 'pending_deposit_proof' || lastMessage?.type === 'pending_withdrawal_request') {
      console.log('🔔 ADMIN: New pending request received:', lastMessage.data);

      // Refresh pending requests
      refetchPendingRequests();

      // Show notification
      const isDeposit = lastMessage.type === 'pending_deposit_proof';
      toast({
        title: `New ${isDeposit ? 'Deposit' : 'Withdrawal'} Request`,
        description: `${lastMessage.data.username} requested ${isDeposit ? 'deposit' : 'withdrawal'} of $${lastMessage.data.amount}`,
        duration: 5000
      });
    }
  }, [lastMessage, refetchUsers, refetchSystemStats, refetchTrades, refetchTransactions, queryClient, toast]);

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUserData) => {
      console.log('Creating user:', userData);
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(userData)
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to create user');
      }
      return response.json();
    },
    onSuccess: (data) => {
      console.log('User created successfully:', data);
      toast({
        title: "Success",
        description: `User ${data.username} created successfully!`,
        duration: 3000
      });
      refetchUsers();
      refetchSystemStats();
      setNewUserData({
        username: '',
        email: '',
        password: '',
        balance: 10000,
        role: 'user',
        trading_mode: 'normal'
      });
      setIsUserDialogOpen(false);
    },
    onError: (error: any) => {
      console.error('Failed to create user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
        duration: 5000
      });
    }
  });

  const controlTradingOutcome = useMutation({
    mutationFn: async ({ userId, tradingMode }: { userId: string; tradingMode: 'win' | 'normal' | 'lose' }) => {
      console.log('Updating trading mode:', userId, tradingMode);
      const response = await fetch('/api/admin/trading-controls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ userId, controlType: tradingMode })
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to control trading outcome');
      }
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Trading control updated:', data);
      toast({
        title: "Trading Control Updated",
        description: data.message || "Trading mode updated successfully",
        duration: 3000
      });
      refetchUsers();
      refetchSystemStats();
    },
    onError: (error: any) => {
      console.error('Failed to update trading control:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update trading control",
        variant: "destructive",
        duration: 5000
      });
    }
  });

  // Manual trade control mutation
  const manualTradeControlMutation = useMutation({
    mutationFn: async ({ tradeId, action }: { tradeId: string; action: 'win' | 'lose' }) => {
      console.log('Manual trade control:', tradeId, action);
      const response = await fetch(`/api/admin/trades/${tradeId}/control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ action })
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to control trade');
      }
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Trade controlled successfully:', data);
      toast({
        title: "Trade Controlled",
        description: data.message || "Trade outcome set successfully",
        duration: 3000
      });
      refetchTrades();
      refetchSystemStats();
    },
    onError: (error: any) => {
      console.error('Failed to control trade:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to control trade",
        variant: "destructive",
        duration: 5000
      });
    }
  });

  // Balance update mutation
  const balanceUpdateMutation = useMutation({
    mutationFn: async ({ userId, amount, action }: { userId: string; amount: string; action: 'add' | 'subtract' }) => {
      console.log('Updating balance:', userId, amount, action);
      const response = await fetch(`/api/admin/balances/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          balance: parseFloat(amount),
          action,
          note: `${action === 'add' ? 'Deposit' : 'Withdrawal'} by admin`
        })
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to update balance');
      }
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Balance updated successfully:', data);
      toast({
        title: "Balance Updated",
        description: data.message || "User balance updated successfully",
        duration: 3000
      });
      refetchUsers();
      refetchSystemStats();
      setShowBalanceModal(false);
      setBalanceUpdateData({ userId: '', amount: '', action: 'add' });
    },
    onError: (error: any) => {
      console.error('Failed to update balance:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update balance",
        variant: "destructive",
        duration: 5000
      });
    }
  });

  // Password update mutation
  const passwordUpdateMutation = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      console.log('Updating password for user:', userId);
      const response = await fetch(`/api/admin/users/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ newPassword })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update password');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Updated",
        description: "User password has been updated successfully",
        duration: 3000
      });
      setShowPasswordModal(false);
      setPasswordUpdateData({
        userId: '',
        username: '',
        newPassword: '',
        confirmPassword: ''
      });
    },
    onError: (error: any) => {
      console.error('Failed to update password:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
        duration: 5000
      });
    }
  });

  // Wallet update mutation
  const walletUpdateMutation = useMutation({
    mutationFn: async ({ userId, walletAddress }: { userId: string; walletAddress: string }) => {
      console.log('Updating wallet for user:', userId);
      const response = await fetch(`/api/admin/users/update-wallet`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ userId, walletAddress })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update wallet address');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Wallet Updated",
        description: "User wallet address has been updated successfully",
        duration: 3000
      });
      setShowWalletModal(false);
      setWalletUpdateData({
        userId: '',
        walletAddress: ''
      });
      refetchUsers();
    },
    onError: (error: any) => {
      console.error('Failed to update wallet:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update wallet address",
        variant: "destructive",
        duration: 5000
      });
    }
  });

  // User edit mutation
  const userEditMutation = useMutation({
    mutationFn: async (userData: any) => {
      console.log('Updating user:', userData);

      // Map frontend data to backend format
      const backendData = {
        username: userData.username,
        email: userData.email,
        walletAddress: userData.walletAddress,
        role: userData.role,
        isActive: userData.status === 'active',
        trading_mode: userData.tradingMode
      };

      const response = await fetch(`/api/admin/users/${userData.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(backendData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      // If balance was changed, update it separately
      const currentUser = users?.find(u => u.id === userData.userId);
      const currentBalance = parseBalance(currentUser?.balance || 0);
      const newBalance = parseBalance(userData.balance);

      if (Math.abs(currentBalance - newBalance) > 0.01) {
        const balanceResponse = await fetch(`/api/admin/balances/${userData.userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            amount: newBalance,
            type: 'admin_adjustment',
            description: 'Balance updated via user edit'
          })
        });

        if (!balanceResponse.ok) {
          console.warn('Failed to update balance, but user data was updated');
        }
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User Updated",
        description: "User information has been updated successfully",
        duration: 3000
      });
      setShowUserEditModal(false);
      setUserEditData({
        userId: '',
        username: '',
        email: '',
        balance: '',
        walletAddress: '',
        tradingMode: 'normal',
        role: 'user',
        status: 'active'
      });
      refetchUsers();
    },
    onError: (error: any) => {
      console.error('Failed to update user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
        duration: 5000
      });
    }
  });

  // Approve deposit mutation
  const approveDepositMutation = useMutation({
    mutationFn: async ({ depositId, action, reason }: { depositId: string; action: 'approve' | 'reject'; reason?: string }) => {
      console.log('Deposit action:', depositId, action, reason);
      const response = await fetch(`/api/admin/deposits/${depositId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ action, reason })
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to process deposit');
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: `Deposit ${variables.action === 'approve' ? 'Approved' : 'Rejected'}`,
        description: data.message || `Deposit ${variables.action}d successfully`,
        duration: 3000
      });
      refetchPendingRequests();
      refetchUsers();
      refetchTransactions();
      refetchSystemStats();
    },
    onError: (error: any) => {
      console.error('Failed to process deposit:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process deposit",
        variant: "destructive",
        duration: 5000
      });
    }
  });

  // Approve withdrawal mutation
  const approveWithdrawalMutation = useMutation({
    mutationFn: async ({ withdrawalId, action, reason }: { withdrawalId: string; action: 'approve' | 'reject'; reason?: string }) => {
      console.log('Withdrawal action:', withdrawalId, action, reason);
      const response = await fetch(`/api/admin/withdrawals/${withdrawalId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ action, reason })
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to process withdrawal');
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: `Withdrawal ${variables.action === 'approve' ? 'Approved' : 'Rejected'}`,
        description: data.message || `Withdrawal ${variables.action}d successfully`,
        duration: 3000
      });
      refetchPendingRequests();
      refetchUsers();
      refetchTransactions();
      refetchSystemStats();
    },
    onError: (error: any) => {
      console.error('Failed to process withdrawal:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive",
        duration: 5000
      });
    }
  });

  // Event handlers
  const handleTradingModeChange = (userId: string, mode: 'win' | 'normal' | 'lose') => {
    console.log('Changing trading mode for user:', userId, 'to:', mode);
    controlTradingOutcome.mutate({ userId, tradingMode: mode });
  };

  const handleManualTradeControl = (tradeId: string, action: 'win' | 'lose') => {
    console.log('Manual trade control:', tradeId, action);
    manualTradeControlMutation.mutate({ tradeId, action });
  };

  const handleCreateUser = () => {
    createUserMutation.mutate(newUserData);
  };

  const handleRefreshAll = () => {
    refetchUsers();
    refetchTrades();
    refetchTransactions();
    refetchTradingSettings();
    refetchSystemStats();
    toast({ title: "Data Refreshed", description: "All data has been refreshed" });
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    try {
      console.log('🗑️ Deleting user:', userId, username);

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to delete user');
      }

      const result = await response.json();
      console.log('✅ User deleted successfully:', result);

      toast({
        title: "User Deleted",
        description: `User ${username} has been permanently deleted`
      });

      // Refresh all data to update the UI
      handleRefreshAll();

    } catch (error) {
      console.error('❌ Error deleting user:', error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  // Debug logging BEFORE access control
  console.log('🔍 SuperAdmin Debug BEFORE ACCESS CHECK:', {
    user: user,
    userExists: !!user,
    userRole: user?.role,
    isLoading: isLoading,
    accessCheck: !user || (user.role !== 'super_admin' && user.role !== 'admin')
  });

  // Access control
  if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="w-96 bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
              <p className="text-gray-400 mb-4">Admin privileges required.</p>
              <Button onClick={() => window.location.href = '/admin/login'} className="w-full">
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSuperAdmin = user.role === 'super_admin';

  // Debug logging
  console.log('🔍 SuperAdmin Debug:', {
    user: user,
    userRole: user?.role,
    isSuperAdmin: isSuperAdmin,
    authToken: localStorage.getItem('authToken')?.substring(0, 30) + '...'
  });

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-purple-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {isSuperAdmin ? 'Super Admin' : 'Admin'} Dashboard
                </h1>
                <p className="text-sm text-gray-400">METACHROME.io - Trading Platform Control</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={handleRefreshAll} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <div className="flex items-center space-x-2 bg-gray-700 rounded-lg px-3 py-2">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-sm">
                  <div className="text-white font-medium">{user.username}</div>
                  <div className="text-gray-400 text-xs">{user.role}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="flex w-full overflow-x-auto bg-gray-800 border-gray-700 scrollbar-hide gap-2 p-2">
            <TabsTrigger value="overview" className="flex-shrink-0 px-4 py-2">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex-shrink-0 px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="trades" className="flex-shrink-0 px-4 py-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trades
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex-shrink-0 px-4 py-2">
              <DollarSign className="w-4 h-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex-shrink-0 px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              Pending Requests
            </TabsTrigger>
            <TabsTrigger value="controls" className="flex-shrink-0 px-4 py-2">
              <Settings className="w-4 h-4 mr-2" />
              Controls
            </TabsTrigger>
            <TabsTrigger value="support" className="flex-shrink-0 px-4 py-2">
              <MessageSquare className="w-4 h-4 mr-2" />
              Support
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Users</p>
                      <p className="text-3xl font-bold text-white">{systemStats?.totalUsers || 0}</p>
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
                      <p className="text-3xl font-bold text-white">{systemStats?.pendingTrades || 0}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Total Volume</p>
                      <p className="text-3xl font-bold text-white">${(systemStats?.totalVolume || 0).toLocaleString()}</p>
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
                      <p className="text-3xl font-bold text-white">${(systemStats?.totalBalance || 0).toLocaleString()}</p>
                    </div>
                    <Activity className="w-8 h-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab - Complete User Management */}
          <TabsContent value="users" className="space-y-6">
            {/* User Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Users</p>
                      <p className="text-2xl font-bold text-white">{users?.length || 0}</p>
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
                        {users?.filter(u => u.status === 'active').length || 0}
                      </p>
                    </div>
                    <UserCheck className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Balance</p>
                      <p className="text-2xl font-bold text-white">
                        ${users ? calculateTotalBalance(users).toLocaleString() : 0}
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
                        {users?.filter(u => u.trading_mode !== 'normal').length || 0}
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Create User Section */}
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
                    value={newUserData.username}
                    onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Input
                    placeholder="Password"
                    type="password"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Input
                    placeholder="Balance"
                    type="number"
                    value={newUserData.balance}
                    onChange={(e) => setNewUserData({ ...newUserData, balance: Number(e.target.value) })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Select
                    value={newUserData.role}
                    onValueChange={(value) => setNewUserData({ ...newUserData, role: value })}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleCreateUser}
                    disabled={createUserMutation.isPending}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="bg-gray-800 border-gray-700" style={{border: '5px solid red'}}>
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
                        <TableHead className="text-gray-300">Last Login</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(users || []).map((user) => (
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
                                <div className="text-gray-400 text-sm">ID: {user.id.slice(0, 8)}...</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-white">{user.email}</TableCell>
                          <TableCell className="text-white font-medium">${formatBalance(user.balance)}</TableCell>
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
                              value={user.trading_mode || 'normal'}
                              onValueChange={(value: 'win' | 'normal' | 'lose') =>
                                handleTradingModeChange(user.id, value)
                              }
                              disabled={!isSuperAdmin}
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
                          <TableCell className="text-white">
                            {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsUserDialogOpen(true);
                                }}
                                className="text-gray-400 hover:text-white"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // Handle edit user
                                  console.log('Edit user:', user.id);
                                  toast({ title: "Edit User", description: "Edit functionality coming soon" });
                                }}
                                className="text-gray-400 hover:text-white"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              {/* Always show delete button for debugging - will fix role check */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // Handle delete user
                                  if (confirm(`Are you sure you want to delete user ${user.username}? This action cannot be undone.`)) {
                                    handleDeleteUser(user.id, user.username);
                                  }
                                }}
                                className="text-gray-400 hover:text-red-400"
                                title={`Delete ${user.username} (Debug: isSuperAdmin=${isSuperAdmin}, role=${user.role})`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trades Tab - Advanced Trading Control */}
          <TabsContent value="trades" className="space-y-6">
            {/* Trading Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Active Trades</p>
                      <p className="text-3xl font-bold text-white">
                        {trades?.filter(t => t.result === 'pending').length || 0}
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
                        {trades && trades.length > 0 ?
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
                        ${trades?.reduce((sum, t) => sum + t.amount, 0).toLocaleString() || 0}
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
                        ${trades?.reduce((sum, t) => sum + (t.profit || 0), 0).toLocaleString() || 0}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trading Settings Control */}
            {isSuperAdmin && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Trading Duration Settings</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Configure duration-based trading parameters (30s min $100, 60s min $1000)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-medium">30 Second Trading</h3>
                        <Badge className="bg-green-600 text-white">Enabled</Badge>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Min Amount:</span>
                          <span className="text-white">$100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Profit %:</span>
                          <span className="text-white">10%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Active Trades:</span>
                          <span className="text-white">
                            {trades?.filter(t => t.duration === 30 && t.result === 'pending').length || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-white font-medium">60 Second Trading</h3>
                        <Badge className="bg-green-600 text-white">Enabled</Badge>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Min Amount:</span>
                          <span className="text-white">$1,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Profit %:</span>
                          <span className="text-white">15%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Active Trades:</span>
                          <span className="text-white">
                            {trades?.filter(t => t.duration === 60 && t.result === 'pending').length || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                      Real-time trading activity and manual controls
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
                        {isSuperAdmin && <TableHead className="text-gray-300">Control</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(trades || []).slice(0, 10).map((trade) => {
                        const timeLeft = trade.result === 'pending' ?
                          Math.max(0, new Date(trade.expires_at).getTime() - Date.now()) : 0;
                        const secondsLeft = Math.floor(timeLeft / 1000);

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
                            {isSuperAdmin && (
                              <TableCell>
                                {trade.result === 'pending' ? (
                                  <div className="flex items-center space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleManualTradeControl(trade.id, 'win')}
                                      disabled={manualTradeControlMutation.isPending}
                                      className="text-green-400 hover:text-green-300"
                                      title="Force Win"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleManualTradeControl(trade.id, 'lose')}
                                      disabled={manualTradeControlMutation.isPending}
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
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Transactions</p>
                      <p className="text-2xl font-bold text-white">{transactions?.length || 0}</p>
                    </div>
                    <CreditCard className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Pending</p>
                      <p className="text-2xl font-bold text-white">
                        {transactions?.filter(t => t.status === 'pending').length || 0}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Volume</p>
                      <p className="text-2xl font-bold text-white">
                        ${transactions?.reduce((sum, t) => sum + t.amount, 0).toLocaleString() || 0}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Completed</p>
                      <p className="text-2xl font-bold text-white">
                        {transactions?.filter(t => t.status === 'completed').length || 0}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Financial Transactions</CardTitle>
                <CardDescription className="text-gray-400">
                  Monitor and manage all financial transactions
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
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(transactions || []).slice(0, 10).map((transaction) => (
                        <TableRow key={transaction.id} className="border-gray-700 hover:bg-gray-700/50">
                          <TableCell>
                            <div className="text-white font-mono text-sm">
                              {transaction.id.slice(0, 8)}...
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
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-white"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
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
                <CardTitle className="text-white flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Trading Control Center</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Advanced controls for trading outcomes and platform management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isSuperAdmin && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h3 className="text-white font-medium mb-3">Global Trading Control</h3>
                      <div className="space-y-3">
                        <Button className="w-full bg-green-600 hover:bg-green-700">
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Enable All Trading
                        </Button>
                        <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                          <PauseCircle className="w-4 h-4 mr-2" />
                          Pause Trading
                        </Button>
                        <Button className="w-full bg-red-600 hover:bg-red-700">
                          <StopCircle className="w-4 h-4 mr-2" />
                          Emergency Stop
                        </Button>
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-4">
                      <h3 className="text-white font-medium mb-3">Market Control</h3>
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
                      <h3 className="text-white font-medium mb-3">System Status</h3>
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
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Requests Tab */}
          <TabsContent value="pending" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Deposits */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <span>Pending Deposits</span>
                    <Badge variant="secondary" className="ml-2">
                      {pendingRequests?.deposits?.length || 0}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Review and approve user deposit requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingRequests?.deposits?.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No pending deposits</p>
                      </div>
                    ) : (
                      pendingRequests?.deposits?.map((deposit: any) => (
                        <div key={deposit.id} className="bg-gray-700 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-white font-medium">{deposit.username}</p>
                              <p className="text-sm text-gray-400">Balance: ${deposit.user_balance}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-400">${deposit.amount}</p>
                              <p className="text-sm text-gray-400">{deposit.currency}</p>
                            </div>
                          </div>

                          {deposit.tx_hash && (
                            <div className="text-sm">
                              <p className="text-gray-400">Transaction Hash:</p>
                              <p className="text-blue-400 font-mono break-all">{deposit.tx_hash}</p>
                            </div>
                          )}

                          <div className="text-sm text-gray-400">
                            <p>Requested: {new Date(deposit.created_at).toLocaleString()}</p>
                            <p>Status: <span className="text-yellow-400">{deposit.status}</span></p>
                          </div>

                          {/* Receipt Display */}
                          {deposit.receiptUploaded && deposit.receiptViewUrl && (
                            <div className="bg-gray-600 rounded-lg p-3">
                              <p className="text-sm text-gray-300 mb-2">📄 Receipt Uploaded:</p>
                              <div className="flex items-center space-x-2">
                                <Button
                                  onClick={() => setSelectedReceipt({
                                    url: deposit.receiptViewUrl,
                                    filename: deposit.receiptFile?.originalname || 'Receipt'
                                  })}
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-white"
                                >
                                  View Receipt
                                </Button>
                                {deposit.receiptFile?.originalname && (
                                  <span className="text-xs text-gray-400">
                                    {deposit.receiptFile.originalname}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex space-x-2">
                            <Button
                              onClick={() => approveDepositMutation.mutate({
                                depositId: deposit.id,
                                action: 'approve'
                              })}
                              disabled={approveDepositMutation.isPending}
                              className="bg-green-600 hover:bg-green-700 flex-1"
                              size="sm"
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => approveDepositMutation.mutate({
                                depositId: deposit.id,
                                action: 'reject',
                                reason: 'Invalid transaction proof'
                              })}
                              disabled={approveDepositMutation.isPending}
                              variant="destructive"
                              className="flex-1"
                              size="sm"
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Pending Withdrawals */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-red-400" />
                    <span>Pending Withdrawals</span>
                    <Badge variant="secondary" className="ml-2">
                      {pendingRequests?.withdrawals?.length || 0}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Review and approve user withdrawal requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingRequests?.withdrawals?.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No pending withdrawals</p>
                      </div>
                    ) : (
                      pendingRequests?.withdrawals?.map((withdrawal: any) => (
                        <div key={withdrawal.id} className="bg-gray-700 rounded-lg p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-white font-medium">{withdrawal.username}</p>
                              <p className="text-sm text-gray-400">Balance: ${withdrawal.user_balance}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-red-400">${withdrawal.amount}</p>
                              <p className="text-sm text-gray-400">{withdrawal.currency}</p>
                            </div>
                          </div>

                          <div className="text-sm">
                            <p className="text-gray-400">Wallet Address:</p>
                            <p className="text-blue-400 font-mono break-all">{withdrawal.wallet_address}</p>
                          </div>

                          <div className="text-sm text-gray-400">
                            <p>Requested: {new Date(withdrawal.created_at).toLocaleString()}</p>
                            <p>Status: <span className="text-yellow-400">{withdrawal.status}</span></p>
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              onClick={() => approveWithdrawalMutation.mutate({
                                withdrawalId: withdrawal.id,
                                action: 'approve'
                              })}
                              disabled={approveWithdrawalMutation.isPending}
                              className="bg-green-600 hover:bg-green-700 flex-1"
                              size="sm"
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => approveWithdrawalMutation.mutate({
                                withdrawalId: withdrawal.id,
                                action: 'reject',
                                reason: 'Insufficient verification'
                              })}
                              disabled={approveWithdrawalMutation.isPending}
                              variant="destructive"
                              className="flex-1"
                              size="sm"
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Support Center</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Manage user support and communication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Support System</h3>
                  <p className="text-gray-400 mb-4">
                    Advanced support ticket management and live chat system coming soon
                  </p>
                  <Button variant="outline">
                    Configure Support Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Details Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>User Details</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Complete user information and management options
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Username</label>
                  <div className="p-3 bg-gray-700 rounded border border-gray-600">
                    {selectedUser.username}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Email</label>
                  <div className="p-3 bg-gray-700 rounded border border-gray-600">
                    {selectedUser.email}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Role</label>
                  <div className="p-3 bg-gray-700 rounded border border-gray-600">
                    <Badge variant={selectedUser.role === 'admin' ? 'default' : 'secondary'}>
                      {selectedUser.role}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Status</label>
                  <div className="p-3 bg-gray-700 rounded border border-gray-600">
                    <Badge variant={selectedUser.isActive ? 'default' : 'destructive'}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Balance</label>
                  <div className="p-3 bg-gray-700 rounded border border-gray-600">
                    ${selectedUser.balance ? formatBalance(selectedUser.balance) : '0.00'}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Trading Mode</label>
                  <div className="p-3 bg-gray-700 rounded border border-gray-600">
                    <Badge
                      variant={
                        selectedUser.trading_mode === 'win' ? 'default' :
                        selectedUser.trading_mode === 'lose' ? 'destructive' : 'secondary'
                      }
                    >
                      {selectedUser.trading_mode?.toUpperCase() || 'NORMAL'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Created</label>
                  <div className="p-3 bg-gray-700 rounded border border-gray-600">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Last Login</label>
                  <div className="p-3 bg-gray-700 rounded border border-gray-600">
                    {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleDateString() : 'Never'}
                  </div>
                </div>
              </div>

              {/* Super Admin Actions */}
              {isSuperAdmin && (
                <div className="border-t border-gray-600 pt-4">
                  <h3 className="text-lg font-medium text-white mb-4">Super Admin Actions</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      className="bg-green-600 hover:bg-green-700 border-green-500"
                      onClick={() => {
                        setBalanceUpdateData({
                          userId: selectedUser.id,
                          amount: '',
                          action: 'add'
                        });
                        setShowBalanceModal(true);
                      }}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Deposit
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-orange-600 hover:bg-orange-700 border-orange-500"
                      onClick={() => {
                        setBalanceUpdateData({
                          userId: selectedUser.id,
                          amount: '',
                          action: 'subtract'
                        });
                        setShowBalanceModal(true);
                      }}
                    >
                      <ArrowDown className="w-4 h-4 mr-2" />
                      Withdraw
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-blue-600 hover:bg-blue-700 border-blue-500"
                      onClick={() => {
                        setPasswordUpdateData({
                          userId: selectedUser.id,
                          username: selectedUser.username,
                          newPassword: '',
                          confirmPassword: ''
                        });
                        setShowPasswordModal(true);
                      }}
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Reset Password
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-cyan-600 hover:bg-cyan-700 border-cyan-500"
                      onClick={() => {
                        setWalletUpdateData({
                          userId: selectedUser.id,
                          walletAddress: selectedUser.wallet_address || ''
                        });
                        setShowWalletModal(true);
                      }}
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Manage Wallet
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-indigo-600 hover:bg-indigo-700 border-indigo-500"
                      onClick={() => {
                        setUserEditData({
                          userId: selectedUser.id,
                          username: selectedUser.username,
                          email: selectedUser.email,
                          balance: selectedUser.balance?.toString() || '0',
                          walletAddress: selectedUser.wallet_address || '',
                          tradingMode: selectedUser.trading_mode || 'normal',
                          role: selectedUser.role,
                          status: selectedUser.isActive ? 'active' : 'inactive'
                        });
                        setShowUserEditModal(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit User
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-red-600 hover:bg-red-700 border-red-500"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete user ${selectedUser.username}? This action cannot be undone.`)) {
                          handleDeleteUser(selectedUser.id, selectedUser.username);
                          setIsUserDialogOpen(false);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete User
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Balance Update Modal */}
      <Dialog open={showBalanceModal} onOpenChange={setShowBalanceModal}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>
                {balanceUpdateData.action === 'add' ? '💰 Deposit to' : '💸 Withdraw from'} {
                  users?.find(u => u.id === balanceUpdateData.userId)?.username || 'User'
                }
              </span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {balanceUpdateData.action === 'add' ? 'Add funds to' : 'Subtract funds from'} user's account
              {users?.find(u => u.id === balanceUpdateData.userId)?.balance &&
                ` (Current Balance: $${Number(users.find(u => u.id === balanceUpdateData.userId)?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Action</label>
              <Select
                value={balanceUpdateData.action}
                onValueChange={(value: 'add' | 'subtract') =>
                  setBalanceUpdateData(prev => ({ ...prev, action: value }))
                }
              >
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">
                    <span className="text-green-600 font-bold">ADD (Deposit)</span>
                  </SelectItem>
                  <SelectItem value="subtract">
                    <span className="text-red-600 font-bold">SUBTRACT (Withdrawal)</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Amount (USDT)</label>
              <Input
                type="number"
                placeholder="Enter amount..."
                value={balanceUpdateData.amount}
                onChange={(e) => setBalanceUpdateData(prev => ({ ...prev, amount: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowBalanceModal(false)}
                className="border-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (balanceUpdateData.amount && parseFloat(balanceUpdateData.amount) > 0) {
                    balanceUpdateMutation.mutate(balanceUpdateData);
                  } else {
                    toast({
                      title: "Invalid Amount",
                      description: "Please enter a valid amount greater than 0",
                      variant: "destructive"
                    });
                  }
                }}
                disabled={balanceUpdateMutation.isPending}
                className={balanceUpdateData.action === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {balanceUpdateMutation.isPending ? 'Processing...' :
                 balanceUpdateData.action === 'add' ? 'Process Deposit' : 'Process Withdrawal'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Update Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Reset Password</DialogTitle>
            <DialogDescription className="text-gray-400">
              Reset password for user: {passwordUpdateData.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                New Password
              </label>
              <Input
                type="password"
                placeholder="Enter new password (min 6 characters)"
                value={passwordUpdateData.newPassword}
                onChange={(e) => setPasswordUpdateData({
                  ...passwordUpdateData,
                  newPassword: e.target.value
                })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Confirm Password
              </label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={passwordUpdateData.confirmPassword}
                onChange={(e) => setPasswordUpdateData({
                  ...passwordUpdateData,
                  confirmPassword: e.target.value
                })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordUpdateData({
                    userId: '',
                    username: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
                className="bg-gray-600 hover:bg-gray-700 border-gray-500"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!passwordUpdateData.newPassword || passwordUpdateData.newPassword.length < 6) {
                    toast({
                      title: "Invalid Password",
                      description: "Password must be at least 6 characters long",
                      variant: "destructive"
                    });
                    return;
                  }
                  if (passwordUpdateData.newPassword !== passwordUpdateData.confirmPassword) {
                    toast({
                      title: "Password Mismatch",
                      description: "Passwords do not match",
                      variant: "destructive"
                    });
                    return;
                  }
                  passwordUpdateMutation.mutate({
                    userId: passwordUpdateData.userId,
                    newPassword: passwordUpdateData.newPassword
                  });
                }}
                disabled={passwordUpdateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {passwordUpdateMutation.isPending ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Wallet Update Modal */}
      <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center space-x-2">
              <Wallet className="w-5 h-5" />
              <span>🏦 Manage Wallet for {
                users?.find(u => u.id === walletUpdateData.userId)?.username || 'User'
              }</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Update user's wallet address for transactions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Current Wallet Address</label>
              <div className="p-3 bg-gray-700 rounded border border-gray-600 text-gray-400">
                {users?.find(u => u.id === walletUpdateData.userId)?.wallet_address || 'No wallet address set'}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">New Wallet Address</label>
              <Input
                type="text"
                placeholder="Enter new wallet address"
                value={walletUpdateData.walletAddress}
                onChange={(e) => setWalletUpdateData({
                  ...walletUpdateData,
                  walletAddress: e.target.value
                })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Previous Wallet Addresses</label>
              <div className="p-3 bg-gray-700 rounded border border-gray-600 text-gray-400">
                No previous wallet addresses found
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-600 rounded p-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm">
                  Changing the wallet address will move the current address to history
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowWalletModal(false);
                  setWalletUpdateData({
                    userId: '',
                    walletAddress: ''
                  });
                }}
                className="bg-gray-600 hover:bg-gray-700 border-gray-500"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!walletUpdateData.walletAddress.trim()) {
                    toast({
                      title: "Invalid Address",
                      description: "Please enter a valid wallet address",
                      variant: "destructive"
                    });
                    return;
                  }
                  walletUpdateMutation.mutate({
                    userId: walletUpdateData.userId,
                    walletAddress: walletUpdateData.walletAddress
                  });
                }}
                disabled={walletUpdateMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {walletUpdateMutation.isPending ? 'Updating...' : 'Update Wallet'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Edit Modal */}
      <Dialog open={showUserEditModal} onOpenChange={setShowUserEditModal}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Edit User</span>
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Update user information and settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Username</label>
                <Input
                  type="text"
                  value={userEditData.username}
                  onChange={(e) => setUserEditData({
                    ...userEditData,
                    username: e.target.value
                  })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <Input
                  type="email"
                  value={userEditData.email}
                  onChange={(e) => setUserEditData({
                    ...userEditData,
                    email: e.target.value
                  })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Balance</label>
                <Input
                  type="number"
                  step="0.01"
                  value={userEditData.balance}
                  onChange={(e) => setUserEditData({
                    ...userEditData,
                    balance: e.target.value
                  })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Wallet Address</label>
                <Input
                  type="text"
                  value={userEditData.walletAddress}
                  onChange={(e) => setUserEditData({
                    ...userEditData,
                    walletAddress: e.target.value
                  })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Trading Mode</label>
                <Select
                  value={userEditData.tradingMode}
                  onValueChange={(value) => setUserEditData({
                    ...userEditData,
                    tradingMode: value
                  })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">NORMAL</SelectItem>
                    <SelectItem value="win">WIN</SelectItem>
                    <SelectItem value="lose">LOSE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Role</label>
                <Select
                  value={userEditData.role}
                  onValueChange={(value) => setUserEditData({
                    ...userEditData,
                    role: value
                  })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Status</label>
                <Select
                  value={userEditData.status}
                  onValueChange={(value) => setUserEditData({
                    ...userEditData,
                    status: value
                  })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUserEditModal(false);
                  setUserEditData({
                    userId: '',
                    username: '',
                    email: '',
                    balance: '',
                    walletAddress: '',
                    tradingMode: 'normal',
                    role: 'user',
                    status: 'active'
                  });
                }}
                className="bg-gray-600 hover:bg-gray-700 border-gray-500"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!userEditData.username.trim() || !userEditData.email.trim()) {
                    toast({
                      title: "Invalid Data",
                      description: "Username and email are required",
                      variant: "destructive"
                    });
                    return;
                  }
                  userEditMutation.mutate(userEditData);
                }}
                disabled={userEditMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {userEditMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Viewer Modal */}
      <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              Receipt: {selectedReceipt?.filename}
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center p-4">
            {selectedReceipt && (
              <img
                src={selectedReceipt.url}
                alt="Receipt"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                onError={(e) => {
                  console.error('Failed to load receipt image');
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMzMzMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+UmVjZWlwdCBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

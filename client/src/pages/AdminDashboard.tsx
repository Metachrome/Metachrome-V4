import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { toast } from '../hooks/use-toast';
import { useAuth } from '../hooks/useAuth';
import { NotificationBell } from '../components/admin/NotificationBell';
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
  Trash2,
  FileCheck,
  Gift,
  PlayCircle,
  Minus,
  Key,
  Wallet,
  Send
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

// Helper function to calculate total portfolio value (USDT only with auto-conversion)
const calculateTotalPortfolioValue = (users: any[]): number => {
  return users.reduce((sum, user) => {
    const usdtBalance = parseBalance(user.balance);
    // All crypto is auto-converted to USDT, so total = USDT balance
    return sum + usdtBalance;
  }, 0);
};

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
  phone?: string;
  address?: string;
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
  amount: number | string; // Can be number or string from database
  symbol?: string;
  currency?: string;
  description?: string;
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

// Helper function to extract currency from transaction description
const extractCurrencyFromDescription = (transaction: Transaction): string => {
  if (transaction.symbol) return transaction.symbol;
  if (transaction.currency) return transaction.currency;

  // Parse currency from description for withdrawals
  if (transaction.type === 'withdrawal' && transaction.description) {
    const match = transaction.description.match(/- (BTC|ETH|USDT|SOL|USDT-ERC20|USDT-TRC20|USDT-BEP20)/);
    if (match) return match[1];
  }

  // Default to USDT for other transactions
  return 'USDT';
};

// Helper function to format transaction amount with currency
const formatTransactionAmount = (transaction: Transaction): string => {
  const currency = extractCurrencyFromDescription(transaction);
  // Convert to number if it's a string, then format
  const amount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount;
  return `${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })} ${currency}`;
};

export default function WorkingAdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingRequests, setPendingRequests] = useState<{
    deposits: any[];
    withdrawals: any[];
    total: number;
  }>({ deposits: [], withdrawals: [], total: 0 });
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  const [verificationStats, setVerificationStats] = useState<any>(null);
  const [redeemCodes, setRedeemCodes] = useState<any[]>([]);
  const [redeemStats, setRedeemStats] = useState<any>(null);
  const [showCreateCodeModal, setShowCreateCodeModal] = useState(false);
  const [showEditCodeModal, setShowEditCodeModal] = useState(false);
  const [editingCode, setEditingCode] = useState<any>(null);
  const [newRedeemCode, setNewRedeemCode] = useState({
    code: '',
    bonusAmount: '',
    maxUses: '',
    description: ''
  });
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

  // Receipt viewer state
  const [selectedReceipt, setSelectedReceipt] = useState<{url: string, filename: string} | null>(null);

  // Search and filter states
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Get current user role - with fallback for admin access
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const authToken = localStorage.getItem('authToken') || '';

  // Check if user is super admin through multiple methods
  const isSuperAdmin = currentUser.role === 'super_admin' ||
                      currentUser.role === 'superadmin' ||
                      currentUser.username === 'superadmin' ||
                      authToken.includes('superadmin') ||
                      authToken.includes('admin-session-superadmin');

  console.log('🔧 Current user:', currentUser);
  console.log('🔧 Auth token:', authToken.substring(0, 30) + '...');
  console.log('🔧 Current user role:', currentUser.role);
  console.log('🔧 Is Super Admin:', isSuperAdmin);
  console.log('🔧 Role check details:', {
    role: currentUser.role,
    username: currentUser.username,
    isSuper: currentUser.role === 'super_admin',
    isSuperadmin: currentUser.role === 'superadmin',
    isUsernameSuper: currentUser.username === 'superadmin',
    tokenHasSuper: authToken.includes('superadmin'),
    tokenHasAdminSession: authToken.includes('admin-session-superadmin'),
    finalResult: isSuperAdmin
  });

  // Force refresh transactions with aggressive cache busting
  const forceRefreshTransactions = async () => {
    try {
      console.log('🔄 FORCE refreshing transactions with aggressive cache busting...');

      // Clear any potential service worker cache
      if ('serviceWorker' in navigator && 'caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const superRandomId = Math.random().toString(36).substring(2, 15);

      const url = `/api/admin/transactions?_t=${timestamp}&_r=${randomId}&_bust=${Date.now()}&_force=${superRandomId}&_nocache=${Math.random()}`;
      console.log('🔄 Force fetching from URL:', url);

      const transactionsRes = await fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'X-Requested-With': 'XMLHttpRequest',
          'If-None-Match': '*',
          'X-Force-Refresh': 'true'
        },
        cache: 'no-store'
      });

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        console.log('💰 FORCE refreshed transactions:', transactionsData.length, 'transactions');
        console.log('💰 First 3 transaction IDs:', transactionsData.slice(0, 3).map(t => t.id));

        // Force React to re-render by creating a new array reference
        setTransactions([...transactionsData]);
        return true;
      } else {
        console.error('❌ Failed to force refresh transactions:', transactionsRes.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Force refresh error:', error);
      return false;
    }
  };

  // Refresh transactions only
  const refreshTransactions = async () => {
    return await forceRefreshTransactions();
  };

  // Fetch all data with improved error handling
  const fetchData = async () => {
    setLoading(true);
    let hasErrors = false;

    try {
      console.log('🔄 Fetching all data...');

      // Add cache-busting timestamp and headers
      const timestamp = Date.now();
      const cacheHeaders = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      };

      // Fetch users
      try {
        const usersRes = await fetch(`/api/admin/users?_t=${timestamp}`, {
          headers: cacheHeaders
        });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          console.log('👥 Users loaded:', usersData);
          setUsers(usersData);
        } else {
          console.error('❌ Failed to fetch users:', usersRes.status);
          hasErrors = true;
        }
      } catch (error) {
        console.error('❌ Users fetch error:', error);
        hasErrors = true;
      }

      // Fetch live trades
      try {
        const tradesRes = await fetch(`/api/admin/live-trades?_t=${timestamp}`, {
          headers: cacheHeaders
        });
        if (tradesRes.ok) {
          const tradesData = await tradesRes.json();
          console.log('🔴 Live trades loaded:', tradesData);
          const tradesArray = tradesData.trades || tradesData;
          setTrades(tradesArray);
        } else {
          console.error('❌ Failed to fetch trades:', tradesRes.status);
          hasErrors = true;
        }
      } catch (error) {
        console.error('❌ Trades fetch error:', error);
        hasErrors = true;
      }

      // Fetch transactions with aggressive cache busting
      try {
        const transactionsRes = await fetch(`/api/admin/transactions?_t=${timestamp}&_r=${Math.random()}`, {
          headers: {
            ...cacheHeaders,
            'X-Requested-With': 'XMLHttpRequest',
            'If-None-Match': '*'
          }
        });
        if (transactionsRes.ok) {
          const transactionsData = await transactionsRes.json();
          console.log('💰 Transactions loaded:', transactionsData.length, 'transactions');
          setTransactions(transactionsData);
        } else {
          console.error('❌ Failed to fetch transactions:', transactionsRes.status);
          hasErrors = true;
        }
      } catch (error) {
        console.error('❌ Transactions fetch error:', error);
        hasErrors = true;
      }

      // Fetch stats
      try {
        const statsRes = await fetch(`/api/admin/stats?_t=${timestamp}`, {
          headers: cacheHeaders
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          console.log('📊 Stats loaded:', statsData);
          setSystemStats(statsData);
        } else {
          console.error('❌ Failed to fetch stats:', statsRes.status);
          hasErrors = true;
        }
      } catch (error) {
        console.error('❌ Stats fetch error:', error);
        hasErrors = true;
      }

      // Fetch pending requests
      try {
        const pendingRes = await fetch(`/api/admin/pending-requests?_t=${timestamp}`, {
          headers: cacheHeaders
        });
        if (pendingRes.ok) {
          const pendingData = await pendingRes.json();
          console.log('🔔 Pending requests loaded:', pendingData);
          setPendingRequests(pendingData);
        } else {
          console.error('❌ Failed to fetch pending requests:', pendingRes.status);
          hasErrors = true;
        }
      } catch (error) {
        console.error('❌ Pending requests fetch error:', error);
        hasErrors = true;
      }

      // Fetch pending verifications (enhanced)
      try {
        const verificationsRes = await fetch(`/api/admin/pending-verifications-enhanced?_t=${timestamp}`, {
          headers: cacheHeaders
        });
        if (verificationsRes.ok) {
          const verificationsData = await verificationsRes.json();
          console.log('📄 Enhanced pending verifications loaded:', verificationsData);

          // Use the enhanced response format
          if (verificationsData.enhanced) {
            setPendingVerifications(verificationsData.pending || []);
            console.log(`📄 Set ${verificationsData.pendingCount || 0} pending verifications`);
            console.log(`📄 Total documents in database: ${verificationsData.totalCount || 0}`);

            // Calculate verification stats from total documents
            const totalDocs = verificationsData.total || [];
            const stats = {
              pending: totalDocs.filter((v: any) => v.verification_status === 'pending').length,
              approved: totalDocs.filter((v: any) => v.verification_status === 'approved').length,
              rejected: totalDocs.filter((v: any) => v.verification_status === 'rejected').length,
              total: totalDocs.length
            };
            setVerificationStats(stats);
          } else {
            // Fallback to regular response format
            setPendingVerifications(verificationsData);
            const stats = {
              pending: verificationsData.filter((v: any) => v.verification_status === 'pending').length,
              approved: verificationsData.filter((v: any) => v.verification_status === 'approved').length,
              rejected: verificationsData.filter((v: any) => v.verification_status === 'rejected').length,
              total: verificationsData.length
            };
            setVerificationStats(stats);
          }
        } else {
          console.error('❌ Failed to fetch enhanced pending verifications:', verificationsRes.status);
          // Fallback to regular endpoint
          try {
            const fallbackRes = await fetch(`/api/admin/pending-verifications?_t=${timestamp}`, {
              headers: cacheHeaders
            });
            if (fallbackRes.ok) {
              const fallbackData = await fallbackRes.json();
              setPendingVerifications(fallbackData);
              const stats = {
                pending: fallbackData.filter((v: any) => v.verification_status === 'pending').length,
                approved: fallbackData.filter((v: any) => v.verification_status === 'approved').length,
                rejected: fallbackData.filter((v: any) => v.verification_status === 'rejected').length,
                total: fallbackData.length
              };
              setVerificationStats(stats);
            }
          } catch (fallbackError) {
            console.error('❌ Fallback verification fetch error:', fallbackError);
            hasErrors = true;
          }
        }
      } catch (error) {
        console.error('❌ Enhanced pending verifications fetch error:', error);
        hasErrors = true;
      }

      // Fetch redeem codes
      try {
        const redeemCodesRes = await fetch(`/api/admin/redeem-codes?_t=${timestamp}`, {
          headers: cacheHeaders
        });
        if (redeemCodesRes.ok) {
          const redeemCodesData = await redeemCodesRes.json();
          console.log('🎁 Redeem codes loaded:', redeemCodesData);

          // Fetch redemption history for each code
          let codesWithHistory = redeemCodesData.codes || [];
          try {
            const historyRes = await fetch(`/api/admin/redeem-codes-usage-all?_t=${timestamp}`, {
              headers: cacheHeaders
            });
            if (historyRes.ok) {
              const historyData = await historyRes.json();
              const allRedemptions = historyData.data || [];

              // Group redemptions by code
              codesWithHistory = codesWithHistory.map(code => ({
                ...code,
                redemptions: allRedemptions.filter(r => r.code === code.code)
              }));

              console.log('🎁 Codes with redemption history:', codesWithHistory);
            }
          } catch (historyError) {
            console.log('⚠️ Could not fetch redemption history:', historyError);
          }

          setRedeemCodes(codesWithHistory);
          setRedeemStats(redeemCodesData.stats || {});
        } else {
          console.error('❌ Failed to fetch redeem codes:', redeemCodesRes.status);
          hasErrors = true;
        }
      } catch (error) {
        console.error('❌ Redeem codes fetch error:', error);
        hasErrors = true;
      }

      // Only show error if there were actual failures
      if (hasErrors) {
        toast({
          title: "Warning",
          description: "Some data failed to load. Check console for details.",
          variant: "destructive"
        });
      } else {
        console.log('✅ All data loaded successfully');
      }

    } catch (error) {
      console.error('❌ Unexpected error fetching data:', error);
      toast({
        title: "Error",
        description: "Unexpected error occurred while loading data",
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
          description: `Trading mode updated to ${mode.toUpperCase()}`,
          duration: 2000
        });

        // Update local state immediately for instant UI feedback
        setUsers(prevUsers => prevUsers.map(user =>
          user.id === userId ? { ...user, trading_mode: mode } : user
        ));

        // Don't call fetchData() immediately to avoid overriding the local state
        // The auto-refresh will pick up any server-side changes in 5 seconds
        console.log(`🎯 Trading mode for user ${userId} updated to ${mode.toUpperCase()} in UI`);
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

  // Delete trade function
  const deleteTrade = async (tradeId: string) => {
    try {
      console.log('🗑️ Deleting trade:', tradeId);

      // Optimistic update - remove from UI immediately
      const originalTrades = [...trades];
      setTrades(prev => prev.filter(t => t.id !== tradeId));

      const response = await fetch(`/api/admin/trades/${tradeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Trade deleted:', result);
        toast({
          title: "Trade Deleted",
          description: result.message || "Trade deleted successfully",
          duration: 3000
        });

        // Refresh data to ensure consistency
        fetchData();
      } else {
        // If deletion failed, restore original state
        console.log('🗑️ Delete failed, restoring original state...');
        setTrades(originalTrades);
        const error = await response.text();
        throw new Error(error || 'Failed to delete trade');
      }
    } catch (error) {
      console.error('❌ Error deleting trade:', error);
      // Restore original state on error
      setTrades(prev => [...trades]);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete trade",
        variant: "destructive",
        duration: 5000
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

        // Force refresh with delay to ensure server has processed the change
        setTimeout(() => {
          fetchData();
        }, 100);
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

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `User "${user.username}" deleted successfully`
        });

        // Force refresh with delay to ensure server has processed the change
        setTimeout(() => {
          fetchData();
        }, 100);
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
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

        // Force refresh with delay to ensure server has processed the change
        setTimeout(() => {
          fetchData();
        }, 100);
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

        // Force refresh with delay to ensure server has processed the change
        setTimeout(() => {
          fetchData();
        }, 100);
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

        // Force refresh with delay to ensure server has processed the change
        setTimeout(() => {
          fetchData();
        }, 100);
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
        // Refresh wallet history to show the updated history
        loadWalletHistory(selectedUserForAction.id);
        // Don't close the modal immediately so user can see the updated address
        // setShowWalletModal(false);

        // Force refresh with delay to ensure server has processed the change
        setTimeout(() => {
          fetchData();
        }, 100);
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

  // Approve/Reject deposit
  const handleDepositAction = async (depositId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      console.log('🏦 Deposit action:', depositId, action, reason);
      const response = await fetch(`/api/admin/deposits/${depositId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ action, reason })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: `Deposit ${action === 'approve' ? 'Approved' : 'Rejected'}`,
          description: result.message || `Deposit ${action}d successfully`,
          duration: 3000
        });
        fetchData(); // Refresh all data
      } else {
        const error = await response.text();
        throw new Error(error || 'Failed to process deposit');
      }
    } catch (error) {
      console.error('Failed to process deposit:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process deposit",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  // Handle withdrawal actions
  const handleWithdrawalAction = async (withdrawalId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      console.log('💰 Withdrawal action:', withdrawalId, action, reason);
      const response = await fetch(`/api/admin/withdrawals/${withdrawalId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ action, reason })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: `Withdrawal ${action === 'approve' ? 'Approved' : 'Rejected'}`,
          description: result.message || `Withdrawal ${action}d successfully`,
          duration: 3000
        });
        fetchData(); // Refresh all data
      } else {
        const error = await response.text();
        throw new Error(error || 'Failed to process withdrawal');
      }
    } catch (error) {
      console.error('Failed to process withdrawal:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process withdrawal",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  // Handle document verification actions
  const handleDocumentAction = async (documentId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      console.log('📄 Document action:', documentId, action, reason);
      const response = await fetch(`/api/admin/verify-document/${documentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          status: action === 'approve' ? 'approved' : 'rejected',
          adminNotes: reason || `Document ${action}d by admin`
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: `Document ${action === 'approve' ? 'Approved' : 'Rejected'}`,
          description: result.message || `Document ${action}d successfully`,
          duration: 3000
        });
        fetchData(); // Refresh all data
      } else {
        const error = await response.text();
        throw new Error(error || 'Failed to process document');
      }
    } catch (error) {
      console.error('Failed to process document:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process document",
        variant: "destructive",
        duration: 5000
      });
    }
  };



  // Handle transaction deletion
  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      console.log('🗑️ Deleting transaction:', transactionId);
      console.log('🗑️ Current transactions count before deletion:', transactions.length);

      // Show loading state
      const originalTransactions = [...transactions];
      setTransactions(prev => prev.map(t =>
        t.id === transactionId ? { ...t, deleting: true } : t
      ));

      const response = await fetch(`/api/admin/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('🗑️ Delete response:', result);

        // Immediately refresh from server
        console.log('🔄 Immediately refreshing transactions after successful deletion...');
        const refreshSuccess = await refreshTransactions();

        if (refreshSuccess) {
          toast({
            title: "Transaction Deleted",
            description: result.message || "Transaction deleted successfully",
            duration: 3000
          });
        } else {
          // If refresh failed, manually remove from state
          setTransactions(prev => prev.filter(t => t.id !== transactionId));
          toast({
            title: "Transaction Deleted",
            description: "Transaction deleted (manual update)",
            duration: 3000
          });
        }

      } else {
        // If deletion failed, restore original state
        console.log('🗑️ Delete failed, restoring original state...');
        setTransactions(originalTransactions);
        const error = await response.text();
        throw new Error(error || 'Failed to delete transaction');
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      // Restore original state on error
      console.log('🗑️ Error occurred, restoring original state...');
      setTransactions(prev => prev.filter(t => !t.deleting));
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete transaction",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  // View receipt in popup
  const viewReceipt = (filename: string) => {
    const receiptUrl = `/api/admin/receipt/${filename}/view`;
    window.open(receiptUrl, 'receiptViewer', 'width=800,height=600,scrollbars=yes,resizable=yes');
  };

  // Handle redeem code actions
  const handleRedeemCodeAction = async (codeId: string, action: 'edit' | 'disable' | 'delete') => {
    try {
      console.log('🎁 Redeem code action:', codeId, action);

      if (action === 'edit') {
        // Find the code to edit
        const codeToEdit = redeemCodes.find(code => code.id === codeId || code.code === codeId);
        if (codeToEdit) {
          setEditingCode(codeToEdit);
          setShowEditCodeModal(true);
        } else {
          toast({
            title: "Error",
            description: "Code not found",
            variant: "destructive"
          });
        }
        return;
      }

      // Use the correct API endpoint that exists in the server
      const response = await fetch(`/api/admin/redeem-codes/${codeId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ action: action })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: `Code ${action === 'disable' ? 'Disabled' : 'Deleted'}`,
          description: result.message || `Code ${action}d successfully`,
          duration: 3000
        });

        // Force refresh with delay to ensure server has processed the change
        setTimeout(() => {
          fetchData();
        }, 100);
      } else {
        const error = await response.text();
        throw new Error(error || `Failed to ${action} code`);
      }
    } catch (error) {
      console.error(`Failed to ${action} redeem code:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${action} code`,
        variant: "destructive",
        duration: 5000
      });
    }
  };

  // Edit existing redeem code
  const handleEditRedeemCode = async () => {
    try {
      if (!editingCode || !editingCode.bonus_amount) {
        toast({
          title: "Missing Information",
          description: "Please fill in bonus amount",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`/api/admin/redeem-codes/${editingCode.id}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          action: 'edit',
          newAmount: parseFloat(editingCode.bonus_amount),
          newDescription: editingCode.description,
          newMaxUses: editingCode.max_uses ? parseInt(editingCode.max_uses) : null
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Code Updated",
          description: `Redeem code ${editingCode.code} updated successfully`,
          duration: 3000
        });
        setShowEditCodeModal(false);
        setEditingCode(null);
        fetchData(); // Refresh all data
      } else {
        const error = await response.text();
        throw new Error(error || 'Failed to update code');
      }
    } catch (error) {
      console.error('Failed to update redeem code:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update code",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  // Create new redeem code
  const handleCreateRedeemCode = async () => {
    try {
      if (!newRedeemCode.code || !newRedeemCode.bonusAmount) {
        toast({
          title: "Missing Information",
          description: "Please fill in code and bonus amount",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch('/api/admin/redeem-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          code: newRedeemCode.code.toUpperCase(),
          bonusAmount: parseFloat(newRedeemCode.bonusAmount),
          maxUses: newRedeemCode.maxUses ? parseInt(newRedeemCode.maxUses) : null,
          description: newRedeemCode.description || `Bonus code for ${newRedeemCode.bonusAmount} USDT`
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Code Created",
          description: `Redeem code ${newRedeemCode.code} created successfully`,
          duration: 3000
        });
        setShowCreateCodeModal(false);
        setNewRedeemCode({ code: '', bonusAmount: '', maxUses: '', description: '' });
        fetchData(); // Refresh all data
      } else {
        const error = await response.text();
        throw new Error(error || 'Failed to create code');
      }
    } catch (error) {
      console.error('Failed to create redeem code:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create code",
        variant: "destructive",
        duration: 5000
      });
    }
  };



  const openSuperAdminModal = (user: User, action: string) => {
    console.log('🔧 Opening super admin modal:', action, 'for user:', user.username);
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

  // Real-time updates will be handled by the polling mechanism for now
  // WebSocket integration can be added later when the hook is properly imported

  // Load data on component mount
  useEffect(() => {
    fetchData();
    // No auto-refresh - rely on real-time notifications and manual Force Refresh only
  }, []);

  const getTradingModeBadge = (mode: string) => {
    const colors = {
      win: 'bg-green-600',
      normal: 'bg-blue-600',
      lose: 'bg-red-600'
    };
    const safeMode = mode || 'normal';
    return (
      <Badge className={`${colors[safeMode as keyof typeof colors]} text-white`}>
        {safeMode.toUpperCase()}
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
    <>
      <style>{`
        .admin-table-container {
          scrollbar-width: thin;
          scrollbar-color: #6b7280 #374151;
        }
        .admin-table-container::-webkit-scrollbar {
          height: 8px;
        }
        .admin-table-container::-webkit-scrollbar-track {
          background: #374151;
          border-radius: 4px;
        }
        .admin-table-container::-webkit-scrollbar-thumb {
          background: #6b7280;
          border-radius: 4px;
        }
        .admin-table-container::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
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
              {/* Real-time Notification Bell */}
              {user?.role === 'super_admin' && <NotificationBell onTabChange={setActiveTab} />}

              <Button
                onClick={forceRefreshTransactions}
                variant="outline"
                size="sm"
                className="bg-red-600 hover:bg-red-700 border-red-600"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Force Refresh Transactions
              </Button>
              <div className="flex items-center space-x-2 bg-gray-700 rounded-lg px-3 py-2">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user?.username ? user.username.substring(0, 2).toUpperCase() : 'SA'}
                  </span>
                </div>
                <div className="text-sm">
                  <div className="text-white font-medium">{user?.username || 'superadmin'}</div>
                  <div className="text-gray-400 text-xs">
                    {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
            <TabsTrigger value="verification" className="flex-shrink-0 px-4 py-2">
              <FileCheck className="w-4 h-4 mr-2" />
              Verification
            </TabsTrigger>
            <TabsTrigger value="redeem-codes" className="flex-shrink-0 px-4 py-2">
              <Gift className="w-4 h-4 mr-2" />
              Redeem Codes
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
                        ${trades.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0).toLocaleString()}
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
                        {calculateTotalBalance(users).toLocaleString()} USDT
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
                  <Button
                    className="h-20 bg-purple-600 hover:bg-purple-700"
                    onClick={() => window.location.href = '/admin/test'}
                  >
                    <div className="text-center">
                      <Settings className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm">Test Features</div>
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
                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">Total Platform Balance</p>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-green-400">
                          {calculateTotalBalance(users).toLocaleString()} USDT
                        </p>
                        <p className="text-sm text-gray-400">
                          All crypto auto-converted to USDT
                        </p>
                      </div>
                      <div className="text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded">
                        💱 Unified USDT balance system
                      </div>
                    </div>
                    <Wallet className="w-8 h-8 text-purple-500" />
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
                {/* Search Input */}
                <div className="mb-4">
                  <Input
                    placeholder="Search users by username, email, or ID..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="border border-gray-700 rounded-lg overflow-x-auto admin-table-container" style={{ maxWidth: '100%' }}>
                  <Table className="w-full" style={{ minWidth: '1200px' }}>
                    <TableHeader>
                      <TableRow className="bg-gray-700">
                        <TableHead className="text-gray-300 min-w-[200px]">User</TableHead>
                        <TableHead className="text-gray-300 min-w-[250px]">Email</TableHead>
                        <TableHead className="text-gray-300 min-w-[120px]">Balance</TableHead>
                        <TableHead className="text-gray-300 min-w-[100px]">Role</TableHead>
                        <TableHead className="text-gray-300 min-w-[100px]">Status</TableHead>
                        <TableHead className="text-gray-300 min-w-[120px]">Trading Mode</TableHead>
                        <TableHead className="text-gray-300 min-w-[400px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(users) ? (
                        <>
                          {console.log('📊 Rendering users table with', users.length, 'users')}
                          {users
                            .filter((user) => {
                              if (!userSearchTerm) return true;
                              const searchLower = userSearchTerm.toLowerCase();
                              return (
                                user.username?.toLowerCase().includes(searchLower) ||
                                user.email?.toLowerCase().includes(searchLower) ||
                                user.id?.toLowerCase().includes(searchLower)
                              );
                            })
                            .sort((a, b) => {
                              // Sort by created_at in descending order (newest first)
                              const dateA = new Date(a.created_at || 0).getTime();
                              const dateB = new Date(b.created_at || 0).getTime();
                              return dateB - dateA;
                            })
                            .map((user) => (
                        <TableRow key={user.id} className="border-gray-700 hover:bg-gray-700/50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-white font-medium truncate" title={user.username}>
                                  {user.username.length > 20 ? `${user.username.slice(0, 20)}...` : user.username}
                                </div>
                                <div className="text-gray-400 text-sm">ID: {user.id ? user.id.slice(0, 8) : 'N/A'}...</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-white">
                            <div className="truncate" title={user.email}>
                              {user.email.length > 30 ? `${user.email.slice(0, 30)}...` : user.email}
                            </div>
                          </TableCell>
                          <TableCell className="text-white">
                            <div className="space-y-1">
                              <div className="font-medium text-green-400">
                                {formatBalance(user.balance)} USDT
                              </div>
                              <div className="text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded border border-blue-700">
                                💱 Auto-converts all crypto deposits to USDT
                              </div>
                            </div>
                          </TableCell>
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
                          <TableCell className="min-w-[300px]">
                            <div className="flex items-center space-x-1 flex-wrap">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  console.log('🔍 View button clicked for user:', user.username);
                                  handleUserView(user);
                                }}
                                className="text-gray-400 hover:text-white"
                                title="View User Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  console.log('✏️ Edit button clicked for user:', user.username);
                                  handleUserEdit(user);
                                }}
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
                                    onClick={() => {
                                      console.log('💰 Deposit button clicked for user:', user.username);
                                      openSuperAdminModal(user, 'deposit');
                                    }}
                                    className="text-green-400 hover:text-green-300"
                                    title="Deposit Money"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      console.log('💸 Withdrawal button clicked for user:', user.username);
                                      openSuperAdminModal(user, 'withdrawal');
                                    }}
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
                                  {/* Delete button - only for regular users, not current user */}
                                  {user.role === 'user' && user.id !== currentUser.id ? (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteUser(user)}
                                      className="text-red-500 hover:text-red-400 border border-red-500"
                                      title="Delete User"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  ) : null}
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                          ))}
                        </>
                      ) : []}
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
                        {systemStats?.winRate || 0}%
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
                        ${trades.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0).toLocaleString()}
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
                        ${(() => {
                          const totalProfit = systemStats?.totalProfit || 0;
                          const totalLoss = systemStats?.totalLoss || 0;
                          const totalPnL = totalProfit - totalLoss;
                          return totalPnL.toLocaleString();
                        })()}
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
                              {trade.username || 'Unknown'}
                            </TableCell>
                            <TableCell className="text-white font-medium">{trade.symbol}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {trade.direction === 'up' ? (
                                  <ArrowUp className="w-4 h-4 text-green-500" />
                                ) : (
                                  <ArrowDown className="w-4 h-4 text-red-500" />
                                )}
                                <span className="text-white">{trade.direction === 'up' ? 'BUY' : 'SELL'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-white">{trade.amount.toLocaleString()} USDT</TableCell>
                            <TableCell className="text-white">{trade.duration}s</TableCell>
                            <TableCell className="text-white font-mono">{trade.entry_price} USDT</TableCell>
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
                              <div className="flex items-center space-x-1">
                                {trade.result === 'pending' ? (
                                  <>
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
                                  </>
                                ) : null}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteTrade(trade.id)}
                                  className="text-gray-400 hover:text-red-400"
                                  title="Delete Trade"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
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
                {/* Debug Info Panel */}
                <div className="bg-gray-800 border border-yellow-500 rounded-lg p-4 mb-4">
                  <h4 className="text-yellow-400 font-semibold mb-2">🐛 Debug Info</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>React State Count: <span className="text-white font-mono">{transactions.length}</span></div>
                    <div>First 3 IDs: <span className="text-white font-mono text-xs">
                      {transactions.slice(0, 3).map(t => t.id.slice(0, 8)).join(', ')}
                    </span></div>
                    <div>Last Updated: <span className="text-white font-mono">{new Date().toLocaleTimeString()}</span></div>
                  </div>
                </div>

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
                            {formatTransactionAmount(transaction)}
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
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              disabled={transaction.deleting}
                              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
                            >
                              {transaction.deleting ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
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

          {/* Pending Requests Tab */}
          <TabsContent value="pending" className="space-y-6">
            {/* Sync Old Withdrawals Button */}
            <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <RefreshCw className="w-6 h-6 text-white" />
                    <div>
                      <h3 className="text-white font-semibold">Sync Old Withdrawals</h3>
                      <p className="text-purple-100 text-sm">
                        Sync old withdrawal records to transaction history
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={async () => {
                      try {
                        setLoading(true);
                        const response = await fetch('/api/admin/sync-old-withdrawals', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json'
                          }
                        });

                        const data = await response.json();

                        if (response.ok) {
                          alert(`✅ Successfully synced ${data.synced} withdrawals!`);
                          // Refresh data
                          fetchData();
                        } else {
                          alert(`❌ Sync failed: ${data.error}`);
                        }
                      } catch (error) {
                        console.error('Sync error:', error);
                        alert('❌ Sync failed. Check console for details.');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="bg-white text-purple-600 hover:bg-purple-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync Now
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

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
                              <p className="text-sm text-gray-400">Balance: {deposit.user_balance} USDT</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-400">
                                {deposit.amount} {deposit.currency}
                              </p>
                              <p className="text-sm text-gray-400">{deposit.currency} Network</p>
                            </div>
                          </div>

                          {deposit.tx_hash && (
                            <div className="text-sm">
                              <p className="text-gray-400">Transaction Hash:</p>
                              <p className="text-blue-400 font-mono break-all">{deposit.tx_hash}</p>
                            </div>
                          )}

                          {deposit.receipt && (
                            <div className="text-sm">
                              <p className="text-gray-400 mb-2">Receipt:</p>
                              <div className="bg-gray-600 rounded-lg p-3">
                                {deposit.receipt.mimetype?.startsWith('image/') ? (
                                  <div className="space-y-2">
                                    <img
                                      src={deposit.receipt.url}
                                      alt="Transaction Receipt"
                                      className="max-w-full h-32 object-contain rounded border border-gray-500"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (nextElement) nextElement.style.display = 'block';
                                      }}
                                    />
                                    <div style={{display: 'none'}} className="text-red-400 text-xs">
                                      Failed to load image
                                    </div>
                                    <a
                                      href={deposit.receipt.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:text-blue-300 text-xs underline"
                                    >
                                      View Full Size
                                    </a>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <p className="text-white text-xs">{deposit.receipt.originalName}</p>
                                    <p className="text-gray-400 text-xs">
                                      {deposit.receipt.mimetype} • {Math.round(deposit.receipt.size / 1024)}KB
                                    </p>
                                    <a
                                      href={deposit.receipt.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:text-blue-300 text-xs underline"
                                    >
                                      Download File
                                    </a>
                                  </div>
                                )}
                              </div>
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
                                  onClick={() => viewReceipt(deposit.receiptFile?.filename || '')}
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
                              onClick={() => handleDepositAction(deposit.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700 flex-1"
                              size="sm"
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleDepositAction(deposit.id, 'reject', 'Invalid transaction proof')}
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
                              <div className="text-sm space-y-1">
                                <p className="text-green-400 font-medium">Balance: {withdrawal.user_balance} USDT</p>
                                <p className="text-blue-400 text-xs">
                                  💱 Unified USDT balance (auto-converted)
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-red-400">
                                {withdrawal.amount} {withdrawal.currency}
                              </p>
                              <p className="text-sm text-gray-400">{withdrawal.currency} Network</p>
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

                          <div className="bg-green-900/20 border border-green-700 rounded p-3 my-3">
                            <div className="text-green-400 text-xs font-medium flex items-center mb-1">
                              <span className="mr-2">✅</span>
                              Withdrawal Processing
                            </div>
                            <div className="text-green-300 text-xs">
                              Approving this withdrawal will deduct <span className="font-bold text-red-400">{withdrawal.amount} USDT</span> from the user's unified USDT balance.
                              Simple and instant processing with auto-conversion system.
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleWithdrawalAction(withdrawal.id, 'approve')}
                              className="bg-green-600 hover:bg-green-700 flex-1"
                              size="sm"
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleWithdrawalAction(withdrawal.id, 'reject', 'Insufficient verification')}
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

          {/* Verification Tab */}
          <TabsContent value="verification" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Document Verification</CardTitle>
                <CardDescription className="text-gray-400">
                  Review and approve user verification documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Verification Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-400">
                        {verificationStats?.pending || 0}
                      </div>
                      <div className="text-gray-400 text-sm">Pending Review</div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">
                        {verificationStats?.approved || 0}
                      </div>
                      <div className="text-gray-400 text-sm">Approved</div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-red-400">
                        {verificationStats?.rejected || 0}
                      </div>
                      <div className="text-gray-400 text-sm">Rejected</div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-gray-400">
                        {verificationStats?.total || 0}
                      </div>
                      <div className="text-gray-400 text-sm">Total Documents</div>
                    </div>
                  </div>

                  {/* Pending Documents Table */}
                  <div className="border border-gray-700 rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-700">
                          <TableHead className="text-gray-300">User</TableHead>
                          <TableHead className="text-gray-300">Document Type</TableHead>
                          <TableHead className="text-gray-300">Submitted</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingVerifications.length === 0 ? (
                          <TableRow className="border-gray-700">
                            <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                              No pending verification documents
                            </TableCell>
                          </TableRow>
                        ) : (
                          pendingVerifications
                            .filter(doc => doc.verification_status === 'pending')
                            .map((doc) => (
                              <TableRow key={doc.id} className="border-gray-700">
                                <TableCell className="text-white">
                                  {doc.users?.email || doc.users?.username || 'Unknown User'}
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  {doc.document_type?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Unknown Type'}
                                </TableCell>
                                <TableCell className="text-gray-300">
                                  {doc.created_at ? new Date(doc.created_at).toLocaleString() : 'Unknown'}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={
                                      doc.verification_status === 'pending' ? 'bg-yellow-600' :
                                      doc.verification_status === 'approved' ? 'bg-green-600' :
                                      doc.verification_status === 'rejected' ? 'bg-red-600' :
                                      'bg-gray-600'
                                    }
                                  >
                                    {doc.verification_status?.charAt(0).toUpperCase() + doc.verification_status?.slice(1) || 'Unknown'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      className="bg-blue-600 hover:bg-blue-700"
                                      onClick={() => window.open(doc.document_url, 'docViewer', 'width=800,height=600')}
                                    >
                                      <Eye className="w-4 h-4 mr-1" />
                                      View
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() => handleDocumentAction(doc.id, 'approve')}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={() => handleDocumentAction(doc.id, 'reject', 'Document review required')}
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Reject
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Redeem Codes Tab */}
          <TabsContent value="redeem-codes" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Redeem Code Management</CardTitle>
                    <CardDescription className="text-gray-400">
                      Create and manage promotional redeem codes
                    </CardDescription>
                  </div>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => setShowCreateCodeModal(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Code
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Code Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400">
                        {redeemStats?.activeCodes || 0}
                      </div>
                      <div className="text-gray-400 text-sm">Active Codes</div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">
                        {redeemStats?.totalRedeemed || 0}
                      </div>
                      <div className="text-gray-400 text-sm">Total Redeemed</div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400">
                        {redeemStats?.bonusDistributed || 0} USDT
                      </div>
                      <div className="text-gray-400 text-sm">Bonus Distributed</div>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-400">
                        {redeemStats?.usageRate || 0}%
                      </div>
                      <div className="text-gray-400 text-sm">Usage Rate</div>
                    </div>
                  </div>

                  {/* Redeem Codes Table */}
                  <div className="border border-gray-700 rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-700">
                          <TableHead className="text-gray-300">Code</TableHead>
                          <TableHead className="text-gray-300">Bonus Amount</TableHead>
                          <TableHead className="text-gray-300">Usage</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Created</TableHead>
                          <TableHead className="text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {redeemCodes.length === 0 ? (
                          <TableRow className="border-gray-700">
                            <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                              No redeem codes found
                            </TableCell>
                          </TableRow>
                        ) : (
                          redeemCodes.map((code) => (
                            <TableRow key={code.id} className="border-gray-700">
                              <TableCell className="text-white font-mono">{code.code}</TableCell>
                              <TableCell className="text-green-400">{code.bonus_amount} USDT</TableCell>
                              <TableCell className="text-gray-300">
                                {code.used_count || 0} / {code.max_uses || '∞'}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    code.status === 'active' ? 'bg-green-600' :
                                    code.status === 'disabled' ? 'bg-red-600' :
                                    'bg-gray-600'
                                  }
                                >
                                  {code.status?.charAt(0).toUpperCase() + code.status?.slice(1) || 'Unknown'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-300">
                                {code.created_at ? new Date(code.created_at).toLocaleDateString() : 'Unknown'}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-gray-600"
                                    onClick={() => handleRedeemCodeAction(code.code || code.id, 'edit')}
                                  >
                                    <Edit className="w-4 h-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => handleRedeemCodeAction(code.code || code.id, 'disable')}
                                    disabled={code.status === 'disabled' || !code.is_active}
                                  >
                                    Disable
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-gray-600 hover:bg-gray-700"
                                    onClick={() => handleRedeemCodeAction(code.code || code.id, 'delete')}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* User Redemption History */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-white mb-4">User Redemption History</h3>
                    <div className="border border-gray-700 rounded-lg overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-700">
                            <TableHead className="text-gray-300">Code</TableHead>
                            <TableHead className="text-gray-300">User</TableHead>
                            <TableHead className="text-gray-300">Amount</TableHead>
                            <TableHead className="text-gray-300">Redeemed Date</TableHead>
                            <TableHead className="text-gray-300">Status</TableHead>
                            <TableHead className="text-gray-300">Trades Progress</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {redeemCodes.length === 0 ? (
                            <TableRow className="border-gray-700">
                              <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                                No redemptions yet
                              </TableCell>
                            </TableRow>
                          ) : (
                            redeemCodes.map((code) => {
                              // Get redemption history for this code
                              const codeRedemptions = code.redemptions || [];
                              if (codeRedemptions.length === 0) {
                                return (
                                  <TableRow key={`${code.id}-empty`} className="border-gray-700">
                                    <TableCell className="text-white font-mono">{code.code}</TableCell>
                                    <TableCell colSpan={5} className="text-center text-gray-400">
                                      No users have redeemed this code yet
                                    </TableCell>
                                  </TableRow>
                                );
                              }
                              return codeRedemptions.map((redemption, idx) => (
                                <TableRow key={`${code.id}-${idx}`} className="border-gray-700">
                                  <TableCell className="text-white font-mono">{code.code}</TableCell>
                                  <TableCell className="text-blue-400">{redemption.user}</TableCell>
                                  <TableCell className="text-green-400">{redemption.amount} USDT</TableCell>
                                  <TableCell className="text-gray-300">
                                    {new Date(redemption.date).toLocaleDateString()} {new Date(redemption.date).toLocaleTimeString()}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      className={
                                        redemption.status === 'completed' ? 'bg-green-600' :
                                        redemption.status === 'pending_trades' ? 'bg-yellow-600' :
                                        'bg-gray-600'
                                      }
                                    >
                                      {redemption.status === 'completed' ? 'Completed' : 'Pending Trades'}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-gray-300">
                                    {redemption.tradesCompleted}/{redemption.tradesRequired}
                                  </TableCell>
                                </TableRow>
                              ));
                            })
                          )}
                        </TableBody>
                      </Table>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full border border-gray-700 flex flex-col max-h-[90vh]">
            {/* Fixed Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-700">
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

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 px-6 py-4">
              <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Username:</span>
                <span className="text-white font-medium">{selectedUser.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-white">{selectedUser.email}</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Balance Details:</span>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 font-medium">USDT Balance</span>
                    <span className="text-white font-bold">{formatBalance(selectedUser.balance)} USDT</span>
                  </div>
                  <div className="bg-blue-900/20 border border-blue-700 rounded p-3">
                    <div className="text-blue-400 text-xs font-medium flex items-center mb-2">
                      <span className="mr-2">💱</span>
                      Auto-Conversion System
                    </div>
                    <div className="text-blue-300 text-xs space-y-1">
                      <div>• All cryptocurrency deposits (BTC, ETH, SOL, etc.) are automatically converted to USDT</div>
                      <div>• Real-time conversion rates with minimal fees (0.1-0.2%)</div>
                      <div>• Unified balance system - only USDT is stored</div>
                      <div>• Withdrawals are processed directly from USDT balance</div>
                    </div>
                  </div>
                  <div className="bg-green-900/20 border border-green-700 rounded p-2">
                    <div className="text-green-400 text-xs font-medium flex items-center">
                      <span className="mr-2">✅</span>
                      Benefits
                    </div>
                    <div className="text-green-300 text-xs mt-1">
                      • Simplified balance management • No conversion delays • Instant withdrawals
                    </div>
                  </div>
                </div>
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
                <span className="text-white font-medium">{(selectedUser.trading_mode || 'normal').toUpperCase()}</span>
              </div>
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between items-start">
                  <span className="text-gray-400">Wallet Address:</span>
                  <div className="flex-1 ml-3">
                    {selectedUser.wallet_address ? (
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <span className="text-white font-mono text-xs bg-gray-700 px-2 py-1 rounded break-all flex-1">
                            {selectedUser.wallet_address}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(selectedUser.wallet_address || '')}
                            className="text-gray-400 hover:text-white p-1 flex-shrink-0"
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

              {/* Phone Number Section */}
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between items-start">
                  <span className="text-gray-400">Phone Number:</span>
                  <div className="flex-1 ml-3 text-right">
                    {selectedUser.phone ? (
                      <span className="text-white font-mono text-sm">{selectedUser.phone}</span>
                    ) : (
                      <span className="text-gray-500 italic text-sm">Not set</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Withdrawal Address Section */}
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between items-start">
                  <span className="text-gray-400">Withdrawal Address:</span>
                  <div className="flex-1 ml-3">
                    {selectedUser.address ? (
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <span className="text-white text-sm bg-gray-700 px-2 py-1 rounded break-all flex-1">
                            {selectedUser.address}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(selectedUser.address || '')}
                            className="text-gray-400 hover:text-white p-1 flex-shrink-0"
                            title="Copy withdrawal address"
                          >
                            📋
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500 italic text-sm">Not set</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between border-t border-gray-700 pt-3">
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
            </div>

            {/* Fixed Footer */}
            <div className="p-6 pt-4 border-t border-gray-700">
              <div className="flex justify-end">
                <Button
                  onClick={() => setShowUserModal(false)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Close
                </Button>
              </div>
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
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">💰 Deposit to</h3>
                  <div className="bg-gray-700 rounded-lg p-2">
                    <span className="text-sm text-gray-300 font-mono break-all">
                      {selectedUserForAction.username}
                    </span>
                  </div>
                </div>
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
                    Current Balance: {formatBalance(selectedUserForAction.balance)} USDT
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
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">💸 Withdraw from</h3>
                  <div className="bg-gray-700 rounded-lg p-2">
                    <span className="text-sm text-gray-300 font-mono break-all">
                      {selectedUserForAction.username}
                    </span>
                  </div>
                </div>
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
                    Current Balance: {formatBalance(selectedUserForAction.balance)} USDT
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
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">🔑 Change Password for</h3>
                  <div className="bg-gray-700 rounded-lg p-2">
                    <span className="text-sm text-gray-300 font-mono break-all">
                      {selectedUserForAction.username}
                    </span>
                  </div>
                </div>
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
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">🏦 Manage Wallet for</h3>
                  <div className="bg-gray-700 rounded-lg p-2">
                    <span className="text-sm text-gray-300 font-mono break-all">
                      {selectedUserForAction.username}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Current Wallet Info */}
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Current Wallet Address</h4>
                    <div className="text-sm">
                      {selectedUserForAction.wallet_address ? (
                        <div className="flex items-start space-x-2">
                          <span className="font-mono text-green-400 bg-gray-800 px-2 py-1 rounded break-all flex-1 text-xs">
                            {selectedUserForAction.wallet_address}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(selectedUserForAction.wallet_address || '')}
                            className="text-gray-400 hover:text-white p-1 flex-shrink-0"
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
                  <div>
                    <h4 className="text-white font-medium mb-3">Previous Wallet Addresses</h4>
                    {walletHistory.length > 0 ? (
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
                    ) : (
                      <div className="bg-gray-700 p-3 rounded text-center">
                        <div className="text-gray-400 text-sm">No previous wallet addresses found</div>
                      </div>
                    )}
                  </div>

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

      {/* Create Redeem Code Modal */}
      {showCreateCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">🎁 Create Redeem Code</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateCodeModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-2">Code *</label>
                <Input
                  value={newRedeemCode.code}
                  onChange={(e) => setNewRedeemCode({...newRedeemCode, code: e.target.value.toUpperCase()})}
                  placeholder="e.g., BONUS100"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">Bonus Amount (USDT) *</label>
                <Input
                  type="number"
                  value={newRedeemCode.bonusAmount}
                  onChange={(e) => setNewRedeemCode({...newRedeemCode, bonusAmount: e.target.value})}
                  placeholder="100"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">Max Uses (optional)</label>
                <Input
                  type="number"
                  value={newRedeemCode.maxUses}
                  onChange={(e) => setNewRedeemCode({...newRedeemCode, maxUses: e.target.value})}
                  placeholder="Leave empty for unlimited"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">Description (optional)</label>
                <Input
                  value={newRedeemCode.description}
                  onChange={(e) => setNewRedeemCode({...newRedeemCode, description: e.target.value})}
                  placeholder="Bonus code description"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateCodeModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRedeemCode} className="bg-purple-600 hover:bg-purple-700">
                Create Code
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Redeem Code Modal */}
      {showEditCodeModal && editingCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">✏️ Edit Redeem Code</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowEditCodeModal(false);
                  setEditingCode(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Code
                </label>
                <input
                  type="text"
                  value={editingCode.code}
                  disabled
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white opacity-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Code cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Bonus Amount (USDT)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingCode.bonus_amount}
                  onChange={(e) => setEditingCode({...editingCode, bonus_amount: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Max Uses (optional)
                </label>
                <input
                  type="number"
                  value={editingCode.max_uses || ''}
                  onChange={(e) => setEditingCode({...editingCode, max_uses: e.target.value})}
                  placeholder="Unlimited"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editingCode.description || ''}
                  onChange={(e) => setEditingCode({...editingCode, description: e.target.value})}
                  placeholder="Code description"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditCodeModal(false);
                  setEditingCode(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleEditRedeemCode} className="bg-blue-600 hover:bg-blue-700">
                Update Code
              </Button>
            </div>
          </div>
        </div>
      )}

      </div>
    </>
  );
}

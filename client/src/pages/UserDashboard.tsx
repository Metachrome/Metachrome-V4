import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Link } from 'wouter';
import { useToast } from '../hooks/use-toast';
import QRCodeGenerator from '../components/QRCodeGenerator';

import {
  TrendingUp,
  DollarSign,
  BarChart3,
  Eye,
  EyeOff,
  Plus,
  Copy,
  Upload,
  CheckCircle
} from 'lucide-react';

export default function UserDashboard() {
  const { user, userLogin, isUserLoginPending } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for UI controls
  const [showBalance, setShowBalance] = useState(true);

  // State for login form
  const [showLogin, setShowLogin] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // State for Add Fund form
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userLogin({ username: loginUsername, password: loginPassword });
      setShowLogin(false);
      setLoginUsername('');
      setLoginPassword('');
      toast({
        title: 'Login Successful! ✅',
        description: 'Welcome to your dashboard',
      });
    } catch (error: any) {
      toast({
        title: 'Login Failed ❌',
        description: error.message || 'Invalid credentials',
        variant: 'destructive',
      });
    }
  };





  // Simplified data fetching - only fetch balances for now
  const { data: balances, isLoading: balancesLoading } = useQuery({
    queryKey: ['/api/balances'],
    enabled: !!user?.id,
  });

  // Simple calculations for now - use API balance if available, fallback to user session balance
  const usdtBalance = Array.isArray(balances) ? balances.find(b => b.symbol === 'USDT') : balances?.USDT;
  const totalBalance = usdtBalance?.available ? parseFloat(usdtBalance.available) : (user?.balance || 0);
  const totalTrades = 0;
  const winRate = '0';

  // Real platform deposit addresses (where users send crypto to deposit)
  const cryptoNetworks = {
    'BTC': {
      name: 'BTC',
      address: 'bc1q6w3rdy5kwaf4es2lpjk6clpd25pterzvgwu5hu',
      network: 'BTC',
      minAmount: 0.001,
      description: 'Send Bitcoin to this address',
      chainId: null
    },
    'ETH': {
      name: 'ETH',
      address: '0x06292164c039E611B37ff0c4B71ce0F72e56AB7A',
      network: 'ETH',
      minAmount: 0.01,
      description: 'Send Ethereum to this address',
      chainId: 1
    },
    'SOL': {
      name: 'SOL',
      address: '6s2UxAyknMvzN2nUpRdHp6EqDetsdK9mjsLTguzNYeKU',
      network: 'SOL',
      minAmount: 0.1,
      description: 'Send Solana to this address',
      chainId: null
    },
    'USDT-ERC20': {
      name: 'USDT ERC20',
      address: '0x06292164c039E611B37ff0c4B71ce0F72e56AB7A',
      network: 'USDT ERC20',
      minAmount: 10,
      description: 'Send USDT on Ethereum network to this address',
      chainId: 1
    },
    'USDT-TRC20': {
      name: 'USDT TRC20',
      address: 'TTZzHBjpmksYqaM6seVjCSLSe6m77Bfjp9',
      network: 'USDT TRC20',
      minAmount: 10,
      description: 'Send USDT on TRON network to this address',
      chainId: null
    },
    'USDT-BEP20': {
      name: 'USDT BEP20',
      address: '0x06292164c039E611B37ff0c4B71ce0F72e56AB7A',
      network: 'USDT BEP20',
      minAmount: 10,
      description: 'Send USDT on Binance Smart Chain to this address',
      chainId: 56
    }
  };



  // Deposit mutation - Real implementation with file upload
  const depositMutation = useMutation({
    mutationFn: async (data: { amount: string; currency: string; receipt?: File }) => {
      const authToken = localStorage.getItem('authToken');
      if (!authToken || !user) {
        throw new Error('Please login first to make a deposit');
      }

      // Step 1: Create deposit request
      const depositResponse = await fetch('/api/transactions/deposit-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          amount: data.amount,
          currency: data.currency
        })
      });

      if (!depositResponse.ok) {
        const error = await depositResponse.text();
        throw new Error(error || 'Failed to create deposit request');
      }

      const depositResult = await depositResponse.json();

      // Step 2: Submit proof with receipt file
      if (data.receipt) {
        const formData = new FormData();
        formData.append('depositId', depositResult.depositId);
        formData.append('txHash', `user_upload_${Date.now()}`); // Temporary hash until user provides real one
        formData.append('walletAddress', 'user_wallet_address');
        formData.append('receipt', data.receipt);

        const proofResponse = await fetch('/api/transactions/submit-proof', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          body: formData
        });

        if (!proofResponse.ok) {
          const error = await proofResponse.text();
          throw new Error(error || 'Failed to submit proof');
        }

        const proofResult = await proofResponse.json();

        return {
          success: true,
          message: proofResult.message,
          depositId: depositResult.depositId,
          amount: data.amount,
          currency: data.currency,
          status: 'verifying',
          receiptUploaded: true
        };
      }

      return depositResult;
    },
    onSuccess: (data) => {
      toast({
        title: 'Deposit Submitted Successfully! ✅',
        description: `Your ${data.amount} ${data.currency} deposit request has been submitted for processing. Deposit ID: ${data.depositId}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
      setDepositAmount('');
      setUploadedFile(null);
    },
    onError: (error) => {
      toast({
        title: 'Deposit Failed',
        description: error.message || 'Failed to submit deposit request.',
        variant: 'destructive',
      });
    },
  });

  // Helper functions
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a JPEG, PNG, or PDF file.',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please upload a file smaller than 5MB.',
          variant: 'destructive',
        });
        return;
      }

      setUploadedFile(file);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
  };

  const handleDepositSubmit = () => {
    // Check if deposit amount is provided and valid
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid deposit amount.',
        variant: 'destructive',
      });
      return;
    }

    // Check if receipt is uploaded
    if (!uploadedFile) {
      toast({
        title: 'Receipt Required',
        description: 'Please upload a transaction receipt before proceeding.',
        variant: 'destructive',
      });
      return;
    }

    const network = cryptoNetworks[selectedCrypto as keyof typeof cryptoNetworks];
    if (parseFloat(depositAmount) < network.minAmount) {
      toast({
        title: 'Amount Too Small',
        description: `Minimum deposit amount is ${network.minAmount} ${selectedCrypto}.`,
        variant: 'destructive',
      });
      return;
    }

    depositMutation.mutate({
      amount: depositAmount,
      currency: selectedCrypto,
      receipt: uploadedFile
    });
  };

  // Generate single QR code - formatted text to prevent wallet auto-detection
  const generateQRCode = () => {
    const network = cryptoNetworks[selectedCrypto as keyof typeof cryptoNetworks];
    const address = network.address;
    console.log('QR Code value:', address); // Debug log

    // Format as descriptive text to prevent MetaMask from trying to interpret it as a transaction
    return `METACHROME DEPOSIT ADDRESS\n${network.network}\n${address}\n\nCOPY THIS ADDRESS TO YOUR WALLET`;
  };

  // Show login form if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 pb-12 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-center">Login to Your Account</CardTitle>
              <CardDescription className="text-gray-400 text-center">
                Enter your credentials to access your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter your username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 font-medium"
                  disabled={isUserLoginPending}
                >
                  {isUserLoginPending ? 'Logging in...' : 'Login'}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <p className="text-gray-400 text-sm">
                  Demo credentials: username: <span className="text-purple-400">admin</span>, password: <span className="text-purple-400">any</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 break-words">
            {(() => {
              // Prioritize name over username
              if (user?.firstName && user?.lastName) {
                return `Welcome back, ${user.firstName} ${user.lastName}!`;
              }
              if (user?.firstName) {
                return `Welcome back, ${user.firstName}!`;
              }
              if (user?.username) {
                // If username is a long wallet address, split it into two lines for mobile
                if (user.username.startsWith('0x') && user.username.length > 20) {
                  const firstLine = user.username.slice(0, 21); // First 21 characters
                  const secondLine = user.username.slice(21);   // Remaining characters
                  return (
                    <div className="block max-w-full overflow-hidden">
                      <div className="leading-tight">Welcome back,</div>
                      <div className="leading-tight font-mono text-purple-400 break-all text-xs sm:text-sm md:text-base">
                        {firstLine}
                        <br />
                        {secondLine}!
                      </div>
                    </div>
                  );
                }
                return `Welcome back, ${user.username}!`;
              }
              return 'Welcome back, User!';
            })()}
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Here's your trading overview and account summary.
          </p>
        </div>

        {/* Debug Verification Status - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-gray-900/50 border border-gray-600 rounded text-xs text-gray-400">
            <strong>Debug Info:</strong> verificationStatus: {String(user?.verificationStatus)},
            shouldShowBanner: {String(!user?.verificationStatus || user?.verificationStatus === 'unverified')}
          </div>
        )}

        {/* Verification Status Notification - ENABLED */}
        {(!user?.verificationStatus || user?.verificationStatus === 'unverified') && (
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-yellow-600/50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-yellow-100 mb-2">
                      🔒 Verification Required for Trading
                    </h3>
                    <p className="text-yellow-200 mb-4">
                      To start trading and access all platform features, please upload your verification documents.
                      This is required for security and regulatory compliance.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href="/profile">
                        <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Documents Now
                        </Button>
                      </Link>
                      <div className="text-sm text-yellow-300">
                        📄 Accepted: ID Card, Driver's License, or Passport
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Verification Pending Notification - ENABLED */}
        {(user?.verificationStatus === 'pending') && (
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border-blue-600/50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-100 mb-2">
                      ⏳ Verification Under Review
                    </h3>
                    <p className="text-blue-200 mb-2">
                      Your verification documents have been submitted and are currently being reviewed by our team.
                      Trading will be enabled once verification is approved.
                    </p>
                    <div className="text-sm text-blue-300">
                      ⏱️ Review typically takes 24-48 hours
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Balance Card */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-green-500/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Portfolio Value
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                >
                  {showBalance ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Button>
                <DollarSign className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {showBalance ? `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••'}
              </div>
              <p className="text-xs text-gray-400">
                Available balance
              </p>
            </CardContent>
          </Card>

          {/* Total Trades Card */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-blue-500/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Trades
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {totalTrades}
              </div>
              <p className="text-xs text-gray-400">
                All time
              </p>
            </CardContent>
          </Card>

          {/* Win Rate Card */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-green-500/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Win Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {winRate}%
              </div>
              <p className="text-xs text-gray-400">
                Success rate
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(parseFloat(winRate), 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-gray-400">
                Start trading or manage your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/trade/options">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Options Trading
                </Button>
              </Link>
              <Link href="/trade/spot">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Spot Trading
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Account Management */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Account Management</CardTitle>
              <CardDescription className="text-gray-400">
                Manage your account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/profile">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                  View Profile
                </Button>
              </Link>
              <Link href="/transactions">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                  Transaction History
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Add Funds Section */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Add Funds</CardTitle>
              <CardDescription className="text-gray-400">
                Top up your account balance with cryptocurrency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">

                {/* Deposit Network Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Deposit network
                  </label>
                  <select
                    value={selectedCrypto}
                    onChange={(e) => setSelectedCrypto(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                    <option value="SOL">SOL</option>
                    <option value="USDT-ERC20">USDT ERC20</option>
                    <option value="USDT-TRC20">USDT TRC20</option>
                    <option value="USDT-BEP20">USDT BEP20</option>
                  </select>
                </div>

                {/* Deposit Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Deposit amount <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="Please enter the recharge amount"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className={`w-full bg-gray-800 border rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                      !depositAmount ? 'border-red-500' : 'border-gray-600'
                    }`}
                    min={cryptoNetworks[selectedCrypto as keyof typeof cryptoNetworks]?.minAmount || 0}
                    step="0.01"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum: {cryptoNetworks[selectedCrypto as keyof typeof cryptoNetworks]?.minAmount} {selectedCrypto}
                  </p>
                </div>

                {/* Platform Deposit Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Platform Deposit Address
                  </label>
                  <div className="p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg mb-2">
                    <p className="text-blue-300 text-xs mb-1">
                      ⚠️ Send {selectedCrypto} to this address to deposit funds to your METACHROME account
                    </p>
                    <p className="text-yellow-300 text-xs">
                      <strong>Important:</strong> Only send on {cryptoNetworks[selectedCrypto as keyof typeof cryptoNetworks]?.network}.
                      Sending on wrong network will result in loss of funds!
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2">
                    <span className="text-white text-sm font-mono flex-1 break-all">
                      {cryptoNetworks[selectedCrypto as keyof typeof cryptoNetworks]?.address}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-purple-400 hover:text-purple-300 p-2 hover:bg-gray-700"
                      onClick={() => copyToClipboard(cryptoNetworks[selectedCrypto as keyof typeof cryptoNetworks]?.address)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Network: {cryptoNetworks[selectedCrypto as keyof typeof cryptoNetworks]?.network}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {cryptoNetworks[selectedCrypto as keyof typeof cryptoNetworks]?.description}
                  </p>
                </div>

                {/* QR Code */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    QR Code - Deposit Address
                  </label>

                  <div className="text-center">
                    <div className="bg-white p-6 rounded-lg inline-block">
                      <QRCodeGenerator
                        value={generateQRCode()}
                        size={200}
                        className="mx-auto"
                      />
                    </div>
                    <p className="text-xs text-gray-300 mt-3">
                      Scan to see deposit information (copy the address manually)
                    </p>
                    <p className="text-xs text-yellow-300 mt-1">
                      Make sure to send on <strong>{cryptoNetworks[selectedCrypto as keyof typeof cryptoNetworks]?.network}</strong>
                    </p>
                    <p className="text-xs text-blue-300 mt-1">
                      Address: {cryptoNetworks[selectedCrypto as keyof typeof cryptoNetworks]?.address}
                    </p>
                  </div>

                  {/* Copy Address Button */}
                  <div className="mt-4">
                    <Button
                      onClick={() => copyToClipboard(cryptoNetworks[selectedCrypto as keyof typeof cryptoNetworks]?.address)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Deposit Address
                    </Button>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-4 p-3 bg-gray-800/50 border border-gray-600 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-300 mb-2">💡 How to use:</h5>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• <strong>Scan QR Code:</strong> View deposit info (manually copy the address)</li>
                      <li>• <strong>Copy Address:</strong> Click the button to copy address to clipboard</li>
                      <li>• <strong>Manual Entry:</strong> Type or paste address in your wallet</li>
                      <li>• <strong>Send Crypto:</strong> Send to the address on the correct network</li>
                      <li>• <strong>Upload Receipt:</strong> Upload transaction proof and confirm</li>
                    </ul>
                  </div>


                </div>



                {/* Upload Receipt */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Upload receipt <span className="text-red-400">*</span>
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition-colors ${
                      !uploadedFile ? 'border-red-500' : 'border-gray-600'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadedFile ? (
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <span className="text-green-400 text-sm">{uploadedFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Click to upload receipt</p>
                        <p className="text-gray-500 text-xs mt-1">JPEG, PNG, PDF (max 5MB)</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Required Fields Notice */}
                {(!depositAmount || !uploadedFile) && (
                  <div className="p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg mb-4">
                    <p className="text-yellow-300 text-sm">
                      ⚠️ Please complete all required fields:
                    </p>
                    <ul className="text-yellow-200 text-xs mt-1 ml-4">
                      {!depositAmount && <li>• Enter deposit amount</li>}
                      {!uploadedFile && <li>• Upload transaction receipt</li>}
                    </ul>
                  </div>
                )}

                {/* Confirm Button */}
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleDepositSubmit}
                  disabled={depositMutation.isPending || !depositAmount || !uploadedFile}
                >
                  {depositMutation.isPending ? 'Processing...' : 'Confirm recharge'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Simple Trading Section */}
        <div className="mt-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Start Trading</CardTitle>
              <CardDescription className="text-gray-400">
                Begin your trading journey
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <TrendingUp className="h-16 w-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Ready to Trade?</h3>
              <p className="text-gray-400 mb-6">Start trading with our advanced platform</p>
              <div className="space-y-4">
                <Link href="/trade/options">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Options Trading
                  </Button>
                </Link>
                <Link href="/trade/spot">
                  <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                    <BarChart3 className="w-4 w-4 mr-2" />
                    Spot Trading
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

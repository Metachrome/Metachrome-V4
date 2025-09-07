import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useToast } from '../hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { Wallet, AlertTriangle, CheckCircle, Copy, Send, ArrowUpDown, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface MetaMaskConnectProps {
  onConnect?: (address: string) => void;
  className?: string;
  showTransactions?: boolean;
}

interface Balance {
  symbol: string;
  available: string;
  locked: string;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: string;
  symbol: string;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
  createdAt: string;
}

export default function MetaMaskConnect({ onConnect, className, showTransactions = false }: MetaMaskConnectProps) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isTransacting, setIsTransacting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user balances
  const { data: userBalances } = useQuery<Balance[]>({
    queryKey: ['/api/balances'],
    enabled: !!account,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch transaction history
  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    enabled: !!account && showTransactions,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // MetaMask authentication mutation
  const authMutation = useMutation({
    mutationFn: async (data: { walletAddress: string; signature?: string }) => {
      return await apiRequest('POST', '/api/auth', data);
    },
    onSuccess: (data) => {
      toast({
        title: 'Connected Successfully',
        description: 'Your MetaMask wallet has been connected.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
      if (onConnect) {
        onConnect(account!);
      }
    },
    onError: (error) => {
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect wallet.',
        variant: 'destructive',
      });
    },
  });

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (data: { amount: string; txHash: string }) => {
      return await apiRequest('POST', '/api/wallet/deposit', data);
    },
    onSuccess: () => {
      toast({
        title: 'Deposit Initiated',
        description: 'Your deposit is being processed.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      setDepositAmount('');
      setShowDepositDialog(false);
    },
    onError: (error) => {
      toast({
        title: 'Deposit Failed',
        description: error.message || 'Failed to process deposit.',
        variant: 'destructive',
      });
    },
  });

  // Withdrawal mutation
  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: string; toAddress: string }) => {
      return await apiRequest('POST', '/api/wallet/withdraw', data);
    },
    onSuccess: () => {
      toast({
        title: 'Withdrawal Initiated',
        description: 'Your withdrawal is being processed.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      setWithdrawAmount('');
      setShowWithdrawDialog(false);
    },
    onError: (error) => {
      toast({
        title: 'Withdrawal Failed',
        description: error.message || 'Failed to process withdrawal.',
        variant: 'destructive',
      });
    },
  });

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
  };

  // Get current account and balance
  const getCurrentAccount = async () => {
    try {
      const accounts = await window.ethereum!.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        const chainId = await window.ethereum!.request({ method: 'eth_chainId' });
        setChainId(chainId);
        await getWalletBalance(accounts[0]);
      }
    } catch (error) {
      console.error('Error getting current account:', error);
    }
  };

  // Get wallet balance
  const getWalletBalance = async (address: string) => {
    try {
      const balance = await window.ethereum!.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      // Convert from wei to ETH
      const ethBalance = parseInt(balance, 16) / Math.pow(10, 18);
      setBalance(ethBalance.toFixed(4));
    } catch (error) {
      console.error('Error getting wallet balance:', error);
    }
  };

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      toast({
        title: 'MetaMask Not Found',
        description: 'Please install MetaMask to connect your wallet.',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);
    try {
      // Request account access
      const accounts = await window.ethereum!.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const walletAddress = accounts[0];
        setAccount(walletAddress);

        // Get chain ID
        const chainId = await window.ethereum!.request({ method: 'eth_chainId' });
        setChainId(chainId);

        // Get wallet balance
        await getWalletBalance(walletAddress);

        // Authenticate with backend
        await authMutation.mutateAsync({ walletAddress });
      }
    } catch (error: any) {
      console.error('Error connecting to MetaMask:', error);
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect to MetaMask.',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle deposit transaction
  const handleDeposit = async () => {
    if (!account || !depositAmount) return;

    setIsTransacting(true);
    try {
      const amount = parseFloat(depositAmount);
      if (amount <= 0) {
        throw new Error('Invalid deposit amount');
      }

      // Convert ETH to Wei
      const amountInWei = '0x' + (amount * Math.pow(10, 18)).toString(16);

      // Send transaction to platform wallet (this would be your platform's deposit address)
      const platformAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b'; // Replace with actual platform address

      const txHash = await window.ethereum!.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: platformAddress,
          value: amountInWei,
          gas: '0x5208', // 21000 gas for simple transfer
        }],
      });

      // Record deposit in backend
      await depositMutation.mutateAsync({
        amount: depositAmount,
        txHash,
      });

    } catch (error: any) {
      console.error('Error processing deposit:', error);
      toast({
        title: 'Deposit Failed',
        description: error.message || 'Failed to process deposit.',
        variant: 'destructive',
      });
    } finally {
      setIsTransacting(false);
    }
  };

  // Handle withdrawal transaction
  const handleWithdraw = async () => {
    if (!account || !withdrawAmount) return;

    setIsTransacting(true);
    try {
      const amount = parseFloat(withdrawAmount);
      if (amount <= 0) {
        throw new Error('Invalid withdrawal amount');
      }

      const usdtBalance = userBalances?.find(b => b.symbol === 'USDT');
      const availableBalance = parseFloat(usdtBalance?.available || '0');

      if (amount > availableBalance) {
        throw new Error('Insufficient balance');
      }

      // Process withdrawal through backend
      await withdrawMutation.mutateAsync({
        amount: withdrawAmount,
        toAddress: account,
      });

    } catch (error: any) {
      console.error('Error processing withdrawal:', error);
      toast({
        title: 'Withdrawal Failed',
        description: error.message || 'Failed to process withdrawal.',
        variant: 'destructive',
      });
    } finally {
      setIsTransacting(false);
    }
  };

  // Sign message for additional verification (optional)
  const signMessage = async () => {
    if (!account) return;

    try {
      const message = `Sign this message to verify your wallet ownership: ${Date.now()}`;
      const signature = await window.ethereum!.request({
        method: 'personal_sign',
        params: [message, account],
      });

      // Send signature to backend for additional verification
      await authMutation.mutateAsync({ walletAddress: account, signature });
    } catch (error: any) {
      console.error('Error signing message:', error);
      toast({
        title: 'Signing Failed',
        description: error.message || 'Failed to sign message.',
        variant: 'destructive',
      });
    }
  };

  // Handle account changes
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      getWalletBalance(accounts[0]);
    } else {
      setAccount(null);
      setChainId(null);
      setBalance('0');
    }
  };

  // Handle chain changes
  const handleChainChanged = (chainId: string) => {
    setChainId(chainId);
    // Refresh balance when chain changes
    if (account) {
      getWalletBalance(account);
    }
  };

  // Setup event listeners
  useEffect(() => {
    if (isMetaMaskInstalled()) {
      getCurrentAccount();

      window.ethereum!.on('accountsChanged', handleAccountsChanged);
      window.ethereum!.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum!.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum!.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Get network name from chain ID
  const getNetworkName = (chainId: string) => {
    const networks: { [key: string]: string } = {
      '0x1': 'Ethereum Mainnet',
      '0x3': 'Ropsten Testnet',
      '0x4': 'Rinkeby Testnet',
      '0x5': 'Goerli Testnet',
      '0x89': 'Polygon Mainnet',
      '0x13881': 'Polygon Mumbai Testnet',
      '0x38': 'BSC Mainnet',
      '0x61': 'BSC Testnet',
    };
    return networks[chainId] || `Unknown (${chainId})`;
  };

  // Copy address to clipboard
  const copyAddress = async () => {
    if (account) {
      try {
        await navigator.clipboard.writeText(account);
        toast({
          title: 'Copied',
          description: 'Wallet address copied to clipboard.',
        });
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  if (!isMetaMaskInstalled()) {
    return (
      <Card className={`bg-slate-800/90 border-red-500/20 ${className}`}>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">MetaMask Required</h3>
          <p className="text-gray-300 mb-4">
            Please install MetaMask to connect your wallet and start trading.
          </p>
          <Button
            onClick={() => window.open('https://metamask.io/download/', '_blank')}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            Install MetaMask
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (account) {
    const usdtBalance = userBalances?.find(b => b.symbol === 'USDT');

    return (
      <Card className={`bg-slate-800/90 border-green-500/20 ${className}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Wallet Connected
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg">
            <div>
              <p className="text-sm text-gray-300">Address</p>
              <p className="text-white font-mono text-sm">
                {account.slice(0, 6)}...{account.slice(-4)}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={copyAddress}
              className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          {/* Wallet Balance */}
          <div className="bg-slate-700/50 p-3 rounded-lg">
            <p className="text-sm text-gray-300">Wallet Balance</p>
            <p className="text-white font-bold text-lg">{balance} ETH</p>
          </div>

          {/* Platform Balance */}
          {usdtBalance && (
            <div className="bg-slate-700/50 p-3 rounded-lg">
              <p className="text-sm text-gray-300">Platform Balance</p>
              <p className="text-white font-bold text-lg">
                ${parseFloat(usdtBalance.available).toLocaleString()} USDT
              </p>
              {parseFloat(usdtBalance.locked) > 0 && (
                <p className="text-yellow-400 text-sm">
                  ${parseFloat(usdtBalance.locked).toLocaleString()} locked
                </p>
              )}
            </div>
          )}

          {chainId && (
            <div className="bg-slate-700/50 p-3 rounded-lg">
              <p className="text-sm text-gray-300">Network</p>
              <Badge variant="outline" className="border-blue-500 text-blue-400">
                {getNetworkName(chainId)}
              </Badge>
            </div>
          )}

          {/* Transaction Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Send className="w-4 h-4 mr-2" />
                  Deposit
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-600">
                <DialogHeader>
                  <DialogTitle className="text-white">Deposit ETH</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Amount (ETH)</Label>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Available: {balance} ETH
                    </p>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowDepositDialog(false)}
                      className="border-slate-600 text-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDeposit}
                      disabled={isTransacting || !depositAmount}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isTransacting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Deposit
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
              <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Withdraw
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-600">
                <DialogHeader>
                  <DialogTitle className="text-white">Withdraw USDT</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Amount (USDT)</Label>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Available: ${parseFloat(usdtBalance?.available || '0').toLocaleString()} USDT
                    </p>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowWithdrawDialog(false)}
                      className="border-slate-600 text-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleWithdraw}
                      disabled={isTransacting || !withdrawAmount}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {isTransacting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <ArrowUpDown className="w-4 h-4 mr-2" />
                      )}
                      Withdraw
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={signMessage}
              disabled={authMutation.isPending}
              size="sm"
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              Verify Signature
            </Button>
            <Button
              onClick={() => {
                setAccount(null);
                setChainId(null);
                setBalance('0');
              }}
              size="sm"
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500/20"
            >
              Disconnect
            </Button>
          </div>

          {/* Transaction History */}
          {showTransactions && transactions && transactions.length > 0 && (
            <div className="bg-slate-700/50 p-3 rounded-lg">
              <p className="text-sm text-gray-300 mb-2">Recent Transactions</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={tx.type === 'deposit' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {tx.type}
                      </Badge>
                      <span className="text-white">${tx.amount} {tx.symbol}</span>
                    </div>
                    <Badge
                      variant={
                        tx.status === 'completed' ? 'default' :
                        tx.status === 'pending' ? 'secondary' : 'destructive'
                      }
                      className="text-xs"
                    >
                      {tx.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-slate-800/90 border-purple-500/20 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-purple-400" />
          Connect MetaMask
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-300 text-sm">
          Connect your MetaMask wallet to start trading and manage your funds securely.
        </p>
        
        <Button
          onClick={connectWallet}
          disabled={isConnecting || authMutation.isPending}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12"
        >
          <Wallet className="w-5 h-5 mr-2" />
          {isConnecting || authMutation.isPending ? 'Connecting...' : 'Connect MetaMask'}
        </Button>

        <div className="text-xs text-gray-400 space-y-1">
          <p>• Secure wallet connection</p>
          <p>• No private keys stored</p>
          <p>• Decentralized authentication</p>
        </div>
      </CardContent>
    </Card>
  );
}
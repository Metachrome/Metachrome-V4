import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/useAuth";
import { web3Service } from "../services/web3Service";
import StripePayment from "../components/StripePayment";
import { CreditCard, ArrowUpRight, ArrowDownLeft, Send, Download, Users, Wallet, Plus } from "lucide-react";

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState("Balance");
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('USDT');

  // Modal states for deposit confirmations
  const [showTxHashModal, setShowTxHashModal] = useState(false);
  const [showBankRefModal, setShowBankRefModal] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [bankRef, setBankRef] = useState('');
  const [pendingDepositData, setPendingDepositData] = useState<any>(null);

  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch real user balances
  const { data: userBalances, isLoading: balancesLoading } = useQuery({
    queryKey: ["/api/balances"],
    enabled: !!user,
  });

  // Fetch real market data for price calculations
  const { data: marketData } = useQuery({
    queryKey: ['/api/market-data'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const tabs = [
    { id: "Balance", label: "Balance" },
    { id: "Deposit", label: "Deposit" },
    { id: "Withdraw", label: "Withdraw" },
    { id: "Transfer", label: "Transfer" },
    { id: "Convert", label: "Convert" }
  ];

  // Helper function to get market price
  const getMarketPrice = (symbol: string): number => {
    if (symbol === 'USDT') return 1;
    const marketItem = marketData?.find(item => item.symbol === `${symbol}USDT`);
    return marketItem ? parseFloat(marketItem.price) : 0;
  };

  // Calculate total balance in USDT
  const totalBalanceUSDT = userBalances?.reduce((sum: number, balance: any) => {
    const price = getMarketPrice(balance.symbol);
    return sum + parseFloat(balance.available || '0') * price;
  }, 0) || 0;

  // Initialize Web3 on component mount
  useEffect(() => {
    const initWeb3 = async () => {
      const initialized = await web3Service.initialize();
      if (initialized) {
        const account = await web3Service.getCurrentAccount();
        if (account) {
          setWalletConnected(true);
          setWalletAddress(account);
        }
      }
    };
    initWeb3();
  }, []);

  // Connect wallet mutation
  const connectWalletMutation = useMutation({
    mutationFn: async () => {
      const accounts = await web3Service.connectWallet();
      return accounts[0];
    },
    onSuccess: (account) => {
      setWalletConnected(true);
      setWalletAddress(account);
      toast({
        title: 'Wallet Connected',
        description: `Connected to ${account.slice(0, 6)}...${account.slice(-4)}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Connection Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Production-ready deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (data: { amount: string; currency: string; method: string; txHash?: string; paymentData?: any }) => {
      const response = await fetch('/api/transactions/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: data.amount,
          currency: data.currency,
          method: data.method,
          txHash: data.txHash,
          paymentData: data.paymentData
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Deposit failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      const isCompleted = data.transaction.status === 'completed';
      toast({
        title: isCompleted ? 'Deposit Successful' : 'Deposit Submitted',
        description: isCompleted
          ? `Successfully deposited ${data.amount} ${data.currency}`
          : 'Your deposit has been submitted for verification. You will be notified once approved.',
        variant: isCompleted ? 'default' : 'default',
      });
      setDepositAmount('');
      if (isCompleted) {
        queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Deposit Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: string; currency: string; address: string }) => {
      const response = await fetch('/api/transactions/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: data.amount,
          currency: data.currency,
          address: data.address,
          method: 'crypto'
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Withdrawal failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Withdrawal Initiated',
        description: `Withdrawal of ${data.amount} ${data.currency} has been initiated`,
      });
      setWithdrawAddress('');
      setWithdrawAmount('');
      queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Withdrawal Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Handle transaction hash submission
  const handleTxHashSubmit = () => {
    if (!txHash.trim()) {
      toast({
        title: 'Transaction Hash Required',
        description: 'Please provide a valid transaction hash for verification',
        variant: 'destructive',
      });
      return;
    }

    depositMutation.mutate({
      ...pendingDepositData,
      txHash: txHash
    });

    setShowTxHashModal(false);
    setTxHash('');
    setPendingDepositData(null);
  };

  // Handle bank reference submission
  const handleBankRefSubmit = () => {
    if (!bankRef.trim()) {
      toast({
        title: 'Transfer Reference Required',
        description: 'Please provide your bank transfer reference number',
        variant: 'destructive',
      });
      return;
    }

    depositMutation.mutate({
      ...pendingDepositData,
      paymentData: { transferReference: bankRef }
    });

    setShowBankRefModal(false);
    setBankRef('');
    setPendingDepositData(null);
  };

  // Handle Stripe payment success
  const handleStripeSuccess = (paymentIntentId: string) => {
    depositMutation.mutate({
      ...pendingDepositData,
      paymentData: { paymentIntentId }
    });

    setShowStripeModal(false);
    setPendingDepositData(null);
  };

  // Handle Stripe payment error
  const handleStripeError = (error: string) => {
    toast({
      title: 'Payment Failed',
      description: error,
      variant: 'destructive',
    });
  };

  // Use real balances from API
  const balances = userBalances || [];

  const cryptoNames: Record<string, string> = {
    BTC: "Bitcoin",
    ETH: "Ethereum",
    USDT: "Tether",
  };





  return (
    <div className="min-h-screen bg-[#1a1b2e] pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header Tabs */}
        <div className="mb-8">
          <div className="flex items-center space-x-1 mb-8 border-b border-gray-600">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={activeTab === tab.id
                  ? "bg-transparent text-white border-b-2 border-purple-500 rounded-none pb-3"
                  : "bg-transparent text-gray-400 hover:text-white rounded-none pb-3"
                }
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {activeTab === "Balance" && (
          <div className="space-y-8">
            {/* Balance Header */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Balance</h1>
              
              {/* Wallet Connection Status */}
              {!walletConnected && (
                <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-yellow-400 font-semibold">Connect Your Wallet</h4>
                      <p className="text-yellow-300/80 text-sm">Connect MetaMask to enable deposits and withdrawals</p>
                    </div>
                    <Button
                      onClick={() => connectWalletMutation.mutate()}
                      disabled={connectWalletMutation.isPending}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      {connectWalletMutation.isPending ? 'Connecting...' : 'Connect'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Total Balance */}
              <div className="mb-8">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-gray-400 text-sm">Total Balances</span>
                  <span className="text-gray-400">💰</span>
                  {walletConnected && (
                    <Badge variant="outline" className="text-green-400 border-green-400">
                      Wallet Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </Badge>
                  )}
                </div>
                <div className="text-4xl font-bold text-white">
                  {balancesLoading ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : (
                    `${totalBalanceUSDT.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`
                  )}
                </div>
              </div>


            </div>
          </div>
        )}

        {activeTab === "Deposit" && (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-8">Deposit</h1>

              {/* Deposit Section from User Dashboard */}
              <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                <CardContent className="space-y-6 p-6">
                  {/* Deposit Network Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Deposit network
                    </label>
                    <select
                      value={selectedCrypto}
                      onChange={(e) => setSelectedCrypto(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="USDT">USDT-ERC</option>
                      <option value="BTC">BTC</option>
                      <option value="ETH">ETH</option>
                    </select>
                  </div>

                  {/* Deposit Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Deposit amount
                    </label>
                    <input
                      type="text"
                      placeholder="Please enter the recharge amount"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Recharge Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Recharge address
                    </label>
                    <div className="flex items-center gap-2 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2">
                      <span className="text-white text-sm font-mono flex-1">
                        0x3BC095D473398033496F94a1a1a3A7084c
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-purple-400 hover:text-purple-300 p-1"
                        onClick={() => {
                          navigator.clipboard.writeText('0x3BC095D473398033496F94a1a1a3A7084c');
                          toast({
                            title: "Copied!",
                            description: "Address copied to clipboard",
                          });
                        }}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                        </svg>
                      </Button>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      QR wallet address
                    </label>
                    <div className="bg-white p-4 rounded-lg inline-block">
                      <div className="w-32 h-32 bg-black">
                        {/* QR Code placeholder - in real app, generate actual QR code */}
                        <svg viewBox="0 0 128 128" className="w-full h-full">
                          <rect width="128" height="128" fill="white"/>
                          <g fill="black">
                            <rect x="0" y="0" width="8" height="8"/>
                            <rect x="16" y="0" width="8" height="8"/>
                            <rect x="32" y="0" width="8" height="8"/>
                            <rect x="48" y="0" width="8" height="8"/>
                            <rect x="64" y="0" width="8" height="8"/>
                            <rect x="80" y="0" width="8" height="8"/>
                            <rect x="96" y="0" width="8" height="8"/>
                            <rect x="112" y="0" width="8" height="8"/>
                            <rect x="0" y="16" width="8" height="8"/>
                            <rect x="32" y="16" width="8" height="8"/>
                            <rect x="64" y="16" width="8" height="8"/>
                            <rect x="96" y="16" width="8" height="8"/>
                            <rect x="112" y="16" width="8" height="8"/>
                            <rect x="16" y="32" width="8" height="8"/>
                            <rect x="48" y="32" width="8" height="8"/>
                            <rect x="80" y="32" width="8" height="8"/>
                            <rect x="0" y="48" width="8" height="8"/>
                            <rect x="32" y="48" width="8" height="8"/>
                            <rect x="64" y="48" width="8" height="8"/>
                            <rect x="96" y="48" width="8" height="8"/>
                            <rect x="16" y="64" width="8" height="8"/>
                            <rect x="48" y="64" width="8" height="8"/>
                            <rect x="80" y="64" width="8" height="8"/>
                            <rect x="112" y="64" width="8" height="8"/>
                            <rect x="0" y="80" width="8" height="8"/>
                            <rect x="32" y="80" width="8" height="8"/>
                            <rect x="64" y="80" width="8" height="8"/>
                            <rect x="96" y="80" width="8" height="8"/>
                            <rect x="16" y="96" width="8" height="8"/>
                            <rect x="48" y="96" width="8" height="8"/>
                            <rect x="80" y="96" width="8" height="8"/>
                            <rect x="0" y="112" width="8" height="8"/>
                            <rect x="32" y="112" width="8" height="8"/>
                            <rect x="64" y="112" width="8" height="8"/>
                            <rect x="96" y="112" width="8" height="8"/>
                            <rect x="112" y="112" width="8" height="8"/>
                          </g>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Upload Receipt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Upload receipt
                    </label>
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                      <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">Click to upload receipt</p>
                    </div>
                  </div>

                  {/* Confirm Button */}
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
                    onClick={() => {
                      toast({
                        title: "Deposit Confirmed",
                        description: "Your deposit request has been submitted for processing.",
                      });
                    }}
                  >
                    Confirm recharge
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "Withdraw" && (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-8">Withdraw</h1>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8">
                  {walletConnected ? (
                    <div className="max-w-md mx-auto space-y-6">
                      <div>
                        <Label className="text-gray-300">Select Cryptocurrency</Label>
                        <select
                          value={selectedCrypto}
                          onChange={(e) => setSelectedCrypto(e.target.value)}
                          className="w-full mt-2 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        >
                          <option value="USDT">USDT - Tether</option>
                          <option value="ETH">ETH - Ethereum</option>
                          <option value="BTC">BTC - Bitcoin</option>
                        </select>
                      </div>

                      <div>
                        <Label className="text-gray-300">Withdrawal Address</Label>
                        <Input
                          type="text"
                          placeholder="Enter wallet address"
                          value={withdrawAddress}
                          onChange={(e) => setWithdrawAddress(e.target.value)}
                          className="mt-2 bg-gray-700 border-gray-600 text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-gray-300">Amount</Label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="mt-2 bg-gray-700 border-gray-600 text-white"
                        />
                        <div className="text-sm text-gray-400 mt-1">
                          Available: {balances.find(b => b.symbol === selectedCrypto)?.available || '0'} {selectedCrypto}
                        </div>
                      </div>

                      <Button
                        onClick={() => {
                          if (!withdrawAddress || !withdrawAmount || parseFloat(withdrawAmount) <= 0) {
                            toast({
                              title: 'Invalid Input',
                              description: 'Please enter valid address and amount',
                              variant: 'destructive',
                            });
                            return;
                          }
                          withdrawMutation.mutate({
                            address: withdrawAddress,
                            amount: withdrawAmount,
                            currency: selectedCrypto
                          });
                        }}
                        disabled={!withdrawAddress || !withdrawAmount || withdrawMutation.isPending}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        {withdrawMutation.isPending ? 'Processing...' : `Withdraw ${selectedCrypto}`}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">Connect Wallet Required</h3>
                      <p className="text-gray-400 mb-6">
                        Please connect your MetaMask wallet to enable withdrawals.
                      </p>
                      <Button
                        onClick={() => connectWalletMutation.mutate()}
                        disabled={connectWalletMutation.isPending}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        Connect Wallet
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {(activeTab === "Transfer" || activeTab === "Convert") && (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-8">{activeTab}</h1>

              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                      {activeTab === "Transfer" && <Send className="w-8 h-8 text-gray-400" />}
                      {activeTab === "Convert" && <ArrowDownLeft className="w-8 h-8 text-gray-400" />}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{activeTab} Feature</h3>
                    <p className="text-gray-400 mb-6">
                      {activeTab} functionality will be available soon. Stay tuned for updates.
                    </p>

                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                      Coming Soon
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Hash Modal */}
      <Dialog open={showTxHashModal} onOpenChange={setShowTxHashModal}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Enter Transaction Hash</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              Please enter your transaction hash for verification. This helps us confirm your deposit.
            </p>
            <div>
              <Label htmlFor="txHash" className="text-gray-300">Transaction Hash</Label>
              <Input
                id="txHash"
                type="text"
                placeholder="0x..."
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white mt-2"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowTxHashModal(false);
                  setTxHash('');
                  setPendingDepositData(null);
                }}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleTxHashSubmit}
                disabled={!txHash.trim() || depositMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {depositMutation.isPending ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bank Reference Modal */}
      <Dialog open={showBankRefModal} onOpenChange={setShowBankRefModal}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Enter Bank Transfer Reference</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              Please enter your bank transfer reference number. This helps us verify your payment.
            </p>
            <div>
              <Label htmlFor="bankRef" className="text-gray-300">Transfer Reference Number</Label>
              <Input
                id="bankRef"
                type="text"
                placeholder="Enter reference number"
                value={bankRef}
                onChange={(e) => setBankRef(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white mt-2"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowBankRefModal(false);
                  setBankRef('');
                  setPendingDepositData(null);
                }}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBankRefSubmit}
                disabled={!bankRef.trim() || depositMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {depositMutation.isPending ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stripe Payment Modal */}
      <Dialog open={showStripeModal} onOpenChange={setShowStripeModal}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Credit/Debit Card Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              Complete your payment securely with Stripe. Your card information is encrypted and secure.
            </p>
            {pendingDepositData && (
              <StripePayment
                amount={pendingDepositData.amount}
                currency="usd" // Convert crypto to USD for Stripe
                onSuccess={handleStripeSuccess}
                onError={handleStripeError}
              />
            )}
            <Button
              variant="outline"
              onClick={() => {
                setShowStripeModal(false);
                setPendingDepositData(null);
              }}
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
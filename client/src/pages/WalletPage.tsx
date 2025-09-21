import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../hooks/useAuth";
import { useIsMobile } from "../hooks/use-mobile";
import QRCodeGenerator from "../components/QRCodeGenerator";

import StripePayment from "../components/StripePayment";
import { CreditCard, ArrowUpRight, ArrowDownLeft, Send, Download, Users, Wallet, Plus, Copy, CheckCircle } from "lucide-react";

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState("Balance");
  const [showDetailedBalance, setShowDetailedBalance] = useState(true);
  const isMobile = useIsMobile();

  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [selectedNetwork, setSelectedNetwork] = useState('BTC');
  const [fundPassword, setFundPassword] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal states for deposit confirmations
  const [showTxHashModal, setShowTxHashModal] = useState(false);
  const [showBankRefModal, setShowBankRefModal] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [bankRef, setBankRef] = useState('');
  const [pendingDepositData, setPendingDepositData] = useState<any>(null);

  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch withdrawal history - REAL DATA
  const { data: withdrawalHistory = [] } = useQuery({
    queryKey: [`/api/users/${user?.id}/withdrawals`],
    enabled: !!user?.id,
    queryFn: async () => {
      try {
        const response = await fetch(`/api/users/${user.id}/withdrawals`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        if (!response.ok) {
          console.log('Withdrawal history API failed, using empty array');
          return [];
        }
        const data = await response.json();
        console.log('📊 Withdrawal history fetched:', data);
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Failed to fetch withdrawal history:', error);
        return [];
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  const queryClient = useQueryClient();

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

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (depositData: FormData) => {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/deposits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: depositData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit deposit');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Deposit Submitted',
        description: 'Your deposit request has been submitted for review.',
      });
      setDepositAmount('');
      setUploadedFile(null);
      queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Deposit Failed',
        description: error.message,
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

      // Validate file size (5MB limit)
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
        description: 'Please upload a transaction receipt.',
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

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('amount', depositAmount);
    formData.append('currency', selectedCrypto);
    formData.append('receipt', uploadedFile);

    depositMutation.mutate(formData);
  };

  // Generate single QR code - formatted text to prevent wallet auto-detection
  const generateQRCode = () => {
    const network = cryptoNetworks[selectedCrypto as keyof typeof cryptoNetworks];
    const address = network.address;
    console.log('QR Code value:', address); // Debug log

    // Format as descriptive text to prevent MetaMask from trying to interpret it as a transaction
    return `METACHROME DEPOSIT ADDRESS\n${network.network}\n${address}\n\nCOPY THIS ADDRESS TO YOUR WALLET`;
  };

  // Fetch real user balances
  const { data: userBalances, isLoading: balancesLoading } = useQuery({
    queryKey: ["/api/balances"],
    enabled: !!user,
    refetchInterval: 5000, // Refresh every 5 seconds
    staleTime: 0, // Always consider data stale
    cacheTime: 0, // Don't cache data
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

  // Get USDT balance (simplified system with auto-conversion)
  const usdtBalance = parseFloat(userBalances?.find(balance => balance.symbol === 'USDT')?.available || '0');

  // Total balance is just USDT balance (all crypto auto-converted)
  const totalBalanceUSDT = usdtBalance;

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: async (data: { amount: string; currency: string; address: string }) => {
      // Get auth token from localStorage
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('Please login first to make a withdrawal');
      }

      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          amount: data.amount,
          currency: data.currency,
          address: data.address
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
              


              {/* Total Balance */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm">Total Balances</span>
                    <span className="text-gray-400">💰</span>
                  </div>
                  <button
                    onClick={() => setShowDetailedBalance(!showDetailedBalance)}
                    className="text-purple-400 text-sm hover:text-purple-300"
                  >
                    {showDetailedBalance ? 'Simple View' : 'Detailed View'}
                  </button>
                </div>
                <div className="text-4xl font-bold text-white">
                  {balancesLoading ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : (
                    `${totalBalanceUSDT.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`
                  )}
                </div>

                {/* Auto-Conversion Info */}
                <div className="mt-4 bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                  <div className="text-blue-400 text-sm font-medium flex items-center mb-2">
                    <span className="mr-2">💱</span>
                    Auto-Conversion System Active
                  </div>
                  <div className="text-blue-300 text-xs space-y-1">
                    <div>• All cryptocurrency deposits are automatically converted to USDT</div>
                    <div>• Real-time conversion with competitive rates</div>
                    <div>• Unified balance for easy management and instant withdrawals</div>
                  </div>
                </div>


              </div>


            </div>
          </div>
        )}

        {activeTab === "Deposit" && (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-8">Deposit</h1>

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
                      <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-300 mb-2">
                        Deposit amount <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="depositAmount"
                        name="depositAmount"
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
                        id="receiptUpload"
                        name="receiptUpload"
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
          </div>
        )}

        {activeTab === "Withdraw" && (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-8">Withdraw</h1>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Withdrawal Form */}
                <div className="lg:col-span-2">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-8">
                      <div className="space-y-6">
                        {/* Currency Selection */}
                        <div>
                          <Label className="text-gray-300 text-sm font-medium">Select Cryptocurrency</Label>
                          <select
                            value={selectedCrypto}
                            onChange={(e) => {
                              setSelectedCrypto(e.target.value);
                              setSelectedNetwork(e.target.value); // Default network to same as crypto
                            }}
                            className="w-full mt-2 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                          >
                            <option value="BTC">Bitcoin (BTC)</option>
                            <option value="ETH">Ethereum (ETH)</option>
                            <option value="USDT">Tether (USDT)</option>
                            <option value="SOL">Solana (SOL)</option>
                          </select>
                        </div>

                        {/* Network Selection */}
                        <div>
                          <Label className="text-gray-300 text-sm font-medium">Withdrawal Network</Label>
                          <select
                            value={selectedNetwork}
                            onChange={(e) => setSelectedNetwork(e.target.value)}
                            className="w-full mt-2 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                          >
                            {selectedCrypto === 'USDT' && (
                              <>
                                <option value="TRC20">TRC20 (Tron)</option>
                                <option value="ERC20">ERC20 (Ethereum)</option>
                                <option value="BEP20">BEP20 (BSC)</option>
                              </>
                            )}
                            {selectedCrypto === 'BTC' && (
                              <option value="BTC">Bitcoin Network</option>
                            )}
                            {selectedCrypto === 'ETH' && (
                              <option value="ERC20">ERC20 (Ethereum)</option>
                            )}
                            {selectedCrypto === 'SOL' && (
                              <option value="SOL">Solana Network</option>
                            )}
                          </select>
                          <div className="text-xs text-gray-400 mt-1">
                            Please ensure you select the correct network to avoid loss of funds
                          </div>
                        </div>

                        {/* Amount Input */}
                        <div>
                          <Label className="text-gray-300 text-sm font-medium">Withdrawal Amount</Label>
                          <div className="relative mt-2">
                            <Input
                              id="withdrawAmount"
                              name="withdrawAmount"
                              type="number"
                              placeholder="0.00"
                              value={withdrawAmount}
                              onChange={(e) => setWithdrawAmount(e.target.value)}
                              className="bg-gray-700 border-gray-600 text-white pr-16 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                              {selectedCrypto}
                            </div>
                          </div>
                          <div className="flex justify-between text-sm text-gray-400 mt-1">
                            <span>Available: {balances.find(b => b.symbol === selectedCrypto)?.available || '0'} {selectedCrypto}</span>
                            <button
                              onClick={() => setWithdrawAmount(balances.find(b => b.symbol === selectedCrypto)?.available || '0')}
                              className="text-purple-400 hover:text-purple-300"
                            >
                              Max
                            </button>
                          </div>
                        </div>

                        {/* Withdrawal Address */}
                        <div>
                          <Label className="text-gray-300 text-sm font-medium">Withdrawal Address</Label>
                          <Input
                            id="withdrawAddress"
                            name="withdrawAddress"
                            type="text"
                            placeholder={`Enter ${selectedCrypto} address`}
                            value={withdrawAddress}
                            onChange={(e) => setWithdrawAddress(e.target.value)}
                            className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                          />
                          <div className="text-xs text-gray-400 mt-1">
                            Double-check the address. Transactions cannot be reversed.
                          </div>
                        </div>

                        {/* Fund Password */}
                        <div>
                          <Label className="text-gray-300 text-sm font-medium">Fund Password</Label>
                          <Input
                            id="fundPassword"
                            name="fundPassword"
                            type="password"
                            placeholder="Enter your fund password"
                            value={fundPassword}
                            onChange={(e) => setFundPassword(e.target.value)}
                            className="mt-2 bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                          />
                          <div className="text-xs text-gray-400 mt-1">
                            Fund password is required for security verification
                          </div>
                        </div>

                        {/* Withdrawal Button */}
                        <Button
                          onClick={() => {
                            if (!withdrawAddress || !withdrawAmount || !fundPassword || parseFloat(withdrawAmount) <= 0) {
                              toast({
                                title: 'Invalid Input',
                                description: 'Please fill in all required fields',
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
                          disabled={!withdrawAddress || !withdrawAmount || !fundPassword || withdrawMutation.isPending}
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 py-3"
                        >
                          {withdrawMutation.isPending ? 'Processing Withdrawal...' : `Confirm Withdrawal`}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Withdrawal History */}
                <div className="lg:col-span-1">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                      <h3 className="text-white text-lg font-semibold mb-4">Recent Withdrawals</h3>
                      <div className="space-y-4">
                        {/* Real withdrawal history */}
                        {withdrawalHistory.length > 0 ? (
                          withdrawalHistory.slice(0, 3).map((withdrawal, index) => (
                            <div key={withdrawal.id || index} className="border-b border-gray-700 pb-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="text-white text-sm font-medium">
                                    {withdrawal.amount} {withdrawal.currency}
                                  </div>
                                  <div className="text-gray-400 text-xs">
                                    {withdrawal.currency} Network
                                  </div>
                                  <div className="text-gray-400 text-xs">
                                    {new Date(withdrawal.created_at || withdrawal.timestamp).toLocaleDateString()} {new Date(withdrawal.created_at || withdrawal.timestamp).toLocaleTimeString()}
                                  </div>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs ${
                                  withdrawal.status === 'pending'
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : withdrawal.status === 'approved' || withdrawal.status === 'completed'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {withdrawal.status === 'approved' ? 'Completed' : withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <div className="text-gray-400 text-sm">No withdrawal history</div>
                          </div>
                        )}

                        <div className="text-center">
                          <button className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
                            View All History
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
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
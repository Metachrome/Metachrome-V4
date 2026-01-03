var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
export default function MetaMaskConnect(_a) {
    var _this = this;
    var onConnect = _a.onConnect, className = _a.className, _b = _a.showTransactions, showTransactions = _b === void 0 ? false : _b;
    var _c = useState(null), account = _c[0], setAccount = _c[1];
    var _d = useState(false), isConnecting = _d[0], setIsConnecting = _d[1];
    var _e = useState(null), chainId = _e[0], setChainId = _e[1];
    var _f = useState('0'), balance = _f[0], setBalance = _f[1];
    var _g = useState(false), showDepositDialog = _g[0], setShowDepositDialog = _g[1];
    var _h = useState(false), showWithdrawDialog = _h[0], setShowWithdrawDialog = _h[1];
    var _j = useState(''), depositAmount = _j[0], setDepositAmount = _j[1];
    var _k = useState(''), withdrawAmount = _k[0], setWithdrawAmount = _k[1];
    var _l = useState(false), isTransacting = _l[0], setIsTransacting = _l[1];
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    // Fetch user balances
    var userBalances = useQuery({
        queryKey: ['/api/balances'],
        enabled: !!account,
        refetchInterval: 5000, // Refresh every 5 seconds
    }).data;
    // Fetch transaction history
    var transactions = useQuery({
        queryKey: ['/api/transactions'],
        enabled: !!account && showTransactions,
        refetchInterval: 10000, // Refresh every 10 seconds
    }).data;
    // MetaMask authentication mutation
    var authMutation = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest('POST', '/api/auth', data)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); },
        onSuccess: function (data) {
            toast({
                title: 'Connected Successfully',
                description: 'Your MetaMask wallet has been connected.',
            });
            queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
            queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
            if (onConnect) {
                onConnect(account);
            }
        },
        onError: function (error) {
            toast({
                title: 'Connection Failed',
                description: error.message || 'Failed to connect wallet.',
                variant: 'destructive',
            });
        },
    });
    // Deposit mutation
    var depositMutation = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest('POST', '/api/wallet/deposit', data)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); },
        onSuccess: function () {
            toast({
                title: 'Deposit Initiated',
                description: 'Your deposit is being processed.',
            });
            queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
            queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
            setDepositAmount('');
            setShowDepositDialog(false);
        },
        onError: function (error) {
            toast({
                title: 'Deposit Failed',
                description: error.message || 'Failed to process deposit.',
                variant: 'destructive',
            });
        },
    });
    // Withdrawal mutation
    var withdrawMutation = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest('POST', '/api/wallet/withdraw', data)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); },
        onSuccess: function () {
            toast({
                title: 'Withdrawal Initiated',
                description: 'Your withdrawal is being processed.',
            });
            queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
            queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
            setWithdrawAmount('');
            setShowWithdrawDialog(false);
        },
        onError: function (error) {
            toast({
                title: 'Withdrawal Failed',
                description: error.message || 'Failed to process withdrawal.',
                variant: 'destructive',
            });
        },
    });
    // Check if MetaMask is installed
    var isMetaMaskInstalled = function () {
        return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
    };
    // Get current account and balance
    var getCurrentAccount = function () { return __awaiter(_this, void 0, void 0, function () {
        var accounts, chainId_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, window.ethereum.request({ method: 'eth_accounts' })];
                case 1:
                    accounts = _a.sent();
                    if (!(accounts.length > 0)) return [3 /*break*/, 4];
                    setAccount(accounts[0]);
                    return [4 /*yield*/, window.ethereum.request({ method: 'eth_chainId' })];
                case 2:
                    chainId_1 = _a.sent();
                    setChainId(chainId_1);
                    return [4 /*yield*/, getWalletBalance(accounts[0])];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.error('Error getting current account:', error_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // Get wallet balance
    var getWalletBalance = function (address) { return __awaiter(_this, void 0, void 0, function () {
        var balance_1, ethBalance, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, window.ethereum.request({
                            method: 'eth_getBalance',
                            params: [address, 'latest'],
                        })];
                case 1:
                    balance_1 = _a.sent();
                    ethBalance = parseInt(balance_1, 16) / Math.pow(10, 18);
                    setBalance(ethBalance.toFixed(4));
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error getting wallet balance:', error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Connect to MetaMask
    var connectWallet = function () { return __awaiter(_this, void 0, void 0, function () {
        var accounts, walletAddress, chainId_2, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isMetaMaskInstalled()) {
                        toast({
                            title: 'MetaMask Not Found',
                            description: 'Please install MetaMask to connect your wallet.',
                            variant: 'destructive',
                        });
                        return [2 /*return*/];
                    }
                    setIsConnecting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, 8, 9]);
                    return [4 /*yield*/, window.ethereum.request({
                            method: 'eth_requestAccounts',
                        })];
                case 2:
                    accounts = _a.sent();
                    if (!(accounts.length > 0)) return [3 /*break*/, 6];
                    walletAddress = accounts[0];
                    setAccount(walletAddress);
                    return [4 /*yield*/, window.ethereum.request({ method: 'eth_chainId' })];
                case 3:
                    chainId_2 = _a.sent();
                    setChainId(chainId_2);
                    // Get wallet balance
                    return [4 /*yield*/, getWalletBalance(walletAddress)];
                case 4:
                    // Get wallet balance
                    _a.sent();
                    // Authenticate with backend
                    return [4 /*yield*/, authMutation.mutateAsync({ walletAddress: walletAddress })];
                case 5:
                    // Authenticate with backend
                    _a.sent();
                    _a.label = 6;
                case 6: return [3 /*break*/, 9];
                case 7:
                    error_3 = _a.sent();
                    console.error('Error connecting to MetaMask:', error_3);
                    toast({
                        title: 'Connection Failed',
                        description: error_3.message || 'Failed to connect to MetaMask.',
                        variant: 'destructive',
                    });
                    return [3 /*break*/, 9];
                case 8:
                    setIsConnecting(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    // Handle deposit transaction
    var handleDeposit = function () { return __awaiter(_this, void 0, void 0, function () {
        var amount, amountInWei, platformAddress, txHash, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!account || !depositAmount)
                        return [2 /*return*/];
                    setIsTransacting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    amount = parseFloat(depositAmount);
                    if (amount <= 0) {
                        throw new Error('Invalid deposit amount');
                    }
                    amountInWei = '0x' + (amount * Math.pow(10, 18)).toString(16);
                    platformAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b';
                    return [4 /*yield*/, window.ethereum.request({
                            method: 'eth_sendTransaction',
                            params: [{
                                    from: account,
                                    to: platformAddress,
                                    value: amountInWei,
                                    gas: '0x5208', // 21000 gas for simple transfer
                                }],
                        })];
                case 2:
                    txHash = _a.sent();
                    // Record deposit in backend
                    return [4 /*yield*/, depositMutation.mutateAsync({
                            amount: depositAmount,
                            txHash: txHash,
                        })];
                case 3:
                    // Record deposit in backend
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    error_4 = _a.sent();
                    console.error('Error processing deposit:', error_4);
                    toast({
                        title: 'Deposit Failed',
                        description: error_4.message || 'Failed to process deposit.',
                        variant: 'destructive',
                    });
                    return [3 /*break*/, 6];
                case 5:
                    setIsTransacting(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // Handle withdrawal transaction
    var handleWithdraw = function () { return __awaiter(_this, void 0, void 0, function () {
        var amount, usdtBalance, availableBalance, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!account || !withdrawAmount)
                        return [2 /*return*/];
                    setIsTransacting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    amount = parseFloat(withdrawAmount);
                    if (amount <= 0) {
                        throw new Error('Invalid withdrawal amount');
                    }
                    usdtBalance = userBalances === null || userBalances === void 0 ? void 0 : userBalances.find(function (b) { return b.symbol === 'USDT'; });
                    availableBalance = parseFloat((usdtBalance === null || usdtBalance === void 0 ? void 0 : usdtBalance.available) || '0');
                    if (amount > availableBalance) {
                        throw new Error('Insufficient balance');
                    }
                    // Process withdrawal through backend
                    return [4 /*yield*/, withdrawMutation.mutateAsync({
                            amount: withdrawAmount,
                            toAddress: account,
                        })];
                case 2:
                    // Process withdrawal through backend
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    error_5 = _a.sent();
                    console.error('Error processing withdrawal:', error_5);
                    toast({
                        title: 'Withdrawal Failed',
                        description: error_5.message || 'Failed to process withdrawal.',
                        variant: 'destructive',
                    });
                    return [3 /*break*/, 5];
                case 4:
                    setIsTransacting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Sign message for additional verification (optional)
    var signMessage = function () { return __awaiter(_this, void 0, void 0, function () {
        var message, signature, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!account)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    message = "Sign this message to verify your wallet ownership: ".concat(Date.now());
                    return [4 /*yield*/, window.ethereum.request({
                            method: 'personal_sign',
                            params: [message, account],
                        })];
                case 2:
                    signature = _a.sent();
                    // Send signature to backend for additional verification
                    return [4 /*yield*/, authMutation.mutateAsync({ walletAddress: account, signature: signature })];
                case 3:
                    // Send signature to backend for additional verification
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_6 = _a.sent();
                    console.error('Error signing message:', error_6);
                    toast({
                        title: 'Signing Failed',
                        description: error_6.message || 'Failed to sign message.',
                        variant: 'destructive',
                    });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // Handle account changes
    var handleAccountsChanged = function (accounts) {
        if (accounts.length > 0) {
            setAccount(accounts[0]);
            getWalletBalance(accounts[0]);
        }
        else {
            setAccount(null);
            setChainId(null);
            setBalance('0');
        }
    };
    // Handle chain changes
    var handleChainChanged = function (chainId) {
        setChainId(chainId);
        // Refresh balance when chain changes
        if (account) {
            getWalletBalance(account);
        }
    };
    // Setup event listeners
    useEffect(function () {
        if (isMetaMaskInstalled()) {
            getCurrentAccount();
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', handleChainChanged);
            return function () {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('chainChanged', handleChainChanged);
            };
        }
    }, []);
    // Get network name from chain ID
    var getNetworkName = function (chainId) {
        var networks = {
            '0x1': 'Ethereum Mainnet',
            '0x3': 'Ropsten Testnet',
            '0x4': 'Rinkeby Testnet',
            '0x5': 'Goerli Testnet',
            '0x89': 'Polygon Mainnet',
            '0x13881': 'Polygon Mumbai Testnet',
            '0x38': 'BSC Mainnet',
            '0x61': 'BSC Testnet',
        };
        return networks[chainId] || "Unknown (".concat(chainId, ")");
    };
    // Copy address to clipboard
    var copyAddress = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!account) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, navigator.clipboard.writeText(account)];
                case 2:
                    _a.sent();
                    toast({
                        title: 'Copied',
                        description: 'Wallet address copied to clipboard.',
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_7 = _a.sent();
                    console.error('Failed to copy address:', error_7);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    if (!isMetaMaskInstalled()) {
        return (<Card className={"bg-slate-800/90 border-red-500/20 ".concat(className)}>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4"/>
          <h3 className="text-lg font-semibold text-white mb-2">MetaMask Required</h3>
          <p className="text-gray-300 mb-4">
            Please install MetaMask to connect your wallet and start trading.
          </p>
          <Button onClick={function () { return window.open('https://metamask.io/download/', '_blank'); }} className="bg-orange-600 hover:bg-orange-700 text-white">
            Install MetaMask
          </Button>
        </CardContent>
      </Card>);
    }
    if (account) {
        var usdtBalance = userBalances === null || userBalances === void 0 ? void 0 : userBalances.find(function (b) { return b.symbol === 'USDT'; });
        return (<Card className={"bg-slate-800/90 border-green-500/20 ".concat(className)}>
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400"/>
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
            <Button size="sm" variant="outline" onClick={copyAddress} className="border-purple-500 text-purple-400 hover:bg-purple-500/20">
              <Copy className="w-4 h-4"/>
            </Button>
          </div>

          {/* Wallet Balance */}
          <div className="bg-slate-700/50 p-3 rounded-lg">
            <p className="text-sm text-gray-300">Wallet Balance</p>
            <p className="text-white font-bold text-lg">{balance} ETH</p>
          </div>

          {/* Platform Balance */}
          {usdtBalance && (<div className="bg-slate-700/50 p-3 rounded-lg">
              <p className="text-sm text-gray-300">Platform Balance</p>
              <p className="text-white font-bold text-lg">
                ${parseFloat(usdtBalance.available).toLocaleString()} USDT
              </p>
              {parseFloat(usdtBalance.locked) > 0 && (<p className="text-yellow-400 text-sm">
                  ${parseFloat(usdtBalance.locked).toLocaleString()} locked
                </p>)}
            </div>)}

          {chainId && (<div className="bg-slate-700/50 p-3 rounded-lg">
              <p className="text-sm text-gray-300">Network</p>
              <Badge variant="outline" className="border-blue-500 text-blue-400">
                {getNetworkName(chainId)}
              </Badge>
            </div>)}

          {/* Transaction Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Send className="w-4 h-4 mr-2"/>
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
                    <Input type="number" placeholder="0.0" value={depositAmount} onChange={function (e) { return setDepositAmount(e.target.value); }} className="bg-slate-700 border-slate-600 text-white"/>
                    <p className="text-xs text-gray-400 mt-1">
                      Available: {balance} ETH
                    </p>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={function () { return setShowDepositDialog(false); }} className="border-slate-600 text-gray-300">
                      Cancel
                    </Button>
                    <Button onClick={handleDeposit} disabled={isTransacting || !depositAmount} className="bg-green-600 hover:bg-green-700">
                      {isTransacting ? (<Loader2 className="w-4 h-4 mr-2 animate-spin"/>) : (<Send className="w-4 h-4 mr-2"/>)}
                      Deposit
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
              <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  <ArrowUpDown className="w-4 h-4 mr-2"/>
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
                    <Input type="number" placeholder="0.0" value={withdrawAmount} onChange={function (e) { return setWithdrawAmount(e.target.value); }} className="bg-slate-700 border-slate-600 text-white"/>
                    <p className="text-xs text-gray-400 mt-1">
                      Available: ${parseFloat((usdtBalance === null || usdtBalance === void 0 ? void 0 : usdtBalance.available) || '0').toLocaleString()} USDT
                    </p>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={function () { return setShowWithdrawDialog(false); }} className="border-slate-600 text-gray-300">
                      Cancel
                    </Button>
                    <Button onClick={handleWithdraw} disabled={isTransacting || !withdrawAmount} className="bg-orange-600 hover:bg-orange-700">
                      {isTransacting ? (<Loader2 className="w-4 h-4 mr-2 animate-spin"/>) : (<ArrowUpDown className="w-4 h-4 mr-2"/>)}
                      Withdraw
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex gap-2">
            <Button onClick={signMessage} disabled={authMutation.isPending} size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
              Verify Signature
            </Button>
            <Button onClick={function () {
                setAccount(null);
                setChainId(null);
                setBalance('0');
            }} size="sm" variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/20">
              Disconnect
            </Button>
          </div>

          {/* Transaction History */}
          {showTransactions && transactions && transactions.length > 0 && (<div className="bg-slate-700/50 p-3 rounded-lg">
              <p className="text-sm text-gray-300 mb-2">Recent Transactions</p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {transactions.slice(0, 5).map(function (tx) { return (<div key={tx.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <Badge variant={tx.type === 'deposit' ? 'default' : 'secondary'} className="text-xs">
                        {tx.type}
                      </Badge>
                      <span className="text-white">${tx.amount} {tx.symbol}</span>
                    </div>
                    <Badge variant={tx.status === 'completed' ? 'default' :
                        tx.status === 'pending' ? 'secondary' : 'destructive'} className="text-xs">
                      {tx.status}
                    </Badge>
                  </div>); })}
              </div>
            </div>)}
        </CardContent>
      </Card>);
    }
    return (<Card className={"bg-slate-800/90 border-purple-500/20 ".concat(className)}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-purple-400"/>
          Connect MetaMask
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-300 text-sm">
          Connect your MetaMask wallet to start trading and manage your funds securely.
        </p>
        
        <Button onClick={connectWallet} disabled={isConnecting || authMutation.isPending} className="w-full bg-orange-600 hover:bg-orange-700 text-white h-12">
          <Wallet className="w-5 h-5 mr-2"/>
          {isConnecting || authMutation.isPending ? 'Connecting...' : 'Connect MetaMask'}
        </Button>

        <div className="text-xs text-gray-400 space-y-1">
          <p>• Secure wallet connection</p>
          <p>• No private keys stored</p>
          <p>• Decentralized authentication</p>
        </div>
      </CardContent>
    </Card>);
}

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
import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link } from 'wouter';
import { useToast } from '../hooks/use-toast';
import QRCodeGenerator from '../components/QRCodeGenerator';
import { TrendingUp, BarChart3, Eye, EyeOff, Plus, Copy, Upload, CheckCircle, Wallet } from 'lucide-react';
export default function UserDashboard() {
    var _this = this;
    var _a, _b, _c, _d, _e, _f, _g;
    var _h = useAuth(), user = _h.user, userLogin = _h.userLogin, isUserLoginPending = _h.isUserLoginPending;
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    var fileInputRef = useRef(null);
    // State for UI controls
    var _j = useState(true), showBalance = _j[0], setShowBalance = _j[1];
    // State for login form
    var _k = useState(false), showLogin = _k[0], setShowLogin = _k[1];
    var _l = useState(''), loginUsername = _l[0], setLoginUsername = _l[1];
    var _m = useState(''), loginPassword = _m[0], setLoginPassword = _m[1];
    // State for Add Fund form
    var _o = useState(''), depositAmount = _o[0], setDepositAmount = _o[1];
    var _p = useState('BTC'), selectedCrypto = _p[0], setSelectedCrypto = _p[1];
    var _q = useState(null), uploadedFile = _q[0], setUploadedFile = _q[1];
    // Login handler
    var handleLogin = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, userLogin({ username: loginUsername, password: loginPassword })];
                case 2:
                    _a.sent();
                    setShowLogin(false);
                    setLoginUsername('');
                    setLoginPassword('');
                    toast({
                        title: 'Login Successful! ✅',
                        description: 'Welcome to your dashboard',
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    toast({
                        title: 'Login Failed ❌',
                        description: error_1.message || 'Invalid credentials',
                        variant: 'destructive',
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Simplified data fetching - only fetch balances for now
    var _r = useQuery({
        queryKey: ['/api/balances'],
        enabled: !!(user === null || user === void 0 ? void 0 : user.id),
    }), balances = _r.data, balancesLoading = _r.isLoading;
    // Simple calculations for now - use API balance if available, fallback to user session balance
    var usdtBalance = Array.isArray(balances) ? balances.find(function (b) { return b.symbol === 'USDT'; }) : balances === null || balances === void 0 ? void 0 : balances.USDT;
    var totalBalance = (usdtBalance === null || usdtBalance === void 0 ? void 0 : usdtBalance.available) ? parseFloat(usdtBalance.available) : ((user === null || user === void 0 ? void 0 : user.balance) || 0);
    // Real platform deposit addresses (where users send crypto to deposit)
    var cryptoNetworks = {
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
            minAmount: 100,
            description: 'Send USDT on Ethereum network to this address',
            chainId: 1
        },
        'USDT-TRC20': {
            name: 'USDT TRC20',
            address: 'TTZzHBjpmksYqaM6seVjCSLSe6m77Bfjp9',
            network: 'USDT TRC20',
            minAmount: 100,
            description: 'Send USDT on TRON network to this address',
            chainId: null
        },
        'USDT-BEP20': {
            name: 'USDT BEP20',
            address: '0x06292164c039E611B37ff0c4B71ce0F72e56AB7A',
            network: 'USDT BEP20',
            minAmount: 100,
            description: 'Send USDT on Binance Smart Chain to this address',
            chainId: 56
        }
    };
    // Deposit mutation - Real implementation with file upload
    var depositMutation = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var authToken, depositResponse, error, depositResult, formData, proofResponse, error, proofResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        authToken = localStorage.getItem('authToken');
                        if (!authToken || !user) {
                            throw new Error('Please login first to make a deposit');
                        }
                        return [4 /*yield*/, fetch('/api/transactions/deposit-request', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': "Bearer ".concat(authToken)
                                },
                                body: JSON.stringify({
                                    amount: data.amount,
                                    currency: data.currency
                                })
                            })];
                    case 1:
                        depositResponse = _a.sent();
                        if (!!depositResponse.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, depositResponse.text()];
                    case 2:
                        error = _a.sent();
                        throw new Error(error || 'Failed to create deposit request');
                    case 3: return [4 /*yield*/, depositResponse.json()];
                    case 4:
                        depositResult = _a.sent();
                        if (!data.receipt) return [3 /*break*/, 9];
                        formData = new FormData();
                        formData.append('depositId', depositResult.depositId);
                        formData.append('txHash', "user_upload_".concat(Date.now())); // Temporary hash until user provides real one
                        formData.append('walletAddress', 'user_wallet_address');
                        formData.append('receipt', data.receipt);
                        return [4 /*yield*/, fetch('/api/transactions/submit-proof', {
                                method: 'POST',
                                headers: {
                                    'Authorization': "Bearer ".concat(authToken)
                                },
                                body: formData
                            })];
                    case 5:
                        proofResponse = _a.sent();
                        if (!!proofResponse.ok) return [3 /*break*/, 7];
                        return [4 /*yield*/, proofResponse.text()];
                    case 6:
                        error = _a.sent();
                        throw new Error(error || 'Failed to submit proof');
                    case 7: return [4 /*yield*/, proofResponse.json()];
                    case 8:
                        proofResult = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: proofResult.message,
                                depositId: depositResult.depositId,
                                amount: data.amount,
                                currency: data.currency,
                                status: 'verifying',
                                receiptUploaded: true
                            }];
                    case 9: return [2 /*return*/, depositResult];
                }
            });
        }); },
        onSuccess: function (data) {
            toast({
                title: 'Deposit Submitted Successfully! ✅',
                description: "Your ".concat(data.amount, " ").concat(data.currency, " deposit request has been submitted for processing. Deposit ID: ").concat(data.depositId),
            });
            queryClient.invalidateQueries({ queryKey: ['/api/balances'] });
            setDepositAmount('');
            setUploadedFile(null);
        },
        onError: function (error) {
            toast({
                title: 'Deposit Failed',
                description: error.message || 'Failed to submit deposit request.',
                variant: 'destructive',
            });
        },
    });
    // Helper functions
    var handleFileUpload = function (event) {
        var _a;
        var file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (file) {
            // Validate file type
            var allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
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
    var copyToClipboard = function (text) {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied!",
            description: "Address copied to clipboard",
        });
    };
    var handleDepositSubmit = function () {
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
        var network = cryptoNetworks[selectedCrypto];
        if (parseFloat(depositAmount) < network.minAmount) {
            toast({
                title: 'Amount Too Small',
                description: "Minimum deposit amount is ".concat(network.minAmount, " ").concat(selectedCrypto, "."),
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
    var generateQRCode = function () {
        var network = cryptoNetworks[selectedCrypto];
        var address = network.address;
        console.log('QR Code value:', address); // Debug log
        // Format as descriptive text to prevent MetaMask from trying to interpret it as a transaction
        return "METACHROME DEPOSIT ADDRESS\n".concat(network.network, "\n").concat(address, "\n\nCOPY THIS ADDRESS TO YOUR WALLET");
    };
    // Show login form if user is not authenticated
    if (!user) {
        return (<div className="min-h-screen bg-gray-900 pt-20 pb-12 flex items-center justify-center">
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
                  <input type="text" value={loginUsername} onChange={function (e) { return setLoginUsername(e.target.value); }} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Enter your username" required/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input type="password" value={loginPassword} onChange={function (e) { return setLoginPassword(e.target.value); }} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Enter your password" required/>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 font-medium" disabled={isUserLoginPending}>
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
      </div>);
    }
    return (<div className="min-h-screen bg-gray-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 break-words">
            {(function () {
            // Prioritize name over username
            if ((user === null || user === void 0 ? void 0 : user.firstName) && (user === null || user === void 0 ? void 0 : user.lastName)) {
                return "Welcome back, ".concat(user.firstName, " ").concat(user.lastName, "!");
            }
            if (user === null || user === void 0 ? void 0 : user.firstName) {
                return "Welcome back, ".concat(user.firstName, "!");
            }
            if (user === null || user === void 0 ? void 0 : user.username) {
                // If username is a long wallet address, split it into two lines for mobile
                if (user.username.startsWith('0x') && user.username.length > 20) {
                    var firstLine = user.username.slice(0, 21); // First 21 characters
                    var secondLine = user.username.slice(21); // Remaining characters
                    return (<div className="block max-w-full overflow-hidden">
                      <div className="leading-tight">Welcome back,</div>
                      <div className="leading-tight font-mono text-purple-400 break-all text-xs sm:text-sm md:text-base">
                        {firstLine}
                        <br />
                        {secondLine}!
                      </div>
                    </div>);
                }
                return "Welcome back, ".concat(user.username, "!");
            }
            return 'Welcome back, User!';
        })()}
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Here's your trading overview and account summary.
          </p>
        </div>

        {/* Verification Status Notification - Show only if NOT verified and has NOT uploaded documents */}
        {(!(user === null || user === void 0 ? void 0 : user.verificationStatus) || (user === null || user === void 0 ? void 0 : user.verificationStatus) === 'unverified') && !(user === null || user === void 0 ? void 0 : user.hasUploadedDocuments) && (<div className="mb-8">
            <Card className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-yellow-600/50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
                      <Upload className="w-5 h-5 text-white"/>
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
                      <Link href="/profile?tab=verification">
                        <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                          <Upload className="w-4 h-4 mr-2"/>
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
          </div>)}

        {/* Verification Pending Notification - Show if documents uploaded and status is pending */}
        {((user === null || user === void 0 ? void 0 : user.verificationStatus) === 'pending' || ((user === null || user === void 0 ? void 0 : user.hasUploadedDocuments) && (user === null || user === void 0 ? void 0 : user.verificationStatus) !== 'verified')) && (<div className="mb-8">
            <Card className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border-blue-600/50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white"/>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-100 mb-2">
                      ⏳ Document Uploaded - Verification in Progress
                    </h3>
                    <p className="text-blue-200 mb-2">
                      Your verification documents have been submitted and are currently being reviewed by our team.
                      You can check your verification status in your profile.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 items-start">
                      <div className="text-sm text-blue-300">
                        ⏱️ Review typically takes 24-48 hours
                      </div>
                      <Link href="/profile?tab=verification">
                        <Button variant="outline" size="sm" className="border-blue-400 text-blue-300 hover:bg-blue-800/30">
                          Check Status
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>)}

        {/* Total Portfolio Value - Single Card */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Portfolio Value
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={function () { return setShowBalance(!showBalance); }} className="h-6 w-6 p-0 text-gray-400 hover:text-white">
                  {showBalance ? <Eye className="h-3 w-3"/> : <EyeOff className="h-3 w-3"/>}
                </Button>
                <Wallet className="h-4 w-4 text-green-500"/>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {showBalance ? "".concat(totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), " USDT") : '••••••'}
              </div>
              <p className="text-xs text-gray-400">
                Available balance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-gray-400">
              Start trading or manage your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/trade/options">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <TrendingUp className="w-4 h-4 mr-2"/>
                Options Trading
              </Button>
            </Link>
            <Link href="/trade/spot">
              <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                <BarChart3 className="w-4 h-4 mr-2"/>
                Spot Trading
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
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
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 mb-8">
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
                  <select value={selectedCrypto} onChange={function (e) { return setSelectedCrypto(e.target.value); }} className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
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
                  <input type="text" inputMode="decimal" placeholder="Please enter the recharge amount" value={depositAmount} onChange={function (e) {
            // Only allow numbers and decimal point
            var value = e.target.value.replace(/[^0-9.]/g, '');
            // Prevent multiple decimal points
            var parts = value.split('.');
            if (parts.length > 2)
                return;
            setDepositAmount(value);
        }} className={"w-full bg-gray-800 border rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ".concat(!depositAmount ? 'border-red-500' : 'border-gray-600')}/>
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum: {(_a = cryptoNetworks[selectedCrypto]) === null || _a === void 0 ? void 0 : _a.minAmount} {selectedCrypto}
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
                      <strong>Important:</strong> Only send on {(_b = cryptoNetworks[selectedCrypto]) === null || _b === void 0 ? void 0 : _b.network}.
                      Sending on wrong network will result in loss of funds!
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2">
                    <span className="text-white text-sm font-mono flex-1 break-all">
                      {(_c = cryptoNetworks[selectedCrypto]) === null || _c === void 0 ? void 0 : _c.address}
                    </span>
                    <Button size="sm" variant="ghost" className="text-purple-400 hover:text-purple-300 p-2 hover:bg-gray-700" onClick={function () { var _a; return copyToClipboard((_a = cryptoNetworks[selectedCrypto]) === null || _a === void 0 ? void 0 : _a.address); }}>
                      <Copy className="w-4 h-4"/>
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Network: {(_d = cryptoNetworks[selectedCrypto]) === null || _d === void 0 ? void 0 : _d.network}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {(_e = cryptoNetworks[selectedCrypto]) === null || _e === void 0 ? void 0 : _e.description}
                  </p>
                </div>

                {/* QR Code */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    QR Code - Deposit Address
                  </label>

                  <div className="text-center">
                    <div className="bg-white p-6 rounded-lg inline-block">
                      <QRCodeGenerator value={generateQRCode()} size={200} className="mx-auto"/>
                    </div>
                    <p className="text-xs text-gray-300 mt-3">
                      Scan to see deposit information (copy the address manually)
                    </p>
                    <p className="text-xs text-yellow-300 mt-1">
                      Make sure to send on <strong>{(_f = cryptoNetworks[selectedCrypto]) === null || _f === void 0 ? void 0 : _f.network}</strong>
                    </p>
                    <p className="text-xs text-blue-300 mt-1">
                      Address: {(_g = cryptoNetworks[selectedCrypto]) === null || _g === void 0 ? void 0 : _g.address}
                    </p>
                  </div>

                  {/* Copy Address Button */}
                  <div className="mt-4">
                    <Button onClick={function () { var _a; return copyToClipboard((_a = cryptoNetworks[selectedCrypto]) === null || _a === void 0 ? void 0 : _a.address); }} className="w-full bg-green-600 hover:bg-green-700 text-white" size="sm">
                      <Copy className="w-4 h-4 mr-2"/>
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
                  <div className={"border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition-colors ".concat(!uploadedFile ? 'border-red-500' : 'border-gray-600')} onClick={function () { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }}>
                    {uploadedFile ? (<div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="w-6 h-6 text-green-500"/>
                        <span className="text-green-400 text-sm">{uploadedFile.name}</span>
                      </div>) : (<>
                        <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2"/>
                        <p className="text-gray-400 text-sm">Click to upload receipt</p>
                        <p className="text-gray-500 text-xs mt-1">JPEG, PNG, PDF (max 5MB)</p>
                      </>)}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/jpg,application/pdf" onChange={handleFileUpload} className="hidden"/>
                </div>

                {/* Required Fields Notice */}
                {(!depositAmount || !uploadedFile) && (<div className="p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg mb-4">
                    <p className="text-yellow-300 text-sm">
                      ⚠️ Please complete all required fields:
                    </p>
                    <ul className="text-yellow-200 text-xs mt-1 ml-4">
                      {!depositAmount && <li>• Enter deposit amount</li>}
                      {!uploadedFile && <li>• Upload transaction receipt</li>}
                    </ul>
                  </div>)}

                {/* Confirm Button */}
                <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleDepositSubmit} disabled={depositMutation.isPending || !depositAmount || !uploadedFile}>
                  {depositMutation.isPending ? 'Processing...' : 'Confirm recharge'}
                </Button>
              </div>
            </CardContent>
          </Card>
      </div>
    </div>);
}

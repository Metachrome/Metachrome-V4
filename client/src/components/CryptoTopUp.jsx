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
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Copy, CheckCircle, Clock, AlertTriangle, Wallet } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
export function CryptoTopUp() {
    var _this = this;
    var user = useAuth().user;
    var _a = useState('form'), step = _a[0], setStep = _a[1];
    var _b = useState(''), amount = _b[0], setAmount = _b[1];
    var _c = useState('USDT'), currency = _c[0], setCurrency = _c[1];
    var _d = useState(null), depositRequest = _d[0], setDepositRequest = _d[1];
    var _e = useState(''), txHash = _e[0], setTxHash = _e[1];
    var _f = useState(''), walletAddress = _f[0], setWalletAddress = _f[1];
    var _g = useState(null), depositStatus = _g[0], setDepositStatus = _g[1];
    var _h = useState(false), loading = _h[0], setLoading = _h[1];
    var _j = useState(''), error = _j[0], setError = _j[1];
    var _k = useState(false), copied = _k[0], setCopied = _k[1];
    // Step 1: Create deposit request
    var handleCreateDeposit = function () { return __awaiter(_this, void 0, void 0, function () {
        var token, response, errorData, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!amount || parseFloat(amount) <= 0) {
                        setError('Please enter a valid amount');
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    setError('');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    token = localStorage.getItem('authToken');
                    return [4 /*yield*/, fetch('/api/transactions/deposit-request', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': "Bearer ".concat(token)
                            },
                            body: JSON.stringify({
                                amount: parseFloat(amount),
                                currency: currency
                            })
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _a.sent();
                    throw new Error(errorData.message || 'Failed to create deposit request');
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    data = _a.sent();
                    setDepositRequest(data);
                    setStep('instructions');
                    return [3 /*break*/, 8];
                case 6:
                    err_1 = _a.sent();
                    setError(err_1.message);
                    return [3 /*break*/, 8];
                case 7:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    // Step 2: Submit transaction proof
    var handleSubmitProof = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, errorData, data, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!txHash.trim()) {
                        setError('Please enter your transaction hash');
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    setError('');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    return [4 /*yield*/, fetch('/api/transactions/submit-proof', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                depositId: depositRequest === null || depositRequest === void 0 ? void 0 : depositRequest.depositId,
                                txHash: txHash.trim(),
                                walletAddress: walletAddress.trim()
                            })
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _a.sent();
                    throw new Error(errorData.message || 'Failed to submit proof');
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    data = _a.sent();
                    setStep('status');
                    // Start polling for status updates
                    pollDepositStatus();
                    return [3 /*break*/, 8];
                case 6:
                    err_2 = _a.sent();
                    setError(err_2.message);
                    return [3 /*break*/, 8];
                case 7:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    // Step 3: Poll for deposit status
    var pollDepositStatus = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, status_1, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(depositRequest === null || depositRequest === void 0 ? void 0 : depositRequest.depositId))
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, fetch("/api/transactions/deposit-status/".concat(depositRequest.depositId))];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    status_1 = _a.sent();
                    setDepositStatus(status_1);
                    // Continue polling if still processing
                    if (status_1.status === 'verifying' || status_1.status === 'pending') {
                        setTimeout(pollDepositStatus, 5000); // Poll every 5 seconds
                    }
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    err_3 = _a.sent();
                    console.error('Failed to check deposit status:', err_3);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // Copy to clipboard function
    var copyToClipboard = function (text) {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(function () { return setCopied(false); }, 2000);
    };
    // Reset form
    var resetForm = function () {
        setStep('form');
        setAmount('');
        setCurrency('USDT');
        setDepositRequest(null);
        setTxHash('');
        setWalletAddress('');
        setDepositStatus(null);
        setError('');
    };
    var getStatusIcon = function (status) {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-500"/>;
            case 'verifying':
                return <Clock className="h-5 w-5 text-yellow-500"/>;
            case 'failed':
                return <AlertTriangle className="h-5 w-5 text-red-500"/>;
            default:
                return <Clock className="h-5 w-5 text-blue-500"/>;
        }
    };
    var getStatusColor = function (status) {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'verifying':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };
    if (!user) {
        return (<Card>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4"/>
            <AlertDescription>
              Please log in to access the top-up feature.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>);
    }
    return (<Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5"/>
          Cryptocurrency Top-Up
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (<Alert variant="destructive">
            <AlertTriangle className="h-4 w-4"/>
            <AlertDescription>{error}</AlertDescription>
          </Alert>)}

        {/* Step 1: Amount and Currency Selection */}
        {step === 'form' && (<div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" placeholder="Enter amount" value={amount} onChange={function (e) { return setAmount(e.target.value); }} min="1" step="0.01"/>
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDT">USDT (Tether)</SelectItem>
                    <SelectItem value="BTC">BTC (Bitcoin)</SelectItem>
                    <SelectItem value="ETH">ETH (Ethereum)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button onClick={handleCreateDeposit} disabled={loading || !amount} className="w-full">
              {loading ? 'Creating Deposit...' : 'Generate Deposit Address'}
            </Button>
          </div>)}

        {/* Step 2: Deposit Instructions */}
        {step === 'instructions' && depositRequest && (<div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Deposit Instructions</h3>
              <p className="text-blue-700 text-sm">
                Send exactly <strong>{depositRequest.amount} {depositRequest.currency}</strong> to the address below
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Network</Label>
                <div className="p-3 bg-gray-50 rounded border">
                  {depositRequest.instructions.network}
                </div>
              </div>

              <div>
                <Label>Deposit Address</Label>
                <div className="flex gap-2">
                  <Input value={depositRequest.depositAddress} readOnly className="font-mono text-sm"/>
                  <Button variant="outline" size="sm" onClick={function () { return copyToClipboard(depositRequest.depositAddress); }}>
                    {copied ? <CheckCircle className="h-4 w-4"/> : <Copy className="h-4 w-4"/>}
                  </Button>
                </div>
              </div>

              <div>
                <Label>Amount</Label>
                <div className="p-3 bg-gray-50 rounded border font-semibold">
                  {depositRequest.amount} {depositRequest.currency}
                </div>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4"/>
              <AlertDescription>
                <div className="space-y-1">
                  {depositRequest.instructions.warnings.map(function (warning, index) { return (<div key={index} className="text-sm">{warning}</div>); })}
                </div>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label htmlFor="txHash">Transaction Hash</Label>
                <Input id="txHash" placeholder="Enter your transaction hash" value={txHash} onChange={function (e) { return setTxHash(e.target.value); }}/>
              </div>
              
              <div>
                <Label htmlFor="walletAddress">Your Wallet Address (Optional)</Label>
                <Input id="walletAddress" placeholder="Enter your wallet address" value={walletAddress} onChange={function (e) { return setWalletAddress(e.target.value); }}/>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmitProof} disabled={loading || !txHash.trim()} className="flex-1">
                  {loading ? 'Submitting...' : 'Submit Transaction Proof'}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>)}

        {/* Step 3: Status Monitoring */}
        {step === 'status' && (<div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Deposit Status</h3>
              {depositStatus && (<Badge className={getStatusColor(depositStatus.status)}>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(depositStatus.status)}
                    {depositStatus.status.toUpperCase()}
                  </div>
                </Badge>)}
            </div>

            {depositStatus && (<div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label>Amount</Label>
                    <div className="font-semibold">{depositStatus.amount} {depositStatus.currency}</div>
                  </div>
                  <div>
                    <Label>Deposit ID</Label>
                    <div className="font-mono text-xs">{depositStatus.depositId}</div>
                  </div>
                </div>

                {depositStatus.txHash && (<div>
                    <Label>Transaction Hash</Label>
                    <div className="font-mono text-xs break-all p-2 bg-gray-50 rounded">
                      {depositStatus.txHash}
                    </div>
                  </div>)}

                {depositStatus.status === 'completed' && (<Alert>
                    <CheckCircle className="h-4 w-4"/>
                    <AlertDescription>
                      Your deposit has been successfully processed! Your account balance has been updated.
                    </AlertDescription>
                  </Alert>)}

                {depositStatus.status === 'verifying' && (<Alert>
                    <Clock className="h-4 w-4"/>
                    <AlertDescription>
                      Your transaction is being verified. This usually takes 5-15 minutes.
                    </AlertDescription>
                  </Alert>)}

                {depositStatus.status === 'failed' && (<Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4"/>
                    <AlertDescription>
                      Your deposit failed to process. Please contact support for assistance.
                    </AlertDescription>
                  </Alert>)}
              </div>)}

            <Button onClick={resetForm} className="w-full">
              Make Another Deposit
            </Button>
          </div>)}
      </CardContent>
    </Card>);
}

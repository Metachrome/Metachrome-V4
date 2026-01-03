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
// Common token contracts
var TOKENS = {
    USDT_ETH: {
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        decimals: 6,
        symbol: 'USDT',
    },
    USDT_BSC: {
        address: '0x55d398326f99059fF775485246999027B3197955',
        decimals: 18,
        symbol: 'USDT',
    },
    BTC_ETH: {
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
        decimals: 8,
        symbol: 'WBTC',
    },
};
var Web3Service = /** @class */ (function () {
    function Web3Service() {
        this.provider = null;
    }
    // Initialize Web3 provider
    Web3Service.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (typeof window !== 'undefined' && window.ethereum) {
                    this.provider = window.ethereum;
                    return [2 /*return*/, true];
                }
                return [2 /*return*/, false];
            });
        });
    };
    // Connect to MetaMask
    Web3Service.prototype.connectWallet = function () {
        return __awaiter(this, void 0, void 0, function () {
            var accounts, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.provider) {
                            throw new Error('MetaMask not installed');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.provider.request({
                                method: 'eth_requestAccounts',
                            })];
                    case 2:
                        accounts = _a.sent();
                        return [2 /*return*/, accounts];
                    case 3:
                        error_1 = _a.sent();
                        throw new Error(error_1.message || 'Failed to connect wallet');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Get current account
    Web3Service.prototype.getCurrentAccount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var accounts, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.provider)
                            return [2 /*return*/, null];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.provider.request({
                                method: 'eth_accounts',
                            })];
                    case 2:
                        accounts = _a.sent();
                        return [2 /*return*/, accounts[0] || null];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Error getting current account:', error_2);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Get ETH balance
    Web3Service.prototype.getETHBalance = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var balance, ethBalance, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.provider) {
                            throw new Error('Provider not initialized');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.provider.request({
                                method: 'eth_getBalance',
                                params: [address, 'latest'],
                            })];
                    case 2:
                        balance = _a.sent();
                        ethBalance = parseInt(balance, 16) / Math.pow(10, 18);
                        return [2 /*return*/, ethBalance.toFixed(6)];
                    case 3:
                        error_3 = _a.sent();
                        throw new Error(error_3.message || 'Failed to get balance');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Get token balance (ERC-20)
    Web3Service.prototype.getTokenBalance = function (address_1, tokenSymbol_1) {
        return __awaiter(this, arguments, void 0, function (address, tokenSymbol, network) {
            var tokenKey, token, data, result, balance, error_4;
            if (network === void 0) { network = 'ETH'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tokenKey = "".concat(tokenSymbol, "_").concat(network);
                        token = TOKENS[tokenKey];
                        if (!token) {
                            throw new Error("Token ".concat(tokenSymbol, " not supported on ").concat(network));
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        data = "0x70a08231000000000000000000000000".concat(address.slice(2));
                        return [4 /*yield*/, this.provider.request({
                                method: 'eth_call',
                                params: [{
                                        to: token.address,
                                        data: data,
                                    }, 'latest'],
                            })];
                    case 2:
                        result = _a.sent();
                        balance = parseInt(result, 16) / Math.pow(10, token.decimals);
                        return [2 /*return*/, balance.toFixed(token.decimals)];
                    case 3:
                        error_4 = _a.sent();
                        throw new Error(error_4.message || 'Failed to get token balance');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Send ETH transaction
    Web3Service.prototype.sendETH = function (to, amount) {
        return __awaiter(this, void 0, void 0, function () {
            var from, value, txHash, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.provider) {
                            return [2 /*return*/, { success: false, error: 'Provider not initialized' }];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.getCurrentAccount()];
                    case 2:
                        from = _a.sent();
                        if (!from) {
                            return [2 /*return*/, { success: false, error: 'No account connected' }];
                        }
                        value = '0x' + (parseFloat(amount) * Math.pow(10, 18)).toString(16);
                        return [4 /*yield*/, this.provider.request({
                                method: 'eth_sendTransaction',
                                params: [{
                                        from: from,
                                        to: to,
                                        value: value,
                                    }],
                            })];
                    case 3:
                        txHash = _a.sent();
                        return [2 /*return*/, { success: true, txHash: txHash }];
                    case 4:
                        error_5 = _a.sent();
                        return [2 /*return*/, { success: false, error: error_5.message || 'Transaction failed' }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Send token transaction (ERC-20)
    Web3Service.prototype.sendToken = function (to_1, amount_1, tokenSymbol_1) {
        return __awaiter(this, arguments, void 0, function (to, amount, tokenSymbol, network) {
            var tokenKey, token, from, value, toAddress, data, txHash, error_6;
            if (network === void 0) { network = 'ETH'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tokenKey = "".concat(tokenSymbol, "_").concat(network);
                        token = TOKENS[tokenKey];
                        if (!token) {
                            return [2 /*return*/, { success: false, error: "Token ".concat(tokenSymbol, " not supported on ").concat(network) }];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.getCurrentAccount()];
                    case 2:
                        from = _a.sent();
                        if (!from) {
                            return [2 /*return*/, { success: false, error: 'No account connected' }];
                        }
                        value = (parseFloat(amount) * Math.pow(10, token.decimals)).toString(16).padStart(64, '0');
                        toAddress = to.slice(2).padStart(64, '0');
                        data = "0xa9059cbb000000000000000000000000".concat(toAddress).concat(value);
                        return [4 /*yield*/, this.provider.request({
                                method: 'eth_sendTransaction',
                                params: [{
                                        from: from,
                                        to: token.address,
                                        data: data,
                                    }],
                            })];
                    case 3:
                        txHash = _a.sent();
                        return [2 /*return*/, { success: true, txHash: txHash }];
                    case 4:
                        error_6 = _a.sent();
                        return [2 /*return*/, { success: false, error: error_6.message || 'Token transfer failed' }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Switch network
    Web3Service.prototype.switchNetwork = function (chainId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.provider)
                            return [2 /*return*/, false];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.provider.request({
                                method: 'wallet_switchEthereumChain',
                                params: [{ chainId: chainId }],
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_7 = _a.sent();
                        // If network doesn't exist, you might want to add it
                        console.error('Failed to switch network:', error_7);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Add token to MetaMask
    Web3Service.prototype.addTokenToWallet = function (tokenSymbol_1) {
        return __awaiter(this, arguments, void 0, function (tokenSymbol, network) {
            var tokenKey, token, error_8;
            if (network === void 0) { network = 'ETH'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tokenKey = "".concat(tokenSymbol, "_").concat(network);
                        token = TOKENS[tokenKey];
                        if (!token || !this.provider)
                            return [2 /*return*/, false];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.provider.request({
                                method: 'wallet_watchAsset',
                                params: {
                                    type: 'ERC20',
                                    options: {
                                        address: token.address,
                                        symbol: token.symbol,
                                        decimals: token.decimals,
                                    },
                                },
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_8 = _a.sent();
                        console.error('Failed to add token:', error_8);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Get transaction receipt
    Web3Service.prototype.getTransactionReceipt = function (txHash) {
        return __awaiter(this, void 0, void 0, function () {
            var error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.provider)
                            return [2 /*return*/, null];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.provider.request({
                                method: 'eth_getTransactionReceipt',
                                params: [txHash],
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_9 = _a.sent();
                        console.error('Failed to get transaction receipt:', error_9);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return Web3Service;
}());
export var web3Service = new Web3Service();

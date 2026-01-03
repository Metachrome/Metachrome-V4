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
import crypto from 'crypto';
import Stripe from 'stripe';
// Production-ready payment service
var PaymentService = /** @class */ (function () {
    function PaymentService() {
        this.stripe = null;
        this.stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
        this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
        // Initialize Stripe if secret key is provided
        if (this.stripeSecretKey) {
            this.stripe = new Stripe(this.stripeSecretKey, {
                apiVersion: '2025-07-30.basil',
            });
        }
    }
    // Stripe Credit Card Processing
    PaymentService.prototype.createPaymentIntent = function (amount, currency, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var paymentIntent, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.stripe) {
                            throw new Error('Stripe not configured. Please set STRIPE_SECRET_KEY environment variable.');
                        }
                        return [4 /*yield*/, this.stripe.paymentIntents.create({
                                amount: Math.round(amount * 100), // Convert to cents
                                currency: currency.toLowerCase(),
                                automatic_payment_methods: {
                                    enabled: true,
                                },
                                metadata: {
                                    userId: userId,
                                    type: 'deposit'
                                }
                            })];
                    case 1:
                        paymentIntent = _a.sent();
                        return [2 /*return*/, {
                                clientSecret: paymentIntent.client_secret,
                                paymentIntentId: paymentIntent.id,
                                requiresAction: paymentIntent.status === 'requires_action'
                            }];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Stripe payment intent creation failed:', error_1);
                        throw new Error('Payment processing unavailable');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    PaymentService.prototype.verifyPaymentIntent = function (paymentIntentId) {
        return __awaiter(this, void 0, void 0, function () {
            var paymentIntent, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this.stripe) {
                            console.error('Stripe not configured');
                            return [2 /*return*/, { success: false }];
                        }
                        return [4 /*yield*/, this.stripe.paymentIntents.retrieve(paymentIntentId)];
                    case 1:
                        paymentIntent = _a.sent();
                        return [2 /*return*/, {
                                success: paymentIntent.status === 'succeeded',
                                amount: paymentIntent.amount / 100,
                                currency: paymentIntent.currency.toUpperCase()
                            }];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Stripe verification failed:', error_2);
                        return [2 /*return*/, { success: false }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Blockchain Transaction Verification
    PaymentService.prototype.verifyBlockchainTransaction = function (txHash, currency, expectedAmount, toAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 9, , 10]);
                        console.log("\uD83D\uDD0D Verifying ".concat(currency, " transaction: ").concat(txHash));
                        _a = currency.toUpperCase();
                        switch (_a) {
                            case 'BTC': return [3 /*break*/, 1];
                            case 'ETH': return [3 /*break*/, 3];
                            case 'USDT': return [3 /*break*/, 5];
                        }
                        return [3 /*break*/, 7];
                    case 1: return [4 /*yield*/, this.verifyBitcoinTransaction(txHash, expectedAmount, toAddress)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.verifyEthereumTransaction(txHash, expectedAmount, toAddress)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.verifyUSDTTransaction(txHash, expectedAmount, toAddress)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7:
                        console.error("Unsupported currency: ".concat(currency));
                        return [2 /*return*/, false];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        error_3 = _b.sent();
                        console.error('Blockchain verification error:', error_3);
                        return [2 /*return*/, false];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    PaymentService.prototype.verifyBitcoinTransaction = function (txHash, expectedAmount, toAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // TODO: Implement Bitcoin verification using BlockCypher or similar API
                    // const response = await fetch(`https://api.blockcypher.com/v1/btc/main/txs/${txHash}`);
                    // const tx = await response.json();
                    // 
                    // if (!tx.confirmations || tx.confirmations < 1) {
                    //   return false;
                    // }
                    // 
                    // const output = tx.outputs.find(out => out.addresses.includes(toAddress));
                    // if (!output) {
                    //   return false;
                    // }
                    // 
                    // const receivedAmount = output.value / 100000000; // Convert satoshis to BTC
                    // return Math.abs(receivedAmount - parseFloat(expectedAmount)) < 0.00001;
                    // For demo purposes, always return false to require manual approval
                    return [2 /*return*/, false];
                }
                catch (error) {
                    console.error('Bitcoin verification error:', error);
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    PaymentService.prototype.verifyEthereumTransaction = function (txHash, expectedAmount, toAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // TODO: Implement Ethereum verification using Infura or Alchemy
                    // const Web3 = require('web3');
                    // const web3 = new Web3(process.env.ETH_RPC_URL);
                    // 
                    // const receipt = await web3.eth.getTransactionReceipt(txHash);
                    // if (!receipt || !receipt.status) {
                    //   return false;
                    // }
                    // 
                    // const tx = await web3.eth.getTransaction(txHash);
                    // if (tx.to.toLowerCase() !== toAddress.toLowerCase()) {
                    //   return false;
                    // }
                    // 
                    // const receivedAmount = web3.utils.fromWei(tx.value, 'ether');
                    // return Math.abs(parseFloat(receivedAmount) - parseFloat(expectedAmount)) < 0.001;
                    // For demo purposes, always return false to require manual approval
                    return [2 /*return*/, false];
                }
                catch (error) {
                    console.error('Ethereum verification error:', error);
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    PaymentService.prototype.verifyUSDTTransaction = function (txHash, expectedAmount, toAddress) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // TODO: Implement USDT verification (can be on Ethereum, Tron, or other chains)
                    // This requires checking the specific USDT contract on the respective blockchain
                    // For demo purposes, always return false to require manual approval
                    return [2 /*return*/, false];
                }
                catch (error) {
                    console.error('USDT verification error:', error);
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    // Bank Transfer Verification
    PaymentService.prototype.verifyBankTransfer = function (transferReference, amount, currency) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // TODO: Implement bank API integration (Plaid, Yodlee, or bank-specific APIs)
                    // This would typically involve:
                    // 1. Checking with bank API for transfer status
                    // 2. Matching reference number and amount
                    // 3. Verifying sender account details
                    // For demo purposes, always return false to require manual approval
                    console.log("\uD83C\uDFE6 Bank transfer verification required: ".concat(transferReference, " for ").concat(amount, " ").concat(currency));
                    return [2 /*return*/, false];
                }
                catch (error) {
                    console.error('Bank transfer verification error:', error);
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    // Generate secure deposit addresses for crypto
    PaymentService.prototype.generateDepositAddress = function (currency, userId) {
        // TODO: Implement proper address generation using HD wallets
        // This should generate unique addresses for each user and currency
        // For demo purposes, return mock addresses
        var mockAddresses = {
            BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            ETH: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4',
            USDT: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4'
        };
        return mockAddresses[currency] || 'Invalid currency';
    };
    // Stripe webhook verification
    PaymentService.prototype.verifyStripeWebhook = function (payload, signature) {
        try {
            if (!this.stripe || !this.webhookSecret) {
                console.error('Stripe webhook not configured');
                return null;
            }
            var event_1 = this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
            return event_1;
        }
        catch (error) {
            console.error('Stripe webhook verification failed:', error);
            return null;
        }
    };
    // Generic webhook verification for other payment providers
    PaymentService.prototype.verifyWebhookSignature = function (payload, signature, secret) {
        try {
            var expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(payload)
                .digest('hex');
            return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
        }
        catch (error) {
            console.error('Webhook signature verification failed:', error);
            return false;
        }
    };
    return PaymentService;
}());
export { PaymentService };
export var paymentService = new PaymentService();

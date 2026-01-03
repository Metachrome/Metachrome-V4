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
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { stripeService } from '../services/stripeService';
// Only load Stripe if the publishable key is properly configured
var stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
var stripePromise = stripeKey && stripeKey !== 'pk_test_your_key_here' ? loadStripe(stripeKey) : null;
function PaymentForm(_a) {
    var _this = this;
    var amount = _a.amount, currency = _a.currency, onSuccess = _a.onSuccess, onError = _a.onError;
    var stripe = useStripe();
    var elements = useElements();
    var toast = useToast().toast;
    var _b = useState(false), isProcessing = _b[0], setIsProcessing = _b[1];
    var _c = useState(''), clientSecret = _c[0], setClientSecret = _c[1];
    useEffect(function () {
        // Create payment intent when component mounts
        var createPaymentIntent = function () { return __awaiter(_this, void 0, void 0, function () {
            var clientSecret_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, stripeService.createPaymentIntent(amount, currency)];
                    case 1:
                        clientSecret_1 = (_a.sent()).clientSecret;
                        setClientSecret(clientSecret_1);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        onError(error_1 instanceof Error ? error_1.message : 'Failed to initialize payment');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        createPaymentIntent();
    }, [amount, currency, onError]);
    var handleSubmit = function (event) { return __awaiter(_this, void 0, void 0, function () {
        var cardElement, _a, error, paymentIntent, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    event.preventDefault();
                    if (!stripe || !elements || !clientSecret) {
                        return [2 /*return*/];
                    }
                    setIsProcessing(true);
                    cardElement = elements.getElement(CardElement);
                    if (!cardElement) {
                        setIsProcessing(false);
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, stripe.confirmCardPayment(clientSecret, {
                            payment_method: {
                                card: cardElement,
                            }
                        })];
                case 2:
                    _a = _b.sent(), error = _a.error, paymentIntent = _a.paymentIntent;
                    if (error) {
                        onError(error.message || 'Payment failed');
                        toast({
                            title: 'Payment Failed',
                            description: error.message,
                            variant: 'destructive',
                        });
                    }
                    else if (paymentIntent.status === 'succeeded') {
                        onSuccess(paymentIntent.id);
                        toast({
                            title: 'Payment Successful',
                            description: "Successfully processed payment of ".concat(amount, " ").concat(currency.toUpperCase()),
                        });
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _b.sent();
                    onError(error_2 instanceof Error ? error_2.message : 'Payment processing failed');
                    return [3 /*break*/, 5];
                case 4:
                    setIsProcessing(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#ffffff',
                backgroundColor: 'transparent',
                '::placeholder': {
                    color: '#9ca3af',
                },
            },
            invalid: {
                color: '#ef4444',
            },
        },
    };
    return (<form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-gray-300 mb-2 block">Card Information</Label>
        <div className="p-3 border border-gray-600 rounded-lg bg-gray-700">
          <CardElement options={cardElementOptions}/>
        </div>
      </div>
      
      <div className="text-sm text-gray-400">
        <p>Amount: {amount} {currency.toUpperCase()}</p>
        <p className="mt-1">Your payment is secured by Stripe</p>
      </div>

      <Button type="submit" disabled={!stripe || isProcessing || !clientSecret} className="w-full bg-green-600 hover:bg-green-700">
        {isProcessing ? 'Processing...' : "Pay ".concat(amount, " ").concat(currency.toUpperCase())}
      </Button>
    </form>);
}
export default function StripePayment(_a) {
    var amount = _a.amount, currency = _a.currency, onSuccess = _a.onSuccess, onError = _a.onError;
    // If Stripe is not configured, show a message
    if (!stripePromise) {
        return (<div className="text-center p-4 text-gray-400">
        <p>Credit card payments are currently unavailable.</p>
        <p className="text-sm mt-2">Please use cryptocurrency deposits instead.</p>
      </div>);
    }
    return (<Elements stripe={stripePromise}>
      <PaymentForm amount={amount} currency={currency} onSuccess={onSuccess} onError={onError}/>
    </Elements>);
}

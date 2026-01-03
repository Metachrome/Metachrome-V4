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
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../hooks/useAuth';
import { useLocation, Link } from 'wouter';
import { Eye, EyeOff } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import { SiEthereum } from 'react-icons/si';
import { useQueryClient } from '@tanstack/react-query';
import metachromeLogo from '../assets/new-metachrome-logo.png';
var loginSchema = z.object({
    email: z.string().min(1, 'Username, email, or wallet address is required'),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional(),
});
export default function UserLogin() {
    var _this = this;
    var _a = useLocation(), setLocation = _a[1];
    var toast = useToast().toast;
    var _b = useAuth(), userLogin = _b.userLogin, isUserLoginPending = _b.isUserLoginPending, metamaskLogin = _b.metamaskLogin;
    var _c = useState(false), showPassword = _c[0], setShowPassword = _c[1];
    var _d = useState(false), isMetaMaskConnecting = _d[0], setIsMetaMaskConnecting = _d[1];
    var queryClient = useQueryClient();
    var loginForm = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '', rememberMe: false },
    });
    var onLogin = function (data) { return __awaiter(_this, void 0, void 0, function () {
        var username, testResponse, responseText, responseData, directError_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    console.log('🔄 Starting login process...', { email: data.email });
                    username = data.email;
                    console.log('🔄 Calling userLogin with:', { username: username, password: '***' });
                    // Test direct fetch first
                    console.log('🧪 Testing direct fetch...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 6]);
                    return [4 /*yield*/, fetch('/api/auth/user/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username: username, password: data.password }),
                            credentials: 'include'
                        })];
                case 2:
                    testResponse = _a.sent();
                    console.log('🧪 Direct fetch response:', {
                        status: testResponse.status,
                        statusText: testResponse.statusText,
                        ok: testResponse.ok,
                        headers: Object.fromEntries(testResponse.headers.entries())
                    });
                    return [4 /*yield*/, testResponse.text()];
                case 3:
                    responseText = _a.sent();
                    console.log('🧪 Response text:', responseText);
                    if (testResponse.ok) {
                        responseData = JSON.parse(responseText);
                        console.log('🧪 Parsed response:', responseData);
                        // Store the token if provided
                        if (responseData.token) {
                            localStorage.setItem('authToken', responseData.token);
                            console.log('🔐 Token stored:', responseData.token);
                        }
                        // Store user data if provided
                        if (responseData.user) {
                            localStorage.setItem('user', JSON.stringify(responseData.user));
                            console.log('👤 User data stored:', responseData.user);
                        }
                        // Update query cache to trigger auth state change
                        queryClient.setQueryData(["/api/auth"], responseData.user);
                        queryClient.invalidateQueries({ queryKey: ["/api/auth"] });
                        console.log('🔄 Query cache updated');
                        toast({
                            title: "Login Successful",
                            description: "Welcome back!",
                        });
                        // Small delay to ensure auth state is updated
                        setTimeout(function () {
                            console.log('🔄 Redirecting to dashboard...');
                            setLocation('/dashboard');
                        }, 100);
                        return [2 /*return*/];
                    }
                    else {
                        throw new Error("Direct fetch failed: ".concat(testResponse.status, " ").concat(responseText));
                    }
                    return [3 /*break*/, 6];
                case 4:
                    directError_1 = _a.sent();
                    console.error('🧪 Direct fetch failed:', directError_1);
                    // Fall back to userLogin hook
                    console.log('🔄 Falling back to userLogin hook...');
                    return [4 /*yield*/, userLogin({ username: username, password: data.password })];
                case 5:
                    _a.sent();
                    console.log('✅ Login successful');
                    toast({
                        title: "Login Successful",
                        description: "Welcome back!",
                    });
                    setLocation('/dashboard');
                    return [3 /*break*/, 6];
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_1 = _a.sent();
                    console.error('❌ Login error:', error_1);
                    console.error('Error details:', {
                        message: error_1.message,
                        stack: error_1.stack,
                        name: error_1.name
                    });
                    toast({
                        title: "Login Failed",
                        description: error_1.message || "Invalid credentials",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    // MetaMask connection handler
    var handleMetaMaskConnect = function () { return __awaiter(_this, void 0, void 0, function () {
        var accounts, walletAddress, data, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('🔄 Starting MetaMask connection...');
                    console.log('Window ethereum:', window.ethereum);
                    console.log('Is MetaMask:', (_a = window.ethereum) === null || _a === void 0 ? void 0 : _a.isMetaMask);
                    // Check if MetaMask is installed
                    if (!window.ethereum) {
                        console.error('❌ No ethereum provider found');
                        toast({
                            title: "MetaMask Not Found",
                            description: "Please install MetaMask extension to continue.",
                            variant: "destructive",
                        });
                        return [2 /*return*/];
                    }
                    if (!window.ethereum.isMetaMask) {
                        console.error('❌ Ethereum provider is not MetaMask');
                        toast({
                            title: "MetaMask Not Detected",
                            description: "Please make sure MetaMask extension is enabled.",
                            variant: "destructive",
                        });
                        return [2 /*return*/];
                    }
                    // Show security info before connecting
                    toast({
                        title: "🔒 Secure Connection",
                        description: "METACHROME will never ask for your private keys or seed phrase. We only request your wallet address for authentication.",
                        duration: 5000,
                    });
                    setIsMetaMaskConnecting(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, 5, 6]);
                    console.log('🔄 Requesting account access...');
                    return [4 /*yield*/, window.ethereum.request({
                            method: 'eth_requestAccounts'
                        })];
                case 2:
                    accounts = _b.sent();
                    console.log('📝 Accounts received:', accounts);
                    if (accounts.length === 0) {
                        throw new Error('No accounts found. Please unlock MetaMask.');
                    }
                    walletAddress = accounts[0];
                    console.log('🔄 Authenticating wallet:', walletAddress);
                    // Authenticate with backend using the metamaskLogin mutation
                    console.log('🔄 Authenticating wallet:', walletAddress);
                    return [4 /*yield*/, metamaskLogin({ walletAddress: walletAddress })];
                case 3:
                    data = _b.sent();
                    console.log('✅ Auth successful:', data);
                    // Store user data in localStorage for immediate access
                    if (data.user && data.token) {
                        localStorage.setItem('authToken', data.token);
                        localStorage.setItem('user', JSON.stringify(data.user));
                    }
                    toast({
                        title: "✅ MetaMask Connected",
                        description: "Welcome back! Wallet ".concat(walletAddress.slice(0, 6), "...").concat(walletAddress.slice(-4), " authenticated successfully!"),
                    });
                    // Navigate to dashboard - the auth state is updated automatically by the mutation
                    console.log('🔄 Redirecting to dashboard...');
                    setTimeout(function () {
                        setLocation('/dashboard');
                    }, 500);
                    return [3 /*break*/, 6];
                case 4:
                    error_2 = _b.sent();
                    console.error('❌ MetaMask connection error:', error_2);
                    // User rejected the connection
                    if (error_2.code === 4001) {
                        toast({
                            title: "Connection Cancelled",
                            description: "You cancelled the MetaMask connection request.",
                            variant: "destructive",
                        });
                    }
                    else {
                        toast({
                            title: "Connection Failed",
                            description: error_2.message || "Failed to connect MetaMask. Please try again.",
                            variant: "destructive",
                        });
                    }
                    return [3 /*break*/, 6];
                case 5:
                    setIsMetaMaskConnecting(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // OAuth handlers for social logins - Real OAuth flows
    var handleGoogleLogin = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                toast({
                    title: "Google Login",
                    description: "Redirecting to Google authentication...",
                });
                // Try direct redirect with a timeout fallback
                setTimeout(function () {
                    toast({
                        title: "Google OAuth Issue",
                        description: "If you see 'refused to connect', please contact support.",
                        variant: "destructive",
                    });
                }, 5000);
                // Direct OAuth redirect to Google
                window.location.href = '/api/auth/google';
            }
            catch (error) {
                toast({
                    title: "Google Login Failed",
                    description: "Please try again or use email login",
                    variant: "destructive",
                });
            }
            return [2 /*return*/];
        });
    }); };
    return (<div className="min-h-screen bg-gray-900">
      {/* Main Content */}
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Left Side - Full width on mobile, 50% on desktop */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative min-h-[40vh] lg:min-h-auto" style={{ backgroundColor: '#24083B', overflow: 'visible' }}>
          {/* Logo Button - Top Left - Hidden on mobile, visible on desktop */}
          <Link href="/">
            <div className="hidden lg:block absolute top-6 left-6 lg:top-8 lg:left-8 cursor-pointer hover:opacity-80 transition-opacity z-20">
              <img src={metachromeLogo} alt="METACHROME" className="h-8 lg:h-10 w-auto"/>
            </div>
          </Link>

          {/* Content - Visible on both mobile and desktop */}
          <div className="text-center z-10 max-w-md relative py-8 px-4" style={{ marginTop: '0px', opacity: 1, visibility: 'visible', display: 'block' }}>
            <p className="text-white text-sm lg:text-lg mb-2 lg:mb-4 font-medium" style={{ opacity: 1, visibility: 'visible', color: '#FFFFFF', display: 'block' }}>
              Get Started with METACHROME
            </p>
            <h1 className="text-2xl lg:text-4xl font-bold text-white mb-6 lg:mb-12 leading-tight" style={{ opacity: 1, visibility: 'visible', color: '#FFFFFF', display: 'block' }}>
              The Future is for Everyone
            </h1>

            {/* Smaller Orb Video Below Text - iOS/Safari Compatible */}
            <div className="relative w-48 h-48 lg:w-80 lg:h-80 mx-auto" style={{ opacity: 1, visibility: 'visible', display: 'block' }}>
              <video autoPlay loop muted playsInline preload="auto" className="w-full h-full object-cover rounded-full" style={{
            opacity: 1,
            visibility: 'visible',
            display: 'block',
            WebkitTransform: 'translateZ(0)',
            transform: 'translateZ(0)'
        }}>
                <source src="/orb_1755576133990.webm" type="video/webm"/>
                <source src="/orb.webm" type="video/webm"/>
                <source src="/orb.mp4" type="video/mp4"/>
              </video>
            </div>
          </div>
        </div>

        {/* Right Side - Full width on mobile, 50% on desktop */}
        <div className="w-full lg:w-1/2 bg-black flex flex-col min-h-[60vh] lg:min-h-auto">
          <div className="flex-1 flex flex-col justify-center px-4 lg:px-12 py-8 lg:py-12 max-w-md mx-auto w-full">
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <h2 className="text-2xl font-bold text-white mb-2 lg:mb-0">Log In</h2>
                <div className="text-sm">
                  <span className="text-gray-400">Don't have an account? </span>
                  <Link href="/signup">
                    <span className="text-purple-400 hover:text-purple-300 cursor-pointer">Sign up</span>
                  </Link>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-6">Securely connect to your account</p>

              {/* Social Login Buttons */}
              <div className="mb-6">
                <Button variant="outline" className="w-full bg-transparent border-gray-600 hover:bg-gray-800 p-3 rounded-lg flex items-center justify-center space-x-2" onClick={handleGoogleLogin} type="button">
                  <FaGoogle className="w-5 h-5 text-white"/>
                  <span className="text-white">Continue with Google</span>
                </Button>
              </div>

              {/* MetaMask Button */}
              <Button variant="outline" className="w-full bg-transparent border-gray-600 hover:bg-gray-800 p-3 rounded-lg mb-6 flex items-center justify-center" onClick={handleMetaMaskConnect} disabled={isMetaMaskConnecting} type="button">
                {isMetaMaskConnecting ? (<div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                    <span className="text-white">Connecting...</span>
                  </div>) : (<>
                    <SiEthereum className="w-5 h-5 text-orange-500 mr-2"/>
                    <span className="text-white">Continue with Metamask</span>
                  </>)}
              </Button>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-black text-gray-400">OR</span>
                </div>
              </div>

              {/* Login Form */}
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField control={loginForm.control} name="email" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                        <FormLabel className="text-gray-400 text-sm">Username/Wallet address/Email</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your Username/Wallet address/Email" className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-500 h-12 rounded-md focus:ring-purple-500 focus:border-purple-500" data-testid="input-email"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>);
        }}/>

                  <FormField control={loginForm.control} name="password" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-gray-400 text-sm">Password</FormLabel>
                          <span className="text-purple-400 text-sm cursor-pointer hover:text-purple-300">
                            Forgot Password?
                          </span>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input {...field} type={showPassword ? "text" : "password"} placeholder="Enter your password" className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-500 h-12 rounded-md focus:ring-purple-500 focus:border-purple-500 pr-10" data-testid="input-password"/>
                            <button type="button" onClick={function () { return setShowPassword(!showPassword); }} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                              {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>);
        }}/>

                  <div className="flex items-center space-x-3">
                    <input type="checkbox" id="rememberMe" {...loginForm.register("rememberMe")} className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"/>
                    <label htmlFor="rememberMe" className="text-gray-400 text-sm font-normal">
                      Remember Me
                    </label>
                  </div>

                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 font-semibold rounded-lg" disabled={isUserLoginPending}>
                    {isUserLoginPending ? 'Logging In...' : 'Log In'}
                  </Button>
                  

                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>


    </div>);
}

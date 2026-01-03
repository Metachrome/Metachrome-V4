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
import metachromeLogo from '../assets/new-metachrome-logo.png';
import { useQueryClient } from '@tanstack/react-query';
var signupSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
    referralCode: z.string().optional(),
    documentType: z.enum(['id_card', 'driver_license', 'passport'], {
        required_error: 'Document type is required',
        invalid_type_error: 'Please select a valid document type'
    }),
    agreeToTerms: z.boolean().refine(function (val) { return val === true; }, 'You must agree to the terms'),
}).refine(function (data) { return data.password === data.confirmPassword; }, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});
export default function SignupPage() {
    var _this = this;
    var _a = useLocation(), setLocation = _a[1];
    var toast = useToast().toast;
    var _b = useAuth(), register = _b.register, metamaskLogin = _b.metamaskLogin;
    var queryClient = useQueryClient();
    var _c = useState(false), showPassword = _c[0], setShowPassword = _c[1];
    var _d = useState(false), showConfirmPassword = _d[0], setShowConfirmPassword = _d[1];
    var _e = useState(false), isMetaMaskConnecting = _e[0], setIsMetaMaskConnecting = _e[1];
    var _f = useState(false), isLoading = _f[0], setIsLoading = _f[1];
    var _g = useState(null), selectedFile = _g[0], setSelectedFile = _g[1];
    var _h = useState(0), uploadProgress = _h[0], setUploadProgress = _h[1];
    var _j = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true), isDesktop = _j[0], setIsDesktop = _j[1];
    useEffect(function () {
        var handleResize = function () {
            setIsDesktop(window.innerWidth >= 1024);
        };
        window.addEventListener('resize', handleResize);
        return function () { return window.removeEventListener('resize', handleResize); };
    }, []);
    var signupForm = useForm({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            referralCode: '',
            documentType: 'id_card',
            agreeToTerms: false
        },
    });
    var onSignup = function (data) { return __awaiter(_this, void 0, void 0, function () {
        var registrationResult, formData, token, response, uploadResult, storedUser, userData, errorText, uploadError_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 15, 16, 17]);
                    // Validate that ID document is uploaded (now mandatory)
                    if (!selectedFile) {
                        toast({
                            title: "ID Verification Required",
                            description: "Please upload your ID document to complete registration. This is mandatory for account security.",
                            variant: "destructive",
                        });
                        setIsLoading(false);
                        return [2 /*return*/];
                    }
                    console.log('🔄 Starting signup process...', {
                        firstName: data.firstName,
                        lastName: data.lastName,
                        email: data.email,
                        referralCode: data.referralCode,
                        documentType: data.documentType,
                        hasDocument: !!selectedFile
                    });
                    return [4 /*yield*/, register({
                            username: data.email.split('@')[0], // Use email prefix as username
                            email: data.email,
                            password: data.password,
                            firstName: data.firstName,
                            lastName: data.lastName,
                            referralCode: data.referralCode,
                        })];
                case 2:
                    registrationResult = _a.sent();
                    console.log('✅ Registration successful:', registrationResult);
                    console.log('✅ Registration result keys:', Object.keys(registrationResult));
                    console.log('✅ Token from result:', registrationResult.token ? registrationResult.token.substring(0, 50) + '...' : 'NO TOKEN');
                    // Store authentication data immediately for document upload
                    if (registrationResult.token) {
                        localStorage.setItem('authToken', registrationResult.token);
                        console.log('🔑 Stored auth token for immediate use');
                        console.log('🔑 Token in localStorage:', localStorage.getItem('authToken') ? localStorage.getItem('authToken').substring(0, 50) + '...' : 'NOT FOUND');
                    }
                    else {
                        console.error('❌ NO TOKEN IN REGISTRATION RESULT!');
                    }
                    if (registrationResult.user) {
                        localStorage.setItem('user', JSON.stringify(registrationResult.user));
                        console.log('👤 Stored user data for immediate use');
                    }
                    if (!(selectedFile && data.documentType)) return [3 /*break*/, 12];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 10, , 11]);
                    setUploadProgress(25);
                    formData = new FormData();
                    formData.append('document', selectedFile);
                    formData.append('documentType', data.documentType);
                    token = registrationResult.token;
                    console.log('🔑 Using registration token for document upload:', token ? token.substring(0, 30) + '...' : 'No token');
                    if (!token) {
                        throw new Error('No authentication token received from registration');
                    }
                    // Add a small delay to ensure user is properly saved in database
                    console.log('⏳ Waiting for user to be saved in database...');
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 4:
                    _a.sent();
                    setUploadProgress(50);
                    return [4 /*yield*/, fetch('/api/user/upload-verification', {
                            method: 'POST',
                            headers: {
                                'Authorization': "Bearer ".concat(token),
                            },
                            body: formData,
                        })];
                case 5:
                    response = _a.sent();
                    setUploadProgress(75);
                    if (!response.ok) return [3 /*break*/, 7];
                    return [4 /*yield*/, response.json()];
                case 6:
                    uploadResult = _a.sent();
                    setUploadProgress(100);
                    console.log('✅ Verification document uploaded successfully:', uploadResult);
                    storedUser = localStorage.getItem('user');
                    if (storedUser) {
                        try {
                            userData = JSON.parse(storedUser);
                            userData.verificationStatus = 'pending';
                            userData.hasUploadedDocuments = true;
                            localStorage.setItem('user', JSON.stringify(userData));
                            console.log('✅ Updated user data in localStorage with verification status');
                            // CRITICAL FIX: Invalidate React Query cache to force fresh data fetch
                            // This ensures dashboard shows correct verification status
                            queryClient.setQueryData(["/api/auth"], userData);
                            queryClient.invalidateQueries({ queryKey: ["/api/auth"] });
                            console.log('🔄 Invalidated React Query cache - dashboard will fetch fresh data');
                        }
                        catch (e) {
                            console.error('Failed to update user data in localStorage:', e);
                        }
                    }
                    toast({
                        title: "Account Created & Document Uploaded!",
                        description: "Your account is pending verification. You'll be notified once approved.",
                        duration: 5000,
                    });
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, response.text()];
                case 8:
                    errorText = _a.sent();
                    console.error('❌ Upload response error:', response.status, errorText);
                    throw new Error("Upload failed: ".concat(response.status, " - ").concat(errorText));
                case 9: return [3 /*break*/, 11];
                case 10:
                    uploadError_1 = _a.sent();
                    console.error('❌ Document upload error:', uploadError_1);
                    toast({
                        title: "Account Created",
                        description: "Account created but document upload failed: ".concat(uploadError_1.message, ". You can upload it later in your profile."),
                        variant: "destructive",
                        duration: 5000,
                    });
                    return [3 /*break*/, 11];
                case 11: return [3 /*break*/, 13];
                case 12:
                    toast({
                        title: "Account Created Successfully!",
                        description: "Welcome to METACHROME! Please upload your verification document in your profile.",
                        duration: 5000,
                    });
                    _a.label = 13;
                case 13:
                    // Wait a bit to ensure database is updated before redirecting
                    console.log('⏳ Waiting for database sync before redirect...');
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 14:
                    _a.sent();
                    // Redirect to dashboard after successful signup and auto-login
                    console.log('🔄 Redirecting to dashboard...');
                    setLocation('/dashboard');
                    return [3 /*break*/, 17];
                case 15:
                    error_1 = _a.sent();
                    console.error('❌ Registration error:', error_1);
                    toast({
                        title: "Signup Failed",
                        description: error_1.message || "Failed to create account",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 17];
                case 16:
                    setIsLoading(false);
                    setUploadProgress(0);
                    return [7 /*endfinally*/];
                case 17: return [2 /*return*/];
            }
        });
    }); };
    var handleFileChange = function (event) {
        var _a;
        var file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (file) {
            // Validate file type
            var allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                toast({
                    title: "Invalid File Type",
                    description: "Please upload a JPG, PNG, or PDF file.",
                    variant: "destructive",
                });
                return;
            }
            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: "File Too Large",
                    description: "Please upload a file smaller than 5MB.",
                    variant: "destructive",
                });
                return;
            }
            setSelectedFile(file);
            console.log('📄 File selected:', file.name, file.type, file.size);
        }
    };
    // MetaMask connection handler
    var handleMetaMaskConnect = function () { return __awaiter(_this, void 0, void 0, function () {
        var accounts, walletAddress, authResult, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!window.ethereum) {
                        toast({
                            title: "MetaMask Not Found",
                            description: "Please install MetaMask to continue.",
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
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    console.log('🔄 Requesting MetaMask account access...');
                    return [4 /*yield*/, window.ethereum.request({
                            method: 'eth_requestAccounts'
                        })];
                case 2:
                    accounts = _a.sent();
                    console.log('📝 Accounts received:', accounts);
                    if (accounts.length === 0) {
                        throw new Error('No accounts found. Please unlock MetaMask.');
                    }
                    walletAddress = accounts[0];
                    console.log('🔄 Authenticating wallet:', walletAddress);
                    return [4 /*yield*/, metamaskLogin({ walletAddress: walletAddress })];
                case 3:
                    authResult = _a.sent();
                    console.log('✅ MetaMask authentication successful:', authResult);
                    // Store user data in localStorage for immediate access
                    if (authResult.user && authResult.token) {
                        localStorage.setItem('authToken', authResult.token);
                        localStorage.setItem('user', JSON.stringify(authResult.user));
                    }
                    toast({
                        title: "✅ MetaMask Connected Successfully!",
                        description: "Welcome to METACHROME! Wallet: ".concat(walletAddress.slice(0, 6), "...").concat(walletAddress.slice(-4)),
                    });
                    // Small delay to ensure state is updated, then navigate to dashboard
                    console.log('🔄 Redirecting to dashboard...');
                    setTimeout(function () {
                        setLocation('/dashboard');
                    }, 500);
                    return [3 /*break*/, 6];
                case 4:
                    error_2 = _a.sent();
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
    // OAuth handlers for social logins
    var handleGoogleLogin = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                toast({
                    title: "Google Signup",
                    description: "Redirecting to Google authentication...",
                });
                // Direct OAuth redirect to Google
                window.location.href = '/api/auth/google';
            }
            catch (error) {
                toast({
                    title: "Google Signup Failed",
                    description: "Please try again or use email signup",
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
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative overflow-hidden min-h-[40vh] lg:min-h-auto" style={{ backgroundColor: '#24083B' }}>
          {/* Logo Button - Top Left - Hidden on mobile, visible on desktop */}
          <Link href="/">
            <div className="hidden lg:block absolute top-6 left-6 lg:top-8 lg:left-8 cursor-pointer hover:opacity-80 transition-opacity z-20">
              <img src={metachromeLogo} alt="METACHROME" className="h-8 lg:h-10 w-auto"/>
            </div>
          </Link>

          {/* Content - Visible on both mobile and desktop */}
          <div className="text-center z-10 max-w-md relative py-8 px-4" style={{ marginTop: isDesktop ? '-590px' : '0px', opacity: 1, visibility: 'visible', display: 'block' }}>
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
                <h2 className="text-2xl font-bold text-white mb-2 lg:mb-0">Sign Up</h2>
                <div className="text-sm">
                  <span className="text-gray-400">Already have an account? </span>
                  <Link href="/login">
                    <span className="text-purple-400 hover:text-purple-300 cursor-pointer">Sign In</span>
                  </Link>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-6">Join the community and unleash endless possibilities</p>

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

              {/* Signup Form */}
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                  {/* First Name and Last Name Row - Stack on mobile */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <FormField control={signupForm.control} name="firstName" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                          <FormLabel className="text-gray-400 text-sm">First Name *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Your First Name" className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-500 h-12 rounded-md focus:ring-purple-500 focus:border-purple-500"/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>);
        }}/>

                    <FormField control={signupForm.control} name="lastName" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                          <FormLabel className="text-gray-400 text-sm">Last Name *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Your Last Name" className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-500 h-12 rounded-md focus:ring-purple-500 focus:border-purple-500"/>
                          </FormControl>
                          <FormMessage />
                        </FormItem>);
        }}/>
                  </div>

                  {/* Email */}
                  <FormField control={signupForm.control} name="email" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                        <FormLabel className="text-gray-400 text-sm">E-Mail Address *</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="Your email" className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-500 h-12 rounded-md focus:ring-purple-500 focus:border-purple-500"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>);
        }}/>

                  {/* Referral Code */}
                  <FormField control={signupForm.control} name="referralCode" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                        <FormLabel className="text-gray-400 text-sm">Referral Code (Optional)</FormLabel>
                        <FormControl>
                          <Input {...field} type="text" placeholder="Enter referral code if you have one" className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-500 h-12 rounded-md focus:ring-purple-500 focus:border-purple-500"/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>);
        }}/>

                  {/* Password and Confirm Password Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={signupForm.control} name="password" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                          <FormLabel className="text-gray-400 text-sm">Password *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input {...field} type={showPassword ? "text" : "password"} placeholder="Your password" className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-500 h-12 rounded-md focus:ring-purple-500 focus:border-purple-500 pr-10"/>
                              <button type="button" onClick={function () { return setShowPassword(!showPassword); }} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                                {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>);
        }}/>

                    <FormField control={signupForm.control} name="confirmPassword" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                          <FormLabel className="text-gray-400 text-sm">Confirm Password *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input {...field} type={showConfirmPassword ? "text" : "password"} placeholder="Password Confirmation" className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-500 h-12 rounded-md focus:ring-purple-500 focus:border-purple-500 pr-10"/>
                              <button type="button" onClick={function () { return setShowConfirmPassword(!showConfirmPassword); }} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                                {showConfirmPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>);
        }}/>
                  </div>

                  {/* Document Upload Section */}
                  <div className="space-y-4 p-4 bg-red-900/20 rounded-lg border border-red-700/50">
                    <h3 className="text-white text-sm font-medium flex items-center">
                      <span className="text-red-400 mr-2">*</span>
                      Identity Verification (Required)
                    </h3>
                    <p className="text-gray-400 text-xs">
                      <span className="text-red-400 font-medium">Mandatory:</span> Upload your ID card, driver's license, or passport to complete registration.
                      This is required for account security and compliance.
                    </p>

                    {/* Document Type Selection */}
                    <FormField control={signupForm.control} name="documentType" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                          <FormLabel className="text-gray-400 text-sm">
                            Document Type <span className="text-red-400">*</span>
                          </FormLabel>
                          <FormControl>
                            <select {...field} className="w-full bg-gray-900 border-gray-600 text-white h-12 rounded-md focus:ring-purple-500 focus:border-purple-500 px-3">
                              <option value="id_card">ID Card</option>
                              <option value="driver_license">Driver's License</option>
                              <option value="passport">Passport</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>);
        }}/>

                    {/* File Upload */}
                    <div className="space-y-2">
                      <label className="text-gray-400 text-sm">
                        Upload Document <span className="text-red-400">*</span>
                      </label>
                      <div className="flex items-center space-x-3">
                        <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" id="document-upload" required/>
                        <label htmlFor="document-upload" className={"flex-1 bg-gray-900 border-2 border-dashed h-12 rounded-md flex items-center justify-center cursor-pointer transition-colors ".concat(selectedFile
            ? 'border-green-500 text-green-400'
            : 'border-red-500 text-gray-400 hover:border-purple-500')}>
                          {selectedFile ? "\u2713 ".concat(selectedFile.name) : "⚠️ Click to upload document (Required)"}
                        </label>
                        {selectedFile && (<button type="button" onClick={function () { return setSelectedFile(null); }} className="text-red-400 hover:text-red-300 text-sm">
                            Remove
                          </button>)}
                      </div>
                      {uploadProgress > 0 && (<div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: "".concat(uploadProgress, "%") }}></div>
                        </div>)}
                      <p className="text-gray-500 text-xs">
                        <span className="text-red-400 font-medium">Required:</span> Accepted formats: JPG, PNG, PDF (max 5MB)
                      </p>
                      {!selectedFile && (<p className="text-red-400 text-xs font-medium">
                          ⚠️ ID verification document is mandatory for registration
                        </p>)}
                    </div>
                  </div>

                  {/* Terms Agreement */}
                  <FormField control={signupForm.control} name="agreeToTerms" render={function (_a) {
            var field = _a.field;
            return (<FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <input type="checkbox" checked={field.value} onChange={field.onChange} className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2 mt-1"/>
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-gray-400 text-sm font-normal">
                            I agree with{" "}
                            <Link href="/privacy-policy" className="text-purple-400 hover:text-purple-300">
                              Privacy Policy
                            </Link>
                            ,{" "}
                            <Link href="/terms-of-service" className="text-purple-400 hover:text-purple-300">
                              Terms of Service
                            </Link>
                            ,{" "}
                            <Link href="/trade-policy" className="text-purple-400 hover:text-purple-300">
                              Trade Policy
                            </Link>
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>);
        }}/>

                  {/* Register Button */}
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 font-semibold rounded-lg" disabled={isLoading}>
                    {isLoading ? 'Creating Account...' : 'Register'}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>


    </div>);
}

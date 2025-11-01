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

import { apiRequest } from '../lib/queryClient';

// Declare MetaMask types
declare global {
  interface Window {
    ethereum?: any;
  }
}

const loginSchema = z.object({
  email: z.string().min(1, 'Username, email, or wallet address is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function UserLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { userLogin, isUserLoginPending, metamaskLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isMetaMaskConnecting, setIsMetaMaskConnecting] = useState(false);
  const queryClient = useQueryClient();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onLogin = async (data: LoginForm) => {
    try {
      console.log('🔄 Starting login process...', { email: data.email });

      // Determine if input is email, username, or wallet address
      let username = data.email;

      // If it's an email, extract username part
      if (data.email.includes('@')) {
        username = data.email.split('@')[0];
      }
      // If it starts with 0x, it's likely a wallet address - use as is
      // Otherwise, treat as username

      console.log('🔄 Calling userLogin with:', { username, password: '***' });

      // Test direct fetch first
      console.log('🧪 Testing direct fetch...');
      try {
        const testResponse = await fetch('/api/auth/user/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password: data.password }),
          credentials: 'include'
        });

        console.log('🧪 Direct fetch response:', {
          status: testResponse.status,
          statusText: testResponse.statusText,
          ok: testResponse.ok,
          headers: Object.fromEntries(testResponse.headers.entries())
        });

        const responseText = await testResponse.text();
        console.log('🧪 Response text:', responseText);

        if (testResponse.ok) {
          const responseData = JSON.parse(responseText);
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
            description: `Welcome back!`,
          });

          // Small delay to ensure auth state is updated
          setTimeout(() => {
            console.log('🔄 Redirecting to dashboard...');
            setLocation('/dashboard');
          }, 100);

          return;
        } else {
          throw new Error(`Direct fetch failed: ${testResponse.status} ${responseText}`);
        }
      } catch (directError: any) {
        console.error('🧪 Direct fetch failed:', directError);

        // Fall back to userLogin hook
        console.log('🔄 Falling back to userLogin hook...');
        await userLogin({ username, password: data.password });

        console.log('✅ Login successful');
        toast({
          title: "Login Successful",
          description: `Welcome back!`,
        });
        setLocation('/dashboard');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  // MetaMask connection handler
  const handleMetaMaskConnect = async () => {
    console.log('🔄 Starting MetaMask connection...');
    console.log('Window ethereum:', window.ethereum);
    console.log('Is MetaMask:', window.ethereum?.isMetaMask);

    // Check if MetaMask is installed
    if (!window.ethereum) {
      console.error('❌ No ethereum provider found');
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask extension to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!window.ethereum.isMetaMask) {
      console.error('❌ Ethereum provider is not MetaMask');
      toast({
        title: "MetaMask Not Detected",
        description: "Please make sure MetaMask extension is enabled.",
        variant: "destructive",
      });
      return;
    }

    setIsMetaMaskConnecting(true);
    try {
      console.log('🔄 Requesting account access...');

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      console.log('📝 Accounts received:', accounts);

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }

      const walletAddress = accounts[0];
      console.log('🔄 Authenticating wallet:', walletAddress);

      // Authenticate with backend using the metamaskLogin mutation
      console.log('🔄 Authenticating wallet:', walletAddress);
      const data = await metamaskLogin({ walletAddress });
      console.log('✅ Auth successful:', data);

      // Store user data in localStorage for immediate access
      if (data.user && data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      toast({
        title: "MetaMask Connected",
        description: `Wallet ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)} authenticated successfully!`,
      });

      // Navigate to dashboard - the auth state is updated automatically by the mutation
      console.log('🔄 Redirecting to dashboard...');
      setTimeout(() => {
        setLocation('/dashboard');
      }, 500);
    } catch (error: any) {
      console.error('❌ MetaMask connection error:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect MetaMask",
        variant: "destructive",
      });
    } finally {
      setIsMetaMaskConnecting(false);
    }
  };

  // OAuth handlers for social logins - Real OAuth flows
  const handleGoogleLogin = async () => {
    try {
      toast({
        title: "Google Login",
        description: "Redirecting to Google authentication...",
      });
      
      // Try direct redirect with a timeout fallback
      setTimeout(() => {
        toast({
          title: "Google OAuth Issue",
          description: "If you see 'refused to connect', please contact support.",
          variant: "destructive",
        });
      }, 5000);
      
      // Direct OAuth redirect to Google
      window.location.href = '/api/auth/google';
    } catch (error: any) {
      toast({
        title: "Google Login Failed",
        description: "Please try again or use email login",
        variant: "destructive",
      });
    }
  };



  return (
    <div className="min-h-screen bg-gray-900">
      {/* Main Content */}
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Left Side - Full width on mobile, 50% on desktop */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative overflow-hidden min-h-[40vh] lg:min-h-auto" style={{backgroundColor: '#24083B'}}>
          {/* Logo Button - Top Left */}
          <Link href="/">
            <div className="absolute top-6 left-6 lg:top-8 lg:left-8 cursor-pointer hover:opacity-80 transition-opacity z-20">
              <img
                src={metachromeLogo}
                alt="METACHROME"
                className="h-8 lg:h-10 w-auto"
              />
            </div>
          </Link>

          {/* Content */}
          <div className="text-center z-10 max-w-md relative py-[30px]">
            <p className="text-white/90 text-sm lg:text-lg mb-2 lg:mb-4">Get Started with METACHROME</p>
            <h1 className="text-2xl lg:text-4xl font-bold text-white mb-6 lg:mb-12 leading-tight">
              The Future is for Everyone
            </h1>

            {/* Smaller Orb Video Below Text */}
            <div className="relative w-48 h-48 lg:w-80 lg:h-80 mx-auto">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover rounded-full"
              >
                <source src="/orb_1755576133990.webm" type="video/webm" />
                <source src="/orb.webm" type="video/webm" />
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
              <div className="flex justify-center mb-6">
                <Button
                  variant="outline"
                  className="bg-transparent border-gray-600 hover:bg-gray-800 p-3 rounded-lg flex items-center space-x-2"
                  onClick={handleGoogleLogin}
                  type="button"
                >
                  <FaGoogle className="w-5 h-5 text-white" />
                  <span className="text-white">Continue with Google</span>
                </Button>
              </div>

              {/* MetaMask Button */}
              <Button
                variant="outline"
                className="w-full bg-transparent border-gray-600 hover:bg-gray-800 p-3 rounded-lg mb-6 flex items-center justify-center"
                onClick={handleMetaMaskConnect}
                disabled={isMetaMaskConnecting}
                type="button"
              >
                {isMetaMaskConnecting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-white">Connecting...</span>
                  </div>
                ) : (
                  <>
                    <SiEthereum className="w-5 h-5 text-orange-500 mr-2" />
                    <span className="text-white">Continue with Metamask</span>
                  </>
                )}
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
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-400 text-sm">Username/Wallet address/Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your Username/Wallet address/Email"
                            className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-500 h-12 rounded-md focus:ring-purple-500 focus:border-purple-500"
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-gray-400 text-sm">Password</FormLabel>
                          <span className="text-purple-400 text-sm cursor-pointer hover:text-purple-300">
                            Forgot Password?
                          </span>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-500 h-12 rounded-md focus:ring-purple-500 focus:border-purple-500 pr-10"
                              data-testid="input-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      {...loginForm.register("rememberMe")}
                      className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <label htmlFor="rememberMe" className="text-gray-400 text-sm font-normal">
                      Remember Me
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 font-semibold rounded-lg"
                    disabled={isUserLoginPending}
                  >
                    {isUserLoginPending ? 'Logging In...' : 'Log In'}
                  </Button>
                  

                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
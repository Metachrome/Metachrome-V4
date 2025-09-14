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
import { FaGoogle, FaLinkedin } from 'react-icons/fa';
import { SiEthereum } from 'react-icons/si';
import { Footer } from '../components/ui/footer';

// Declare MetaMask types
declare global {
  interface Window {
    ethereum?: any;
  }
}

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { register, metamaskLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isMetaMaskConnecting, setIsMetaMaskConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false
    },
  });

  const onSignup = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      console.log('🔄 Starting signup process...', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email
      });

      // Use the register mutation from useAuth hook
      const registrationResult = await register({
        username: data.email.split('@')[0], // Use email prefix as username
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      console.log('✅ Registration successful:', registrationResult);
      toast({
        title: "Account Created Successfully!",
        description: "Welcome to METACHROME! You are now logged in.",
      });

      // Redirect to dashboard after successful signup and auto-login
      console.log('🔄 Redirecting to dashboard...');
      setLocation('/dashboard');

    } catch (error: any) {
      console.error('❌ Registration error:', error);
      toast({
        title: "Signup Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // MetaMask connection handler
  const handleMetaMaskConnect = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsMetaMaskConnecting(true);
    try {
      console.log('🔄 Requesting MetaMask account access...');

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

      // Use the metamaskLogin mutation from useAuth hook
      const authResult = await metamaskLogin({ walletAddress });
      console.log('✅ MetaMask authentication successful:', authResult);

      toast({
        title: "MetaMask Connected Successfully!",
        description: `Welcome! Connected with wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
      });

      // Navigate to dashboard - auth state is now properly updated
      console.log('🔄 Redirecting to dashboard...');
      setLocation('/dashboard');

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

  // OAuth handlers for social logins
  const handleGoogleLogin = async () => {
    try {
      toast({
        title: "Google Signup",
        description: "Redirecting to Google authentication...",
      });

      // Direct OAuth redirect to Google
      window.location.href = '/api/auth/google';
    } catch (error: any) {
      toast({
        title: "Google Signup Failed",
        description: "Please try again or use email signup",
        variant: "destructive",
      });
    }
  };

  const handleTwitterLogin = async () => {
    try {
      toast({
        title: "Twitter Signup",
        description: "Redirecting to Twitter authentication...",
      });

      // Direct OAuth redirect to Twitter
      window.location.href = '/api/auth/twitter';
    } catch (error: any) {
      toast({
        title: "Twitter Signup Failed",
        description: error.message || "Failed to authenticate with Twitter",
        variant: "destructive",
      });
    }
  };

  const handleLinkedInLogin = async () => {
    try {
      toast({
        title: "LinkedIn Signup",
        description: "Redirecting to LinkedIn authentication...",
      });

      // Direct OAuth redirect to LinkedIn
      window.location.href = '/api/auth/linkedin';
    } catch (error: any) {
      toast({
        title: "LinkedIn Signup Failed",
        description: "Please try again or use email signup",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-128px)] flex-col lg:flex-row">
        {/* Left Side - Full width on mobile, 50% on desktop */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center relative overflow-hidden min-h-[40vh] lg:min-h-auto" style={{backgroundColor: '#24083B'}}>
          {/* Content */}
          <div className="text-center z-10 max-w-md relative">
            <p className="text-white/90 text-lg mb-4">Get Started with METACHROME</p>
            <h1 className="text-4xl font-bold text-white mb-12 leading-tight">
              The Future is for Everyone
            </h1>

            {/* Smaller Orb Video Below Text */}
            <div className="relative w-80 h-80 mx-auto">
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
              <div className="grid grid-cols-3 gap-3 mb-6">
                <Button
                  variant="outline"
                  className="bg-transparent border-gray-600 hover:bg-gray-800 p-3 rounded-lg"
                  onClick={handleGoogleLogin}
                  type="button"
                >
                  <FaGoogle className="w-5 h-5 text-white" />
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent border-gray-600 hover:bg-gray-800 p-3 rounded-lg"
                  onClick={handleTwitterLogin}
                  type="button"
                >
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent border-gray-600 hover:bg-gray-800 p-3 rounded-lg"
                  onClick={handleLinkedInLogin}
                  type="button"
                >
                  <FaLinkedin className="w-5 h-5 text-blue-500" />
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

              {/* Signup Form */}
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                  {/* First Name and Last Name Row - Stack on mobile */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <FormField
                      control={signupForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400 text-sm">First Name *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Your First Name"
                              className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-500 h-12 rounded-md focus:ring-purple-500 focus:border-purple-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400 text-sm">Last Name *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Your Last Name"
                              className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-500 h-12 rounded-md focus:ring-purple-500 focus:border-purple-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Email */}
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-400 text-sm">E-Mail Address *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="Your email"
                            className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-500 h-12 rounded-md focus:ring-purple-500 focus:border-purple-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password and Confirm Password Row */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400 text-sm">Password *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                placeholder="Your password"
                                className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-500 h-12 rounded-md focus:ring-purple-500 focus:border-purple-500 pr-10"
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

                    <FormField
                      control={signupForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400 text-sm">Confirm Password *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Password Confirmation"
                                className="bg-gray-900 border-gray-600 text-white placeholder:text-gray-500 h-12 rounded-md focus:ring-purple-500 focus:border-purple-500 pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                              >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Terms Agreement */}
                  <FormField
                    control={signupForm.control}
                    name="agreeToTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500 focus:ring-2 mt-1"
                          />
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
                      </FormItem>
                    )}
                  />

                  {/* Register Button */}
                  <Button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 font-semibold rounded-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Register'}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

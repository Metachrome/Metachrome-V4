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
import metachromeLogo from '../assets/new-metachrome-logo.png';


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
  referralCode: z.string().optional(),
  documentType: z.enum(['id_card', 'driver_license', 'passport'], {
    required_error: 'Document type is required',
    invalid_type_error: 'Please select a valid document type'
  }),
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const signupForm = useForm<SignupForm>({
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

  const onSignup = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      // Validate that ID document is uploaded (now mandatory)
      if (!selectedFile) {
        toast({
          title: "ID Verification Required",
          description: "Please upload your ID document to complete registration. This is mandatory for account security.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      console.log('🔄 Starting signup process...', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        referralCode: data.referralCode,
        documentType: data.documentType,
        hasDocument: !!selectedFile
      });

      // Use the register mutation from useAuth hook
      const registrationResult = await register({
        username: data.email.split('@')[0], // Use email prefix as username
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        referralCode: data.referralCode,
      });

      console.log('✅ Registration successful:', registrationResult);
      console.log('✅ Registration result keys:', Object.keys(registrationResult));
      console.log('✅ Token from result:', registrationResult.token ? registrationResult.token.substring(0, 50) + '...' : 'NO TOKEN');

      // Store authentication data immediately for document upload
      if (registrationResult.token) {
        localStorage.setItem('authToken', registrationResult.token);
        console.log('🔑 Stored auth token for immediate use');
        console.log('🔑 Token in localStorage:', localStorage.getItem('authToken') ? localStorage.getItem('authToken').substring(0, 50) + '...' : 'NOT FOUND');
      } else {
        console.error('❌ NO TOKEN IN REGISTRATION RESULT!');
      }
      if (registrationResult.user) {
        localStorage.setItem('user', JSON.stringify(registrationResult.user));
        console.log('👤 Stored user data for immediate use');
      }

      // Upload verification document (now mandatory)
      if (selectedFile && data.documentType) {
        try {
          setUploadProgress(25);
          const formData = new FormData();
          formData.append('document', selectedFile);
          formData.append('documentType', data.documentType);

          // Use the token from the registration result directly
          const token = registrationResult.token;
          console.log('🔑 Using registration token for document upload:', token ? token.substring(0, 30) + '...' : 'No token');

          if (!token) {
            throw new Error('No authentication token received from registration');
          }

          // Add a small delay to ensure user is properly saved in database
          console.log('⏳ Waiting for user to be saved in database...');
          await new Promise(resolve => setTimeout(resolve, 1000));

          setUploadProgress(50);

          const response = await fetch('/api/user/upload-verification', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });

          setUploadProgress(75);

          if (response.ok) {
            const uploadResult = await response.json();
            setUploadProgress(100);
            console.log('✅ Verification document uploaded successfully:', uploadResult);
            toast({
              title: "Account Created & Document Uploaded!",
              description: "Your account is pending verification. You'll be notified once approved.",
              duration: 5000,
            });
          } else {
            const errorText = await response.text();
            console.error('❌ Upload response error:', response.status, errorText);
            throw new Error(`Upload failed: ${response.status} - ${errorText}`);
          }
        } catch (uploadError) {
          console.error('❌ Document upload error:', uploadError);
          toast({
            title: "Account Created",
            description: `Account created but document upload failed: ${uploadError.message}. You can upload it later in your profile.`,
            variant: "destructive",
            duration: 5000,
          });
        }
      } else {
        toast({
          title: "Account Created Successfully!",
          description: "Welcome to METACHROME! Please upload your verification document in your profile.",
          duration: 5000,
        });
      }

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
      setUploadProgress(0);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
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

      // Store user data in localStorage for immediate access
      if (authResult.user && authResult.token) {
        localStorage.setItem('authToken', authResult.token);
        localStorage.setItem('user', JSON.stringify(authResult.user));
      }

      toast({
        title: "MetaMask Connected Successfully!",
        description: `Welcome! Connected with wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
      });

      // Small delay to ensure state is updated, then navigate to dashboard
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
          <div className="text-center z-10 max-w-md relative py-[30px]" style={{ marginTop: '-590px' }}>
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

                  {/* Referral Code */}
                  <FormField
                    control={signupForm.control}
                    name="referralCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-400 text-sm">Referral Code (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="Enter referral code if you have one"
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
                    <FormField
                      control={signupForm.control}
                      name="documentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-400 text-sm">
                            Document Type <span className="text-red-400">*</span>
                          </FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="w-full bg-gray-900 border-gray-600 text-white h-12 rounded-md focus:ring-purple-500 focus:border-purple-500 px-3"
                            >
                              <option value="id_card">ID Card</option>
                              <option value="driver_license">Driver's License</option>
                              <option value="passport">Passport</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* File Upload */}
                    <div className="space-y-2">
                      <label className="text-gray-400 text-sm">
                        Upload Document <span className="text-red-400">*</span>
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileChange}
                          className="hidden"
                          id="document-upload"
                          required
                        />
                        <label
                          htmlFor="document-upload"
                          className={`flex-1 bg-gray-900 border-2 border-dashed h-12 rounded-md flex items-center justify-center cursor-pointer transition-colors ${
                            selectedFile
                              ? 'border-green-500 text-green-400'
                              : 'border-red-500 text-gray-400 hover:border-purple-500'
                          }`}
                        >
                          {selectedFile ? `✓ ${selectedFile.name}` : "⚠️ Click to upload document (Required)"}
                        </label>
                        {selectedFile && (
                          <button
                            type="button"
                            onClick={() => setSelectedFile(null)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      {uploadProgress > 0 && (
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      )}
                      <p className="text-gray-500 text-xs">
                        <span className="text-red-400 font-medium">Required:</span> Accepted formats: JPG, PNG, PDF (max 5MB)
                      </p>
                      {!selectedFile && (
                        <p className="text-red-400 text-xs font-medium">
                          ⚠️ ID verification document is mandatory for registration
                        </p>
                      )}
                    </div>
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


    </div>
  );
}

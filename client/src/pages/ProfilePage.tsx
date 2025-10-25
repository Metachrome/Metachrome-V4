import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth";
import { useIsMobile } from "../hooks/use-mobile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { useToast } from "../hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Settings,
  Camera,
  Save,
  Eye,
  EyeOff,
  Upload,
  CheckCircle,
  FileText,
  RefreshCw,
  AlertTriangle,
  Loader2
} from "lucide-react";

export default function ProfilePage() {
  const { user, refreshAuth } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('profile');



  // Show loading if user is not loaded yet
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [referralStats, setReferralStats] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [testResults, setTestResults] = useState<string>('');
  const [availableCodes, setAvailableCodes] = useState<any[]>([]);

  // Document upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('id_card');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    address: user?.address || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: user.address || '',
      }));
    }
  }, [user]);

  // Read tab from query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('PUT', '/api/user/profile', data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
      setIsEditing(false);

      // Invalidate the correct auth query key and force refresh
      queryClient.invalidateQueries({ queryKey: ['/api/auth'] });
      queryClient.refetchQueries({ queryKey: ['/api/auth'] });

      // Also clear localStorage to force fresh data
      localStorage.removeItem('user');
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('🔐 Password change attempt with data:', data);
      return await apiRequest('PUT', '/api/user/password', data);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Password Set Successfully",
        description: data?.isFirstTimePassword
          ? "Your login password has been set! You can now log in with username and password."
          : "Your password has been changed successfully",
      });
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      // Force complete refresh of user data to update hasPassword status
      console.log('🔄 Password changed successfully, forcing complete user data refresh...');

      // Clear localStorage cache to force fresh API call
      localStorage.removeItem('user');

      // Clear all auth-related queries
      queryClient.removeQueries({ queryKey: ['/api/auth/user'] });
      queryClient.removeQueries({ queryKey: ['/api/auth'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth'] });
      queryClient.refetchQueries({ queryKey: ['/api/auth'] });

      // Force a page reload after a short delay to ensure fresh data
      setTimeout(() => {
        console.log('🔄 Reloading page to ensure fresh user data...');
        window.location.reload();
      }, 1000);

      // Force a page refresh after a short delay to ensure UI updates
      setTimeout(() => {
        // Clear all auth-related cache before reload
        queryClient.clear();
        window.location.reload();
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Password Change Failed",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });

  // Redeem code mutation
  const redeemCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequest('POST', '/api/user/redeem-code', { code });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Code Redeemed Successfully!",
        description: data.message || `Bonus of ${data.bonusAmount} USDT added to your account!`,
      });
      setRedeemCode('');
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      // Refresh available codes to update the list
      fetchAvailableCodes();
    },
    onError: (error: any) => {
      toast({
        title: "Redeem Failed",
        description: error.message || "Invalid or expired redeem code",
        variant: "destructive",
      });
    },
  });

  // Document upload mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (data: { file: File; documentType: string }) => {
      const formData = new FormData();
      formData.append('document', data.file);
      formData.append('documentType', data.documentType);

      const authToken = localStorage.getItem('authToken');
      const response = await fetch('/api/user/upload-verification', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.details || 'Failed to upload document');
        } catch (e) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to upload document');
        }
      }

      return await response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Document Uploaded Successfully!",
        description: "Your verification document has been submitted for review.",
      });
      setSelectedFile(null);
      setIsUploading(false);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      fetchVerificationStatus();
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload verification document",
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });

  // Fetch verification status
  const fetchVerificationStatus = async () => {
    try {
      const response = await apiRequest('GET', '/api/user/verification-status');
      setVerificationStatus(response);
    } catch (error) {
      console.error('Failed to fetch verification status:', error);
    }
  };

  // Force refresh verification status and user data
  const forceRefreshVerification = async () => {
    setIsRefreshing(true);
    try {
      console.log('🔄 Force refreshing verification status...');

      // Use the new force refresh endpoint
      const response = await apiRequest('POST', '/api/user/force-refresh-verification');
      console.log('🔄 Force refresh response:', response);

      // Clear cached user data
      localStorage.removeItem('user');

      // Force refresh auth data
      queryClient.removeQueries({ queryKey: ["/api/auth"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth"] });
      await queryClient.refetchQueries({ queryKey: ["/api/auth"] });

      // Also refresh verification status
      await fetchVerificationStatus();

      toast({
        title: "Verification Status Refreshed",
        description: response.message || "Your account verification status has been updated.",
      });

      setTestResults(`✅ Verification refresh successful! Status: ${user?.verificationStatus || 'Unknown'}`);
    } catch (error: any) {
      console.error('Failed to refresh verification status:', error);
      toast({
        title: "Refresh Failed",
        description: error.message || "Failed to refresh verification status. Please try again.",
        variant: "destructive",
      });

      setTestResults(`❌ Verification refresh failed: ${error.message || error}`);
    } finally {
      setIsRefreshing(false);
    }
  };



  // Test function for debugging mobile verification issues
  const testMobileVerificationFix = async () => {
    setTestResults('🔄 Testing mobile verification fix...');

    try {
      // Step 1: Check current user data
      const currentUser = localStorage.getItem('user');
      const currentUserData = currentUser ? JSON.parse(currentUser) : null;

      // Step 2: Test force refresh
      await forceRefreshVerification();

      // Step 3: Check updated user data
      const updatedUser = localStorage.getItem('user');
      const updatedUserData = updatedUser ? JSON.parse(updatedUser) : null;

      setTestResults(`
✅ Mobile verification fix test completed!
📱 Screen width: ${window.innerWidth}px (Mobile: ${window.innerWidth < 768 ? 'Yes' : 'No'})
👤 Current user: ${user?.username || 'Unknown'}
🔐 Verification status: ${user?.verificationStatus || 'Unknown'}
💾 LocalStorage cleared and refetched: ${currentUserData ? 'Yes' : 'No'} → ${updatedUserData ? 'Yes' : 'No'}
🔄 Refresh completed successfully!
      `);

    } catch (error) {
      setTestResults(`❌ Test failed: ${error}`);
    }
  };

  // Fetch referral stats
  const fetchReferralStats = useCallback(async () => {
    try {
      console.log('🔗 Fetching referral stats for user:', user?.username);
      const response = await apiRequest('GET', '/api/user/referral-stats');
      console.log('🔗 Referral stats response:', response);
      setReferralStats(response);
    } catch (error) {
      console.error('❌ Failed to fetch referral stats:', error);
      // Set fallback data to prevent infinite loading
      setReferralStats({
        referralCode: `REF${user?.username?.toUpperCase().substring(0, 4) || 'USER'}${Date.now().toString().slice(-4)}`,
        totalReferrals: 0,
        referrals: []
      });
    }
  }, [user?.username]);

  // Load referral stats on component mount
  useEffect(() => {
    if (user?.id) {
      fetchReferralStats();
    }
  }, [user?.id, fetchReferralStats]);

  // Fetch available redeem codes
  const fetchAvailableCodes = useCallback(async () => {
    try {
      console.log('🎁 Fetching available redeem codes');
      const response = await apiRequest('GET', '/api/user/available-codes');
      console.log('🎁 Available codes response:', response);
      setAvailableCodes(response || []);
    } catch (error) {
      console.error('❌ Failed to fetch available codes:', error);
      // Set fallback data
      setAvailableCodes([
        { code: 'FIRSTBONUS', amount: '100 USDT', description: 'First time user bonus' },
        { code: 'LETSGO1000', amount: '1000 USDT', description: 'High value bonus code' },
        { code: 'WELCOME50', amount: '50 USDT', description: 'Welcome bonus for new users' },
        { code: 'BONUS500', amount: '500 USDT', description: 'Limited time bonus' }
      ]);
    }
  }, []);

  // Load available codes on component mount
  useEffect(() => {
    if (user?.id) {
      fetchAvailableCodes();
    }
  }, [user?.id, fetchAvailableCodes]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    const { currentPassword, newPassword, confirmPassword, ...profileData } = formData;
    updateProfileMutation.mutate(profileData);
  };

  const handleChangePassword = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation don't match",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    });
  };

  const handleRedeemCode = () => {
    if (!redeemCode.trim()) {
      toast({
        title: "Invalid Code",
        description: "Please enter a redeem code",
        variant: "destructive",
      });
      return;
    }

    setIsRedeeming(true);
    redeemCodeMutation.mutate(redeemCode.trim().toUpperCase());
    setIsRedeeming(false);
  };

  // File upload handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
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

      setSelectedFile(file);
    }
  };

  const handleDocumentUpload = () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a document to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    uploadDocumentMutation.mutate({
      file: selectedFile,
      documentType: documentType
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-24 md:pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Mobile optimized */}
        <div className={`mb-6 ${isMobile ? 'mb-4' : 'mb-8'}`}>
          <h1 className={`font-bold text-white mb-2 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>Profile Settings</h1>
          <p className={`text-gray-400 ${isMobile ? 'text-sm' : ''}`}>Manage your account information and preferences</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Mobile-optimized TabsList */}
          <TabsList className={`grid w-full bg-gray-800 border-gray-700 ${
            isMobile
              ? 'grid-cols-2 gap-1 p-1'
              : 'grid-cols-5'
          }`}>
            <TabsTrigger
              value="profile"
              className={`data-[state=active]:bg-gray-700 ${
                isMobile
                  ? 'text-xs px-2 py-2'
                  : ''
              }`}
            >
              {isMobile ? 'Profile' : 'Profile Information'}
            </TabsTrigger>
            <TabsTrigger
              value="verification"
              className={`data-[state=active]:bg-gray-700 ${
                isMobile
                  ? 'text-xs px-2 py-2'
                  : ''
              }`}
            >
              {isMobile ? 'Verify' : 'Verification'}
            </TabsTrigger>
            {!isMobile && (
              <>
                <TabsTrigger value="redeem" className="data-[state=active]:bg-gray-700">
                  Redeem Codes
                </TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-gray-700">
                  Security
                </TabsTrigger>
                <TabsTrigger value="account" className="data-[state=active]:bg-gray-700">
                  Account Details
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Mobile: Second row of tabs */}
          {isMobile && (
            <TabsList className="grid w-full grid-cols-3 gap-1 p-1 bg-gray-800 border-gray-700 -mt-4">
              <TabsTrigger
                value="redeem"
                className="data-[state=active]:bg-gray-700 text-xs px-2 py-2"
              >
                Redeem
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:bg-gray-700 text-xs px-2 py-2"
              >
                Security
              </TabsTrigger>
              <TabsTrigger
                value="account"
                className="data-[state=active]:bg-gray-700 text-xs px-2 py-2"
              >
                Account
              </TabsTrigger>
            </TabsList>
          )}

          {/* Profile Information Tab */}
          <TabsContent value="profile">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className={isMobile ? "p-4" : ""}>
                <div className={`flex items-center justify-between ${isMobile ? 'flex-col space-y-3' : ''}`}>
                  <div className={isMobile ? 'text-center' : ''}>
                    <CardTitle className={`text-white ${isMobile ? 'text-lg' : ''}`}>Profile Information</CardTitle>
                    <CardDescription className={`text-gray-400 ${isMobile ? 'text-sm' : ''}`}>
                      Update your personal information and contact details
                    </CardDescription>
                  </div>
                  <Button
                    variant={isEditing ? "outline" : "default"}
                    onClick={() => setIsEditing(!isEditing)}
                    className={`${isEditing ? "border-gray-600" : ""} ${isMobile ? 'w-full' : ''}`}
                    size={isMobile ? "sm" : "default"}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className={`space-y-6 ${isMobile ? 'p-4' : ''}`}>
                {/* Profile Picture Section - Mobile optimized */}
                <div className={`flex items-center ${isMobile ? 'flex-col text-center space-y-3' : 'space-x-4'}`}>
                  <div className="relative">
                    <div className={`bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center ${
                      isMobile ? 'w-16 h-16' : 'w-20 h-20'
                    }`}>
                      <User className={`text-white ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />
                    </div>
                    {isEditing && (
                      <Button
                        size="sm"
                        className={`absolute -bottom-2 -right-2 rounded-full p-0 ${
                          isMobile ? 'h-6 w-6' : 'h-8 w-8'
                        }`}
                        disabled
                      >
                        <Camera className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                      </Button>
                    )}
                  </div>
                  <div className="min-w-0 max-w-full">
                    <h3 className={`font-semibold text-white ${isMobile ? 'text-base' : 'text-lg'} break-words`}>
                      {user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user?.username && user.username.startsWith('0x') && user.username.length > 20
                        ? `${user.username.slice(0, 6)}...${user.username.slice(-4)}`
                        : user?.username || 'User'}
                    </h3>
                    <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'} break-all max-w-full overflow-hidden`}>
                      @{user?.username && user.username.startsWith('0x') && user.username.length > 20
                        ? `${user.username.slice(0, 6)}...${user.username.slice(-4)}`
                        : user?.username}
                    </p>
                    <Badge variant="secondary" className={`mt-1 ${isMobile ? 'text-xs' : ''}`}>
                      {user?.role === 'admin' ? 'Administrator' : 'User'}
                    </Badge>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Form Fields - Mobile optimized */}
                <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-300">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      disabled={!isEditing}
                      className="bg-gray-700 border-gray-600 text-white disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className="bg-gray-700 border-gray-600 text-white disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={!isEditing}
                      className="bg-gray-700 border-gray-600 text-white disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={!isEditing}
                      className="bg-gray-700 border-gray-600 text-white disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      className="bg-gray-700 border-gray-600 text-white disabled:opacity-50"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-gray-300">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      disabled={!isEditing}
                      className="bg-gray-700 border-gray-600 text-white disabled:opacity-50"
                      placeholder="Enter address"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="border-gray-600"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={updateProfileMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Account Verification</CardTitle>
                <CardDescription className="text-gray-400">
                  Upload your identity documents for account verification and set login password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Debug Password Status - Remove in production */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="p-3 bg-gray-900/50 border border-gray-600 rounded text-xs text-gray-400">
                    <strong>Debug Info:</strong> hasPassword: {String(user?.hasPassword)},
                    walletAddress: {user?.walletAddress ? 'Yes' : 'No'},
                    isGmail: {user?.email?.includes('@gmail.com') ? 'Yes' : 'No'}
                  </div>
                )}

                {/* Password Status Information */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-600/20 rounded-lg">
                        <Shield className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">Password Status</CardTitle>
                        <CardDescription className="text-gray-400">
                          Current login methods and password status for your account
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Current Login Methods */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* MetaMask Status */}
                      {user?.walletAddress && (
                        <div className="p-4 bg-green-900/20 border border-green-600/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <h3 className="text-green-400 font-medium">MetaMask Connected</h3>
                          </div>
                          <p className="text-green-300 text-sm">
                            Wallet: {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                          </p>
                        </div>
                      )}

                      {/* Google Status */}
                      {user?.email?.includes('@gmail.com') && (
                        <div className="p-4 bg-blue-900/20 border border-blue-600/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <h3 className="text-blue-400 font-medium">Google Connected</h3>
                          </div>
                          <p className="text-blue-300 text-sm">
                            Email: {user.email}
                          </p>
                        </div>
                      )}

                      {/* Password Status */}
                      <div className={`p-4 border rounded-lg ${
                        user?.hasPassword
                          ? 'bg-green-900/20 border-green-600/50'
                          : 'bg-yellow-900/20 border-yellow-600/50'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-2 h-2 rounded-full ${
                            user?.hasPassword ? 'bg-green-400' : 'bg-yellow-400'
                          }`}></div>
                          <h3 className={`font-medium ${
                            user?.hasPassword ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                            {user?.hasPassword ? 'Password Set' : 'No Password'}
                          </h3>
                        </div>
                        <p className={`text-sm ${
                          user?.hasPassword ? 'text-green-300' : 'text-yellow-300'
                        }`}>
                          {user?.hasPassword
                            ? 'You can log in with username/password'
                            : 'Username/password login not available'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Set Login Password for Verified Users Without Password */}
                {!user?.hasPassword && user?.verificationStatus === 'verified' && (
                  <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-600/50">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-600/20 rounded-lg">
                          <Shield className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">Set Login Password</CardTitle>
                          <CardDescription className="text-purple-200">
                            Add password login to your verified account for additional security
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-blue-900/20 border border-blue-600/50 rounded-lg">
                        <h3 className="text-blue-400 font-medium mb-2">
                          ℹ️ Why Set a Password?
                        </h3>
                        <ul className="text-blue-300 text-sm space-y-1">
                          <li>• Access your account without {user?.walletAddress ? 'MetaMask' : 'Google'}</li>
                          <li>• Faster login on any device</li>
                          <li>• Backup access method for security</li>
                          <li>• No current password needed - this is your first password</li>
                        </ul>
                      </div>

                      <div className="space-y-4">
                        {/* Password Requirements */}
                        <div className="p-3 bg-gray-700/50 border border-gray-600 rounded-lg">
                          <h4 className="text-gray-300 font-medium mb-2">Password Requirements:</h4>
                          <ul className="text-gray-400 text-sm space-y-1">
                            <li className={`flex items-center gap-2 ${formData.newPassword.length >= 6 ? 'text-green-400' : ''}`}>
                              {formData.newPassword.length >= 6 ? '✓' : '•'} At least 6 characters
                            </li>
                            <li className={`flex items-center gap-2 ${formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword ? 'text-green-400' : ''}`}>
                              {formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword ? '✓' : '•'} Passwords match
                            </li>
                            <li className="flex items-center gap-2 text-blue-400">
                              ℹ️ No current password required (this is your first password)
                            </li>
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="newPasswordVerification" className="text-gray-300">Create Your Password</Label>
                          <Input
                            id="newPasswordVerification"
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => handleInputChange('newPassword', e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Enter your new password (minimum 6 characters)"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPasswordVerification" className="text-gray-300">Confirm Your Password</Label>
                          <Input
                            id="confirmPasswordVerification"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Confirm your new password"
                          />
                        </div>

                        {/* Real-time validation feedback */}
                        {formData.newPassword && (
                          <div className="space-y-2">
                            {formData.newPassword.length < 6 && (
                              <p className="text-yellow-400 text-sm flex items-center gap-2">
                                ⚠️ Password must be at least 6 characters
                              </p>
                            )}
                            {formData.newPassword.length >= 6 && (
                              <p className="text-green-400 text-sm flex items-center gap-2">
                                ✓ Password length is good
                              </p>
                            )}
                            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                              <p className="text-red-400 text-sm flex items-center gap-2">
                                ✗ Passwords don't match
                              </p>
                            )}
                            {formData.confirmPassword && formData.newPassword === formData.confirmPassword && formData.newPassword.length >= 6 && (
                              <p className="text-green-400 text-sm flex items-center gap-2">
                                ✓ Passwords match - ready to set!
                              </p>
                            )}
                          </div>
                        )}

                        <Button
                          onClick={() => {
                            console.log('🔐 Setting password for verified user:', {
                              hasPassword: user?.hasPassword,
                              verificationStatus: user?.verificationStatus,
                              newPasswordLength: formData.newPassword?.length,
                              confirmPasswordLength: formData.confirmPassword?.length
                            });

                            // Handle setting password for MetaMask/Google users
                            if (formData.newPassword !== formData.confirmPassword) {
                              toast({
                                title: "Password Mismatch",
                                description: "New password and confirmation don't match",
                                variant: "destructive",
                              });
                              return;
                            }

                            if (formData.newPassword.length < 6) {
                              toast({
                                title: "Password Too Short",
                                description: "Password must be at least 6 characters long",
                                variant: "destructive",
                              });
                              return;
                            }

                            // Use the mutation for setting password (no current password required)
                            changePasswordMutation.mutate({
                              newPassword: formData.newPassword,
                              isFirstTimePassword: true
                            });
                          }}
                          disabled={
                            changePasswordMutation.isPending ||
                            !formData.newPassword ||
                            !formData.confirmPassword ||
                            formData.newPassword !== formData.confirmPassword ||
                            formData.newPassword.length < 6
                          }
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          {changePasswordMutation.isPending ? "Setting Password..." : "Set My First Login Password"}
                        </Button>

                        {/* Success Preview */}
                        {formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword && formData.newPassword.length >= 6 && (
                          <div className="p-3 bg-green-900/20 border border-green-600/50 rounded-lg">
                            <p className="text-green-300 text-sm">
                              🎉 Once set, you'll be able to log in with:
                            </p>
                            <ul className="text-green-400 text-sm mt-2 space-y-1">
                              <li>• Username: {user?.username || 'Your username'}</li>
                              <li>• Password: (the password you're creating)</li>
                              <li>• Plus your existing {user?.walletAddress ? 'MetaMask' : 'Google'} login</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Mobile Verification Refresh Notice */}
                {isMobile && user?.verificationStatus !== 'verified' && (
                  <div className="p-4 bg-blue-900/30 border border-blue-600/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-blue-100 font-medium mb-1">📱 Mobile Verification Status</h3>
                        <p className="text-blue-200 text-sm">
                          If you were verified on desktop, tap refresh to sync your status
                        </p>
                      </div>
                      <Button
                        onClick={forceRefreshVerification}
                        disabled={isRefreshing}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {isRefreshing ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Refresh
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}



                {/* Alternative Password Setting for Non-Verified Users */}
                {!user?.hasPassword && user?.verificationStatus !== 'verified' && (
                  <Card className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border-orange-600/50">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-600/20 rounded-lg">
                          <Shield className="w-6 h-6 text-orange-400" />
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg">Set Login Password</CardTitle>
                          <CardDescription className="text-orange-200">
                            Set a password for your account (verification not required)
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-orange-900/20 border border-orange-600/50 rounded-lg">
                        <h3 className="text-orange-400 font-medium mb-2">
                          🔐 Password Login Setup
                        </h3>
                        <p className="text-orange-200 text-sm mb-4">
                          Add a password to enable username/password login for your account.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="newPasswordAlt" className="text-gray-300">New Password</Label>
                          <div className="relative">
                            <Input
                              id="newPasswordAlt"
                              type={showPassword ? "text" : "password"}
                              value={formData.newPassword}
                              onChange={(e) => handleInputChange('newPassword', e.target.value)}
                              className="bg-gray-700 border-gray-600 text-white pr-10"
                              placeholder="Enter your new password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPasswordAlt" className="text-gray-300">Confirm Password</Label>
                          <Input
                            id="confirmPasswordAlt"
                            type={showPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Confirm your new password"
                          />
                        </div>

                        <Button
                          onClick={() => {
                            console.log('🔐 Setting password for non-verified user:', {
                              hasPassword: user?.hasPassword,
                              verificationStatus: user?.verificationStatus,
                              newPasswordLength: formData.newPassword?.length,
                              confirmPasswordLength: formData.confirmPassword?.length
                            });

                            // Handle setting password for any user
                            if (formData.newPassword !== formData.confirmPassword) {
                              toast({
                                title: "Password Mismatch",
                                description: "New password and confirmation don't match",
                                variant: "destructive",
                              });
                              return;
                            }

                            if (formData.newPassword.length < 6) {
                              toast({
                                title: "Password Too Short",
                                description: "Password must be at least 6 characters long",
                                variant: "destructive",
                              });
                              return;
                            }

                            // Use the mutation for setting password (no current password required)
                            changePasswordMutation.mutate({
                              newPassword: formData.newPassword,
                              isFirstTimePassword: true
                            });
                          }}
                          disabled={
                            changePasswordMutation.isPending ||
                            !formData.newPassword ||
                            !formData.confirmPassword
                          }
                          className="w-full bg-orange-600 hover:bg-orange-700"
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          {changePasswordMutation.isPending ? "Setting Password..." : "Set Password"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Verification Status */}
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium">Verification Status</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={forceRefreshVerification}
                        disabled={isRefreshing}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                      >
                        <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {user?.verificationStatus === 'verified' ? 'Your account is verified' :
                       user?.verificationStatus === 'pending' ? 'Verification pending review' :
                       user?.verificationStatus === 'rejected' ? 'Verification rejected' :
                       'Account not verified'}
                    </p>
                  </div>
                  <Badge
                    variant={
                      user?.verificationStatus === 'verified' ? 'default' :
                      user?.verificationStatus === 'pending' ? 'secondary' :
                      user?.verificationStatus === 'rejected' ? 'destructive' :
                      'outline'
                    }
                    className={
                      user?.verificationStatus === 'verified' ? 'bg-green-600' :
                      user?.verificationStatus === 'pending' ? 'bg-yellow-600' :
                      user?.verificationStatus === 'rejected' ? 'bg-red-600' :
                      'bg-gray-600'
                    }
                  >
                    {user?.verificationStatus === 'verified' ? '✓ Verified' :
                     user?.verificationStatus === 'pending' ? '⏳ Pending' :
                     user?.verificationStatus === 'rejected' ? '✗ Rejected' :
                     '⚠ Unverified'}
                  </Badge>
                </div>

                {/* Upload Section */}
                {user?.verificationStatus !== 'verified' && (
                  <div className="space-y-4 p-4 bg-gray-700 rounded-lg">
                    <h3 className="text-white font-medium">Upload Verification Document</h3>
                    <p className="text-gray-400 text-sm">
                      Please upload a clear photo of your ID card, driver's license, or passport.
                      This is required for trading and withdrawals.
                    </p>

                    {/* Document Type Selection */}
                    <div className="space-y-2">
                      <Label className="text-gray-300">Document Type</Label>
                      <select
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2"
                      >
                        <option value="id_card">ID Card</option>
                        <option value="driver_license">Driver's License</option>
                        <option value="passport">Passport</option>
                      </select>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                      <Label className="text-gray-300">Document File</Label>
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition-colors ${
                          selectedFile ? 'border-green-500 bg-green-500/10' : 'border-gray-600'
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {selectedFile ? (
                          <div className="flex items-center justify-center space-x-2">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                            <span className="text-green-400 text-sm">{selectedFile.name}</span>
                          </div>
                        ) : (
                          <>
                            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-400 text-sm">Click to upload document</p>
                            <p className="text-gray-500 text-xs mt-1">JPEG, PNG, PDF (max 5MB)</p>
                          </>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,application/pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>

                    {/* Upload Button */}
                    <Button
                      onClick={handleDocumentUpload}
                      disabled={!selectedFile || isUploading || uploadDocumentMutation.isPending}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {isUploading || uploadDocumentMutation.isPending ? 'Uploading...' : 'Upload Document'}
                    </Button>
                  </div>
                )}

                {/* Trading Restrictions */}
                {user?.verificationStatus !== 'verified' && (
                  <div className="p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                    <h3 className="text-yellow-400 font-medium mb-2">⚠ Account Restrictions</h3>
                    <ul className="text-yellow-300 text-sm space-y-1">
                      <li>• Trading is disabled until verification is complete</li>
                      <li>• Withdrawals are not available</li>
                      <li>• Some features may be limited</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Redeem Codes Tab */}
          <TabsContent value="redeem">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Redeem Bonus Codes</CardTitle>
                <CardDescription className="text-gray-400">
                  Enter promotional codes to receive bonus credits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Redeem Code Input */}
                <div className="space-y-4">
                  <div className="flex space-x-3">
                    <Input
                      value={redeemCode}
                      onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                      placeholder="Enter redeem code (e.g., FIRSTBONUS)"
                      className="bg-gray-900 border-gray-600 text-white flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && redeemCode.trim() && !isRedeeming) {
                          handleRedeemCode();
                        }
                      }}
                    />
                    <Button
                      onClick={handleRedeemCode}
                      disabled={isRedeeming || !redeemCode.trim()}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isRedeeming ? 'Redeeming...' : 'Redeem'}
                    </Button>
                  </div>

                  {/* Available Codes Hint */}
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h3 className="text-white font-medium mb-2">💡 Available Codes</h3>
                    {availableCodes.length === 0 ? (
                      <p className="text-gray-400 text-sm">Loading available codes...</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {availableCodes.map((codeInfo) => (
                        <div
                          key={codeInfo.code}
                          className="bg-gray-800 p-3 rounded border border-gray-600 hover:border-purple-500 cursor-pointer transition-colors"
                          onClick={() => {
                            setRedeemCode(codeInfo.code);
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-mono text-purple-400 font-bold">{codeInfo.code}</div>
                              <div className="text-green-400 font-semibold">{codeInfo.amount}</div>
                              <div className="text-gray-400 text-xs">{codeInfo.description}</div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRedeemCode(codeInfo.code);
                                setTimeout(() => handleRedeemCode(), 100);
                              }}
                              disabled={isRedeeming}
                            >
                              Use
                            </Button>
                          </div>
                        </div>
                      ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Withdrawal Restrictions Notice */}
                <div className="p-4 bg-blue-900/20 border border-blue-600 rounded-lg">
                  <h3 className="text-blue-400 font-medium mb-2">ℹ Bonus Terms</h3>
                  <ul className="text-blue-300 text-sm space-y-1">
                    <li>• Complete 10 trades to unlock withdrawals after claiming bonus</li>
                    <li>• Each code can only be used once per account</li>
                    <li>• Bonus credits are added immediately to your balance</li>
                  </ul>
                </div>

                {/* Referral Section */}
                <Separator className="bg-gray-600" />
                <div className="space-y-4">
                  <h3 className="text-white font-medium">🔗 Your Referral Code</h3>
                  <div className="flex items-center space-x-3">
                    <Input
                      value={referralStats?.referralCode || (referralStats === null ? 'Loading...' : 'Error loading code')}
                      readOnly
                      className="bg-gray-900 border-gray-600 text-white font-mono"
                    />
                    <Button
                      onClick={() => {
                        const codeToShare = referralStats?.referralCode || '';
                        if (codeToShare && codeToShare !== 'Loading...' && codeToShare !== 'Error loading code') {
                          navigator.clipboard.writeText(codeToShare);
                          toast({ title: "Copied!", description: "Referral code copied to clipboard" });
                        } else {
                          toast({ title: "Error", description: "No referral code to copy", variant: "destructive" });
                        }
                      }}
                      variant="outline"
                      className="border-gray-600"
                      disabled={!referralStats?.referralCode || referralStats.referralCode === 'Loading...' || referralStats.referralCode === 'Error loading code'}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Share this code with friends to earn referral bonuses!
                  </p>
                  {referralStats && (
                    <p className="text-green-400 text-sm">
                      Total Referrals: {referralStats.totalReferrals || 0}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Security Settings</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your password and security preferences
                </CardDescription>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      console.log('🔄 Manual refresh of user data');
                      queryClient.removeQueries({ queryKey: ['/api/auth'] });
                      queryClient.invalidateQueries({ queryKey: ['/api/auth'] });
                      queryClient.refetchQueries({ queryKey: ['/api/auth'] });
                      toast({
                        title: "Refreshing User Data",
                        description: "Updating password status...",
                      });
                    }}
                    variant="outline"
                    size="sm"
                    className="text-blue-400 border-blue-600 hover:bg-blue-900/20"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Status
                  </Button>

                  <Button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/debug/password-status', {
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                          }
                        });
                        const data = await response.json();
                        console.log('🔍 Password Debug Data:', data);
                        toast({
                          title: "Debug Info",
                          description: `Password saved: ${data.debug ? (data.supabaseData?.hasPasswordHash || data.fileData?.hasPasswordHash) : 'Unknown'}`,
                        });
                      } catch (error) {
                        console.error('Debug error:', error);
                        toast({
                          title: "Debug Failed",
                          description: "Could not fetch debug info",
                          variant: "destructive"
                        });
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="text-yellow-400 border-yellow-600 hover:bg-yellow-900/20"
                  >
                    🔍 Debug
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Debug logging for password status */}
                {console.log('🔍 Security Tab Debug - User Data:', {
                  hasPassword: user?.hasPassword,
                  passwordStatus: user?.hasPassword ? 'Password Set' : 'No Password',
                  verificationStatus: user?.verificationStatus,
                  walletAddress: user?.walletAddress,
                  email: user?.email,
                  userId: user?.id,
                  username: user?.username
                })}

                {/* Check if user has a password set */}
                {user?.hasPassword ? (
                  /* Traditional password change for users with existing passwords */
                  <div className="space-y-4">
                    <div className="p-4 bg-green-900/20 border border-green-600/50 rounded-lg">
                      <h3 className="text-green-400 font-medium mb-2">🔐 Password Protection Enabled</h3>
                      <p className="text-green-300 text-sm mb-3">
                        Your account is secured with a password. You can change it below if needed.
                      </p>
                      <div className="flex items-center gap-2 text-green-400 text-sm">
                        <Shield className="w-4 h-4" />
                        <span>You can log in with username and password</span>
                      </div>
                    </div>

                    {/* Current Login Methods Summary */}
                    <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
                      <h4 className="text-gray-300 font-medium mb-3">Available Login Methods:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                          ✓ Username & Password
                        </div>
                        {user?.walletAddress && (
                          <div className="flex items-center gap-2 text-green-400 text-sm">
                            ✓ MetaMask Wallet ({user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)})
                          </div>
                        )}
                        {user?.email?.includes('@gmail.com') && (
                          <div className="flex items-center gap-2 text-green-400 text-sm">
                            ✓ Google Account ({user.email})
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Password Change Form */}
                    <div className="p-4 bg-gray-800/50 border border-gray-600 rounded-lg">
                      <h4 className="text-white font-medium mb-4">Change Your Password</h4>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword" className="text-gray-300">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type={showPassword ? "text" : "password"}
                              value={formData.currentPassword}
                              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                              className="bg-gray-700 border-gray-600 text-white pr-10"
                              placeholder="Enter your current password"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                          <p className="text-gray-400 text-xs">
                            This is the password you currently use to log in
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="newPasswordSecurity" className="text-gray-300">New Password</Label>
                          <Input
                            id="newPasswordSecurity"
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => handleInputChange('newPassword', e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Enter your new password (minimum 6 characters)"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPasswordSecurity" className="text-gray-300">Confirm New Password</Label>
                          <Input
                            id="confirmPasswordSecurity"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Confirm your new password"
                          />
                        </div>

                        {/* Real-time validation for password change */}
                        {formData.newPassword && (
                          <div className="space-y-1">
                            {formData.newPassword.length < 6 && (
                              <p className="text-yellow-400 text-sm flex items-center gap-2">
                                ⚠️ New password must be at least 6 characters
                              </p>
                            )}
                            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                              <p className="text-red-400 text-sm flex items-center gap-2">
                                ✗ New passwords don't match
                              </p>
                            )}
                            {formData.confirmPassword && formData.newPassword === formData.confirmPassword && formData.newPassword.length >= 6 && (
                              <p className="text-green-400 text-sm flex items-center gap-2">
                                ✓ New passwords match and meet requirements
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={handleChangePassword}
                      disabled={
                        changePasswordMutation.isPending ||
                        !formData.currentPassword ||
                        !formData.newPassword ||
                        !formData.confirmPassword
                      }
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                    </Button>
                  </div>
                ) : (
                  /* Info for users without passwords - direct them to Verification tab */
                  <div className="space-y-4">
                    {/* Current Status */}
                    <div className="p-4 bg-blue-900/20 border border-blue-600/50 rounded-lg">
                      <h3 className="text-blue-400 font-medium mb-3">🔐 No Password Set</h3>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                          <div>
                            <p className="text-blue-300 text-sm font-medium">Current Login Method:</p>
                            <p className="text-blue-200 text-sm">
                              {user?.walletAddress ? `MetaMask Wallet (${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)})` : 'Google Account'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                          <div>
                            <p className="text-yellow-300 text-sm font-medium">Password Status:</p>
                            <p className="text-yellow-200 text-sm">
                              <strong>You don't have a current password</strong> because you've never set one.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* What this means */}
                    <div className="p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
                      <h4 className="text-gray-300 font-medium mb-3">What This Means:</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          ✗ Cannot log in with username & password
                        </div>
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                          ✓ Can log in with {user?.walletAddress ? 'MetaMask' : 'Google'}
                        </div>
                        <div className="flex items-center gap-2 text-blue-400 text-sm">
                          ℹ️ No "current password" to remember or enter
                        </div>
                      </div>
                    </div>

                    {/* Action needed */}
                    <div className="p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-600/50 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <Shield className="w-5 h-5 text-purple-400" />
                        <h4 className="text-purple-300 font-medium">Want to Add Password Login?</h4>
                      </div>
                      <p className="text-purple-200 text-sm mb-3">
                        Set your first login password to access your account with username & password.
                      </p>
                      <div className="flex items-center gap-2 p-3 bg-purple-900/40 border border-purple-500/50 rounded-lg">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <p className="text-purple-300 text-sm">
                          Go to the <strong>Verification</strong> tab above to set your first password.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Details Tab */}
          <TabsContent value="account">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Account Details</CardTitle>
                <CardDescription className="text-gray-400">
                  View your account information and status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white break-words break-all text-sm leading-relaxed">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-400">User ID</p>
                      <p className="text-white font-mono text-sm break-all leading-relaxed">{user?.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Member Since</p>
                      <p className="text-white">
                        {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Account Status</p>
                      <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-600" />

                {/* Referral Code Section */}
                <div className="space-y-4">
                  <h3 className="text-white font-medium">Referral Code</h3>
                  <div className="flex items-center space-x-3">
                    <Input
                      value={referralStats?.referralCode || user?.referral_code || (referralStats === null ? 'Loading...' : 'Error loading code')}
                      readOnly
                      className="bg-gray-900 border-gray-600 text-white font-mono"
                    />
                    <Button
                      onClick={() => {
                        const codeToShare = referralStats?.referralCode || user?.referral_code || '';
                        if (codeToShare && codeToShare !== 'Loading...' && codeToShare !== 'Error loading code') {
                          navigator.clipboard.writeText(codeToShare);
                          toast({ title: "Copied!", description: "Referral code copied to clipboard" });
                        } else {
                          toast({ title: "Error", description: "No referral code to copy", variant: "destructive" });
                        }
                      }}
                      variant="outline"
                      className="border-gray-600"
                      disabled={!referralStats?.referralCode && !user?.referral_code}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Share this code with friends to earn referral bonuses!
                  </p>
                  {referralStats && (
                    <p className="text-green-400 text-sm">
                      Total Referrals: {referralStats.totalReferrals || 0}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

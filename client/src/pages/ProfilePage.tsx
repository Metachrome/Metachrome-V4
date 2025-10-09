import { useState, useRef } from "react";
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
  RefreshCw
} from "lucide-react";

export default function ProfilePage() {
  const { user, refreshAuth } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [referralStats, setReferralStats] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [testResults, setTestResults] = useState<string>('');

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
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
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
      return await apiRequest('PUT', '/api/user/password', data);
    },
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully",
      });
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
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
        description: data.message || `Bonus of $${data.bonusAmount} added to your account!`,
      });
      setRedeemCode('');
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
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
        const error = await response.text();
        throw new Error(error || 'Failed to upload document');
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
        description: "Your account verification status has been updated.",
      });

      setTestResults(`✅ Verification refresh successful! Status: ${user?.verification_status || 'Unknown'}`);
    } catch (error) {
      console.error('Failed to refresh verification status:', error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh verification status. Please try again.",
        variant: "destructive",
      });

      setTestResults(`❌ Verification refresh failed: ${error}`);
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
🔐 Verification status: ${user?.verification_status || 'Unknown'}
💾 LocalStorage cleared and refetched: ${currentUserData ? 'Yes' : 'No'} → ${updatedUserData ? 'Yes' : 'No'}
🔄 Refresh completed successfully!
      `);

    } catch (error) {
      setTestResults(`❌ Test failed: ${error}`);
    }
  };

  // Fetch referral stats
  const fetchReferralStats = async () => {
    try {
      const response = await apiRequest('GET', '/api/user/referral-stats');
      setReferralStats(response);
    } catch (error) {
      console.error('Failed to fetch referral stats:', error);
    }
  };

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-gray-400">Manage your account information and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800 border-gray-700">
            <TabsTrigger value="profile" className="data-[state=active]:bg-gray-700">
              Profile Information
            </TabsTrigger>
            <TabsTrigger value="verification" className="data-[state=active]:bg-gray-700">
              Verification
            </TabsTrigger>
            <TabsTrigger value="redeem" className="data-[state=active]:bg-gray-700">
              Redeem Codes
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-gray-700">
              Security
            </TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:bg-gray-700">
              Account Details
            </TabsTrigger>
          </TabsList>

          {/* Profile Information Tab */}
          <TabsContent value="profile">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Profile Information</CardTitle>
                    <CardDescription className="text-gray-400">
                      Update your personal information and contact details
                    </CardDescription>
                  </div>
                  <Button
                    variant={isEditing ? "outline" : "default"}
                    onClick={() => setIsEditing(!isEditing)}
                    className={isEditing ? "border-gray-600" : ""}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture Section */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    {isEditing && (
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                        disabled
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <p className="text-gray-400">@{user?.username}</p>
                    <Badge variant="secondary" className="mt-1">
                      {user?.role === 'admin' ? 'Administrator' : 'User'}
                    </Badge>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  Upload your identity documents for account verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mobile Verification Refresh Notice */}
                {isMobile && user?.verification_status !== 'verified' && (
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
                      {user?.verification_status === 'verified' ? 'Your account is verified' :
                       user?.verification_status === 'pending' ? 'Verification pending review' :
                       user?.verification_status === 'rejected' ? 'Verification rejected' :
                       'Account not verified'}
                    </p>
                  </div>
                  <Badge
                    variant={
                      user?.verification_status === 'verified' ? 'default' :
                      user?.verification_status === 'pending' ? 'secondary' :
                      user?.verification_status === 'rejected' ? 'destructive' :
                      'outline'
                    }
                    className={
                      user?.verification_status === 'verified' ? 'bg-green-600' :
                      user?.verification_status === 'pending' ? 'bg-yellow-600' :
                      user?.verification_status === 'rejected' ? 'bg-red-600' :
                      'bg-gray-600'
                    }
                  >
                    {user?.verification_status === 'verified' ? '✓ Verified' :
                     user?.verification_status === 'pending' ? '⏳ Pending' :
                     user?.verification_status === 'rejected' ? '✗ Rejected' :
                     '⚠ Unverified'}
                  </Badge>
                </div>

                {/* Upload Section */}
                {user?.verification_status !== 'verified' && (
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
                {user?.verification_status !== 'verified' && (
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {[
                        { code: 'FIRSTBONUS', amount: '$100', description: 'First time user bonus' },
                        { code: 'LETSGO1000', amount: '$1000', description: 'High value bonus code' },
                        { code: 'WELCOME50', amount: '$50', description: 'Welcome bonus for new users' },
                        { code: 'BONUS500', amount: '$500', description: 'Limited time bonus' }
                      ].map((codeInfo) => (
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
                      value={referralStats?.referralCode || 'Loading...'}
                      readOnly
                      className="bg-gray-900 border-gray-600 text-white font-mono"
                    />
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(referralStats?.referralCode || '');
                        toast({ title: "Copied!", description: "Referral code copied to clipboard" });
                      }}
                      variant="outline"
                      className="border-gray-600"
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Share this code with friends to earn referral bonuses!
                  </p>
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
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Check if user logged in via MetaMask/Google (no password set) */}
                {(user?.walletAddress || !user?.hasPassword) ? (
                  <div className="space-y-4">
                    {/* Info box for MetaMask/Google users */}
                    <div className="p-4 bg-blue-900/20 border border-blue-600 rounded-lg">
                      <h3 className="text-blue-400 font-medium mb-2">
                        {user?.walletAddress ? '🔗 MetaMask Login' : '🔐 Google Login'}
                      </h3>
                      <p className="text-blue-300 text-sm mb-3">
                        {user?.walletAddress
                          ? 'You logged in using MetaMask. Set a password to enable traditional login as well.'
                          : 'You logged in using Google. Set a password to enable traditional login as well.'
                        }
                      </p>
                    </div>

                    {/* Set Login Password Section */}
                    <div className="space-y-4">
                      <h3 className="text-white font-medium">Set Login Password</h3>
                      <p className="text-gray-400 text-sm">
                        Create a password to access your account without {user?.walletAddress ? 'MetaMask' : 'Google'}.
                      </p>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-gray-300">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={formData.newPassword}
                          onChange={(e) => handleInputChange('newPassword', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="Enter new password"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-gray-300">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="Confirm new password"
                        />
                      </div>

                      <Button
                        onClick={() => {
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

                          // Use a different mutation for setting password (no current password required)
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
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        {changePasswordMutation.isPending ? "Setting..." : "Set Login Password"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Traditional password change for users with existing passwords */
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
                          placeholder="Enter current password"
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
                      <Label htmlFor="newPassword" className="text-gray-300">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray-300">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Confirm new password"
                      />
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
                      value={referralStats?.referralCode || user?.referral_code || 'Loading...'}
                      readOnly
                      className="bg-gray-900 border-gray-600 text-white font-mono"
                    />
                    <Button
                      onClick={() => {
                        const codeToShare = referralStats?.referralCode || user?.referral_code || '';
                        navigator.clipboard.writeText(codeToShare);
                        toast({ title: "Copied!", description: "Referral code copied to clipboard" });
                      }}
                      variant="outline"
                      className="border-gray-600"
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Share this code with friends to earn referral bonuses!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

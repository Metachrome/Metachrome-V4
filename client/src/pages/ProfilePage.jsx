var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
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
import { User, Mail, Shield, Settings, Camera, Save, Eye, EyeOff, Upload, CheckCircle, FileText, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "../components/ui/select";
// Comprehensive country codes list (sorted alphabetically by country name)
var COUNTRY_CODES = [
    { code: '+93', country: 'Afghanistan', flag: '🇦🇫' },
    { code: '+355', country: 'Albania', flag: '🇦🇱' },
    { code: '+213', country: 'Algeria', flag: '🇩🇿' },
    { code: '+376', country: 'Andorra', flag: '🇦🇩' },
    { code: '+244', country: 'Angola', flag: '🇦🇴' },
    { code: '+54', country: 'Argentina', flag: '🇦🇷' },
    { code: '+374', country: 'Armenia', flag: '🇦🇲' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+43', country: 'Austria', flag: '🇦🇹' },
    { code: '+994', country: 'Azerbaijan', flag: '🇦🇿' },
    { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
    { code: '+880', country: 'Bangladesh', flag: '🇧🇩' },
    { code: '+375', country: 'Belarus', flag: '🇧🇾' },
    { code: '+32', country: 'Belgium', flag: '🇧🇪' },
    { code: '+501', country: 'Belize', flag: '🇧🇿' },
    { code: '+975', country: 'Bhutan', flag: '🇧🇹' },
    { code: '+591', country: 'Bolivia', flag: '🇧🇴' },
    { code: '+387', country: 'Bosnia', flag: '🇧🇦' },
    { code: '+267', country: 'Botswana', flag: '🇧🇼' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+673', country: 'Brunei', flag: '🇧🇳' },
    { code: '+359', country: 'Bulgaria', flag: '🇧🇬' },
    { code: '+855', country: 'Cambodia', flag: '🇰🇭' },
    { code: '+237', country: 'Cameroon', flag: '🇨🇲' },
    { code: '+1', country: 'Canada/USA', flag: '🇨🇦' },
    { code: '+56', country: 'Chile', flag: '🇨🇱' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+57', country: 'Colombia', flag: '🇨🇴' },
    { code: '+506', country: 'Costa Rica', flag: '🇨🇷' },
    { code: '+385', country: 'Croatia', flag: '🇭🇷' },
    { code: '+53', country: 'Cuba', flag: '🇨🇺' },
    { code: '+357', country: 'Cyprus', flag: '🇨🇾' },
    { code: '+420', country: 'Czech Republic', flag: '🇨🇿' },
    { code: '+45', country: 'Denmark', flag: '🇩🇰' },
    { code: '+593', country: 'Ecuador', flag: '🇪🇨' },
    { code: '+20', country: 'Egypt', flag: '🇪🇬' },
    { code: '+503', country: 'El Salvador', flag: '🇸🇻' },
    { code: '+372', country: 'Estonia', flag: '🇪🇪' },
    { code: '+251', country: 'Ethiopia', flag: '🇪🇹' },
    { code: '+358', country: 'Finland', flag: '🇫🇮' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+995', country: 'Georgia', flag: '🇬🇪' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+233', country: 'Ghana', flag: '🇬🇭' },
    { code: '+30', country: 'Greece', flag: '🇬🇷' },
    { code: '+502', country: 'Guatemala', flag: '🇬🇹' },
    { code: '+852', country: 'Hong Kong', flag: '🇭🇰' },
    { code: '+36', country: 'Hungary', flag: '🇭🇺' },
    { code: '+354', country: 'Iceland', flag: '🇮🇸' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+62', country: 'Indonesia', flag: '🇮🇩' },
    { code: '+98', country: 'Iran', flag: '🇮🇷' },
    { code: '+964', country: 'Iraq', flag: '🇮🇶' },
    { code: '+353', country: 'Ireland', flag: '🇮🇪' },
    { code: '+972', country: 'Israel', flag: '🇮🇱' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+962', country: 'Jordan', flag: '🇯🇴' },
    { code: '+7', country: 'Kazakhstan', flag: '🇰🇿' },
    { code: '+254', country: 'Kenya', flag: '🇰🇪' },
    { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
    { code: '+996', country: 'Kyrgyzstan', flag: '🇰🇬' },
    { code: '+856', country: 'Laos', flag: '🇱🇦' },
    { code: '+371', country: 'Latvia', flag: '🇱🇻' },
    { code: '+961', country: 'Lebanon', flag: '🇱🇧' },
    { code: '+218', country: 'Libya', flag: '🇱🇾' },
    { code: '+370', country: 'Lithuania', flag: '🇱🇹' },
    { code: '+352', country: 'Luxembourg', flag: '🇱🇺' },
    { code: '+853', country: 'Macau', flag: '🇲🇴' },
    { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
    { code: '+960', country: 'Maldives', flag: '🇲🇻' },
    { code: '+356', country: 'Malta', flag: '🇲🇹' },
    { code: '+52', country: 'Mexico', flag: '🇲🇽' },
    { code: '+373', country: 'Moldova', flag: '🇲🇩' },
    { code: '+377', country: 'Monaco', flag: '🇲🇨' },
    { code: '+976', country: 'Mongolia', flag: '🇲🇳' },
    { code: '+382', country: 'Montenegro', flag: '🇲🇪' },
    { code: '+212', country: 'Morocco', flag: '🇲🇦' },
    { code: '+95', country: 'Myanmar', flag: '🇲🇲' },
    { code: '+977', country: 'Nepal', flag: '🇳🇵' },
    { code: '+31', country: 'Netherlands', flag: '🇳🇱' },
    { code: '+64', country: 'New Zealand', flag: '🇳🇿' },
    { code: '+234', country: 'Nigeria', flag: '🇳🇬' },
    { code: '+47', country: 'Norway', flag: '🇳🇴' },
    { code: '+968', country: 'Oman', flag: '🇴🇲' },
    { code: '+92', country: 'Pakistan', flag: '🇵🇰' },
    { code: '+970', country: 'Palestine', flag: '🇵🇸' },
    { code: '+507', country: 'Panama', flag: '🇵🇦' },
    { code: '+595', country: 'Paraguay', flag: '🇵🇾' },
    { code: '+51', country: 'Peru', flag: '🇵🇪' },
    { code: '+63', country: 'Philippines', flag: '🇵🇭' },
    { code: '+48', country: 'Poland', flag: '🇵🇱' },
    { code: '+351', country: 'Portugal', flag: '🇵🇹' },
    { code: '+974', country: 'Qatar', flag: '🇶🇦' },
    { code: '+40', country: 'Romania', flag: '🇷🇴' },
    { code: '+7', country: 'Russia', flag: '🇷🇺' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+381', country: 'Serbia', flag: '🇷🇸' },
    { code: '+65', country: 'Singapore', flag: '🇸🇬' },
    { code: '+421', country: 'Slovakia', flag: '🇸🇰' },
    { code: '+386', country: 'Slovenia', flag: '🇸🇮' },
    { code: '+27', country: 'South Africa', flag: '🇿🇦' },
    { code: '+82', country: 'South Korea', flag: '🇰🇷' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+94', country: 'Sri Lanka', flag: '🇱🇰' },
    { code: '+46', country: 'Sweden', flag: '🇸🇪' },
    { code: '+41', country: 'Switzerland', flag: '🇨🇭' },
    { code: '+963', country: 'Syria', flag: '🇸🇾' },
    { code: '+886', country: 'Taiwan', flag: '🇹🇼' },
    { code: '+992', country: 'Tajikistan', flag: '🇹🇯' },
    { code: '+255', country: 'Tanzania', flag: '🇹🇿' },
    { code: '+66', country: 'Thailand', flag: '🇹🇭' },
    { code: '+90', country: 'Turkey', flag: '🇹🇷' },
    { code: '+993', country: 'Turkmenistan', flag: '🇹🇲' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+256', country: 'Uganda', flag: '🇺🇬' },
    { code: '+380', country: 'Ukraine', flag: '🇺🇦' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
    { code: '+598', country: 'Uruguay', flag: '🇺🇾' },
    { code: '+998', country: 'Uzbekistan', flag: '🇺🇿' },
    { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
    { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
    { code: '+967', country: 'Yemen', flag: '🇾🇪' },
    { code: '+260', country: 'Zambia', flag: '🇿🇲' },
    { code: '+263', country: 'Zimbabwe', flag: '🇿🇼' },
];
export default function ProfilePage() {
    var _this = this;
    var _a, _b, _c;
    var _d = useAuth(), user = _d.user, refreshAuth = _d.refreshAuth;
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    var isMobile = useIsMobile();
    var _e = useState('profile'), activeTab = _e[0], setActiveTab = _e[1];
    // Show loading if user is not loaded yet
    if (!user) {
        return (<div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>);
    }
    // Form states
    var _f = useState(false), isEditing = _f[0], setIsEditing = _f[1];
    var _g = useState(false), showPassword = _g[0], setShowPassword = _g[1];
    var _h = useState(''), redeemCode = _h[0], setRedeemCode = _h[1];
    var _j = useState(false), isRedeeming = _j[0], setIsRedeeming = _j[1];
    var _k = useState(null), verificationStatus = _k[0], setVerificationStatus = _k[1];
    var _l = useState(null), referralStats = _l[0], setReferralStats = _l[1];
    var _m = useState(false), isRefreshing = _m[0], setIsRefreshing = _m[1];
    var _o = useState(''), testResults = _o[0], setTestResults = _o[1];
    var _p = useState([]), availableCodes = _p[0], setAvailableCodes = _p[1];
    // Document upload states
    var _q = useState(null), selectedFile = _q[0], setSelectedFile = _q[1];
    var _r = useState('id_card'), documentType = _r[0], setDocumentType = _r[1];
    var _s = useState(false), isUploading = _s[0], setIsUploading = _s[1];
    var fileInputRef = useRef(null);
    var _t = useState({
        username: (user === null || user === void 0 ? void 0 : user.username) || '',
        email: (user === null || user === void 0 ? void 0 : user.email) || '',
        firstName: (user === null || user === void 0 ? void 0 : user.firstName) || '',
        lastName: (user === null || user === void 0 ? void 0 : user.lastName) || '',
        phone: (user === null || user === void 0 ? void 0 : user.phone) || '',
        phoneCountryCode: '+1', // Default to US
        address: (user === null || user === void 0 ? void 0 : user.address) || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    }), formData = _t[0], setFormData = _t[1];
    // Update form data when user data changes
    useEffect(function () {
        if (user) {
            // Parse phone number to extract country code
            var phoneNumber_1 = user.phone || '';
            var countryCode_1 = '+1'; // Default
            // Check if phone starts with + (international format)
            if (phoneNumber_1.startsWith('+')) {
                // Extract country code (1-4 digits after +)
                var match = phoneNumber_1.match(/^(\+\d{1,4})/);
                if (match) {
                    countryCode_1 = match[1];
                    phoneNumber_1 = phoneNumber_1.substring(countryCode_1.length).trim();
                }
            }
            setFormData(function (prev) { return (__assign(__assign({}, prev), { username: user.username || '', email: user.email || '', firstName: user.firstName || '', lastName: user.lastName || '', phone: phoneNumber_1, phoneCountryCode: countryCode_1, address: user.address || '' })); });
        }
    }, [user]);
    // Read tab from query parameter
    useEffect(function () {
        var params = new URLSearchParams(window.location.search);
        var tab = params.get('tab');
        if (tab) {
            setActiveTab(tab);
        }
    }, []);
    // Update profile mutation
    var updateProfileMutation = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest('PUT', '/api/user/profile', data)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); },
        onSuccess: function () {
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
        onError: function (error) {
            toast({
                title: "Update Failed",
                description: error.message || "Failed to update profile",
                variant: "destructive",
            });
        },
    });
    // Change password mutation
    var changePasswordMutation = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🔐 Password change attempt with data:', data);
                        return [4 /*yield*/, apiRequest('PUT', '/api/user/password', data)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); },
        onSuccess: function (data) {
            toast({
                title: "Password Set Successfully",
                description: (data === null || data === void 0 ? void 0 : data.isFirstTimePassword)
                    ? "Your login password has been set! You can now log in with username and password."
                    : "Your password has been changed successfully",
            });
            setFormData(function (prev) { return (__assign(__assign({}, prev), { currentPassword: '', newPassword: '', confirmPassword: '' })); });
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
            setTimeout(function () {
                console.log('🔄 Reloading page to ensure fresh user data...');
                window.location.reload();
            }, 1000);
            // Force a page refresh after a short delay to ensure UI updates
            setTimeout(function () {
                // Clear all auth-related cache before reload
                queryClient.clear();
                window.location.reload();
            }, 1000);
        },
        onError: function (error) {
            toast({
                title: "Password Change Failed",
                description: error.message || "Failed to change password",
                variant: "destructive",
            });
        },
    });
    // Redeem code mutation
    var redeemCodeMutation = useMutation({
        mutationFn: function (code) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest('POST', '/api/user/redeem-code', { code: code })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        }); },
        onSuccess: function (data) {
            toast({
                title: "Code Redeemed Successfully!",
                description: data.message || "Bonus of ".concat(data.bonusAmount, " USDT added to your account!"),
            });
            setRedeemCode('');
            queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
            // Refresh available codes to update the list
            fetchAvailableCodes();
        },
        onError: function (error) {
            toast({
                title: "Redeem Failed",
                description: error.message || "Invalid or expired redeem code",
                variant: "destructive",
            });
        },
    });
    // Document upload mutation
    var uploadDocumentMutation = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var formData, authToken, response, errorData, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        formData = new FormData();
                        formData.append('document', data.file);
                        formData.append('documentType', data.documentType);
                        authToken = localStorage.getItem('authToken');
                        return [4 /*yield*/, fetch('/api/user/upload-verification', {
                                method: 'POST',
                                headers: {
                                    'Authorization': "Bearer ".concat(authToken)
                                },
                                body: formData
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 5];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, response.json()];
                    case 3:
                        errorData = _a.sent();
                        throw new Error(errorData.error || errorData.details || 'Failed to upload document');
                    case 4:
                        e_1 = _a.sent();
                        // If JSON parsing fails, just throw a generic error
                        throw new Error('Failed to upload document');
                    case 5: return [4 /*yield*/, response.json()];
                    case 6: return [2 /*return*/, _a.sent()];
                }
            });
        }); },
        onSuccess: function (data) {
            toast({
                title: "Document Uploaded Successfully!",
                description: "Your verification document has been submitted for review.",
            });
            setSelectedFile(null);
            setIsUploading(false);
            queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
            fetchVerificationStatus();
        },
        onError: function (error) {
            toast({
                title: "Upload Failed",
                description: error.message || "Failed to upload verification document",
                variant: "destructive",
            });
            setIsUploading(false);
        },
    });
    // Fetch verification status
    var fetchVerificationStatus = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log('📄 Fetching verification status...');
                    return [4 /*yield*/, apiRequest('GET', '/api/user/verification-status')];
                case 1:
                    response = _a.sent();
                    console.log('📄 Verification status response:', response);
                    setVerificationStatus(response);
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('❌ Failed to fetch verification status:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    // Force refresh verification status and user data
    var forceRefreshVerification = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsRefreshing(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    console.log('🔄 Force refreshing verification status...');
                    return [4 /*yield*/, apiRequest('POST', '/api/user/force-refresh-verification')];
                case 2:
                    response = _a.sent();
                    console.log('🔄 Force refresh response:', response);
                    // Clear cached user data
                    localStorage.removeItem('user');
                    // Force refresh auth data
                    queryClient.removeQueries({ queryKey: ["/api/auth"] });
                    queryClient.invalidateQueries({ queryKey: ["/api/auth"] });
                    return [4 /*yield*/, queryClient.refetchQueries({ queryKey: ["/api/auth"] })];
                case 3:
                    _a.sent();
                    // Also refresh verification status
                    return [4 /*yield*/, fetchVerificationStatus()];
                case 4:
                    // Also refresh verification status
                    _a.sent();
                    toast({
                        title: "Verification Status Refreshed",
                        description: response.message || "Your account verification status has been updated.",
                    });
                    setTestResults("\u2705 Verification refresh successful! Status: ".concat((user === null || user === void 0 ? void 0 : user.verificationStatus) || 'Unknown'));
                    return [3 /*break*/, 7];
                case 5:
                    error_2 = _a.sent();
                    console.error('Failed to refresh verification status:', error_2);
                    toast({
                        title: "Refresh Failed",
                        description: error_2.message || "Failed to refresh verification status. Please try again.",
                        variant: "destructive",
                    });
                    setTestResults("\u274C Verification refresh failed: ".concat(error_2.message || error_2));
                    return [3 /*break*/, 7];
                case 6:
                    setIsRefreshing(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    // Test function for debugging mobile verification issues
    var testMobileVerificationFix = function () { return __awaiter(_this, void 0, void 0, function () {
        var currentUser, currentUserData, updatedUser, updatedUserData, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setTestResults('🔄 Testing mobile verification fix...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    currentUser = localStorage.getItem('user');
                    currentUserData = currentUser ? JSON.parse(currentUser) : null;
                    // Step 2: Test force refresh
                    return [4 /*yield*/, forceRefreshVerification()];
                case 2:
                    // Step 2: Test force refresh
                    _a.sent();
                    updatedUser = localStorage.getItem('user');
                    updatedUserData = updatedUser ? JSON.parse(updatedUser) : null;
                    setTestResults("\n\u2705 Mobile verification fix test completed!\n\uD83D\uDCF1 Screen width: ".concat(window.innerWidth, "px (Mobile: ").concat(window.innerWidth < 768 ? 'Yes' : 'No', ")\n\uD83D\uDC64 Current user: ").concat((user === null || user === void 0 ? void 0 : user.username) || 'Unknown', "\n\uD83D\uDD10 Verification status: ").concat((user === null || user === void 0 ? void 0 : user.verificationStatus) || 'Unknown', "\n\uD83D\uDCBE LocalStorage cleared and refetched: ").concat(currentUserData ? 'Yes' : 'No', " \u2192 ").concat(updatedUserData ? 'Yes' : 'No', "\n\uD83D\uDD04 Refresh completed successfully!\n      "));
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    setTestResults("\u274C Test failed: ".concat(error_3));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // Fetch referral stats
    var fetchReferralStats = useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var response, error_4;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    console.log('🔗 Fetching referral stats for user:', user === null || user === void 0 ? void 0 : user.username);
                    return [4 /*yield*/, apiRequest('GET', '/api/user/referral-stats')];
                case 1:
                    response = _b.sent();
                    console.log('🔗 Referral stats response:', response);
                    setReferralStats(response);
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _b.sent();
                    console.error('❌ Failed to fetch referral stats:', error_4);
                    // Set fallback data to prevent infinite loading
                    setReferralStats({
                        referralCode: "REF".concat(((_a = user === null || user === void 0 ? void 0 : user.username) === null || _a === void 0 ? void 0 : _a.toUpperCase().substring(0, 4)) || 'USER').concat(Date.now().toString().slice(-4)),
                        totalReferrals: 0,
                        referrals: []
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, [user === null || user === void 0 ? void 0 : user.username]);
    // Load referral stats on component mount
    useEffect(function () {
        if (user === null || user === void 0 ? void 0 : user.id) {
            fetchReferralStats();
        }
    }, [user === null || user === void 0 ? void 0 : user.id, fetchReferralStats]);
    // Fetch available redeem codes
    var fetchAvailableCodes = useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var response, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log('🎁 Fetching available redeem codes');
                    return [4 /*yield*/, apiRequest('GET', '/api/user/available-codes')];
                case 1:
                    response = _a.sent();
                    console.log('🎁 Available codes response:', response);
                    setAvailableCodes(response || []);
                    return [3 /*break*/, 3];
                case 2:
                    error_5 = _a.sent();
                    console.error('❌ Failed to fetch available codes:', error_5);
                    // Set fallback data
                    setAvailableCodes([
                        { code: 'FIRSTBONUS', amount: '100 USDT', description: 'First time user bonus' },
                        { code: 'LETSGO1000', amount: '1000 USDT', description: 'High value bonus code' },
                        { code: 'WELCOME50', amount: '50 USDT', description: 'Welcome bonus for new users' },
                        { code: 'BONUS500', amount: '500 USDT', description: 'Limited time bonus' }
                    ]);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    // Load available codes on component mount
    useEffect(function () {
        if (user === null || user === void 0 ? void 0 : user.id) {
            fetchAvailableCodes();
        }
    }, [user === null || user === void 0 ? void 0 : user.id, fetchAvailableCodes]);
    // Load verification status on component mount
    useEffect(function () {
        if (user === null || user === void 0 ? void 0 : user.id) {
            console.log('📄 Component mounted, fetching verification status for user:', user.id);
            fetchVerificationStatus();
        }
    }, [user === null || user === void 0 ? void 0 : user.id]);
    var handleInputChange = function (field, value) {
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    };
    var handleSaveProfile = function () {
        var currentPassword = formData.currentPassword, newPassword = formData.newPassword, confirmPassword = formData.confirmPassword, phoneCountryCode = formData.phoneCountryCode, phone = formData.phone, profileData = __rest(formData, ["currentPassword", "newPassword", "confirmPassword", "phoneCountryCode", "phone"]);
        // Combine country code with phone number
        var fullPhoneNumber = phone ? "".concat(phoneCountryCode, " ").concat(phone) : '';
        updateProfileMutation.mutate(__assign(__assign({}, profileData), { phone: fullPhoneNumber }));
    };
    var handleChangePassword = function () {
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
    var handleRedeemCode = function () {
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
    var handleFileSelect = function (event) {
        var _a;
        var file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (file) {
            // Validate file type
            var allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
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
    var handleDocumentUpload = function () {
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
    var formatDate = function (dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    return (<div className="min-h-screen bg-gray-900 pt-20 pb-24 md:pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Mobile optimized */}
        <div className={"mb-6 ".concat(isMobile ? 'mb-4' : 'mb-8')}>
          <h1 className={"font-bold text-white mb-2 ".concat(isMobile ? 'text-2xl' : 'text-3xl')}>Profile Settings</h1>
          <p className={"text-gray-400 ".concat(isMobile ? 'text-sm' : '')}>Manage your account information and preferences</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Mobile-optimized TabsList */}
          <TabsList className={"grid w-full bg-gray-800 border-gray-700 ".concat(isMobile
            ? 'grid-cols-2 gap-1 p-1'
            : 'grid-cols-5')}>
            <TabsTrigger value="profile" className={"data-[state=active]:bg-gray-700 ".concat(isMobile
            ? 'text-xs px-2 py-2'
            : '')}>
              {isMobile ? 'Profile' : 'Profile Information'}
            </TabsTrigger>
            <TabsTrigger value="verification" className={"data-[state=active]:bg-gray-700 ".concat(isMobile
            ? 'text-xs px-2 py-2'
            : '')}>
              {isMobile ? 'Verify' : 'Verification'}
            </TabsTrigger>
            {!isMobile && (<>
                <TabsTrigger value="redeem" className="data-[state=active]:bg-gray-700">
                  Redeem Codes
                </TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-gray-700">
                  Security
                </TabsTrigger>
                <TabsTrigger value="account" className="data-[state=active]:bg-gray-700">
                  Account Details
                </TabsTrigger>
              </>)}
          </TabsList>

          {/* Mobile: Second row of tabs */}
          {isMobile && (<TabsList className="grid w-full grid-cols-3 gap-1 p-1 bg-gray-800 border-gray-700 -mt-4">
              <TabsTrigger value="redeem" className="data-[state=active]:bg-gray-700 text-xs px-2 py-2">
                Redeem
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-gray-700 text-xs px-2 py-2">
                Security
              </TabsTrigger>
              <TabsTrigger value="account" className="data-[state=active]:bg-gray-700 text-xs px-2 py-2">
                Account
              </TabsTrigger>
            </TabsList>)}

          {/* Profile Information Tab */}
          <TabsContent value="profile">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className={isMobile ? "p-4" : ""}>
                <div className={"flex items-center justify-between ".concat(isMobile ? 'flex-col space-y-3' : '')}>
                  <div className={isMobile ? 'text-center' : ''}>
                    <CardTitle className={"text-white ".concat(isMobile ? 'text-lg' : '')}>Profile Information</CardTitle>
                    <CardDescription className={"text-gray-400 ".concat(isMobile ? 'text-sm' : '')}>
                      Update your personal information and contact details
                    </CardDescription>
                  </div>
                  <Button variant={isEditing ? "outline" : "default"} onClick={function () { return setIsEditing(!isEditing); }} className={"".concat(isEditing ? "border-gray-600" : "", " ").concat(isMobile ? 'w-full' : '')} size={isMobile ? "sm" : "default"}>
                    <Settings className="w-4 h-4 mr-2"/>
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className={"space-y-6 ".concat(isMobile ? 'p-4' : '')}>
                {/* Profile Picture Section - Mobile optimized */}
                <div className={"flex items-center ".concat(isMobile ? 'flex-col text-center space-y-3' : 'space-x-4')}>
                  <div className="relative">
                    <div className={"bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center ".concat(isMobile ? 'w-16 h-16' : 'w-20 h-20')}>
                      <User className={"text-white ".concat(isMobile ? 'w-6 h-6' : 'w-8 h-8')}/>
                    </div>
                    {isEditing && (<Button size="sm" className={"absolute -bottom-2 -right-2 rounded-full p-0 ".concat(isMobile ? 'h-6 w-6' : 'h-8 w-8')} disabled>
                        <Camera className={"".concat(isMobile ? 'w-3 h-3' : 'w-4 h-4')}/>
                      </Button>)}
                  </div>
                  <div className="min-w-0 max-w-full">
                    <h3 className={"font-semibold text-white ".concat(isMobile ? 'text-base' : 'text-lg', " break-words")}>
                      {(user === null || user === void 0 ? void 0 : user.firstName) && (user === null || user === void 0 ? void 0 : user.lastName)
            ? "".concat(user.firstName, " ").concat(user.lastName)
            : (user === null || user === void 0 ? void 0 : user.username) && user.username.startsWith('0x') && user.username.length > 20
                ? "".concat(user.username.slice(0, 6), "...").concat(user.username.slice(-4))
                : (user === null || user === void 0 ? void 0 : user.username) || 'User'}
                    </h3>
                    <p className={"text-gray-400 ".concat(isMobile ? 'text-xs' : 'text-sm', " break-all max-w-full overflow-hidden")}>
                      @{(user === null || user === void 0 ? void 0 : user.username) && user.username.startsWith('0x') && user.username.length > 20
            ? "".concat(user.username.slice(0, 6), "...").concat(user.username.slice(-4))
            : user === null || user === void 0 ? void 0 : user.username}
                    </p>
                    <Badge variant="secondary" className={"mt-1 ".concat(isMobile ? 'text-xs' : '')}>
                      {(user === null || user === void 0 ? void 0 : user.role) === 'admin' ? 'Administrator' : 'User'}
                    </Badge>
                  </div>
                </div>

                <Separator className="bg-gray-700"/>

                {/* Form Fields - Mobile optimized */}
                <div className={"grid gap-6 ".concat(isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2')}>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-300">Username</Label>
                    <Input id="username" value={formData.username} onChange={function (e) { return handleInputChange('username', e.target.value); }} disabled={!isEditing} className="bg-gray-700 border-gray-600 text-white disabled:opacity-50"/>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={function (e) { return handleInputChange('email', e.target.value); }} disabled={!isEditing} className="bg-gray-700 border-gray-600 text-white disabled:opacity-50"/>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                    <Input id="firstName" value={formData.firstName} onChange={function (e) { return handleInputChange('firstName', e.target.value); }} disabled={!isEditing} className="bg-gray-700 border-gray-600 text-white disabled:opacity-50"/>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                    <Input id="lastName" value={formData.lastName} onChange={function (e) { return handleInputChange('lastName', e.target.value); }} disabled={!isEditing} className="bg-gray-700 border-gray-600 text-white disabled:opacity-50"/>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                    <div className="flex gap-2">
                      <Select value={formData.phoneCountryCode} onValueChange={function (value) { return handleInputChange('phoneCountryCode', value); }} disabled={!isEditing}>
                        <SelectTrigger className="w-[140px] bg-gray-700 border-gray-600 text-white disabled:opacity-50">
                          <SelectValue placeholder="Code"/>
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 max-h-[300px]">
                          {COUNTRY_CODES.map(function (country) { return (<SelectItem key={country.code} value={country.code} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                              <span className="flex items-center gap-2">
                                <span>{country.flag}</span>
                                <span>{country.code}</span>
                                <span className="text-gray-400 text-xs">{country.country}</span>
                              </span>
                            </SelectItem>); })}
                        </SelectContent>
                      </Select>
                      <Input id="phone" value={formData.phone} onChange={function (e) { return handleInputChange('phone', e.target.value); }} disabled={!isEditing} className="flex-1 bg-gray-700 border-gray-600 text-white disabled:opacity-50" placeholder="Enter phone number"/>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-gray-300">Withdrawal Address</Label>
                    <Input id="address" value={formData.address} onChange={function (e) { return handleInputChange('address', e.target.value); }} disabled={!isEditing} className="bg-gray-700 border-gray-600 text-white disabled:opacity-50" placeholder="Enter withdrawal address"/>
                  </div>
                </div>

                {isEditing && (<div className="flex justify-end space-x-3">
                    <Button variant="outline" onClick={function () { return setIsEditing(false); }} className="border-gray-600">
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending} className="bg-purple-600 hover:bg-purple-700">
                      <Save className="w-4 h-4 mr-2"/>
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>)}
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
                {process.env.NODE_ENV === 'development' && (<div className="p-3 bg-gray-900/50 border border-gray-600 rounded text-xs text-gray-400">
                    <strong>Debug Info:</strong> hasPassword: {String(user === null || user === void 0 ? void 0 : user.hasPassword)},
                    walletAddress: {(user === null || user === void 0 ? void 0 : user.walletAddress) ? 'Yes' : 'No'},
                    isGmail: {((_a = user === null || user === void 0 ? void 0 : user.email) === null || _a === void 0 ? void 0 : _a.includes('@gmail.com')) ? 'Yes' : 'No'}
                  </div>)}

                {/* Password Status Information */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-600/20 rounded-lg">
                        <Shield className="w-6 h-6 text-gray-400"/>
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
                      {(user === null || user === void 0 ? void 0 : user.walletAddress) && (<div className="p-4 bg-green-900/20 border border-green-600/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <h3 className="text-green-400 font-medium">MetaMask Connected</h3>
                          </div>
                          <p className="text-green-300 text-sm">
                            Wallet: {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                          </p>
                        </div>)}

                      {/* Google Status */}
                      {((_b = user === null || user === void 0 ? void 0 : user.email) === null || _b === void 0 ? void 0 : _b.includes('@gmail.com')) && (<div className="p-4 bg-blue-900/20 border border-blue-600/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <h3 className="text-blue-400 font-medium">Google Connected</h3>
                          </div>
                          <p className="text-blue-300 text-sm">
                            Email: {user.email}
                          </p>
                        </div>)}

                      {/* Password Status */}
                      <div className={"p-4 border rounded-lg ".concat((user === null || user === void 0 ? void 0 : user.hasPassword)
            ? 'bg-green-900/20 border-green-600/50'
            : 'bg-yellow-900/20 border-yellow-600/50')}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={"w-2 h-2 rounded-full ".concat((user === null || user === void 0 ? void 0 : user.hasPassword) ? 'bg-green-400' : 'bg-yellow-400')}></div>
                          <h3 className={"font-medium ".concat((user === null || user === void 0 ? void 0 : user.hasPassword) ? 'text-green-400' : 'text-yellow-400')}>
                            {(user === null || user === void 0 ? void 0 : user.hasPassword) ? 'Password Set' : 'No Password'}
                          </h3>
                        </div>
                        <p className={"text-sm ".concat((user === null || user === void 0 ? void 0 : user.hasPassword) ? 'text-green-300' : 'text-yellow-300')}>
                          {(user === null || user === void 0 ? void 0 : user.hasPassword)
            ? 'You can log in with username/password'
            : 'Username/password login not available'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Set Login Password for Verified Users Without Password */}
                {!(user === null || user === void 0 ? void 0 : user.hasPassword) && (user === null || user === void 0 ? void 0 : user.verificationStatus) === 'verified' && (<Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-600/50">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-600/20 rounded-lg">
                          <Shield className="w-6 h-6 text-purple-400"/>
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
                          <li>• Access your account without {(user === null || user === void 0 ? void 0 : user.walletAddress) ? 'MetaMask' : 'Google'}</li>
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
                            <li className={"flex items-center gap-2 ".concat(formData.newPassword.length >= 6 ? 'text-green-400' : '')}>
                              {formData.newPassword.length >= 6 ? '✓' : '•'} At least 6 characters
                            </li>
                            <li className={"flex items-center gap-2 ".concat(formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword ? 'text-green-400' : '')}>
                              {formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword ? '✓' : '•'} Passwords match
                            </li>
                            <li className="flex items-center gap-2 text-blue-400">
                              ℹ️ No current password required (this is your first password)
                            </li>
                          </ul>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="newPasswordVerification" className="text-gray-300">Create Your Password</Label>
                          <Input id="newPasswordVerification" type="password" value={formData.newPassword} onChange={function (e) { return handleInputChange('newPassword', e.target.value); }} className="bg-gray-700 border-gray-600 text-white" placeholder="Enter your new password (minimum 6 characters)"/>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPasswordVerification" className="text-gray-300">Confirm Your Password</Label>
                          <Input id="confirmPasswordVerification" type="password" value={formData.confirmPassword} onChange={function (e) { return handleInputChange('confirmPassword', e.target.value); }} className="bg-gray-700 border-gray-600 text-white" placeholder="Confirm your new password"/>
                        </div>

                        {/* Real-time validation feedback */}
                        {formData.newPassword && (<div className="space-y-2">
                            {formData.newPassword.length < 6 && (<p className="text-yellow-400 text-sm flex items-center gap-2">
                                ⚠️ Password must be at least 6 characters
                              </p>)}
                            {formData.newPassword.length >= 6 && (<p className="text-green-400 text-sm flex items-center gap-2">
                                ✓ Password length is good
                              </p>)}
                            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (<p className="text-red-400 text-sm flex items-center gap-2">
                                ✗ Passwords don't match
                              </p>)}
                            {formData.confirmPassword && formData.newPassword === formData.confirmPassword && formData.newPassword.length >= 6 && (<p className="text-green-400 text-sm flex items-center gap-2">
                                ✓ Passwords match - ready to set!
                              </p>)}
                          </div>)}

                        <Button onClick={function () {
                var _a, _b;
                console.log('🔐 Setting password for verified user:', {
                    hasPassword: user === null || user === void 0 ? void 0 : user.hasPassword,
                    verificationStatus: user === null || user === void 0 ? void 0 : user.verificationStatus,
                    newPasswordLength: (_a = formData.newPassword) === null || _a === void 0 ? void 0 : _a.length,
                    confirmPasswordLength: (_b = formData.confirmPassword) === null || _b === void 0 ? void 0 : _b.length
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
            }} disabled={changePasswordMutation.isPending ||
                !formData.newPassword ||
                !formData.confirmPassword ||
                formData.newPassword !== formData.confirmPassword ||
                formData.newPassword.length < 6} className="w-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50">
                          <Shield className="w-4 h-4 mr-2"/>
                          {changePasswordMutation.isPending ? "Setting Password..." : "Set My First Login Password"}
                        </Button>

                        {/* Success Preview */}
                        {formData.newPassword && formData.confirmPassword && formData.newPassword === formData.confirmPassword && formData.newPassword.length >= 6 && (<div className="p-3 bg-green-900/20 border border-green-600/50 rounded-lg">
                            <p className="text-green-300 text-sm">
                              🎉 Once set, you'll be able to log in with:
                            </p>
                            <ul className="text-green-400 text-sm mt-2 space-y-1">
                              <li>• Username: {(user === null || user === void 0 ? void 0 : user.username) || 'Your username'}</li>
                              <li>• Password: (the password you're creating)</li>
                              <li>• Plus your existing {(user === null || user === void 0 ? void 0 : user.walletAddress) ? 'MetaMask' : 'Google'} login</li>
                            </ul>
                          </div>)}
                      </div>
                    </CardContent>
                  </Card>)}

                {/* Mobile Verification Refresh Notice */}
                {isMobile && (user === null || user === void 0 ? void 0 : user.verificationStatus) !== 'verified' && (<div className="p-4 bg-blue-900/30 border border-blue-600/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-blue-100 font-medium mb-1">📱 Mobile Verification Status</h3>
                        <p className="text-blue-200 text-sm">
                          If you were verified on desktop, tap refresh to sync your status
                        </p>
                      </div>
                      <Button onClick={forceRefreshVerification} disabled={isRefreshing} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        {isRefreshing ? (<RefreshCw className="w-4 h-4 animate-spin"/>) : (<>
                            <RefreshCw className="w-4 h-4 mr-1"/>
                            Refresh
                          </>)}
                      </Button>
                    </div>
                  </div>)}



                {/* Alternative Password Setting for Non-Verified Users */}
                {!(user === null || user === void 0 ? void 0 : user.hasPassword) && (user === null || user === void 0 ? void 0 : user.verificationStatus) !== 'verified' && (<Card className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border-orange-600/50">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-600/20 rounded-lg">
                          <Shield className="w-6 h-6 text-orange-400"/>
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
                            <Input id="newPasswordAlt" type={showPassword ? "text" : "password"} value={formData.newPassword} onChange={function (e) { return handleInputChange('newPassword', e.target.value); }} className="bg-gray-700 border-gray-600 text-white pr-10" placeholder="Enter your new password"/>
                            <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={function () { return setShowPassword(!showPassword); }}>
                              {showPassword ? (<EyeOff className="h-4 w-4 text-gray-400"/>) : (<Eye className="h-4 w-4 text-gray-400"/>)}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPasswordAlt" className="text-gray-300">Confirm Password</Label>
                          <Input id="confirmPasswordAlt" type={showPassword ? "text" : "password"} value={formData.confirmPassword} onChange={function (e) { return handleInputChange('confirmPassword', e.target.value); }} className="bg-gray-700 border-gray-600 text-white" placeholder="Confirm your new password"/>
                        </div>

                        <Button onClick={function () {
                var _a, _b;
                console.log('🔐 Setting password for non-verified user:', {
                    hasPassword: user === null || user === void 0 ? void 0 : user.hasPassword,
                    verificationStatus: user === null || user === void 0 ? void 0 : user.verificationStatus,
                    newPasswordLength: (_a = formData.newPassword) === null || _a === void 0 ? void 0 : _a.length,
                    confirmPasswordLength: (_b = formData.confirmPassword) === null || _b === void 0 ? void 0 : _b.length
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
            }} disabled={changePasswordMutation.isPending ||
                !formData.newPassword ||
                !formData.confirmPassword} className="w-full bg-orange-600 hover:bg-orange-700">
                          <Shield className="w-4 h-4 mr-2"/>
                          {changePasswordMutation.isPending ? "Setting Password..." : "Set Password"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>)}

                {/* Verification Status */}
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-medium">Verification Status</h3>
                      <Button size="sm" variant="ghost" onClick={forceRefreshVerification} disabled={isRefreshing} className="h-6 w-6 p-0 text-gray-400 hover:text-white">
                        <RefreshCw className={"w-3 h-3 ".concat(isRefreshing ? 'animate-spin' : '')}/>
                      </Button>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {(user === null || user === void 0 ? void 0 : user.verificationStatus) === 'verified' ? 'Your account is verified' :
            (user === null || user === void 0 ? void 0 : user.verificationStatus) === 'pending' ? 'Verification pending review' :
                (user === null || user === void 0 ? void 0 : user.verificationStatus) === 'rejected' ? 'Verification rejected' :
                    'Account not verified'}
                    </p>
                  </div>
                  <Badge variant={(user === null || user === void 0 ? void 0 : user.verificationStatus) === 'verified' ? 'default' :
            (user === null || user === void 0 ? void 0 : user.verificationStatus) === 'pending' ? 'secondary' :
                (user === null || user === void 0 ? void 0 : user.verificationStatus) === 'rejected' ? 'destructive' :
                    'outline'} className={(user === null || user === void 0 ? void 0 : user.verificationStatus) === 'verified' ? 'bg-green-600' :
            (user === null || user === void 0 ? void 0 : user.verificationStatus) === 'pending' ? 'bg-yellow-600' :
                (user === null || user === void 0 ? void 0 : user.verificationStatus) === 'rejected' ? 'bg-red-600' :
                    'bg-gray-600'}>
                    {(user === null || user === void 0 ? void 0 : user.verificationStatus) === 'verified' ? '✓ Verified' :
            (user === null || user === void 0 ? void 0 : user.verificationStatus) === 'pending' ? '⏳ Pending' :
                (user === null || user === void 0 ? void 0 : user.verificationStatus) === 'rejected' ? '✗ Rejected' :
                    '⚠ Unverified'}
                  </Badge>
                </div>

                {/* Upload Section */}
                {(user === null || user === void 0 ? void 0 : user.verificationStatus) !== 'verified' && (<div className="space-y-4 p-4 bg-gray-700 rounded-lg">
                    <h3 className="text-white font-medium">Upload Verification Document</h3>
                    <p className="text-gray-400 text-sm">
                      Please upload a clear photo of your ID card, driver's license, or passport.
                      This is required for trading and withdrawals.
                    </p>

                    {/* Document Type Selection */}
                    <div className="space-y-2">
                      <Label className="text-gray-300">Document Type</Label>
                      <select value={documentType} onChange={function (e) { return setDocumentType(e.target.value); }} className="w-full bg-gray-800 border border-gray-600 text-white rounded-md px-3 py-2">
                        <option value="id_card">ID Card</option>
                        <option value="driver_license">Driver's License</option>
                        <option value="passport">Passport</option>
                      </select>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                      <Label className="text-gray-300">Document File</Label>
                      <div className={"border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-purple-500 transition-colors ".concat(selectedFile ? 'border-green-500 bg-green-500/10' : 'border-gray-600')} onClick={function () { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }}>
                        {selectedFile ? (<div className="flex items-center justify-center space-x-2">
                            <CheckCircle className="w-6 h-6 text-green-500"/>
                            <span className="text-green-400 text-sm">{selectedFile.name}</span>
                          </div>) : (<>
                            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2"/>
                            <p className="text-gray-400 text-sm">Click to upload document</p>
                            <p className="text-gray-500 text-xs mt-1">JPEG, PNG, PDF (max 5MB)</p>
                          </>)}
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/jpg,application/pdf" onChange={handleFileSelect} className="hidden"/>
                    </div>

                    {/* Upload Button */}
                    <Button onClick={handleDocumentUpload} disabled={!selectedFile || isUploading || uploadDocumentMutation.isPending} className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50">
                      <Upload className="w-4 h-4 mr-2"/>
                      {isUploading || uploadDocumentMutation.isPending ? 'Uploading...' : 'Upload Document'}
                    </Button>
                  </div>)}

                {/* Trading Restrictions */}
                {(user === null || user === void 0 ? void 0 : user.verificationStatus) !== 'verified' && (<div className="p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                    <h3 className="text-yellow-400 font-medium mb-2">⚠ Account Restrictions</h3>
                    <ul className="text-yellow-300 text-sm space-y-1">
                      <li>• Trading is disabled until verification is complete</li>
                      <li>• Withdrawals are not available</li>
                      <li>• Some features may be limited</li>
                    </ul>
                  </div>)}
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
                    <Input value={redeemCode} onChange={function (e) { return setRedeemCode(e.target.value.toUpperCase()); }} placeholder="Enter redeem code (e.g., FIRSTBONUS)" className="bg-gray-900 border-gray-600 text-white flex-1" onKeyPress={function (e) {
            if (e.key === 'Enter' && redeemCode.trim() && !isRedeeming) {
                handleRedeemCode();
            }
        }}/>
                    <Button onClick={handleRedeemCode} disabled={isRedeeming || !redeemCode.trim()} className="bg-purple-600 hover:bg-purple-700">
                      {isRedeeming ? 'Redeeming...' : 'Redeem'}
                    </Button>
                  </div>

                  {/* Available Codes Hint */}
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <h3 className="text-white font-medium mb-2">💡 Available Codes</h3>
                    {availableCodes.length === 0 ? (<p className="text-gray-400 text-sm">Loading available codes...</p>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {availableCodes.map(function (codeInfo) {
                var isClaimed = codeInfo.isClaimed || false;
                return (<div key={codeInfo.code} className={"p-3 rounded border transition-colors ".concat(isClaimed
                        ? 'bg-gray-900 border-gray-700 opacity-60 cursor-not-allowed'
                        : 'bg-gray-800 border-gray-600 hover:border-purple-500 cursor-pointer')} onClick={function () {
                        if (!isClaimed) {
                            setRedeemCode(codeInfo.code);
                        }
                    }}>
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className={"font-mono font-bold ".concat(isClaimed ? 'text-gray-500' : 'text-purple-400')}>
                                    {codeInfo.code}
                                  </div>
                                  <div className={"font-semibold ".concat(isClaimed ? 'text-gray-500' : 'text-green-400')}>
                                    {codeInfo.amount}
                                  </div>
                                  <div className="text-gray-400 text-xs">{codeInfo.description}</div>
                                </div>
                                <Button size="sm" variant="outline" className={isClaimed
                        ? 'border-gray-600 text-gray-500 cursor-not-allowed'
                        : 'border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white'} onClick={function (e) {
                        e.stopPropagation();
                        if (!isClaimed) {
                            setRedeemCode(codeInfo.code);
                            setTimeout(function () { return handleRedeemCode(); }, 100);
                        }
                    }} disabled={isRedeeming || isClaimed}>
                                  {isClaimed ? 'Claimed' : 'Use'}
                                </Button>
                              </div>
                            </div>);
            })}
                      </div>)}
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
                <Separator className="bg-gray-600"/>
                <div className="space-y-4">
                  <h3 className="text-white font-medium">🔗 Your Referral Code</h3>
                  <div className="flex items-center space-x-3">
                    <Input value={(referralStats === null || referralStats === void 0 ? void 0 : referralStats.referralCode) || (referralStats === null ? 'Loading...' : 'Error loading code')} readOnly className="bg-gray-900 border-gray-600 text-white font-mono"/>
                    <Button onClick={function () {
            var codeToShare = (referralStats === null || referralStats === void 0 ? void 0 : referralStats.referralCode) || '';
            if (codeToShare && codeToShare !== 'Loading...' && codeToShare !== 'Error loading code') {
                navigator.clipboard.writeText(codeToShare);
                toast({ title: "Copied!", description: "Referral code copied to clipboard" });
            }
            else {
                toast({ title: "Error", description: "No referral code to copy", variant: "destructive" });
            }
        }} variant="outline" className="border-gray-600" disabled={!(referralStats === null || referralStats === void 0 ? void 0 : referralStats.referralCode) || referralStats.referralCode === 'Loading...' || referralStats.referralCode === 'Error loading code'}>
                      Copy
                    </Button>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Share this code with friends to earn referral bonuses!
                  </p>
                  {referralStats && (<p className="text-green-400 text-sm">
                      Total Referrals: {referralStats.totalReferrals || 0}
                    </p>)}
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
                  <Button onClick={function () {
            console.log('🔄 Manual refresh of user data');
            queryClient.removeQueries({ queryKey: ['/api/auth'] });
            queryClient.invalidateQueries({ queryKey: ['/api/auth'] });
            queryClient.refetchQueries({ queryKey: ['/api/auth'] });
            toast({
                title: "Refreshing User Data",
                description: "Updating password status...",
            });
        }} variant="outline" size="sm" className="text-blue-400 border-blue-600 hover:bg-blue-900/20">
                    <RefreshCw className="w-4 h-4 mr-2"/>
                    Refresh Status
                  </Button>

                  <Button onClick={function () { return __awaiter(_this, void 0, void 0, function () {
            var response, data, error_6;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch('/api/debug/password-status', {
                                headers: {
                                    'Authorization': "Bearer ".concat(localStorage.getItem('authToken'))
                                }
                            })];
                    case 1:
                        response = _c.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _c.sent();
                        console.log('🔍 Password Debug Data:', data);
                        toast({
                            title: "Debug Info",
                            description: "Password saved: ".concat(data.debug ? (((_a = data.supabaseData) === null || _a === void 0 ? void 0 : _a.hasPasswordHash) || ((_b = data.fileData) === null || _b === void 0 ? void 0 : _b.hasPasswordHash)) : 'Unknown'),
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _c.sent();
                        console.error('Debug error:', error_6);
                        toast({
                            title: "Debug Failed",
                            description: "Could not fetch debug info",
                            variant: "destructive"
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); }} variant="outline" size="sm" className="text-yellow-400 border-yellow-600 hover:bg-yellow-900/20">
                    🔍 Debug
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Debug logging for password status */}
                {console.log('🔍 Security Tab Debug - User Data:', {
            hasPassword: user === null || user === void 0 ? void 0 : user.hasPassword,
            passwordStatus: (user === null || user === void 0 ? void 0 : user.hasPassword) ? 'Password Set' : 'No Password',
            verificationStatus: user === null || user === void 0 ? void 0 : user.verificationStatus,
            walletAddress: user === null || user === void 0 ? void 0 : user.walletAddress,
            email: user === null || user === void 0 ? void 0 : user.email,
            userId: user === null || user === void 0 ? void 0 : user.id,
            username: user === null || user === void 0 ? void 0 : user.username
        })}

                {/* Check if user has a password set */}
                {(user === null || user === void 0 ? void 0 : user.hasPassword) ? (
        /* Traditional password change for users with existing passwords */
        <div className="space-y-4">
                    <div className="p-4 bg-green-900/20 border border-green-600/50 rounded-lg">
                      <h3 className="text-green-400 font-medium mb-2">🔐 Password Protection Enabled</h3>
                      <p className="text-green-300 text-sm mb-3">
                        Your account is secured with a password. You can change it below if needed.
                      </p>
                      <div className="flex items-center gap-2 text-green-400 text-sm">
                        <Shield className="w-4 h-4"/>
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
                        {(user === null || user === void 0 ? void 0 : user.walletAddress) && (<div className="flex items-center gap-2 text-green-400 text-sm">
                            ✓ MetaMask Wallet ({user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)})
                          </div>)}
                        {((_c = user === null || user === void 0 ? void 0 : user.email) === null || _c === void 0 ? void 0 : _c.includes('@gmail.com')) && (<div className="flex items-center gap-2 text-green-400 text-sm">
                            ✓ Google Account ({user.email})
                          </div>)}
                      </div>
                    </div>

                    {/* Password Change Form */}
                    <div className="p-4 bg-gray-800/50 border border-gray-600 rounded-lg">
                      <h4 className="text-white font-medium mb-4">Change Your Password</h4>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword" className="text-gray-300">Current Password</Label>
                          <div className="relative">
                            <Input id="currentPassword" type={showPassword ? "text" : "password"} value={formData.currentPassword} onChange={function (e) { return handleInputChange('currentPassword', e.target.value); }} className="bg-gray-700 border-gray-600 text-white pr-10" placeholder="Enter your current password"/>
                            <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={function () { return setShowPassword(!showPassword); }}>
                              {showPassword ? (<EyeOff className="h-4 w-4 text-gray-400"/>) : (<Eye className="h-4 w-4 text-gray-400"/>)}
                            </Button>
                          </div>
                          <p className="text-gray-400 text-xs">
                            This is the password you currently use to log in
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="newPasswordSecurity" className="text-gray-300">New Password</Label>
                          <Input id="newPasswordSecurity" type="password" value={formData.newPassword} onChange={function (e) { return handleInputChange('newPassword', e.target.value); }} className="bg-gray-700 border-gray-600 text-white" placeholder="Enter your new password (minimum 6 characters)"/>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPasswordSecurity" className="text-gray-300">Confirm New Password</Label>
                          <Input id="confirmPasswordSecurity" type="password" value={formData.confirmPassword} onChange={function (e) { return handleInputChange('confirmPassword', e.target.value); }} className="bg-gray-700 border-gray-600 text-white" placeholder="Confirm your new password"/>
                        </div>

                        {/* Real-time validation for password change */}
                        {formData.newPassword && (<div className="space-y-1">
                            {formData.newPassword.length < 6 && (<p className="text-yellow-400 text-sm flex items-center gap-2">
                                ⚠️ New password must be at least 6 characters
                              </p>)}
                            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (<p className="text-red-400 text-sm flex items-center gap-2">
                                ✗ New passwords don't match
                              </p>)}
                            {formData.confirmPassword && formData.newPassword === formData.confirmPassword && formData.newPassword.length >= 6 && (<p className="text-green-400 text-sm flex items-center gap-2">
                                ✓ New passwords match and meet requirements
                              </p>)}
                          </div>)}
                      </div>
                    </div>

                    <Button onClick={handleChangePassword} disabled={changePasswordMutation.isPending ||
                !formData.currentPassword ||
                !formData.newPassword ||
                !formData.confirmPassword} className="bg-purple-600 hover:bg-purple-700">
                      <Shield className="w-4 h-4 mr-2"/>
                      {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                    </Button>
                  </div>) : (
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
                              {(user === null || user === void 0 ? void 0 : user.walletAddress) ? "MetaMask Wallet (".concat(user.walletAddress.slice(0, 6), "...").concat(user.walletAddress.slice(-4), ")") : 'Google Account'}
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
                          ✓ Can log in with {(user === null || user === void 0 ? void 0 : user.walletAddress) ? 'MetaMask' : 'Google'}
                        </div>
                        <div className="flex items-center gap-2 text-blue-400 text-sm">
                          ℹ️ No "current password" to remember or enter
                        </div>
                      </div>
                    </div>

                    {/* Action needed */}
                    <div className="p-4 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-600/50 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <Shield className="w-5 h-5 text-purple-400"/>
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
                  </div>)}
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
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"/>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white break-words break-all text-sm leading-relaxed">{user === null || user === void 0 ? void 0 : user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"/>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-400">User ID</p>
                      <p className="text-white font-mono text-sm break-all leading-relaxed">{user === null || user === void 0 ? void 0 : user.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-400"/>
                    <div>
                      <p className="text-sm text-gray-400">Account Status</p>
                      <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator className="bg-gray-600"/>

                {/* Referral Code Section */}
                <div className="space-y-4">
                  <h3 className="text-white font-medium">Referral Code</h3>
                  <div className="flex items-center space-x-3">
                    <Input value={(referralStats === null || referralStats === void 0 ? void 0 : referralStats.referralCode) || (user === null || user === void 0 ? void 0 : user.referral_code) || (referralStats === null ? 'Loading...' : 'Error loading code')} readOnly className="bg-gray-900 border-gray-600 text-white font-mono"/>
                    <Button onClick={function () {
            var codeToShare = (referralStats === null || referralStats === void 0 ? void 0 : referralStats.referralCode) || (user === null || user === void 0 ? void 0 : user.referral_code) || '';
            if (codeToShare && codeToShare !== 'Loading...' && codeToShare !== 'Error loading code') {
                navigator.clipboard.writeText(codeToShare);
                toast({ title: "Copied!", description: "Referral code copied to clipboard" });
            }
            else {
                toast({ title: "Error", description: "No referral code to copy", variant: "destructive" });
            }
        }} variant="outline" className="border-gray-600" disabled={!(referralStats === null || referralStats === void 0 ? void 0 : referralStats.referralCode) && !(user === null || user === void 0 ? void 0 : user.referral_code)}>
                      Copy
                    </Button>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Share this code with friends to earn referral bonuses!
                  </p>
                  {referralStats && (<p className="text-green-400 text-sm">
                      Total Referrals: {referralStats.totalReferrals || 0}
                    </p>)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>);
}

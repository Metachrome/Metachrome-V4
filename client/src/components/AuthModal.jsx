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
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Separator } from "../components/ui/separator";
import { Eye, EyeOff } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useMetamask } from "../hooks/useMetamask";
import { useToast } from "../hooks/use-toast";
export default function AuthModal(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onClose = _a.onClose, type = _a.type, onSwitchType = _a.onSwitchType;
    var _b = useState(false), showPassword = _b[0], setShowPassword = _b[1];
    var _c = useState(false), showConfirmPassword = _c[0], setShowConfirmPassword = _c[1];
    var _d = useState({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        rememberMe: false,
        agreeTerms: false,
    }), formData = _d[0], setFormData = _d[1];
    var _e = useMetamask(), connectWallet = _e.connectWallet, isConnecting = _e.isConnecting;
    var toast = useToast().toast;
    var handleInputChange = function (field, value) {
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    };
    var handleMetamaskConnect = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, connectWallet()];
                case 1:
                    result = _a.sent();
                    if (result.success) {
                        toast({
                            title: "Success",
                            description: "Connected with Metamask successfully!",
                        });
                        onClose();
                        // Redirect to dashboard after successful connection
                        setTimeout(function () {
                            window.location.href = '/dashboard';
                        }, 500);
                    }
                    else {
                        toast({
                            title: "Error",
                            description: result.error || "Failed to connect with Metamask",
                            variant: "destructive",
                        });
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    toast({
                        title: "Error",
                        description: "An unexpected error occurred",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleSubmit = function (e) {
        e.preventDefault();
        if (type === "signup") {
            if (formData.password !== formData.confirmPassword) {
                toast({
                    title: "Error",
                    description: "Passwords do not match",
                    variant: "destructive",
                });
                return;
            }
            if (!formData.agreeTerms) {
                toast({
                    title: "Error",
                    description: "Please agree to the terms and conditions",
                    variant: "destructive",
                });
                return;
            }
        }
        // Handle traditional email/password authentication here
        toast({
            title: "Coming Soon",
            description: "Email authentication will be available soon. Please use Metamask for now.",
        });
    };
    return (<Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-dark-200 border-dark-100">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {type === "login" ? "Log In" : "Sign Up"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-muted-foreground">
            {type === "login"
            ? "Securely connect to your account"
            : "Join the community and unravel endless possibilities"}
          </p>

          {/* Social Login Options */}
          <div className="space-y-3">
            <Button variant="outline" className="w-full bg-dark-100 border-dark-100 hover:bg-dark-100/70" onClick={function () { return window.location.href = '/api/auth/google'; }}>
              <FaGoogle className="w-4 h-4 mr-3 text-red-500"/>
              Continue with Google
            </Button>

            <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={handleMetamaskConnect} disabled={isConnecting}>
              <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.8 3.8L13.2 10.4l1.6-3.8 7-2.8z" fill="#E17726"/>
                <path d="M2.2 3.8l8.5 6.7-1.5-3.9-7-2.8z" fill="#E27625"/>
                <path d="M18.8 16.2l-2.3 3.5 4.9 1.4 1.4-4.8-4-0.1z" fill="#E27625"/>
                <path d="M1.4 16.3l1.4 4.8 4.9-1.4-2.3-3.5-4 0.1z" fill="#E27625"/>
              </svg>
              {isConnecting ? "Connecting..." : "Continue with Metamask"}
            </Button>
          </div>

          <div className="relative">
            <Separator />
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-dark-200 px-3 text-sm text-muted-foreground">
              OR
            </span>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {type === "signup" && (<div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm text-muted-foreground">
                    First Name *
                  </Label>
                  <Input id="firstName" placeholder="Your First Name" value={formData.firstName} onChange={function (e) { return handleInputChange("firstName", e.target.value); }} className="input-dark mt-1" required/>
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm text-muted-foreground">
                    Last Name *
                  </Label>
                  <Input id="lastName" placeholder="Your Last Name" value={formData.lastName} onChange={function (e) { return handleInputChange("lastName", e.target.value); }} className="input-dark mt-1" required/>
                </div>
              </div>)}

            <div>
              <Label htmlFor="email" className="text-sm text-muted-foreground">
                {type === "login" ? "Username/Mobile/address/Email" : "E-Mail Address"} *
              </Label>
              <Input id="email" type="email" placeholder={type === "login" ? "Enter your Username/Wallet address/Email" : "Your email"} value={formData.email} onChange={function (e) { return handleInputChange("email", e.target.value); }} className="input-dark mt-1" required/>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm text-muted-foreground">
                  Password *
                </Label>
                {type === "login" && (<button type="button" className="text-sm text-primary hover:underline">
                    Forgot Password?
                  </button>)}
              </div>
              <div className="relative mt-1">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={formData.password} onChange={function (e) { return handleInputChange("password", e.target.value); }} className="input-dark pr-12" required/>
                <button type="button" onClick={function () { return setShowPassword(!showPassword); }} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>

            {type === "signup" && (<div>
                <Label htmlFor="confirmPassword" className="text-sm text-muted-foreground">
                  Confirm Password *
                </Label>
                <div className="relative mt-1">
                  <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Password Confirmation" value={formData.confirmPassword} onChange={function (e) { return handleInputChange("confirmPassword", e.target.value); }} className="input-dark pr-12" required/>
                  <button type="button" onClick={function () { return setShowConfirmPassword(!showConfirmPassword); }} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                  </button>
                </div>
              </div>)}

            {type === "login" ? (<div className="flex items-center space-x-2">
                <Checkbox id="rememberMe" checked={formData.rememberMe} onCheckedChange={function (checked) { return handleInputChange("rememberMe", checked); }}/>
                <Label htmlFor="rememberMe" className="text-sm text-muted-foreground">
                  Remember Me
                </Label>
              </div>) : (<div className="flex items-start space-x-2">
                <Checkbox id="agreeTerms" checked={formData.agreeTerms} onCheckedChange={function (checked) { return handleInputChange("agreeTerms", checked); }} className="mt-1"/>
                <Label htmlFor="agreeTerms" className="text-sm text-muted-foreground leading-relaxed">
                  I agree with{" "}
                  <a href="#" className="text-primary hover:underline">Privacy Policy</a>,{" "}
                  <a href="#" className="text-primary hover:underline">Terms of Service</a>,{" "}
                  <a href="#" className="text-primary hover:underline">Trade Policy</a>
                </Label>
              </div>)}

            <Button type="submit" className="btn-primary w-full">
              {type === "login" ? "Log In" : "Register"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {type === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={function () { return onSwitchType(type === "login" ? "signup" : "login"); }} className="text-primary hover:underline font-medium">
              {type === "login" ? "Sign up" : "Sign In"}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>);
}

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { Separator } from "../components/ui/separator";
import { Eye, EyeOff } from "lucide-react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { useMetamask } from "../hooks/useMetamask";
import { useToast } from "../hooks/use-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "login" | "signup";
  onSwitchType: (type: "login" | "signup") => void;
}

export default function AuthModal({ isOpen, onClose, type, onSwitchType }: AuthModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    rememberMe: false,
    agreeTerms: false,
  });

  const { connectWallet, isConnecting } = useMetamask();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMetamaskConnect = async () => {
    try {
      const result = await connectWallet();
      if (result.success) {
        toast({
          title: "Success",
          description: "Connected with Metamask successfully!",
        });
        onClose();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to connect with Metamask",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              : "Join the community and unravel endless possibilities"
            }
          </p>

          {/* Social Login Options */}
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full bg-dark-100 border-dark-100 hover:bg-dark-100/70"
              disabled
            >
              <FaGoogle className="w-4 h-4 mr-3 text-red-500" />
              Continue with Google
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full bg-dark-100 border-dark-100 hover:bg-dark-100/70"
              disabled
            >
              <FaFacebook className="w-4 h-4 mr-3 text-blue-500" />
              Continue with Facebook
            </Button>
            
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={handleMetamaskConnect}
              disabled={isConnecting}
            >
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
            {type === "signup" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm text-muted-foreground">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="Your First Name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="input-dark mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm text-muted-foreground">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Your Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="input-dark mt-1"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-sm text-muted-foreground">
                {type === "login" ? "Username/Mobile/address/Email" : "E-Mail Address"} *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={type === "login" ? "Enter your Username/Wallet address/Email" : "Your email"}
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="input-dark mt-1"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm text-muted-foreground">
                  Password *
                </Label>
                {type === "login" && (
                  <button type="button" className="text-sm text-primary hover:underline">
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="input-dark pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {type === "signup" && (
              <div>
                <Label htmlFor="confirmPassword" className="text-sm text-muted-foreground">
                  Confirm Password *
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Password Confirmation"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="input-dark pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {type === "login" ? (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
                />
                <Label htmlFor="rememberMe" className="text-sm text-muted-foreground">
                  Remember Me
                </Label>
              </div>
            ) : (
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeTerms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) => handleInputChange("agreeTerms", checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="agreeTerms" className="text-sm text-muted-foreground leading-relaxed">
                  I agree with{" "}
                  <a href="#" className="text-primary hover:underline">Privacy Policy</a>,{" "}
                  <a href="#" className="text-primary hover:underline">Terms of Service</a>,{" "}
                  <a href="#" className="text-primary hover:underline">Trade Policy</a>
                </Label>
              </div>
            )}

            <Button type="submit" className="btn-primary w-full">
              {type === "login" ? "Log In" : "Register"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {type === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => onSwitchType(type === "login" ? "signup" : "login")}
              className="text-primary hover:underline font-medium"
            >
              {type === "login" ? "Sign up" : "Sign In"}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Lock, Shield } from "lucide-react";
export default function AdminStaffLogin() {
    var _this = this;
    var _a = useLocation(), setLocation = _a[1];
    var toast = useToast().toast;
    var _b = useAuth(), user = _b.user, adminLogin = _b.adminLogin, isAdminLoginPending = _b.isAdminLoginPending;
    // Clear any existing non-admin sessions when component mounts
    useEffect(function () {
        var authToken = localStorage.getItem('authToken');
        var storedUser = localStorage.getItem('user');
        // If there's a demo token or non-admin user, clear it
        if (authToken && (authToken.startsWith('demo-token-') ||
            (storedUser && JSON.parse(storedUser).role === 'user'))) {
            console.log('🔧 Clearing non-admin session for admin staff login');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('demoUser');
        }
    }, []);
    // Check authentication status and handle accordingly
    useEffect(function () {
        if (user) {
            // If user is already authenticated as admin (not superadmin), redirect
            if (user.role === 'admin') {
                console.log('🔧 Admin staff already authenticated, redirecting...');
                setLocation('/admin-staff/dashboard');
            }
            else if (user.role === 'super_admin' || user.role === 'superadmin') {
                // Superadmin should not use this login page
                console.log('🔧 Superadmin detected, redirecting to superadmin dashboard');
                setLocation('/admin/dashboard');
            }
            else {
                // If user is authenticated but not as admin, clear the session
                console.log('🔧 Non-admin user detected, clearing session for admin staff login');
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                localStorage.removeItem('demoUser');
                window.location.reload();
            }
        }
    }, [user, setLocation]);
    var form = useForm({
        defaultValues: {
            username: "",
            password: "",
        },
    });
    var onSubmit = function (data) { return __awaiter(_this, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, adminLogin(data)];
                case 1:
                    result = _a.sent();
                    console.log('🔧 Admin staff login result:', result);
                    // Check if the logged in user is actually an admin (not superadmin)
                    if (result && result.user && result.user.role === 'admin') {
                        toast({
                            title: "Login Successful",
                            description: "Welcome back, ".concat(data.username, "!"),
                        });
                        // Store user data and redirect
                        localStorage.setItem('authToken', result.token);
                        localStorage.setItem('user', JSON.stringify(result.user));
                        console.log('🔧 Stored admin staff data:', result.user);
                        setTimeout(function () {
                            window.location.href = '/admin-staff/dashboard';
                        }, 1000);
                    }
                    else if (result && result.user && (result.user.role === 'super_admin' || result.user.role === 'superadmin')) {
                        // Superadmin trying to login via admin staff page
                        toast({
                            title: "Access Denied",
                            description: "Please use the superadmin login page.",
                            variant: "destructive"
                        });
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('user');
                    }
                    else {
                        toast({
                            title: "Login Failed",
                            description: "Invalid admin credentials",
                            variant: "destructive"
                        });
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('🔧 Admin staff login error:', error_1);
                    toast({
                        title: "Login Failed",
                        description: error_1.message || "Invalid credentials",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-gray-800 border-purple-500">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full">
                <Shield className="w-8 h-8 text-white"/>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">Admin Staff Login</CardTitle>
            <CardDescription className="text-gray-400">
              Sign in to access the admin control panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="username" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel className="text-white">Username</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter your username" className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>

                <FormField control={form.control} name="password" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel className="text-white">Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" placeholder="Enter your password" className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>

                <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" disabled={isAdminLoginPending}>
                  {isAdminLoginPending ? (<>
                      <Lock className="mr-2 h-4 w-4 animate-spin"/>
                      Signing In...
                    </>) : (<>
                      <Lock className="mr-2 h-4 w-4"/>
                      Sign In as Admin
                    </>)}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>);
}

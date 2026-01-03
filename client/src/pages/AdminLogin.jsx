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
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from 'wouter';
import { Lock, Shield } from 'lucide-react';
var loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});
export default function AdminLogin() {
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
            console.log('🔧 Clearing non-admin session for admin login');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('demoUser');
        }
    }, []);
    // Check authentication status and handle accordingly
    useEffect(function () {
        if (user) {
            // If user is already authenticated as admin, redirect
            if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'superadmin') {
                console.log('🔧 User already authenticated as admin, redirecting...');
                setLocation('/admin');
            }
            else {
                // If user is authenticated but not as admin, clear the session
                console.log('🔧 Non-admin user detected, clearing session for admin login');
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                localStorage.removeItem('demoUser');
                // Force a page reload to clear the auth state
                window.location.reload();
            }
        }
    }, [user, setLocation]);
    var form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: '',
            password: '',
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
                    console.log('🔧 Login result:', result);
                    toast({
                        title: "Login Successful",
                        description: "Welcome back, ".concat(data.username, "!"),
                    });
                    // Store user data manually and force redirect
                    if (result && result.user) {
                        localStorage.setItem('authToken', result.token);
                        localStorage.setItem('user', JSON.stringify(result.user));
                        console.log('🔧 Stored user data:', result.user);
                        // Force a page reload to ensure auth state is updated
                        console.log('🔧 Forcing page reload to update auth state...');
                        setTimeout(function () {
                            window.location.href = '/admin/dashboard';
                        }, 1000);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    toast({
                        title: "Login Failed",
                        description: error_1.message || "Invalid admin credentials",
                        variant: "destructive",
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (<div className="bg-gray-900 flex items-center justify-center px-4 py-8 w-full" style={{ minHeight: '100vh' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Shield className="text-white w-6 h-6"/>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          <p className="text-gray-400 mt-2">Access the METACHROME admin dashboard</p>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Sign In</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your admin credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
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
                      Sign In
                    </>)}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>);
}

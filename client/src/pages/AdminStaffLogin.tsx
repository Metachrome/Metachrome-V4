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

type LoginForm = {
  username: string;
  password: string;
};

export default function AdminStaffLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, adminLogin, isAdminLoginPending } = useAuth();

  // Clear any existing non-admin sessions when component mounts
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

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
  useEffect(() => {
    if (user) {
      // If user is already authenticated as admin (not superadmin), redirect
      if (user.role === 'admin') {
        console.log('🔧 Admin staff already authenticated, redirecting...');
        setLocation('/admin-staff/dashboard');
      } else if (user.role === 'super_admin' || user.role === 'superadmin') {
        // Superadmin should not use this login page
        console.log('🔧 Superadmin detected, redirecting to superadmin dashboard');
        setLocation('/admin/dashboard');
      } else {
        // If user is authenticated but not as admin, clear the session
        console.log('🔧 Non-admin user detected, clearing session for admin staff login');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('demoUser');
        window.location.reload();
      }
    }
  }, [user, setLocation]);

  const form = useForm<LoginForm>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await adminLogin(data);
      console.log('🔧 Admin staff login result:', result);

      // Check if the logged in user is actually an admin (not superadmin)
      if (result && result.user && result.user.role === 'admin') {
        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.username}!`,
        });

        // Store user data and redirect
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        console.log('🔧 Stored admin staff data:', result.user);

        setTimeout(() => {
          window.location.href = '/admin-staff/dashboard';
        }, 1000);
      } else if (result && result.user && (result.user.role === 'super_admin' || result.user.role === 'superadmin')) {
        // Superadmin trying to login via admin staff page
        toast({
          title: "Access Denied",
          description: "Please use the superadmin login page.",
          variant: "destructive"
        });
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid admin credentials",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('🔧 Admin staff login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-gray-800 border-purple-500">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full">
                <Shield className="w-8 h-8 text-white" />
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
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Username</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your username"
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="Enter your password"
                          className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={isAdminLoginPending}
                >
                  {isAdminLoginPending ? (
                    <>
                      <Lock className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Sign In as Admin
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


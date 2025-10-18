import { useState, useEffect } from 'react';
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

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLogin() {
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
      console.log('🔧 Clearing non-admin session for admin login');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('demoUser');
    }
  }, []);

  // Check authentication status and handle accordingly
  useEffect(() => {
    if (user) {
      // If user is already authenticated as admin, redirect
      if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'superadmin') {
        console.log('🔧 User already authenticated as admin, redirecting...');
        setLocation('/admin');
      } else {
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

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await adminLogin(data);
      console.log('🔧 Login result:', result);

      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.username}!`,
      });

      // Store user data manually and force redirect
      if (result && result.user) {
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        console.log('🔧 Stored user data:', result.user);

        // Force a page reload to ensure auth state is updated
        console.log('🔧 Forcing page reload to update auth state...');
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 1000);
      }

    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid admin credentials",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Shield className="text-white w-6 h-6" />
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
                      Sign In
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
import { Button } from '../components/ui/button';
import { useAuth } from '../hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '../hooks/use-toast';
import { useLocation } from 'wouter';
import { LogOut, User } from 'lucide-react';

export function AdminHeader() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/auth/admin/logout');
    },
    onSuccess: () => {
      // Clear all auth-related data
      queryClient.setQueryData(['/api/auth/user'], null);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });

      // Redirect to login
      setLocation('/admin/login');
    },
    onError: (error: Error) => {
      console.error('Admin logout error:', error);

      // Even if logout fails, clear local state and redirect
      queryClient.setQueryData(['/api/auth/user'], null);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');

      toast({
        title: "Logged Out",
        description: "You have been logged out (forced)",
      });

      setLocation('/admin/login');
    },
  });

  if (!user) return null;

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm">METACHROME Control Panel</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-300">
            <User className="w-4 h-4" />
            <span className="text-sm">{user.username}</span>
            <span className="text-xs bg-purple-600 px-2 py-1 rounded">{user.role}</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="text-gray-300 border-gray-600 hover:bg-gray-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </div>
    </div>
  );
}
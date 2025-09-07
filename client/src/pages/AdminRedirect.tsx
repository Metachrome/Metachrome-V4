import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

export default function AdminRedirect() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Check if we have a valid token
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    
    console.log('🔧 AdminRedirect - Token:', !!token);
    console.log('🔧 AdminRedirect - User:', userStr);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('🔧 AdminRedirect - Parsed user:', user);
        
        if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'superadmin') {
          console.log('🔧 AdminRedirect - Valid admin, redirecting to dashboard');
          setLocation('/admin/dashboard');
        } else {
          console.log('🔧 AdminRedirect - Not admin, redirecting to login');
          setLocation('/admin/login');
        }
      } catch (error) {
        console.error('🔧 AdminRedirect - Error parsing user:', error);
        setLocation('/admin/login');
      }
    } else {
      console.log('🔧 AdminRedirect - No token/user, redirecting to login');
      setLocation('/admin/login');
    }
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
        <p className="text-gray-400">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}

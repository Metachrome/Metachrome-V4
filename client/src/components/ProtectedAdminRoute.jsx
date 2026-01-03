import { useAuth } from '../hooks/useAuth';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
export function ProtectedAdminRoute(_a) {
    var children = _a.children;
    var _b = useAuth(), user = _b.user, isLoading = _b.isLoading;
    var _c = useLocation(), setLocation = _c[1];
    console.log('🔐 ProtectedAdminRoute - User:', user);
    console.log('🔐 ProtectedAdminRoute - isLoading:', isLoading);
    useEffect(function () {
        console.log('🔐 ProtectedAdminRoute useEffect - User:', user, 'isLoading:', isLoading);
        if (!isLoading && (!user || (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'superadmin'))) {
            console.log('🔐 Redirecting to admin login - no valid admin user');
            setLocation('/admin/login');
        }
    }, [user, isLoading, setLocation]);
    if (isLoading) {
        console.log('🔐 ProtectedAdminRoute - Still loading...');
        return (<div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4"/>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>);
    }
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'superadmin')) {
        console.log('🔐 ProtectedAdminRoute - No valid admin user, returning null');
        return null;
    }
    console.log('🔐 ProtectedAdminRoute - Valid admin user, rendering children');
    return <>{children}</>;
}

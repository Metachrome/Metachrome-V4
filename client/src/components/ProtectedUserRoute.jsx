import { useAuth } from '../hooks/useAuth';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
export function ProtectedUserRoute(_a) {
    var children = _a.children;
    var _b = useAuth(), user = _b.user, isLoading = _b.isLoading;
    var _c = useLocation(), setLocation = _c[1];
    useEffect(function () {
        if (!isLoading && !user) {
            setLocation('/login');
        }
    }, [user, isLoading, setLocation]);
    if (isLoading) {
        return (<div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>);
    }
    if (!user) {
        return null;
    }
    return <>{children}</>;
}
export default ProtectedUserRoute;

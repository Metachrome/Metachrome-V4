import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiRequest } from "../lib/queryClient";
import type { User } from "@shared/schema-sqlite";
import { useWebSocket } from "./useWebSocket";

export function useAuth() {
  const queryClient = useQueryClient();
  const { lastMessage } = useWebSocket();

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth"],
    queryFn: async () => {
      // Check for token in URL parameters (from OAuth redirects)
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      const urlUser = urlParams.get('user');

      if (urlToken && urlUser) {
        console.log("🔍 Found OAuth token in URL, storing locally");
        localStorage.setItem('authToken', urlToken);
        localStorage.setItem('user', decodeURIComponent(urlUser));

        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);

        return JSON.parse(decodeURIComponent(urlUser));
      }

      const authToken = localStorage.getItem('authToken');
      console.log("🔍 useAuth queryFn - Auth token:", authToken?.substring(0, 20) + '...');

      if (!authToken) {
        console.log("No auth token found");
        return null;
      }

      try {
        // For user session tokens, get from localStorage
        if (authToken.startsWith('user-session-')) {
          console.log("Found user session token, using stored user data");
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            console.log("User session auth successful");
            return JSON.parse(storedUser);
          }
        }

        // For admin session tokens, make API request
        if (authToken.startsWith('admin-session-')) {
          console.log("Making API request for admin user");
          const response = await apiRequest("GET", "/api/auth");
          const userData = await response.json();
          console.log("Admin user query response:", userData);
          return userData;
        }

        // For admin tokens (admin-token-), use stored user data
        if (authToken.startsWith('admin-token-')) {
          console.log("🔧 Found admin-token, using stored user data");
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            console.log("🔧 Admin-token user data:", userData);
            return userData;
          }
        }

        // For demo tokens, get from localStorage
        if (authToken.startsWith('demo-token-')) {
          const demoUser = localStorage.getItem('demoUser');
          if (demoUser) {
            console.log("Found demo user in localStorage");
            return JSON.parse(demoUser);
          }
        }

        // For admin tokens, get from localStorage
        if (authToken === 'mock-admin-token') {
          const adminUser = localStorage.getItem('user');
          if (adminUser) {
            console.log("Found admin user in localStorage");
            return JSON.parse(adminUser);
          }
        }

        // For mock JWT tokens (admin login), use stored user data
        if (authToken && (authToken.startsWith('mock-jwt-token') || authToken === 'mock-jwt-token')) {
          console.log("Found mock JWT token, using stored user data");
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            console.log("Mock JWT user data:", userData);
            return userData;
          }
        }

        // For admin tokens (new format), use stored user data
        if (authToken && (authToken.startsWith('token_admin-001_') || authToken.startsWith('token_superadmin-001_'))) {
          console.log("🔧 Found admin token, using stored user data");
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            console.log("🔧 Admin token user data:", userData);
            return userData;
          }
        }

        // For real JWT tokens (other cases), make API request to verify
        if (authToken && !authToken.startsWith('demo-token-') && !authToken.startsWith('admin-session-') && !authToken.startsWith('admin-token-') && !authToken.startsWith('mock-jwt-token') && authToken !== 'mock-jwt-token' && !authToken.startsWith('token_admin-001_') && !authToken.startsWith('token_superadmin-001_')) {
          console.log("Making API request for JWT token user");
          const response = await apiRequest("GET", "/api/auth");
          const userData = await response.json();
          console.log("JWT user query response:", userData);
          return userData;
        }

        console.log("🔍 No matching token pattern found");
        return null;
      } catch (error) {
        console.log("🔴 Auth query error:", error);

        // For mock tokens (including admin tokens and user session tokens), try to use stored user data instead of clearing
        const authToken = localStorage.getItem('authToken');
        if (authToken && (authToken.startsWith('mock-jwt-token') || authToken === 'mock-jwt-token' || authToken === 'mock-admin-token' || authToken.startsWith('token_admin-001_') || authToken.startsWith('token_superadmin-001_') || authToken.startsWith('admin-token-') || authToken.startsWith('user-session-'))) {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            console.log("Auth query failed, but using stored user data for token:", authToken.substring(0, 20) + '...');
            return JSON.parse(storedUser);
          }
        }

        // Only clear token for real auth failures, not API errors
        if (error.message && error.message.includes('401')) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('demoUser');
          localStorage.removeItem('user');
        }
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const userLoginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      try {
        // Use the auth endpoint
        const response = await apiRequest("POST", "/api/auth", credentials);
        const data = await response.json();
        return data;
      } catch (error: any) {
        console.error("Login error:", error);
        // Extract meaningful error message
        let message = "Login failed";
        if (error.message) {
          if (error.message.includes("401")) {
            message = "Invalid username or password";
          } else if (error.message.includes("400")) {
            message = "Username and password are required";
          } else if (error.message.includes("500")) {
            message = "Server error. Please try again later.";
          } else {
            message = error.message;
          }
        }
        throw new Error(message);
      }
    },
    onSuccess: (data) => {
      // Store the token in localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      queryClient.setQueryData(["/api/auth"], data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth"] });
    },
  });

  const adminLoginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      try {
        // Use direct fetch to bypass any API configuration issues
        const endpoint = "/api/admin/login";

        // Check if we're running locally
        const isLocal = window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '0.0.0.0';

        // Check if we're on Vercel
        const isVercel = window.location.hostname.includes('vercel.app');

        // Construct the full URL directly
        const baseUrl = isLocal ? 'http://127.0.0.1:3005' : '';
        const fullUrl = `${baseUrl}${endpoint}`;

        console.log('🔧 Login Debug Info:', {
          isLocal,
          isVercel,
          isProd: import.meta.env.PROD,
          hostname: window.location.hostname,
          endpoint,
          baseUrl,
          fullUrl
        });

        // Use direct fetch instead of apiRequest to avoid any configuration issues
        const response = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
      } catch (error: any) {
        console.error("Admin login error:", error);
        // Extract meaningful error message
        let message = "Admin login failed";
        if (error.message) {
          if (error.message.includes("401")) {
            message = "Invalid admin credentials";
          } else if (error.message.includes("403")) {
            message = "Access denied. Admin privileges required.";
          } else if (error.message.includes("400")) {
            message = "Username and password are required";
          } else if (error.message.includes("500")) {
            message = "Server error. Please try again later.";
          } else {
            message = error.message;
          }
        }
        throw new Error(message);
      }
    },
    onSuccess: (data) => {
      console.log('🔧 Admin login success:', data);
      // Store the token in localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      // Store user data
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      queryClient.setQueryData(["/api/auth"], data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        // Try to call logout endpoint
        await apiRequest("POST", "/api/auth?action=logout");
      } catch (error) {
        console.warn("Logout API failed, continuing with local cleanup:", error);
      }
    },
    onSuccess: () => {
      // Always clear local state regardless of API response
      queryClient.setQueryData(["/api/auth"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth"] });

      // Clear any stored auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      sessionStorage.clear();

      // Force redirect to home page
      window.location.href = "/";
    },
    onError: () => {
      // Even if logout fails, clear local state and redirect
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });

      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      sessionStorage.clear();

      window.location.href = "/";
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: {
      username: string;
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
    }) => {
      try {
        // Try the main auth endpoint first
        const response = await apiRequest("POST", "/api/auth", userData);
        return response.json();
      } catch (error: any) {
        console.warn('Main auth endpoint failed, trying fallback:', error);

        // If main endpoint fails, try the user registration endpoint as fallback
        try {
          const fallbackResponse = await apiRequest("POST", "/api/auth/user/register", {
            username: userData.username,
            email: userData.email,
            password: userData.password
          });
          const result = await fallbackResponse.json();

          // Add a note that firstName/lastName weren't saved
          if (userData.firstName || userData.lastName) {
            console.warn('Note: firstName and lastName were not saved due to fallback endpoint limitations');
          }

          return result;
        } catch (fallbackError) {
          console.error('Both registration endpoints failed:', fallbackError);

          // If both endpoints fail, create a demo user locally
          console.warn('Creating demo user locally due to server issues');
          const demoUser = {
            id: `demo-user-${Date.now()}`,
            username: userData.username,
            email: userData.email,
            role: 'user',
            firstName: userData.firstName,
            lastName: userData.lastName
          };

          // Store demo user in localStorage
          localStorage.setItem('demoUser', JSON.stringify(demoUser));
          localStorage.setItem('authToken', `demo-token-${Date.now()}`);

          return {
            user: demoUser,
            message: "Registration successful (Demo Mode - Local Storage)",
            token: `demo-token-${Date.now()}`,
            success: true
          };
        }
      }
    },
    onSuccess: (data) => {
      // Store the token in localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      // Store user data for user-session tokens
      if (data.user && data.token && data.token.startsWith('user-session-')) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      queryClient.setQueryData(["/api/auth"], data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth"] });
    },
  });

  const metamaskLoginMutation = useMutation({
    mutationFn: async (data: { walletAddress: string; signature?: string }) => {
      const response = await apiRequest("POST", "/api/auth", data);
      return response.json();
    },
    onSuccess: (data) => {
      // Store the token in localStorage
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      // Store user data for user-session tokens
      if (data.user && data.token && data.token.startsWith('user-session-')) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      queryClient.setQueryData(["/api/auth"], data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth"] });
    },
  });

  // Force refresh auth state
  const refreshAuth = () => {
    console.log("🔄 Force refreshing auth state");
    queryClient.invalidateQueries({ queryKey: ["/api/auth"] });
    queryClient.refetchQueries({ queryKey: ["/api/auth"] });
  };

  // Listen for verification status updates via WebSocket
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'verification_status_updated') {
      const { userId, verification_status, message, forceRefresh } = lastMessage;

      // Check if this update is for the current user
      if (user && user.id === userId) {
        console.log('🔔 Verification status updated:', verification_status);

        // Force refresh user data to get updated verification status
        if (forceRefresh) {
          // Clear any cached user data
          localStorage.removeItem('user');

          // Force a complete refresh of auth data
          queryClient.removeQueries({ queryKey: ["/api/auth"] });
          queryClient.invalidateQueries({ queryKey: ["/api/auth"] });
          queryClient.refetchQueries({ queryKey: ["/api/auth"] });

          console.log('🔄 Forced complete refresh of user data');
        } else {
          // Regular refresh
          refreshAuth();
        }

        // Show notification to user
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification('Account Verification Update', {
              body: message,
              icon: '/favicon.ico'
            });
          }
        }

        // Also show a console message for debugging
        console.log('🎉 Verification status update:', message);
      }
    }
  }, [lastMessage, user, refreshAuth, queryClient]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    userLogin: userLoginMutation.mutateAsync,
    adminLogin: adminLoginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    metamaskLogin: metamaskLoginMutation.mutateAsync,
    refreshAuth,
    isUserLoginPending: userLoginMutation.isPending,
    isAdminLoginPending: adminLoginMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
    isRegisterPending: registerMutation.isPending,
    isMetamaskLoginPending: metamaskLoginMutation.isPending,
  };
}

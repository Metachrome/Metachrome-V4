import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Get API base URL from environment or use Vite proxy for development
const getApiBaseUrl = () => {
  // Check if we're running locally (localhost or 127.0.0.1)
  const isLocal = window.location.hostname === 'localhost' ||
                  window.location.hostname === '127.0.0.1' ||
                  window.location.hostname === '0.0.0.0';

  // Check if we're on Vercel (vercel.app domain)
  const isVercel = window.location.hostname.includes('vercel.app');

  // Check if we're on Railway (railway.app domain)
  const isRailway = window.location.hostname.includes('railway.app');

  console.log('🔧 API Base URL Detection:', {
    hostname: window.location.hostname,
    isLocal,
    isVercel,
    isRailway,
    isProd: import.meta.env.PROD
  });

  // Production deployment on Vercel or Railway - use relative URLs
  if ((isVercel || isRailway) || (import.meta.env.PROD && !isLocal)) {
    console.log('🌐 Using production API endpoints (relative URLs)');
    return '';
  }

  // Development or local production - use local server with same hostname
  if (isLocal) {
    console.log('🏠 Using local server endpoints');
    const hostname = window.location.hostname;
    return `http://${hostname}:3005`;
  }

  // Fallback to Vite proxy
  console.log('🔄 Using Vite proxy');
  return '';
};

const API_BASE_URL = getApiBaseUrl();
// Production logging (minimal)
if (import.meta.env.DEV) {
  console.log('🔧 API Base URL:', API_BASE_URL);
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      // Try to parse as JSON first
      const errorData = await res.json();
      errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
    } catch {
      // If JSON parsing fails, try to get text
      try {
        const text = await res.text();
        errorMessage = text || res.statusText;
      } catch {
        // If both fail, use status text
        errorMessage = res.statusText;
      }
    }
    throw new Error(`${res.status}: ${errorMessage}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  const fullUrl = `${API_BASE_URL}${url}`;
  // Development logging only
  if (import.meta.env.DEV) {
    console.log(`🌐 API Request: ${method} ${url}`);
  }

  // Get auth token from localStorage
  const token = localStorage.getItem('authToken');
  const headers: Record<string, string> = {};

  if (data) {
    headers["Content-Type"] = "application/json";
  }

  // Only add Authorization header if we have a token AND it's not a login request
  if (token && !url.includes('/auth/admin/login') && !url.includes('/auth/user/login') && !url.includes('/admin-auth') && !url.includes('/admin-login')) {
    headers["Authorization"] = `Bearer ${token}`;
    if (import.meta.env.DEV) {
      console.log(`🔐 Adding Authorization header for ${url}: Bearer ${token.substring(0, 30)}...`);
    }
  } else if (import.meta.env.DEV && url.includes('/auth')) {
    console.log(`🔐 NOT adding Authorization header for ${url} - token: ${token ? 'exists' : 'missing'}`);
  }

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: url.includes('/admin-login') ? "omit" : "include",
  });

  // Development logging only
  if (import.meta.env.DEV && !res.ok) {
    console.error(`📡 API Error: ${res.status} ${res.statusText}`);
  }

  await throwIfResNotOk(res);

  // Parse JSON response instead of returning raw Response object
  const jsonData = await res.json();
  return jsonData;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = `${API_BASE_URL}${queryKey.join("/")}`;

    // Get auth token from localStorage
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 0, // Changed from Infinity to 0 for immediate refresh
      cacheTime: 0, // Disable caching for real-time updates
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

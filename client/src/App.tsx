import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { MobileLayout } from "./components/ui/mobile-layout";
import { useAuth } from "./hooks/useAuth";
import HomePage from "./pages/HomePage";
import MarketsPage from "./pages/MarketsPage";
import TradePage from "./pages/TradePage";
import OptionsPage from "./pages/OptionsPage";
import SpotPage from "./pages/SpotPage";
import TradingPage from "./pages/TradingPage";
import WalletPage from "./pages/WalletPage";
import SupportPage from "./pages/SupportPage";
import TradePolicyPage from "./pages/TradePolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminRedirect from "./pages/AdminRedirect";
import UserLogin from "./pages/UserLogin";
import SignupPage from "./pages/SignupPage";
import UserDashboard from "./pages/UserDashboard";
import TestDashboard from "./pages/TestDashboard";
import ProfilePage from "./pages/ProfilePage";
import TransactionHistory from "./pages/TransactionHistory";
import AdminTransactionsPage from "./pages/AdminTransactionsPage";
import SuperAdminTestPage from "./pages/SuperAdminTestPage";
import AdminActivityLogsPage from "./pages/AdminActivityLogsPage";
import TestPriceSyncPage from "./pages/TestPriceSyncPage";
import NotFound from "./pages/not-found";
import { ProtectedAdminRoute } from "./components/ProtectedAdminRoute";
import { ProtectedUserRoute } from "./components/ProtectedUserRoute";

function Router() {
  const { user } = useAuth();
  const [location] = useLocation();

  // Scroll to top whenever the route changes (mobile navigation)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location]);

  return (
    <MobileLayout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/dashboard">
          <ProtectedUserRoute>
            <UserDashboard />
          </ProtectedUserRoute>
        </Route>
        <Route path="/profile">
          <ProtectedUserRoute>
            <ProfilePage />
          </ProtectedUserRoute>
        </Route>
        <Route path="/market" component={MarketsPage} />
        <Route path="/trading">
          <ProtectedUserRoute>
            <TradingPage />
          </ProtectedUserRoute>
        </Route>
        <Route path="/trade/spot" component={SpotPage} />
        <Route path="/trade/options" component={OptionsPage} />
        <Route path="/options" component={OptionsPage} />
        <Route path="/trade/:type?">
          <ProtectedUserRoute>
            <TradePage />
          </ProtectedUserRoute>
        </Route>
        <Route path="/wallet/:tab?">
          <ProtectedUserRoute>
            <WalletPage />
          </ProtectedUserRoute>
        </Route>
        <Route path="/wallet/history">
          <ProtectedUserRoute>
            <TransactionHistory />
          </ProtectedUserRoute>
        </Route>
        <Route path="/transactions">
          <ProtectedUserRoute>
            <TransactionHistory />
          </ProtectedUserRoute>
        </Route>
        <Route path="/support" component={SupportPage} />
        <Route path="/trade-policy" component={TradePolicyPage} />
        <Route path="/terms-of-service" component={TermsOfServicePage} />
        <Route path="/privacy-policy" component={PrivacyPolicyPage} />
        <Route path="/test-price-sync" component={TestPriceSyncPage} />
        <Route path="/login" component={UserLogin} />
        <Route path="/signup" component={SignupPage} />
        <Route path="/admin/login" component={AdminLogin} />
        <Route path="/admin/redirect" component={AdminRedirect} />
        <Route path="/admin">
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        </Route>
        <Route path="/admin/dashboard">
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        </Route>
        <Route path="/admin/transactions">
          <ProtectedAdminRoute>
            <AdminTransactionsPage />
          </ProtectedAdminRoute>
        </Route>
        <Route path="/admin/test">
          <ProtectedAdminRoute>
            <SuperAdminTestPage />
          </ProtectedAdminRoute>
        </Route>
        <Route path="/admin/activity-logs">
          <ProtectedAdminRoute>
            <AdminActivityLogsPage />
          </ProtectedAdminRoute>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </MobileLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

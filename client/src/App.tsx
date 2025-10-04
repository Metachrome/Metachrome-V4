import { Switch, Route, useLocation } from "wouter";
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
import TestPriceSyncPage from "./pages/TestPriceSyncPage";
import NotFound from "./pages/not-found";
import { ProtectedAdminRoute } from "./components/ProtectedAdminRoute";
import { ProtectedUserRoute } from "./components/ProtectedUserRoute";

function Router() {
  const { user } = useAuth();

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

import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Link } from 'wouter';
import { CryptoTopUp } from '../components/CryptoTopUp';
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  Eye,
  EyeOff,
  Plus
} from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuth();

  // State for UI controls
  const [showBalance, setShowBalance] = useState(true);

  // Simplified data fetching - only fetch balances for now
  const { data: balances, isLoading: balancesLoading } = useQuery({
    queryKey: ['/api/balances'],
    enabled: !!user?.id,
  });

  // Simple calculations for now
  const totalBalance = user?.balance || 0;
  const totalTrades = 0;
  const winRate = '0';

  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-400">
            Here's your trading overview and account summary.
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Balance Card */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-green-500/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Portfolio Value
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                >
                  {showBalance ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Button>
                <DollarSign className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {showBalance ? `$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••'}
              </div>
              <p className="text-xs text-gray-400">
                Available balance
              </p>
            </CardContent>
          </Card>

          {/* Total Trades Card */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-blue-500/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Trades
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {totalTrades}
              </div>
              <p className="text-xs text-gray-400">
                All time
              </p>
            </CardContent>
          </Card>

          {/* Win Rate Card */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-green-500/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Win Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {winRate}%
              </div>
              <p className="text-xs text-gray-400">
                Success rate
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(parseFloat(winRate), 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-gray-400">
                Start trading or manage your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/trade/options">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Options Trading
                </Button>
              </Link>
              <Link href="/trade/spot">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Spot Trading
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Account Management */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Account Management</CardTitle>
              <CardDescription className="text-gray-400">
                Manage your account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/profile">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                  View Profile
                </Button>
              </Link>
              <Link href="/transactions">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                  Transaction History
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Add Funds Section */}
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Add Funds</CardTitle>
              <CardDescription className="text-gray-400">
                Top up your account balance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Funds
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700 max-w-4xl">
                  <DialogHeader>
                    <DialogTitle className="text-white">Add Funds to Your Account</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <CryptoTopUp />
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Simple Trading Section */}
        <div className="mt-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Start Trading</CardTitle>
              <CardDescription className="text-gray-400">
                Begin your trading journey
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <TrendingUp className="h-16 w-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Ready to Trade?</h3>
              <p className="text-gray-400 mb-6">Start trading with our advanced platform</p>
              <div className="space-y-4">
                <Link href="/trade/options">
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Options Trading
                  </Button>
                </Link>
                <Link href="/trade/spot">
                  <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                    <BarChart3 className="w-4 w-4 mr-2" />
                    Spot Trading
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

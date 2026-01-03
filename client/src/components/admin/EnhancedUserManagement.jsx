import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Users, Search, Filter, Plus, Edit, Eye, Lock, DollarSign, MessageSquare, Download, UserCheck, UserX } from 'lucide-react';
// Helper function to safely parse balance values
var parseBalance = function (balance) {
    if (typeof balance === 'number') {
        return balance;
    }
    if (typeof balance === 'string') {
        // Remove any formatting and parse as float
        var cleaned = balance.replace(/[^0-9.-]/g, '');
        var parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
};
// Helper function to format balance for display
var formatBalance = function (balance) {
    var numericBalance = parseBalance(balance);
    // Round to 2 decimal places to avoid floating point precision issues
    var rounded = Math.round(numericBalance * 100) / 100;
    return rounded.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};
// Helper function to calculate total balance safely
var calculateTotalBalance = function (users) {
    return users.reduce(function (sum, user) {
        var balance = parseBalance(user.balance);
        return sum + balance;
    }, 0);
};
export default function EnhancedUserManagement(_a) {
    var users = _a.users, searchTerm = _a.searchTerm, statusFilter = _a.statusFilter, onSearchChange = _a.onSearchChange, onStatusFilterChange = _a.onStatusFilterChange, onUserEdit = _a.onUserEdit, onUserView = _a.onUserView, onBalanceUpdate = _a.onBalanceUpdate, onPasswordUpdate = _a.onPasswordUpdate, onChatWithUser = _a.onChatWithUser, onTradingModeChange = _a.onTradingModeChange, onExportData = _a.onExportData, onCreateUser = _a.onCreateUser, isSuperAdmin = _a.isSuperAdmin, _b = _a.isLoading, isLoading = _b === void 0 ? false : _b;
    var getStatusBadge = function (status) {
        var variants = {
            active: 'default',
            inactive: 'secondary',
            suspended: 'destructive',
            banned: 'destructive'
        };
        return (<Badge variant={variants[status] || 'outline'}>
        {status}
      </Badge>);
    };
    var getRoleBadge = function (role) {
        var variants = {
            super_admin: 'default',
            admin: 'secondary',
            user: 'outline'
        };
        return (<Badge variant={variants[role] || 'outline'}>
        {role === 'super_admin' ? 'Super Admin' : role === 'admin' ? 'Admin' : 'User'}
      </Badge>);
    };
    var getTradingModeBadge = function (mode) {
        var colors = {
            win: 'bg-green-600',
            normal: 'bg-blue-600',
            lose: 'bg-red-600'
        };
        return (<Badge className={"".concat(colors[mode], " text-white")}>
        {mode.toUpperCase()}
      </Badge>);
    };
    var getRiskLevelBadge = function (level) {
        if (!level)
            return <Badge variant="outline">Unknown</Badge>;
        var colors = {
            low: 'bg-green-600',
            medium: 'bg-yellow-600',
            high: 'bg-red-600'
        };
        return (<Badge className={"".concat(colors[level], " text-white")}>
        {level.toUpperCase()}
      </Badge>);
    };
    return (<div className="space-y-6">
      {/* Header and Controls */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center space-x-2">
                <Users className="w-5 h-5"/>
                <span>User Management</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Comprehensive user control and management system
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={onExportData} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2"/>
                Export
              </Button>
              <Button onClick={onCreateUser} size="sm">
                <Plus className="w-4 h-4 mr-2"/>
                Create User
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"/>
              <Input placeholder="Search users by username, email, or name..." value={searchTerm} onChange={function (e) { return onSearchChange(e.target.value); }} className="pl-10 bg-gray-700 border-gray-600 text-white"/>
            </div>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-48 bg-gray-700 border-gray-600">
                <Filter className="w-4 h-4 mr-2"/>
                <SelectValue placeholder="Filter by status"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">{users.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500"/>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Users</p>
                  <p className="text-2xl font-bold text-white">
                    {users.filter(function (u) { return u.status === 'active'; }).length}
                  </p>
                </div>
                <UserCheck className="w-8 h-8 text-green-500"/>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Suspended</p>
                  <p className="text-2xl font-bold text-white">
                    {users.filter(function (u) { return u.status === 'suspended'; }).length}
                  </p>
                </div>
                <UserX className="w-8 h-8 text-red-500"/>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Balance</p>
                  <p className="text-2xl font-bold text-white">
                    ${calculateTotalBalance(users).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-500"/>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-700">
                  <TableHead className="text-gray-300">User</TableHead>
                  <TableHead className="text-gray-300">Contact</TableHead>
                  <TableHead className="text-gray-300">Balance</TableHead>
                  <TableHead className="text-gray-300">Role</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Trading Mode</TableHead>
                  <TableHead className="text-gray-300">Performance</TableHead>
                  <TableHead className="text-gray-300">Risk Level</TableHead>
                  <TableHead className="text-gray-300">Last Login</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(function (user) { return (<TableRow key={user.id} className="border-gray-700 hover:bg-gray-700/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-white font-medium">{user.username}</div>
                          <div className="text-gray-400 text-sm">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-white">{user.email}</div>
                      <div className="text-gray-400 text-sm">{user.phoneNumber}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-white font-medium">${formatBalance(user.balance)}</div>
                      <div className="text-gray-400 text-sm">
                        {user.walletAddress ? 'Wallet Connected' : 'No Wallet'}
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      <Select value={user.trading_mode} onValueChange={function (value) { return onTradingModeChange(user.id, value); }} disabled={!isSuperAdmin}>
                        <SelectTrigger className="w-24 bg-gray-700 border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="win">Win</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="lose">Lose</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="text-white text-sm">
                        {user.totalTrades || 0} trades
                      </div>
                      <div className="text-gray-400 text-sm">
                        {user.winRate ? "".concat(user.winRate, "% win rate") : 'No data'}
                      </div>
                    </TableCell>
                    <TableCell>{getRiskLevelBadge(user.riskLevel)}</TableCell>
                    <TableCell>
                      <div className="text-white text-sm">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                      </div>
                      <div className="text-gray-400 text-sm">{user.lastLoginIP}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm" onClick={function () { return onUserView(user); }} className="text-gray-400 hover:text-white">
                          <Eye className="w-4 h-4"/>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={function () { return onUserEdit(user); }} className="text-gray-400 hover:text-white">
                          <Edit className="w-4 h-4"/>
                        </Button>
                        {isSuperAdmin && (<>
                            <Button variant="ghost" size="sm" onClick={function () { return onBalanceUpdate(user); }} className="text-gray-400 hover:text-white">
                              <DollarSign className="w-4 h-4"/>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={function () { return onPasswordUpdate(user); }} className="text-gray-400 hover:text-white">
                              <Lock className="w-4 h-4"/>
                            </Button>
                          </>)}
                        <Button variant="ghost" size="sm" onClick={function () { return onChatWithUser(user); }} className="text-gray-400 hover:text-white">
                          <MessageSquare className="w-4 h-4"/>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>); })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>);
}

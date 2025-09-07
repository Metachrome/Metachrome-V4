import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter, 
  Eye, 
  Settings, 
  DollarSign,
  Clock,
  Target,
  Activity,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  PlayCircle,
  PauseCircle,
  StopCircle,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Trade {
  id: string;
  user_id: string;
  symbol: string;
  amount: number;
  direction: 'up' | 'down';
  duration: number;
  entry_price: number;
  exit_price?: number;
  result?: 'win' | 'lose' | 'pending';
  profit?: number;
  created_at: string;
  expires_at: string;
  completed_at?: string;
  users?: { username: string };
  type: 'spot' | 'options';
  leverage?: number;
  stopLoss?: number;
  takeProfit?: number;
  adminControlled?: boolean;
  controlType?: 'win' | 'normal' | 'lose';
  marketCondition?: string;
  executionTime?: number;
  slippage?: number;
  fees?: number;
  pnlPercentage?: number;
  riskScore?: number;
  deviceType?: 'desktop' | 'mobile';
  ipAddress?: string;
  userAgent?: string;
}

interface TradingSettings {
  id: string;
  duration: number;
  min_amount: number;
  profit_percentage: number;
  enabled: boolean;
  max_amount?: number;
  risk_multiplier?: number;
  market_hours_only?: boolean;
  allowed_symbols?: string[];
  cooldown_period?: number;
}

interface EnhancedTradingDashboardProps {
  trades: Trade[];
  tradingSettings: TradingSettings[];
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (term: string) => void;
  onStatusFilterChange: (status: string) => void;
  onTradeView: (trade: Trade) => void;
  onTradingSettingsUpdate: (settings: TradingSettings) => void;
  onManualTradeControl: (tradeId: string, action: 'win' | 'lose' | 'cancel') => void;
  isSuperAdmin: boolean;
  isLoading?: boolean;
}

export default function EnhancedTradingDashboard({
  trades,
  tradingSettings,
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onTradeView,
  onTradingSettingsUpdate,
  onManualTradeControl,
  isSuperAdmin,
  isLoading = false
}: EnhancedTradingDashboardProps) {

  const getResultBadge = (result?: 'win' | 'lose' | 'pending') => {
    if (!result) return <Badge variant="outline">Unknown</Badge>;
    
    const variants = {
      win: 'bg-green-600',
      lose: 'bg-red-600',
      pending: 'bg-yellow-600'
    };
    
    return (
      <Badge className={`${variants[result]} text-white`}>
        {result.toUpperCase()}
      </Badge>
    );
  };

  const getDirectionIcon = (direction: 'up' | 'down') => {
    return direction === 'up' ? (
      <ArrowUp className="w-4 h-4 text-green-500" />
    ) : (
      <ArrowDown className="w-4 h-4 text-red-500" />
    );
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const remaining = Math.max(0, expiry - now);
    
    if (remaining === 0) return 'Expired';
    
    const seconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const activeTrades = trades.filter(t => t.result === 'pending');
  const completedTrades = trades.filter(t => t.result !== 'pending');
  const winningTrades = completedTrades.filter(t => t.result === 'win');
  const totalVolume = trades.reduce((sum, t) => sum + t.amount, 0);
  const totalProfit = completedTrades.reduce((sum, t) => sum + (t.profit || 0), 0);

  return (
    <div className="space-y-6">
      {/* Trading Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Active Trades</p>
                <p className="text-3xl font-bold text-white">{activeTrades.length}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-600 to-green-700 border-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Win Rate</p>
                <p className="text-3xl font-bold text-white">
                  {completedTrades.length > 0 ? 
                    ((winningTrades.length / completedTrades.length) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <Target className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Volume</p>
                <p className="text-3xl font-bold text-white">${totalVolume.toLocaleString()}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-600 to-orange-700 border-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Total P&L</p>
                <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-white' : 'text-red-200'}`}>
                  ${totalProfit.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trading Settings */}
      {isSuperAdmin && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Trading Settings</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Configure duration-based trading parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tradingSettings.map((setting) => (
                <div key={setting.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-medium">{setting.duration} Second Trading</h3>
                    <Badge variant={setting.enabled ? 'default' : 'secondary'}>
                      {setting.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Min Amount:</span>
                      <span className="text-white">${setting.min_amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max Amount:</span>
                      <span className="text-white">${setting.max_amount || 'Unlimited'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Profit %:</span>
                      <span className="text-white">{setting.profit_percentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Risk Multiplier:</span>
                      <span className="text-white">{setting.risk_multiplier || 1}x</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => onTradingSettingsUpdate(setting)}
                  >
                    Configure
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Trades Monitor */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Live Trading Monitor</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Real-time active trades and manual controls
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-400">Live</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search trades by symbol or user..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-48 bg-gray-700 border-gray-600">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trades</SelectItem>
                <SelectItem value="pending">Active</SelectItem>
                <SelectItem value="win">Won</SelectItem>
                <SelectItem value="lose">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Trades Table */}
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-700">
                  <TableHead className="text-gray-300">Trade</TableHead>
                  <TableHead className="text-gray-300">User</TableHead>
                  <TableHead className="text-gray-300">Symbol</TableHead>
                  <TableHead className="text-gray-300">Direction</TableHead>
                  <TableHead className="text-gray-300">Amount</TableHead>
                  <TableHead className="text-gray-300">Entry Price</TableHead>
                  <TableHead className="text-gray-300">Duration</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">P&L</TableHead>
                  <TableHead className="text-gray-300">Control</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.slice(0, 20).map((trade) => (
                  <TableRow key={trade.id} className="border-gray-700 hover:bg-gray-700/50">
                    <TableCell>
                      <div className="text-white font-mono text-sm">
                        {trade.id.slice(0, 8)}...
                      </div>
                      <div className="text-gray-400 text-xs">
                        {new Date(trade.created_at).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-white">{trade.users?.username || 'Unknown'}</div>
                      <div className="text-gray-400 text-sm">{trade.deviceType}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-white font-medium">{trade.symbol}</div>
                      <div className="text-gray-400 text-sm">{trade.type}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getDirectionIcon(trade.direction)}
                        <span className="text-white">{trade.direction.toUpperCase()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-white">${trade.amount}</div>
                      {trade.leverage && (
                        <div className="text-gray-400 text-sm">{trade.leverage}x leverage</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-white font-mono">${trade.entry_price}</div>
                      {trade.exit_price && (
                        <div className="text-gray-400 text-sm font-mono">${trade.exit_price}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-white">{trade.duration}s</div>
                      {trade.result === 'pending' && (
                        <div className="text-yellow-400 text-sm">
                          {getTimeRemaining(trade.expires_at)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getResultBadge(trade.result)}</TableCell>
                    <TableCell>
                      <div className={`text-sm font-medium ${
                        (trade.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ${(trade.profit || 0).toFixed(2)}
                      </div>
                      {trade.pnlPercentage && (
                        <div className="text-gray-400 text-xs">
                          {trade.pnlPercentage.toFixed(2)}%
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {trade.adminControlled ? (
                        <Badge className="bg-purple-600 text-white">
                          {trade.controlType?.toUpperCase()}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Auto</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onTradeView(trade)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {isSuperAdmin && trade.result === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onManualTradeControl(trade.id, 'win')}
                              className="text-green-400 hover:text-green-300"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onManualTradeControl(trade.id, 'lose')}
                              className="text-red-400 hover:text-red-300"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

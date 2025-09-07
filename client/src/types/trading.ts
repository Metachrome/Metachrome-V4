export interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  symbol: string;
  timestamp: number;
}

export interface TradeOrder {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop';
  amount: number;
  price?: number;
  stopPrice?: number;
  status: 'pending' | 'filled' | 'cancelled' | 'rejected';
  filledAmount: number;
  timestamp: number;
}

export interface Position {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  pnlPercentage: number;
  margin: number;
  leverage: number;
  timestamp: number;
}

export interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: 'active' | 'inactive';
  priceFilter: {
    minPrice: number;
    maxPrice: number;
    tickSize: number;
  };
  lotSizeFilter: {
    minQty: number;
    maxQty: number;
    stepSize: number;
  };
  notionalFilter: {
    minNotional: number;
    maxNotional: number;
  };
}

export interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicator {
  name: string;
  values: number[];
  timestamp: number[];
}

export interface TradingViewWidget {
  symbol: string;
  interval: string;
  theme: 'light' | 'dark';
  style: 'candles' | 'line' | 'bars';
  toolbar_bg: string;
  enable_publishing: boolean;
  hide_top_toolbar: boolean;
  hide_legend: boolean;
  save_image: boolean;
  container_id: string;
}

export interface OptionsContract {
  id: string;
  symbol: string;
  duration: number; // in seconds
  minAmount: number;
  profitPercentage: number;
  strikePrice: number;
  direction: 'up' | 'down';
  status: 'active' | 'expired' | 'settled';
  entryTime: number;
  expiryTime: number;
  settlementPrice?: number;
  payout?: number;
}

export interface BinaryOption {
  duration: number;
  minAmount: number;
  profitPercentage: number;
  isActive: boolean;
}

export interface TradeExecution {
  orderId: string;
  symbol: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  fee: number;
  timestamp: number;
  tradeId: string;
}

export interface WalletBalance {
  asset: string;
  free: number;
  locked: number;
  total: number;
  usdValue: number;
}

export interface TransactionHistory {
  id: string;
  type: 'deposit' | 'withdraw' | 'trade' | 'transfer';
  asset: string;
  amount: number;
  fee: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  txHash?: string;
  fromAddress?: string;
  toAddress?: string;
}

export interface AdminControl {
  userId: string;
  controlType: 'normal' | 'win' | 'lose';
  isActive: boolean;
  notes?: string;
  createdBy: string;
  timestamp: number;
}

export interface MarketStats {
  symbol: string;
  volume24h: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
  trades24h: number;
  lastPrice: number;
  bestBid: number;
  bestAsk: number;
  spread: number;
  spreadPercent: number;
}

export interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  isActive: boolean;
  performance: {
    totalTrades: number;
    winRate: number;
    totalPnl: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
}

export interface RiskManagement {
  maxPositionSize: number;
  maxDailyLoss: number;
  maxLeverage: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  riskPerTrade: number;
}

export interface PortfolioSummary {
  totalBalance: number;
  totalPnl: number;
  totalPnlPercent: number;
  dayPnl: number;
  dayPnlPercent: number;
  positions: Position[];
  orders: TradeOrder[];
  trades: TradeExecution[];
}

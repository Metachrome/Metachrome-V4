import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Star, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { useIsMobile } from "../hooks/use-mobile";
import { useCryptoData } from "../services/cryptoDataService";
import type { MarketData } from "@shared/schema";
import { Card, CardContent } from "../components/ui/card";

export default function MarketsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();

  // Use real-time CoinMarketCap data
  const { cryptoData, loading, error, forceRefresh, retry } = useCryptoData();

  // Filter data based on search query
  const filteredMarketData = cryptoData.filter(crypto =>
    crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crypto.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#10121E]">
      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Markets</h1>
          <p className="text-gray-400">Live crypto data in real time</p>
        </div>
        {/* Search and Refresh */}
        <div className={`mb-8 ${isMobile ? 'flex gap-2' : 'flex items-center justify-end space-x-4'}`}>
          <div className={`relative ${isMobile ? 'flex-1' : ''}`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder={isMobile ? "Search..." : "Search cryptocurrencies..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 ${isMobile ? 'w-full' : 'w-64'} bg-[#3A3A4E] border-gray-600 text-white placeholder-gray-400 rounded-md`}
            />
          </div>
          <Button
            onClick={forceRefresh}
            disabled={loading}
            className={`bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-md flex items-center gap-2 ${isMobile ? 'px-3 py-2 text-sm flex-shrink-0' : 'px-4 py-2'}`}
            title={loading ? 'Updating...' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {!isMobile && (loading ? 'Updating...' : 'Refresh')}
          </Button>
        </div>

        {/* Status Indicator */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : error ? 'bg-red-400' : 'bg-green-400'}`}></div>
            <span className="text-sm text-gray-400">
              {loading ? 'Updating market data...' : error ? 'Using cached data' : 'Real-time data'}
            </span>
            {error && (
              <button
                onClick={retry}
                className="text-blue-400 text-sm underline hover:text-blue-300 ml-2"
              >
                Retry
              </button>
            )}
          </div>
          <span className="text-xs text-gray-500">
            {filteredMarketData.length} cryptocurrencies
          </span>
        </div>

        {/* Market Data Table */}
        <Card className="bg-[#1a1340]/80 border-purple-800/30 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className={isMobile ? '' : 'overflow-x-auto'}>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-800/30">
                    <th className={`text-left font-medium text-gray-400 ${isMobile ? 'p-3 text-xs' : 'p-6 text-sm'}`}>Name</th>
                    <th className={`text-left font-medium text-gray-400 ${isMobile ? 'p-3 text-xs' : 'p-6 text-sm'}`}>{isMobile ? 'Price' : 'Last Price'}</th>
                    <th className={`text-left font-medium text-gray-400 ${isMobile ? 'p-3 text-xs' : 'p-6 text-sm'}`}>{isMobile ? '24h' : '24h Change'}</th>
                    {!isMobile && <th className="text-left p-6 font-medium text-gray-400 text-sm">24h High</th>}
                    {!isMobile && <th className="text-left p-6 font-medium text-gray-400 text-sm">24h Low</th>}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    // Loading skeleton rows
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="border-b border-purple-800/20">
                        <td className={isMobile ? 'p-3' : 'p-6'}>
                          <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
                            <div className={`bg-gray-700 rounded-full animate-pulse ${isMobile ? 'w-6 h-6' : 'w-10 h-10'}`}></div>
                            <div>
                              <div className={`bg-gray-700 rounded animate-pulse mb-1 ${isMobile ? 'h-3 w-12' : 'h-4 w-20'}`}></div>
                              <div className={`bg-gray-700 rounded animate-pulse ${isMobile ? 'h-2 w-8' : 'h-3 w-16'}`}></div>
                            </div>
                          </div>
                        </td>
                        <td className={isMobile ? 'p-3' : 'p-6'}><div className={`bg-gray-700 rounded animate-pulse ${isMobile ? 'h-3 w-16' : 'h-4 w-24'}`}></div></td>
                        <td className={isMobile ? 'p-3' : 'p-6'}><div className={`bg-gray-700 rounded animate-pulse ${isMobile ? 'h-3 w-10' : 'h-4 w-16'}`}></div></td>
                        {!isMobile && <td className="p-6"><div className="h-4 bg-gray-700 rounded animate-pulse w-20"></div></td>}
                        {!isMobile && <td className="p-6"><div className="h-4 bg-gray-700 rounded animate-pulse w-20"></div></td>}
                      </tr>
                    ))
                  ) : filteredMarketData.length === 0 ? (
                    <tr>
                      <td colSpan={isMobile ? 3 : 5} className="py-12 text-center">
                        <span className="text-gray-400">No cryptocurrencies found matching "{searchQuery}"</span>
                      </td>
                    </tr>
                  ) : (
                    filteredMarketData.map((crypto) => (
                      <tr key={crypto.symbol} className="border-b border-purple-800/20 hover:bg-purple-900/20 transition-colors">
                        <td className={isMobile ? 'p-3' : 'p-6'}>
                          <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-3'}`}>
                            <div className={`rounded-full overflow-hidden bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center border border-purple-500/30 ${isMobile ? 'w-8 h-8' : 'w-12 h-12'}`}>
                              <img
                                src={crypto.image || `https://cryptoicons.org/api/icon/${crypto.symbol.split('/')[0].toLowerCase()}/200`}
                                alt={crypto.name}
                                className={`object-contain ${isMobile ? 'w-6 h-6' : 'w-9 h-9'}`}
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                              <span
                                className={`text-white font-bold hidden ${isMobile ? 'text-xs' : 'text-sm'}`}
                              >
                                {crypto.symbol.split('/')[0].charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className={`font-medium text-white ${isMobile ? 'text-sm' : ''}`}>{crypto.symbol}</div>
                              <div className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>{crypto.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className={`text-white font-medium ${isMobile ? 'p-3 text-sm' : 'p-6'}`}>{crypto.price}</td>
                        <td className={isMobile ? 'p-3' : 'p-6'}>
                          <div className={`flex items-center space-x-1 ${crypto.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {crypto.isPositive ? <TrendingUp className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} /> : <TrendingDown className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} />}
                            <span className={`font-medium ${isMobile ? 'text-xs' : ''}`}>{crypto.change}</span>
                          </div>
                        </td>
                        {!isMobile && <td className="p-6 text-gray-300">{crypto.high}</td>}
                        {!isMobile && <td className="p-6 text-gray-300">{crypto.low}</td>}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
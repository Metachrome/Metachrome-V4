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
  const [activeTab, setActiveTab] = useState("Spot");
  const isMobile = useIsMobile();

  // Use real-time CoinMarketCap data
  const { cryptoData, loading, error, forceRefresh, retry } = useCryptoData();

  // Filter data based on search query
  const filteredMarketData = cryptoData.filter(crypto =>
    crypto.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    crypto.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = ["Favorites", "Options", "Spot"];

  return (
    <div className="min-h-screen bg-[#10121E]">
      {/* Header Section with Dark Background */}
      <div className="bg-[#0B0E17] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className={`font-bold text-white py-5 ${isMobile ? 'text-xl' : 'text-3xl'}`}>Markets</h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs and Search - Mobile: Stack vertically, Desktop: One row */}
        <div className={`mb-8 ${isMobile ? 'space-y-3' : 'flex items-center justify-between'}`}>
          {/* Tabs */}
          <div className="flex items-center space-x-1">
            {tabs.map((tab) => (
              <Button
                key={tab}
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(tab)}
                className={activeTab === tab
                  ? "bg-purple-600 text-white hover:bg-purple-700 px-6 py-2 rounded-md"
                  : "bg-transparent text-gray-300 hover:bg-gray-700 px-6 py-2 rounded-md"
                }
              >
                {tab}
              </Button>
            ))}
          </div>

          {/* Search and Refresh */}
          <div className={`flex items-center ${isMobile ? 'w-full gap-2' : 'space-x-4'}`}>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-800/30">
                    <th className="text-left p-6 font-medium text-gray-400 text-sm">Name</th>
                    <th className="text-left p-6 font-medium text-gray-400 text-sm">Last Price</th>
                    <th className="text-left p-6 font-medium text-gray-400 text-sm">24h Change</th>
                    <th className="text-left p-6 font-medium text-gray-400 text-sm">24h High</th>
                    <th className="text-left p-6 font-medium text-gray-400 text-sm">24h Low</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    // Loading skeleton rows
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="border-b border-purple-800/20">
                        <td className="p-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse"></div>
                            <div>
                              <div className="h-4 bg-gray-700 rounded animate-pulse mb-1 w-20"></div>
                              <div className="h-3 bg-gray-700 rounded animate-pulse w-16"></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6"><div className="h-4 bg-gray-700 rounded animate-pulse w-24"></div></td>
                        <td className="p-6"><div className="h-4 bg-gray-700 rounded animate-pulse w-16"></div></td>
                        <td className="p-6"><div className="h-4 bg-gray-700 rounded animate-pulse w-20"></div></td>
                        <td className="p-6"><div className="h-4 bg-gray-700 rounded animate-pulse w-20"></div></td>
                      </tr>
                    ))
                  ) : filteredMarketData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <span className="text-gray-400">No cryptocurrencies found matching "{searchQuery}"</span>
                      </td>
                    </tr>
                  ) : (
                    filteredMarketData.map((crypto) => (
                      <tr key={crypto.symbol} className="border-b border-purple-800/20 hover:bg-purple-900/20 transition-colors">
                        <td className="p-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center border border-purple-500/30">
                              <img
                                src={crypto.image || `https://cryptoicons.org/api/icon/${crypto.symbol.split('/')[0].toLowerCase()}/200`}
                                alt={crypto.name}
                                className="w-9 h-9 object-contain"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                              <span
                                className="text-white font-bold text-sm hidden"
                              >
                                {crypto.symbol.split('/')[0].charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-white">{crypto.symbol}</div>
                              <div className="text-sm text-gray-400">{crypto.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6 text-white font-medium">{crypto.price}</td>
                        <td className="p-6">
                          <div className={`flex items-center space-x-1 ${crypto.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {crypto.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            <span className="font-medium">{crypto.change}</span>
                          </div>
                        </td>
                        <td className="p-6 text-gray-300">{crypto.high}</td>
                        <td className="p-6 text-gray-300">{crypto.low}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex justify-center mt-8">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 rounded-full bg-purple-600 text-white hover:bg-purple-700"
            >
              1
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 rounded-full bg-transparent text-gray-400 hover:bg-gray-700"
            >
              2
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
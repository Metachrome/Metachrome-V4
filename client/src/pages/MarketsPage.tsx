import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Star, RefreshCw } from "lucide-react";
import { useIsMobile } from "../hooks/use-mobile";
import { useCryptoData } from "../services/cryptoDataService";
import type { MarketData } from "@shared/schema";

export default function MarketsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Spot");
  const isMobile = useIsMobile();

  // Use real-time CoinMarketCap data
  const { cryptoData, loading, error, forceRefresh, retry } = useCryptoData();

  // Transform CoinMarketCap data to match the Markets page format
  const transformedMarketData = cryptoData.map(crypto => {
    const symbol = crypto.symbol.replace('/USDT', '');
    return {
      symbol: symbol,
      pair: "USDT",
      price: crypto.price,
      change: crypto.change,
      isPositive: crypto.isPositive,
      leverage: "10X",
      rawPrice: crypto.rawPrice,
      rawChange: crypto.rawChange
    };
  });

  // Filter data based on search query
  const filteredMarketData = transformedMarketData.filter(item =>
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${item.symbol}${item.pair}`.toLowerCase().includes(searchQuery.toLowerCase())
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
        <div className={`mb-8 ${isMobile ? 'space-y-4' : 'flex items-center justify-between'}`}>
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
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search cryptocurrencies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-[#3A3A4E] border-gray-600 text-white placeholder-gray-400 rounded-md"
              />
            </div>
            <Button
              onClick={forceRefresh}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Updating...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : error ? 'bg-red-400' : 'bg-green-400'}`}></div>
            <span className="text-sm text-gray-400">
              {loading ? 'Updating market data...' : error ? 'Using cached data' : 'Real-time data from CoinMarketCap'}
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
        <div className="bg-transparent">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-8 px-6 font-medium text-gray-400 text-sm">Name</th>
                  <th className="text-center py-8 px-6 font-medium text-gray-400 text-sm">Price</th>
                  <th className="text-right py-8 px-6 font-medium text-gray-400 text-sm">24h Change</th>
                </tr>
              </thead>
              <tbody>
                {loading && filteredMarketData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                        <span className="text-gray-400">Loading market data...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredMarketData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center">
                      <span className="text-gray-400">No cryptocurrencies found matching "{searchQuery}"</span>
                    </td>
                  </tr>
                ) : (
                  filteredMarketData.map((data, index) => (
                    <tr key={`${data.symbol}-${index}`} className="border-b border-gray-600/20 hover:bg-gray-700/10 transition cursor-pointer">
                      <td className="py-8 px-6">
                        <div className="flex items-center space-x-4">
                          <Star className="w-4 h-4 text-gray-500 hover:text-yellow-400 cursor-pointer" />
                          <div className="flex items-center space-x-3">
                            <span className="font-medium text-white text-sm">{data.symbol}</span>
                            <span className="text-gray-400 text-sm">/ {data.pair}</span>
                            <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                              {data.leverage}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-8 px-6 text-center">
                        <div className="font-mono text-white text-sm">
                          {data.price}
                        </div>
                      </td>
                      <td className="py-8 px-6 text-right">
                        <div className={`font-medium text-sm ${
                          data.isPositive ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {data.change}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

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
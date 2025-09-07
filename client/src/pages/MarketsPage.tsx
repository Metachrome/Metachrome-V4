import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Star } from "lucide-react";
import type { MarketData } from "@shared/schema";

export default function MarketsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Spot");

  const { data: marketData, isLoading } = useQuery<MarketData[]>({
    queryKey: ["/api/market-data"],
  });

  const filteredMarketData = marketData?.filter(item =>
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const tabs = ["Favorites", "Options", "Spot"];

  // Mock data to match the design exactly
  const mockMarketData = [
    { symbol: "BTC", pair: "USDT", price: "$118809.98", change: "0.66%", isPositive: true, leverage: "10X" },
    { symbol: "ETH", pair: "USDT", price: "$3782.99", change: "1.14%", isPositive: true, leverage: "10X" },
    { symbol: "DOGE", pair: "USDT", price: "$0.239770", change: "1.25%", isPositive: true, leverage: "10X" },
    { symbol: "XRP", pair: "USDT", price: "$3.199800", change: "1.59%", isPositive: true, leverage: "10X" },
    { symbol: "TRUMP", pair: "USDT", price: "$16.1068", change: "4.30%", isPositive: true, leverage: "10X" },
    { symbol: "PEPE", pair: "USDT", price: "$0.00001-0.0000", change: "6.10%", isPositive: true, leverage: "10X" },
    { symbol: "ADA", pair: "USDT", price: "$1.018969", change: "6.18%", isPositive: true, leverage: "10X" },
    { symbol: "SOL", pair: "USDT", price: "$4.178390", change: "3.71%", isPositive: true, leverage: "10X" },
    { symbol: "LINK", pair: "USDT", price: "$18.1508", change: "3.44%", isPositive: true, leverage: "10X" },
    { symbol: "LTC", pair: "USDT", price: "$119.21", change: "1.83%", isPositive: true, leverage: "10X" },
  ];

  return (
    <div className="min-h-screen bg-[#10121E]">
      {/* Header Section with Dark Background */}
      <div className="bg-[#0B0E17] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white py-5">Markets</h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Tabs and Search in one row */}
        <div className="flex items-center justify-between mb-16">
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

          {/* Search */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-[#3A3A4E] border-gray-600 text-white placeholder-gray-400 rounded-md"
              />
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md">
              Search
            </Button>
          </div>
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
                {mockMarketData.map((data, index) => (
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
                ))}
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
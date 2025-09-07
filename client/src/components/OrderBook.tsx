import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { MarketData } from "@shared/schema";

interface OrderBookProps {
  symbol: string;
}

interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

export default function OrderBook({ symbol }: OrderBookProps) {
  const [viewMode, setViewMode] = useState<"all" | "sells" | "buys">("all");
  const [sellOrders, setSellOrders] = useState<OrderBookEntry[]>([]);
  const [buyOrders, setBuyOrders] = useState<OrderBookEntry[]>([]);

  const { data: marketData } = useQuery<MarketData[]>({
    queryKey: ["/api/market-data"],
  });

  const currentPrice = parseFloat(marketData?.find(data => data.symbol === symbol)?.price || "0");

  // Generate mock order book data
  useEffect(() => {
    if (currentPrice === 0) return;

    const generateOrders = (basePrice: number, isAsk: boolean) => {
      const orders: OrderBookEntry[] = [];
      let total = 0;

      for (let i = 0; i < 10; i++) {
        const priceOffset = (i + 1) * (Math.random() * 5 + 1);
        const price = isAsk ? basePrice + priceOffset : basePrice - priceOffset;
        const size = Math.random() * 2 + 0.1;
        total += size;

        orders.push({
          price: parseFloat(price.toFixed(2)),
          size: parseFloat(size.toFixed(3)),
          total: parseFloat(total.toFixed(3))
        });
      }

      return orders;
    };

    setSellOrders(generateOrders(currentPrice, true));
    setBuyOrders(generateOrders(currentPrice, false));

    // Update orders every 2 seconds
    const interval = setInterval(() => {
      setSellOrders(generateOrders(currentPrice, true));
      setBuyOrders(generateOrders(currentPrice, false));
    }, 2000);

    return () => clearInterval(interval);
  }, [currentPrice]);

  const maxTotal = Math.max(
    ...sellOrders.map(order => order.total),
    ...buyOrders.map(order => order.total)
  );

  const OrderRow = ({ order, type }: { order: OrderBookEntry; type: "buy" | "sell" }) => {
    const percentage = (order.total / maxTotal) * 100;
    const bgColor = type === "buy" ? "bg-green-500/10" : "bg-red-500/10";
    
    return (
      <div className="relative flex justify-between items-center py-1 px-2 text-xs hover:bg-dark-100/50">
        <div 
          className={`absolute right-0 top-0 h-full ${bgColor} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
        <span className={`relative z-10 font-mono ${type === "buy" ? "text-green-400" : "text-red-400"}`}>
          {order.price.toFixed(2)}
        </span>
        <span className="relative z-10 font-mono text-muted-foreground">
          {order.size.toFixed(3)}
        </span>
        <span className="relative z-10 font-mono text-muted-foreground">
          {order.total.toFixed(3)}
        </span>
      </div>
    );
  };

  return (
    <Card className="card-dark h-96">
      <CardContent className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Order Book</h3>
          <div className="flex space-x-1">
            <Button
              variant={viewMode === "sells" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("sells")}
              className="w-6 h-6 p-0 text-xs bg-red-500/20 text-red-500 hover:bg-red-500/30"
            >
              S
            </Button>
            <Button
              variant={viewMode === "buys" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("buys")}
              className="w-6 h-6 p-0 text-xs bg-green-500/20 text-green-500 hover:bg-green-500/30"
            >
              B
            </Button>
            <Button
              variant={viewMode === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("all")}
              className="w-6 h-6 p-0 text-xs bg-muted text-muted-foreground hover:bg-accent"
            >
              A
            </Button>
          </div>
        </div>

        {/* Header */}
        <div className="flex justify-between mb-2 text-xs text-muted-foreground border-b border-border pb-1">
          <span>Price</span>
          <span>Size</span>
          <span>Total</span>
        </div>

        <div className="flex-1 overflow-hidden">
          {/* Sell Orders */}
          {(viewMode === "all" || viewMode === "sells") && (
            <div className="flex flex-col-reverse max-h-32 overflow-hidden">
              {sellOrders.slice(0, viewMode === "sells" ? 15 : 8).map((order, index) => (
                <OrderRow key={`sell-${index}`} order={order} type="sell" />
              ))}
            </div>
          )}

          {/* Current Price */}
          {viewMode === "all" && (
            <div className="border-t border-b border-border py-2 my-1">
              <div className="text-center font-bold text-lg">
                <span className={currentPrice > 0 ? "text-green-400" : "text-red-400"}>
                  {currentPrice.toFixed(2)}
                </span>
              </div>
              <div className="text-center text-xs text-muted-foreground">
                ≈ ${currentPrice.toFixed(2)}
              </div>
            </div>
          )}

          {/* Buy Orders */}
          {(viewMode === "all" || viewMode === "buys") && (
            <div className="max-h-32 overflow-hidden">
              {buyOrders.slice(0, viewMode === "buys" ? 15 : 8).map((order, index) => (
                <OrderRow key={`buy-${index}`} order={order} type="buy" />
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-2 pt-2 border-t border-border">
          <div className="flex justify-between text-xs">
            <div className="text-green-400">
              Σ{buyOrders.reduce((sum, order) => sum + order.size, 0).toFixed(3)}
            </div>
            <div className="text-red-400">
              Σ{sellOrders.reduce((sum, order) => sum + order.size, 0).toFixed(3)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

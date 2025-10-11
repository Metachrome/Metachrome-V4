import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Expand, BarChart3, TrendingUp } from "lucide-react";
import type { MarketData } from "@shared/schema";

interface TradingChartProps {
  symbol: string;
  height?: number;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

export default function TradingChart({ symbol, height = 400 }: TradingChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tradingViewRef = useRef<HTMLDivElement>(null);
  const [timeframe, setTimeframe] = useState("15");
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartType, setChartType] = useState<'tradingview' | 'custom'>('tradingview');
  const [isLoading, setIsLoading] = useState(true);

  const { data: marketData, refetch } = useQuery<MarketData[]>({
    queryKey: ["/api/market-data"],
    refetchInterval: 1000, // Refetch every second for real-time data
  });

  const currentPrice = marketData?.find(data => data.symbol === symbol)?.price || "0";

  // Load TradingView widget
  useEffect(() => {
    if (chartType === 'tradingview' && tradingViewRef.current) {
      // Load TradingView script if not already loaded
      if (!window.TradingView) {
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = () => {
          initTradingViewWidget();
        };
        document.head.appendChild(script);
      } else {
        initTradingViewWidget();
      }
    }
  }, [chartType, symbol, timeframe]);

  const initTradingViewWidget = () => {
    if (!window.TradingView || !tradingViewRef.current) return;

    setIsLoading(true);

    // Clear previous widget
    tradingViewRef.current.innerHTML = '';

    new window.TradingView.widget({
      autosize: true,
      symbol: `BINANCE:${symbol}`,
      interval: timeframe,
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      toolbar_bg: "#1a1a1a",
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      container_id: tradingViewRef.current.id,
      studies: [
        // "Volume@tv-basicstudies", // Volume bars disabled
        "MACD@tv-basicstudies",
        "RSI@tv-basicstudies"
      ],
      overrides: {
        "paneProperties.background": "#0f0f0f",
        "paneProperties.vertGridProperties.color": "#1a1a1a",
        "paneProperties.horzGridProperties.color": "#1a1a1a",
        "symbolWatermarkProperties.transparency": 90,
        "scalesProperties.textColor": "#AAA",
        "mainSeriesProperties.candleStyle.upColor": "#10b981",
        "mainSeriesProperties.candleStyle.downColor": "#ef4444",
        "mainSeriesProperties.candleStyle.borderUpColor": "#10b981",
        "mainSeriesProperties.candleStyle.borderDownColor": "#ef4444",
        "mainSeriesProperties.candleStyle.wickUpColor": "#10b981",
        "mainSeriesProperties.candleStyle.wickDownColor": "#ef4444"
      },
      onChartReady: () => {
        setIsLoading(false);
      }
    });
  };

  // Generate sample OHLCV data for custom chart
  useEffect(() => {
    if (chartType === 'custom') {
      const generateChartData = () => {
        const data = [];
        const basePrice = parseFloat(currentPrice) || 113812;
        let price = basePrice;

        for (let i = 0; i < 50; i++) {
          const change = (Math.random() - 0.5) * 200;
          const open = price;
          const close = price + change;
          const high = Math.max(open, close) + Math.random() * 100;
          const low = Math.min(open, close) - Math.random() * 100;
          const volume = Math.random() * 1000;

          data.push({
            time: new Date(Date.now() - (49 - i) * 15 * 60 * 1000),
            open,
            high,
            low,
            close,
            volume
          });

          price = close;
        }

        setChartData(data);
      };

      if (currentPrice !== "0") {
        generateChartData();
      }
    }
  }, [currentPrice, timeframe, chartType]);

  // Draw candlestick chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || chartData.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Calculate price range
    const prices = chartData.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;
    const padding = priceRange * 0.1;

    // Chart dimensions
    const chartHeight = height - 60;
    const chartWidth = width - 80;
    const barWidth = chartWidth / chartData.length;

    // Draw grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = 30 + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(width - 40, y);
      ctx.stroke();
      
      // Price labels
      const price = maxPrice + padding - ((maxPrice + padding - (minPrice - padding)) / 5) * i;
      ctx.fillStyle = "#9CA3AF";
      ctx.font = "10px Inter";
      ctx.textAlign = "right";
      ctx.fillText(price.toFixed(2), 35, y + 3);
    }

    // Vertical grid lines
    for (let i = 0; i < chartData.length; i += 10) {
      const x = 40 + barWidth * i;
      ctx.beginPath();
      ctx.moveTo(x, 30);
      ctx.lineTo(x, height - 30);
      ctx.stroke();
    }

    // Draw candlesticks
    chartData.forEach((data, index) => {
      const x = 40 + barWidth * index;
      const openY = 30 + ((maxPrice + padding - data.open) / (maxPrice + padding - (minPrice - padding))) * chartHeight;
      const closeY = 30 + ((maxPrice + padding - data.close) / (maxPrice + padding - (minPrice - padding))) * chartHeight;
      const highY = 30 + ((maxPrice + padding - data.high) / (maxPrice + padding - (minPrice - padding))) * chartHeight;
      const lowY = 30 + ((maxPrice + padding - data.low) / (maxPrice + padding - (minPrice - padding))) * chartHeight;

      const isGreen = data.close > data.open;
      const color = isGreen ? "#10B981" : "#EF4444";

      // Draw wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + barWidth / 2, highY);
      ctx.lineTo(x + barWidth / 2, lowY);
      ctx.stroke();

      // Draw body
      ctx.fillStyle = color;
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(closeY - openY);
      ctx.fillRect(x + 2, bodyTop, barWidth - 4, Math.max(bodyHeight, 1));
    });

    // Draw current price line
    if (chartData.length > 0) {
      const lastPrice = parseFloat(currentPrice);
      const priceY = 30 + ((maxPrice + padding - lastPrice) / (maxPrice + padding - (minPrice - padding))) * chartHeight;
      
      ctx.strokeStyle = "#8B5CF6";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(40, priceY);
      ctx.lineTo(width - 40, priceY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price label
      ctx.fillStyle = "#8B5CF6";
      ctx.fillRect(width - 80, priceY - 10, 75, 20);
      ctx.fillStyle = "white";
      ctx.font = "12px Inter";
      ctx.textAlign = "center";
      ctx.fillText(lastPrice.toFixed(2), width - 42.5, priceY + 4);
    }
  }, [chartData, currentPrice]);

  return (
    <Card className="card-dark">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Button
                variant={chartType === 'tradingview' ? "default" : "ghost"}
                size="sm"
                onClick={() => setChartType('tradingview')}
                className="text-xs"
              >
                <BarChart3 className="w-3 h-3 mr-1" />
                TradingView
              </Button>
              <Button
                variant={chartType === 'custom' ? "default" : "ghost"}
                size="sm"
                onClick={() => setChartType('custom')}
                className="text-xs"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                Custom
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-400">
              {symbol} • ${parseFloat(currentPrice).toLocaleString()}
            </div>
            <Button variant="ghost" size="sm">
              <Expand className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="trading-chart relative">
          {isLoading && chartType === 'tradingview' && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-10">
              <div className="text-white">Loading TradingView Chart...</div>
            </div>
          )}

          {chartType === 'tradingview' ? (
            <div
              ref={tradingViewRef}
              id={`tradingview_${symbol}_${Date.now()}`}
              style={{ height: `${height}px` }}
              className="w-full"
            />
          ) : (
            <canvas
              ref={canvasRef}
              width={600}
              height={height}
              className="w-full h-full"
              style={{ height: `${height}px` }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

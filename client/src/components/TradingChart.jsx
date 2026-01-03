import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Expand, BarChart3, TrendingUp } from "lucide-react";
export default function TradingChart(_a) {
    var _b;
    var symbol = _a.symbol, _c = _a.height, height = _c === void 0 ? 400 : _c;
    var canvasRef = useRef(null);
    var tradingViewRef = useRef(null);
    var _d = useState("15"), timeframe = _d[0], setTimeframe = _d[1];
    var _e = useState([]), chartData = _e[0], setChartData = _e[1];
    var _f = useState('tradingview'), chartType = _f[0], setChartType = _f[1];
    var _g = useState(true), isLoading = _g[0], setIsLoading = _g[1];
    var _h = useQuery({
        queryKey: ["/api/market-data"],
        refetchInterval: 1000, // Refetch every second for real-time data
    }), marketData = _h.data, refetch = _h.refetch;
    var currentPrice = ((_b = marketData === null || marketData === void 0 ? void 0 : marketData.find(function (data) { return data.symbol === symbol; })) === null || _b === void 0 ? void 0 : _b.price) || "0";
    // Load TradingView widget
    useEffect(function () {
        if (chartType === 'tradingview' && tradingViewRef.current) {
            // Load TradingView script if not already loaded
            if (!window.TradingView) {
                var script = document.createElement('script');
                script.src = 'https://s3.tradingview.com/tv.js';
                script.async = true;
                script.onload = function () {
                    initTradingViewWidget();
                };
                document.head.appendChild(script);
            }
            else {
                initTradingViewWidget();
            }
        }
    }, [chartType, symbol, timeframe]);
    var initTradingViewWidget = function () {
        if (!window.TradingView || !tradingViewRef.current)
            return;
        setIsLoading(true);
        // Clear previous widget
        tradingViewRef.current.innerHTML = '';
        new window.TradingView.widget({
            autosize: true,
            symbol: "BINANCE:".concat(symbol),
            interval: timeframe,
            timezone: "Etc/UTC",
            theme: "dark",
            style: "1",
            locale: "en",
            toolbar_bg: "#000000",
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
            disabled_features: [
                "volume_force_overlay",
                "create_volume_indicator_by_default"
            ],
            hide_volume: true,
            overrides: {
                "paneProperties.background": "#000000",
                "paneProperties.vertGridProperties.color": "#1a1a1a",
                "paneProperties.horzGridProperties.color": "#1a1a1a",
                "symbolWatermarkProperties.transparency": 90,
                "scalesProperties.textColor": "#666666",
                "mainSeriesProperties.candleStyle.upColor": "#10b981",
                "mainSeriesProperties.candleStyle.downColor": "#ef4444",
                "mainSeriesProperties.candleStyle.borderUpColor": "#10b981",
                "mainSeriesProperties.candleStyle.borderDownColor": "#ef4444",
                "mainSeriesProperties.candleStyle.wickUpColor": "#10b981",
                "mainSeriesProperties.candleStyle.wickDownColor": "#ef4444",
                // Hide volume completely
                "volumePaneSize": "xtiny"
            },
            studies_overrides: {
                // Make volume completely transparent
                "volume.volume.color.0": "rgba(0,0,0,0)",
                "volume.volume.color.1": "rgba(0,0,0,0)",
                "volume.volume.transparency": 100,
                "volume.volume ma.color": "rgba(0,0,0,0)",
                "volume.volume ma.transparency": 100,
                "volume.show ma": false
            },
            onChartReady: function () {
                setIsLoading(false);
            }
        });
    };
    // Generate sample OHLCV data for custom chart
    useEffect(function () {
        if (chartType === 'custom') {
            var generateChartData = function () {
                var data = [];
                var basePrice = parseFloat(currentPrice) || 113812;
                var price = basePrice;
                for (var i = 0; i < 50; i++) {
                    var change = (Math.random() - 0.5) * 200;
                    var open_1 = price;
                    var close_1 = price + change;
                    var high = Math.max(open_1, close_1) + Math.random() * 100;
                    var low = Math.min(open_1, close_1) - Math.random() * 100;
                    var volume = Math.random() * 1000;
                    data.push({
                        time: new Date(Date.now() - (49 - i) * 15 * 60 * 1000),
                        open: open_1,
                        high: high,
                        low: low,
                        close: close_1,
                        volume: volume
                    });
                    price = close_1;
                }
                setChartData(data);
            };
            if (currentPrice !== "0") {
                generateChartData();
            }
        }
    }, [currentPrice, timeframe, chartType]);
    // Draw candlestick chart
    useEffect(function () {
        var canvas = canvasRef.current;
        if (!canvas || chartData.length === 0)
            return;
        var ctx = canvas.getContext("2d");
        if (!ctx)
            return;
        var width = canvas.width, height = canvas.height;
        ctx.clearRect(0, 0, width, height);
        // Calculate price range
        var prices = chartData.flatMap(function (d) { return [d.high, d.low]; });
        var minPrice = Math.min.apply(Math, prices);
        var maxPrice = Math.max.apply(Math, prices);
        var priceRange = maxPrice - minPrice;
        var padding = priceRange * 0.1;
        // Chart dimensions
        var chartHeight = height - 60;
        var chartWidth = width - 80;
        var barWidth = chartWidth / chartData.length;
        // Draw grid lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1;
        // Horizontal grid lines
        for (var i = 0; i <= 5; i++) {
            var y = 30 + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(40, y);
            ctx.lineTo(width - 40, y);
            ctx.stroke();
            // Price labels
            var price = maxPrice + padding - ((maxPrice + padding - (minPrice - padding)) / 5) * i;
            ctx.fillStyle = "#9CA3AF";
            ctx.font = "10px Inter";
            ctx.textAlign = "right";
            ctx.fillText(price.toFixed(2), 35, y + 3);
        }
        // Vertical grid lines
        for (var i = 0; i < chartData.length; i += 10) {
            var x = 40 + barWidth * i;
            ctx.beginPath();
            ctx.moveTo(x, 30);
            ctx.lineTo(x, height - 30);
            ctx.stroke();
        }
        // Draw candlesticks
        chartData.forEach(function (data, index) {
            var x = 40 + barWidth * index;
            var openY = 30 + ((maxPrice + padding - data.open) / (maxPrice + padding - (minPrice - padding))) * chartHeight;
            var closeY = 30 + ((maxPrice + padding - data.close) / (maxPrice + padding - (minPrice - padding))) * chartHeight;
            var highY = 30 + ((maxPrice + padding - data.high) / (maxPrice + padding - (minPrice - padding))) * chartHeight;
            var lowY = 30 + ((maxPrice + padding - data.low) / (maxPrice + padding - (minPrice - padding))) * chartHeight;
            var isGreen = data.close > data.open;
            var color = isGreen ? "#10B981" : "#EF4444";
            // Draw wick
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x + barWidth / 2, highY);
            ctx.lineTo(x + barWidth / 2, lowY);
            ctx.stroke();
            // Draw body
            ctx.fillStyle = color;
            var bodyTop = Math.min(openY, closeY);
            var bodyHeight = Math.abs(closeY - openY);
            ctx.fillRect(x + 2, bodyTop, barWidth - 4, Math.max(bodyHeight, 1));
        });
        // Draw current price line
        if (chartData.length > 0) {
            var lastPrice = parseFloat(currentPrice);
            var priceY = 30 + ((maxPrice + padding - lastPrice) / (maxPrice + padding - (minPrice - padding))) * chartHeight;
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
    return (<Card className="card-dark">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Button variant={chartType === 'tradingview' ? "default" : "ghost"} size="sm" onClick={function () { return setChartType('tradingview'); }} className="text-xs">
                <BarChart3 className="w-3 h-3 mr-1"/>
                TradingView
              </Button>
              <Button variant={chartType === 'custom' ? "default" : "ghost"} size="sm" onClick={function () { return setChartType('custom'); }} className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1"/>
                Custom
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-400">
              {symbol} • ${parseFloat(currentPrice).toLocaleString()}
            </div>
            <Button variant="ghost" size="sm">
              <Expand className="w-4 h-4"/>
            </Button>
          </div>
        </div>

        <div className="trading-chart relative">
          {isLoading && chartType === 'tradingview' && (<div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-10">
              <div className="text-white">Loading TradingView Chart...</div>
            </div>)}

          {chartType === 'tradingview' ? (<div ref={tradingViewRef} id={"tradingview_".concat(symbol, "_").concat(Date.now())} style={{ height: "".concat(height, "px") }} className="w-full"/>) : (<canvas ref={canvasRef} width={600} height={height} className="w-full h-full" style={{ height: "".concat(height, "px") }}/>)}
        </div>
      </CardContent>
    </Card>);
}

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';
import { usePrice } from '../contexts/PriceContext';
export default function LightweightChart(_a) {
    var _this = this;
    var _b = _a.symbol, symbol = _b === void 0 ? 'BTCUSDT' : _b, _c = _a.interval, interval = _c === void 0 ? '1m' : _c, _d = _a.height, height = _d === void 0 ? 400 : _d, _e = _a.containerId, containerId = _e === void 0 ? 'lightweight_chart' : _e;
    var chartContainerRef = useRef(null);
    var chartRef = useRef(null);
    var candlestickSeriesRef = useRef(null);
    // const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null); // Volume disabled
    var _f = useState(true), isLoading = _f[0], setIsLoading = _f[1];
    var _g = useState(null), error = _g[0], setError = _g[1];
    var priceData = usePrice().priceData;
    // Initialize chart
    useEffect(function () {
        if (!chartContainerRef.current)
            return;
        console.log('📊 [LightweightChart] Initializing chart for', symbol, interval);
        // Calculate chart height - handle different height formats
        var chartHeight = 400; // default
        if (typeof height === 'number') {
            chartHeight = height;
        }
        else if (typeof height === 'string') {
            if (height.includes('%')) {
                // For percentage heights, use the container's actual height
                chartHeight = chartContainerRef.current.clientHeight || window.innerHeight * 0.8;
            }
            else if (height.includes('calc(') || height.includes('vh')) {
                // For calc() or vh values, use container height or calculate from viewport
                var containerHeight = chartContainerRef.current.clientHeight;
                if (containerHeight > 50) { // Ensure we have a reasonable height
                    chartHeight = containerHeight;
                }
                else {
                    // Mobile fallback: use most of viewport minus header space
                    chartHeight = Math.max(400, window.innerHeight - 150);
                }
            }
            else {
                chartHeight = parseInt(height) || 400;
            }
        }
        // Create chart
        var chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: chartHeight,
            layout: {
                background: { color: '#10121E' },
                textColor: '#D1D5DB',
                fontSize: 11, // Smaller font for mobile
            },
            grid: {
                vertLines: {
                    color: '#1F2937',
                    visible: true
                },
                horzLines: {
                    color: '#1F2937',
                    visible: true
                },
            },
            crosshair: {
                mode: 0, // Completely disabled crosshair
                vertLine: {
                    visible: false,
                    labelVisible: false,
                },
                horzLine: {
                    visible: false,
                    labelVisible: false,
                },
            },
            rightPriceScale: {
                borderColor: '#374151',
                width: 45, // Very compact width for mobile
                scaleMargins: {
                    top: 0.05,
                    bottom: 0.05,
                },
                minimumWidth: 45,
                entireTextOnly: false, // Allow partial text for compact display
            },
            timeScale: {
                borderColor: '#374151',
                timeVisible: true,
                secondsVisible: false,
            },
            // Disable any automatic price lines
            handleScroll: false,
            handleScale: false,
        });
        chartRef.current = chart;
        // Add candlestick series
        var candlestickSeries = chart.addCandlestickSeries({
            upColor: '#10B981',
            downColor: '#EF4444',
            borderUpColor: '#10B981',
            borderDownColor: '#EF4444',
            wickUpColor: '#10B981',
            wickDownColor: '#EF4444',
            // Explicitly disable any price lines
            priceLineVisible: false,
            lastValueVisible: false,
        });
        candlestickSeriesRef.current = candlestickSeries;
        // Remove any existing price lines that might be automatically added
        try {
            var priceLines = chart.priceScale('right').getPriceLines();
            if (priceLines && priceLines.length > 0) {
                priceLines.forEach(function (line) {
                    chart.removePriceLine(line);
                });
            }
        }
        catch (e) {
            // Ignore errors if price lines don't exist
            console.log('No price lines to remove');
        }
        // Volume series disabled - no volume bars displayed
        // const volumeSeries = chart.addHistogramSeries({
        //   color: '#6B7280',
        //   priceFormat: {
        //     type: 'volume',
        //   },
        //   priceScaleId: '', // Set as overlay
        // });
        // volumeSeriesRef.current = volumeSeries;
        // Handle resize
        var handleResize = function () {
            if (chartContainerRef.current && chartRef.current) {
                // Recalculate height for dynamic heights
                var newHeight = chartHeight;
                if (typeof height === 'string') {
                    if (height.includes('%') || height.includes('calc(') || height.includes('vh')) {
                        var containerHeight = chartContainerRef.current.clientHeight;
                        newHeight = containerHeight > 50 ? containerHeight : Math.max(400, window.innerHeight - 150);
                    }
                }
                chartRef.current.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: newHeight,
                });
            }
        };
        window.addEventListener('resize', handleResize);
        // Cleanup
        return function () {
            window.removeEventListener('resize', handleResize);
            try {
                if (chartRef.current) {
                    chartRef.current.remove();
                    chartRef.current = null;
                }
            }
            catch (error) {
                console.error('Error cleaning up chart:', error);
            }
        };
    }, [symbol, interval, height]);
    // Fetch and update chart data
    useEffect(function () {
        var fetchKlines = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, result, klines, err_1, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        setIsLoading(true);
                        setError(null);
                        console.log('📊 [LightweightChart] Fetching klines for', symbol, interval);
                        return [4 /*yield*/, fetch("/api/binance/klines?symbol=".concat(symbol, "&interval=").concat(interval, "&limit=500"))];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        if (!result.success || !result.data) {
                            throw new Error('Invalid response format');
                        }
                        klines = result.data;
                        console.log('✅ [LightweightChart] Received', klines.length, 'candles');
                        console.log('📊 [LightweightChart] Latest candle:', klines[klines.length - 1]);
                        // Update candlestick series
                        if (candlestickSeriesRef.current) {
                            candlestickSeriesRef.current.setData(klines);
                        }
                        // Volume series disabled - no volume data processing
                        // if (volumeSeriesRef.current) {
                        //   const volumeData = klines.map((candle: any) => ({
                        //     time: candle.time,
                        //     value: candle.volume,
                        //     color: candle.close >= candle.open ? '#10B98180' : '#EF444480' // Semi-transparent
                        //   }));
                        //   volumeSeriesRef.current.setData(volumeData);
                        // }
                        // Fit content
                        if (chartRef.current) {
                            chartRef.current.timeScale().fitContent();
                            // Additional cleanup: Remove any price lines that might have been added
                            setTimeout(function () {
                                try {
                                    // Force remove any price lines
                                    var chart = chartRef.current;
                                    if (chart) {
                                        // Try to access and remove price lines
                                        var priceScale = chart.priceScale('right');
                                        if (priceScale && typeof priceScale.removePriceLine === 'function') {
                                            // This will attempt to remove any automatically added price lines
                                            console.log('🧹 Attempting to clean up any automatic price lines');
                                        }
                                    }
                                }
                                catch (e) {
                                    // Silently ignore errors
                                }
                            }, 100);
                        }
                        setIsLoading(false);
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        errorMessage = err_1 instanceof Error ? err_1.message : 'Unknown error';
                        console.error('❌ [LightweightChart] Error fetching klines:', errorMessage);
                        setError(errorMessage);
                        setIsLoading(false);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        fetchKlines();
        // REMOVED: Auto-refresh interval - Chart should only update last candle with real-time price
        // Full chart refresh is annoying and unnecessary
        // Real-time updates are handled by the useEffect below that updates only the last candle
    }, [symbol, interval]);
    // Update last candle with real-time price
    useEffect(function () {
        if (!priceData || !candlestickSeriesRef.current)
            return;
        console.log('📊 [LightweightChart] Updating last candle with real-time price:', priceData.price);
        // Get current time in seconds
        var currentTime = Math.floor(Date.now() / 1000);
        // Update last candle (this will be replaced by next klines fetch)
        // This is just for visual real-time update
        candlestickSeriesRef.current.update({
            time: currentTime,
            open: priceData.openPrice,
            high: priceData.high24h,
            low: priceData.low24h,
            close: priceData.price
        });
    }, [priceData]);
    return (<div className="relative w-full" style={{ height: typeof height === 'number' ? "".concat(height, "px") : height }}>
      {isLoading && (<div className="absolute inset-0 flex items-center justify-center bg-[#10121E]/80 z-10">
          <div className="text-gray-400 text-sm">
            <div className="animate-pulse">Loading chart data...</div>
          </div>
        </div>)}

      {error && (<div className="absolute inset-0 flex items-center justify-center bg-[#10121E]/80 z-10">
          <div className="text-red-400 text-sm">
            Error loading chart: {error}
          </div>
        </div>)}

      <div ref={chartContainerRef} id={containerId} className="w-full h-full"/>

      {/* Chart Info Overlay */}
      {priceData && !isLoading && (<div className="absolute top-2 left-2 bg-[#10121E]/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-700 z-20">
          <div className="text-xs text-gray-400 mb-1">{symbol}</div>
          <div className="text-lg font-bold text-white">
            ${priceData.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={"text-sm ".concat(priceData.priceChangePercent24h >= 0 ? 'text-green-400' : 'text-red-400')}>
            {priceData.priceChangePercent24h >= 0 ? '+' : ''}{priceData.priceChangePercent24h.toFixed(2)}%
          </div>
        </div>)}
    </div>);
}

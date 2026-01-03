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
import React, { useEffect, useState } from 'react';
/**
 * Simple Fallback Chart Component
 * Displays a basic candlestick chart for unsupported symbols
 * Uses canvas for rendering to avoid DOM cleanup issues
 */
export default function SimpleFallbackChart(_a) {
    var _this = this;
    var _b = _a.symbol, symbol = _b === void 0 ? 'BTCUSDT' : _b, _c = _a.height, height = _c === void 0 ? 400 : _c;
    var _d = useState(true), isLoading = _d[0], setIsLoading = _d[1];
    var _e = useState(null), error = _e[0], setError = _e[1];
    var _f = React.useState(null), canvasRef = _f[0], setCanvasRef = _f[1];
    useEffect(function () {
        if (!canvasRef)
            return;
        var fetchAndDraw = function () { return __awaiter(_this, void 0, void 0, function () {
            var klines, response, result, apiErr_1, binanceUrl, controller_1, timeoutId, response, data, errorText, binanceErr_1, altUrl, controller2_1, timeoutId2, altResponse, altData, altErr_1, err_1, errorMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 22, , 23]);
                        setIsLoading(true);
                        setError(null);
                        console.log('📊 [SimpleFallbackChart] Fetching klines for', symbol);
                        klines = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, fetch("/api/binance/klines?symbol=".concat(symbol, "&interval=1m&limit=100"))];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.json()];
                    case 3:
                        result = _a.sent();
                        if (result.success && result.data) {
                            klines = result.data;
                            console.log('✅ [SimpleFallbackChart] Got klines from API:', klines.length);
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        console.warn('⚠️ [SimpleFallbackChart] API returned status:', response.status);
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        apiErr_1 = _a.sent();
                        console.warn('⚠️ [SimpleFallbackChart] API endpoint failed:', apiErr_1);
                        return [3 /*break*/, 7];
                    case 7:
                        if (!!klines) return [3 /*break*/, 15];
                        _a.label = 8;
                    case 8:
                        _a.trys.push([8, 14, , 15]);
                        console.log('📊 [SimpleFallbackChart] Trying direct Binance API for', symbol);
                        binanceUrl = "https://api.binance.com/api/v3/klines?symbol=".concat(symbol, "&interval=1m&limit=100");
                        controller_1 = new AbortController();
                        timeoutId = setTimeout(function () { return controller_1.abort(); }, 5000);
                        return [4 /*yield*/, fetch(binanceUrl, { signal: controller_1.signal })];
                    case 9:
                        response = _a.sent();
                        clearTimeout(timeoutId);
                        if (!response.ok) return [3 /*break*/, 11];
                        return [4 /*yield*/, response.json()];
                    case 10:
                        data = _a.sent();
                        console.log('✅ [SimpleFallbackChart] Got data from Binance:', data.length, 'candles');
                        // Transform Binance format to our format
                        klines = data.map(function (candle) { return ({
                            time: Math.floor(candle[0] / 1000),
                            open: parseFloat(candle[1]),
                            high: parseFloat(candle[2]),
                            low: parseFloat(candle[3]),
                            close: parseFloat(candle[4]),
                            volume: parseFloat(candle[5])
                        }); });
                        return [3 /*break*/, 13];
                    case 11:
                        console.warn('⚠️ [SimpleFallbackChart] Binance API returned status:', response.status);
                        return [4 /*yield*/, response.text()];
                    case 12:
                        errorText = _a.sent();
                        console.warn('⚠️ [SimpleFallbackChart] Binance error:', errorText);
                        _a.label = 13;
                    case 13: return [3 /*break*/, 15];
                    case 14:
                        binanceErr_1 = _a.sent();
                        console.warn('⚠️ [SimpleFallbackChart] Binance API failed:', binanceErr_1);
                        return [3 /*break*/, 15];
                    case 15:
                        if (!(!klines || klines.length === 0)) return [3 /*break*/, 21];
                        _a.label = 16;
                    case 16:
                        _a.trys.push([16, 20, , 21]);
                        console.log('📊 [SimpleFallbackChart] Trying alternative Binance endpoint for', symbol);
                        altUrl = "https://api.binance.com/api/v3/klines?symbol=".concat(symbol, "&interval=5m&limit=100");
                        controller2_1 = new AbortController();
                        timeoutId2 = setTimeout(function () { return controller2_1.abort(); }, 5000);
                        return [4 /*yield*/, fetch(altUrl, { signal: controller2_1.signal })];
                    case 17:
                        altResponse = _a.sent();
                        clearTimeout(timeoutId2);
                        if (!altResponse.ok) return [3 /*break*/, 19];
                        return [4 /*yield*/, altResponse.json()];
                    case 18:
                        altData = _a.sent();
                        console.log('✅ [SimpleFallbackChart] Got data from alternative endpoint:', altData.length, 'candles');
                        klines = altData.map(function (candle) { return ({
                            time: Math.floor(candle[0] / 1000),
                            open: parseFloat(candle[1]),
                            high: parseFloat(candle[2]),
                            low: parseFloat(candle[3]),
                            close: parseFloat(candle[4]),
                            volume: parseFloat(candle[5])
                        }); });
                        _a.label = 19;
                    case 19: return [3 /*break*/, 21];
                    case 20:
                        altErr_1 = _a.sent();
                        console.warn('⚠️ [SimpleFallbackChart] Alternative endpoint failed:', altErr_1);
                        return [3 /*break*/, 21];
                    case 21:
                        // If still no data, show error instead of mock
                        if (!klines || klines.length === 0) {
                            throw new Error("Unable to load chart data for ".concat(symbol, ". Please try again later."));
                        }
                        if (!klines || klines.length === 0) {
                            throw new Error('No chart data available');
                        }
                        console.log('✅ [SimpleFallbackChart] Received', klines.length, 'candles, drawing chart');
                        // Draw candlestick chart on canvas
                        drawChart(canvasRef, klines);
                        setIsLoading(false);
                        return [3 /*break*/, 23];
                    case 22:
                        err_1 = _a.sent();
                        errorMessage = err_1 instanceof Error ? err_1.message : 'Unknown error';
                        console.error('❌ [SimpleFallbackChart] Error:', errorMessage);
                        setError(errorMessage);
                        setIsLoading(false);
                        return [3 /*break*/, 23];
                    case 23: return [2 /*return*/];
                }
            });
        }); };
        fetchAndDraw();
    }, [symbol, canvasRef]);
    var drawChart = function (canvas, klines) {
        var ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        // Get the actual display size
        var rect = canvas.getBoundingClientRect();
        var dpr = window.devicePixelRatio || 1;
        // Set canvas resolution
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        // Scale context to match device pixel ratio
        ctx.scale(dpr, dpr);
        var width = rect.width;
        var chartHeight = rect.height - 40; // Leave space for labels
        var padding = 40;
        // Clear canvas
        ctx.fillStyle = '#10121E';
        ctx.fillRect(0, 0, width, canvas.height);
        if (klines.length === 0)
            return;
        // Calculate price range
        var prices = klines.flatMap(function (k) { return [k.high, k.low]; });
        var minPrice = Math.min.apply(Math, prices);
        var maxPrice = Math.max.apply(Math, prices);
        var priceRange = maxPrice - minPrice || 1;
        // Draw grid
        ctx.strokeStyle = '#1F2937';
        ctx.lineWidth = 1;
        for (var i = 0; i <= 5; i++) {
            var y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        // Draw candlesticks
        var candleWidth = (width - padding * 2) / klines.length;
        var candleBodyWidth = Math.max(1, candleWidth * 0.6);
        klines.forEach(function (candle, index) {
            var x = padding + index * candleWidth + candleWidth / 2;
            // Calculate Y positions
            var openY = padding + ((maxPrice - candle.open) / priceRange) * chartHeight;
            var closeY = padding + ((maxPrice - candle.close) / priceRange) * chartHeight;
            var highY = padding + ((maxPrice - candle.high) / priceRange) * chartHeight;
            var lowY = padding + ((maxPrice - candle.low) / priceRange) * chartHeight;
            var isGreen = candle.close >= candle.open;
            var color = isGreen ? '#10B981' : '#EF4444';
            // Draw wick
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, highY);
            ctx.lineTo(x, lowY);
            ctx.stroke();
            // Draw body
            ctx.fillStyle = color;
            var bodyTop = Math.min(openY, closeY);
            var bodyHeight = Math.abs(closeY - openY) || 1;
            ctx.fillRect(x - candleBodyWidth / 2, bodyTop, candleBodyWidth, bodyHeight);
        });
        // Draw price labels
        ctx.fillStyle = '#9CA3AF';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'right';
        for (var i = 0; i <= 5; i++) {
            var price = maxPrice - (priceRange / 5) * i;
            var y = padding + (chartHeight / 5) * i + 4;
            ctx.fillText(price.toFixed(2), width - 5, y);
        }
    };
    return (<div style={{
            height: "".concat(height, "px"),
            width: "100%",
            position: "relative",
            backgroundColor: '#10121E',
            borderRadius: '8px',
            overflow: 'hidden'
        }}>
      {isLoading && (<div className="absolute inset-0 flex items-center justify-center bg-[#10121E]/80 z-10">
          <div className="text-gray-400 text-sm">Loading chart...</div>
        </div>)}

      {error && (<div className="absolute inset-0 flex items-center justify-center bg-[#10121E]/80 z-10">
          <div className="text-red-400 text-sm text-center px-4">
            Error: {error}
          </div>
        </div>)}

      <canvas ref={setCanvasRef} style={{
            width: '100%',
            height: '100%',
            display: 'block'
        }}/>
    </div>);
}

import React, { useEffect, useRef, useState } from 'react';
var CustomTradingChart = function (_a) {
    var symbol = _a.symbol, _b = _a.height, height = _b === void 0 ? 500 : _b, _c = _a.interval, interval = _c === void 0 ? '1' : _c, _d = _a.theme, theme = _d === void 0 ? 'dark' : _d, onSymbolChange = _a.onSymbolChange;
    var containerRef = useRef(null);
    var _e = useState(true), isLoading = _e[0], setIsLoading = _e[1];
    useEffect(function () {
        if (!containerRef.current)
            return;
        // Clear previous content
        containerRef.current.innerHTML = '';
        setIsLoading(true);
        // Create TradingView widget without volume
        var script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';
        script.type = 'text/javascript';
        script.async = true;
        // Handle symbol format
        var tradingViewSymbol = symbol;
        if (!symbol.includes(':')) {
            tradingViewSymbol = symbol.includes('USDT')
                ? "BINANCE:".concat(symbol)
                : symbol.includes('USD')
                    ? "COINBASE:".concat(symbol)
                    : "BINANCE:".concat(symbol);
        }
        var config = {
            symbols: [
                [tradingViewSymbol, tradingViewSymbol]
            ],
            chartOnly: false,
            width: "100%",
            height: height,
            locale: "en",
            colorTheme: theme,
            autosize: true,
            showVolume: false,
            showMA: false,
            hideDateRanges: false,
            hideMarketStatus: false,
            hideSymbolLogo: false,
            scalePosition: "right",
            scaleMode: "Normal",
            fontFamily: "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
            fontSize: "10",
            noTimeScale: false,
            valuesTracking: "1",
            changeMode: "price-and-percent",
            chartType: "area",
            maLineColor: "#2962FF",
            maLineWidth: 1,
            maLength: 9,
            backgroundColor: "rgba(16, 18, 30, 1)",
            lineWidth: 2,
            lineType: 0,
            dateRanges: [
                "1d|1",
                "1m|30",
                "3m|60",
                "12m|1D",
                "60m|1W",
                "all|1M"
            ]
        };
        script.innerHTML = JSON.stringify(config);
        script.onload = function () {
            console.log('✅ Custom TradingView chart loaded successfully');
            setIsLoading(false);
        };
        script.onerror = function () {
            console.error('❌ Failed to load custom TradingView chart');
            setIsLoading(false);
        };
        try {
            containerRef.current.appendChild(script);
        }
        catch (error) {
            console.error('Error appending custom chart script:', error);
            setIsLoading(false);
        }
        return function () {
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [symbol, height, interval, theme]);
    return (<div className="relative w-full h-full bg-[#10121E]">
      {isLoading && (<div className="absolute inset-0 flex items-center justify-center bg-[#10121E]">
          <div className="text-white text-sm">Loading chart...</div>
        </div>)}
      <div ref={containerRef} className="w-full h-full" style={{ height: "".concat(height, "px") }}/>
    </div>);
};
export default CustomTradingChart;

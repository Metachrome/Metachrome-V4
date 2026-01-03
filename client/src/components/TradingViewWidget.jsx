import React, { useEffect, useRef, memo, useState } from 'react';
import SimpleFallbackChart from './SimpleFallbackChart';
// Symbols not supported by TradingView (will use fallback chart)
var UNSUPPORTED_SYMBOLS = [];
function TradingViewWidget(_a) {
    var _b = _a.type, type = _b === void 0 ? "chart" : _b, _c = _a.symbol, symbol = _c === void 0 ? "BINANCE:BTCUSDT" : _c, _d = _a.height, height = _d === void 0 ? "100%" : _d, _e = _a.interval, interval = _e === void 0 ? "1" : _e, _f = _a.theme, theme = _f === void 0 ? "dark" : _f, _g = _a.style, style = _g === void 0 ? "1" : _g, _h = _a.locale, locale = _h === void 0 ? "en" : _h, _j = _a.timezone, timezone = _j === void 0 ? "Etc/UTC" : _j, _k = _a.allow_symbol_change, allow_symbol_change = _k === void 0 ? true : _k, _l = _a.container_id, container_id = _l === void 0 ? "tradingview_widget" : _l, onPriceUpdate = _a.onPriceUpdate, onSymbolChange = _a.onSymbolChange;
    var containerRef = useRef(null);
    var _m = useState(false), showFallback = _m[0], setShowFallback = _m[1];
    // Extract symbol without any exchange prefix
    var cleanSymbol = symbol.replace(/^(BINANCE:|COINBASE:|CRYPTO:)/, '');
    var isUnsupported = UNSUPPORTED_SYMBOLS.includes(cleanSymbol);
    useEffect(function () {
        if (!containerRef.current)
            return;
        try {
            containerRef.current.innerHTML = '';
        }
        catch (error) {
            console.log('Error clearing container:', error);
        }
        if (type === 'ticker') {
            var script = document.createElement("script");
            script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
            script.type = "text/javascript";
            script.async = true;
            script.innerHTML = JSON.stringify({
                "symbols": [
                    { "proName": "FOREXCOM:SPXUSD", "title": "S&P 500" },
                    { "proName": "FOREXCOM:NSXUSD", "title": "US 100" },
                    { "proName": "FX_IDC:EURUSD", "title": "EUR/USD" },
                    { "proName": "BITSTAMP:BTCUSD", "title": "BTC/USD" },
                    { "proName": "BITSTAMP:ETHUSD", "title": "ETH/USD" },
                    { "proName": "BINANCE:BNBUSDT", "title": "BNB/USDT" }
                ],
                "showSymbolLogo": true,
                "colorTheme": "dark",
                "isTransparent": true,
                "displayMode": "adaptive",
                "locale": "en"
            });
            containerRef.current.appendChild(script);
        }
        else {
            var script = document.createElement("script");
            script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
            script.type = "text/javascript";
            script.async = true;
            var tradingViewSymbol = symbol;
            // Always use cleanSymbol to determine the correct prefix
            if (cleanSymbol === 'HYPEHUSD') {
                tradingViewSymbol = "CRYPTO:".concat(cleanSymbol);
            }
            else if (!symbol.includes(':')) {
                tradingViewSymbol = cleanSymbol.includes('USDT')
                    ? "BINANCE:".concat(cleanSymbol)
                    : cleanSymbol.includes('USD')
                        ? "COINBASE:".concat(cleanSymbol)
                        : "BINANCE:".concat(cleanSymbol);
            }
            console.log("\uD83D\uDCCA TradingViewWidget: ".concat(cleanSymbol, " -> ").concat(tradingViewSymbol));
            var config = {
                autosize: true,
                symbol: tradingViewSymbol,
                interval: interval,
                timezone: timezone,
                theme: "dark",
                colorTheme: "dark",
                style: "1",
                locale: locale,
                toolbar_bg: "#000000",
                enable_publishing: false,
                allow_symbol_change: false,
                container_id: container_id,
                hide_volume: true,
                hide_top_toolbar: false,
                hide_legend: false,
                save_image: false,
                disabled_features: [
                    "volume_force_overlay",
                    "create_volume_indicator_by_default",
                    "study_templates",
                    "header_indicators",
                    "header_compare",
                    "header_undo_redo",
                    "header_screenshot",
                    "header_chart_type",
                    "timeframes_toolbar",
                    "edit_buttons_in_legend",
                    "context_menus",
                    "control_bar",
                    "left_toolbar",
                    "header_saveload",
                    "header_settings",
                    "use_localstorage_for_settings"
                ],
                enabled_features: [
                    "hide_last_na_study_output",
                    "remove_library_container_border",
                    "disable_resolution_rebuild"
                ],
                loading_screen: { backgroundColor: "#000000" },
                overrides: {
                    "paneProperties.background": "#000000",
                    "paneProperties.backgroundType": "solid",
                    "paneProperties.vertGridProperties.color": "#1a1a1a",
                    "paneProperties.horzGridProperties.color": "#1a1a1a",
                    "symbolWatermarkProperties.transparency": 90,
                    "scalesProperties.textColor": "#666666",
                    "scalesProperties.backgroundColor": "#000000",
                    "mainSeriesProperties.candleStyle.upColor": "#10B981",
                    "mainSeriesProperties.candleStyle.downColor": "#EF4444",
                    "mainSeriesProperties.candleStyle.borderUpColor": "#10B981",
                    "mainSeriesProperties.candleStyle.borderDownColor": "#EF4444",
                    "mainSeriesProperties.candleStyle.wickUpColor": "#10B981",
                    "mainSeriesProperties.candleStyle.wickDownColor": "#EF4444"
                }
            };
            script.innerHTML = JSON.stringify(config);
            script.onload = function () {
                console.log('✅ TradingView widget loaded successfully');
            };
            script.onerror = function () {
                console.error('❌ TradingView script failed to load');
            };
            try {
                containerRef.current.appendChild(script);
            }
            catch (error) {
                console.error('Error appending TradingView script:', error);
            }
        }
        return function () {
            try {
                if (containerRef.current) {
                    containerRef.current.innerHTML = '';
                }
            }
            catch (error) {
                console.log('Error during cleanup:', error);
            }
        };
    }, [type, symbol, height, interval, theme, style, locale, timezone, allow_symbol_change, container_id]);
    // Use fallback chart for unsupported symbols
    if (isUnsupported || showFallback) {
        return (<SimpleFallbackChart symbol={cleanSymbol} height={typeof height === 'number' ? height : 400}/>);
    }
    return (<div className={"tradingview-widget-container ".concat(type === 'ticker' ? 'w-full overflow-hidden bg-transparent' : 'bg-[#000000]')} ref={containerRef} style={{
            height: type === 'ticker' ? '50px' : (typeof height === 'number' ? "".concat(height, "px") : height),
            width: "100%",
            position: "relative",
            backgroundColor: type === 'ticker' ? 'transparent' : '#000000'
        }}>
      {type === 'ticker' ? (<div className="flex items-center justify-center h-full text-gray-400 text-sm">
          <div className="animate-pulse">Loading market data...</div>
        </div>) : (<div id={container_id} className="tradingview-widget-container__widget" style={{
                height: "100%",
                width: "100%"
            }}/>)}
    </div>);
}
export default memo(TradingViewWidget);

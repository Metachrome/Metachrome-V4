import React, { useEffect, useRef, memo, useState } from 'react';
import LightweightChart from './LightweightChart';

interface TradingViewWidgetProps {
  type?: 'chart' | 'ticker';
  symbol?: string;
  height?: string | number;
  interval?: string;
  theme?: 'light' | 'dark';
  style?: string;
  locale?: string;
  timezone?: string;
  allow_symbol_change?: boolean;
  container_id?: string;
  onPriceUpdate?: (price: number) => void;
  onSymbolChange?: (symbol: string) => void;
}

// Symbols not supported by TradingView
const UNSUPPORTED_SYMBOLS = ['HYPEUSDT', 'MATICUSDT'];

function TradingViewWidget({
  type = "chart",
  symbol = "BINANCE:BTCUSDT",
  height = "100%",
  interval = "1",
  theme = "dark",
  style = "1",
  locale = "en",
  timezone = "Etc/UTC",
  allow_symbol_change = true,
  container_id = "tradingview_widget",
  onPriceUpdate,
  onSymbolChange
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showFallback, setShowFallback] = useState(false);

  // Extract symbol without BINANCE: prefix
  const cleanSymbol = symbol.replace('BINANCE:', '');
  const isUnsupported = UNSUPPORTED_SYMBOLS.includes(cleanSymbol);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      containerRef.current.innerHTML = '';
    } catch (error) {
      console.log('Error clearing container:', error);
    }

    if (type === 'ticker') {
      const script = document.createElement("script");
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
    } else {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;

      let tradingViewSymbol = symbol;
      if (!symbol.includes(':')) {
        tradingViewSymbol = symbol.includes('USDT')
          ? `BINANCE:${symbol}`
          : symbol.includes('USD')
          ? `COINBASE:${symbol}`
          : `BINANCE:${symbol}`;
      }

      const config = {
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

      script.onload = () => {
        console.log('✅ TradingView widget loaded successfully');
      };

      script.onerror = () => {
        console.error('❌ TradingView script failed to load');
      };

      try {
        containerRef.current.appendChild(script);
      } catch (error) {
        console.error('Error appending TradingView script:', error);
      }
    }

    return () => {
      try {
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
      } catch (error) {
        console.log('Error during cleanup:', error);
      }
    };
  }, [type, symbol, height, interval, theme, style, locale, timezone, allow_symbol_change, container_id]);

  // Convert TradingView interval format to Binance format
  const convertInterval = (tvInterval: string): string => {
    // TradingView uses "1" for 1 minute, "5" for 5 minutes, etc.
    // Binance uses "1m", "5m", "15m", "1h", "4h", "1d", etc.
    const intervalMap: Record<string, string> = {
      '1': '1m',
      '5': '5m',
      '15': '15m',
      '30': '30m',
      '60': '1h',
      '240': '4h',
      '1D': '1d',
      '1W': '1w',
      '1M': '1M'
    };
    return intervalMap[tvInterval] || '1m'; // Default to 1m if not found
  };

  // Use fallback chart for unsupported symbols
  if (isUnsupported || showFallback) {
    return (
      <div
        style={{
          height: type === 'ticker' ? '50px' : (typeof height === 'number' ? `${height}px` : height),
          width: "100%",
          position: "relative",
          backgroundColor: '#10121E'
        }}
      >
        <LightweightChart
          symbol={cleanSymbol}
          interval={convertInterval(interval)}
          height={typeof height === 'number' ? height : 400}
          containerId={container_id}
        />
      </div>
    );
  }

  return (
    <div
      className={`tradingview-widget-container ${type === 'ticker' ? 'w-full overflow-hidden bg-transparent' : 'bg-[#000000]'}`}
      ref={containerRef}
      style={{
        height: type === 'ticker' ? '50px' : (typeof height === 'number' ? `${height}px` : height),
        width: "100%",
        position: "relative",
        backgroundColor: type === 'ticker' ? 'transparent' : '#000000'
      }}
    >
      {type === 'ticker' ? (
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          <div className="animate-pulse">Loading market data...</div>
        </div>
      ) : (
        <div
          id={container_id}
          className="tradingview-widget-container__widget"
          style={{
            height: "100%",
            width: "100%"
          }}
        />
      )}
    </div>
  );
}

export default memo(TradingViewWidget);


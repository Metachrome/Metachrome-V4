import React, { useEffect, useRef, memo } from 'react';

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
        toolbar_bg: "#10121E",
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
        loading_screen: { backgroundColor: "#10121E" },
        overrides: {
          "paneProperties.background": "#10121E",
          "paneProperties.backgroundType": "solid",
          "paneProperties.vertGridProperties.color": "#1F2937",
          "paneProperties.horzGridProperties.color": "#1F2937",
          "symbolWatermarkProperties.transparency": 90,
          "scalesProperties.textColor": "#D1D5DB",
          "scalesProperties.backgroundColor": "#10121E",
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

  return (
    <div
      className={`tradingview-widget-container ${type === 'ticker' ? 'w-full overflow-hidden bg-transparent' : 'bg-[#10121E]'}`}
      ref={containerRef}
      style={{
        height: type === 'ticker' ? '50px' : (typeof height === 'number' ? `${height}px` : height),
        width: "100%",
        position: "relative",
        backgroundColor: type === 'ticker' ? 'transparent' : '#10121E'
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


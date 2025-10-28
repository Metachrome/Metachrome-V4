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
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear container
    containerRef.current.innerHTML = '';

    // Add CSS to force black background on TradingView widget
    const style = document.createElement('style');
    style.textContent = `
      #${container_id} {
        background-color: #000000 !important;
      }
      #${container_id} iframe {
        background-color: #000000 !important;
      }
      #${container_id} > div {
        background-color: #000000 !important;
      }
      .tradingview-widget-container {
        background-color: #000000 !important;
      }
      .tradingview-widget-container__widget {
        background-color: #000000 !important;
      }
    `;
    document.head.appendChild(style);

    if (type === 'ticker') {
      // Ticker tape widget for homepage
      const script = document.createElement("script");
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

      script.src = "/api/tradingview-script/embed-widget-ticker-tape.js";
      containerRef.current.appendChild(script);
      setIsLoading(false);
    } else {
      // Advanced chart widget - Use TradingView's embed script with proper config
      const script = document.createElement("script");
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

      // Create config object (NOT stringified - TradingView script will handle it)
      const config = {
        autosize: true,
        symbol: tradingViewSymbol,
        interval: interval,
        timezone: timezone,
        theme: "dark",
        style: "1",
        locale: locale,
        backgroundColor: "#000000",
        toolbar_bg: "#000000",
        enable_publishing: false,
        allow_symbol_change: false,
        container_id: container_id,
        hide_volume: true,
        hide_top_toolbar: false,
        hide_legend: false,
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
        overrides: {
          "paneProperties.background": "#000000",
          "paneProperties.backgroundType": "solid",
          "scalesProperties.backgroundColor": "#000000",
          "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
          "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350"
        }
      };

      // Set innerHTML to JSON string of config
      script.innerHTML = JSON.stringify(config);
      script.src = "/api/tradingview-script/embed-widget-advanced-chart.js";

      script.onload = () => {
        console.log('✅ TradingView script loaded');
        setIsLoading(false);
      };

      script.onerror = () => {
        console.error('❌ TradingView script failed to load');
        setIsLoading(false);
      };

      containerRef.current.appendChild(script);
    }

    return () => {
      // Cleanup
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [type, symbol, interval, timezone, container_id]);

  return (
    <div
      ref={containerRef}
      id={container_id}
      style={{
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#10121E'
      }}
    />
  );
}

export default memo(TradingViewWidget);


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

    // Clear any existing widget safely
    try {
      containerRef.current.innerHTML = '';
    } catch (error) {
      console.log('Error clearing container:', error);
    }

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
      document.body.appendChild(script);
      setIsLoading(false);
    } else {
      // Advanced chart widget - Use iframe approach
      let tradingViewSymbol = symbol;

      if (!symbol.includes(':')) {
        tradingViewSymbol = symbol.includes('USDT')
          ? `BINANCE:${symbol}`
          : symbol.includes('USD')
          ? `COINBASE:${symbol}`
          : `BINANCE:${symbol}`;
      }

      // Create iframe for TradingView chart
      const iframe = document.createElement('iframe');
      iframe.id = container_id;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '8px';
      iframe.frameBorder = '0';
      iframe.allowFullscreen = true;
      
      // Build TradingView chart URL with parameters
      const chartParams = new URLSearchParams({
        symbol: tradingViewSymbol,
        interval: interval,
        theme: 'dark',
        locale: locale,
        timezone: timezone,
        hide_volume: 'true',
        hide_top_toolbar: 'false',
        hide_legend: 'false',
        allow_symbol_change: 'false'
      });
      
      iframe.src = `https://www.tradingview.com/chart/?${chartParams.toString()}`;
      
      console.log('📺 Creating TradingView iframe with URL:', iframe.src);
      
      // Append iframe to container
      if (containerRef.current) {
        containerRef.current.appendChild(iframe);
      }
      
      setIsLoading(false);
      
      // Setup symbol change monitoring for iframe
      if (onSymbolChange) {
        const checkIframeSymbol = () => {
          try {
            const currentSrc = iframe.src;
            const symbolMatch = currentSrc.match(/symbol=([^&]+)/);
            if (symbolMatch && symbolMatch[1]) {
              const detectedSymbol = decodeURIComponent(symbolMatch[1]);
              console.log('🔄 Detected symbol from iframe URL:', detectedSymbol);
              onSymbolChange(detectedSymbol);
            }
          } catch (error) {
            // Silent error handling
          }
        };
        
        const symbolCheckInterval = setInterval(checkIframeSymbol, 2000);
        
        return () => {
          clearInterval(symbolCheckInterval);
        };
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
  }, [type, symbol, height, interval, theme, style, locale, timezone, allow_symbol_change, container_id, onSymbolChange]);

  console.log('🎯 TradingViewWidget render - type:', type, 'onSymbolChange:', !!onSymbolChange, 'symbol:', symbol);

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
    >
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#10121E',
          zIndex: 1
        }}>
          <div style={{ color: '#fff', fontSize: '14px' }}>Loading chart...</div>
        </div>
      )}
    </div>
  );
}

export default memo(TradingViewWidget);


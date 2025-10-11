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

    // Clear any existing widget safely
    try {
      containerRef.current.innerHTML = '';
    } catch (error) {
      console.log('Error clearing container:', error);
    }

    if (type === 'ticker') {
      // Ticker tape widget for homepage
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "symbols": [
          {
            "proName": "FOREXCOM:SPXUSD",
            "title": "S&P 500"
          },
          {
            "proName": "FOREXCOM:NSXUSD",
            "title": "US 100"
          },
          {
            "proName": "FX_IDC:EURUSD",
            "title": "EUR/USD"
          },
          {
            "proName": "BITSTAMP:BTCUSD",
            "title": "BTC/USD"
          },
          {
            "proName": "BITSTAMP:ETHUSD",
            "title": "ETH/USD"
          },
          {
            "proName": "BINANCE:BNBUSDT",
            "title": "BNB/USDT"
          }
        ],
        "showSymbolLogo": true,
        "colorTheme": "dark",
        "isTransparent": true,
        "displayMode": "adaptive",
        "locale": "en"
      });

      containerRef.current.appendChild(script);
    } else {
      // Advanced chart widget for trading pages
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;

      // Check if mobile for specific mobile chart settings
      const isMobile = window.innerWidth <= 768;

      const config = {
        autosize: true,
        symbol: symbol,
        interval: interval,
        timezone: timezone,
        theme: theme,
        style: style,
        locale: locale,
        enable_publishing: false,
        allow_symbol_change: allow_symbol_change,
        calendar: false,
        support_host: "https://www.tradingview.com",
        container_id: container_id,
        hide_side_toolbar: isMobile && container_id === 'options_mobile_chart',
        hide_top_toolbar: false,
        hide_legend: isMobile && container_id === 'options_mobile_chart',
        save_image: false,
        backgroundColor: theme === 'dark' ? "#0F0F0F" : "#FFFFFF",
        gridColor: theme === 'dark' ? "rgba(242, 242, 242, 0.06)" : "rgba(0, 0, 0, 0.06)",
        studies: [],
        watchlist: [],
        details: !isMobile || container_id !== 'options_mobile_chart',
        hotlist: false,
        withdateranges: !isMobile || container_id !== 'options_mobile_chart',
        hide_volume: isMobile && container_id === 'options_mobile_chart'
      };

      script.innerHTML = JSON.stringify(config);

      script.onload = () => {
        console.log('✅ TradingView widget loaded successfully');

        // Set up symbol change monitoring using TradingView's postMessage API
        if (onSymbolChange) {
          try {
            let currentSymbol = symbol.replace('BINANCE:', '');

            // Listen for messages from TradingView iframe
            const handleMessage = (event: MessageEvent) => {
              try {
                // TradingView sends various messages, we need to filter for symbol changes
                if (event.data && typeof event.data === 'object') {
                  // Check for symbol change in various TradingView message formats
                  if (event.data.name === 'tv-widget-ready' ||
                      event.data.type === 'symbol_changed' ||
                      (event.data.symbol && event.data.symbol !== currentSymbol)) {

                    let newSymbol = null;

                    // Extract symbol from different message formats
                    if (event.data.symbol) {
                      newSymbol = event.data.symbol;
                    } else if (event.data.data && event.data.data.symbol) {
                      newSymbol = event.data.data.symbol;
                    }

                    if (newSymbol) {
                      // Clean the symbol (remove exchange prefix)
                      const cleanSymbol = newSymbol.replace('BINANCE:', '').replace('COINBASE:', '');

                      if (cleanSymbol !== currentSymbol && cleanSymbol.includes('USDT')) {
                        console.log('🔄 TradingView symbol change detected:', cleanSymbol);
                        currentSymbol = cleanSymbol;
                        onSymbolChange(cleanSymbol);
                      }
                    }
                  }
                }
              } catch (error) {
                console.log('Symbol change message processing error:', error);
              }
            };

            // Add message listener
            window.addEventListener('message', handleMessage);

            // Also monitor URL changes as fallback
            const checkSymbolChange = () => {
              try {
                const iframe = containerRef.current?.querySelector('iframe');
                if (iframe && iframe.src) {
                  const symbolMatch = iframe.src.match(/symbol=([^&]+)/);
                  if (symbolMatch && symbolMatch[1]) {
                    const detectedSymbol = decodeURIComponent(symbolMatch[1]);
                    const cleanSymbol = detectedSymbol.replace('BINANCE:', '').replace('COINBASE:', '');
                    if (cleanSymbol !== currentSymbol && cleanSymbol.includes('USDT')) {
                      console.log('🔄 URL-based symbol change detected:', cleanSymbol);
                      currentSymbol = cleanSymbol;
                      onSymbolChange(cleanSymbol);
                    }
                  }
                }
              } catch (error) {
                // Silently handle cross-origin errors
              }
            };

            // Check for symbol changes every 3 seconds as fallback
            const symbolInterval = setInterval(checkSymbolChange, 3000);

            // Cleanup function
            return () => {
              window.removeEventListener('message', handleMessage);
              clearInterval(symbolInterval);
            };
          } catch (error) {
            console.log('TradingView symbol monitoring setup error:', error);
          }
        }

        // Set up price monitoring if callback provided
        if (onPriceUpdate && window.TradingView) {
          try {
            // Monitor for price updates through TradingView's API
            const checkPrice = () => {
              try {
                const iframe = containerRef.current?.querySelector('iframe');
                if (iframe && iframe.contentWindow) {
                  // This is a simplified approach - in production you'd use TradingView's official API
                  // For now, we'll simulate price updates
                  const mockPrice = 117124.78 + (Math.random() - 0.5) * 1000;
                  onPriceUpdate(mockPrice);
                }
              } catch (error) {
                console.log('Price monitoring error:', error);
              }
            };

            // Check price every 5 seconds
            const priceInterval = setInterval(checkPrice, 5000);

            // Cleanup interval on unmount
            return () => clearInterval(priceInterval);
          } catch (error) {
            console.log('TradingView price monitoring setup error:', error);
          }
        }
      };

      try {
        containerRef.current.appendChild(script);
      } catch (error) {
        console.error('Error appending TradingView script:', error);
      }
    }

    // Cleanup function
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
      className={`tradingview-widget-container ${type === 'ticker' ? 'w-full h-16 overflow-hidden bg-transparent' : ''}`}
      ref={containerRef}
      style={{
        height: type === 'ticker' ? '64px' : (typeof height === 'number' ? `${height}px` : height),
        width: "100%",
        position: "relative"
      }}
    >
      {type === 'ticker' ? (
        // Fallback content for ticker while widget loads
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
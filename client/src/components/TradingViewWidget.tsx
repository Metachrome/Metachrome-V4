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
        hide_volume: isMobile && container_id === 'options_mobile_chart',
        // Enable symbol change callbacks
        onSymbolChanged: function(symbolInfo: any) {
          if (onSymbolChange && symbolInfo && symbolInfo.name) {
            console.log('🔄 TradingView onSymbolChanged callback:', symbolInfo.name);
            const cleanSymbol = symbolInfo.name.replace('BINANCE:', '').replace('COINBASE:', '');
            onSymbolChange(cleanSymbol);
          }
        }
      };

      script.innerHTML = JSON.stringify(config);

      script.onload = () => {
        console.log('✅ TradingView widget loaded successfully');

        // Try to access TradingView widget instance for direct symbol monitoring
        setTimeout(() => {
          try {
            // Check if TradingView widget is available globally
            if (window.TradingView && window.TradingView.widget) {
              console.log('🔍 TradingView widget API detected, setting up direct monitoring');

              // Try to get widget instance
              const widgetInstance = window.TradingView.widget({
                container_id: container_id,
                onSymbolChanged: function(symbolInfo: any) {
                  if (onSymbolChange && symbolInfo && symbolInfo.name) {
                    console.log('🔄 Direct TradingView onSymbolChanged:', symbolInfo.name);
                    const cleanSymbol = symbolInfo.name.replace('BINANCE:', '').replace('COINBASE:', '');
                    onSymbolChange(cleanSymbol);
                  }
                }
              });
            }
          } catch (error) {
            console.log('Direct TradingView API access failed, using fallback methods');
          }
        }, 2000);

        // Simplified and more aggressive symbol change monitoring
        if (onSymbolChange) {
          try {
            let currentSymbol = symbol.replace('BINANCE:', '').replace('COINBASE:', '');
            console.log('🔍 Setting up symbol monitoring for:', currentSymbol);

            // Listen for ALL messages from TradingView iframe
            const handleMessage = (event: MessageEvent) => {
              try {
                // Log all messages to see what TradingView is sending
                if (event.data && event.origin && event.origin.includes('tradingview')) {
                  console.log('📨 TradingView message:', event.data);
                }

                // Check for symbol in any message format
                if (event.data && typeof event.data === 'object') {
                  const messageStr = JSON.stringify(event.data);

                  // Look for USDT symbols in any part of the message
                  const symbolMatches = messageStr.match(/([A-Z]{2,10}USDT)/g);
                  if (symbolMatches && symbolMatches.length > 0) {
                    const detectedSymbol = symbolMatches[0];
                    if (detectedSymbol !== currentSymbol) {
                      console.log('🔄 Symbol detected in message:', detectedSymbol);
                      currentSymbol = detectedSymbol;
                      onSymbolChange(detectedSymbol);
                    }
                  }
                }
              } catch (error) {
                // Silent error handling
              }
            };

            // Add message listener for all origins
            window.addEventListener('message', handleMessage);

            // Aggressive URL and DOM monitoring
            const checkSymbolChange = () => {
              try {
                const iframe = containerRef.current?.querySelector('iframe');
                if (iframe) {
                  // Method 1: Check iframe src URL
                  if (iframe.src) {
                    const symbolMatch = iframe.src.match(/symbol=([^&]+)/);
                    if (symbolMatch && symbolMatch[1]) {
                      const detectedSymbol = decodeURIComponent(symbolMatch[1]);
                      const cleanSymbol = detectedSymbol.replace('BINANCE:', '').replace('COINBASE:', '');
                      if (cleanSymbol !== currentSymbol && cleanSymbol.includes('USDT')) {
                        console.log('🔄 URL symbol change:', cleanSymbol);
                        currentSymbol = cleanSymbol;
                        onSymbolChange(cleanSymbol);
                        return;
                      }
                    }
                  }

                  // Method 2: Try to read iframe content (will fail due to CORS but worth trying)
                  try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                    if (iframeDoc) {
                      const symbolElements = iframeDoc.querySelectorAll('[data-symbol], .symbol, .tv-symbol');
                      symbolElements.forEach(el => {
                        const symbolText = el.textContent || el.getAttribute('data-symbol');
                        if (symbolText && symbolText.includes('USDT') && symbolText !== currentSymbol) {
                          console.log('🔄 DOM symbol change:', symbolText);
                          currentSymbol = symbolText;
                          onSymbolChange(symbolText);
                        }
                      });
                    }
                  } catch (corsError) {
                    // Expected CORS error, continue with other methods
                  }

                  // Method 3: Monitor iframe title changes
                  try {
                    const title = iframe.contentDocument?.title;
                    if (title) {
                      const titleSymbol = title.match(/([A-Z]+USDT)/);
                      if (titleSymbol && titleSymbol[1] !== currentSymbol) {
                        console.log('🔄 Title symbol change:', titleSymbol[1]);
                        currentSymbol = titleSymbol[1];
                        onSymbolChange(titleSymbol[1]);
                      }
                    }
                  } catch (corsError) {
                    // Expected CORS error
                  }
                }
              } catch (error) {
                // Silent error handling
              }
            };

            // Check every 1 second for faster detection
            const symbolInterval = setInterval(checkSymbolChange, 1000);

            // Initial check after 3 seconds
            setTimeout(checkSymbolChange, 3000);

            // Additional method: Monitor for specific TradingView symbol patterns
            const detectSymbolFromChart = () => {
              try {
                const iframe = containerRef.current?.querySelector('iframe');
                if (iframe) {
                  // Look for common crypto symbols in the current URL
                  const url = iframe.src;
                  const cryptoSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'XRPUSDT', 'DOGEUSDT', 'DOTUSDT', 'LINKUSDT', 'LTCUSDT'];

                  for (const cryptoSymbol of cryptoSymbols) {
                    if (url.includes(cryptoSymbol) || url.includes(cryptoSymbol.replace('USDT', 'USD'))) {
                      if (cryptoSymbol !== currentSymbol) {
                        console.log('🔄 Crypto symbol detected in URL:', cryptoSymbol);
                        currentSymbol = cryptoSymbol;
                        onSymbolChange(cryptoSymbol);
                        break;
                      }
                    }
                  }
                }
              } catch (error) {
                // Silent error handling
              }
            };

            // Run crypto detection every 2 seconds
            const cryptoInterval = setInterval(detectSymbolFromChart, 2000);

            // Cleanup function
            return () => {
              window.removeEventListener('message', handleMessage);
              clearInterval(symbolInterval);
              clearInterval(cryptoInterval);
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
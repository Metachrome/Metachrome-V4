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
      // Use advanced chart with minimal configuration
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;

      // Check if mobile for specific mobile chart settings
      const isMobile = window.innerWidth <= 768;

      // Minimal configuration to avoid schema validation errors
      const config = {
        width: "100%",
        height: "100%",
        symbol: symbol,
        interval: interval,
        timezone: timezone,
        theme: theme,
        style: "1",
        locale: locale,
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        allow_symbol_change: allow_symbol_change,
        container_id: container_id
      };

      script.innerHTML = JSON.stringify(config);

      script.onload = () => {
        console.log('✅ TradingView widget loaded successfully');
        console.log('🔍 Widget config:', JSON.stringify(config, null, 2));

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
            let currentSymbol = symbol.replace('BINANCE:', '').replace('COINBASE:', '').replace('BITSTAMP:', '');
            console.log('🔍 Setting up symbol monitoring for:', currentSymbol);
            console.log('🔍 Initial symbol from props:', symbol);

            // Enhanced message listener for TradingView events
            const handleMessage = (event: MessageEvent) => {
              try {
                // Listen to all TradingView origins
                if (event.data && event.origin && (event.origin.includes('tradingview') || event.origin.includes('charting_library'))) {
                  console.log('📨 TradingView message:', event.data);

                  // Handle string messages
                  if (typeof event.data === 'string') {
                    // Look for symbol patterns in string messages
                    const symbolMatches = event.data.match(/([A-Z]{3,6}USD[T]?)/g);
                    if (symbolMatches && symbolMatches.length > 0) {
                      const detectedSymbol = symbolMatches[0].replace('USD', 'USDT');
                      if (detectedSymbol !== currentSymbol) {
                        console.log('🔄 Symbol detected in string message:', detectedSymbol);
                        currentSymbol = detectedSymbol;
                        onSymbolChange(detectedSymbol);
                      }
                    }
                  }

                  // Handle object messages
                  if (event.data && typeof event.data === 'object') {
                    const messageStr = JSON.stringify(event.data);

                    // Look for USDT/USD symbols in any part of the message
                    const symbolMatches = messageStr.match(/([A-Z]{2,10}USD[T]?)/g);
                    if (symbolMatches && symbolMatches.length > 0) {
                      const detectedSymbol = symbolMatches[0].replace('USD', 'USDT');
                      if (detectedSymbol !== currentSymbol) {
                        console.log('🔄 Symbol detected in object message:', detectedSymbol);
                        currentSymbol = detectedSymbol;
                        onSymbolChange(detectedSymbol);
                      }
                    }

                    // Check for specific TradingView message types
                    if (event.data.name === 'tv-widget-ready' || event.data.type === 'symbol_changed') {
                      console.log('🎯 TradingView widget event detected:', event.data);
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
                  // Debug: Log the current iframe URL periodically
                  if (Math.random() < 0.1) { // Log 10% of the time to avoid spam
                    console.log('🔍 Current iframe URL:', iframe.src);
                  }

                  // Method 1: Enhanced URL monitoring with multiple patterns
                  if (iframe.src) {
                    // Pattern 1: symbol= parameter
                    const symbolMatch = iframe.src.match(/symbol=([^&]+)/);
                    if (symbolMatch && symbolMatch[1]) {
                      const detectedSymbol = decodeURIComponent(symbolMatch[1]);
                      const cleanSymbol = detectedSymbol.replace('BINANCE:', '').replace('COINBASE:', '').replace('CRYPTO:', '').replace('BITSTAMP:', '');
                      console.log('🔍 Raw detected symbol:', detectedSymbol, '-> Clean:', cleanSymbol);

                      if (cleanSymbol !== currentSymbol && (cleanSymbol.includes('USDT') || cleanSymbol.includes('USD'))) {
                        // Convert USD to USDT for consistency
                        let normalizedSymbol = cleanSymbol;
                        if (cleanSymbol.endsWith('USD') && !cleanSymbol.endsWith('USDT')) {
                          normalizedSymbol = cleanSymbol.replace('USD', 'USDT'); // ETHUSD -> ETHUSDT
                        }
                        console.log('🔄 URL symbol change detected:', normalizedSymbol);
                        console.log('🔄 Current symbol was:', currentSymbol);
                        currentSymbol = normalizedSymbol;
                        onSymbolChange(normalizedSymbol);
                        return;
                      }
                    }

                    // Pattern 2: Direct symbol in URL path
                    const pathSymbolMatch = iframe.src.match(/\/([A-Z]{3,6}USD[T]?)\//);
                    if (pathSymbolMatch && pathSymbolMatch[1]) {
                      let pathSymbol = pathSymbolMatch[1];
                      if (pathSymbol.endsWith('USD') && !pathSymbol.endsWith('USDT')) {
                        pathSymbol = pathSymbol + 'T'; // ETHUSD -> ETHUSDT
                      }
                      if (pathSymbol !== currentSymbol) {
                        console.log('🔄 Path symbol change:', pathSymbol);
                        currentSymbol = pathSymbol;
                        onSymbolChange(pathSymbol);
                        return;
                      }
                    }

                    // Pattern 2.5: Look for any USD/USDT pattern in the entire URL
                    const anySymbolMatch = iframe.src.match(/([A-Z]{3,6}USD[T]?)/g);
                    if (anySymbolMatch && anySymbolMatch.length > 0) {
                      for (const match of anySymbolMatch) {
                        let detectedSymbol = match;
                        if (detectedSymbol.endsWith('USD') && !detectedSymbol.endsWith('USDT')) {
                          detectedSymbol = detectedSymbol.replace('USD', 'USDT'); // ETHUSD -> ETHUSDT
                        }
                        if (detectedSymbol !== currentSymbol && detectedSymbol.length >= 6) {
                          console.log('🔄 Any symbol pattern detected:', detectedSymbol, 'from URL pattern');
                          currentSymbol = detectedSymbol;
                          onSymbolChange(detectedSymbol);
                          return;
                        }
                      }
                    }

                    // Pattern 2.6: Force detection for common symbols if we see them in URL
                    const commonSymbols = ['ETHUSD', 'BTCUSD', 'SOLUSD', 'BNBUSD', 'ADAUSD', 'XRPUSD'];
                    for (const commonSymbol of commonSymbols) {
                      if (iframe.src.includes(commonSymbol)) {
                        const normalizedSymbol = commonSymbol.replace('USD', 'USDT');
                        if (normalizedSymbol !== currentSymbol) {
                          console.log('🔄 Common symbol detected in URL:', normalizedSymbol, 'from', commonSymbol);
                          currentSymbol = normalizedSymbol;
                          onSymbolChange(normalizedSymbol);
                          return;
                        }
                      }
                    }

                    // Pattern 3: Check for any crypto symbols in the entire URL
                    const cryptoSymbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'XRPUSDT', 'DOGEUSDT', 'DOTUSDT', 'LINKUSDT', 'LTCUSDT'];
                    for (const cryptoSymbol of cryptoSymbols) {
                      const usdVariant = cryptoSymbol.replace('USDT', 'USD');

                      if (iframe.src.includes(cryptoSymbol) || iframe.src.includes(usdVariant)) {
                        if (cryptoSymbol !== currentSymbol) {
                          console.log('🔄 Crypto symbol found in URL:', cryptoSymbol, '(detected as', iframe.src.includes(usdVariant) ? usdVariant : cryptoSymbol, ')');
                          currentSymbol = cryptoSymbol;
                          onSymbolChange(cryptoSymbol);
                          return;
                        }
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

            // Check every 200ms for very fast detection
            const symbolInterval = setInterval(checkSymbolChange, 200);

            // Immediate check
            setTimeout(checkSymbolChange, 100);

            // Initial check after 1 second
            setTimeout(checkSymbolChange, 1000);

            // Additional check after 3 seconds
            setTimeout(checkSymbolChange, 3000);

            // Final check after 5 seconds
            setTimeout(checkSymbolChange, 5000);

            // Test symbol detection manually (for debugging)
            setTimeout(() => {
              console.log('🧪 Testing symbol detection...');
              if (onSymbolChange) {
                console.log('🧪 Simulating symbol change to BTCUSDT');
                // This is just for testing - remove in production
                // onSymbolChange('BTCUSDT');
              }
            }, 10000);

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

            // Run crypto detection every 1 second for faster response
            const cryptoInterval = setInterval(detectSymbolFromChart, 1000);

            // Monitor for hash changes in the iframe URL (TradingView uses hash routing)
            let lastHash = '';
            const monitorHashChanges = () => {
              try {
                const iframe = containerRef.current?.querySelector('iframe');
                if (iframe && iframe.src) {
                  const currentHash = iframe.src.split('#')[1] || '';
                  if (currentHash !== lastHash) {
                    lastHash = currentHash;
                    console.log('🔗 TradingView hash changed:', currentHash);

                    // Look for symbols in the hash
                    const hashSymbolMatch = currentHash.match(/([A-Z]{3,6}USD[T]?)/);
                    if (hashSymbolMatch && hashSymbolMatch[1]) {
                      const hashSymbol = hashSymbolMatch[1].replace('USD', 'USDT');
                      if (hashSymbol !== currentSymbol) {
                        console.log('🔄 Symbol detected from hash change:', hashSymbol);
                        currentSymbol = hashSymbol;
                        onSymbolChange(hashSymbol);
                      }
                    }
                  }
                }
              } catch (error) {
                // Silent error handling
              }
            };

            // Monitor hash changes every 500ms
            const hashInterval = setInterval(monitorHashChanges, 500);

            // Additional aggressive monitoring - check for TradingView widget state
            const monitorWidgetState = () => {
              try {
                const iframe = containerRef.current?.querySelector('iframe');
                if (iframe && iframe.contentWindow) {
                  // Try to access TradingView widget if available
                  try {
                    // Post a message to the iframe to request current symbol
                    iframe.contentWindow.postMessage({
                      type: 'get_symbol',
                      source: 'metachrome'
                    }, '*');
                  } catch (e) {
                    // Silent error handling
                  }
                }
              } catch (error) {
                // Silent error handling
              }
            };

            // Monitor widget state every 2 seconds
            const widgetInterval = setInterval(monitorWidgetState, 2000);

            // Cleanup function
            return () => {
              window.removeEventListener('message', handleMessage);
              clearInterval(symbolInterval);
              clearInterval(cryptoInterval);
              clearInterval(hashInterval);
              clearInterval(widgetInterval);
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
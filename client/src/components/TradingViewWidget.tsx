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

      // Working configuration for TradingView widget
      // Handle symbol format - check if already has exchange prefix
      let tradingViewSymbol = symbol;

      // If symbol doesn't already have an exchange prefix, add one
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
        theme: theme,
        style: "1",
        locale: locale,
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        allow_symbol_change: false, // Disable TradingView's native symbol selector
        container_id: container_id,
        // Hide volume bars and studies
        studies: [],
        hide_volume: true,
        volume: false,
        studies_overrides: {
          "volume.volume.color.0": "rgba(0,0,0,0)",
          "volume.volume.color.1": "rgba(0,0,0,0)",
          "volume.volume.transparency": 100
        }
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

                    // Pattern 2.7: Enhanced detection for TradingView native symbol changes
                    // Look for any symbol pattern in the URL that might indicate a change
                    const allSymbolMatches = iframe.src.match(/symbol=([A-Z]{3,10})/g);
                    if (allSymbolMatches && allSymbolMatches.length > 0) {
                      for (const match of allSymbolMatches) {
                        const symbolPart = match.replace('symbol=', '');
                        let detectedSymbol = symbolPart;

                        // Handle various formats
                        if (detectedSymbol.includes('BINANCE%3A')) {
                          detectedSymbol = detectedSymbol.replace('BINANCE%3A', '');
                        }
                        if (detectedSymbol.includes('COINBASE%3A')) {
                          detectedSymbol = detectedSymbol.replace('COINBASE%3A', '');
                        }

                        // Normalize USD to USDT
                        if (detectedSymbol.endsWith('USD') && !detectedSymbol.endsWith('USDT')) {
                          detectedSymbol = detectedSymbol.replace('USD', 'USDT');
                        }

                        if (detectedSymbol !== currentSymbol && detectedSymbol.length >= 6) {
                          console.log('🔄 Enhanced symbol detection from URL parameter:', detectedSymbol, 'from', symbolPart);
                          currentSymbol = detectedSymbol;
                          onSymbolChange(detectedSymbol);
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

            // Check every 100ms for ultra-fast detection of TradingView native changes
            const symbolInterval = setInterval(checkSymbolChange, 100);

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

            // Enhanced monitoring for TradingView native symbol changes
            const monitorWidgetState = () => {
              try {
                const iframe = containerRef.current?.querySelector('iframe');
                if (iframe && iframe.contentWindow) {
                  // Monitor for DOM changes in the iframe (symbol display changes)
                  try {
                    // Check if the iframe URL has changed (indicates symbol change)
                    const currentUrl = iframe.src;
                    if (currentUrl !== lastKnownUrl) {
                      lastKnownUrl = currentUrl;
                      console.log('🔄 TradingView iframe URL changed:', currentUrl);
                      checkSymbolChange(); // Trigger immediate symbol check
                    }

                    // Post a message to the iframe to request current symbol
                    iframe.contentWindow.postMessage({
                      type: 'get_symbol',
                      source: 'metachrome'
                    }, '*');
                  } catch (e) {
                    // Silent error handling for CORS
                  }
                }
              } catch (error) {
                // Silent error handling
              }
            };

            let lastKnownUrl = '';

            // Monitor widget state every 500ms for faster detection
            const widgetInterval = setInterval(monitorWidgetState, 500);

            // Additional monitoring for TradingView's postMessage events
            const handleTradingViewMessage = (event: MessageEvent) => {
              try {
                if (event.origin.includes('tradingview.com') || event.origin.includes('tradingview-widget.com')) {
                  console.log('📨 TradingView message received:', event.data);

                  // Check if the message contains symbol information
                  if (event.data && typeof event.data === 'object') {
                    if (event.data.symbol || event.data.name) {
                      const symbolFromMessage = event.data.symbol || event.data.name;
                      const cleanSymbol = symbolFromMessage.replace('BINANCE:', '').replace('COINBASE:', '');

                      if (cleanSymbol && cleanSymbol !== currentSymbol) {
                        let normalizedSymbol = cleanSymbol;
                        if (cleanSymbol.endsWith('USD') && !cleanSymbol.endsWith('USDT')) {
                          normalizedSymbol = cleanSymbol.replace('USD', 'USDT');
                        }

                        console.log('🔄 Symbol change from TradingView message:', normalizedSymbol);
                        currentSymbol = normalizedSymbol;
                        onSymbolChange(normalizedSymbol);
                      }
                    }
                  }
                }
              } catch (error) {
                // Silent error handling
              }
            };

            // Listen for TradingView postMessage events
            window.addEventListener('message', handleTradingViewMessage);

            // Cleanup function
            return () => {
              window.removeEventListener('message', handleMessage);
              window.removeEventListener('message', handleTradingViewMessage);
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

  // Debug: Log component props
  console.log('🎯 TradingViewWidget render - type:', type, 'onSymbolChange:', !!onSymbolChange, 'symbol:', symbol);

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
      {/* Custom Symbol Selector - Only show for main chart, not ticker */}
      {type !== 'ticker' && onSymbolChange && (
        <div className="absolute top-4 left-4 z-50" style={{ zIndex: 9999 }}>
          <div className="bg-red-600 backdrop-blur-sm rounded-lg p-3 border border-gray-600 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-300">Symbol:</span>
              <select
                value={symbol.replace('BINANCE:', '').replace('COINBASE:', '')}
                onChange={(e) => {
                  const newSymbol = e.target.value;
                  onSymbolChange(newSymbol);
                  // Also try to update TradingView widget
                  const iframe = containerRef.current?.querySelector('iframe');
                  if (iframe) {
                    try {
                      // Update the iframe src to change symbol with proper exchange prefix
                      const tradingViewSymbol = newSymbol.includes('USDT')
                        ? `BINANCE:${newSymbol}`
                        : `COINBASE:${newSymbol}`;
                      const currentSrc = iframe.src;
                      const newSrc = currentSrc.replace(/symbol=[^&]*/, `symbol=${encodeURIComponent(tradingViewSymbol)}`);
                      iframe.src = newSrc;
                    } catch (error) {
                      console.log('Could not update TradingView symbol:', error);
                    }
                  }
                }}
                className="bg-gray-800 text-white text-sm font-medium rounded-md px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[100px]"
              >
                <option value="BTCUSDT">BTC/USDT</option>
                <option value="ETHUSDT">ETH/USDT</option>
                <option value="XRPUSDT">XRP/USDT</option>
                <option value="LTCUSDT">LTC/USDT</option>
                <option value="BNBUSDT">BNB/USDT</option>
                <option value="SOLUSDT">SOL/USDT</option>
                <option value="TONUSDT">TON/USDT</option>
                <option value="DOGEUSDT">DOGE/USDT</option>
                <option value="ADAUSDT">ADA/USDT</option>
                <option value="TRXUSDT">TRX/USDT</option>
                <option value="HYPEUSDT">HYPE/USDT</option>
                <option value="LINKUSDT">LINK/USDT</option>
                <option value="AVAXUSDT">AVAX/USDT</option>
                <option value="SUIUSDT">SUI/USDT</option>
                <option value="SHIBUSDT">SHIB/USDT</option>
                <option value="BCHUSDT">BCH/USDT</option>
                <option value="DOTUSDT">DOT/USDT</option>
                <option value="MATICUSDT">MATIC/USDT</option>
                <option value="XLMUSDT">XLM/USDT</option>
              </select>
            </div>
          </div>
        </div>
      )}

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
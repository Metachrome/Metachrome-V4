import React, { useEffect, useRef, useState } from 'react';

interface CustomTradingChartProps {
  symbol: string;
  height?: number;
  interval?: string;
  theme?: 'light' | 'dark';
  onSymbolChange?: (symbol: string) => void;
}

const CustomTradingChart: React.FC<CustomTradingChartProps> = ({
  symbol,
  height = 500,
  interval = '1',
  theme = 'dark',
  onSymbolChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous content
    containerRef.current.innerHTML = '';
    setIsLoading(true);

    // Create TradingView widget without volume
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';
    script.type = 'text/javascript';
    script.async = true;

    // Handle symbol format
    let tradingViewSymbol = symbol;
    if (!symbol.includes(':')) {
      tradingViewSymbol = symbol.includes('USDT')
        ? `BINANCE:${symbol}`
        : symbol.includes('USD')
        ? `COINBASE:${symbol}`
        : `BINANCE:${symbol}`;
    }

    const config = {
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

    script.onload = () => {
      console.log('✅ Custom TradingView chart loaded successfully');
      setIsLoading(false);
    };

    script.onerror = () => {
      console.error('❌ Failed to load custom TradingView chart');
      setIsLoading(false);
    };

    try {
      containerRef.current.appendChild(script);
    } catch (error) {
      console.error('Error appending custom chart script:', error);
      setIsLoading(false);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, height, interval, theme]);

  return (
    <div className="relative w-full h-full bg-[#10121E]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#10121E]">
          <div className="text-white text-sm">Loading chart...</div>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ height: `${height}px` }}
      />
    </div>
  );
};

export default CustomTradingChart;

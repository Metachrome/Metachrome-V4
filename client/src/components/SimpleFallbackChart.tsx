import React, { useEffect, useState } from 'react';

interface SimpleFallbackChartProps {
  symbol: string;
  height?: number;
}

/**
 * Simple Fallback Chart Component
 * Displays a basic candlestick chart for unsupported symbols
 * Uses canvas for rendering to avoid DOM cleanup issues
 */
export default function SimpleFallbackChart({
  symbol = 'BTCUSDT',
  height = 400
}: SimpleFallbackChartProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canvasRef, setCanvasRef] = React.useState<HTMLCanvasElement | null>(null);



  useEffect(() => {
    if (!canvasRef) return;

    const fetchAndDraw = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('📊 [SimpleFallbackChart] Fetching klines for', symbol);

        // Try to fetch from our API first, then fallback to direct Binance API
        let klines = null;

        try {
          const response = await fetch(`/api/binance/klines?symbol=${symbol}&interval=1m&limit=100`);
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              klines = result.data;
              console.log('✅ [SimpleFallbackChart] Got klines from API:', klines.length);
            }
          } else {
            console.warn('⚠️ [SimpleFallbackChart] API returned status:', response.status);
          }
        } catch (apiErr) {
          console.warn('⚠️ [SimpleFallbackChart] API endpoint failed:', apiErr);
        }

        // If API failed, fetch directly from Binance (with timeout)
        if (!klines) {
          try {
            console.log('📊 [SimpleFallbackChart] Trying direct Binance API for', symbol);
            const binanceUrl = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=100`;

            // Add timeout to prevent hanging
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            const response = await fetch(binanceUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (response.ok) {
              const data = await response.json();
              console.log('✅ [SimpleFallbackChart] Got data from Binance:', data.length, 'candles');

              // Transform Binance format to our format
              klines = data.map((candle: any) => ({
                time: Math.floor(candle[0] / 1000),
                open: parseFloat(candle[1]),
                high: parseFloat(candle[2]),
                low: parseFloat(candle[3]),
                close: parseFloat(candle[4]),
                volume: parseFloat(candle[5])
              }));
            } else {
              console.warn('⚠️ [SimpleFallbackChart] Binance API returned status:', response.status);
              const errorText = await response.text();
              console.warn('⚠️ [SimpleFallbackChart] Binance error:', errorText);
            }
          } catch (binanceErr) {
            console.warn('⚠️ [SimpleFallbackChart] Binance API failed:', binanceErr);
          }
        }

        // If still no data, try alternative Binance endpoints
        if (!klines || klines.length === 0) {
          try {
            console.log('📊 [SimpleFallbackChart] Trying alternative Binance endpoint for', symbol);

            // Try with different interval or endpoint
            const altUrl = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=5m&limit=100`;
            const controller2 = new AbortController();
            const timeoutId2 = setTimeout(() => controller2.abort(), 5000);

            const altResponse = await fetch(altUrl, { signal: controller2.signal });
            clearTimeout(timeoutId2);

            if (altResponse.ok) {
              const altData = await altResponse.json();
              console.log('✅ [SimpleFallbackChart] Got data from alternative endpoint:', altData.length, 'candles');

              klines = altData.map((candle: any) => ({
                time: Math.floor(candle[0] / 1000),
                open: parseFloat(candle[1]),
                high: parseFloat(candle[2]),
                low: parseFloat(candle[3]),
                close: parseFloat(candle[4]),
                volume: parseFloat(candle[5])
              }));
            }
          } catch (altErr) {
            console.warn('⚠️ [SimpleFallbackChart] Alternative endpoint failed:', altErr);
          }
        }

        // If still no data, show error instead of mock
        if (!klines || klines.length === 0) {
          throw new Error(`Unable to load chart data for ${symbol}. Please try again later.`);
        }

        if (!klines || klines.length === 0) {
          throw new Error('No chart data available');
        }

        console.log('✅ [SimpleFallbackChart] Received', klines.length, 'candles, drawing chart');

        // Draw candlestick chart on canvas
        drawChart(canvasRef, klines);
        setIsLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('❌ [SimpleFallbackChart] Error:', errorMessage);
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    fetchAndDraw();
  }, [symbol, canvasRef]);

  const drawChart = (canvas: HTMLCanvasElement, klines: any[]) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get the actual display size
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set canvas resolution
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Scale context to match device pixel ratio
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const chartHeight = rect.height - 40; // Leave space for labels
    const padding = 40;

    // Clear canvas
    ctx.fillStyle = '#10121E';
    ctx.fillRect(0, 0, width, canvas.height);

    if (klines.length === 0) return;

    // Calculate price range
    const prices = klines.flatMap(k => [k.high, k.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    // Draw grid
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw candlesticks
    const candleWidth = (width - padding * 2) / klines.length;
    const candleBodyWidth = Math.max(1, candleWidth * 0.6);

    klines.forEach((candle, index) => {
      const x = padding + index * candleWidth + candleWidth / 2;
      
      // Calculate Y positions
      const openY = padding + ((maxPrice - candle.open) / priceRange) * chartHeight;
      const closeY = padding + ((maxPrice - candle.close) / priceRange) * chartHeight;
      const highY = padding + ((maxPrice - candle.high) / priceRange) * chartHeight;
      const lowY = padding + ((maxPrice - candle.low) / priceRange) * chartHeight;

      const isGreen = candle.close >= candle.open;
      const color = isGreen ? '#10B981' : '#EF4444';

      // Draw wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw body
      ctx.fillStyle = color;
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(closeY - openY) || 1;
      ctx.fillRect(x - candleBodyWidth / 2, bodyTop, candleBodyWidth, bodyHeight);
    });

    // Draw price labels
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const price = maxPrice - (priceRange / 5) * i;
      const y = padding + (chartHeight / 5) * i + 4;
      ctx.fillText(price.toFixed(2), width - 5, y);
    }
  };

  return (
    <div
      style={{
        height: `${height}px`,
        width: "100%",
        position: "relative",
        backgroundColor: '#10121E',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#10121E]/80 z-10">
          <div className="text-gray-400 text-sm">Loading chart...</div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#10121E]/80 z-10">
          <div className="text-red-400 text-sm text-center px-4">
            Error: {error}
          </div>
        </div>
      )}

      <canvas
        ref={setCanvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
    </div>
  );
}


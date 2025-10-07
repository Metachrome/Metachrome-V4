import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { usePrice } from '../contexts/PriceContext';

/**
 * Lightweight Chart Component
 * 
 * Displays candlestick chart using data from Binance API
 * This is the SINGLE SOURCE OF TRUTH for chart display
 * Synchronized with all price panels through PriceContext
 */

interface LightweightChartProps {
  symbol?: string;
  interval?: string;
  height?: number | string;
  containerId?: string;
}

export default function LightweightChart({
  symbol = 'BTCUSDT',
  interval = '1m',
  height = 400,
  containerId = 'lightweight_chart'
}: LightweightChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { priceData } = usePrice();

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    console.log('📊 [LightweightChart] Initializing chart for', symbol, interval);

    // Calculate chart height - handle different height formats
    let chartHeight = 400; // default
    if (typeof height === 'number') {
      chartHeight = height;
    } else if (typeof height === 'string') {
      if (height.includes('%')) {
        // For percentage heights, use the container's actual height
        chartHeight = chartContainerRef.current.clientHeight || window.innerHeight * 0.8;
      } else if (height.includes('calc(') || height.includes('vh')) {
        // For calc() or vh values, use container height or calculate from viewport
        const containerHeight = chartContainerRef.current.clientHeight;
        if (containerHeight > 50) { // Ensure we have a reasonable height
          chartHeight = containerHeight;
        } else {
          // Mobile fallback: use most of viewport minus header space
          chartHeight = Math.max(400, window.innerHeight - 150);
        }
      } else {
        chartHeight = parseInt(height) || 400;
      }
    }

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartHeight,
      layout: {
        background: { color: '#10121E' },
        textColor: '#D1D5DB',
      },
      grid: {
        vertLines: { color: '#1F2937' },
        horzLines: { color: '#1F2937' },
      },
      crosshair: {
        mode: 1, // Normal crosshair
      },
      rightPriceScale: {
        borderColor: '#374151',
        width: 60, // Compact width for mobile
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: '#374151',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10B981',
      downColor: '#EF4444',
      borderUpColor: '#10B981',
      borderDownColor: '#EF4444',
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#6B7280',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // Set as overlay
    });

    volumeSeriesRef.current = volumeSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        // Recalculate height for dynamic heights
        let newHeight = chartHeight;
        if (typeof height === 'string') {
          if (height.includes('%') || height.includes('calc(') || height.includes('vh')) {
            const containerHeight = chartContainerRef.current.clientHeight;
            newHeight = containerHeight > 50 ? containerHeight : Math.max(400, window.innerHeight - 150);
          }
        }

        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: newHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [symbol, interval, height]);

  // Fetch and update chart data
  useEffect(() => {
    const fetchKlines = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('📊 [LightweightChart] Fetching klines for', symbol, interval);

        const response = await fetch(`/api/binance/klines?symbol=${symbol}&interval=${interval}&limit=500`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (!result.success || !result.data) {
          throw new Error('Invalid response format');
        }

        const klines = result.data;

        console.log('✅ [LightweightChart] Received', klines.length, 'candles');
        console.log('📊 [LightweightChart] Latest candle:', klines[klines.length - 1]);

        // Update candlestick series
        if (candlestickSeriesRef.current) {
          candlestickSeriesRef.current.setData(klines);
        }

        // Update volume series
        if (volumeSeriesRef.current) {
          const volumeData = klines.map((candle: any) => ({
            time: candle.time,
            value: candle.volume,
            color: candle.close >= candle.open ? '#10B98180' : '#EF444480' // Semi-transparent
          }));
          volumeSeriesRef.current.setData(volumeData);
        }

        // Fit content
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent();
        }

        setIsLoading(false);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('❌ [LightweightChart] Error fetching klines:', errorMessage);
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    fetchKlines();

    // REMOVED: Auto-refresh interval - Chart should only update last candle with real-time price
    // Full chart refresh is annoying and unnecessary
    // Real-time updates are handled by the useEffect below that updates only the last candle
  }, [symbol, interval]);

  // Update last candle with real-time price
  useEffect(() => {
    if (!priceData || !candlestickSeriesRef.current) return;

    console.log('📊 [LightweightChart] Updating last candle with real-time price:', priceData.price);

    // Get current time in seconds
    const currentTime = Math.floor(Date.now() / 1000);

    // Update last candle (this will be replaced by next klines fetch)
    // This is just for visual real-time update
    candlestickSeriesRef.current.update({
      time: currentTime as Time,
      open: priceData.openPrice,
      high: priceData.high24h,
      low: priceData.low24h,
      close: priceData.price
    });

  }, [priceData]);

  return (
    <div className="relative w-full" style={{ height: typeof height === 'number' ? `${height}px` : height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#10121E]/80 z-10">
          <div className="text-gray-400 text-sm">
            <div className="animate-pulse">Loading chart data...</div>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#10121E]/80 z-10">
          <div className="text-red-400 text-sm">
            Error loading chart: {error}
          </div>
        </div>
      )}

      <div
        ref={chartContainerRef}
        id={containerId}
        className="w-full h-full"
      />

      {/* Chart Info Overlay */}
      {priceData && !isLoading && (
        <div className="absolute top-2 left-2 bg-[#10121E]/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-700 z-20">
          <div className="text-xs text-gray-400 mb-1">{symbol}</div>
          <div className="text-lg font-bold text-white">
            ${priceData.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`text-sm ${priceData.priceChangePercent24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {priceData.priceChangePercent24h >= 0 ? '+' : ''}{priceData.priceChangePercent24h.toFixed(2)}%
          </div>
        </div>
      )}
    </div>
  );
}


/**
 * Test Page for Price Synchronization
 *
 * This page tests that ALL price displays show the SAME price from PriceContext
 */
import { PriceProvider, usePrice, usePriceChange, use24hStats } from "../contexts/PriceContext";
import LightweightChart from "../components/LightweightChart";
function TestPriceSyncContent() {
    var _a = usePrice(), priceData = _a.priceData, isLoading = _a.isLoading, error = _a.error;
    var _b = usePriceChange(), changeText = _b.changeText, changeColor = _b.changeColor, isPositive = _b.isPositive;
    var _c = use24hStats(), high = _c.high, low = _c.low, volume = _c.volume;
    if (isLoading) {
        return (<div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading price data...</div>
      </div>);
    }
    if (error) {
        return (<div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>);
    }
    return (<div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Price Synchronization Test</h1>

      {/* Price Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Card 1: Current Price */}
        <div className="bg-[#10121E] p-6 rounded-lg border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">Current Price (from usePrice)</div>
          <div className="text-2xl font-bold text-white">
            ${priceData === null || priceData === void 0 ? void 0 : priceData.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={"text-sm mt-2"} style={{ color: changeColor }}>
            {changeText}
          </div>
        </div>

        {/* Card 2: 24h High */}
        <div className="bg-[#10121E] p-6 rounded-lg border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">24h High</div>
          <div className="text-2xl font-bold text-green-400">
            ${high.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Card 3: 24h Low */}
        <div className="bg-[#10121E] p-6 rounded-lg border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">24h Low</div>
          <div className="text-2xl font-bold text-red-400">
            ${low.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Card 4: 24h Volume */}
        <div className="bg-[#10121E] p-6 rounded-lg border border-gray-700">
          <div className="text-gray-400 text-sm mb-2">24h Volume</div>
          <div className="text-2xl font-bold text-blue-400">
            {volume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} BTC
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-[#10121E] p-4 rounded-lg border border-gray-700 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Lightweight Chart (Binance Data)</h2>
        <LightweightChart symbol="BTCUSDT" interval="1m" height={500} containerId="test_chart"/>
      </div>

      {/* Simulated Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left Panel - Order Book */}
        <div className="bg-[#10121E] p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">Order Book (Left Panel)</h3>
          <div className="text-gray-400 text-sm mb-2">Current Price:</div>
          <div className="text-xl font-bold text-white">
            ${priceData === null || priceData === void 0 ? void 0 : priceData.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-red-400">${(priceData.price + 100).toFixed(2)}</span>
              <span className="text-gray-400">0.5 BTC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-red-400">${(priceData.price + 50).toFixed(2)}</span>
              <span className="text-gray-400">1.2 BTC</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t border-b border-gray-700 py-2">
              <span className="text-white">${priceData === null || priceData === void 0 ? void 0 : priceData.price.toFixed(2)}</span>
              <span className="text-gray-400">CURRENT</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-400">${(priceData.price - 50).toFixed(2)}</span>
              <span className="text-gray-400">0.8 BTC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-400">${(priceData.price - 100).toFixed(2)}</span>
              <span className="text-gray-400">1.5 BTC</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Trading Controls */}
        <div className="bg-[#10121E] p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">Trading Panel (Right Panel)</h3>
          <div className="text-gray-400 text-sm mb-2">Entry Price:</div>
          <div className="text-xl font-bold text-white mb-4">
            ${priceData === null || priceData === void 0 ? void 0 : priceData.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-gray-400 text-sm">Amount (USDT)</label>
              <input type="number" className="w-full bg-gray-800 text-white px-3 py-2 rounded mt-1" placeholder="100"/>
            </div>
            <div>
              <label className="text-gray-400 text-sm">Duration</label>
              <select className="w-full bg-gray-800 text-white px-3 py-2 rounded mt-1">
                <option>30 seconds</option>
                <option>60 seconds</option>
              </select>
            </div>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-bold">
              BUY (UP)
            </button>
            <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-bold">
              SELL (DOWN)
            </button>
          </div>
        </div>

        {/* Bottom Panel - Stats */}
        <div className="bg-[#10121E] p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">Stats Panel (Bottom Panel)</h3>
          <div className="space-y-3">
            <div>
              <div className="text-gray-400 text-sm">Current Price</div>
              <div className="text-lg font-bold text-white">
                ${priceData === null || priceData === void 0 ? void 0 : priceData.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">24h Change</div>
              <div className={"text-lg font-bold"} style={{ color: changeColor }}>
                {changeText}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">24h High</div>
              <div className="text-lg font-bold text-green-400">
                ${high.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">24h Low</div>
              <div className="text-lg font-bold text-red-400">
                ${low.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-8 bg-[#10121E] p-6 rounded-lg border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4">Debug Info (Raw Data)</h3>
        <pre className="text-gray-400 text-xs overflow-auto">
          {JSON.stringify(priceData, null, 2)}
        </pre>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-900/20 border border-blue-700 p-6 rounded-lg">
        <h3 className="text-lg font-bold text-blue-400 mb-2">✅ Test Instructions</h3>
        <ul className="text-gray-300 space-y-2 text-sm">
          <li>1. Check that ALL price displays show the SAME number</li>
          <li>2. Wait 2 seconds and verify all prices update TOGETHER</li>
          <li>3. Compare chart overlay price with panel prices - should be IDENTICAL</li>
          <li>4. Check browser console for price update logs</li>
          <li>5. If all prices match, synchronization is working! ✅</li>
        </ul>
      </div>
    </div>);
}
export default function TestPriceSyncPage() {
    return (<PriceProvider symbol="BTCUSDT" updateInterval={2000}>
      <TestPriceSyncContent />
    </PriceProvider>);
}

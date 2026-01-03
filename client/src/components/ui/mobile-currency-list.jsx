import { TrendingUp } from "lucide-react";
import { useIsMobile } from "../../hooks/use-mobile";
import { useCryptoData } from "../../services/cryptoDataService";
function CurrencyItem(_a) {
    var symbol = _a.symbol, name = _a.name, price = _a.price, change = _a.change, icon = _a.icon, color = _a.color;
    var isPositive = change.startsWith('+');
    return (<div className="flex items-center justify-between py-4 px-4 border-b border-gray-800/50">
      <div className="flex items-center space-x-3">
        <div className={"w-10 h-10 rounded-full ".concat(color, " flex items-center justify-center text-white font-bold text-sm")}>
          {symbol.slice(0, 3)}
        </div>
        <div>
          <div className="text-white font-semibold text-sm">{symbol}</div>
          <div className="text-gray-400 text-xs">{name}</div>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="w-12 h-6 flex items-center justify-center">
          <svg width="48" height="24" viewBox="0 0 48 24" className="text-green-400">
            <path d="M2 20 L12 12 L22 16 L46 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        <div className="text-right">
          <div className="text-white font-semibold text-sm">{price}</div>
          <div className={"text-xs flex items-center ".concat(isPositive ? 'text-green-400' : 'text-red-400')}>
            <TrendingUp className="w-3 h-3 mr-1"/>
            {change}
          </div>
        </div>
      </div>
    </div>);
}
export function MobileCurrencyList() {
    var isMobile = useIsMobile();
    var _a = useCryptoData(), cryptoData = _a.cryptoData, loading = _a.loading, error = _a.error;
    if (!isMobile) {
        return null;
    }
    // Debug logging
    console.log('🔍 MobileCurrencyList Debug:');
    console.log('  - cryptoData length:', (cryptoData === null || cryptoData === void 0 ? void 0 : cryptoData.length) || 0);
    console.log('  - loading:', loading);
    console.log('  - error:', error);
    console.log('  - cryptoData sample:', cryptoData === null || cryptoData === void 0 ? void 0 : cryptoData.slice(0, 3));
    // Default currencies if API data is not available
    var defaultCurrencies = [
        {
            symbol: "BTC/USDT",
            name: "BTC",
            price: "$117,378.01",
            change: "+1.70%",
            color: "bg-orange-500"
        },
        {
            symbol: "ETH/USDT",
            name: "ETH",
            price: "$3,741.71",
            change: "+3.37%",
            color: "bg-blue-500"
        },
        {
            symbol: "BNB/USDT",
            name: "BNB",
            price: "$698.45",
            change: "+1.89%",
            color: "bg-yellow-600"
        },
        {
            symbol: "SOL/USDT",
            name: "SOL",
            price: "$245.67",
            change: "+3.42%",
            color: "bg-purple-500"
        },
        {
            symbol: "XRP/USDT",
            name: "XRP",
            price: "$3.1833",
            change: "-1.77%",
            color: "bg-gray-600"
        },
        {
            symbol: "DOGE/USDT",
            name: "DOGE",
            price: "$0.23878",
            change: "+0.89%",
            color: "bg-yellow-500"
        },
        {
            symbol: "ADA/USDT",
            name: "ADA",
            price: "$0.8212",
            change: "+0.66%",
            color: "bg-blue-600"
        },
        {
            symbol: "AVAX/USDT",
            name: "AVAX",
            price: "$45.67",
            change: "+1.89%",
            color: "bg-red-500"
        },
        {
            symbol: "LINK/USDT",
            name: "LINK",
            price: "$22.34",
            change: "+2.45%",
            color: "bg-blue-400"
        },
        {
            symbol: "DOT/USDT",
            name: "DOT",
            price: "$8.456",
            change: "+0.78%",
            color: "bg-pink-500"
        },
        {
            symbol: "POL/USDT",
            name: "POL",
            price: "$0.4567",
            change: "+1.23%",
            color: "bg-purple-600"
        },
        {
            symbol: "LTC/USDT",
            name: "LTC",
            price: "$112.45",
            change: "+2.15%",
            color: "bg-gray-500"
        }
    ];
    var currencies = cryptoData && cryptoData.length > 0 ?
        cryptoData.slice(0, 12).map(function (crypto) {
            // Use rawChange from the crypto service, fallback to 0
            var change24h = crypto.rawChange || 0;
            var price = crypto.price || '0.00';
            var symbol = crypto.symbol || 'UNKNOWN';
            return {
                symbol: symbol,
                name: symbol.replace('/USDT', '').replace('USDT', ''),
                price: price.toString(),
                change: change24h > 0 ? "+".concat(change24h.toFixed(2), "%") : "".concat(change24h.toFixed(2), "%"),
                color: change24h > 0 ? "bg-green-500" : "bg-red-500"
            };
        }) : defaultCurrencies;
    console.log('📊 Final currencies for display:', currencies.length, 'items');
    console.log('📊 Using data source:', cryptoData && cryptoData.length > 0 ? 'API data' : 'default data');
    return (<div className="bg-[#0D0B1F] px-0">
      <div className="px-4 py-4">
        <h2 className="text-white text-lg font-semibold">Currency List</h2>
      </div>
      
      <div className="bg-[#1A1B3A]/50">
        {currencies.map(function (currency, index) { return (<CurrencyItem key={currency.symbol} symbol={currency.symbol} name={currency.name} price={currency.price} change={currency.change} icon="" color={currency.color}/>); })}
      </div>
    </div>);
}

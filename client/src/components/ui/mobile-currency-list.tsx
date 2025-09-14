import { TrendingUp } from "lucide-react";
import { useIsMobile } from "../../hooks/use-mobile";
import { useCryptoData } from "../../services/cryptoDataService";

interface CurrencyItemProps {
  symbol: string;
  name: string;
  price: string;
  change: string;
  icon: string;
  color: string;
}

function CurrencyItem({ symbol, name, price, change, icon, color }: CurrencyItemProps) {
  const isPositive = change.startsWith('+');
  
  return (
    <div className="flex items-center justify-between py-4 px-4 border-b border-gray-800/50">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white font-bold text-sm`}>
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
            <path
              d="M2 20 L12 12 L22 16 L46 4"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        
        <div className="text-right">
          <div className="text-white font-semibold text-sm">{price}</div>
          <div className={`text-xs flex items-center ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            <TrendingUp className="w-3 h-3 mr-1" />
            {change}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MobileCurrencyList() {
  const isMobile = useIsMobile();
  const { cryptoData, loading, error } = useCryptoData();

  if (!isMobile) {
    return null;
  }

  // Default currencies if API data is not available
  const defaultCurrencies = [
    {
      symbol: "BTCUSDT",
      name: "BTC",
      price: "117378.01",
      change: "+1.70%",
      color: "bg-orange-500"
    },
    {
      symbol: "ETHUSDT", 
      name: "ETH",
      price: "3741.71",
      change: "+3.37%",
      color: "bg-blue-500"
    },
    {
      symbol: "DOGEUSDT",
      name: "DOGE", 
      price: "0.237699",
      change: "+5.43%",
      color: "bg-yellow-500"
    },
    {
      symbol: "XRPUSDT",
      name: "XRP",
      price: "3.163320", 
      change: "+3.36%",
      color: "bg-gray-600"
    },
    {
      symbol: "TRUMPUSDT",
      name: "TRUMP",
      price: "10.0993",
      change: "+4.35%",
      color: "bg-red-600"
    }
  ];

  const currencies = cryptoData && cryptoData.length > 0 ?
    cryptoData.slice(0, 5).map((crypto: any) => {
      // Use rawChange from the crypto service, fallback to 0
      const change24h = crypto.rawChange || 0;
      const price = crypto.price || '0.00';
      const symbol = crypto.symbol || 'UNKNOWN';

      return {
        symbol: symbol,
        name: symbol.replace('/USDT', '').replace('USDT', ''),
        price: price.toString(),
        change: change24h > 0 ? `+${change24h.toFixed(2)}%` : `${change24h.toFixed(2)}%`,
        color: change24h > 0 ? "bg-green-500" : "bg-red-500"
      };
    }) : defaultCurrencies;

  return (
    <div className="bg-[#0D0B1F] px-0">
      <div className="px-4 py-4">
        <h2 className="text-white text-lg font-semibold">Currency List</h2>
      </div>
      
      <div className="bg-[#1A1B3A]/50">
        {currencies.map((currency, index) => (
          <CurrencyItem
            key={currency.symbol}
            symbol={currency.symbol}
            name={currency.name}
            price={currency.price}
            change={currency.change}
            icon=""
            color={currency.color}
          />
        ))}
      </div>
    </div>
  );
}

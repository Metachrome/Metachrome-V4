var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useQuery } from "@tanstack/react-query";
export default function OrderBook(_a) {
    var _b;
    var symbol = _a.symbol;
    var _c = useState("all"), viewMode = _c[0], setViewMode = _c[1];
    var _d = useState([]), sellOrders = _d[0], setSellOrders = _d[1];
    var _e = useState([]), buyOrders = _e[0], setBuyOrders = _e[1];
    var marketData = useQuery({
        queryKey: ["/api/market-data"],
    }).data;
    var currentPrice = parseFloat(((_b = marketData === null || marketData === void 0 ? void 0 : marketData.find(function (data) { return data.symbol === symbol; })) === null || _b === void 0 ? void 0 : _b.price) || "0");
    // Generate mock order book data
    useEffect(function () {
        if (currentPrice === 0)
            return;
        var generateOrders = function (basePrice, isAsk) {
            var orders = [];
            var total = 0;
            for (var i = 0; i < 10; i++) {
                var priceOffset = (i + 1) * (Math.random() * 5 + 1);
                var price = isAsk ? basePrice + priceOffset : basePrice - priceOffset;
                var size = Math.random() * 2 + 0.1;
                total += size;
                orders.push({
                    price: parseFloat(price.toFixed(2)),
                    size: parseFloat(size.toFixed(3)),
                    total: parseFloat(total.toFixed(3))
                });
            }
            return orders;
        };
        setSellOrders(generateOrders(currentPrice, true));
        setBuyOrders(generateOrders(currentPrice, false));
        // Update orders every 2 seconds
        var interval = setInterval(function () {
            setSellOrders(generateOrders(currentPrice, true));
            setBuyOrders(generateOrders(currentPrice, false));
        }, 2000);
        return function () { return clearInterval(interval); };
    }, [currentPrice]);
    var maxTotal = Math.max.apply(Math, __spreadArray(__spreadArray([], sellOrders.map(function (order) { return order.total; }), false), buyOrders.map(function (order) { return order.total; }), false));
    var OrderRow = function (_a) {
        var order = _a.order, type = _a.type;
        var percentage = (order.total / maxTotal) * 100;
        var bgColor = type === "buy" ? "bg-green-500/10" : "bg-red-500/10";
        return (<div className="relative flex justify-between items-center py-1 px-2 text-xs hover:bg-dark-100/50">
        <div className={"absolute right-0 top-0 h-full ".concat(bgColor, " transition-all duration-300")} style={{ width: "".concat(percentage, "%") }}/>
        <span className={"relative z-10 font-mono ".concat(type === "buy" ? "text-green-400" : "text-red-400")}>
          {order.price.toFixed(2)}
        </span>
        <span className="relative z-10 font-mono text-muted-foreground">
          {order.size.toFixed(3)}
        </span>
        <span className="relative z-10 font-mono text-muted-foreground">
          {order.total.toFixed(3)}
        </span>
      </div>);
    };
    return (<Card className="card-dark h-96">
      <CardContent className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Order Book</h3>
          <div className="flex space-x-1">
            <Button variant={viewMode === "sells" ? "default" : "ghost"} size="sm" onClick={function () { return setViewMode("sells"); }} className="w-6 h-6 p-0 text-xs bg-red-500/20 text-red-500 hover:bg-red-500/30">
              S
            </Button>
            <Button variant={viewMode === "buys" ? "default" : "ghost"} size="sm" onClick={function () { return setViewMode("buys"); }} className="w-6 h-6 p-0 text-xs bg-green-500/20 text-green-500 hover:bg-green-500/30">
              B
            </Button>
            <Button variant={viewMode === "all" ? "default" : "ghost"} size="sm" onClick={function () { return setViewMode("all"); }} className="w-6 h-6 p-0 text-xs bg-muted text-muted-foreground hover:bg-accent">
              A
            </Button>
          </div>
        </div>

        {/* Header */}
        <div className="flex justify-between mb-2 text-xs text-muted-foreground border-b border-border pb-1">
          <span>Price</span>
          <span>Size</span>
          <span>Total</span>
        </div>

        <div className="flex-1 overflow-hidden">
          {/* Sell Orders */}
          {(viewMode === "all" || viewMode === "sells") && (<div className="flex flex-col-reverse max-h-32 overflow-hidden">
              {sellOrders.slice(0, viewMode === "sells" ? 15 : 8).map(function (order, index) { return (<OrderRow key={"sell-".concat(index)} order={order} type="sell"/>); })}
            </div>)}

          {/* Current Price */}
          {viewMode === "all" && (<div className="border-t border-b border-border py-2 my-1">
              <div className="text-center font-bold text-lg">
                <span className={currentPrice > 0 ? "text-green-400" : "text-red-400"}>
                  {currentPrice.toFixed(2)}
                </span>
              </div>
              <div className="text-center text-xs text-muted-foreground">
                ≈ ${currentPrice.toFixed(2)}
              </div>
            </div>)}

          {/* Buy Orders */}
          {(viewMode === "all" || viewMode === "buys") && (<div className="max-h-32 overflow-hidden">
              {buyOrders.slice(0, viewMode === "buys" ? 15 : 8).map(function (order, index) { return (<OrderRow key={"buy-".concat(index)} order={order} type="buy"/>); })}
            </div>)}
        </div>

        {/* Summary */}
        <div className="mt-2 pt-2 border-t border-border">
          <div className="flex justify-between text-xs">
            <div className="text-green-400">
              Σ{buyOrders.reduce(function (sum, order) { return sum + order.size; }, 0).toFixed(3)}
            </div>
            <div className="text-red-400">
              Σ{sellOrders.reduce(function (sum, order) { return sum + order.size; }, 0).toFixed(3)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>);
}

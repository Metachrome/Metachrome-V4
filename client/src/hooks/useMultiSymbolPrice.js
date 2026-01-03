var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { useState, useEffect, useCallback } from 'react';
// Default symbols to fetch - All supported trading pairs
var DEFAULT_SYMBOLS = [
    'BTCUSDT',
    'ETHUSDT',
    'BNBUSDT',
    'SOLUSDT',
    'XRPUSDT',
    'ADAUSDT',
    'LTCUSDT',
    'TONUSDT',
    'DOGEUSDT',
    'AVAXUSDT',
    'DOTUSDT',
    'LINKUSDT',
    'POLUSDT',
    'UNIUSDT',
    'ATOMUSDT',
    'FILUSDT',
    'TRXUSDT',
    'ETCUSDT',
    'XLMUSDT'
];
export function useMultiSymbolPrice(symbols, updateInterval // Update every 5 seconds
) {
    var _this = this;
    if (symbols === void 0) { symbols = DEFAULT_SYMBOLS; }
    if (updateInterval === void 0) { updateInterval = 5000; }
    var _a = useState({}), priceData = _a[0], setPriceData = _a[1];
    var _b = useState(true), isLoading = _b[0], setIsLoading = _b[1];
    var _c = useState(null), error = _c[0], setError = _c[1];
    var fetchPriceForSymbol = useCallback(function (symbol) { return __awaiter(_this, void 0, void 0, function () {
        var response, result, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("/api/binance/price?symbol=".concat(symbol))];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    if (result.success && result.data) {
                        return [2 /*return*/, result.data];
                    }
                    else {
                        throw new Error('Invalid response format');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.error("\u274C [MultiSymbolPrice] Error fetching ".concat(symbol, ":"), err_1);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    }); }, []);
    var fetchAllPrices = useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var pricePromises, results, newPriceData_1, successCount_1, err_2, errorMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    console.log('💰 [MultiSymbolPrice] Fetching prices for:', symbols);
                    pricePromises = symbols.map(function (symbol) {
                        return fetchPriceForSymbol(symbol).then(function (data) { return ({ symbol: symbol, data: data }); });
                    });
                    return [4 /*yield*/, Promise.all(pricePromises)];
                case 1:
                    results = _a.sent();
                    newPriceData_1 = {};
                    successCount_1 = 0;
                    results.forEach(function (_a) {
                        var symbol = _a.symbol, data = _a.data;
                        if (data) {
                            newPriceData_1[symbol] = data;
                            successCount_1++;
                        }
                    });
                    if (successCount_1 > 0) {
                        setPriceData(newPriceData_1);
                        setError(null);
                        console.log("\u2705 [MultiSymbolPrice] Updated ".concat(successCount_1, "/").concat(symbols.length, " symbols"));
                    }
                    else {
                        throw new Error('Failed to fetch any price data');
                    }
                    return [3 /*break*/, 4];
                case 2:
                    err_2 = _a.sent();
                    errorMessage = err_2 instanceof Error ? err_2.message : 'Unknown error';
                    console.error('❌ [MultiSymbolPrice] Error fetching prices:', errorMessage);
                    setError(errorMessage);
                    return [3 /*break*/, 4];
                case 3:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [symbols, fetchPriceForSymbol]);
    // Helper function to get price data for a specific symbol
    var getPriceForSymbol = useCallback(function (symbol) {
        return priceData[symbol] || null;
    }, [priceData]);
    // Initial fetch
    useEffect(function () {
        fetchAllPrices();
    }, [fetchAllPrices]);
    // Periodic updates
    useEffect(function () {
        var interval = setInterval(function () {
            fetchAllPrices();
        }, updateInterval);
        return function () { return clearInterval(interval); };
    }, [fetchAllPrices, updateInterval]);
    return {
        priceData: priceData,
        isLoading: isLoading,
        error: error,
        refreshPrices: fetchAllPrices,
        getPriceForSymbol: getPriceForSymbol
    };
}

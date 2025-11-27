"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebSocket = setupWebSocket;
var ws_1 = require("ws");
var storage_1 = require("./storage");
function setupWebSocket(server) {
    var _this = this;
    var wss = new ws_1.WebSocketServer({
        noServer: true,
        perMessageDeflate: false,
    });
    var clients = new Map();
    var priceFeeds = new Map();
    // Manual upgrade handling to prevent Express from interfering
    server.on('upgrade', function (request, socket, head) {
        var pathname = new URL(request.url || '', "http://".concat(request.headers.host)).pathname;
        console.log('🔌 WebSocket upgrade request received for path:', pathname);
        if (pathname === '/ws') {
            console.log('✅ Valid WebSocket path, handling upgrade...');
            wss.handleUpgrade(request, socket, head, function (ws) {
                console.log('✅ WebSocket upgrade successful, emitting connection event');
                wss.emit('connection', ws, request);
            });
        }
        else {
            console.log('❌ Invalid WebSocket path:', pathname, '- destroying socket');
            socket.destroy();
        }
    });
    wss.on('connection', function (ws) {
        var clientId = generateClientId();
        clients.set(clientId, {
            ws: ws,
            subscriptions: new Set(),
        });
        console.log("WebSocket client connected: ".concat(clientId));
        ws.on('message', function (message) { return __awaiter(_this, void 0, void 0, function () {
            var data, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        data = JSON.parse(message.toString());
                        return [4 /*yield*/, handleMessage(clientId, data)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error handling WebSocket message:', error_1);
                        ws.send(JSON.stringify({
                            type: 'error',
                            data: { message: 'Invalid message format' }
                        }));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        ws.on('close', function () {
            console.log("WebSocket client disconnected: ".concat(clientId));
            clients.delete(clientId);
        });
        ws.on('error', function (error) {
            console.error("WebSocket error for client ".concat(clientId, ":"), error);
            clients.delete(clientId);
        });
        // Send initial market data
        sendMarketDataToClient(clientId);
    });
    function handleMessage(clientId, message) {
        return __awaiter(this, void 0, void 0, function () {
            var client, _a, _i, _b, symbol, marketData;
            var _c, _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        client = clients.get(clientId);
                        if (!client)
                            return [2 /*return*/];
                        _a = message.type;
                        switch (_a) {
                            case 'subscribe': return [3 /*break*/, 1];
                            case 'unsubscribe': return [3 /*break*/, 6];
                            case 'ping': return [3 /*break*/, 7];
                            case 'subscribe_chat': return [3 /*break*/, 8];
                            case 'subscribe_admin_chat': return [3 /*break*/, 9];
                            case 'send_message': return [3 /*break*/, 10];
                            case 'admin_message': return [3 /*break*/, 11];
                        }
                        return [3 /*break*/, 12];
                    case 1:
                        if (!((_c = message.data) === null || _c === void 0 ? void 0 : _c.symbols)) return [3 /*break*/, 5];
                        message.data.symbols.forEach(function (symbol) {
                            client.subscriptions.add(symbol);
                        });
                        _i = 0, _b = message.data.symbols;
                        _h.label = 2;
                    case 2:
                        if (!(_i < _b.length)) return [3 /*break*/, 5];
                        symbol = _b[_i];
                        return [4 /*yield*/, storage_1.storage.getMarketData(symbol)];
                    case 3:
                        marketData = _h.sent();
                        if (marketData) {
                            client.ws.send(JSON.stringify({
                                type: 'price_update',
                                data: marketData
                            }));
                        }
                        _h.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 12];
                    case 6:
                        if ((_d = message.data) === null || _d === void 0 ? void 0 : _d.symbols) {
                            message.data.symbols.forEach(function (symbol) {
                                client.subscriptions.delete(symbol);
                            });
                        }
                        return [3 /*break*/, 12];
                    case 7:
                        client.ws.send(JSON.stringify({ type: 'pong' }));
                        return [3 /*break*/, 12];
                    case 8:
                        // User subscribes to their own chat updates
                        if ((_e = message.data) === null || _e === void 0 ? void 0 : _e.userId) {
                            client.userId = message.data.userId;
                            console.log("User ".concat(message.data.userId, " subscribed to chat updates"));
                        }
                        return [3 /*break*/, 12];
                    case 9:
                        // Admin subscribes to all chat updates
                        client.isAdmin = true;
                        console.log("Admin subscribed to all chat updates");
                        return [3 /*break*/, 12];
                    case 10:
                        // User sends a message - broadcast to admin
                        if (message.data) {
                            broadcastToAdmins({
                                type: 'new_message',
                                data: message.data
                            });
                        }
                        return [3 /*break*/, 12];
                    case 11:
                        // Admin sends a message - broadcast to specific user
                        if (((_f = message.data) === null || _f === void 0 ? void 0 : _f.userId) && ((_g = message.data) === null || _g === void 0 ? void 0 : _g.message)) {
                            console.log("\uD83D\uDCE4 Broadcasting admin message to user ".concat(message.data.userId));
                            broadcastToUser(message.data.userId, {
                                type: 'new_message',
                                data: message.data.message // Send only the message object, not the wrapper
                            });
                        }
                        return [3 /*break*/, 12];
                    case 12: return [2 /*return*/];
                }
            });
        });
    }
    function sendMarketDataToClient(clientId) {
        return __awaiter(this, void 0, void 0, function () {
            var client, marketData, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client = clients.get(clientId);
                        if (!client || client.ws.readyState !== ws_1.WebSocket.OPEN)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, storage_1.storage.getAllMarketData()];
                    case 2:
                        marketData = _a.sent();
                        client.ws.send(JSON.stringify({
                            type: 'market_data',
                            data: marketData
                        }));
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Error sending market data:', error_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    function broadcastPriceUpdate(symbol, data) {
        clients.forEach(function (client, clientId) {
            if (client.subscriptions.has(symbol) && client.ws.readyState === ws_1.WebSocket.OPEN) {
                client.ws.send(JSON.stringify({
                    type: 'price_update',
                    data: __assign({ symbol: symbol }, data)
                }));
            }
        });
    }
    function broadcastToAll(message) {
        clients.forEach(function (client) {
            if (client.ws.readyState === ws_1.WebSocket.OPEN) {
                client.ws.send(JSON.stringify(message));
            }
        });
    }
    function broadcastToAdmins(message) {
        clients.forEach(function (client) {
            if (client.isAdmin && client.ws.readyState === ws_1.WebSocket.OPEN) {
                client.ws.send(JSON.stringify(message));
            }
        });
    }
    function broadcastTradingControlUpdate(userId, controlType, adminId) {
        var message = {
            type: 'trading_control_update',
            data: {
                userId: userId,
                controlType: controlType,
                adminId: adminId,
                timestamp: new Date().toISOString()
            }
        };
        console.log('📡 Broadcasting trading control update via WebSocket:', message);
        broadcastToAll(message);
    }
    function broadcastToUser(userId, message) {
        var sentCount = 0;
        clients.forEach(function (client, clientId) {
            // Only send to clients that belong to the specific user
            if (client.userId === userId && client.ws.readyState === ws_1.WebSocket.OPEN) {
                client.ws.send(JSON.stringify(message));
                sentCount++;
                console.log("\u2705 Message sent to user ".concat(userId, " (client ").concat(clientId, ")"));
            }
        });
        if (sentCount === 0) {
            console.log("\u26A0\uFE0F No active WebSocket connection found for user ".concat(userId));
        }
    }
    // Simulate real-time price updates
    function updatePrices() {
        return __awaiter(this, void 0, void 0, function () {
            var symbols, _i, symbols_1, symbol, currentData, currentPrice, change, newPrice, priceChange24h, priceChangePercent24h, updatedData, basePrices, price, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        symbols = ['BTCUSDT', 'ETHUSDT', 'DOGEUSDT', 'XRPUSDT', 'TRUMPUSDT'];
                        _i = 0, symbols_1 = symbols;
                        _a.label = 1;
                    case 1:
                        if (!(_i < symbols_1.length)) return [3 /*break*/, 7];
                        symbol = symbols_1[_i];
                        return [4 /*yield*/, storage_1.storage.getMarketData(symbol)];
                    case 2:
                        currentData = _a.sent();
                        if (!currentData) return [3 /*break*/, 4];
                        currentPrice = parseFloat(currentData.price);
                        change = (Math.random() - 0.5) * 0.02;
                        newPrice = currentPrice * (1 + change);
                        priceChange24h = newPrice - currentPrice;
                        priceChangePercent24h = (priceChange24h / currentPrice) * 100;
                        return [4 /*yield*/, storage_1.storage.updateMarketData(symbol, {
                                price: newPrice.toFixed(8),
                                priceChange24h: priceChange24h.toFixed(8),
                                priceChangePercent24h: priceChangePercent24h.toFixed(4),
                                high24h: Math.max(parseFloat(currentData.high24h || '0'), newPrice).toFixed(8),
                                low24h: Math.min(parseFloat(currentData.low24h || '999999'), newPrice).toFixed(8),
                                volume24h: (Math.random() * 1000000).toFixed(8),
                            })];
                    case 3:
                        updatedData = _a.sent();
                        broadcastPriceUpdate(symbol, updatedData);
                        return [3 /*break*/, 6];
                    case 4:
                        basePrices = {
                            'BTCUSDT': 113770.32,
                            'ETHUSDT': 3577.42,
                            'DOGEUSDT': 0.197557,
                            'XRPUSDT': 2.936930,
                            'TRUMPUSDT': 8.626100,
                        };
                        if (!basePrices[symbol]) return [3 /*break*/, 6];
                        price = basePrices[symbol];
                        return [4 /*yield*/, storage_1.storage.updateMarketData(symbol, {
                                price: price.toFixed(8),
                                priceChange24h: '0',
                                priceChangePercent24h: '0',
                                high24h: price.toFixed(8),
                                low24h: price.toFixed(8),
                                volume24h: (Math.random() * 1000000).toFixed(8),
                            })];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_3 = _a.sent();
                        console.error('Error updating prices:', error_3);
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    }
    // Update prices every 5 seconds
    setInterval(updatePrices, 5000);
    // Initial price setup
    setTimeout(updatePrices, 1000);
    return {
        broadcastPriceUpdate: broadcastPriceUpdate,
        broadcastToAll: broadcastToAll,
        broadcastTradingControlUpdate: broadcastTradingControlUpdate,
        broadcastToUser: broadcastToUser
    };
}
function generateClientId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

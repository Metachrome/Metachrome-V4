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
exports.seedOptionsSettings = seedOptionsSettings;
exports.seedDemoData = seedDemoData;
var storage_1 = require("./storage");
var auth_1 = require("./auth");
function seedOptionsSettings() {
    return __awaiter(this, void 0, void 0, function () {
        var optionsSettings, existingSettings, _i, optionsSettings_1, setting, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Seeding options settings...');
                    optionsSettings = [
                        {
                            duration: 30,
                            minAmount: '100',
                            profitPercentage: '10',
                            isActive: true,
                        },
                        {
                            duration: 60,
                            minAmount: '1000',
                            profitPercentage: '15',
                            isActive: true,
                        },
                        {
                            duration: 90,
                            minAmount: '5000',
                            profitPercentage: '20',
                            isActive: true,
                        },
                        {
                            duration: 120,
                            minAmount: '10000',
                            profitPercentage: '25',
                            isActive: true,
                        },
                        {
                            duration: 180,
                            minAmount: '30000',
                            profitPercentage: '30',
                            isActive: true,
                        },
                        {
                            duration: 240,
                            minAmount: '50000',
                            profitPercentage: '50',
                            isActive: true,
                        },
                        {
                            duration: 300,
                            minAmount: '100000',
                            profitPercentage: '75',
                            isActive: true,
                        },
                        {
                            duration: 600,
                            minAmount: '200000',
                            profitPercentage: '100',
                            isActive: true,
                        },
                    ];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 9, , 10]);
                    return [4 /*yield*/, storage_1.storage.getOptionsSettings()];
                case 2:
                    existingSettings = _a.sent();
                    if (!(existingSettings.length === 0)) return [3 /*break*/, 7];
                    _i = 0, optionsSettings_1 = optionsSettings;
                    _a.label = 3;
                case 3:
                    if (!(_i < optionsSettings_1.length)) return [3 /*break*/, 6];
                    setting = optionsSettings_1[_i];
                    return [4 /*yield*/, storage_1.storage.createOptionsSettings(setting)];
                case 4:
                    _a.sent();
                    console.log("Created options setting: ".concat(setting.duration, "s - Min: $").concat(setting.minAmount, " - Profit: ").concat(setting.profitPercentage, "%"));
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 8];
                case 7:
                    console.log('Options settings already exist, skipping seed');
                    _a.label = 8;
                case 8:
                    console.log('Options settings seeded successfully');
                    return [3 /*break*/, 10];
                case 9:
                    error_1 = _a.sent();
                    console.error('Error seeding options settings:', error_1);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
function seedDemoData() {
    return __awaiter(this, void 0, void 0, function () {
        var demoUsers, _i, demoUsers_1, userData, existingUser, hashedPassword, user, isDemoAccount, usdtAmount, btcAmount, ethAmount, users, regularUsers, adminUser, controlTypes, i, user, controlType, existingControl, tradeData, _a, tradeData_1, trade, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('Seeding demo data...');
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 21, , 22]);
                    demoUsers = [
                        {
                            username: 'demo_trader',
                            email: 'demo.trader@metachrome.io',
                            password: 'demo123',
                            role: 'user',
                            firstName: 'Demo',
                            lastName: 'Trader',
                        },
                        {
                            username: 'trader1',
                            email: 'trader1@metachrome.io',
                            password: 'password123',
                            role: 'user',
                            firstName: 'John',
                            lastName: 'Smith',
                        },
                        {
                            username: 'trader2',
                            email: 'trader2@metachrome.io',
                            password: 'password123',
                            role: 'user',
                            firstName: 'Sarah',
                            lastName: 'Johnson',
                        },
                        {
                            username: 'trader3',
                            email: 'trader3@metachrome.io',
                            password: 'password123',
                            role: 'user',
                            firstName: 'Mike',
                            lastName: 'Davis',
                        },
                        {
                            username: 'admin',
                            email: 'admin@metachrome.io',
                            password: 'admin123',
                            role: 'admin',
                            firstName: 'Regular',
                            lastName: 'Admin',
                        },
                        {
                            username: 'superadmin',
                            email: 'superadmin@metachrome.io',
                            password: 'superadmin123',
                            role: 'super_admin',
                            firstName: 'Super',
                            lastName: 'Administrator',
                        },
                        {
                            username: 'demo_admin',
                            email: 'demo.admin@metachrome.io',
                            password: 'admin123',
                            role: 'super_admin',
                            firstName: 'Demo',
                            lastName: 'Admin',
                        }
                    ];
                    _i = 0, demoUsers_1 = demoUsers;
                    _b.label = 2;
                case 2:
                    if (!(_i < demoUsers_1.length)) return [3 /*break*/, 10];
                    userData = demoUsers_1[_i];
                    return [4 /*yield*/, storage_1.storage.getUserByUsername(userData.username)];
                case 3:
                    existingUser = _b.sent();
                    if (!!existingUser) return [3 /*break*/, 9];
                    return [4 /*yield*/, (0, auth_1.hashPassword)(userData.password)];
                case 4:
                    hashedPassword = _b.sent();
                    return [4 /*yield*/, storage_1.storage.createUser(__assign(__assign({}, userData), { password: hashedPassword }))];
                case 5:
                    user = _b.sent();
                    console.log("Created demo user: ".concat(userData.username, " (").concat(userData.role, ")"));
                    if (!(userData.role === 'user')) return [3 /*break*/, 9];
                    isDemoAccount = userData.username === 'demo_trader';
                    usdtAmount = isDemoAccount ? '10000.00' : '0.00';
                    btcAmount = isDemoAccount ? '0.5' : '0.00';
                    ethAmount = isDemoAccount ? '5.0' : '0.00';
                    return [4 /*yield*/, storage_1.storage.createBalance({
                            userId: user.id,
                            symbol: 'USDT',
                            available: usdtAmount,
                            locked: '0.00',
                        })];
                case 6:
                    _b.sent();
                    return [4 /*yield*/, storage_1.storage.createBalance({
                            userId: user.id,
                            symbol: 'BTC',
                            available: btcAmount,
                            locked: '0.00',
                        })];
                case 7:
                    _b.sent();
                    return [4 /*yield*/, storage_1.storage.createBalance({
                            userId: user.id,
                            symbol: 'ETH',
                            available: ethAmount,
                            locked: '0.00',
                        })];
                case 8:
                    _b.sent();
                    console.log("Created balances for ".concat(userData.username, " - USDT: $").concat(usdtAmount, ", BTC: ").concat(btcAmount, ", ETH: ").concat(ethAmount));
                    _b.label = 9;
                case 9:
                    _i++;
                    return [3 /*break*/, 2];
                case 10: return [4 /*yield*/, storage_1.storage.getAllUsers()];
                case 11:
                    users = _b.sent();
                    regularUsers = users.filter(function (u) { return u.role === 'user'; });
                    adminUser = users.find(function (u) { return u.role === 'super_admin'; });
                    if (!(adminUser && regularUsers.length > 0)) return [3 /*break*/, 16];
                    controlTypes = ['normal', 'win', 'lose'];
                    i = 0;
                    _b.label = 12;
                case 12:
                    if (!(i < Math.min(regularUsers.length, 3))) return [3 /*break*/, 16];
                    user = regularUsers[i];
                    controlType = controlTypes[i % controlTypes.length];
                    return [4 /*yield*/, storage_1.storage.getAdminControl(user.id)];
                case 13:
                    existingControl = _b.sent();
                    if (!!existingControl) return [3 /*break*/, 15];
                    return [4 /*yield*/, storage_1.storage.createAdminControl({
                            userId: user.id,
                            adminId: adminUser.id,
                            controlType: controlType,
                            isActive: true,
                            notes: "Demo ".concat(controlType, " control for ").concat(user.username),
                        })];
                case 14:
                    _b.sent();
                    console.log("Created ".concat(controlType, " control for ").concat(user.username));
                    _b.label = 15;
                case 15:
                    i++;
                    return [3 /*break*/, 12];
                case 16:
                    if (!(regularUsers.length > 0)) return [3 /*break*/, 20];
                    tradeData = [
                        {
                            userId: regularUsers[0].id,
                            symbol: 'BTCUSDT',
                            type: 'options',
                            direction: 'up',
                            amount: '100.00',
                            price: '45000.00',
                            entryPrice: '45000.00',
                            exitPrice: '45100.00',
                            profit: '10.00',
                            fee: '1.00',
                            status: 'completed',
                            duration: 60,
                            expiresAt: new Date(Date.now() - 60000),
                            completedAt: new Date(),
                        },
                        {
                            userId: regularUsers[0].id,
                            symbol: 'ETHUSDT',
                            type: 'options',
                            direction: 'down',
                            amount: '200.00',
                            price: '3000.00',
                            entryPrice: '3000.00',
                            exitPrice: '2980.00',
                            profit: '20.00',
                            fee: '2.00',
                            status: 'completed',
                            duration: 30,
                            expiresAt: new Date(Date.now() - 30000),
                            completedAt: new Date(),
                        }
                    ];
                    _a = 0, tradeData_1 = tradeData;
                    _b.label = 17;
                case 17:
                    if (!(_a < tradeData_1.length)) return [3 /*break*/, 20];
                    trade = tradeData_1[_a];
                    return [4 /*yield*/, storage_1.storage.createTrade(trade)];
                case 18:
                    _b.sent();
                    console.log("Created demo trade: ".concat(trade.symbol, " ").concat(trade.direction, " for ").concat(trade.amount));
                    _b.label = 19;
                case 19:
                    _a++;
                    return [3 /*break*/, 17];
                case 20:
                    console.log('Demo data seeded successfully');
                    return [3 /*break*/, 22];
                case 21:
                    error_2 = _b.sent();
                    console.error('Error seeding demo data:', error_2);
                    return [3 /*break*/, 22];
                case 22: return [2 /*return*/];
            }
        });
    });
}
// Run seed if called directly
if (import.meta.url === new URL(import.meta.resolve(process.argv[1])).href) {
    Promise.all([seedOptionsSettings(), seedDemoData()])
        .then(function () { return process.exit(0); })
        .catch(function (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    });
}

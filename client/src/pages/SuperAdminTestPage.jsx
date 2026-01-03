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
import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
export default function SuperAdminTestPage() {
    var _this = this;
    var toast = useToast().toast;
    var _a = useState([]), users = _a[0], setUsers = _a[1];
    var _b = useState(''), selectedUserId = _b[0], setSelectedUserId = _b[1];
    var _c = useState({}), testResults = _c[0], setTestResults = _c[1];
    var _d = useState(false), loading = _d[0], setLoading = _d[1];
    // Test inputs
    var _e = useState('100'), depositAmount = _e[0], setDepositAmount = _e[1];
    var _f = useState('50'), withdrawalAmount = _f[0], setWithdrawalAmount = _f[1];
    var _g = useState('testpassword123'), newPassword = _g[0], setNewPassword = _g[1];
    var _h = useState('0x1234567890abcdef1234567890abcdef12345678'), newWalletAddress = _h[0], setNewWalletAddress = _h[1];
    useEffect(function () {
        fetchUsers();
    }, []);
    var fetchUsers = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, userData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, fetch('/api/admin/users')];
                case 1:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    userData = _a.sent();
                    setUsers(userData);
                    if (userData.length > 0 && !selectedUserId) {
                        setSelectedUserId(userData[0].id);
                    }
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error('Error fetching users:', error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var logResult = function (testName, result, success) {
        var timestamp = new Date().toLocaleTimeString();
        var status = success ? '✅' : '❌';
        var logEntry = "".concat(timestamp, " ").concat(status, " ").concat(result);
        setTestResults(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[testName] = logEntry, _a)));
        });
        toast({
            title: success ? "Test Passed" : "Test Failed",
            description: "".concat(testName, ": ").concat(result),
            variant: success ? "default" : "destructive"
        });
    };
    var testTradingModeControl = function (mode) { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedUserId)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, 9, 10]);
                    setLoading(true);
                    return [4 /*yield*/, fetch('/api/admin/trading-controls', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: selectedUserId, controlType: mode })
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 5];
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    logResult("Trading Mode ".concat(mode.toUpperCase()), result.message, true);
                    return [4 /*yield*/, fetchUsers()];
                case 4:
                    _a.sent(); // Refresh to see changes
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, response.text()];
                case 6:
                    error = _a.sent();
                    logResult("Trading Mode ".concat(mode.toUpperCase()), "Failed: ".concat(error), false);
                    _a.label = 7;
                case 7: return [3 /*break*/, 10];
                case 8:
                    error_2 = _a.sent();
                    logResult("Trading Mode ".concat(mode.toUpperCase()), "Error: ".concat(error_2), false);
                    return [3 /*break*/, 10];
                case 9:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    }); };
    var testDeposit = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedUserId || !depositAmount)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, 9, 10]);
                    setLoading(true);
                    return [4 /*yield*/, fetch('/api/superadmin/deposit', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId: selectedUserId,
                                amount: Number(depositAmount),
                                note: 'Test deposit from SuperAdmin test page'
                            })
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 5];
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    logResult('Deposit', result.message, true);
                    return [4 /*yield*/, fetchUsers()];
                case 4:
                    _a.sent(); // Refresh to see balance change
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, response.text()];
                case 6:
                    error = _a.sent();
                    logResult('Deposit', "Failed: ".concat(error), false);
                    _a.label = 7;
                case 7: return [3 /*break*/, 10];
                case 8:
                    error_3 = _a.sent();
                    logResult('Deposit', "Error: ".concat(error_3), false);
                    return [3 /*break*/, 10];
                case 9:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    }); };
    var testWithdrawal = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedUserId || !withdrawalAmount)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, 9, 10]);
                    setLoading(true);
                    return [4 /*yield*/, fetch('/api/superadmin/withdrawal', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId: selectedUserId,
                                amount: Number(withdrawalAmount),
                                note: 'Test withdrawal from SuperAdmin test page'
                            })
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 5];
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    logResult('Withdrawal', result.message, true);
                    return [4 /*yield*/, fetchUsers()];
                case 4:
                    _a.sent(); // Refresh to see balance change
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, response.text()];
                case 6:
                    error = _a.sent();
                    logResult('Withdrawal', "Failed: ".concat(error), false);
                    _a.label = 7;
                case 7: return [3 /*break*/, 10];
                case 8:
                    error_4 = _a.sent();
                    logResult('Withdrawal', "Error: ".concat(error_4), false);
                    return [3 /*break*/, 10];
                case 9:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    }); };
    var testPasswordChange = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedUserId || !newPassword)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, 8, 9]);
                    setLoading(true);
                    return [4 /*yield*/, fetch('/api/superadmin/change-password', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId: selectedUserId,
                                newPassword: newPassword
                            })
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    logResult('Password Change', result.message, true);
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, response.text()];
                case 5:
                    error = _a.sent();
                    logResult('Password Change', "Failed: ".concat(error), false);
                    _a.label = 6;
                case 6: return [3 /*break*/, 9];
                case 7:
                    error_5 = _a.sent();
                    logResult('Password Change', "Error: ".concat(error_5), false);
                    return [3 /*break*/, 9];
                case 8:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    var testWalletUpdate = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, result, error, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedUserId || !newWalletAddress)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, 9, 10]);
                    setLoading(true);
                    return [4 /*yield*/, fetch('/api/superadmin/update-wallet', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId: selectedUserId,
                                walletAddress: newWalletAddress
                            })
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 5];
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    logResult('Wallet Update', result.message, true);
                    return [4 /*yield*/, fetchUsers()];
                case 4:
                    _a.sent(); // Refresh to see wallet change
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, response.text()];
                case 6:
                    error = _a.sent();
                    logResult('Wallet Update', "Failed: ".concat(error), false);
                    _a.label = 7;
                case 7: return [3 /*break*/, 10];
                case 8:
                    error_6 = _a.sent();
                    logResult('Wallet Update', "Error: ".concat(error_6), false);
                    return [3 /*break*/, 10];
                case 9:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    }); };
    var testUserEdit = function () { return __awaiter(_this, void 0, void 0, function () {
        var selectedUser, response, error, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedUserId)
                        return [2 /*return*/];
                    selectedUser = users.find(function (u) { return u.id === selectedUserId; });
                    if (!selectedUser)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, 8, 9]);
                    setLoading(true);
                    return [4 /*yield*/, fetch("/api/admin/users/".concat(selectedUserId), {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                username: selectedUser.username,
                                email: selectedUser.email,
                                balance: selectedUser.balance,
                                role: selectedUser.role,
                                status: 'active',
                                trading_mode: selectedUser.trading_mode
                            })
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    logResult('User Edit', 'User updated successfully', true);
                    return [4 /*yield*/, fetchUsers()];
                case 3:
                    _a.sent(); // Refresh to see changes
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, response.text()];
                case 5:
                    error = _a.sent();
                    logResult('User Edit', "Failed: ".concat(error), false);
                    _a.label = 6;
                case 6: return [3 /*break*/, 9];
                case 7:
                    error_7 = _a.sent();
                    logResult('User Edit', "Error: ".concat(error_7), false);
                    return [3 /*break*/, 9];
                case 8:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    var runAllTests = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedUserId) {
                        toast({
                            title: "Error",
                            description: "Please select a user first",
                            variant: "destructive"
                        });
                        return [2 /*return*/];
                    }
                    setTestResults({});
                    // Run all tests sequentially
                    return [4 /*yield*/, testTradingModeControl('win')];
                case 1:
                    // Run all tests sequentially
                    _a.sent();
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, testTradingModeControl('lose')];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, testTradingModeControl('normal')];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, testDeposit()];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, testWithdrawal()];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, testPasswordChange()];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 12:
                    _a.sent();
                    return [4 /*yield*/, testWalletUpdate()];
                case 13:
                    _a.sent();
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 14:
                    _a.sent();
                    return [4 /*yield*/, testUserEdit()];
                case 15:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var selectedUser = users.find(function (u) { return u.id === selectedUserId; });
    return (<div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">🧪 SuperAdmin Feature Test Page</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Selection */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">👤 Select Test User</CardTitle>
            </CardHeader>
            <CardContent>
              <select value={selectedUserId} onChange={function (e) { return setSelectedUserId(e.target.value); }} className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600">
                <option value="">Select a user...</option>
                {users.map(function (user) { return (<option key={user.id} value={user.id}>
                    {user.username} - ${user.balance} - {user.trading_mode}
                  </option>); })}
              </select>
              
              {selectedUser && (<div className="mt-4 p-3 bg-gray-700 rounded">
                  <p className="text-white"><strong>Username:</strong> {selectedUser.username}</p>
                  <p className="text-white"><strong>Balance:</strong> ${selectedUser.balance}</p>
                  <p className="text-white"><strong>Trading Mode:</strong> {selectedUser.trading_mode}</p>
                  <p className="text-white"><strong>Status:</strong> {selectedUser.status}</p>
                  <p className="text-white"><strong>Wallet:</strong> {selectedUser.wallet_address || 'Not set'}</p>
                </div>)}
            </CardContent>
          </Card>

          {/* Test Controls */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">🎛️ Test Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm">Deposit Amount</label>
                <Input value={depositAmount} onChange={function (e) { return setDepositAmount(e.target.value); }} className="bg-gray-700 border-gray-600 text-white"/>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Withdrawal Amount</label>
                <Input value={withdrawalAmount} onChange={function (e) { return setWithdrawalAmount(e.target.value); }} className="bg-gray-700 border-gray-600 text-white"/>
              </div>
              <div>
                <label className="text-gray-400 text-sm">New Password</label>
                <Input value={newPassword} onChange={function (e) { return setNewPassword(e.target.value); }} className="bg-gray-700 border-gray-600 text-white"/>
              </div>
              <div>
                <label className="text-gray-400 text-sm">New Wallet Address</label>
                <Input value={newWalletAddress} onChange={function (e) { return setNewWalletAddress(e.target.value); }} className="bg-gray-700 border-gray-600 text-white"/>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Individual Tests */}
        <Card className="bg-gray-800 border-gray-700 mt-6">
          <CardHeader>
            <CardTitle className="text-white">🧪 Individual Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button onClick={function () { return testTradingModeControl('win'); }} disabled={loading} className="bg-green-600 hover:bg-green-700">
                🎯 Test WIN Mode
              </Button>
              <Button onClick={function () { return testTradingModeControl('lose'); }} disabled={loading} className="bg-red-600 hover:bg-red-700">
                🎯 Test LOSE Mode
              </Button>
              <Button onClick={function () { return testTradingModeControl('normal'); }} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                🎯 Test NORMAL Mode
              </Button>
              <Button onClick={testDeposit} disabled={loading} className="bg-green-600 hover:bg-green-700">
                💰 Test Deposit
              </Button>
              <Button onClick={testWithdrawal} disabled={loading} className="bg-red-600 hover:bg-red-700">
                💸 Test Withdrawal
              </Button>
              <Button onClick={testPasswordChange} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                🔑 Test Password
              </Button>
              <Button onClick={testWalletUpdate} disabled={loading} className="bg-orange-600 hover:bg-orange-700">
                👛 Test Wallet
              </Button>
              <Button onClick={testUserEdit} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                ✏️ Test User Edit
              </Button>
            </div>
            
            <div className="mt-6">
              <Button onClick={runAllTests} disabled={loading} className="bg-purple-600 hover:bg-purple-700 w-full">
                🚀 Run All Tests
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card className="bg-gray-800 border-gray-700 mt-6">
          <CardHeader>
            <CardTitle className="text-white">📊 Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {Object.entries(testResults).map(function (_a) {
            var testName = _a[0], result = _a[1];
            return (<div key={testName} className="p-2 bg-gray-700 rounded">
                  <strong className="text-white">{testName}:</strong>
                  <span className="text-gray-300 ml-2">{result}</span>
                </div>);
        })}
              {Object.keys(testResults).length === 0 && (<p className="text-gray-400">No tests run yet. Click individual test buttons or "Run All Tests".</p>)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);
}

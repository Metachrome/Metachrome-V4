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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { useState, useEffect } from 'react';
import { Activity, Filter, Search, Calendar, User, FileText, Download } from 'lucide-react';
export default function ActivityLogsContent() {
    var _this = this;
    var _a = useState([]), logs = _a[0], setLogs = _a[1];
    var _b = useState(null), stats = _b[0], setStats = _b[1];
    var _c = useState(true), loading = _c[0], setLoading = _c[1];
    var _d = useState(null), selectedLog = _d[0], setSelectedLog = _d[1];
    // Filters
    var _e = useState(''), actionType = _e[0], setActionType = _e[1];
    var _f = useState(''), actionCategory = _f[0], setActionCategory = _f[1];
    var _g = useState(''), searchTerm = _g[0], setSearchTerm = _g[1];
    var _h = useState(''), startDate = _h[0], setStartDate = _h[1];
    var _j = useState(''), endDate = _j[0], setEndDate = _j[1];
    // Pagination
    var _k = useState(50), limit = _k[0], setLimit = _k[1];
    var _l = useState(0), offset = _l[0], setOffset = _l[1];
    var _m = useState(0), totalCount = _m[0], setTotalCount = _m[1];
    var actionCategories = ['TRADING', 'BALANCE', 'VERIFICATION', 'TRANSACTIONS', 'USER_MANAGEMENT', 'CHAT', 'REDEEM_CODES', 'SYSTEM'];
    var actionTypes = [
        'TRADING_CONTROL_SET', 'BALANCE_UPDATED', 'DEPOSIT_APPROVED', 'DEPOSIT_REJECTED',
        'WITHDRAWAL_APPROVED', 'WITHDRAWAL_REJECTED', 'USER_DELETED', 'USER_ROLE_CHANGED',
        'VERIFICATION_APPROVED', 'VERIFICATION_REJECTED', 'USER_CREATED', 'USER_UPDATED'
    ];
    useEffect(function () {
        fetchLogs();
        fetchStats();
    }, [actionType, actionCategory, startDate, endDate, limit, offset]);
    var fetchLogs = function () { return __awaiter(_this, void 0, void 0, function () {
        var params, authToken, response, data, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, 4, 5]);
                    setLoading(true);
                    params = new URLSearchParams();
                    if (actionType)
                        params.append('actionType', actionType);
                    if (actionCategory)
                        params.append('actionCategory', actionCategory);
                    if (startDate)
                        params.append('startDate', startDate);
                    if (endDate)
                        params.append('endDate', endDate);
                    params.append('limit', limit.toString());
                    params.append('offset', offset.toString());
                    authToken = localStorage.getItem('authToken');
                    return [4 /*yield*/, fetch("/api/admin/activity-logs?".concat(params), {
                            headers: {
                                'Authorization': authToken ? "Bearer ".concat(authToken) : '',
                                'Content-Type': 'application/json'
                            },
                            credentials: 'include'
                        })];
                case 1:
                    response = _b.sent();
                    if (!response.ok) {
                        console.error('❌ Activity logs fetch failed:', response.status, response.statusText);
                        throw new Error('Failed to fetch logs');
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _b.sent();
                    console.log('📊 Activity logs response:', { logs: (_a = data.logs) === null || _a === void 0 ? void 0 : _a.length, total: data.total });
                    setLogs(data.logs || []);
                    setTotalCount(data.total || data.totalCount || 0);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
                    console.error('Error fetching logs:', error_1);
                    setLogs([]);
                    return [3 /*break*/, 5];
                case 4:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var fetchStats = function () { return __awaiter(_this, void 0, void 0, function () {
        var authToken, response, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    authToken = localStorage.getItem('authToken');
                    return [4 /*yield*/, fetch('/api/admin/activity-logs/stats', {
                            headers: {
                                'Authorization': authToken ? "Bearer ".concat(authToken) : '',
                                'Content-Type': 'application/json'
                            },
                            credentials: 'include'
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok)
                        throw new Error('Failed to fetch stats');
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    setStats(data);
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error fetching stats:', error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var filteredLogs = logs.filter(function (log) {
        var _a, _b, _c;
        if (searchTerm) {
            var search = searchTerm.toLowerCase();
            return (((_a = log.admin_username) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(search)) ||
                ((_b = log.action_description) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(search)) ||
                ((_c = log.target_username) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(search)));
        }
        return true;
    });
    var downloadLogsAsCSV = function () {
        var headers = ['ID', 'Timestamp', 'Admin', 'Category', 'Action Type', 'Description', 'Target User'];
        var rows = filteredLogs.map(function (log) { return [
            log.id,
            new Date(log.created_at).toLocaleString(),
            log.admin_username,
            log.action_category,
            log.action_type,
            log.action_description,
            log.target_username || 'N/A'
        ]; });
        var csv = __spreadArray([headers], rows, true).map(function (row) { return row.join(','); }).join('\n');
        var blob = new Blob([csv], { type: 'text/csv' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = "activity-logs-".concat(new Date().toISOString(), ".csv");
        a.click();
    };
    var downloadLogsAsJSON = function () {
        var json = JSON.stringify(filteredLogs, null, 2);
        var blob = new Blob([json], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = "activity-logs-".concat(new Date().toISOString(), ".json");
        a.click();
    };
    var resetFilters = function () {
        setActionType('');
        setActionCategory('');
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
        setOffset(0);
    };
    return (<div className="space-y-6">
      {/* Header with Download Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-purple-400"/>
          <h2 className="text-2xl font-bold text-white">Admin Activity Logs</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadLogsAsCSV} disabled={filteredLogs.length === 0} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors">
            <Download className="w-4 h-4"/>
            Download CSV
          </button>
          <button onClick={downloadLogsAsJSON} disabled={filteredLogs.length === 0} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors">
            <Download className="w-4 h-4"/>
            Download JSON
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Logs</p>
                <p className="text-2xl font-bold text-white">{stats.totalCount}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-400"/>
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Last 24 Hours</p>
                <p className="text-2xl font-bold text-white">{stats.last24Hours}</p>
              </div>
              <Activity className="w-8 h-8 text-green-400"/>
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Categories</p>
                <p className="text-2xl font-bold text-white">{Object.keys(stats.byCategory).length}</p>
              </div>
              <Filter className="w-8 h-8 text-blue-400"/>
            </div>
          </div>
        </div>)}

      {/* Filters */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-purple-400"/>
          <h3 className="text-xl font-semibold text-white">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Search className="w-4 h-4 inline mr-1"/>
              Search
            </label>
            <input type="text" value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} placeholder="Search description, admin, user..." className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400"/>
          </div>

          {/* Action Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Action Category
            </label>
            <select value={actionCategory} onChange={function (e) { return setActionCategory(e.target.value); }} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
              <option value="">All Categories</option>
              {actionCategories.map(function (cat) { return (<option key={cat} value={cat}>{cat}</option>); })}
            </select>
          </div>

          {/* Action Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Action Type
            </label>
            <select value={actionType} onChange={function (e) { return setActionType(e.target.value); }} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
              <option value="">All Types</option>
              {actionTypes.map(function (type) { return (<option key={type} value={type}>{type}</option>); })}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1"/>
              Start Date
            </label>
            <input type="date" value={startDate} onChange={function (e) { return setStartDate(e.target.value); }} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"/>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1"/>
              End Date
            </label>
            <input type="date" value={endDate} onChange={function (e) { return setEndDate(e.target.value); }} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"/>
          </div>

          {/* Items per page */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Items per page
            </label>
            <select value={limit} onChange={function (e) { return setLimit(Number(e.target.value)); }} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button onClick={resetFilters} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
            Reset Filters
          </button>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (<div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>) : filteredLogs.length === 0 ? (<div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4"/>
              <p className="text-gray-400 text-lg">No activity logs found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
            </div>) : (<table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Admin</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Target User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredLogs.map(function (log) { return (<tr key={log.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-300">#{log.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-purple-400"/>
                        <span className="text-white font-medium">{log.admin_username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={"px-2 py-1 text-xs font-semibold rounded-full ".concat(log.action_category === 'TRADING' ? 'bg-blue-500/20 text-blue-400' :
                    log.action_category === 'BALANCE' ? 'bg-green-500/20 text-green-400' :
                        log.action_category === 'VERIFICATION' ? 'bg-yellow-500/20 text-yellow-400' :
                            log.action_category === 'TRANSACTIONS' ? 'bg-purple-500/20 text-purple-400' :
                                log.action_category === 'USER_MANAGEMENT' ? 'bg-red-500/20 text-red-400' :
                                    'bg-gray-500/20 text-gray-400')}>
                        {log.action_category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">{log.action_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-300 max-w-xs truncate">
                      {log.action_description}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {log.target_username || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={function () { return setSelectedLog(log); }} className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                        View Details
                      </button>
                    </td>
                  </tr>); })}
              </tbody>
            </table>)}
        </div>

        {/* Pagination */}
        {!loading && filteredLogs.length > 0 && (<div className="bg-gray-900/50 px-4 py-3 flex items-center justify-between border-t border-gray-700">
            <div className="text-sm text-gray-400">
              Showing {offset + 1} to {Math.min(offset + limit, totalCount)} of {totalCount} logs
            </div>
            <div className="flex gap-2">
              <button onClick={function () { return setOffset(Math.max(0, offset - limit)); }} disabled={offset === 0} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded transition-colors">
                Previous
              </button>
              <button onClick={function () { return setOffset(offset + limit); }} disabled={offset + limit >= totalCount} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded transition-colors">
                Next
              </button>
            </div>
          </div>)}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Activity Log Details</h3>
                <button onClick={function () { return setSelectedLog(null); }} className="text-gray-400 hover:text-white">
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Log ID</p>
                    <p className="text-white font-medium">#{selectedLog.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Timestamp</p>
                    <p className="text-white font-medium">
                      {new Date(selectedLog.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Admin</p>
                    <p className="text-white font-medium">{selectedLog.admin_username}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Admin Email</p>
                    <p className="text-white font-medium">{selectedLog.admin_email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Category</p>
                    <p className="text-white font-medium">{selectedLog.action_category}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Action Type</p>
                    <p className="text-white font-medium">{selectedLog.action_type}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-400 text-sm">Description</p>
                    <p className="text-white font-medium">{selectedLog.action_description}</p>
                  </div>
                  {selectedLog.target_username && (<>
                      <div>
                        <p className="text-gray-400 text-sm">Target User</p>
                        <p className="text-white font-medium">{selectedLog.target_username}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Target Email</p>
                        <p className="text-white font-medium">{selectedLog.target_email || 'N/A'}</p>
                      </div>
                    </>)}
                  {selectedLog.ip_address && (<div>
                      <p className="text-gray-400 text-sm">IP Address</p>
                      <p className="text-white font-medium">{selectedLog.ip_address}</p>
                    </div>)}
                </div>

                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (<div>
                    <p className="text-gray-400 text-sm mb-2">Metadata</p>
                    <pre className="bg-gray-900 p-3 rounded text-xs text-gray-300 overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>)}
              </div>
            </div>
          </div>
        </div>)}
    </div>);
}

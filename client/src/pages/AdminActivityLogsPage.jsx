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
export default function AdminActivityLogsPage() {
    var _this = this;
    var _a = useState([]), logs = _a[0], setLogs = _a[1];
    var _b = useState(null), stats = _b[0], setStats = _b[1];
    var _c = useState(true), loading = _c[0], setLoading = _c[1];
    var _d = useState(null), selectedLog = _d[0], setSelectedLog = _d[1];
    // Filters
    var _e = useState(''), actionType = _e[0], setActionType = _e[1];
    var _f = useState(''), actionCategory = _f[0], setActionCategory = _f[1];
    var _g = useState(''), adminId = _g[0], setAdminId = _g[1];
    var _h = useState(''), targetUserId = _h[0], setTargetUserId = _h[1];
    var _j = useState(''), startDate = _j[0], setStartDate = _j[1];
    var _k = useState(''), endDate = _k[0], setEndDate = _k[1];
    var _l = useState(''), searchTerm = _l[0], setSearchTerm = _l[1];
    // Pagination
    var _m = useState(50), limit = _m[0], setLimit = _m[1];
    var _o = useState(0), offset = _o[0], setOffset = _o[1];
    var _p = useState(0), totalCount = _p[0], setTotalCount = _p[1];
    var actionCategories = ['TRADING', 'BALANCE', 'VERIFICATION', 'TRANSACTIONS', 'USER_MANAGEMENT', 'CHAT', 'REDEEM_CODES', 'SYSTEM'];
    var actionTypes = [
        'TRADING_CONTROL_SET', 'BALANCE_UPDATED', 'DEPOSIT_APPROVED', 'DEPOSIT_REJECTED',
        'WITHDRAWAL_APPROVED', 'WITHDRAWAL_REJECTED', 'USER_DELETED', 'USER_ROLE_CHANGED',
        'VERIFICATION_APPROVED', 'VERIFICATION_REJECTED', 'USER_CREATED', 'USER_UPDATED'
    ];
    useEffect(function () {
        fetchLogs();
        fetchStats();
    }, [actionType, actionCategory, adminId, targetUserId, startDate, endDate, limit, offset]);
    var fetchLogs = function () { return __awaiter(_this, void 0, void 0, function () {
        var params, authToken, response, data, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, 6, 7]);
                    setLoading(true);
                    params = new URLSearchParams();
                    if (actionType)
                        params.append('actionType', actionType);
                    if (actionCategory)
                        params.append('actionCategory', actionCategory);
                    if (adminId)
                        params.append('adminId', adminId);
                    if (targetUserId)
                        params.append('targetUserId', targetUserId);
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
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _b.sent();
                    console.log('📊 Activity logs fetched:', { logs: (_a = data.logs) === null || _a === void 0 ? void 0 : _a.length, total: data.total });
                    setLogs(data.logs || []);
                    setTotalCount(data.total || 0);
                    return [3 /*break*/, 4];
                case 3:
                    console.error('❌ Activity logs fetch failed:', response.status);
                    _b.label = 4;
                case 4: return [3 /*break*/, 7];
                case 5:
                    error_1 = _b.sent();
                    console.error('Failed to fetch activity logs:', error_1);
                    return [3 /*break*/, 7];
                case 6:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var fetchStats = function () { return __awaiter(_this, void 0, void 0, function () {
        var authToken, response, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
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
                    if (!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    // Map API response to expected format
                    setStats({
                        totalCount: data.total || 0,
                        last24Hours: data.recent24h || 0,
                        byCategory: data.byCategory || {}
                    });
                    _a.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    console.error('Failed to fetch stats:', error_2);
                    // Set default stats on error
                    setStats({
                        totalCount: 0,
                        last24Hours: 0,
                        byCategory: {}
                    });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var resetFilters = function () {
        setActionType('');
        setActionCategory('');
        setAdminId('');
        setTargetUserId('');
        setStartDate('');
        setEndDate('');
        setSearchTerm('');
        setOffset(0);
    };
    var downloadLogsAsCSV = function () {
        // CSV Headers
        var headers = [
            'Timestamp',
            'Admin Username',
            'Admin Email',
            'Action Category',
            'Action Type',
            'Description',
            'Target Username',
            'Target Email',
            'IP Address',
            'User Agent',
            'Metadata'
        ];
        // Convert logs to CSV rows
        var rows = filteredLogs.map(function (log) { return [
            new Date(log.created_at).toLocaleString(),
            log.admin_username,
            log.admin_email || '',
            log.action_category,
            log.action_type,
            log.action_description,
            log.target_username || '',
            log.target_email || '',
            log.ip_address || '',
            log.user_agent || '',
            JSON.stringify(log.metadata)
        ]; });
        // Create CSV content
        var csvContent = __spreadArray([
            headers.join(',')
        ], rows.map(function (row) { return row.map(function (cell) { return "\"".concat(String(cell).replace(/"/g, '""'), "\""); }).join(','); }), true).join('\n');
        // Download file
        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        var url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', "activity-logs-".concat(new Date().toISOString().split('T')[0], ".csv"));
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    var downloadLogsAsJSON = function () {
        // Create JSON content
        var jsonContent = JSON.stringify(filteredLogs, null, 2);
        // Download file
        var blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
        var link = document.createElement('a');
        var url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', "activity-logs-".concat(new Date().toISOString().split('T')[0], ".json"));
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    var getCategoryColor = function (category) {
        var colors = {
            TRADING: 'bg-blue-100 text-blue-800',
            BALANCE: 'bg-green-100 text-green-800',
            VERIFICATION: 'bg-purple-100 text-purple-800',
            TRANSACTIONS: 'bg-yellow-100 text-yellow-800',
            USER_MANAGEMENT: 'bg-red-100 text-red-800',
            CHAT: 'bg-indigo-100 text-indigo-800',
            REDEEM_CODES: 'bg-pink-100 text-pink-800',
            SYSTEM: 'bg-gray-100 text-gray-800',
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };
    var filteredLogs = logs.filter(function (log) {
        var _a;
        if (!searchTerm)
            return true;
        var search = searchTerm.toLowerCase();
        return (log.action_description.toLowerCase().includes(search) ||
            log.admin_username.toLowerCase().includes(search) ||
            ((_a = log.target_username) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(search)) ||
            log.action_type.toLowerCase().includes(search));
    });
    var totalPages = Math.ceil(totalCount / limit);
    var currentPage = Math.floor(offset / limit) + 1;
    return (<div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-purple-400"/>
              <h1 className="text-3xl font-bold text-white">Admin Activity Logs</h1>
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
          <p className="text-gray-400">Complete audit trail of all admin actions - logs cannot be deleted</p>
        </div>

        {/* Stats Cards */}
        {stats && (<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Logs</p>
                  <p className="text-2xl font-bold text-white">{stats.totalCount.toLocaleString()}</p>
                </div>
                <FileText className="w-8 h-8 text-purple-400"/>
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Last 24 Hours</p>
                  <p className="text-2xl font-bold text-white">{stats.last24Hours.toLocaleString()}</p>
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
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-purple-400"/>
            <h2 className="text-xl font-semibold text-white">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Search className="w-4 h-4 inline mr-1"/>
                Search
              </label>
              <input type="text" value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} placeholder="Search description, admin, user..." className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"/>
            </div>

            {/* Action Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Action Category</label>
              <select value={actionCategory} onChange={function (e) { setActionCategory(e.target.value); setOffset(0); }} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">All Categories</option>
                {actionCategories.map(function (cat) { return (<option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>); })}
              </select>
            </div>

            {/* Action Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Action Type</label>
              <select value={actionType} onChange={function (e) { setActionType(e.target.value); setOffset(0); }} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">All Types</option>
                {actionTypes.map(function (type) { return (<option key={type} value={type}>{type.replace(/_/g, ' ')}</option>); })}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1"/>
                Start Date
              </label>
              <input type="date" value={startDate} onChange={function (e) { setStartDate(e.target.value); setOffset(0); }} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"/>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1"/>
                End Date
              </label>
              <input type="date" value={endDate} onChange={function (e) { setEndDate(e.target.value); setOffset(0); }} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"/>
            </div>

            {/* Items per page */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Items per page</label>
              <select value={limit} onChange={function (e) { setLimit(Number(e.target.value)); setOffset(0); }} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
              </select>
            </div>
          </div>

          <button onClick={resetFilters} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
            Reset Filters
          </button>
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Admin</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Target User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredLogs.map(function (log) { return (<tr key={log.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={"px-2 py-1 text-xs font-semibold rounded-full ".concat(getCategoryColor(log.action_category))}>
                          {log.action_category.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {log.action_type.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-purple-400"/>
                          <span>{log.admin_username}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {log.target_username || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300 max-w-md truncate">
                        {log.action_description}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button onClick={function () { return setSelectedLog(log); }} className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors">
                          View
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
                <button onClick={function () { return setOffset(Math.max(0, offset - limit)); }} disabled={offset === 0} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg transition-colors">
                  Previous
                </button>
                <span className="px-4 py-2 bg-gray-800 text-white rounded-lg">
                  Page {currentPage} of {totalPages}
                </span>
                <button onClick={function () { return setOffset(offset + limit); }} disabled={offset + limit >= totalCount} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg transition-colors">
                  Next
                </button>
              </div>
            </div>)}
        </div>

        {/* Detail Modal */}
        {selectedLog && (<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Activity Log Details</h3>
                <button onClick={function () { return setSelectedLog(null); }} className="text-gray-400 hover:text-white transition-colors">
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Log ID</p>
                    <p className="text-white font-mono">#{selectedLog.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Timestamp</p>
                    <p className="text-white">{new Date(selectedLog.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Category</p>
                    <span className={"px-2 py-1 text-xs font-semibold rounded-full ".concat(getCategoryColor(selectedLog.action_category))}>
                      {selectedLog.action_category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Action Type</p>
                    <p className="text-white">{selectedLog.action_type.replace(/_/g, ' ')}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-sm text-gray-400 mb-1">Description</p>
                  <p className="text-white bg-gray-900/50 p-3 rounded-lg">{selectedLog.action_description}</p>
                </div>

                {/* Admin Info */}
                <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
                  <p className="text-sm text-purple-400 mb-2 font-semibold">Admin Information</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-400">Username</p>
                      <p className="text-white">{selectedLog.admin_username}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Email</p>
                      <p className="text-white">{selectedLog.admin_email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Admin ID</p>
                      <p className="text-white font-mono text-sm">{selectedLog.admin_id}</p>
                    </div>
                  </div>
                </div>

                {/* Target User Info */}
                {selectedLog.target_user_id && (<div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
                    <p className="text-sm text-blue-400 mb-2 font-semibold">Target User Information</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-400">Username</p>
                        <p className="text-white">{selectedLog.target_username || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Email</p>
                        <p className="text-white">{selectedLog.target_email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">User ID</p>
                        <p className="text-white font-mono text-sm">{selectedLog.target_user_id}</p>
                      </div>
                    </div>
                  </div>)}

                {/* Metadata */}
                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (<div>
                    <p className="text-sm text-gray-400 mb-2">Additional Metadata</p>
                    <pre className="bg-gray-900/50 p-3 rounded-lg text-xs text-gray-300 overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>)}

                {/* Technical Info */}
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-2 font-semibold">Technical Information</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-400">IP Address</p>
                      <p className="text-white font-mono text-sm">{selectedLog.ip_address || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">User Agent</p>
                      <p className="text-white text-sm break-all">{selectedLog.user_agent || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 px-6 py-4">
                <button onClick={function () { return setSelectedLog(null); }} className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>)}
      </div>
    </div>);
}

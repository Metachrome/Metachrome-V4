import { useState, useEffect } from 'react';
import { Activity, Filter, Search, Calendar, User, FileText, Download } from 'lucide-react';

interface ActivityLog {
  id: number;
  admin_id: string;
  admin_username: string;
  admin_email: string | null;
  action_type: string;
  action_category: string;
  action_description: string;
  target_user_id: string | null;
  target_username: string | null;
  target_email: string | null;
  metadata: Record<string, any>;
  created_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

interface ActivityStats {
  totalCount: number;
  last24Hours: number;
  byCategory: Record<string, number>;
}

export default function ActivityLogsContent() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  
  // Filters
  const [actionType, setActionType] = useState('');
  const [actionCategory, setActionCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Pagination
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const actionCategories = ['TRADING', 'BALANCE', 'VERIFICATION', 'TRANSACTIONS', 'USER_MANAGEMENT', 'CHAT', 'REDEEM_CODES', 'SYSTEM'];
  
  const actionTypes = [
    'TRADING_CONTROL_SET', 'BALANCE_UPDATED', 'DEPOSIT_APPROVED', 'DEPOSIT_REJECTED',
    'WITHDRAWAL_APPROVED', 'WITHDRAWAL_REJECTED', 'USER_DELETED', 'USER_ROLE_CHANGED',
    'VERIFICATION_APPROVED', 'VERIFICATION_REJECTED', 'USER_CREATED', 'USER_UPDATED'
  ];

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [actionType, actionCategory, startDate, endDate, limit, offset]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (actionType) params.append('actionType', actionType);
      if (actionCategory) params.append('actionCategory', actionCategory);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      const authToken = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/activity-logs?${params}`, {
        headers: {
          'Authorization': authToken ? `Bearer ${authToken}` : '',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('❌ Activity logs fetch failed:', response.status, response.statusText);
        throw new Error('Failed to fetch logs');
      }

      const data = await response.json();
      console.log('📊 Activity logs response:', { logs: data.logs?.length, total: data.total });
      setLogs(data.logs || []);
      setTotalCount(data.total || data.totalCount || 0);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/activity-logs/stats', {
        headers: {
          'Authorization': authToken ? `Bearer ${authToken}` : '',
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        log.admin_username?.toLowerCase().includes(search) ||
        log.action_description?.toLowerCase().includes(search) ||
        log.target_username?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const downloadLogsAsCSV = () => {
    const headers = ['ID', 'Timestamp', 'Admin', 'Category', 'Action Type', 'Description', 'Target User'];
    const rows = filteredLogs.map(log => [
      log.id,
      new Date(log.created_at).toLocaleString(),
      log.admin_username,
      log.action_category,
      log.action_type,
      log.action_description,
      log.target_username || 'N/A'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString()}.csv`;
    a.click();
  };

  const downloadLogsAsJSON = () => {
    const json = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString()}.json`;
    a.click();
  };

  const resetFilters = () => {
    setActionType('');
    setActionCategory('');
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setOffset(0);
  };

  return (
    <div className="space-y-6">
      {/* Header with Download Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Admin Activity Logs</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadLogsAsCSV}
            disabled={filteredLogs.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
          <button
            onClick={downloadLogsAsJSON}
            disabled={filteredLogs.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Download JSON
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Logs</p>
                <p className="text-2xl font-bold text-white">{stats.totalCount}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Last 24 Hours</p>
                <p className="text-2xl font-bold text-white">{stats.last24Hours}</p>
              </div>
              <Activity className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Categories</p>
                <p className="text-2xl font-bold text-white">{Object.keys(stats.byCategory).length}</p>
              </div>
              <Filter className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search description, admin, user..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400"
            />
          </div>

          {/* Action Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Action Category
            </label>
            <select
              value={actionCategory}
              onChange={(e) => setActionCategory(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            >
              <option value="">All Categories</option>
              {actionCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Action Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Action Type
            </label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            >
              <option value="">All Types</option>
              {actionTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            />
          </div>

          {/* Items per page */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Items per page
            </label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
            >
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No activity logs found</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <table className="w-full">
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
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-300">#{log.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-purple-400" />
                        <span className="text-white font-medium">{log.admin_username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        log.action_category === 'TRADING' ? 'bg-blue-500/20 text-blue-400' :
                        log.action_category === 'BALANCE' ? 'bg-green-500/20 text-green-400' :
                        log.action_category === 'VERIFICATION' ? 'bg-yellow-500/20 text-yellow-400' :
                        log.action_category === 'TRANSACTIONS' ? 'bg-purple-500/20 text-purple-400' :
                        log.action_category === 'USER_MANAGEMENT' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
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
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && filteredLogs.length > 0 && (
          <div className="bg-gray-900/50 px-4 py-3 flex items-center justify-between border-t border-gray-700">
            <div className="text-sm text-gray-400">
              Showing {offset + 1} to {Math.min(offset + limit, totalCount)} of {totalCount} logs
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= totalCount}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Activity Log Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-white"
                >
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
                  {selectedLog.target_username && (
                    <>
                      <div>
                        <p className="text-gray-400 text-sm">Target User</p>
                        <p className="text-white font-medium">{selectedLog.target_username}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Target Email</p>
                        <p className="text-white font-medium">{selectedLog.target_email || 'N/A'}</p>
                      </div>
                    </>
                  )}
                  {selectedLog.ip_address && (
                    <div>
                      <p className="text-gray-400 text-sm">IP Address</p>
                      <p className="text-white font-medium">{selectedLog.ip_address}</p>
                    </div>
                  )}
                </div>

                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Metadata</p>
                    <pre className="bg-gray-900 p-3 rounded text-xs text-gray-300 overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


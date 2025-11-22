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

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  
  // Filters
  const [actionType, setActionType] = useState('');
  const [actionCategory, setActionCategory] = useState('');
  const [adminId, setAdminId] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
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
  }, [actionType, actionCategory, adminId, targetUserId, startDate, endDate, limit, offset]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (actionType) params.append('actionType', actionType);
      if (actionCategory) params.append('actionCategory', actionCategory);
      if (adminId) params.append('adminId', adminId);
      if (targetUserId) params.append('targetUserId', targetUserId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      const response = await fetch(`/api/admin/activity-logs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs);
        setTotalCount(data.total);
      }
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/activity-logs/stats');
      if (response.ok) {
        const data = await response.json();
        // Map API response to expected format
        setStats({
          totalCount: data.total || 0,
          last24Hours: data.recent24h || 0,
          byCategory: data.byCategory || {}
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Set default stats on error
      setStats({
        totalCount: 0,
        last24Hours: 0,
        byCategory: {}
      });
    }
  };

  const resetFilters = () => {
    setActionType('');
    setActionCategory('');
    setAdminId('');
    setTargetUserId('');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setOffset(0);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
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

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      log.action_description.toLowerCase().includes(search) ||
      log.admin_username.toLowerCase().includes(search) ||
      log.target_username?.toLowerCase().includes(search) ||
      log.action_type.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(totalCount / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Admin Activity Logs</h1>
          </div>
          <p className="text-gray-400">Complete audit trail of all admin actions - logs cannot be deleted</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Logs</p>
                  <p className="text-2xl font-bold text-white">{stats.totalCount.toLocaleString()}</p>
                </div>
                <FileText className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Last 24 Hours</p>
                  <p className="text-2xl font-bold text-white">{stats.last24Hours.toLocaleString()}</p>
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
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Action Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Action Category</label>
              <select
                value={actionCategory}
                onChange={(e) => { setActionCategory(e.target.value); setOffset(0); }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Categories</option>
                {actionCategories.map(cat => (
                  <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            {/* Action Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Action Type</label>
              <select
                value={actionType}
                onChange={(e) => { setActionType(e.target.value); setOffset(0); }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Types</option>
                {actionTypes.map(type => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
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
                onChange={(e) => { setStartDate(e.target.value); setOffset(0); }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                onChange={(e) => { setEndDate(e.target.value); setOffset(0); }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Items per page */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Items per page</label>
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setOffset(0); }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
              </select>
            </div>
          </div>

          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Reset Filters
          </button>
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
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(log.action_category)}`}>
                          {log.action_category.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {log.action_type.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-purple-400" />
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
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                        >
                          View
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
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-gray-800 text-white rounded-lg">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setOffset(offset + limit)}
                  disabled={offset + limit >= totalCount}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Activity Log Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
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
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(selectedLog.action_category)}`}>
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
                {selectedLog.target_user_id && (
                  <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
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
                  </div>
                )}

                {/* Metadata */}
                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Additional Metadata</p>
                    <pre className="bg-gray-900/50 p-3 rounded-lg text-xs text-gray-300 overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}

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
                <button
                  onClick={() => setSelectedLog(null)}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


import { useState, useEffect } from 'react';
import { expiryAlertsAPI, batchesAPI, supplierReturnRequestsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  AlertTriangle, 
  Calendar, 
  Package, 
  Filter, 
  Search, 
  RefreshCw,
  Check,
  X,
  RotateCcw,
  Save,
  Eye,
  TrendingDown,
  Clock,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { parseUTCDate } from '../../utils/dateUtils';

const ExpiryAlertsManagement = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [alertTypeFilter, setAlertTypeFilter] = useState('all'); // 'all', 'expired', 'near-expiry'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'resolved', 'unresolved'
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc', 'date-asc', 'days-asc', 'days-desc', 'quantity-desc'
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReturnRequestModal, setShowReturnRequestModal] = useState(false);
  const [batchInfo, setBatchInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    filterAndSortAlerts();
  }, [alerts, searchTerm, alertTypeFilter, statusFilter, sortBy]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await expiryAlertsAPI.getAll(false); // Get all alerts, not just unresolved
      setAlerts(response.data || []);
    } catch (error) {
      toast.error('Failed to load expiry alerts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortAlerts = () => {
    let filtered = [...alerts];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply alert type filter
    if (alertTypeFilter === 'expired') {
      filtered = filtered.filter(alert => alert.alertType === 'Expired');
    } else if (alertTypeFilter === 'near-expiry') {
      filtered = filtered.filter(alert => alert.alertType === 'Near Expiry');
    }

    // Apply status filter
    if (statusFilter === 'resolved') {
      filtered = filtered.filter(alert => alert.isResolved);
    } else if (statusFilter === 'unresolved') {
      filtered = filtered.filter(alert => !alert.isResolved);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.alertDate) - new Date(a.alertDate);
        case 'date-asc':
          return new Date(a.alertDate) - new Date(b.alertDate);
        case 'days-asc':
          return a.daysUntilExpiry - b.daysUntilExpiry;
        case 'days-desc':
          return b.daysUntilExpiry - a.daysUntilExpiry;
        case 'quantity-desc':
          return b.quantity - a.quantity;
        default:
          return 0;
      }
    });

    setFilteredAlerts(filtered);
  };

  const handleResolveAlert = async (alertId, resolved, alertType) => {
    // If resolving an expired alert, show confirmation since it will delete the entire medicine
    if (!resolved && alertType === 'Expired') {
      const confirmed = window.confirm(
        'WARNING: Resolving this expired alert will DELETE the entire medicine, all its batches, and all related alerts permanently. This action cannot be undone. Do you want to continue?'
      );
      if (!confirmed) {
        return;
      }
    }

    // If resolving a near expiry alert, show confirmation about the 50% discount
    if (!resolved && alertType === 'Near Expiry') {
      const confirmed = window.confirm(
        'Resolving this alert will apply a 50% discount sale on this product. The original price will be saved and can be restored later. Do you want to continue?'
      );
      if (!confirmed) {
        return;
      }
    }

    // If unresolving a near expiry alert, show confirmation about removing the discount
    if (resolved && alertType === 'Near Expiry') {
      const confirmed = window.confirm(
        'Unresolving this alert will remove the 50% discount and restore the original price. Do you want to continue?'
      );
      if (!confirmed) {
        return;
      }
    }

    try {
      setSubmitting(true);
      const response = await expiryAlertsAPI.resolve(alertId, { isResolved: !resolved });
      const message = response.data?.message || (resolved ? 'Alert unresolved' : 'Alert resolved successfully');
      toast.success(message);
      fetchAlerts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update alert');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateReturnRequest = async (alert) => {
    try {
      // Fetch batch information to get supplier details
      const batchesResponse = await batchesAPI.getAll(alert.medicineId);
      const batches = batchesResponse.data || [];
      const batch = batches.find(b => b.batchNumber === alert.batchNumber);
      
      if (!batch || !batch.supplierId) {
        toast.error('Cannot create return request: Batch or supplier information not found');
        return;
      }

      setSelectedAlert(alert);
      setBatchInfo(batch);
      setShowReturnRequestModal(true);
    } catch (error) {
      toast.error('Failed to fetch batch information');
      console.error(error);
    }
  };

  const handleCheckAllAlerts = async () => {
    try {
      setSubmitting(true);
      const response = await expiryAlertsAPI.checkAll();
      toast.success(response.data?.message || 'Expiry check completed successfully');
      fetchAlerts();
    } catch (error) {
      toast.error('Failed to check expiry alerts');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetails = (alert) => {
    setSelectedAlert(alert);
    setShowDetailsModal(true);
  };

  // Calculate statistics
  const stats = {
    total: alerts.length,
    expired: alerts.filter(a => a.alertType === 'Expired').length,
    nearExpiry: alerts.filter(a => a.alertType === 'Near Expiry').length,
    resolved: alerts.filter(a => a.isResolved).length,
    unresolved: alerts.filter(a => !a.isResolved).length,
    totalQuantity: alerts.reduce((sum, a) => sum + a.quantity, 0),
    expiredQuantity: alerts.filter(a => a.alertType === 'Expired').reduce((sum, a) => sum + a.quantity, 0),
    nearExpiryQuantity: alerts.filter(a => a.alertType === 'Near Expiry').reduce((sum, a) => sum + a.quantity, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <span>Expiry Alerts Management</span>
          </h1>
          <p className="text-gray-600 mt-1">Monitor and manage medicine expiry alerts</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleCheckAllAlerts}
            disabled={submitting}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-5 w-5 ${submitting ? 'animate-spin' : ''}`} />
            <span>Check All Alerts</span>
          </button>
          <button
            onClick={fetchAlerts}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Alerts</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <AlertTriangle className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.expired}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.expiredQuantity} units</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <X className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Near Expiry</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{stats.nearExpiry}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.nearExpiryQuantity} units</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unresolved</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.unresolved}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.resolved} resolved</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <TrendingDown className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by medicine or batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Alert Type Filter */}
          <div>
            <select
              value={alertTypeFilter}
              onChange={(e) => setAlertTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="expired">Expired</option>
              <option value="near-expiry">Near Expiry</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="unresolved">Unresolved</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="days-asc">Days Until Expiry (Asc)</option>
              <option value="days-desc">Days Until Expiry (Desc)</option>
              <option value="quantity-desc">Quantity (High to Low)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alert Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Until Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alert Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                    No alerts found
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{alert.medicineName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{alert.batchNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          alert.alertType === 'Expired'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {alert.alertType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(alert.expiryDate), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm font-medium ${
                          alert.daysUntilExpiry < 0
                            ? 'text-red-600'
                            : alert.daysUntilExpiry <= 7
                            ? 'text-orange-600'
                            : 'text-gray-900'
                        }`}
                      >
                        {alert.daysUntilExpiry < 0
                          ? `Expired ${Math.abs(alert.daysUntilExpiry)} days ago`
                          : `${alert.daysUntilExpiry} days`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{alert.quantity} units</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          alert.isResolved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {alert.isResolved ? 'Resolved' : 'Unresolved'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {format(parseUTCDate(alert.alertDate), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(alert)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        {alert.alertType === 'Near Expiry' && !alert.isResolved && (
                          <button
                            onClick={() => handleCreateReturnRequest(alert)}
                            className="text-green-600 hover:text-green-900"
                            title="Create Return Request"
                          >
                            <RotateCcw className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleResolveAlert(alert.id, alert.isResolved, alert.alertType)}
                          disabled={submitting}
                          className={`${
                            alert.isResolved
                              ? 'text-gray-600 hover:text-gray-900'
                              : alert.alertType === 'Expired'
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-purple-600 hover:text-purple-900'
                          }`}
                          title={alert.isResolved ? 'Unresolve' : 'Resolve'}
                        >
                          {alert.isResolved ? (
                            <X className="h-5 w-5" />
                          ) : (
                            <Check className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedAlert && (
        <AlertDetailsModal
          alert={selectedAlert}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedAlert(null);
          }}
          onResolve={(resolved) => handleResolveAlert(selectedAlert.id, resolved, selectedAlert.alertType)}
          onCreateReturnRequest={() => handleCreateReturnRequest(selectedAlert)}
          isResolved={selectedAlert.isResolved}
          submitting={submitting}
        />
      )}

      {/* Create Return Request Modal */}
      {showReturnRequestModal && selectedAlert && batchInfo && (
        <CreateReturnRequestModal
          alert={selectedAlert}
          batch={batchInfo}
          onClose={() => {
            setShowReturnRequestModal(false);
            setSelectedAlert(null);
            setBatchInfo(null);
          }}
          onSuccess={() => {
            setShowReturnRequestModal(false);
            setSelectedAlert(null);
            setBatchInfo(null);
            fetchAlerts();
          }}
        />
      )}
    </div>
  );
};

// Alert Details Modal Component
const AlertDetailsModal = ({ alert, onClose, onResolve, onCreateReturnRequest, isResolved, submitting }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Alert Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
              <p className="text-sm text-gray-900">{alert.medicineName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
              <p className="text-sm text-gray-900">{alert.batchNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alert Type</label>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  alert.alertType === 'Expired'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-orange-100 text-orange-800'
                }`}
              >
                {alert.alertType}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  isResolved
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {isResolved ? 'Resolved' : 'Unresolved'}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <p className="text-sm text-gray-900">
                {format(new Date(alert.expiryDate), 'MMMM dd, yyyy')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Days Until Expiry</label>
              <p
                className={`text-sm font-medium ${
                  alert.daysUntilExpiry < 0
                    ? 'text-red-600'
                    : alert.daysUntilExpiry <= 7
                    ? 'text-orange-600'
                    : 'text-gray-900'
                }`}
              >
                {alert.daysUntilExpiry < 0
                  ? `Expired ${Math.abs(alert.daysUntilExpiry)} days ago`
                  : `${alert.daysUntilExpiry} days`}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <p className="text-sm text-gray-900">{alert.quantity} units</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alert Date</label>
              <p className="text-sm text-gray-900">
                {format(parseUTCDate(alert.alertDate), 'MMMM dd, yyyy HH:mm')}
              </p>
            </div>
          </div>

          {alert.alertType === 'Expired' && !isResolved && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-medium mb-2">⚠️ Warning</p>
              <p className="text-xs text-red-700">
                Resolving this expired alert will DELETE the entire medicine, all its batches, and all related alerts permanently. This action cannot be undone.
              </p>
            </div>
          )}

          {alert.alertType === 'Near Expiry' && !isResolved && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800 font-medium mb-2">ℹ️ Information</p>
              <p className="text-xs text-orange-700">
                Resolving this alert will apply a 50% discount sale on this product. The original price will be saved and can be restored later.
              </p>
            </div>
          )}

          {alert.alertType === 'Near Expiry' && isResolved && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 font-medium mb-2">✓ Resolved</p>
              <p className="text-xs text-green-700">
                A 50% discount has been applied to this product. You can unresolve to restore the original price.
              </p>
            </div>
          )}
        </div>

        <div className="flex space-x-3 p-6 border-t border-gray-200">
          {alert.alertType === 'Near Expiry' && !isResolved && (
            <button
              onClick={onCreateReturnRequest}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Create Return Request</span>
            </button>
          )}
          <button
            onClick={() => onResolve(isResolved)}
            disabled={submitting}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isResolved
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : alert.alertType === 'Expired'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {isResolved ? (
              <>
                <X className="h-4 w-4" />
                <span>Unresolve</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Resolve</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Create Return Request Modal Component
const CreateReturnRequestModal = ({ alert, batch, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    quantity: alert.quantity || batch.quantity || '',
    reason: 'Near Expiry',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (parseInt(formData.quantity) > batch.quantity) {
      toast.error(`Quantity cannot exceed available quantity (${batch.quantity})`);
      return;
    }

    try {
      setSubmitting(true);
      await supplierReturnRequestsAPI.create({
        batchId: batch.id,
        medicineId: batch.medicineId,
        supplierId: batch.supplierId,
        quantity: parseInt(formData.quantity),
        reason: formData.reason,
        notes: formData.notes || null
      });
      
      toast.success('Return request created successfully');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create return request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Create Return Request</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medicine
            </label>
            <input
              type="text"
              value={alert.medicineName}
              disabled
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch Number
            </label>
            <input
              type="text"
              value={alert.batchNumber}
              disabled
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier
            </label>
            <input
              type="text"
              value={batch.supplierName || 'N/A'}
              disabled
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Available Quantity
            </label>
            <input
              type="text"
              value={batch.quantity}
              disabled
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity to Return <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max={batch.quantity}
              required
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Near Expiry"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              <span>{submitting ? 'Creating...' : 'Create Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpiryAlertsManagement;


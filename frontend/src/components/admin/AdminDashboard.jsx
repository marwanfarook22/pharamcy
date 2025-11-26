import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ordersAPI, medicinesAPI, expiryAlertsAPI, batchesAPI, usersAPI, supplierReturnRequestsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  LayoutDashboard, 
  Package, 
  AlertTriangle, 
  ShoppingBag, 
  TrendingUp,
  Calendar,
  DollarSign,
  X,
  Save,
  Mail,
  Tag
} from 'lucide-react';
import { format } from 'date-fns';
import { parseUTCDate } from '../../utils/dateUtils';
import UserManagement from './UserManagement';
import MedicineManagement from './MedicineManagement';
import SupplierManagement from './SupplierManagement';
import CategoryManagement from './CategoryManagement';
import BrandManagement from './BrandManagement';
import BannerManagement from './BannerManagement';
import OutOfStockNotifications from './OutOfStockNotifications';
import BestSellingProducts from './BestSellingProducts';
import SupplierReturnRequestsManagement from './SupplierReturnRequestsManagement';
import RefundRequestsManagement from './RefundRequestsManagement';
import OrderManagement from './OrderManagement';
import MessageManagement from './MessageManagement';
import CouponManagement from './CouponManagement';
import ExpiryAlertsManagement from './ExpiryAlertsManagement';

const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get('section') || 'overview';
  const [orderStatusFilter, setOrderStatusFilter] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalMedicines: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    expiredAlerts: 0,
    expiringSoon: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [bestCustomers, setBestCustomers] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReturnRequestModal, setShowReturnRequestModal] = useState(false);
  const [selectedAlertForReturn, setSelectedAlertForReturn] = useState(null);
  const [batchInfo, setBatchInfo] = useState(null);
  const [incrementMedicineId, setIncrementMedicineId] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const ordersResponse = await ordersAPI.getAll();
      const orders = ordersResponse.data;
      
      // Fetch medicines
      const medicinesResponse = await medicinesAPI.getAll();
      const medicines = medicinesResponse.data;
      
      // Fetch expiry alerts
      const alertsResponse = await expiryAlertsAPI.getAll(true);
      const alerts = alertsResponse.data;
      
      // Calculate stats
      const totalRevenue = orders
        .filter(o => o.status === 'Paid' || o.status === 'Completed')
        .reduce((sum, o) => sum + o.totalAmount, 0);
      
      const pendingOrders = orders.filter(o => o.status === 'Pending').length;
      
      const expiredAlerts = alerts.filter(a => a.alertType === 'Expired').length;
      const expiringSoon = alerts.filter(a => a.alertType === 'Near Expiry').length;
      
      setStats({
        totalOrders: orders.length,
        totalMedicines: medicines.length,
        totalRevenue,
        pendingOrders,
        expiredAlerts,
        expiringSoon,
      });
      
      // Set recent orders (last 5)
      setRecentOrders(orders.slice(0, 5));
      
      // Store all orders for best-selling products analysis
      setAllOrders(orders);
      
      // Set expiry alerts
      setExpiryAlerts(alerts.slice(0, 10));
      
      // Fetch best customers
      const bestCustomersResponse = await usersAPI.getBestCustomers(10);
      setBestCustomers(bestCustomersResponse.data);
      
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
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
      const response = await expiryAlertsAPI.resolve(alertId, { isResolved: !resolved });
      const message = response.data?.message || (resolved ? 'Alert unresolved' : 'Alert resolved successfully');
      toast.success(message);
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update alert');
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

      setSelectedAlertForReturn(alert);
      setBatchInfo(batch);
      setShowReturnRequestModal(true);
    } catch (error) {
      toast.error('Failed to fetch batch information');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'indigo',
      bgColor: 'bg-primary-100',
      textColor: 'text-primary-600',
    },
    {
      title: 'Total Medicines',
      value: stats.totalMedicines,
      icon: Package,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: TrendingUp,
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Expired Alerts',
      value: stats.expiredAlerts,
      icon: AlertTriangle,
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
    },
    {
      title: 'Expiring Soon',
      value: stats.expiringSoon,
      icon: Calendar,
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <LayoutDashboard className="h-8 w-8" />
          <span>Admin Dashboard</span>
        </h1>
        <p className="text-gray-600 mt-1">Overview of your pharmacy operations</p>
      </div>

      {/* Content */}
      {activeSection === 'medicines' ? (
        <MedicineManagement 
          initialIncrementMedicineId={incrementMedicineId}
          onIncrementComplete={() => setIncrementMedicineId(null)}
        />
      ) : activeSection === 'suppliers' ? (
        <SupplierManagement />
      ) : activeSection === 'categories' ? (
        <CategoryManagement />
      ) : activeSection === 'brands' ? (
        <BrandManagement />
      ) : activeSection === 'banners' ? (
        <BannerManagement />
      ) : activeSection === 'notifications' ? (
        <OutOfStockNotifications 
          onAddStock={(medicineId) => {
            setIncrementMedicineId(medicineId);
            setSearchParams({ section: 'medicines' });
          }}
        />
      ) : activeSection === 'users' ? (
        <UserManagement />
      ) : activeSection === 'return-requests' ? (
        <SupplierReturnRequestsManagement />
      ) : activeSection === 'refund-requests' ? (
        <RefundRequestsManagement />
      ) : activeSection === 'orders' ? (
        <OrderManagement initialStatus={orderStatusFilter} />
      ) : activeSection === 'messages' ? (
        <MessageManagement />
      ) : activeSection === 'coupons' ? (
        <CouponManagement />
      ) : activeSection === 'expiry-alerts' ? (
        <ExpiryAlertsManagement />
      ) : (
        <>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const isPendingOrders = stat.title === 'Pending Orders';
          return (
            <div
              key={index}
              onClick={isPendingOrders ? () => {
                setSearchParams({ section: 'orders' });
                setOrderStatusFilter('Pending');
              } : undefined}
              className={`bg-white rounded-lg shadow-md p-6 transition-all ${
                isPendingOrders 
                  ? 'hover:shadow-lg cursor-pointer hover:scale-105' 
                  : 'hover:shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.textColor} mt-2`}>
                    {stat.value}
                  </p>
                  {isPendingOrders && stat.value > 0 && (
                    <p className="text-xs text-gray-500 mt-1">Click to view pending orders</p>
                  )}
                </div>
                <div className={`${stat.bgColor} p-3 rounded-full`}>
                  <Icon className={`h-8 w-8 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Order #{order.id}</p>
                      <p className="text-sm text-gray-600">{order.userName}</p>
                      <p className="text-xs text-gray-500">
                        {format(parseUTCDate(order.orderDate), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'Paid' || order.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expiry Alerts */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Expiry Alerts</h2>
          {expiryAlerts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No alerts</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {expiryAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${
                    alert.alertType === 'Expired'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-orange-50 border-orange-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{alert.batchNumber}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {alert.medicineName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Expires: {format(new Date(alert.expiryDate), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Days until expiry: {alert.daysUntilExpiry}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Quantity: {alert.quantity} units
                      </p>
                      {alert.alertType === 'Expired' && (
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 text-xs font-medium text-red-800 bg-red-200 rounded">
                            EXPIRED
                          </span>
                          {!alert.isResolved && (
                            <p className="text-xs text-red-600 mt-1 italic">
                              Resolving will DELETE the entire medicine, all batches, and alerts permanently
                            </p>
                          )}
                        </div>
                      )}
                      {alert.alertType === 'Near Expiry' && (
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 text-xs font-medium text-orange-800 bg-orange-200 rounded">
                            NEAR EXPIRY
                          </span>
                          {!alert.isResolved && (
                            <p className="text-xs text-orange-600 mt-1 italic">
                              Resolve to apply 50% discount sale on this product
                            </p>
                          )}
                          {alert.isResolved && (
                            <p className="text-xs text-green-600 mt-1 italic">
                              50% discount has been applied
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {alert.alertType === 'Near Expiry' && (
                        <>
                          {!alert.isResolved && (
                            <button
                              onClick={() => handleResolveAlert(alert.id, alert.isResolved, alert.alertType)}
                              className="px-3 py-1 text-xs font-medium rounded bg-purple-600 text-white hover:bg-purple-700"
                              title="Apply 50% discount sale"
                            >
                              Resolve (50% Sale)
                            </button>
                          )}
                          {alert.isResolved && (
                            <button
                              onClick={() => handleResolveAlert(alert.id, alert.isResolved, alert.alertType)}
                              className="px-3 py-1 text-xs font-medium rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                            >
                              Unresolve
                            </button>
                          )}
                          {!alert.isResolved && (
                            <button
                              onClick={() => handleCreateReturnRequest(alert)}
                              className="px-3 py-1 text-xs font-medium rounded bg-green-600 text-white hover:bg-green-700"
                            >
                              Create Return Request
                            </button>
                          )}
                        </>
                      )}
                      {alert.alertType === 'Expired' && (
                        <button
                          onClick={() => handleResolveAlert(alert.id, alert.isResolved, alert.alertType)}
                          className={`px-3 py-1 text-xs font-medium rounded ${
                            alert.isResolved
                              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {alert.isResolved ? 'Unresolve' : 'Resolve'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Best Customers */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Best Customers</h2>
        {bestCustomers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No customer data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchases
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bestCustomers.map((customer, index) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.fullName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {customer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {customer.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        {customer.purchaseCount} orders
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ${customer.totalSpent.toFixed(2)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Best Selling Products */}
      <div className="mt-6">
        <BestSellingProducts orders={allOrders} />
      </div>
        </>
      )}

      {/* Create Return Request Modal */}
      {showReturnRequestModal && selectedAlertForReturn && batchInfo && (
        <CreateReturnRequestModal
          alert={selectedAlertForReturn}
          batch={batchInfo}
          onClose={() => {
            setShowReturnRequestModal(false);
            setSelectedAlertForReturn(null);
            setBatchInfo(null);
          }}
          onSuccess={() => {
            setShowReturnRequestModal(false);
            setSelectedAlertForReturn(null);
            setBatchInfo(null);
            fetchDashboardData();
          }}
        />
      )}
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
        medicineId: batch.medicineId, // Use medicineId from batch
        supplierId: batch.supplierId, // Use supplierId from batch
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

export default AdminDashboard;


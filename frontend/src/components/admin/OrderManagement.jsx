import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  ShoppingBag, 
  Search, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  DollarSign,
  Package
} from 'lucide-react';
import { format } from 'date-fns';
import { parseUTCDate } from '../../utils/dateUtils';

const OrderManagement = ({ initialStatus = null }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus || 'all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  // Update status filter when initialStatus prop changes
  useEffect(() => {
    if (initialStatus) {
      setStatusFilter(initialStatus);
    }
  }, [initialStatus]);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const status = statusFilter !== 'all' ? statusFilter : null;
      const response = await ordersAPI.getAll(status);
      setOrders(response.data || []);
    } catch (error) {
      toast.error('Failed to load orders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toString().includes(term) ||
        order.userName?.toLowerCase().includes(term) ||
        order.items?.some(item => 
          item.medicineName?.toLowerCase().includes(term)
        )
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.orderDate);
      const dateB = new Date(b.orderDate);
      return dateB - dateA;
    });

    setFilteredOrders(filtered);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (!window.confirm(`Are you sure you want to change this order status to "${newStatus}"?`)) {
      return;
    }

    try {
      await ordersAPI.updateStatus(orderId, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
      if (showDetailsModal && selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Paid':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-4 w-4" />;
      case 'Paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'Completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'Cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const statusOptions = ['Pending', 'Paid', 'Completed', 'Cancelled'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6" />
            <span>Order Management</span>
          </h2>
          <p className="text-gray-600 mt-1">Manage and track all orders</p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by order ID, customer name, or medicine..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No orders found</p>
            <p className="text-gray-400 text-sm mt-2">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Orders will appear here once customers place them'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  const isExpanded = expandedOrders.has(order.id);
                  return (
                    <React.Fragment key={order.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{order.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">
                              {order.userName || 'Unknown'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-2" />
                            {format(parseUTCDate(order.orderDate), 'MMM dd, yyyy HH:mm')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm font-semibold text-gray-900">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {order.totalAmount.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}
                          >
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{order.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => toggleOrderExpansion(order.id)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Toggle details"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </button>
                            <button
                              onClick={() => viewOrderDetails(order)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="View details"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 bg-gray-50">
                            <div className="space-y-4">
                              {/* Order Items */}
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Order Items:</h4>
                                <div className="space-y-2">
                                  {order.items?.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{item.medicineName}</p>
                                        <p className="text-xs text-gray-500">Batch: {item.batchNumber}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                        <p className="text-sm font-medium text-gray-900">
                                          ${item.subTotal.toFixed(2)}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Payment Info */}
                              {order.payments && order.payments.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Payment Information:</h4>
                                  <div className="space-y-2">
                                    {order.payments.map((payment, index) => (
                                      <div key={index} className="bg-white p-3 rounded border">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <p className="text-sm text-gray-600">Method: {payment.method}</p>
                                            <p className="text-xs text-gray-500">
                                              {format(parseUTCDate(payment.paymentDate), 'MMM dd, yyyy HH:mm')}
                                            </p>
                                          </div>
                                          <p className="text-sm font-semibold text-gray-900">
                                            ${payment.amount.toFixed(2)}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Status Update */}
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Update Status:</h4>
                                <div className="flex flex-wrap gap-2">
                                  {statusOptions
                                    .filter(status => status !== order.status)
                                    .map((status) => (
                                      <button
                                        key={status}
                                        onClick={() => handleStatusUpdate(order.id, status)}
                                        className={`px-3 py-1 text-xs font-medium rounded border transition-colors ${
                                          status === 'Completed'
                                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                            : status === 'Cancelled'
                                            ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                            : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                        }`}
                                      >
                                        Change to {status}
                                      </button>
                                    ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedOrder(null);
          }}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

// Order Details Modal Component
const OrderDetailsModal = ({ order, onClose, onStatusUpdate }) => {
  const statusOptions = ['Pending', 'Paid', 'Completed', 'Cancelled'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Order Details - #{order.id}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Customer</label>
              <p className="text-sm font-semibold text-gray-900 mt-1">{order.userName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Order Date</label>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {format(parseUTCDate(order.orderDate), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <p className="text-sm font-semibold text-gray-900 mt-1">{order.status}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Total Amount</label>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                ${order.totalAmount.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Order Items
            </h4>
            <div className="space-y-2">
              {order.items?.map((item, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.medicineName}</p>
                      <p className="text-sm text-gray-500 mt-1">Batch: {item.batchNumber}</p>
                      <p className="text-sm text-gray-500">Unit Price: ${item.unitPrice.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        ${item.subTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Information */}
          {order.payments && order.payments.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Payment Information</h4>
              <div className="space-y-2">
                {order.payments.map((payment, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Payment Method: {payment.method}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Date: {format(parseUTCDate(payment.paymentDate), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        ${payment.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Update */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Update Order Status</h4>
            <div className="flex flex-wrap gap-2">
              {statusOptions
                .filter(status => status !== order.status)
                .map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      onStatusUpdate(order.id, status);
                      onClose();
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      status === 'Completed'
                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                        : status === 'Cancelled'
                        ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        : status === 'Paid'
                        ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                    }`}
                  >
                    Change to {status}
                  </button>
                ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;


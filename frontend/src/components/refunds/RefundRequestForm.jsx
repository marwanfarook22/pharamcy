import { useState, useEffect } from 'react';
import { refundRequestsAPI, ordersAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { X, AlertCircle, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

const RefundRequestForm = ({ orderId, selectedOrderItem, onClose, onSuccess }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [formData, setFormData] = useState({
    reason: '',
    refundAmount: '',
    notes: ''
  });

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (selectedOrderItem && order) {
      // Pre-select the specific item for refund
      setSelectedItems([selectedOrderItem.id]);
      const itemAmount = selectedOrderItem.subTotal || (selectedOrderItem.unitPrice * selectedOrderItem.quantity);
      setFormData(prev => ({
        ...prev,
        refundAmount: itemAmount.toFixed(2)
      }));
    } else if (order && !selectedOrderItem) {
      // Full order refund
      setSelectedItems([]);
      setFormData(prev => ({
        ...prev,
        refundAmount: order.totalAmount.toFixed(2)
      }));
    }
  }, [selectedOrderItem, order]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getById(orderId);
      setOrder(response.data);
      if (!selectedOrderItem) {
        setFormData(prev => ({
          ...prev,
          refundAmount: response.data.totalAmount.toFixed(2)
        }));
      }
    } catch (error) {
      toast.error('Failed to load order details');
      console.error(error);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleItemToggle = (itemId) => {
    setSelectedItems(prev => {
      const newSelected = prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId];
      
      // Recalculate refund amount based on selected items
      if (order && order.items) {
        if (newSelected.length === 0) {
          // No items selected, use full order amount
          setFormData(formData => ({
            ...formData,
            refundAmount: order.totalAmount.toFixed(2)
          }));
        } else {
          // Calculate amount for selected items
          const selectedItemsData = order.items.filter(item => newSelected.includes(item.id));
          const total = selectedItemsData.reduce((sum, item) => sum + (item.subTotal || item.unitPrice * item.quantity), 0);
          setFormData(formData => ({
            ...formData,
            refundAmount: total.toFixed(2)
          }));
        }
      }
      
      return newSelected;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.reason.trim()) {
      toast.error('Please provide a reason for the refund request');
      return;
    }

    const refundAmount = parseFloat(formData.refundAmount);
    if (isNaN(refundAmount) || refundAmount <= 0) {
      toast.error('Refund amount must be greater than 0');
      return;
    }

    // Validate refund amount based on selected items or full order
    if (selectedItems.length > 0) {
      const selectedItemsData = order.items.filter(item => selectedItems.includes(item.id));
      const maxAmount = selectedItemsData.reduce((sum, item) => sum + (item.subTotal || item.unitPrice * item.quantity), 0);
      if (refundAmount > maxAmount) {
        toast.error(`Refund amount cannot exceed ${maxAmount.toFixed(2)} for selected items`);
        return;
      }
    } else {
      if (refundAmount > order.totalAmount) {
        toast.error(`Refund amount must be between 0 and ${order.totalAmount.toFixed(2)}`);
        return;
      }
    }

    // Check refund window (7 days)
    const daysSinceOrder = (new Date() - new Date(order.orderDate)) / (1000 * 60 * 60 * 24);
    if (daysSinceOrder > 7) {
      toast.error('Refund requests must be made within 7 days of order date');
      return;
    }

    // Check if order is refundable
    if (order.status !== 'Paid' && order.status !== 'Completed') {
      toast.error(`Orders with status '${order.status}' cannot be refunded`);
      return;
    }

    try {
      setSubmitting(true);
      await refundRequestsAPI.create({
        orderId: order.id,
        reason: formData.reason,
        refundAmount: refundAmount,
        notes: formData.notes || null,
        orderItemIds: selectedItems.length > 0 ? selectedItems : null
      });
      toast.success('Refund request submitted successfully');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to submit refund request';
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const daysSinceOrder = Math.floor((new Date() - new Date(order.orderDate)) / (1000 * 60 * 60 * 24));
  const canRefund = daysSinceOrder <= 7 && (order.status === 'Paid' || order.status === 'Completed');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Request Refund - Order #{order.id}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {!canRefund && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  This order cannot be refunded
                </p>
                <p className="text-sm text-red-600 mt-1">
                  {daysSinceOrder > 7
                    ? `Refund requests must be made within 7 days. This order is ${daysSinceOrder} days old.`
                    : `Only 'Paid' or 'Completed' orders can be refunded. Current status: ${order.status}`}
                </p>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Order Date:</span>
                <p className="font-medium text-gray-900">
                  {format(new Date(order.orderDate), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <p className="font-medium text-gray-900">{order.status}</p>
              </div>
              <div>
                <span className="text-gray-500">Total Amount:</span>
                <p className="font-medium text-gray-900">
                  ${order.totalAmount.toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Days Since Order:</span>
                <p className="font-medium text-gray-900">{daysSinceOrder} days</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                {selectedOrderItem ? 'Return This Product' : 'Select Items to Return (Optional)'}
              </h4>
              {!selectedOrderItem && (
                <p className="text-sm text-gray-500 mb-3">
                  Select specific items to return, or leave all unchecked to return the entire order.
                </p>
              )}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {!selectedOrderItem && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">
                          Select
                        </th>
                      )}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Medicine
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items
                      .filter(item => !selectedOrderItem || item.id === selectedOrderItem.id)
                      .map((item) => (
                      <tr key={item.id} className={selectedItems.includes(item.id) ? 'bg-blue-50' : ''}>
                        {!selectedOrderItem && (
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={() => handleItemToggle(item.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              disabled={!canRefund}
                            />
                          </td>
                        )}
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.medicineName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 text-right">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          ${item.subTotal.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Refund Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                max={selectedItems.length > 0 
                  ? order.items.filter(item => selectedItems.includes(item.id))
                      .reduce((sum, item) => sum + (item.subTotal || item.unitPrice * item.quantity), 0)
                  : order.totalAmount}
                value={formData.refundAmount}
                onChange={(e) => setFormData({ ...formData, refundAmount: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!canRefund}
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {selectedItems.length > 0 
                ? `Maximum refund for selected items: $${order.items.filter(item => selectedItems.includes(item.id))
                    .reduce((sum, item) => sum + (item.subTotal || item.unitPrice * item.quantity), 0).toFixed(2)}`
                : `Maximum refund: $${order.totalAmount.toFixed(2)}`}
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Refund <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={!canRefund}
            >
              <option value="">Select a reason</option>
              <option value="Defective Product">Defective Product</option>
              <option value="Wrong Item Received">Wrong Item Received</option>
              <option value="Item Not Received">Item Not Received</option>
              <option value="Changed My Mind">Changed My Mind</option>
              <option value="Duplicate Order">Duplicate Order</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Provide any additional details about your refund request..."
              disabled={!canRefund}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canRefund || submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Refund Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RefundRequestForm;


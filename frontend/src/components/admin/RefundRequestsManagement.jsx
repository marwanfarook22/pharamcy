import { useState, useEffect } from 'react';
import { refundRequestsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  DollarSign, 
  Check, 
  X as XIcon, 
  Clock,
  Filter,
  RefreshCw,
  Eye,
  Edit
} from 'lucide-react';
import { format } from 'date-fns';

const RefundRequestsManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [approveFormData, setApproveFormData] = useState({
    refundMethod: 'Original Payment Method',
    notes: ''
  });
  const [rejectFormData, setRejectFormData] = useState({
    notes: ''
  });
  const [statusFormData, setStatusFormData] = useState({
    status: '',
    refundMethod: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await refundRequestsAPI.getAll(statusFilter || undefined);
      setRequests(response.data);
    } catch (error) {
      toast.error('Failed to load refund requests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setApproveFormData({
      refundMethod: 'Original Payment Method',
      notes: ''
    });
    setShowApproveModal(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setRejectFormData({ notes: '' });
    setShowRejectModal(true);
  };

  const handleUpdateStatus = (request) => {
    setSelectedRequest(request);
    setStatusFormData({
      status: request.status,
      refundMethod: request.refundMethod || '',
      notes: request.notes || ''
    });
    setShowStatusModal(true);
  };

  const submitApprove = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      await refundRequestsAPI.approve(selectedRequest.id, {
        refundMethod: approveFormData.refundMethod || null,
        notes: approveFormData.notes || null
      });
      
      toast.success('Refund request approved successfully. Inventory restored.');
      setShowApproveModal(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve refund request');
    } finally {
      setSubmitting(false);
    }
  };

  const submitReject = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      await refundRequestsAPI.reject(selectedRequest.id, {
        notes: rejectFormData.notes || null
      });
      
      toast.success('Refund request rejected successfully');
      setShowRejectModal(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject refund request');
    } finally {
      setSubmitting(false);
    }
  };

  const submitStatusUpdate = async (e) => {
    e.preventDefault();

    if (!statusFormData.status) {
      toast.error('Please select a status');
      return;
    }

    try {
      setSubmitting(true);
      await refundRequestsAPI.updateStatus(selectedRequest.id, {
        status: statusFormData.status,
        refundMethod: statusFormData.refundMethod || null,
        notes: statusFormData.notes || null
      });
      
      toast.success('Refund request status updated successfully');
      setShowStatusModal(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
      Processing: 'bg-blue-100 text-blue-800',
      Completed: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const viewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

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
            <DollarSign className="h-6 w-6" />
            <span>Refund Requests</span>
          </h2>
          <p className="text-gray-600 mt-1">Manage customer refund requests</p>
        </div>
        <button
          onClick={fetchRequests}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Date
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
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No refund requests found
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{request.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Order #{request.orderId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.userName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {request.userEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${request.refundAmount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Order: ${request.orderTotalAmount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {request.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(request.requestDate), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => viewDetails(request)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        {request.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(request)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Approve request"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleReject(request)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Reject request"
                            >
                              <XIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        {request.status !== 'Pending' && (
                          <button
                            onClick={() => handleUpdateStatus(request)}
                            className="text-gray-600 hover:text-gray-900 p-1"
                            title="Update status"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <ApproveModal
          request={selectedRequest}
          formData={approveFormData}
          setFormData={setApproveFormData}
          onSubmit={submitApprove}
          onClose={() => {
            setShowApproveModal(false);
            setSelectedRequest(null);
          }}
          submitting={submitting}
        />
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <RejectModal
          request={selectedRequest}
          formData={rejectFormData}
          setFormData={setRejectFormData}
          onSubmit={submitReject}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedRequest(null);
          }}
          submitting={submitting}
        />
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedRequest && (
        <StatusUpdateModal
          request={selectedRequest}
          formData={statusFormData}
          setFormData={setStatusFormData}
          onSubmit={submitStatusUpdate}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedRequest(null);
          }}
          submitting={submitting}
        />
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <DetailsModal
          request={selectedRequest}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedRequest(null);
          }}
        />
      )}
    </div>
  );
};

// Approve Modal Component
const ApproveModal = ({ request, formData, setFormData, onSubmit, onClose, submitting }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Approve Refund Request #{request.id}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund Method
            </label>
            <select
              value={formData.refundMethod}
              onChange={(e) => setFormData({ ...formData, refundMethod: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Original Payment Method">Original Payment Method</option>
              <option value="Cash">Cash</option>
              <option value="Wallet">Wallet</option>
              <option value="Credit">Credit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any notes about this approval..."
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Approving this refund will restore inventory quantities and mark the order as refunded.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? 'Approving...' : 'Approve Refund'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reject Modal Component
const RejectModal = ({ request, formData, setFormData, onSubmit, onClose, submitting }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Reject Refund Request #{request.id}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Provide a reason for rejection (this will be visible to the customer)..."
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? 'Rejecting...' : 'Reject Refund'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Status Update Modal Component
const StatusUpdateModal = ({ request, formData, setFormData, onSubmit, onClose, submitting }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Update Status - Request #{request.id}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund Method
            </label>
            <select
              value={formData.refundMethod}
              onChange={(e) => setFormData({ ...formData, refundMethod: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select method</option>
              <option value="Original Payment Method">Original Payment Method</option>
              <option value="Cash">Cash</option>
              <option value="Wallet">Wallet</option>
              <option value="Credit">Credit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any notes..."
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Details Modal Component
const DetailsModal = ({ request, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Refund Request Details - #{request.id}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Request Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Order ID</label>
              <p className="text-sm font-semibold text-gray-900 mt-1">#{request.orderId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Customer</label>
              <p className="text-sm font-semibold text-gray-900 mt-1">{request.userName}</p>
              <p className="text-xs text-gray-500">{request.userEmail}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Refund Amount</label>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                ${request.refundAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Order Total</label>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                ${request.orderTotalAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <p className="text-sm font-semibold text-gray-900 mt-1">{request.status}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Request Date</label>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {format(new Date(request.requestDate), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
            {request.responseDate && (
              <div>
                <label className="text-sm font-medium text-gray-500">Response Date</label>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {format(new Date(request.responseDate), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            )}
            {request.refundMethod && (
              <div>
                <label className="text-sm font-medium text-gray-500">Refund Method</label>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {request.refundMethod}
                </p>
              </div>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="text-sm font-medium text-gray-500">Reason</label>
            <p className="text-sm text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg">
              {request.reason}
            </p>
          </div>

          {/* Notes */}
          {request.notes && (
            <div>
              <label className="text-sm font-medium text-gray-500">Admin Notes</label>
              <p className="text-sm text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg">
                {request.notes}
              </p>
            </div>
          )}

          {/* Order Items */}
          {request.orderItems && request.orderItems.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-500 mb-3 block">
                Order Items
              </label>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Medicine
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Batch
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
                    {request.orderItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.medicineName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {item.batchNumber}
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

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundRequestsManagement;



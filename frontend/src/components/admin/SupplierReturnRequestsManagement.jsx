import { useState, useEffect } from 'react';
import { supplierReturnRequestsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  Package, 
  Check, 
  X as XIcon, 
  Clock,
  Filter,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

const SupplierReturnRequestsManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approveFormData, setApproveFormData] = useState({
    newBatchNumber: '',
    newExpiryDate: '',
    newQuantity: '',
    notes: ''
  });
  const [rejectFormData, setRejectFormData] = useState({
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await supplierReturnRequestsAPI.getAll(statusFilter || undefined);
      setRequests(response.data);
    } catch (error) {
      toast.error('Failed to load return requests');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setApproveFormData({
      newBatchNumber: '',
      newExpiryDate: '',
      newQuantity: request.quantity.toString(),
      notes: ''
    });
    setShowApproveModal(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setRejectFormData({ notes: '' });
    setShowRejectModal(true);
  };

  const submitApprove = async (e) => {
    e.preventDefault();
    
    if (!approveFormData.newBatchNumber || !approveFormData.newExpiryDate || !approveFormData.newQuantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (parseInt(approveFormData.newQuantity) <= 0) {
      toast.error('New quantity must be greater than 0');
      return;
    }

    // Validate new expiry date is in the future
    const newExpiryDate = new Date(approveFormData.newExpiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (newExpiryDate <= today) {
      toast.error('New expiry date must be in the future');
      return;
    }

    // Validate new expiry date is later than old one
    const oldExpiryDate = new Date(selectedRequest.expiryDate);
    if (newExpiryDate <= oldExpiryDate) {
      toast.error('New expiry date must be later than the current expiry date');
      return;
    }

    try {
      setSubmitting(true);
      await supplierReturnRequestsAPI.approve(selectedRequest.id, {
        newBatchNumber: approveFormData.newBatchNumber,
        newExpiryDate: approveFormData.newExpiryDate,
        newQuantity: parseInt(approveFormData.newQuantity),
        notes: approveFormData.notes || null
      });
      
      toast.success('Return request approved successfully. New batch created and old batch deleted.');
      setShowApproveModal(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve return request');
    } finally {
      setSubmitting(false);
    }
  };

  const submitReject = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      await supplierReturnRequestsAPI.reject(selectedRequest.id, {
        notes: rejectFormData.notes || null
      });
      
      toast.success('Return request rejected successfully');
      setShowRejectModal(false);
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject return request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
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
            <Package className="h-6 w-6" />
            <span>Supplier Return Requests</span>
          </h2>
          <p className="text-gray-600 mt-1">Manage medicine return requests from suppliers</p>
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
                  Medicine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
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
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                    No return requests found
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{request.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {request.medicineName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {request.batchNumber}
                      </div>
                      <div className="text-xs text-gray-500">
                        Expires: {format(new Date(request.expiryDate), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {request.supplierName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {request.quantity} units
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
                      {request.status === 'Pending' && (
                        <div className="flex items-center justify-end space-x-2">
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
                        </div>
                      )}
                      {request.status === 'Approved' && request.newBatchNumber && (
                        <div className="text-xs text-gray-500 text-right">
                          <div>New Batch: {request.newBatchNumber}</div>
                          {request.newExpiryDate && (
                            <div>New Expiry: {format(new Date(request.newExpiryDate), 'MMM dd, yyyy')}</div>
                          )}
                          {request.newQuantity && (
                            <div>New Qty: {request.newQuantity}</div>
                          )}
                        </div>
                      )}
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
    </div>
  );
};

// Approve Modal Component
const ApproveModal = ({ request, formData, setFormData, onSubmit, onClose, submitting }) => {
  const minDate = new Date(request.expiryDate);
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Approve Return Request</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> When you approve this request, the old batch will be deleted and a new batch with longer expiry will be created automatically.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medicine
            </label>
            <input
              type="text"
              value={request.medicineName}
              disabled
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Old Batch Number
            </label>
            <input
              type="text"
              value={request.batchNumber}
              disabled
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Old Expiry Date
            </label>
            <input
              type="text"
              value={format(new Date(request.expiryDate), 'MMM dd, yyyy')}
              disabled
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Batch Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.newBatchNumber}
              onChange={(e) => setFormData({ ...formData, newBatchNumber: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="BATCH-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Expiry Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              min={minDateString}
              value={formData.newExpiryDate}
              onChange={(e) => setFormData({ ...formData, newExpiryDate: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be later than {format(new Date(request.expiryDate), 'MMM dd, yyyy')}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={formData.newQuantity}
              onChange={(e) => setFormData({ ...formData, newQuantity: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter quantity"
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
              <Check className="h-4 w-4" />
              <span>{submitting ? 'Approving...' : 'Approve'}</span>
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
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Reject Return Request</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> Rejecting this request will mark it as rejected. The medicine will remain in inventory.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medicine
            </label>
            <input
              type="text"
              value={request.medicineName}
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
              value={request.batchNumber}
              disabled
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="text"
              value={`${request.quantity} units`}
              disabled
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rejection Reason (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter reason for rejection..."
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
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XIcon className="h-4 w-4" />
              <span>{submitting ? 'Rejecting...' : 'Reject'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierReturnRequestsManagement;


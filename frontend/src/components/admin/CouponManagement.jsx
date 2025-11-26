import { useState, useEffect } from 'react';
import { couponsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  Tag, 
  Plus, 
  Edit, 
  Trash2, 
  ToggleLeft,
  ToggleRight,
  Search,
  Filter,
  X,
  Save,
  Copy,
  Calendar,
  Percent,
  DollarSign,
  Truck,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    discountType: 'Percentage',
    discountValue: 0,
    minimumPurchase: null,
    maximumDiscount: null,
    startDate: new Date().toISOString().split('T')[0],
    endDate: null,
    usageLimit: null,
  });

  useEffect(() => {
    fetchCoupons();
  }, [activeFilter]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const activeOnly = activeFilter === 'active';
      const response = await couponsAPI.getAll(activeOnly || undefined);
      setCoupons(response.data);
    } catch (error) {
      toast.error('Failed to load coupons');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    
    if (!formData.code || !formData.name || !formData.discountValue) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await couponsAPI.create(formData);
      toast.success('Coupon created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    }
  };

  const handleUpdateCoupon = async (e) => {
    e.preventDefault();
    
    try {
      await couponsAPI.update(selectedCoupon.id, formData);
      toast.success('Coupon updated successfully');
      setShowEditModal(false);
      resetForm();
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update coupon');
    }
  };

  const handleToggleStatus = async (couponId) => {
    try {
      const response = await couponsAPI.toggleStatus(couponId);
      toast.success(`Coupon ${response.data.isActive ? 'activated' : 'deactivated'}`);
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to toggle coupon status');
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) {
      return;
    }

    try {
      await couponsAPI.delete(couponId);
      toast.success('Coupon deleted successfully');
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const openEditModal = (coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minimumPurchase: coupon.minimumPurchase || null,
      maximumDiscount: coupon.maximumDiscount || null,
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : null,
      usageLimit: coupon.usageLimit || null,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      discountType: 'Percentage',
      discountValue: 0,
      minimumPurchase: null,
      maximumDiscount: null,
      startDate: new Date().toISOString().split('T')[0],
      endDate: null,
      usageLimit: null,
    });
    setSelectedCoupon(null);
  };

  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied to clipboard');
  };

  const getDiscountTypeIcon = (type) => {
    switch (type) {
      case 'Percentage':
        return <Percent className="h-4 w-4" />;
      case 'FixedAmount':
        return <DollarSign className="h-4 w-4" />;
      case 'FreeShipping':
        return <Truck className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  const getDiscountDisplay = (coupon) => {
    switch (coupon.discountType) {
      case 'Percentage':
        return `${coupon.discountValue}% OFF`;
      case 'FixedAmount':
        return `$${coupon.discountValue} OFF`;
      case 'FreeShipping':
        return 'FREE SHIPPING';
      default:
        return coupon.discountType;
    }
  };

  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coupon.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
            <Tag className="h-6 w-6" />
            <span>Coupon Management</span>
          </h2>
          <p className="text-gray-600 mt-1">Create and manage discount coupons</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create Coupon</span>
        </button>
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
              placeholder="Search by code or name..."
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
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="">All Coupons</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCoupons.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow-md p-12 text-center">
            <Tag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No coupons found</h3>
            <p className="text-gray-600">Create your first coupon to get started</p>
          </div>
        ) : (
          filteredCoupons.map((coupon) => {
            const isExpired = coupon.endDate && new Date(coupon.endDate) < new Date();
            const isUsageLimitReached = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;
            const isValid = coupon.isActive && !isExpired && !isUsageLimitReached;

            return (
              <div
                key={coupon.id}
                className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                  isValid ? 'border-green-500' : 'border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getDiscountTypeIcon(coupon.discountType)}
                      <h3 className="text-lg font-bold text-gray-900">{coupon.code}</h3>
                      <button
                        onClick={() => copyCouponCode(coupon.code)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Copy code"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{coupon.name}</p>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isValid
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {getDiscountDisplay(coupon)}
                      </span>
                      {coupon.isActive ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  {coupon.minimumPurchase && (
                    <p>Min. purchase: ${coupon.minimumPurchase.toFixed(2)}</p>
                  )}
                  {coupon.usageLimit && (
                    <p>Usage: {coupon.usedCount} / {coupon.usageLimit}</p>
                  )}
                  <p>Valid: {format(new Date(coupon.startDate), 'MMM dd, yyyy')} - {
                    coupon.endDate ? format(new Date(coupon.endDate), 'MMM dd, yyyy') : 'No expiry'
                  }</p>
                  {isExpired && <p className="text-red-600 font-medium">Expired</p>}
                  {isUsageLimitReached && <p className="text-red-600 font-medium">Usage limit reached</p>}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleToggleStatus(coupon.id)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                  >
                    {coupon.isActive ? (
                      <>
                        <ToggleRight className="h-5 w-5 text-green-600" />
                        <span>Deactivate</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-5 w-5 text-gray-400" />
                        <span>Activate</span>
                      </>
                    )}
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(coupon)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Edit coupon"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCoupon(coupon.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Delete coupon"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <CouponModal
          title="Create New Coupon"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateCoupon}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
        />
      )}

      {/* Edit Coupon Modal */}
      {showEditModal && (
        <CouponModal
          title="Edit Coupon"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleUpdateCoupon}
          onClose={() => {
            setShowEditModal(false);
            resetForm();
          }}
          isEdit={true}
        />
      )}
    </div>
  );
};

// Coupon Modal Component
const CouponModal = ({ title, formData, setFormData, onSubmit, onClose, isEdit = false }) => {
  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coupon Code <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="SAVE10"
                  disabled={isEdit}
                />
                {!isEdit && (
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Generate
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coupon Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Summer Sale 2024"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Percentage">Percentage (%)</option>
                <option value="FixedAmount">Fixed Amount ($)</option>
                <option value="FreeShipping">Free Shipping</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Value <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                max={formData.discountType === 'Percentage' ? 100 : undefined}
                step="0.01"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder={formData.discountType === 'Percentage' ? '10' : '5.00'}
              />
              {formData.discountType === 'Percentage' && (
                <p className="text-xs text-gray-500 mt-1">Enter percentage (0-100)</p>
              )}
            </div>
          </div>

          {formData.discountType === 'Percentage' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Discount ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.maximumDiscount || ''}
                onChange={(e) => setFormData({ ...formData, maximumDiscount: e.target.value ? parseFloat(e.target.value) : null })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional: Cap the discount amount"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Purchase ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.minimumPurchase || ''}
              onChange={(e) => setFormData({ ...formData, minimumPurchase: e.target.value ? parseFloat(e.target.value) : null })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional: Minimum order amount"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value || null })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usage Limit
            </label>
            <input
              type="number"
              min="1"
              value={formData.usageLimit || ''}
              onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value ? parseInt(e.target.value) : null })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional: Total number of uses"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited uses</p>
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
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponManagement;


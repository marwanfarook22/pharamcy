import { useState, useEffect } from 'react';
import { usersAPI, messagesAPI, couponsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  Mail, 
  Send, 
  Search, 
  Filter,
  User,
  Users,
  CheckSquare,
  Square,
  X,
  MessageSquare,
  CheckCircle2,
  Tag
} from 'lucide-react';

const MessageManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [messageData, setMessageData] = useState({
    subject: '',
    content: '',
  });
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showCouponSelector, setShowCouponSelector] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchCoupons();
  }, [roleFilter]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll(
        roleFilter || undefined,
        undefined // Don't use searchTerm in API, filter locally instead
      );
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to load users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      const response = await couponsAPI.getAll(true); // Get only active coupons
      setCoupons(response.data);
    } catch (error) {
      console.error('Failed to load coupons:', error);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by role
    if (roleFilter) {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.fullName.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      // Deselect all
      setSelectedUsers(new Set());
    } else {
      // Select all filtered users
      const allIds = new Set(filteredUsers.map(u => u.id));
      setSelectedUsers(allIds);
    }
  };

  const handleSelectUser = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectCoupon = (coupon) => {
    setSelectedCoupon(coupon);
    setShowCouponSelector(false);
    
    // Auto-fill message with coupon information
    const couponInfo = `\n\n🎉 Special Offer: Use coupon code "${coupon.code}" to get ${
      coupon.discountType === 'Percentage' 
        ? `${coupon.discountValue}% OFF`
        : coupon.discountType === 'FixedAmount'
        ? `$${coupon.discountValue} OFF`
        : 'FREE SHIPPING'
    }!`;
    
    setMessageData(prev => ({
      ...prev,
      content: prev.content + couponInfo
    }));
  };

  const handleRemoveCoupon = () => {
    setSelectedCoupon(null);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (selectedUsers.size === 0) {
      toast.error('Please select at least one user');
      return;
    }

    if (!messageData.subject || !messageData.content) {
      toast.error('Please fill in subject and message content');
      return;
    }

    try {
      setSending(true);
      const userIds = Array.from(selectedUsers);
      
      if (userIds.length === 1) {
        // Send to single user
        await messagesAPI.sendMessage({
          userId: userIds[0],
          subject: messageData.subject,
          content: messageData.content,
        });
      } else {
        // Send to multiple users
        await messagesAPI.sendToMultiple({
          userIds,
          subject: messageData.subject,
          content: messageData.content,
        });
      }

      toast.success(`Message sent to ${userIds.length} user(s) successfully`);
      
      // Reset form
      setMessageData({ subject: '', content: '' });
      setSelectedUsers(new Set());
      setSelectedCoupon(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800';
      case 'Pharmacist':
        return 'bg-blue-100 text-blue-800';
      case 'Customer':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const allSelected = filteredUsers.length > 0 && selectedUsers.size === filteredUsers.length;
  const someSelected = selectedUsers.size > 0 && selectedUsers.size < filteredUsers.length;

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
            <MessageSquare className="h-6 w-6" />
            <span>Message Management</span>
          </h2>
          <p className="text-gray-600 mt-1">Send messages to users</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-5 w-5" />
          <span>{selectedUsers.size} selected</span>
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
              placeholder="Search by name or email..."
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
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Pharmacist">Pharmacist</option>
              <option value="Customer">Customer</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Selection Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Select Users</h3>
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {allSelected ? (
                    <>
                      <CheckSquare className="h-4 w-4" />
                      <span>Deselect All</span>
                    </>
                  ) : (
                    <>
                      <Square className="h-4 w-4" />
                      <span>Select All</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No users found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => {
                    const isSelected = selectedUsers.has(user.id);
                    return (
                      <div
                        key={user.id}
                        onClick={() => handleSelectUser(user.id)}
                        className={`p-4 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50 border-l-4 border-blue-600'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            {isSelected ? (
                              <CheckCircle2 className="h-5 w-5 text-blue-600" />
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {user.fullName}
                              </p>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                                {user.role}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {filteredUsers.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600">
                  Showing {filteredUsers.length} of {users.length} users
                  {selectedUsers.size > 0 && (
                    <span className="text-blue-600 font-medium ml-1">
                      ({selectedUsers.size} selected)
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Message Composition Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <span>Compose Message</span>
            </h3>

            <form onSubmit={handleSendMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={messageData.subject}
                  onChange={(e) => setMessageData({ ...messageData, subject: e.target.value })}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter message subject"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {messageData.subject.length}/200 characters
                </p>
              </div>

              {/* Coupon Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Include Coupon (Optional)
                </label>
                {!selectedCoupon ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCouponSelector(!showCouponSelector)}
                      className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-sm"
                    >
                      <Tag className="h-4 w-4" />
                      <span>Add Coupon</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Tag className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-900">{selectedCoupon.code}</p>
                        <p className="text-xs text-green-700">{selectedCoupon.name}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}
                
                {showCouponSelector && (
                  <div className="mt-2 border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                    {coupons.length === 0 ? (
                      <p className="p-4 text-sm text-gray-500 text-center">No active coupons available</p>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {coupons.map((coupon) => (
                          <button
                            key={coupon.id}
                            type="button"
                            onClick={() => handleSelectCoupon(coupon)}
                            className="w-full text-left p-3 hover:bg-blue-50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">{coupon.code}</p>
                                <p className="text-xs text-gray-600">{coupon.name}</p>
                              </div>
                              <span className="text-xs font-medium text-blue-600">
                                {coupon.discountType === 'Percentage' 
                                  ? `${coupon.discountValue}% OFF`
                                  : coupon.discountType === 'FixedAmount'
                                  ? `$${coupon.discountValue} OFF`
                                  : 'FREE SHIPPING'}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={messageData.content}
                  onChange={(e) => setMessageData({ ...messageData, content: e.target.value })}
                  rows={12}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Enter your message here..."
                  maxLength={2000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {messageData.content.length}/2000 characters
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {selectedUsers.size === 0 ? (
                    <span className="text-red-600">Please select at least one user</span>
                  ) : (
                    <span>
                      Message will be sent to <strong>{selectedUsers.size}</strong> user(s)
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={selectedUsers.size === 0 || sending || !messageData.subject || !messageData.content}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageManagement;


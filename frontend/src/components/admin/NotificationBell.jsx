import { useState, useEffect, useRef } from 'react';
import { Bell, X } from 'lucide-react';
import { ordersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { parseUTCDate } from '../../utils/dateUtils';

const NotificationBell = () => {
  const { getLastLogoutTime, isAdmin } = useAuth();
  const [newOrders, setNewOrders] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  
  // Only show for admin users
  if (!isAdmin) {
    return null;
  }

  useEffect(() => {
    fetchNewOrders();
    // Refresh every 30 seconds to check for new orders
    const interval = setInterval(() => {
      fetchNewOrders();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNewOrders = async () => {
    try {
      setLoading(true);
      const lastLogoutTime = getLastLogoutTime();
      
      console.log('🔔 NotificationBell: Fetching orders...');
      console.log('🔔 Last logout time:', lastLogoutTime);
      
      // Fetch all orders
      const response = await ordersAPI.getAll();
      const allOrders = response.data || [];
      
      console.log('🔔 Total orders fetched:', allOrders.length);
      if (allOrders.length > 0) {
        console.log('🔔 Sample order:', allOrders[0]);
        console.log('🔔 Order date property:', allOrders[0].orderDate);
      }

      // STRICT: Only show orders if admin has logged out before
      // If no logout time exists, don't show any notifications
      if (!lastLogoutTime) {
        console.log('🔔 No logout time found. Notifications will only show after you log out and log back in.');
        setNewOrders([]);
        setLoading(false);
        return;
      }
      
      // Filter orders created after last logout - STRICT: only orders after logout
      const logoutTime = new Date(lastLogoutTime);
      console.log('🔔 Filtering orders after logout time:', logoutTime);
      console.log('🔔 Logout time ISO:', logoutTime.toISOString());
      console.log('🔔 Logout time local:', logoutTime.toString());
      
      const filteredOrders = allOrders.filter(order => {
        // Handle both orderDate and OrderDate property names
        const orderDateStr = order.orderDate || order.OrderDate;
        if (!orderDateStr) {
          console.warn('🔔 Order missing date:', order.id);
          return false;
        }
        const orderDate = parseUTCDate(orderDateStr);
        const isValid = !isNaN(orderDate.getTime());
        
        if (!isValid) {
          console.warn(`🔔 Order #${order.id} has invalid date:`, orderDateStr);
          return false;
        }
        
        // Compare timestamps to avoid timezone issues
        // STRICT: Only show orders created AFTER logout time
        const orderTimestamp = orderDate.getTime();
        const logoutTimestamp = logoutTime.getTime();
        const isAfter = orderTimestamp > logoutTimestamp;
        
        return isAfter;
      });
      
      console.log('🔔 Orders after logout:', filteredOrders.length);

      // Sort by date (newest first)
      filteredOrders.sort((a, b) => {
        const dateA = parseUTCDate(a.orderDate || a.OrderDate);
        const dateB = parseUTCDate(b.orderDate || b.OrderDate);
        return dateB.getTime() - dateA.getTime();
      });

      console.log('🔔 Final filtered orders count:', filteredOrders.length);
      setNewOrders(filteredOrders);
    } catch (error) {
      console.error('🔔 Failed to fetch new orders:', error);
      console.error('🔔 Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setNewOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = () => {
    // Clear the last logout time to mark all as read
    // This means next login won't show these orders again
    localStorage.removeItem('adminLastLogout');
    setNewOrders([]);
  };

  const unreadCount = newOrders.length;
  
  // Debug: Log when component renders
  useEffect(() => {
    console.log('🔔 NotificationBell rendered. isAdmin:', isAdmin, 'unreadCount:', unreadCount);
  }, [isAdmin, unreadCount]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title={`Notifications${unreadCount > 0 ? ` (${unreadCount} new)` : ''}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed left-64 top-16 ml-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-[100] max-h-96 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">
              New Orders
              {unreadCount > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-600">
                  ({unreadCount} {unreadCount === 1 ? 'order' : 'orders'})
                </span>
              )}
            </h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  title="Mark all as read"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading notifications...</p>
              </div>
            ) : unreadCount === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-1 font-medium">No new orders</p>
                {getLastLogoutTime() ? (
                  <>
                    <p className="text-xs text-gray-400 mb-2">
                      since last logout ({format(parseUTCDate(getLastLogoutTime()), 'MMM dd, yyyy HH:mm')})
                    </p>
                    <p className="text-xs text-gray-500 mb-4 px-4">
                      New orders created after you logged out will appear here.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-gray-400 mb-2">
                      Log out and log back in to see new orders
                    </p>
                    <p className="text-xs text-gray-500 mb-4 px-4">
                      Notifications will only show orders created after you log out.
                    </p>
                  </>
                )}
                <button
                  onClick={() => {
                    // Force refresh
                    fetchNewOrders();
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                >
                  Refresh
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {newOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setIsOpen(false);
                      // You can navigate to order details here if needed
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-gray-900">
                            Order #{order.id}
                          </p>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
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
                        <p className="text-sm text-gray-600 mt-1">
                          Customer: {order.userName}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(parseUTCDate(order.orderDate || order.OrderDate), 'MMM dd, yyyy HH:mm')}
                        </p>
                        <p className="text-sm font-medium text-gray-900 mt-2">
                          Total: ${order.totalAmount.toFixed(2)}
                        </p>
                        {order.items && order.items.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {unreadCount > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-center text-gray-500">
                Click "Mark all read" to clear notifications
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;


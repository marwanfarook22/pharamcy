import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, LogOut, User, LayoutDashboard, Pill, Sparkles, ChevronDown, ChevronUp, Grid3x3, FileText, Tag, HelpCircle, Users, Mail, Percent, Package, AlertTriangle, ShoppingBag, Building2, Layers, Award, Image, Bell, CreditCard, RotateCcw, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cartAPI, categoriesAPI, messagesAPI } from '../../services/api';
import NotificationBell from '../admin/NotificationBell';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrescriptionBottleMedical } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isHelpDropdownOpen, setIsHelpDropdownOpen] = useState(false);
  
  const isAdminRoute = location.pathname === '/admin';

  useEffect(() => {
    if (user) {
      fetchCartCount();
      fetchCategories();
      fetchUnreadMessageCount();
      // Refresh unread count every 30 seconds
      const interval = setInterval(fetchUnreadMessageCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchCartCount = async () => {
    try {
      const response = await cartAPI.getCart();
      const count = response.data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setCartItemCount(count);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  const fetchCategories = async () => { 
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchUnreadMessageCount = async () => {
    try {
      const response = await messagesAPI.getUnreadCount();
      setUnreadMessageCount(response.data.count || 0);
    } catch (error) {
      console.error('Failed to fetch unread message count:', error);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate('/', { state: { categoryId } });
    setIsCategoryDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Adjust navbar position based on whether we're on home page (where banner shows)
  const isHomePage = location.pathname === '/';
  
  return (
    <nav className={`fixed left-0 ${isHomePage ? 'top-14 h-[calc(100vh-3.5rem)]' : 'top-0 h-full'} w-64 bg-white shadow-lg z-50 flex flex-col`}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faPrescriptionBottleMedical} className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">PharmaTech</span>
          </Link>
          {isAdmin && (
            <div className="flex items-center">
              <NotificationBell />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {user ? (
          isAdminRoute && isAdmin ? (
            // Admin Dashboard Navigation
            <div className="flex flex-col space-y-1 px-4">
              <button
                onClick={() => navigate('/admin?section=overview')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3 ${
                  new URLSearchParams(location.search).get('section') === 'overview' || !location.search.includes('section')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>Overview</span>
              </button>
              <button
                onClick={() => navigate('/admin?section=medicines')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3 ${
                  new URLSearchParams(location.search).get('section') === 'medicines'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <Package className="h-5 w-5" />
                <span>Medicines</span>
              </button>
              <button
                onClick={() => navigate('/admin?section=suppliers')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3 ${
                  new URLSearchParams(location.search).get('section') === 'suppliers'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <Building2 className="h-5 w-5" />
                <span>Suppliers</span>
              </button>
              <button
                onClick={() => navigate('/admin?section=categories')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3 ${
                  new URLSearchParams(location.search).get('section') === 'categories'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <Layers className="h-5 w-5" />
                <span>Categories</span>
              </button>
              <button
                onClick={() => navigate('/admin?section=brands')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3 ${
                  new URLSearchParams(location.search).get('section') === 'brands'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <Award className="h-5 w-5" />
                <span>Brands</span>
              </button>
              <button
                onClick={() => navigate('/admin?section=users')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3 ${
                  new URLSearchParams(location.search).get('section') === 'users'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <Users className="h-5 w-5" />
                <span>Users</span>
              </button>
              <button
                onClick={() => navigate('/admin?section=orders')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3 ${
                  new URLSearchParams(location.search).get('section') === 'orders'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <ShoppingBag className="h-5 w-5" />
                <span>Orders</span>
              </button>
              <button
                onClick={() => navigate('/admin?section=return-requests')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3 ${
                  new URLSearchParams(location.search).get('section') === 'return-requests'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <RotateCcw className="h-5 w-5" />
                <span>Return Requests</span>
              </button>
              <button
                onClick={() => navigate('/admin?section=refund-requests')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3 ${
                  new URLSearchParams(location.search).get('section') === 'refund-requests'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <CreditCard className="h-5 w-5" />
                <span>Refund Requests</span>
              </button>
              <button
                onClick={() => navigate('/admin?section=banners')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3 ${
                  new URLSearchParams(location.search).get('section') === 'banners'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <Image className="h-5 w-5" />
                <span>Banners</span>
              </button>
              <button
                onClick={() => navigate('/admin?section=expiry-alerts')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3 ${
                  new URLSearchParams(location.search).get('section') === 'expiry-alerts'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <Calendar className="h-5 w-5" />
                <span>Expiry Alerts</span>
              </button>
              <button
                onClick={() => navigate('/admin?section=notifications')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3 ${
                  new URLSearchParams(location.search).get('section') === 'notifications'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <AlertTriangle className="h-5 w-5" />
                <span>Notifications</span>
              </button>
              <button
                onClick={() => navigate('/admin?section=messages')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3 ${
                  new URLSearchParams(location.search).get('section') === 'messages'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <Mail className="h-5 w-5" />
                <span>Messages</span>
              </button>
              <button
                onClick={() => navigate('/admin?section=coupons')}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3 ${
                  new URLSearchParams(location.search).get('section') === 'coupons'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <Tag className="h-5 w-5" />
                <span>Coupons</span>
              </button>
            </div>
          ) : (
            // Regular User Navigation
            <div className="flex flex-col space-y-2 px-4">
              {/* Categories Dropdown - FIRST */}
              <div className="relative">
                <button
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className="w-full text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <Grid3x3 className="h-5 w-5" />
                    <span>Categories</span>
                  </div>
                  {isCategoryDropdownOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                
                {isCategoryDropdownOpen && categories.length > 0 && (
                  <div className="mt-2 ml-4 space-y-1 max-h-64 overflow-y-auto">
                    <Link
                      to="/categories"
                      className="w-full text-left text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm transition-colors font-semibold flex items-center space-x-2"
                      onClick={() => setIsCategoryDropdownOpen(false)}
                    >
                      <Tag className="h-4 w-4" />
                      <span>View All Categories</span>
                    </Link>
                    <div className="border-t border-gray-200 my-1"></div>
                    <button
                      onClick={() => handleCategoryClick(null)}
                      className="w-full text-left text-gray-600 hover:text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      All Categories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        className="w-full text-left text-gray-600 hover:text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <Link
                to="/"
                className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3"
              >
                <Pill className="h-5 w-5" />
                <span>{isAdmin ? 'POS' : 'Medicines'}</span>
              </Link>
              <Link
                to="/new-arrivals"
                className="relative text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3 bg-purple-50"
              >
                <Sparkles className="h-5 w-5" />
                <span>New Arrivals</span>
              </Link>
              <Link
                to="/50-off"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3"
              >
                <Percent className="h-5 w-5" />
                <span className="font-bold">50% OFF</span>
              </Link>
              <Link
                to="/brands"
                className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3"
              >
                <Tag className="h-5 w-5" />
                <span>Brands</span>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
              )}
              <Link
                to="/cart"
                className="relative text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Cart</span>
                {cartItemCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              <Link
                to="/bills"
                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3"
              >
                <FileText className="h-5 w-5" />
                <span>My Bills</span>
              </Link>
              <Link
                to="/messages"
                className="relative text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center space-x-3"
              >
                <Mail className="h-5 w-5" />
                <span>Messages</span>
                {unreadMessageCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                    {unreadMessageCount}
                  </span>
                )}
              </Link>
              
              {/* Help & Support and Team Dropdown - LAST */}
              <div className="relative">
                <button
                  onClick={() => setIsHelpDropdownOpen(!isHelpDropdownOpen)}
                  className="w-full text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <HelpCircle className="h-5 w-5" />
                    <span>Help & Support</span>
                  </div>
                  {isHelpDropdownOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                
                {isHelpDropdownOpen && (
                  <div className="mt-2 ml-4 space-y-1">
                    <Link
                      to="/help"
                      className="w-full text-left text-gray-600 hover:text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
                      onClick={() => setIsHelpDropdownOpen(false)}
                    >
                      <HelpCircle className="h-4 w-4" />
                      <span>Help Center</span>
                    </Link>
                    <Link
                      to="/support"
                      className="w-full text-left text-gray-600 hover:text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
                      onClick={() => setIsHelpDropdownOpen(false)}
                    >
                      <HelpCircle className="h-4 w-4" />
                      <span>Contact Support</span>
                    </Link>
                    <Link
                      to="/team"
                      className="w-full text-left text-gray-600 hover:text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
                      onClick={() => setIsHelpDropdownOpen(false)}
                    >
                      <Users className="h-4 w-4" />
                      <span>Our Team</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="flex flex-col space-y-2 px-4">
            <Link
              to="/login"
              className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-primary-600 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors text-center"
            >
              Register
            </Link>
          </div>
        )}
      </div>

      {user && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-2 text-gray-700 mb-3 px-4">
            <User className="h-5 w-5" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user.fullName}</span>
              <span className="text-xs text-gray-500">({user.role})</span>
            </div>
          </div>
          <Link
            to="/profile"
            className="w-full text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 mb-2"
          >
            <User className="h-4 w-4" />
            <span>My Profile</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-gray-700 hover:text-red-600 hover:bg-red-50 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;


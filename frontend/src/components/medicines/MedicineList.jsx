import { useState, useEffect, useRef } from 'react';
import { medicinesAPI, categoriesAPI, cartAPI, ordersAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { ShoppingCart, Search, ChevronLeft, ChevronRight, Tag, ArrowRight, TrendingUp, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPills, 
  faBaby, 
  faHeart, 
  faHome, 
  faPalette, 
  faBoxes, 
  faCapsules,
  faSyringe,
  faBandage,
  faPrescriptionBottle,
  faFlask,
  faShieldVirus,
  faThermometer,
  faHandSparkles
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { parseUTCDate } from '../../utils/dateUtils';

const MedicineList = () => {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [addingToCart, setAddingToCart] = useState({});
  const [showAllBestSelling, setShowAllBestSelling] = useState(false);
  const [showAllNewArrivals, setShowAllNewArrivals] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const categoryScrollRef = useRef(null);
  const bannerScrollRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle category from navigation state
  useEffect(() => {
    if (location.state?.categoryId) {
      setSelectedCategory(location.state.categoryId.toString());
      // Clear the state to avoid re-applying on re-render
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    fetchMedicines();
    fetchCategories();
    fetchOrders();
  }, [selectedCategory]);


  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await medicinesAPI.getAll(
        selectedCategory ? parseInt(selectedCategory) : null
      );
      setMedicines(response.data);
    } catch (error) {
      toast.error('Failed to load medicines');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Failed to load orders for best selling products');
    }
  };


  const handleAddToCart = async (medicineId, quantity = 1) => {
    if (!user) {
      toast.info('Please login to add items to cart');
      navigate('/login');
      return;
    }

    setAddingToCart({ ...addingToCart, [medicineId]: true });

    try {
      await cartAPI.addItem({ medicineId, quantity });
      toast.success('Added to cart!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart({ ...addingToCart, [medicineId]: false });
    }
  };

  const filteredMedicines = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate best selling products
  const bestSellingProducts = (() => {
    if (!orders || orders.length === 0) return [];
    
    const productMap = new Map();
    
    orders.forEach((order) => {
      if (order.status === 'Paid' || order.status === 'Completed') {
        const orderItems = order.items || order.Items || [];
        orderItems.forEach((item) => {
          const medicineId = item.medicineId;
          const medicineName = item.medicineName;
          const quantity = item.quantity || 0;
          
          if (productMap.has(medicineId)) {
            const existing = productMap.get(medicineId);
            existing.totalQuantity += quantity;
            existing.orderCount += 1;
          } else {
            productMap.set(medicineId, {
              medicineId,
              medicineName,
              totalQuantity: quantity,
              orderCount: 1,
            });
          }
        });
      }
    });
    
    return Array.from(productMap.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .map(item => {
        const medicine = medicines.find(m => m.id === item.medicineId);
        return medicine ? { ...medicine, salesCount: item.totalQuantity } : null;
      })
      .filter(Boolean);
  })();

  // Get new medicines (created in last 7 days) - sorted from newest to oldest
  const newMedicines = medicines
    .filter(m => {
      if (!m.createdAt) return false;
      const createdDate = parseUTCDate(m.createdAt);
      if (!createdDate) return false;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return createdDate > sevenDaysAgo;
    })
    .sort((a, b) => {
      const dateA = parseUTCDate(a.createdAt);
      const dateB = parseUTCDate(b.createdAt);
      if (!dateA || !dateB) return 0;
      // Sort from newest to oldest (last to first)
      return dateB.getTime() - dateA.getTime();
    });

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = 200;
      categoryScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollBanners = (direction) => {
    if (bannerScrollRef.current) {
      const scrollAmount = 400;
      bannerScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    if (name.includes('skincare') || name.includes('skin care')) return faHandSparkles; 
    if (name.includes('drug') || name.includes('medicine') || name.includes('pharmaceutical')) return faPills;
    if (name.includes('baby') || name.includes('infant') || name.includes('child')) return faBaby;
    if (name.includes('men') || name.includes('male')) return faHeart;
    if (name.includes('women') || name.includes('female') || name.includes('lady')) return faHeart;
    if (name.includes('home') || name.includes('care') || name.includes('household')) return faHome;
    if (name.includes('makeup') || name.includes('beauty') || name.includes('cosmetic')) return faPalette;
    if (name.includes('wholesale') || name.includes('bulk') || name.includes('grocery')) return faBoxes;
    if (name.includes('vitamin') || name.includes('supplement')) return faCapsules;
    if (name.includes('injection') || name.includes('syringe')) return faSyringe;
    if (name.includes('bandage') || name.includes('wound') || name.includes('first aid')) return faBandage;
    if (name.includes('prescription') || name.includes('rx')) return faPrescriptionBottle;
    if (name.includes('liquid') || name.includes('syrup')) return faFlask;
    if (name.includes('immune') || name.includes('vaccine')) return faShieldVirus;
    return faPills; // Default icon
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Generate slug from category name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  // Get featured categories (categories with products, sorted by product count)
  const featuredCategories = categories
    .map(cat => ({
      ...cat,
      productCount: medicines.filter(m => m.categoryId === cat.id).length
    }))
    .filter(cat => cat.productCount > 0)
    .sort((a, b) => b.productCount - a.productCount)
    .slice(0, 5); // Show top 5 categories

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId.toString());
    // Scroll to medicines grid
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* New Arrivals Banner */}
      {newMedicines.length > 0 && (
        <div className="mb-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg overflow-hidden">
          <Link to="/new-arrivals" className="block">
            <div className="p-6 flex items-center justify-between text-white hover:bg-opacity-90 transition-all">
              <div className="flex items-center space-x-4">
                <div className="bg-white bg-opacity-20 rounded-full p-3">
                  <Sparkles className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">New Arrivals</h2>
                  <p className="text-purple-100 mt-1">
                    {newMedicines.length} new products - Check them out now!
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-lg font-semibold">
                <span>Shop Now</span>
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Featured Category Banners */}
      {featuredCategories.length > 0 && (
        <div className="mb-8">
          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={() => scrollBanners('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={() => scrollBanners('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>

            <div 
              ref={bannerScrollRef}
              className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide px-10"
            >
              {featuredCategories.map((category, index) => {
                const categoryIcon = getCategoryIcon(category.name);
                const categorySlug = generateSlug(category.name);
                const gradients = [
                  'from-green-500 to-emerald-600',
                  'from-pink-500 to-rose-600',
                  'from-blue-500 to-cyan-600',
                  'from-indigo-500 to-purple-600',
                  'from-orange-500 to-amber-600',
                ];
                const gradient = gradients[index % gradients.length];
                const textColors = [
                  'text-green-100',
                  'text-pink-100',
                  'text-blue-100',
                  'text-indigo-100',
                  'text-orange-100',
                ];
                const textColor = textColors[index % textColors.length];

                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`flex-shrink-0 w-full md:w-[500px] bg-gradient-to-r ${gradient} rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:scale-105 text-left`}
                  >
                    <div className="p-6 flex items-center justify-between text-white">
                      <div className="flex items-center space-x-4">
                        <div className="bg-white bg-opacity-20 rounded-full p-4">
                          <FontAwesomeIcon icon={categoryIcon} className="h-8 w-8" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold">{category.name}</h2>
                          <p className={`${textColor} mt-1`}>
                            {category.productCount} {category.productCount === 1 ? 'product' : 'products'} available
                            {category.description && ` - ${category.description.substring(0, 40)}${category.description.length > 40 ? '...' : ''}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-lg font-semibold">
                        <span>Shop Now</span>
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* All Products Section */}
      <div className="mb-12 pt-8 border-t border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
            <p className="text-gray-600">Browse our wide selection of pharmaceutical products</p>
          </div>
          {filteredMedicines.length > 8 && (
            <button
              onClick={() => setShowAllProducts(!showAllProducts)}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <span>{showAllProducts ? 'Show Less' : 'See All'}</span>
              {showAllProducts ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex-1 relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm"
            />
          </div>
        </div>

        {/* Shop By Category Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Tag className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Shop By Category</h2>
            </div>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory('')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear Filter
              </button>
            )}
          </div>
          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={() => scrollCategories('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={() => scrollCategories('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>

            <div 
              ref={categoryScrollRef}
              className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-10"
            >
              {/* All Categories Card */}
              <button
                onClick={() => setSelectedCategory('')}
                className={`flex-shrink-0 w-32 h-32 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center border-2 ${
                  selectedCategory === '' 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className={`p-3 rounded-full mb-2 ${
                  selectedCategory === '' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <FontAwesomeIcon 
                    icon={faPills} 
                    className={`text-2xl ${
                      selectedCategory === '' ? 'text-blue-600' : 'text-gray-600'
                    }`} 
                  />
                </div>
                <span className={`text-xs font-medium ${
                  selectedCategory === '' ? 'text-blue-600' : 'text-gray-700'
                }`}>
                  All Categories
                </span>
              </button>

              {/* Category Cards */}
              {categories.map((category) => {
                const categoryIcon = getCategoryIcon(category.name);
                const isSelected = selectedCategory === category.id.toString();

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id.toString())}
                    className={`flex-shrink-0 w-32 h-32 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center border-2 ${
                      isSelected 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className={`p-3 rounded-full mb-2 ${
                      isSelected ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <FontAwesomeIcon 
                        icon={categoryIcon} 
                        className={`text-2xl ${
                          isSelected ? 'text-blue-600' : 'text-gray-600'
                        }`} 
                      />
                    </div>
                    <span className={`text-xs font-medium text-center px-2 ${
                      isSelected ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      {category.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredMedicines.length === 0 ? (
          <div className="text-center py-12">
            <FontAwesomeIcon icon={faPills} className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(showAllProducts ? filteredMedicines : filteredMedicines.slice(0, 8)).map((medicine) => (
            <div
              key={medicine.id}
              className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col ${
                medicine.hasDiscount 
                  ? 'border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50' 
                  : 'border border-gray-100'
              }`}
            >
              {/* Medicine Image - Clickable */}
              <div 
                onClick={() => navigate(`/product/${medicine.id}`)}
                className={`h-48 flex items-center justify-center relative cursor-pointer ${
                  medicine.hasDiscount 
                    ? 'bg-gradient-to-br from-red-100 to-orange-100' 
                    : 'bg-gradient-to-br from-blue-50 to-indigo-100'
                }`}
              >
                {medicine.hasDiscount && (
                  <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
                    {medicine.discountPercentage}% OFF
                  </div>
                )}
                {medicine.imageUrl ? (
                  <img
                    src={medicine.imageUrl}
                    alt={medicine.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FontAwesomeIcon icon={faPills} className={`h-20 w-20 ${medicine.hasDiscount ? 'text-red-400' : 'text-blue-400'}`} />
                )}
              </div>

              {/* Medicine Info */}
              <div className="p-5 flex flex-col flex-grow">
                <div 
                  onClick={() => navigate(`/product/${medicine.id}`)}
                  className="mb-2 cursor-pointer"
                >
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 hover:text-blue-600 transition-colors">
                    {medicine.name}
                  </h3>
                  {medicine.categoryName && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
                      {medicine.categoryName}
                    </span>
                  )}
                </div>

                {medicine.description && (
                  <p 
                    onClick={() => navigate(`/product/${medicine.id}`)}
                    className="text-sm text-gray-600 line-clamp-2 mb-3 cursor-pointer hover:text-gray-900 transition-colors"
                  >
                    {medicine.description}
                  </p>
                )}

                <div 
                  onClick={() => navigate(`/product/${medicine.id}`)}
                  className="flex items-center justify-between mb-4 cursor-pointer"
                >
                  <div>
                    {medicine.hasDiscount && medicine.originalPrice ? (
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-2xl font-bold text-red-600">
                            ${medicine.unitPrice.toFixed(2)}
                          </p>
                          <p className="text-lg font-medium text-gray-400 line-through">
                            ${medicine.originalPrice.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-xs font-semibold text-red-600 mt-1">
                          Save ${(medicine.originalPrice - medicine.unitPrice).toFixed(2)}!
                        </p>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">
                        ${medicine.unitPrice.toFixed(2)}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Stock: {medicine.totalStock} units
                    </p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(medicine.id);
                  }}
                  disabled={addingToCart[medicine.id] || medicine.totalStock === 0}
                  className={`w-full flex items-center justify-center space-x-2 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium mt-auto ${
                    medicine.hasDiscount
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-md'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {addingToCart[medicine.id] ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      <span>
                        {medicine.totalStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* New Arrivals Section */}
      {newMedicines.length > 0 && (
        <div className="mb-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
            </div>
            {newMedicines.length > 4 && (
              <button
                onClick={() => setShowAllNewArrivals(!showAllNewArrivals)}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <span>{showAllNewArrivals ? 'Show Less' : 'See All'}</span>
                {showAllNewArrivals ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(showAllNewArrivals ? newMedicines : newMedicines.slice(0, 4)).map((medicine) => (
              <div
                key={medicine.id}
                className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col ${
                  medicine.hasDiscount 
                    ? 'border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50' 
                    : 'border border-gray-100'
                }`}
              >
                <div 
                  onClick={() => navigate(`/product/${medicine.id}`)}
                  className={`h-48 flex items-center justify-center relative cursor-pointer ${
                    medicine.hasDiscount 
                      ? 'bg-gradient-to-br from-red-100 to-orange-100' 
                      : 'bg-gradient-to-br from-purple-50 to-pink-100'
                  }`}
                >
                  {medicine.imageUrl ? (
                    <img
                      src={medicine.imageUrl}
                      alt={medicine.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faPills} className={`h-20 w-20 ${medicine.hasDiscount ? 'text-red-400' : 'text-purple-400'}`} />
                  )}
                  <div className="absolute top-2 left-2 bg-purple-500 text-white px-2 py-1 rounded text-xs font-bold z-10">
                    NEW
                  </div>
                  {medicine.hasDiscount && (
                    <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
                      {medicine.discountPercentage}% OFF
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <div 
                    onClick={() => navigate(`/product/${medicine.id}`)}
                    className="mb-2 cursor-pointer"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 hover:text-purple-600 transition-colors">
                      {medicine.name}
                    </h3>
                    {medicine.categoryName && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs font-medium text-purple-600 bg-purple-50 rounded-full">
                        {medicine.categoryName}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    {medicine.hasDiscount && medicine.originalPrice ? (
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-2xl font-bold text-red-600">
                            ${medicine.unitPrice.toFixed(2)}
                          </p>
                          <p className="text-lg font-medium text-gray-400 line-through">
                            ${medicine.originalPrice.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-xs font-semibold text-red-600 mt-1">
                          Save ${(medicine.originalPrice - medicine.unitPrice).toFixed(2)}!
                        </p>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">
                        ${medicine.unitPrice.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(medicine.id);
                    }}
                    disabled={addingToCart[medicine.id] || medicine.totalStock === 0}
                    className={`w-full flex items-center justify-center space-x-2 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium mt-auto ${
                      medicine.hasDiscount
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-md'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {addingToCart[medicine.id] ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4" />
                        <span>{medicine.totalStock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best Selling Products Section */}
      {bestSellingProducts.length > 0 && (
        <div className="mb-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Best Selling Products</h2>
            </div>
            {bestSellingProducts.length > 4 && (
              <button
                onClick={() => setShowAllBestSelling(!showAllBestSelling)}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <span>{showAllBestSelling ? 'Show Less' : 'See All'}</span>
                {showAllBestSelling ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(showAllBestSelling ? bestSellingProducts : bestSellingProducts.slice(0, 4)).map((medicine) => {
              const rank = bestSellingProducts.indexOf(medicine) + 1;
              return (
              <div
                key={medicine.id}
                className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col ${
                  medicine.hasDiscount 
                    ? 'border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50' 
                    : 'border border-gray-100'
                }`}
              >
                <div 
                  onClick={() => navigate(`/product/${medicine.id}`)}
                  className={`h-48 flex items-center justify-center relative cursor-pointer ${
                    medicine.hasDiscount 
                      ? 'bg-gradient-to-br from-red-100 to-orange-100' 
                      : 'bg-gradient-to-br from-blue-50 to-indigo-100'
                  }`}
                >
                  {medicine.imageUrl ? (
                    <img
                      src={medicine.imageUrl}
                      alt={medicine.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faPills} className={`h-20 w-20 ${medicine.hasDiscount ? 'text-red-400' : 'text-blue-400'}`} />
                  )}
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold z-10">
                    #{rank} Best Seller
                  </div>
                  {medicine.hasDiscount && (
                    <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
                      {medicine.discountPercentage}% OFF
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <div 
                    onClick={() => navigate(`/product/${medicine.id}`)}
                    className="mb-2 cursor-pointer"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 hover:text-blue-600 transition-colors">
                      {medicine.name}
                    </h3>
                    {medicine.categoryName && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
                        {medicine.categoryName}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    {medicine.salesCount} units sold
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    {medicine.hasDiscount && medicine.originalPrice ? (
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-2xl font-bold text-red-600">
                            ${medicine.unitPrice.toFixed(2)}
                          </p>
                          <p className="text-lg font-medium text-gray-400 line-through">
                            ${medicine.originalPrice.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-xs font-semibold text-red-600 mt-1">
                          Save ${(medicine.originalPrice - medicine.unitPrice).toFixed(2)}!
                        </p>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">
                        ${medicine.unitPrice.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(medicine.id);
                    }}
                    disabled={addingToCart[medicine.id] || medicine.totalStock === 0}
                    className={`w-full flex items-center justify-center space-x-2 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium mt-auto ${
                      medicine.hasDiscount
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-md'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {addingToCart[medicine.id] ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4" />
                        <span>{medicine.totalStock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default MedicineList;


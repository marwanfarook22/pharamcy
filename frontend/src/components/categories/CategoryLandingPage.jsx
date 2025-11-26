import { useState, useEffect } from 'react';
import { medicinesAPI, categoriesAPI, cartAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { ShoppingCart, Search, ArrowLeft, Package, CheckCircle } from 'lucide-react';
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
import { useNavigate, useParams, Link } from 'react-router-dom';

const CategoryLandingPage = () => {
  const { categorySlug } = useParams();
  const [medicines, setMedicines] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [addingToCart, setAddingToCart] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  // Helper function to generate slug from category name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  useEffect(() => {
    fetchCategoryAndMedicines();
  }, [categorySlug]);

  const fetchCategoryAndMedicines = async () => {
    try {
      setLoading(true);
      
      // Fetch all categories
      const categoriesResponse = await categoriesAPI.getAll();
      const categories = categoriesResponse.data || [];
      
      // Find matching category by slug (convert category name to slug and compare)
      let matchingCategory = categories.find(cat => {
        const catSlug = generateSlug(cat.name);
        return catSlug === categorySlug;
      });
      
      // If no match by slug, try to find by ID (if categorySlug is numeric)
      if (!matchingCategory && !isNaN(categorySlug)) {
        matchingCategory = categories.find(cat => cat.id === parseInt(categorySlug));
      }
      
      // If still no match, try partial name matching (split slug into words and match)
      if (!matchingCategory) {
        const slugWords = categorySlug.split('-').filter(w => w.length > 0);
        if (slugWords.length > 0) {
          matchingCategory = categories.find(cat => {
            const catName = cat.name.toLowerCase();
            // Check if all slug words appear in category name
            return slugWords.every(word => catName.includes(word));
          });
        }
      }
      
      // If still no match, try fuzzy matching (at least some words match)
      if (!matchingCategory) {
        const slugWords = categorySlug.split('-').filter(w => w.length > 0);
        if (slugWords.length > 0) {
          matchingCategory = categories.find(cat => {
            const catName = cat.name.toLowerCase();
            // Check if any slug word appears in category name
            return slugWords.some(word => catName.includes(word));
          });
        }
      }
      
      if (matchingCategory) {
        setCategory(matchingCategory);
        
        // Fetch medicines for this category
        const medicinesResponse = await medicinesAPI.getAll(matchingCategory.id);
        setMedicines(medicinesResponse.data || []);
      } else {
        // Category not found
        setCategory(null);
        setMedicines([]);
        console.log('Category not found. Slug:', categorySlug, 'Available categories:', categories.map(c => ({ id: c.id, name: c.name, slug: generateSlug(c.name) })));
      }
    } catch (error) {
      toast.error('Failed to load category products');
      console.error('Error fetching category:', error);
      setCategory(null);
      setMedicines([]);
    } finally {
      setLoading(false);
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

  // Filter medicines
  const filteredMedicines = medicines.filter((medicine) => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!medicine.name.toLowerCase().includes(searchLower) &&
          !medicine.description?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Stock filter
    if (stockFilter === 'inStock' && medicine.totalStock === 0) {
      return false;
    }
    if (stockFilter === 'outOfStock' && medicine.totalStock > 0) {
      return false;
    }

    // Price filter
    if (priceFilter === 'low' && medicine.unitPrice > 20) {
      return false;
    }
    if (priceFilter === 'medium' && (medicine.unitPrice <= 20 || medicine.unitPrice > 50)) {
      return false;
    }
    if (priceFilter === 'high' && medicine.unitPrice <= 50) {
      return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Get category config dynamically
  const categoryIcon = category ? getCategoryIcon(category.name) : faPills;
  const categoryGradient = category ? getCategoryGradient(category.name) : 'from-blue-500 to-indigo-600';
  const categoryName = category?.name || 'Category';
  const categoryDescription = category?.description || 'Browse our products in this category';
  const categoryTagline = categoryDescription.length > 60 
    ? categoryDescription.substring(0, 60) + '...' 
    : categoryDescription;

  if (!category && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Banner */}
      <div className={`bg-gradient-to-r ${categoryGradient} text-white py-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center text-white hover:text-gray-200 mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="bg-white bg-opacity-20 rounded-full p-4 mr-4">
                  <FontAwesomeIcon 
                    icon={categoryIcon} 
                    className="text-4xl text-white" 
                  />
                </div>
                <div>
                  <h1 className="text-5xl font-bold mb-2">{categoryName}</h1>
                  <p className="text-xl text-white text-opacity-90">{categoryTagline}</p>
                </div>
              </div>
              {categoryDescription && (
                <p className="text-lg mt-4 text-white text-opacity-80 max-w-2xl">
                  {categoryDescription}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700 font-semibold">
                  {filteredMedicines.length} {filteredMedicines.length === 1 ? 'Product' : 'Products'}
                </span>
              </div>
              {category && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">
                    {medicines.filter(m => m.totalStock > 0).length} In Stock
                  </span>
                </div>
              )}
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Stock</option>
                <option value="inStock">In Stock</option>
                <option value="outOfStock">Out of Stock</option>
              </select>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="all">All Prices</option>
                <option value="low">Under $20</option>
                <option value="medium">$20 - $50</option>
                <option value="high">Over $50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredMedicines.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <FontAwesomeIcon icon={categoryIcon} className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || stockFilter !== 'all' || priceFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : `No products available in ${categoryName} category`}
            </p>
            {(searchTerm || stockFilter !== 'all' || priceFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStockFilter('all');
                  setPriceFilter('all');
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMedicines.map((medicine) => (
              <div
                key={medicine.id}
                className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col ${
                  medicine.hasDiscount 
                    ? 'border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50' 
                    : 'border border-gray-100'
                }`}
              >
                {/* Medicine Image */}
                <div 
                  onClick={() => navigate(`/product/${medicine.id}`)}
                  className={`h-48 flex items-center justify-center relative cursor-pointer ${
                    medicine.hasDiscount 
                      ? 'bg-gradient-to-br from-red-100 to-orange-100' 
                      : 'bg-gradient-to-br from-gray-50 to-gray-100'
                  }`}
                >
                  {medicine.hasDiscount && (
                    <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
                      {medicine.discountPercentage}% OFF
                    </div>
                  )}
                  {medicine.totalStock === 0 && (
                    <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      Out of Stock
                    </div>
                  )}
                  {medicine.imageUrl ? (
                    <img
                      src={medicine.imageUrl}
                      alt={medicine.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FontAwesomeIcon icon={categoryIcon} className={`h-20 w-20 ${medicine.hasDiscount ? 'text-red-400' : 'text-gray-400'}`} />
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
                        : `bg-gradient-to-r ${categoryGradient} hover:opacity-90`
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
    </div>
  );
};

export default CategoryLandingPage;


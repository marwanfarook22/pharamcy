import { useState, useEffect } from 'react';
import { brandsAPI, medicinesAPI, cartAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { Tag, ShoppingCart, Search, Filter, X, Package, DollarSign, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const BrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // all, inStock, outOfStock
  const [priceFilter, setPriceFilter] = useState('all'); // all, low, medium, high
  const [showFilters, setShowFilters] = useState(false);
  const [addingToCart, setAddingToCart] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBrands();
    fetchMedicines();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await brandsAPI.getAll();
      setBrands(response.data);
    } catch (error) {
      toast.error('Failed to load brands');
      console.error(error);
    }
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await medicinesAPI.getAll();
      setMedicines(response.data);
    } catch (error) {
      toast.error('Failed to load medicines');
      console.error(error);
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
      const cartResponse = await cartAPI.getCart();
      const cart = cartResponse.data;

      const existingItem = cart.items?.find(item => item.medicineId === medicineId);

      if (existingItem) {
        await cartAPI.updateItem(existingItem.id, {
          quantity: existingItem.quantity + quantity
        });
        toast.success('Item quantity updated in cart');
      } else {
        await cartAPI.addItem({
          medicineId,
          quantity
        });
        toast.success('Item added to cart');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add item to cart');
    } finally {
      setAddingToCart({ ...addingToCart, [medicineId]: false });
    }
  };

  // Filter medicines
  const filteredMedicines = medicines.filter(medicine => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!medicine.name.toLowerCase().includes(searchLower) &&
          !medicine.description?.toLowerCase().includes(searchLower) &&
          !medicine.brandName?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Brand filter
    if (selectedBrand && medicine.brandId !== parseInt(selectedBrand)) {
      return false;
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

  // Group filtered medicines by brand
  const medicinesByBrand = filteredMedicines.reduce((acc, medicine) => {
    if (!medicine.brandId) return acc;
    const brandId = medicine.brandId;
    if (!acc[brandId]) {
      const brand = brands.find(b => b.id === brandId);
      if (brand) {
        acc[brandId] = {
          brand,
          medicines: []
        };
      }
    }
    if (acc[brandId]) {
      acc[brandId].medicines.push(medicine);
    }
    return acc;
  }, {});

  const activeFiltersCount = [
    selectedBrand,
    stockFilter !== 'all',
    priceFilter !== 'all'
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedBrand('');
    setStockFilter('all');
    setPriceFilter('all');
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Simple Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Shop by Brand</h1>
          <p className="text-gray-600 text-sm">Browse medicines organized by brand</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search medicines or brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">All Brands</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stock Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Status</label>
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="all">All Products</option>
                    <option value="inStock">In Stock</option>
                    <option value="outOfStock">Out of Stock</option>
                  </select>
                </div>

                {/* Price Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <select
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="all">All Prices</option>
                    <option value="low">Under $20</option>
                    <option value="medium">$20 - $50</option>
                    <option value="high">Over $50</option>
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-4 flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  <X className="h-4 w-4" />
                  <span>Clear all filters</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredMedicines.length} {filteredMedicines.length === 1 ? 'product' : 'products'}
          {selectedBrand && ` from ${brands.find(b => b.id === parseInt(selectedBrand))?.name}`}
        </div>

        {/* Brands Sections */}
        {Object.keys(medicinesByBrand).length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || activeFiltersCount > 0 
                ? 'Try adjusting your search or filters' 
                : 'No products available'}
            </p>
            {(searchTerm || activeFiltersCount > 0) && (
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.values(medicinesByBrand).map(({ brand, medicines: brandMedicines }) => (
              <div key={brand.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Simple Brand Header */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Tag className="h-5 w-5 text-blue-600" />
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">{brand.name}</h2>
                        <p className="text-xs text-gray-500">{brandMedicines.length} products</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {brandMedicines.map((medicine) => (
                      <div
                        key={medicine.id}
                        className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow border border-gray-200"
                      >
                        <Link to={`/product/${medicine.id}`}>
                          <div className="relative h-32 bg-white flex items-center justify-center overflow-hidden">
                            {medicine.imageUrl ? (
                              <img
                                src={medicine.imageUrl}
                                alt={medicine.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className="hidden absolute inset-0 bg-gray-100 items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                            {medicine.totalStock === 0 && (
                              <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">
                                Out
                              </div>
                            )}
                          </div>
                        </Link>

                        <div className="p-3">
                          <Link to={`/product/${medicine.id}`}>
                            <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2 hover:text-blue-600 transition-colors">
                              {medicine.name}
                            </h3>
                          </Link>

                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-bold text-gray-900">
                              ${medicine.unitPrice.toFixed(2)}
                            </p>
                            {medicine.totalStock > 0 && (
                              <span className="text-xs text-green-600 flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                In Stock
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleAddToCart(medicine.id)}
                            disabled={medicine.totalStock === 0 || addingToCart[medicine.id]}
                            className={`w-full flex items-center justify-center space-x-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                              medicine.totalStock === 0
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : addingToCart[medicine.id]
                                ? 'bg-blue-400 text-white cursor-wait'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {addingToCart[medicine.id] ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                <span>Adding...</span>
                              </>
                            ) : medicine.totalStock === 0 ? (
                              <span>Out of Stock</span>
                            ) : (
                              <>
                                <ShoppingCart className="h-3 w-3" />
                                <span>Add</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandsPage;

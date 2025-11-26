import { useState, useEffect } from 'react';
import { medicinesAPI, cartAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { ShoppingCart, Search, Tag, Percent } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPills } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const FiftyPercentOfferPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [addingToCart, setAddingToCart] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOfferedProducts();
  }, []);

  const fetchOfferedProducts = async () => {
    try {
      setLoading(true);
      const response = await medicinesAPI.getAll();
      // Filter only products with 50% discount
      const offeredProducts = response.data
        .filter(m => m.hasDiscount && m.discountPercentage === 50)
        .sort((a, b) => {
          // Sort by discount amount (highest savings first)
          const savingsA = (a.originalPrice || 0) - a.unitPrice;
          const savingsB = (b.originalPrice || 0) - b.unitPrice;
          return savingsB - savingsA;
        });
      setMedicines(offeredProducts);
    } catch (error) {
      toast.error('Failed to load 50% offer products');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex items-center justify-center mb-4">
            <Percent className="h-16 w-16 mr-4 animate-bounce" />
            <h1 className="text-6xl font-bold">50% OFF SALE</h1>
            <Percent className="h-16 w-16 ml-4 animate-bounce" />
          </div>
          <p className="text-3xl mt-4 text-red-100 font-semibold">
            Massive Discounts on Near Expiry Products!
          </p>
          <p className="text-xl mt-3 text-red-200">
            Limited Time Offer - Don't Miss Out!
          </p>
          <div className="mt-6 inline-flex items-center px-6 py-3 bg-white bg-opacity-20 rounded-full backdrop-blur-sm">
            <Tag className="h-6 w-6 mr-2" />
            <span className="text-lg font-bold">{filteredMedicines.length} Products on Sale</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex-1 relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search 50% off products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border-2 border-red-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm shadow-md"
            />
          </div>
        </div>

        {/* Products Count Badge */}
        <div className="mb-6 text-center">
          <span className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full text-lg font-bold shadow-lg">
            <Tag className="h-5 w-5 mr-2" />
            {filteredMedicines.length} Products Available at 50% OFF
          </span>
        </div>

        {/* Medicines Grid */}
        {filteredMedicines.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-md border-2 border-red-200">
            <FontAwesomeIcon icon={faPills} className="mx-auto h-16 w-16 text-red-400 mb-4" />
            <h3 className="mt-2 text-2xl font-bold text-gray-900">No 50% Off Products Available</h3>
            <p className="mt-3 text-lg text-gray-600">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Check back later for amazing deals!'}
            </p>
            {!searchTerm && (
              <p className="mt-2 text-sm text-gray-500">
                Products with near expiry dates will appear here when resolved by admin.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMedicines.map((medicine) => (
              <div
                key={medicine.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50 transform hover:scale-105"
              >
                {/* Medicine Image - Clickable */}
                <div 
                  onClick={() => navigate(`/product/${medicine.id}`)}
                  className="h-48 bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center relative cursor-pointer overflow-hidden"
                >
                  {medicine.imageUrl ? (
                    <img
                      src={medicine.imageUrl}
                      alt={medicine.name}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faPills} className="h-20 w-20 text-red-400" />
                  )}
                  {/* 50% OFF Badge */}
                  <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl animate-pulse border-2 border-white">
                    50% OFF
                  </div>
                  {/* Sale Ribbon */}
                  <div className="absolute top-0 left-0 bg-red-600 text-white px-4 py-1 text-xs font-bold transform -rotate-12 origin-top-left shadow-md">
                    SALE
                  </div>
                </div>

                {/* Medicine Info */}
                <div className="p-5 flex flex-col flex-grow">
                  <div 
                    onClick={() => navigate(`/product/${medicine.id}`)}
                    className="mb-2 cursor-pointer"
                  >
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1 hover:text-red-600 transition-colors">
                      {medicine.name}
                    </h3>
                    {medicine.categoryName && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full">
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
                    <div className="flex-1">
                      {medicine.originalPrice ? (
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="text-3xl font-bold text-red-600">
                              ${medicine.unitPrice.toFixed(2)}
                            </p>
                            <p className="text-xl font-medium text-gray-400 line-through">
                              ${medicine.originalPrice.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
                              Save ${(medicine.originalPrice - medicine.unitPrice).toFixed(2)}!
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-3xl font-bold text-red-600">
                          ${medicine.unitPrice.toFixed(2)}
                        </p>
                      )}
                      <p className="text-xs text-gray-600 mt-2">
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
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 px-4 rounded-lg hover:from-red-700 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold mt-auto shadow-lg transform hover:scale-105 active:scale-95"
                  >
                    {addingToCart[medicine.id] ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5" />
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

export default FiftyPercentOfferPage;


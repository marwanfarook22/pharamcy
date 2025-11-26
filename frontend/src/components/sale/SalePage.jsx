import { useState, useEffect } from 'react';
import { medicinesAPI, cartAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { ShoppingCart, Search, Sparkles } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPills } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { parseUTCDate } from '../../utils/dateUtils';

const SalePage = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [addingToCart, setAddingToCart] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNewArrivals();
  }, []);

  const fetchNewArrivals = async () => {
    try {
      setLoading(true);
      const response = await medicinesAPI.getAll();
      // Filter only new medicines (created in last 7 days)
      const newMedicines = response.data
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
          // Sort from newest to oldest
          return dateB.getTime() - dateA.getTime();
        });
      setMedicines(newMedicines);
    } catch (error) {
      toast.error('Failed to load new arrivals');
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-12 w-12 mr-3 animate-pulse" />
            <h1 className="text-5xl font-bold">New Arrivals</h1>
            <Sparkles className="h-12 w-12 ml-3 animate-pulse" />
          </div>
          <p className="text-2xl mt-4 text-purple-100">
            Discover Our Latest Products!
          </p>
          <p className="text-lg mt-2 text-purple-200">
            Fresh products added in the last 7 days
          </p>
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
              placeholder="Search new arrivals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm shadow-sm"
            />
          </div>
        </div>

        {/* New Arrivals Count Badge */}
        <div className="mb-6 text-center">
          <span className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
            <Sparkles className="h-4 w-4 mr-2" />
            {filteredMedicines.length} New Products
          </span>
        </div>

        {/* Medicines Grid */}
        {filteredMedicines.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <FontAwesomeIcon icon={faPills} className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No new arrivals found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Check back later for new products!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMedicines.map((medicine) => (
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
                      : 'bg-gradient-to-br from-purple-50 to-pink-100'
                  }`}
                >
                  <div className="absolute top-2 left-2 z-10 bg-purple-500 text-white px-2 py-1 rounded text-xs font-bold">
                    NEW
                  </div>
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
                    <FontAwesomeIcon icon={faPills} className={`h-20 w-20 ${medicine.hasDiscount ? 'text-red-400' : 'text-purple-400'}`} />
                  )}
                </div>

                {/* Medicine Info */}
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

export default SalePage;


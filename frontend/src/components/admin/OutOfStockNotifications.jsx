import { useState, useEffect } from 'react';
import { medicinesAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  AlertTriangle, 
  Package, 
  Search,
  RefreshCw,
  TrendingDown,
  X,
  Plus,
  Edit
} from 'lucide-react';
const OutOfStockNotifications = ({ onAddStock }) => {
  const [outOfStockMedicines, setOutOfStockMedicines] = useState([]);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('out-of-stock'); // 'out-of-stock' or 'low-stock'
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  useEffect(() => {
    fetchOutOfStockMedicines();
    fetchLowStockMedicines();
  }, [lowStockThreshold]);

  const fetchOutOfStockMedicines = async () => {
    try {
      setLoading(true);
      const response = await medicinesAPI.getOutOfStock();
      setOutOfStockMedicines(response.data || []);
    } catch (error) {
      toast.error('Failed to load out-of-stock medicines');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStockMedicines = async () => {
    try {
      const response = await medicinesAPI.getLowStock(lowStockThreshold);
      setLowStockMedicines(response.data || []);
    } catch (error) {
      toast.error('Failed to load low-stock medicines');
      console.error(error);
    }
  };

  const handleRefresh = () => {
    fetchOutOfStockMedicines();
    fetchLowStockMedicines();
  };

  const handleAddStock = (medicineId) => {
    if (onAddStock) {
      onAddStock(medicineId);
    }
  };

  const handleEditMedicine = (medicineId) => {
    // Navigate to medicine management for editing
    if (onAddStock) {
      // For now, we'll use the same callback but could add a separate one for editing
      onAddStock(medicineId);
    }
  };

  const filteredOutOfStock = outOfStockMedicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.brandName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLowStock = lowStockMedicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.brandName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <AlertTriangle className="h-7 w-7 text-red-600" />
            <span>Stock Notifications</span>
          </h2>
          <p className="text-gray-600 mt-1">Monitor out-of-stock and low-stock products</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-5 w-5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('out-of-stock')}
          className={`flex-1 px-6 py-3 rounded-md font-medium text-sm transition-all duration-200 ${
            activeTab === 'out-of-stock'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <X className="h-5 w-5" />
            <span>Out of Stock</span>
            {outOfStockMedicines.length > 0 && (
              <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs font-bold">
                {outOfStockMedicines.length}
              </span>
            )}
          </div>
        </button>
        <button
          onClick={() => setActiveTab('low-stock')}
          className={`flex-1 px-6 py-3 rounded-md font-medium text-sm transition-all duration-200 ${
            activeTab === 'low-stock'
              ? 'bg-white text-yellow-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <TrendingDown className="h-5 w-5" />
            <span>Low Stock</span>
            {lowStockMedicines.length > 0 && (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-bold">
                {lowStockMedicines.length}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Low Stock Threshold */}
      {activeTab === 'low-stock' && (
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Low Stock Threshold
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="number"
              min="1"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 10)}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">
              Products with stock ≤ {lowStockThreshold} units will be shown
            </span>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search by name, category, or brand..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Out of Stock Tab */}
      {activeTab === 'out-of-stock' && (
        <div>
          {filteredOutOfStock.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">No out-of-stock products</p>
              <p className="text-gray-500 text-sm mt-2">All products are in stock!</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-red-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
                        Brand
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOutOfStock.map((medicine) => (
                      <tr key={medicine.id} className="hover:bg-red-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {medicine.imageUrl ? (
                              <img
                                src={medicine.imageUrl}
                                alt={medicine.name}
                                className="h-12 w-12 rounded-lg object-cover mr-3"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                                }}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center mr-3">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {medicine.name}
                              </div>
                              {medicine.description && (
                                <div className="text-xs text-gray-500 truncate max-w-xs">
                                  {medicine.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {medicine.categoryName || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {medicine.brandName || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">
                            ${medicine.unitPrice.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <X className="h-3 w-3 mr-1" />
                            Out of Stock
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleAddStock(medicine.id)}
                              className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                              title="Add Stock"
                            >
                              <Plus className="h-4 w-4" />
                              <span>Add Stock</span>
                            </button>
                            <button
                              onClick={() => handleEditMedicine(medicine.id)}
                              className="text-gray-600 hover:text-gray-900"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Low Stock Tab */}
      {activeTab === 'low-stock' && (
        <div>
          {filteredLowStock.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium">No low-stock products</p>
              <p className="text-gray-500 text-sm mt-2">
                All products have stock above {lowStockThreshold} units
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-yellow-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">
                        Brand
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">
                        Batches
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-yellow-800 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLowStock.map((medicine) => (
                      <tr key={medicine.id} className="hover:bg-yellow-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {medicine.imageUrl ? (
                              <img
                                src={medicine.imageUrl}
                                alt={medicine.name}
                                className="h-12 w-12 rounded-lg object-cover mr-3"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                                }}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center mr-3">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {medicine.name}
                              </div>
                              {medicine.description && (
                                <div className="text-xs text-gray-500 truncate max-w-xs">
                                  {medicine.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {medicine.categoryName || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {medicine.brandName || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">
                            ${medicine.unitPrice.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            medicine.totalStock <= 5
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            <TrendingDown className="h-3 w-3 mr-1" />
                            {medicine.totalStock} units
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {medicine.batchCount} batch{medicine.batchCount !== 1 ? 'es' : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleAddStock(medicine.id)}
                              className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                              title="Add Stock"
                            >
                              <Plus className="h-4 w-4" />
                              <span>Add Stock</span>
                            </button>
                            <button
                              onClick={() => handleEditMedicine(medicine.id)}
                              className="text-gray-600 hover:text-gray-900"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-800">Out of Stock</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {outOfStockMedicines.length}
              </p>
              <p className="text-xs text-red-600 mt-1">products need restocking</p>
            </div>
            <div className="bg-red-100 rounded-full p-4">
              <X className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">Low Stock</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {lowStockMedicines.length}
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                products below {lowStockThreshold} units
              </p>
            </div>
            <div className="bg-yellow-100 rounded-full p-4">
              <TrendingDown className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutOfStockNotifications;


import { useState, useEffect } from 'react';
import { medicinesAPI, categoriesAPI, brandsAPI, batchesAPI, suppliersAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  Pill, 
  Plus, 
  Edit,   
  Trash2, 
  Search, 
  Filter,
  Package,
  DollarSign,
  PlusCircle,
  X,
  Save,
  Check
} from 'lucide-react';
import { MEDICINE_IMAGES } from '../../utils/medicineImages';

const MedicineManagement = ({ initialIncrementMedicineId, onIncrementComplete }) => {
    const [medicines, setMedicines] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showIncrementModal, setShowIncrementModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    brandId: '',
    unitPrice: '',
    imageUrl: '',
  });
  const [incrementData, setIncrementData] = useState({
    quantity: '',
    batchNumber: '',
    expiryDate: '',
    supplierId: '',
    purchaseDate: '',
    unitCost: '',
  });

  useEffect(() => {
    fetchMedicines();
    fetchCategories();
    fetchBrands();
    fetchSuppliers();
  }, [categoryFilter, searchTerm]);

  // Handle initial increment medicine ID from parent
  useEffect(() => {
    if (initialIncrementMedicineId && medicines.length > 0) {
      const medicine = medicines.find(m => m.id === initialIncrementMedicineId);
      if (medicine) {
        setSelectedMedicine(medicine);
        resetIncrementForm();
        setShowIncrementModal(true);
        if (onIncrementComplete) {
          onIncrementComplete();
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialIncrementMedicineId, medicines]);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await medicinesAPI.getAll(
        categoryFilter ? parseInt(categoryFilter) : null
      );
      let filtered = response.data;
      if (searchTerm) {
        filtered = filtered.filter(m => 
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      setMedicines(filtered);
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

  const fetchBrands = async () => {
    try {
      const response = await brandsAPI.getAll();
      setBrands(response.data);
    } catch (error) {
      console.error('Failed to load brands');
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await suppliersAPI.getAll();
      setSuppliers(response.data);
    } catch (error) {
      console.error('Failed to load suppliers');
    }
  };

  const handleCreateMedicine = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.unitPrice) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const createData = {
        name: formData.name,
        description: formData.description || null,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        brandId: formData.brandId ? parseInt(formData.brandId) : null,
        unitPrice: parseFloat(formData.unitPrice),
        imageUrl: formData.imageUrl || null,
      };

      await medicinesAPI.create(createData);
      toast.success('Medicine created successfully')
      setShowCreateModal(false);
      resetForm();
      fetchMedicines();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create medicine');
    }
  };

  const handleUpdateMedicine = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.unitPrice) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const updateData = {
        name: formData.name,
        description: formData.description || null,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        brandId: formData.brandId ? parseInt(formData.brandId) : null,
        unitPrice: parseFloat(formData.unitPrice),
        imageUrl: formData.imageUrl || null,
      };

      await medicinesAPI.update(selectedMedicine.id, updateData);
      toast.success('Medicine updated successfully');
      setShowEditModal(false);
      resetForm();
      fetchMedicines();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update medicine');
    }
  };

  const handleIncrementQuantity = async (e) => {
    e.preventDefault();
    
    if (!incrementData.quantity || parseFloat(incrementData.quantity) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    try {
      // Check if medicine has batches
      const batchesResponse = await batchesAPI.getAll(selectedMedicine.id);
      const batches = batchesResponse.data;

      // If batch details are provided (batch number AND expiry date), create a new batch
      const hasBatchDetails = incrementData.batchNumber && incrementData.expiryDate;

      if (hasBatchDetails) {
        // Create a new batch with the provided details
        const batchData = {
          medicineId: selectedMedicine.id,
          batchNumber: incrementData.batchNumber,
          expiryDate: incrementData.expiryDate,
          quantity: parseInt(incrementData.quantity),
          supplierId: incrementData.supplierId ? parseInt(incrementData.supplierId) : null,
          purchaseDate: incrementData.purchaseDate || null,
          unitCost: incrementData.unitCost ? parseFloat(incrementData.unitCost) : 0,
        };

        await batchesAPI.create(batchData);
        toast.success('New batch created and quantity added');
      } else if (batches.length === 0) {
        // No batches exist and no batch details provided
        toast.error('Please provide batch number and expiry date to create a new batch');
        return;
      } else {
        // No batch details provided but batches exist, increment existing batch
        await batchesAPI.incrementQuantityByMedicine(selectedMedicine.id, {
          quantity: parseInt(incrementData.quantity),
        });
        toast.success('Quantity incremented successfully');
      }

      setShowIncrementModal(false);
      resetIncrementForm();
      fetchMedicines();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to increment quantity');
    }
  };

  const handleDeleteMedicine = async (medicineId) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) {
      return;
    }

    try {
      await medicinesAPI.delete(medicineId);
      toast.success('Medicine deleted successfully');
      fetchMedicines();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete medicine');
    }
  };

  const openEditModal = (medicine) => {
    setSelectedMedicine(medicine);
    setFormData({
      name: medicine.name,
      description: medicine.description || '',
      categoryId: medicine.categoryId?.toString() || '',
      brandId: medicine.brandId?.toString() || '',
      unitPrice: medicine.unitPrice.toString(),
      imageUrl: medicine.imageUrl || '',
    });
    setShowEditModal(true);
  };

  const openIncrementModal = (medicine) => {
    setSelectedMedicine(medicine);
    resetIncrementForm();
    setShowIncrementModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      categoryId: '',
      brandId: '',
      unitPrice: '',
      imageUrl: '',
    });
    setSelectedMedicine(null);
  };

  const resetIncrementForm = () => {
    setIncrementData({
      quantity: '',
      batchNumber: '',
      expiryDate: '',
      supplierId: '',
      purchaseDate: '',
      unitCost: '',
    });
  };

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
            <Pill className="h-6 w-6" />
            <span>Medicine Management</span>
          </h2>
          <p className="text-gray-600 mt-1">Manage medicines and inventory</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create Medicine</span>
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
              placeholder="Search medicines..."
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
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {medicines.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No medicines found
                  </td>
                </tr>
              ) : (
                medicines.map((medicine) => (
                  <tr key={medicine.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Pill className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {medicine.name}
                          </div>
                          {medicine.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {medicine.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {medicine.categoryName || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${medicine.unitPrice.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        medicine.totalStock === 0 
                          ? 'bg-red-100 text-red-800' 
                          : medicine.totalStock < 10 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {medicine.totalStock} units
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openIncrementModal(medicine)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Increment quantity"
                        >
                          <PlusCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openEditModal(medicine)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Edit medicine"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMedicine(medicine.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete medicine"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Medicine Modal */}
      {(showCreateModal || showEditModal) && (
        <MedicineModal
          title={showCreateModal ? 'Create Medicine' : 'Edit Medicine'}
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          brands={brands}
          onSubmit={showCreateModal ? handleCreateMedicine : handleUpdateMedicine}
          onClose={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            resetForm();
          }}
        />
      )}

      {/* Increment Quantity Modal */}
      {showIncrementModal && selectedMedicine && (
        <IncrementQuantityModal
          medicine={selectedMedicine}
          incrementData={incrementData}
          setIncrementData={setIncrementData}
          suppliers={suppliers}
          onSubmit={handleIncrementQuantity}
          onClose={() => {
            setShowIncrementModal(false);
            resetIncrementForm();
          }}
        />
      )}
    </div>
  );
};

// Medicine Modal Component
const MedicineModal = ({ title, formData, setFormData, categories, brands, onSubmit, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter medicine name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <select
              value={formData.brandId}
              onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            
            {/* Predefined Image Options */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2">Quick Select:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {MEDICINE_IMAGES.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: img.url })}
                    className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      formData.imageUrl === img.url
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.label}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden absolute inset-0 bg-gray-100 items-center justify-center">
                      <Pill className="h-6 w-6 text-gray-400" />
                    </div>
                    {formData.imageUrl === img.url && (
                      <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-1">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom URL Input */}
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Or enter custom image URL..."
            />
            
            {/* Image Preview */}
            {formData.imageUrl && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-1">Preview:</p>
                <div className="relative h-32 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden absolute inset-0 bg-gray-100 items-center justify-center">
                    <span className="text-xs text-gray-400">Invalid image URL</span>
                  </div>
                </div>
              </div>
            )}
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

// Increment Quantity Modal
const IncrementQuantityModal = ({ medicine, incrementData, setIncrementData, suppliers, onSubmit, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Increment Quantity - {medicine.name}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity to Add <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={incrementData.quantity}
              onChange={(e) => setIncrementData({ ...incrementData, quantity: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter quantity"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> To create a new batch with a different expiry date or batch number, provide batch details below. Otherwise, quantity will be added to an existing batch.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch Number (Optional - creates new batch if provided)
            </label>
            <input
              type="text"
              value={incrementData.batchNumber}
              onChange={(e) => setIncrementData({ ...incrementData, batchNumber: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="BATCH-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date (Optional - creates new batch if provided)
            </label>
            <input
              type="date"
              value={incrementData.expiryDate}
              onChange={(e) => setIncrementData({ ...incrementData, expiryDate: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier
            </label>
            <select
              value={incrementData.supplierId}
              onChange={(e) => setIncrementData({ ...incrementData, supplierId: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Date
            </label>
            <input
              type="date"
              value={incrementData.purchaseDate}
              onChange={(e) => setIncrementData({ ...incrementData, purchaseDate: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Cost
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={incrementData.unitCost}
              onChange={(e) => setIncrementData({ ...incrementData, unitCost: e.target.value })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
            />
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
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add Quantity</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicineManagement;


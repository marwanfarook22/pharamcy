import { useState, useEffect } from 'react';
import { categoriesAPI, medicinesAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  Tag, 
  Search, 
  Grid3x3, 
  List, 
  Package, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  Star
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchMedicines();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      toast.error('Failed to load categories');
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
    if (name.includes('cold') || name.includes('flu') || name.includes('respiratory')) return faThermometer;
    return faPills; // Default icon
  };

  const getCategoryColor = (categoryName, index) => {
    const name = categoryName.toLowerCase();
    const colors = [
      { bg: 'from-blue-500 to-cyan-600', hover: 'hover:from-blue-600 hover:to-cyan-700', icon: 'bg-blue-100', text: 'text-blue-600' },
      { bg: 'from-purple-500 to-pink-600', hover: 'hover:from-purple-600 hover:to-pink-700', icon: 'bg-purple-100', text: 'text-purple-600' },
      { bg: 'from-green-500 to-emerald-600', hover: 'hover:from-green-600 hover:to-emerald-700', icon: 'bg-green-100', text: 'text-green-600' },
      { bg: 'from-orange-500 to-red-600', hover: 'hover:from-orange-600 hover:to-red-700', icon: 'bg-orange-100', text: 'text-orange-600' },
      { bg: 'from-indigo-500 to-blue-600', hover: 'hover:from-indigo-600 hover:to-blue-700', icon: 'bg-indigo-100', text: 'text-indigo-600' },
      { bg: 'from-pink-500 to-rose-600', hover: 'hover:from-pink-600 hover:to-rose-700', icon: 'bg-pink-100', text: 'text-pink-600' },
      { bg: 'from-teal-500 to-cyan-600', hover: 'hover:from-teal-600 hover:to-cyan-700', icon: 'bg-teal-100', text: 'text-teal-600' },
      { bg: 'from-amber-500 to-yellow-600', hover: 'hover:from-amber-600 hover:to-yellow-700', icon: 'bg-amber-100', text: 'text-amber-600' },
    ];
    return colors[index % colors.length];
  };

  // Generate slug from category name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleCategoryClick = (categoryId, categoryName) => {
    // Navigate to home page and filter by category
    navigate('/', { state: { categoryId } });
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get featured categories (top 3 by product count)
  const featuredCategories = [...categories]
    .sort((a, b) => b.medicineCount - a.medicineCount)
    .slice(0, 3);

  // Calculate total products
  const totalProducts = medicines.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <Tag className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Explore our wide range of pharmaceutical products organized by category. 
            Find exactly what you need for your health and wellness.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">{categories.length} Categories</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold">{totalProducts} Products</span>
            </div>
          </div>
        </div>

        {/* Search and View Toggle */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="flex-1 relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                aria-label="Grid view"
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                aria-label="List view"
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Featured Categories */}
        {featuredCategories.length > 0 && !searchTerm && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Featured Categories</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredCategories.map((category, index) => {
                const colorScheme = getCategoryColor(category.name, index);
                const categoryIcon = getCategoryIcon(category.name);
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id, category.name)}
                    className={`bg-gradient-to-br ${colorScheme.bg} ${colorScheme.hover} rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl text-left`}
                  >
                    <div className="p-6 text-white">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`${colorScheme.icon} p-3 rounded-xl`}>
                          <FontAwesomeIcon 
                            icon={categoryIcon} 
                            className={`text-2xl ${colorScheme.text}`} 
                          />
                        </div>
                        <div className="flex items-center gap-1 bg-white bg-opacity-20 px-3 py-1 rounded-full">
                          <Sparkles className="h-4 w-4" />
                          <span className="text-xs font-semibold">Featured</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-white text-opacity-90 mb-4 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {category.medicineCount} {category.medicineCount === 1 ? 'product' : 'products'}
                          </span>
                        </div>
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* All Categories Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Tag className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                {searchTerm ? 'Search Results' : 'All Categories'}
              </h2>
              {searchTerm && (
                <span className="text-sm text-gray-600">
                  ({filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'})
                </span>
              )}
            </div>
          </div>

          {filteredCategories.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'No categories available'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCategories.map((category, index) => {
                const colorScheme = getCategoryColor(category.name, index);
                const categoryIcon = getCategoryIcon(category.name);
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id, category.name)}
                    className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-blue-300 transform hover:-translate-y-1`}
                  >
                    <div className={`bg-gradient-to-br ${colorScheme.bg} p-6 text-white`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`${colorScheme.icon} p-3 rounded-xl`}>
                          <FontAwesomeIcon 
                            icon={categoryIcon} 
                            className={`text-2xl ${colorScheme.text}`} 
                          />
                        </div>
                        {category.medicineCount > 0 && (
                          <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs font-semibold">
                            {category.medicineCount}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold mb-2 line-clamp-1">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-white text-opacity-90 line-clamp-2 mb-4">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <div className="p-4 bg-gray-50">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {category.medicineCount} {category.medicineCount === 1 ? 'product' : 'products'}
                        </span>
                        <ArrowRight className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCategories.map((category, index) => {
                const colorScheme = getCategoryColor(category.name, index);
                const categoryIcon = getCategoryIcon(category.name);
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id, category.name)}
                    className="w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-blue-300"
                  >
                    <div className="flex items-center gap-6 p-6">
                      <div className={`bg-gradient-to-br ${colorScheme.bg} p-4 rounded-xl flex-shrink-0`}>
                        <FontAwesomeIcon 
                          icon={categoryIcon} 
                          className="text-3xl text-white" 
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                          {category.medicineCount > 0 && (
                            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                              {category.medicineCount} {category.medicineCount === 1 ? 'product' : 'products'}
                            </span>
                          )}
                        </div>
                        {category.description && (
                          <p className="text-gray-600 line-clamp-2">{category.description}</p>
                        )}
                      </div>
                      <ArrowRight className="h-6 w-6 text-blue-600 flex-shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Call to Action */}
        {!searchTerm && (
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 md:p-12 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Can't find what you're looking for?</h2>
              <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
                Browse all our products or use our search feature to find exactly what you need.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <span>Browse All Products</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;


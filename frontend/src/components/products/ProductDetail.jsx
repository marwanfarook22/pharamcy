import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { medicinesAPI, cartAPI, batchesAPI, commentsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  ShoppingCart, 
  ArrowLeft, 
  Package, 
  DollarSign, 
  Tag,
  Plus,
  Minus,
  Check,
  Calendar,
  Truck,
  MessageSquare,
  Send,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPills } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [earliestExpiryDate, setEarliestExpiryDate] = useState(null);
  const [supplierName, setSupplierName] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');

  useEffect(() => {
    fetchMedicine();
    fetchComments();
  }, [id]);

  const fetchMedicine = async () => {
    try {
      setLoading(true);
      const response = await medicinesAPI.getById(id);
      setMedicine(response.data);
      
      // Fetch batches to get expiry date and supplier information
      try {
        const batchesResponse = await batchesAPI.getAll(id);
        const batches = batchesResponse.data || [];
        
        if (batches.length > 0) {
          // Find the earliest expiry date (FEFO - First Expiry First Out)
          const sortedBatches = [...batches].sort((a, b) => {
            const dateA = new Date(a.expiryDate);
            const dateB = new Date(b.expiryDate);
            return dateA - dateB;
          });
          
          const earliestBatch = sortedBatches[0];
          if (earliestBatch.expiryDate) {
            setEarliestExpiryDate(earliestBatch.expiryDate);
          }
          
          // Find supplier name from batches (prefer the earliest batch's supplier)
          if (earliestBatch.supplierName) {
            setSupplierName(earliestBatch.supplierName);
          } else {
            // If earliest batch doesn't have supplier, try to find any batch with supplier
            const batchWithSupplier = batches.find(b => b.supplierName);
            if (batchWithSupplier) {
              setSupplierName(batchWithSupplier.supplierName);
            }
          }
        }
      } catch (batchError) {
        console.error('Failed to fetch batch information:', batchError);
        // Don't show error to user, just continue without batch info
      }
    } catch (error) {
      toast.error('Failed to load product details');
      console.error(error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity < 1) return;
    if (medicine && newQuantity > medicine.totalStock) {
      toast.warning(`Only ${medicine.totalStock} units available`);
      return;
    }
    setQuantity(newQuantity);
  };

  const handleQuantityInput = (e) => {
    const value = parseInt(e.target.value) || 1;
    if (value < 1) {
      setQuantity(1);
      return;
    }
    if (medicine && value > medicine.totalStock) {
      toast.warning(`Only ${medicine.totalStock} units available`);
      setQuantity(medicine.totalStock);
      return;
    }
    setQuantity(value);
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.info('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (medicine.totalStock === 0) {
      toast.error('Product is out of stock');
      return;
    }

    setAddingToCart(true);

    try {
      await cartAPI.addItem({ medicineId: medicine.id, quantity });
      toast.success(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const response = await commentsAPI.getAll(id);
      setComments(response.data || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      // Don't show error to user, just continue without comments
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.info('Please login to add a comment');
      navigate('/login');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setSubmittingComment(true);
    try {
      await commentsAPI.create({
        medicineId: parseInt(id),
        content: newComment.trim()
      });
      setNewComment('');
      toast.success('Comment added successfully');
      fetchComments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editCommentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      await commentsAPI.update(commentId, {
        content: editCommentText.trim()
      });
      setEditingCommentId(null);
      setEditCommentText('');
      toast.success('Comment updated successfully');
      fetchComments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await commentsAPI.delete(commentId);
      toast.success('Comment deleted successfully');
      fetchComments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    }
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.content);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditCommentText('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = medicine.unitPrice * quantity;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        <span>Back</span>
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg overflow-hidden flex items-center justify-center">
              {medicine.imageUrl ? (
                <img
                  src={medicine.imageUrl}
                  alt={medicine.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FontAwesomeIcon icon={faPills} className="h-32 w-32 text-blue-400" />
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Category Badge */}
              {medicine.categoryName && (
                <span className="inline-block mb-4 px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-full">
                  {medicine.categoryName}
                </span>
              )}

              {/* Product Name */}
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {medicine.name}
              </h1>

              {/* Description */}
              {medicine.description && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                  <p className="text-gray-600 leading-relaxed">
                    {medicine.description}
                  </p>
                </div>
              )}

              {/* Price Section */}
              <div className={`mb-6 p-4 rounded-lg ${medicine.hasDiscount ? 'bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200' : 'bg-gray-50'}`}>
                {medicine.hasDiscount && medicine.originalPrice ? (
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-4xl font-bold text-red-600">
                        ${medicine.unitPrice.toFixed(2)}
                      </span>
                      <span className="text-2xl font-medium text-gray-400 line-through">
                        ${medicine.originalPrice.toFixed(2)}
                      </span>
                      <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full text-sm font-bold">
                        {medicine.discountPercentage}% OFF
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-red-600">
                      You save ${(medicine.originalPrice - medicine.unitPrice).toFixed(2)}!
                    </p>
                  </div>
                ) : (
                  <div className="flex items-baseline space-x-3 mb-2">
                    <span className="text-4xl font-bold text-gray-900">
                      ${medicine.unitPrice.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                <div className="flex items-center space-x-2">
                  <Package className={`h-5 w-5 ${
                    medicine.totalStock === 0 
                      ? 'text-red-500' 
                      : medicine.totalStock < 10 
                      ? 'text-yellow-500' 
                      : 'text-green-500'
                  }`} />
                  <span className={`text-sm font-medium ${
                    medicine.totalStock === 0 
                      ? 'text-red-600' 
                      : medicine.totalStock < 10 
                      ? 'text-yellow-600' 
                      : 'text-green-600'
                  }`}>
                    {medicine.totalStock === 0 
                      ? 'Out of Stock' 
                      : medicine.totalStock < 10 
                      ? `Only ${medicine.totalStock} units left` 
                      : `${medicine.totalStock} units in stock`}
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={medicine.totalStock}
                    value={quantity}
                    onChange={handleQuantityInput}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= medicine.totalStock}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-500">
                    Max: {medicine.totalStock}
                  </span>
                </div>
              </div>

              {/* Total Price */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-700">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                {quantity > 1 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {quantity} × ${medicine.unitPrice.toFixed(2)} per unit
                  </p>
                )}
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={addingToCart || medicine.totalStock === 0}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              {addingToCart ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Adding to Cart...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  <span>
                    {medicine.totalStock === 0 
                      ? 'Out of Stock' 
                      : `Add ${quantity} ${quantity === 1 ? 'Item' : 'Items'} to Cart`}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Additional Product Details Section */}
        <div className="border-t border-gray-200 p-8 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Product ID</h3>
                <p className="text-sm text-gray-600">#{medicine.id}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Unit Price</h3>
                <p className="text-sm text-gray-600">
                  ${medicine.unitPrice.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Tag className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Availability</h3>
                <p className="text-sm text-gray-600">
                  {medicine.totalStock > 0 ? 'In Stock' : 'Out of Stock'}
                </p>
              </div>
            </div>

            {earliestExpiryDate && (
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Earliest Expiry Date</h3>
                  <p className="text-sm text-gray-600">
                    {format(new Date(earliestExpiryDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            )}

            {supplierName && (
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Truck className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Supplier</h3>
                  <p className="text-sm text-gray-600">
                    {supplierName}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex items-center space-x-2 mb-6">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Comments ({comments.length})
            </h2>
          </div>

          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <div className="flex space-x-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your comment here..."
                  rows={3}
                  maxLength={1000}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !newComment.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Send className="h-5 w-5" />
                  <span>{submittingComment ? 'Posting...' : 'Post'}</span>
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {newComment.length}/1000 characters
              </p>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-600">
                Please{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  login
                </button>
                {' '}to add a comment
              </p>
            </div>
          )}

          {/* Comments List */}
          {loadingComments ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  {editingCommentId === comment.id ? (
                    <div className="space-y-3">
                      <textarea
                        value={editCommentText}
                        onChange={(e) => setEditCommentText(e.target.value)}
                        rows={3}
                        maxLength={1000}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                          {editCommentText.length}/1000 characters
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditComment(comment.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm flex items-center space-x-1"
                          >
                            <X className="h-4 w-4" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {comment.userName}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm')}
                            {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                              <span className="ml-2 text-gray-400">
                                (edited)
                              </span>
                            )}
                          </p>
                        </div>
                        {user && user.id === comment.userId && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => startEditing(comment)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit comment"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete comment"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;


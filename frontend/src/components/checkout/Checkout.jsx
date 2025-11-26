import { useState, useEffect } from 'react';
import { cartAPI, ordersAPI, batchesAPI, couponsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, CheckCircle, AlertCircle, Tag, X } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const Checkout = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [fefoInfo, setFefoInfo] = useState({});
  const [shippingCost, setShippingCost] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    if (cart?.items && cart.items.length > 0) {
      fetchFEFOInfo();
      calculateShippingCost();
    }
  }, [cart]);

  const calculateShippingCost = () => {
    if (!cart || !cart.totalAmount) {
      setShippingCost(0);
      return;
    }

    const subtotal = cart.totalAmount;
    // Shipping cost ranges from $5.00 to $10.00 based on order total
    // Orders under $50: $10.00 shipping
    // Orders $50-$100: $7.50 shipping
    // Orders over $100: $5.00 shipping
    let cost = 5.00;
    if (subtotal < 50) {
      cost = 10.00;
    } else if (subtotal < 100) {
      cost = 7.50;
    } else {
      cost = 5.00;
    }
    setShippingCost(cost);
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      setCart(response.data);
    } catch (error) {
      toast.error('Failed to load cart');
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const fetchFEFOInfo = async () => {
    const info = {};
    for (const item of cart.items) {
      try {
        const response = await batchesAPI.getFEFO(item.medicineId);
        const batches = response.data;
        if (batches.length > 0) {
          // DateOnly comes as string "YYYY-MM-DD", convert to Date
          const earliestExpiry = new Date(batches[0].expiryDate);
          info[item.medicineId] = {
            earliestExpiry: earliestExpiry,
            batchCount: batches.length,
            batches: batches.slice(0, 3), // Show first 3 batches
          };
        }
      } catch (error) {
        console.error(`Failed to fetch FEFO for medicine ${item.medicineId}`);
      }
    }
    setFefoInfo(info);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setValidatingCoupon(true);
    try {
      const subtotal = cart.totalAmount;
      const response = await couponsAPI.validate(couponCode, subtotal);
      
      if (response.data.isValid) {
        setAppliedCoupon(response.data.coupon);
        setDiscountAmount(response.data.discountAmount);
        toast.success('Coupon applied successfully!');
      } else {
        toast.error(response.data.errorMessage || 'Invalid coupon code');
        setAppliedCoupon(null);
        setDiscountAmount(0);
      }
    } catch (error) {
      toast.error('Failed to validate coupon');
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode('');
    toast.info('Coupon removed');
  };

  const handlePlaceOrder = async () => {
    if (!cart || cart.items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setProcessing(true);

    try {
      const response = await ordersAPI.create({
        paymentMethod,
        couponCode: appliedCoupon?.code || null,
      });
      
      toast.success('Order placed successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  const calculateFinalTotal = () => {
    const subtotal = cart.totalAmount;
    let finalShipping = shippingCost;
    
    // If coupon is FreeShipping, shipping is 0
    if (appliedCoupon?.discountType === 'FreeShipping') {
      finalShipping = 0;
    }
    
    return subtotal + finalShipping - discountAmount;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <AlertCircle className="mx-auto h-24 w-24 text-gray-400" />
          <h3 className="mt-4 text-xl font-semibold text-gray-900">Your cart is empty</h3>
          <button
            onClick={() => navigate('/')}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Browse Medicines
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        <p className="text-gray-600 mt-1">Review your order and complete the purchase</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.medicineName}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Quantity: {item.quantity} × ${item.unitPrice.toFixed(2)}
                      </p>
                      
                      {/* FEFO Information */}
                      {fefoInfo[item.medicineId] && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-start space-x-2">
                            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-blue-900">
                                FEFO (First Expiry First Out) Applied
                              </p>
                              <p className="text-xs text-blue-700 mt-1">
                                Earliest expiry: {format(new Date(fefoInfo[item.medicineId].earliestExpiry), 'MMM dd, yyyy')}
                              </p>
                              <p className="text-xs text-blue-600 mt-1">
                                {fefoInfo[item.medicineId].batchCount} batch(es) available
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${item.subTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coupon Code */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Coupon Code</h2>
            {!appliedCoupon ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={validatingCoupon || !couponCode.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Tag className="h-4 w-4" />
                  <span>{validatingCoupon ? 'Validating...' : 'Apply'}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">{appliedCoupon.code}</p>
                    <p className="text-sm text-green-700">{appliedCoupon.name}</p>
                    {appliedCoupon.discountType === 'Percentage' && (
                      <p className="text-xs text-green-600">{appliedCoupon.discountValue}% OFF</p>
                    )}
                    {appliedCoupon.discountType === 'FixedAmount' && (
                      <p className="text-xs text-green-600">${appliedCoupon.discountValue} OFF</p>
                    )}
                    {appliedCoupon.discountType === 'FreeShipping' && (
                      <p className="text-xs text-green-600">FREE SHIPPING</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Cash"
                  checked={paymentMethod === 'Cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-3 flex items-center">
                  <CreditCard className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="text-gray-900 font-medium">Cash on Delivery</span>
                </div>
              </label>
              <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="Card"
                  checked={paymentMethod === 'Card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-3 flex items-center">
                  <CreditCard className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="text-gray-900 font-medium">Credit/Debit Card</span>
                </div>
              </label>
              {!isAdmin && (
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Online"
                    checked={paymentMethod === 'Online'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3 flex items-center">
                    <CreditCard className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="text-gray-900 font-medium">Online Payment</span>
                  </div>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">${cart.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">
                  {appliedCoupon?.discountType === 'FreeShipping' ? (
                    <span className="text-green-600 line-through">${shippingCost.toFixed(2)}</span>
                  ) : (
                    `$${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>
              {appliedCoupon && appliedCoupon.discountType !== 'FreeShipping' && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              {appliedCoupon?.discountType === 'FreeShipping' && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Free Shipping ({appliedCoupon.code})</span>
                  <span>-${shippingCost.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-blue-600">
                  ${calculateFinalTotal().toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={processing}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {processing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Truck className="h-5 w-5" />
                  <span>Place Order</span>
                </>
              )}
            </button>

            <p className="mt-4 text-xs text-gray-500 text-center">
              By placing this order, you agree to our terms and conditions. 
              FEFO (First Expiry First Out) will be automatically applied to ensure 
              you receive the freshest products.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;


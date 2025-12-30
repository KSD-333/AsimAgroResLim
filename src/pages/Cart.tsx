import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, Save } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { routeMap } from '../routeMap';

interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

interface ValidationErrors {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
}

const Cart: React.FC = () => {
  const { items, removeItem, updateQuantity, createOrder, loading: cartLoading } = useCart();
  const navigate = useNavigate();
  const auth = getAuth();
  const [loading, setLoading] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  useEffect(() => {
    const loadSavedAddress = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists() && userDoc.data().shippingAddress) {
            setShippingAddress(userDoc.data().shippingAddress);
          }
        } catch (error) {
          console.error('Error loading saved address:', error);
        }
      }
    };
    loadSavedAddress();
  }, [auth.currentUser]);

  const validateAddress = (address: ShippingAddress): ValidationErrors => {
    const errors: ValidationErrors = {};

    // Name validation
    if (!address.name.trim()) {
      errors.name = 'Name is required';
    } else if (address.name.length < 3) {
      errors.name = 'Name must be at least 3 characters long';
    }

    // Address validation
    if (!address.address.trim()) {
      errors.address = 'Address is required';
    } else if (address.address.length < 10) {
      errors.address = 'Please enter a complete address';
    }

    // City validation
    if (!address.city.trim()) {
      errors.city = 'City is required';
    }

    // State validation
    if (!address.state.trim()) {
      errors.state = 'State is required';
    }

    // Pincode validation
    if (!address.pincode.trim()) {
      errors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(address.pincode)) {
      errors.pincode = 'Pincode must be 6 digits';
    }

    // Phone validation
    if (!address.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(address.phone)) {
      errors.phone = 'Phone number must be 10 digits';
    }

    return errors;
  };

  const handleSaveAddress = async () => {
    if (!auth.currentUser) return;
    
    // Validate the address
    const errors = validateAddress(shippingAddress);
    setValidationErrors(errors);

    // If there are validation errors, don't proceed
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    setSavingAddress(true);
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid), {
        shippingAddress
      }, { merge: true });
      alert('Shipping address saved successfully!');
      setValidationErrors({}); // Clear any previous errors
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save shipping address. Please try again.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error for this field when user starts typing
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!auth.currentUser) {
      alert('Please log in to place an order');
      navigate('/login');
      return;
    }
    
    // Validate the address before checkout
    const errors = validateAddress(shippingAddress);
    setValidationErrors(errors);

    // If there are validation errors, don't proceed
    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      console.log('Creating order with data:', {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        items,
        shippingAddress
      });
      
      const orderId = await createOrder(shippingAddress);
      console.log('Order created successfully with ID:', orderId);
      navigate(`/order-confirmation/${orderId}`);
    } catch (error) {
      console.error('Detailed error creating order:', error);
      if (error instanceof Error) {
        alert(`Failed to create order: ${error.message}`);
      } else {
        alert('Failed to create order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 mb-6 text-center max-w-md">Looks like you haven't added anything to your cart yet. Start exploring our products and add your favorites!</p>
        <button
          onClick={() => navigate(`/${routeMap.products}`)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md text-lg font-semibold shadow transition-colors"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 ">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cart Items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div key={`${item.id}-${item.size}`} className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-grow">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-gray-600">Size: {item.size}</p>
                {/* NPK Information */}
                {item.nutrients && (
                  <div className="mt-2 flex items-center space-x-4">
                    <div className="flex items-center">
                      <span className="text-blue-500 font-medium">N: {item.nutrients.nitrogen}%</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-500 font-medium">P: {item.nutrients.phosphorus}%</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-purple-500 font-medium">K: {item.nutrients.potassium}%</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-2 mt-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.size, Math.max(0, item.quantity - 1))}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <button
                  onClick={() => removeItem(item.id, item.size)}
                  className="text-red-500 hover:text-red-700 mt-2 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Checkout Form */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Shipping Information</h2>
            {auth.currentUser && (
              <button
                onClick={handleSaveAddress}
                disabled={savingAddress}
                className="flex items-center space-x-2 text-sm bg-green-50 text-green-600 hover:bg-green-100 px-3 py-2 rounded-md transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingAddress ? 'Saving...' : 'Save Address'}</span>
              </button>
            )}
          </div>
          <form onSubmit={handleCheckout} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={shippingAddress.name}
                onChange={handleInputChange}
                required
                className={`block w-full px-4 py-2 rounded-md border ${
                  validationErrors.name ? 'border-red-500' : 'border-gray-300'
                } shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 bg-white transition-colors`}
                placeholder="Enter your full name"
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={shippingAddress.address}
                onChange={handleInputChange}
                required
                className={`block w-full px-4 py-2 rounded-md border ${
                  validationErrors.address ? 'border-red-500' : 'border-gray-300'
                } shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 bg-white transition-colors`}
                placeholder="Enter your street address"
              />
              {validationErrors.address && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.address}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  required
                  className={`block w-full px-4 py-2 rounded-md border ${
                    validationErrors.city ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 bg-white transition-colors`}
                  placeholder="Enter your city"
                />
                {validationErrors.city && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>
                )}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleInputChange}
                  required
                  className={`block w-full px-4 py-2 rounded-md border ${
                    validationErrors.state ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 bg-white transition-colors`}
                  placeholder="Enter your state"
                />
                {validationErrors.state && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.state}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={shippingAddress.pincode}
                  onChange={handleInputChange}
                  required
                  className={`block w-full px-4 py-2 rounded-md border ${
                    validationErrors.pincode ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 bg-white transition-colors`}
                  placeholder="Enter your pincode"
                />
                {validationErrors.pincode && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.pincode}</p>
                )}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  required
                  className={`block w-full px-4 py-2 rounded-md border ${
                    validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 bg-white transition-colors`}
                  placeholder="Enter your phone number"
                />
                {validationErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 text-lg font-semibold transition-colors"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Cart;

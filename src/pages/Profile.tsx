import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Order } from '../context/CartContext';
import { Mail, Package, Clock, AlertCircle, X, User, MapPin, Save, Edit2, ChevronDown } from 'lucide-react';
import { doc, getDoc, setDoc, collection, query, where, getDocs, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { updateProfile } from 'firebase/auth';

interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

interface OrderMessage {
  id: string;
  orderId: string;
  userId: string;
  type: 'complaint' | 'return';
  message: string;
  status: 'pending' | 'in_progress' | 'resolved';
  createdAt: any;
  adminResponse?: string;
}

const Profile = () => {
  const { user } = useAuth();
  const { getOrders, cancelOrder } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });
  const [addressError, setAddressError] = useState<string | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageType, setMessageType] = useState<'complaint' | 'return'>('complaint');
  const [messageText, setMessageText] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderMessages, setOrderMessages] = useState<OrderMessage[]>([]);
  const [savingMessage, setSavingMessage] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [contactResponses, setContactResponses] = useState<any[]>([]);
  const [orderFilter, setOrderFilter] = useState<'all' | Order['status']>('all');

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          // Load user document
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setNewDisplayName(user.displayName || '');
            if (userData.shippingAddress) {
              setShippingAddress(userData.shippingAddress);
            }
          }
        } catch (err) {
          console.error('Error loading user data:', err);
          setError('Failed to load user data');
        }
      }
    };

    const loadOrders = async () => {
      try {
        const userOrders = await getOrders();
        setOrders(userOrders);
      } catch (err) {
        setError('Failed to load orders');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const loadOrderMessages = async () => {
      if (user) {
        try {
          const messagesRef = collection(db, 'orderMessages');
          const q = query(messagesRef, where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          const messages = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as OrderMessage[];
          setOrderMessages(messages);
        } catch (err) {
          console.error('Error loading messages:', err);
        }
      }
    };

    // Set up real-time listener for contact responses
    let unsubscribeContactResponses: (() => void) | undefined;
    
    if (user) {
      const contactRef = collection(db, 'contactForms');
      // Query by userId OR userEmail to catch forms submitted before login
      const q = query(
        contactRef, 
        where('userId', '==', user.uid)
      );
      
      unsubscribeContactResponses = onSnapshot(q, (querySnapshot) => {
        const responses = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('Contact responses by userId:', responses);
        console.log('Current user email:', user.email);
        console.log('Current user uid:', user.uid);
        
        // Also fetch by email if userId doesn't match (for forms submitted when not logged in)
        const contactRefByEmail = collection(db, 'contactForms');
        const qEmail = query(contactRefByEmail, where('userEmail', '==', user.email));
        
        getDocs(qEmail).then((emailSnapshot) => {
          const emailResponses = emailSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          console.log('Contact responses by email:', emailResponses);
          
          // Merge and deduplicate responses
          const allResponses = [...responses];
          emailResponses.forEach(emailResp => {
            if (!allResponses.find(r => r.id === emailResp.id)) {
              allResponses.push(emailResp);
            }
          });
          
          console.log('All merged contact responses:', allResponses);
          setContactResponses(allResponses);
        }).catch(err => {
          console.error('Error fetching by email:', err);
          // If email query fails, at least show userId results
          setContactResponses(responses);
        });
      }, (err) => {
        console.error('Error loading contact responses:', err);
      });
    }

    loadUserData();
    loadOrders();
    loadOrderMessages();
    
    // Cleanup function
    return () => {
      if (unsubscribeContactResponses) {
        unsubscribeContactResponses();
      }
    };
  }, [user, getOrders]);

  const validateAddress = (address: ShippingAddress): boolean => {
    if (!address.name.trim() || !address.address.trim() || !address.city.trim() || 
        !address.state.trim() || !address.pincode.trim() || !address.phone.trim()) {
      setAddressError('All fields are required');
      return false;
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      setAddressError('Pincode must be 6 digits');
      return false;
    }
    if (!/^\d{10}$/.test(address.phone)) {
      setAddressError('Phone number must be 10 digits');
      return false;
    }
    setAddressError(null);
    return true;
  };

  const handleSaveAddress = async () => {
    if (!user) return;
    
    if (!validateAddress(shippingAddress)) {
      return;
    }
    
    setSavingAddress(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        shippingAddress
      }, { merge: true });
      setIsEditingAddress(false);
      setAddressError(null);
    } catch (error) {
      console.error('Error saving address:', error);
      setAddressError('Failed to save address. Please try again.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    if (!newDisplayName.trim()) {
      setUsernameError('Username is required');
      return;
    }

    setSavingProfile(true);
    try {
      // Check if username is already taken
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('displayName', '==', newDisplayName));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty && querySnapshot.docs[0].id !== user.uid) {
        setUsernameError('This username is already taken');
        setSavingProfile(false);
        return;
      }

      // Update profile in Firebase Auth
      await updateProfile(user, { displayName: newDisplayName });
      
      // Update in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        displayName: newDisplayName
      }, { merge: true });

      setIsEditingProfile(false);
      setUsernameError('');
    } catch (error) {
      console.error('Error updating profile:', error);
      setUsernameError('Failed to update profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      console.log('Attempting to cancel order:', orderId);
      await cancelOrder(orderId);
      console.log('Order cancelled successfully');
      
      // Reload orders to get updated status from database
      const updatedOrders = await getOrders();
      setOrders(updatedOrders);
      setError(null);
    } catch (err: any) {
      console.error('Failed to cancel order:', err);
      setError(err.message || 'Failed to cancel order. Please try again.');
    }
  };

  const handleComplaint = (orderId: string) => {
    setMessageType('complaint');
    setSelectedOrderId(orderId);
    setShowMessageModal(true);
    setOpenDropdown(null);
  };

  const handleReturn = (orderId: string) => {
    setMessageType('return');
    setSelectedOrderId(orderId);
    setShowMessageModal(true);
    setOpenDropdown(null);
  };

  const handleSendMessage = async () => {
    if (!user || !selectedOrderId || !messageText.trim()) return;

    setSavingMessage(true);
    setMessageError(null);

    try {
      // Validate message length
      if (messageText.trim().length < 10) {
        setMessageError('Message must be at least 10 characters long');
        return;
      }

      if (messageText.trim().length > 500) {
        setMessageError('Message cannot exceed 500 characters');
        return;
      }

      const messageData = {
        orderId: selectedOrderId,
        userId: user.uid,
        type: messageType,
        message: messageText.trim(),
        status: 'pending',
        createdAt: serverTimestamp(),
        userName: user.displayName || 'Anonymous',
        userEmail: user.email
      };

      // Check if user already has a pending message for this order
      const messagesRef = collection(db, 'orderMessages');
      const q = query(
        messagesRef,
        where('orderId', '==', selectedOrderId),
        where('userId', '==', user.uid),
        where('status', '==', 'pending')
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setMessageError('You already have a pending message for this order. Please wait for a response.');
        return;
      }

      await addDoc(collection(db, 'orderMessages'), messageData);
      setMessageText('');
      setShowMessageModal(false);
      setSelectedOrderId(null);
      setMessageError(null);
    } catch (error) {
      console.error('Error sending message:', error);
      if (error instanceof Error) {
        setMessageError(error.message);
      } else {
        setMessageError('Failed to send message. Please check your internet connection and try again.');
      }
    } finally {
      setSavingMessage(false);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'delayed':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
              >
                <Edit2 className="w-4 h-4" />
                <span>{isEditingProfile ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            </div>

            {isEditingProfile ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => {
                      setNewDisplayName(e.target.value);
                      setUsernameError('');
                    }}
                    className={`w-full px-4 py-2 rounded-md border ${
                      usernameError ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                    placeholder="Enter your username"
                  />
                  {usernameError && (
                    <p className="mt-1 text-sm text-red-600">{usernameError}</p>
                  )}
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <User className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Username</p>
                    <p className="text-gray-900">{user?.displayName || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Mail className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>
              <button
                onClick={() => setIsEditingAddress(!isEditingAddress)}
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
              >
                <Edit2 className="w-4 h-4" />
                <span>{isEditingAddress ? 'Cancel' : 'Edit Address'}</span>
              </button>
            </div>

            {isEditingAddress ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.name}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your street address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your state"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.pincode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your pincode"
                    />
                  </div>
                </div>
                {addressError && (
                  <p className="text-sm text-red-600">{addressError}</p>
                )}
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setIsEditingAddress(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAddress}
                    disabled={savingAddress}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    {savingAddress ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {shippingAddress.name ? (
                  <div className="flex items-start space-x-4">
                    <MapPin className="w-6 h-6 text-gray-400 mt-1" />
                    <div>
                      <p className="text-gray-900">{shippingAddress.name}</p>
                      <p className="text-gray-600">{shippingAddress.address}</p>
                      <p className="text-gray-600">
                        {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
                      </p>
                      <p className="text-gray-600">Phone: {shippingAddress.phone}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">No shipping address saved</p>
                )}
              </div>
            )}
          </div>

          {/* Contact Form Responses */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Messages & Inquiries</h2>
            {contactResponses.length === 0 ? (
              <p className="text-gray-600">No messages found.</p>
            ) : (
              <div className="space-y-4">
                {contactResponses.map((response) => {
                  const createdAt = response.createdAt?.toDate ? 
                    response.createdAt.toDate().toLocaleDateString('en-GB') : 
                    'Date not available';
                  
                  return (
                    <div key={response.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium text-gray-900">
                            {response.type === 'message' ? 'Contact Message' : 'Get Started Request'}
                          </p>
                          <p className="text-sm text-gray-600">Submitted on {createdAt}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          response.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          response.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {response.status?.charAt(0).toUpperCase() + response.status?.slice(1) || 'Pending'}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        {response.subject && (
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">Subject:</span> {response.subject}
                          </p>
                        )}
                        <p className="text-sm">
                          <span className="font-medium text-gray-700">Message:</span> {response.message}
                        </p>
                        {response.businessType && (
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">Business Type:</span> {response.businessType}
                          </p>
                        )}
                        {response.location && (
                          <p className="text-sm">
                            <span className="font-medium text-gray-700">Location:</span> {response.location}
                          </p>
                        )}
                      </div>
                      
                      {response.adminResponse && (
                        <div className="mt-3 p-3 bg-primary-50 rounded-lg border border-primary-200">
                          <p className="text-xs text-primary-600 font-medium mb-1">Admin Response:</p>
                          <p className="text-sm text-gray-700">{response.adminResponse}</p>
                          {response.respondedAt && (
                            <p className="text-xs text-gray-500 mt-2">
                              Responded on {response.respondedAt.toDate().toLocaleDateString('en-GB')}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {!response.adminResponse && response.status === 'pending' && (
                        <p className="mt-3 text-sm text-gray-500 italic">
                          We'll respond to your inquiry soon.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order History */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Order History</h2>
              <div className="flex items-center space-x-2">
                <select
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="all">All Orders ({orders.length})</option>
                  <option value="pending">Pending ({orders.filter(o => o.status === 'pending').length})</option>
                  <option value="processing">Processing ({orders.filter(o => o.status === 'processing').length})</option>
                  <option value="shipped">Shipped ({orders.filter(o => o.status === 'shipped').length})</option>
                  <option value="delivered">Delivered ({orders.filter(o => o.status === 'delivered').length})</option>
                  <option value="cancelled">Cancelled ({orders.filter(o => o.status === 'cancelled').length})</option>
                </select>
              </div>
            </div>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                {error}
              </div>
            )}
            {orders.length === 0 ? (
              <p className="text-gray-600">No orders found.</p>
            ) : (
              <div className="space-y-6">
                {orders
                  .filter(order => orderFilter === 'all' || order.status === orderFilter)
                  .map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          Order #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Placed on {order.createdAt.toDate().toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              Size: {item.size} | Quantity: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">
                            Estimated Delivery: {order.estimatedDeliveryDate.toDate().toLocaleDateString()}
                          </p>
                          {order.adminNotes && (
                            <p className="text-sm text-gray-600 mt-1">
                              Note: {order.adminNotes}
                            </p>
                          )}
                          {/* Display messages for this order */}
                          {orderMessages
                            .filter(msg => msg.orderId === order.id)
                            .map(msg => (
                              <div key={msg.id} className="mt-2 p-2 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-start">
                                  <p className="text-sm font-medium text-gray-700">
                                    {msg.type === 'complaint' ? 'Complaint' : 'Return Request'}
                                  </p>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    msg.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    msg.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {msg.status.replace('_', ' ')}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{msg.message}</p>
                                {msg.adminResponse && (
                                  <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                                    <p className="text-xs text-gray-500">Admin Response:</p>
                                    <p className="text-sm text-gray-700">{msg.adminResponse}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                        <div className="flex items-center space-x-4">
                          {order.status === 'delivered' && (
                            <div className="relative">
                              <button
                                onClick={() => setOpenDropdown(openDropdown === order.id ? null : order.id)}
                                className="flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <span>Actions</span>
                                <ChevronDown className="h-4 w-4 ml-2" />
                              </button>
                              {openDropdown === order.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                  <button
                                    onClick={() => handleComplaint(order.id)}
                                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-t-lg"
                                  >
                                    File a Complaint
                                  </button>
                                  <button
                                    onClick={() => handleReturn(order.id)}
                                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-b-lg"
                                  >
                                    Request Return
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {messageType === 'complaint' ? 'File a Complaint' : 'Request Return'}
            </h3>
            <textarea
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value);
                setMessageError(null);
              }}
              className={`w-full h-32 px-4 py-2 rounded-md border ${
                messageError ? 'border-red-500' : 'border-gray-300'
              } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
              placeholder={`Enter your ${messageType === 'complaint' ? 'complaint' : 'return request'} details...`}
            />
            {messageError && (
              <p className="mt-2 text-sm text-red-600">{messageError}</p>
            )}
            <div className="mt-2 text-sm text-gray-500">
              <p>Message must be between 10 and 500 characters.</p>
            </div>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setMessageText('');
                  setSelectedOrderId(null);
                  setMessageError(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={savingMessage || !messageText.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {savingMessage ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 
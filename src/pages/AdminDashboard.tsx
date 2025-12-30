// src/pages/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy, limit, updateDoc, getDoc, where, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  ShoppingCart, 
  Package, 
  MessageSquare, 
  BarChart2, 
  Settings,
  TrendingUp,
  AlertCircle,
  Plus,
  Trash2,
  X,
  Mail,
  FileText,
  Edit2,
  Upload,
  Menu,
  LayoutDashboard,
  CheckCircle
} from 'lucide-react';
import { auth } from '../firebase';
import { routeMap } from '../routeMap';
import { useAuth } from '../context/AuthContext';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalFeedback: number;
  recentOrders: any[];
  recentUsers: any[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  sizes: string[];
  imageUrl: string;
  category: string;
  price?: number;
  discount?: number;
  stockQuantity?: number;
  priceVariants?: Array<{
    size: string;
    price: number;
    discount?: number;
    stock?: number;
  }>;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  images?: any[];
  customChemicals?: any[];
}

interface Order {
  id: string;
  status: string;
  userEmail: string;
  items: { name: string; size: string; quantity: number; image: string }[];
  estimatedDeliveryDate: Timestamp;
  adminNotes?: string;
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
  userName: string;
}

interface ContactForm {
  id: string;
  type: 'message' | 'getStarted';
  name: string;
  email: string;
  phone: string;
  message: string;
  businessType?: string;
  location?: string;
  status: 'pending' | 'in_progress' | 'resolved';
  createdAt: any;
  userId: string;
  userName: string;
  userEmail: string;
  adminResponse?: string;
}

interface DealerApplication {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  yearsInBusiness: string;
  existingBrands: string;
  monthlySales: string;
  businessType: string;
  comments: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
  updatedAt?: any;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalFeedback: 0,
    recentOrders: [],
    recentUsers: []
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    sizes: '',
    category: '',
    price: '',
    discount: '',
    stockQuantity: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    imageUrl: ''
  });
  const [productImages, setProductImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [customChemicals, setCustomChemicals] = useState<Array<{name: string, percentage: string}>>([]);
  const [priceVariants, setPriceVariants] = useState<Array<{size: string, price: string, discount: string, stock: string}>>([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newDeliveryDate, setNewDeliveryDate] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [orderMessages, setOrderMessages] = useState<OrderMessage[]>([]);
  const [adminResponse, setAdminResponse] = useState('');
  const [savingResponse, setSavingResponse] = useState(false);
  const [contactForms, setContactForms] = useState<ContactForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<ContactForm | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [orderSort, setOrderSort] = useState<'date' | 'status'>('date');
  const [orderUserFilter, setOrderUserFilter] = useState<string>('all');
  const [dealerApplications, setDealerApplications] = useState<DealerApplication[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersList);

        // Fetch recent users for stats
        const recentUsersQuery = query(
          collection(db, 'users'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentUsersSnapshot = await getDocs(recentUsersQuery);
        const recentUsers = recentUsersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch orders
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        const recentOrdersQuery = query(
          collection(db, 'orders'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentOrdersSnapshot = await getDocs(recentOrdersQuery);
        const recentOrders = recentOrdersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch products
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const productsList = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        setProducts(productsList);

        // Fetch feedback
        const feedbackSnapshot = await getDocs(collection(db, 'feedback'));

        setStats({
          totalUsers: usersSnapshot.size,
          totalOrders: ordersSnapshot.size,
          totalProducts: productsSnapshot.size,
          totalFeedback: feedbackSnapshot.size,
          recentOrders,
          recentUsers
        });
      } catch (error: any) {
        console.error('Error fetching data:', error);
        if (error.code === 'permission-denied') {
          setError('Permission denied. Please check your admin privileges.');
        } else {
          setError('Error loading data. Please refresh the page.');
        }
      }
    } catch (error: any) {
      console.error('Error in fetchDashboardData:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Subscribe to order messages
    const messagesRef = collection(db, 'orderMessages');
    const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as OrderMessage[];
      setOrderMessages(messages);
    });

    // Subscribe to contact forms
    const formsRef = collection(db, 'contactForms');
    const unsubscribeForms = onSnapshot(formsRef, (snapshot) => {
      const forms = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ContactForm[];
      setContactForms(forms);
    });

    // Subscribe to dealer applications
    const dealersRef = collection(db, 'dealerApplications');
    const unsubscribeDealers = onSnapshot(dealersRef, (snapshot) => {
      const applications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DealerApplication[];
      setDealerApplications(applications);
    });

    return () => {
      unsubscribe();
      unsubscribeForms();
      unsubscribeDealers();
    };
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (productImages.length + files.length > 8) {
      setError('Maximum 8 images allowed per product');
      return;
    }

    setProductImages(prev => [...prev, ...files]);
    
    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newProduct.imageUrl) {
      setError('Please provide a product image URL');
      return;
    }

    if (priceVariants.length === 0) {
      setError('Please add at least one size variant with pricing');
      return;
    }

    try {
      setLoading(true);

      // Prepare priceVariants
      const variantsData = priceVariants
        .filter(v => v.size && v.price)
        .map(v => ({
          size: v.size.trim(),
          price: Number(v.price),
          discount: Number(v.discount) || 0,
          stock: Number(v.stock) || 0
        }));
      
      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        sizes: variantsData.map(v => v.size),
        category: newProduct.category,
        imageUrl: newProduct.imageUrl,
        priceVariants: variantsData,
        nutrients: {
          nitrogen: newProduct.nitrogen ? Number(newProduct.nitrogen) : 0,
          phosphorus: newProduct.phosphorus ? Number(newProduct.phosphorus) : 0,
          potassium: newProduct.potassium ? Number(newProduct.potassium) : 0,
        },
        customChemicals: customChemicals
          .filter(c => c.name && c.percentage)
          .map(c => ({
            name: c.name,
            percentage: Number(c.percentage),
            unit: '%'
          })),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      // Save directly to Firebase
      const docRef = await addDoc(collection(db, 'products'), productData);
      
      // Add to local state with the generated ID
      setProducts(prevProducts => [...prevProducts, { id: docRef.id, ...productData }]);
      
      // Reset form
      setNewProduct({
        name: '',
        description: '',
        sizes: '',
        category: '',
        price: '',
        discount: '',
        stockQuantity: '',
        nitrogen: '',
        phosphorus: '',
        potassium: '',
        imageUrl: ''
      });
      setCustomChemicals([]);
      setPriceVariants([]);
      setPriceVariants([]);
      
      setError('Product added successfully!');
      setTimeout(() => {
        setError(null);
      }, 3000);

    } catch (error) {
      console.error('Error adding product:', error);
      setError(error instanceof Error ? error.message : 'Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        adminNotes: adminNotes
      });
      setStats(prevStats => ({
        ...prevStats,
        recentOrders: prevStats.recentOrders.map(order =>
          order.id === orderId
            ? { ...order, status, adminNotes }
            : order
        )
      }));
      setSelectedOrder(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status');
    }
  };

  const handleUpdateDeliveryDate = async (orderId: string) => {
    try {
      const newDate = new Date(newDeliveryDate);
      await updateDoc(doc(db, 'orders', orderId), {
        estimatedDeliveryDate: Timestamp.fromDate(newDate)
      });
      setStats(prevStats => ({
        ...prevStats,
        recentOrders: prevStats.recentOrders.map(order =>
          order.id === orderId
            ? { ...order, estimatedDeliveryDate: Timestamp.fromDate(newDate) }
            : order
        )
      }));
      setSelectedOrder(null);
      setNewDeliveryDate('');
    } catch (error) {
      console.error('Error updating delivery date:', error);
      setError('Failed to update delivery date');
    }
  };

  const handleEmailUser = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleUpdateMessageStatus = async (messageId: string, newStatus: OrderMessage['status']) => {
    try {
      await updateDoc(doc(db, 'orderMessages', messageId), {
        status: newStatus
      });
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  };

  const handleUpdateFormStatus = async (formId: string, newStatus: ContactForm['status']) => {
    try {
      await updateDoc(doc(db, 'contactForms', formId), {
        status: newStatus
      });
    } catch (error) {
      console.error('Error updating form status:', error);
    }
  };

  const handleSaveFormResponse = async () => {
    if (!selectedForm || !adminResponse.trim()) return;

    setSavingResponse(true);
    try {
      await updateDoc(doc(db, 'contactForms', selectedForm.id), {
        adminResponse: adminResponse.trim(),
        status: 'resolved',
        respondedAt: Timestamp.now()
      });
      setSelectedForm(null);
      setAdminResponse('');
    } catch (error) {
      console.error('Error saving response:', error);
    } finally {
      setSavingResponse(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (isDeletingUser) return; // Prevent multiple deletions
    
    try {
      setIsDeletingUser(true);
      // Get current user's admin status
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError('You must be logged in to perform this action');
        return;
      }

      // Check if current user is admin
      const adminDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!adminDoc.exists() || adminDoc.data().role !== 'admin') {
        setError('You do not have permission to delete users');
        return;
      }

      // First, check if the user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        setError('User not found');
        return;
      }

      // Prevent self-deletion
      if (userId === currentUser.uid) {
        setError('You cannot delete your own account');
        return;
      }

      // Get all collections that might have user data
      const collections = ['orders', 'reviews', 'contactForms', 'orderMessages', 'feedback'];
      
      // Delete user data from all collections
      for (const collectionName of collections) {
        try {
          const q = query(
            collection(db, collectionName),
            where('userId', '==', userId)
          );
          const querySnapshot = await getDocs(q);
          
          // Delete all documents in the collection that belong to this user
          const deletePromises = querySnapshot.docs.map(doc => 
            deleteDoc(doc.ref)
          );
          await Promise.all(deletePromises);
        } catch (collectionError) {
          console.warn(`Error deleting from ${collectionName}:`, collectionError);
          // Continue with other collections even if one fails
        }
      }

      // Finally, delete the user document
      await deleteDoc(doc(db, 'users', userId));
      
      // Update the stats to remove the deleted user
      setStats(prevStats => ({
        ...prevStats,
        totalUsers: prevStats.totalUsers - 1,
        recentUsers: prevStats.recentUsers.filter(user => user.id !== userId)
      }));

      setError('User deleted successfully');
      setTimeout(() => {
        setError(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      if (error.code === 'permission-denied') {
        setError('Permission denied. Please check your admin privileges and Firebase security rules.');
      } else if (error.code === 'not-found') {
        setError('User not found in the database.');
      } else {
        setError(`Failed to delete user: ${error.message}`);
      }
    } finally {
      setIsDeletingUser(false);
      setUserToDelete(null);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct({
      ...product,
      price: product.price || 0,
      discount: product.discount || 0,
      stockQuantity: product.stockQuantity || 0
    });
    setProductImages([]);
    setImagePreviewUrls(product.images?.map(img => img.url) || []);
    setCustomChemicals(product.customChemicals?.map(c => ({name: c.name, percentage: c.percentage.toString()})) || []);
    
    // Load existing price variants if available
    if (product.priceVariants && product.priceVariants.length > 0) {
      setPriceVariants(product.priceVariants.map(v => ({
        size: v.size,
        price: v.price.toString(),
        discount: (v.discount || 0).toString(),
        stock: (v.stock || 0).toString()
      })));
    } else {
      setPriceVariants([]);
    }
    
    setShowEditModal(true);
  };

  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (imagePreviewUrls.length + files.length > 8) {
      setError('Maximum 8 images allowed per product');
      return;
    }

    setProductImages(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveEditImage = (index: number) => {
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    if (index < (editingProduct?.images?.length || 0)) {
      // Mark existing image for deletion
      setEditingProduct((prev: any) => ({
        ...prev,
        imagesToDelete: [...(prev.imagesToDelete || []), prev.images[index]]
      }));
    } else {
      // Remove from new uploads
      const newIndex = index - (editingProduct?.images?.length || 0);
      setProductImages(prev => prev.filter((_, i) => i !== newIndex));
    }
  };

  const handleSaveEditProduct = async () => {
    if (!editingProduct) return;
    
    try {
      setLoading(true);
      setError(null);

      // Parse sizes
      const sizesArray = typeof editingProduct.sizes === 'string'
        ? editingProduct.sizes.split(',').map((s: string) => s.trim()).filter((s: string) => s)
        : (editingProduct.sizes || []);
      
      // Prepare priceVariants from editing state
      const variantsData = priceVariants
        .filter(v => v.size && v.price)
        .map(v => ({
          size: v.size.trim(),
          price: Number(v.price),
          discount: Number(v.discount) || 0,
          stock: Number(v.stock) || 0
        }));
      
      // Prepare product data
      const productData: any = {
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        sizes: variantsData.length > 0 ? variantsData.map(v => v.size) : sizesArray,
        category: editingProduct.category || '',
        imageUrl: editingProduct.imageUrl || editingProduct.image || '',
        price: Number(editingProduct.price) || 0,
        discount: Number(editingProduct.discount) || 0,
        stockQuantity: Number(editingProduct.stockQuantity) || 0,
        priceVariants: variantsData.length > 0 ? variantsData : undefined,
        updatedAt: new Date()
      };

      // Add nutrients if they exist
      if (editingProduct.nitrogen !== undefined || editingProduct.phosphorus !== undefined || editingProduct.potassium !== undefined) {
        productData.nitrogen = Number(editingProduct.nitrogen) || 0;
        productData.phosphorus = Number(editingProduct.phosphorus) || 0;
        productData.potassium = Number(editingProduct.potassium) || 0;
      }

      // Update product in Firebase
      const productRef = doc(db, 'products', editingProduct.id);
      await updateDoc(productRef, productData);
      
      // Get the updated product
      const updatedDoc = await getDoc(productRef);
      const updatedProduct = { id: updatedDoc.id, ...updatedDoc.data() } as Product;
      
      // Update local state
      setProducts((prev) =>
        prev.map((p) => p.id === editingProduct.id ? updatedProduct : p)
      );
      
      setShowEditModal(false);
      setEditingProduct(null);
      setProductImages([]);
      setImagePreviewUrls([]);
      setCustomChemicals([]);
      setPriceVariants([]);
      setError('Product updated successfully!');
      setTimeout(() => setError(null), 3000);
      
    } catch (error: any) {
      console.error('Error updating product:', error);
      setError(error.message || 'Failed to update product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDealer = async (dealerId: string) => {
    try {
      await updateDoc(doc(db, 'dealerApplications', dealerId), {
        status: 'accepted',
        updatedAt: Timestamp.now()
      });
      alert('Dealer application accepted successfully!');
    } catch (error) {
      console.error('Error accepting dealer:', error);
      alert('Failed to accept dealer application.');
    }
  };

  const handleRejectDealer = async (dealerId: string) => {
    if (!confirm('Are you sure you want to remove this dealer application?')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'dealerApplications', dealerId));
      alert('Dealer application removed successfully!');
    } catch (error) {
      console.error('Error removing dealer:', error);
      alert('Failed to remove dealer application.');
    }
  };

  const quickLinks = [
    {
      name: 'Analytics Overview',
      href: `/${routeMap.adminAnalytics}`,
      icon: <BarChart2 className="h-6 w-6" />,
      color: 'bg-blue-500'
    },
    {
      name: 'Products',
      href: `/${routeMap.adminProducts}`,
      icon: <Package className="h-6 w-6" />,
      color: 'bg-purple-500'
    },
    {
      name: 'Orders',
      href: `/${routeMap.adminOrders}`,
      icon: <ShoppingCart className="h-6 w-6" />,
      color: 'bg-green-500'
    },
    {
      name: 'Users',
      href: `/${routeMap.adminUsers}`,
      icon: <Users className="h-6 w-6" />,
      color: 'bg-yellow-500'
    },
    {
      name: 'Forms',
      href: `/${routeMap.adminForms}`,
      icon: <FileText className="h-6 w-6" />,
      color: 'bg-indigo-500'
    },
    {
      name: 'Dealers',
      href: `/${routeMap.adminDealers}`,
      icon: <Users className="h-6 w-6" />,
      color: 'bg-teal-500'
    },
    {
      name: 'Messages',
      href: `/${routeMap.adminMessages}`,
      icon: <MessageSquare className="h-6 w-6" />,
      color: 'bg-pink-500'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
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

  const renderOrderManagement = () => {
    const pendingCount = stats.recentOrders.filter(o => o.status === 'pending').length;
    const processingCount = stats.recentOrders.filter(o => o.status === 'processing').length;
    const shippedCount = stats.recentOrders.filter(o => o.status === 'shipped').length;
    const deliveredCount = stats.recentOrders.filter(o => o.status === 'delivered').length;
    const cancelledCount = stats.recentOrders.filter(o => o.status === 'cancelled').length;

    const filteredOrders = stats.recentOrders
      .filter(order => {
        const statusMatch = orderFilter === 'all' || order.status === orderFilter;
        const userMatch = orderUserFilter === 'all' || order.userEmail === orderUserFilter;
        return statusMatch && userMatch;
      })
      .sort((a, b) => {
        if (orderSort === 'date') {
          return b.createdAt?.toDate().getTime() - a.createdAt?.toDate().getTime();
        } else if (orderSort === 'status') {
          return a.status.localeCompare(b.status);
        } else {
          return a.userEmail.localeCompare(b.userEmail);
        }
      });

    return (
      <>
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Orders Management</h2>
          <div className="flex items-center space-x-3 flex-wrap gap-2">
            <select
              value={orderUserFilter}
              onChange={(e) => setOrderUserFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
            >
              <option value="all">All Users</option>
              {Array.from(new Set(stats.recentOrders.map(o => o.userEmail))).map(email => (
                <option key={email} value={email}>
                  {email} ({stats.recentOrders.filter(o => o.userEmail === email).length})
                </option>
              ))}
            </select>
            <select
              value={orderFilter}
              onChange={(e) => setOrderFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
            >
              <option value="all">All Orders ({stats.recentOrders.length})</option>
              <option value="pending">Pending ({pendingCount})</option>
              <option value="processing">Processing ({processingCount})</option>
              <option value="shipped">Shipped ({shippedCount})</option>
              <option value="delivered">Delivered ({deliveredCount})</option>
              <option value="cancelled">Cancelled ({cancelledCount})</option>
            </select>
            <select
              value={orderSort}
              onChange={(e) => setOrderSort(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
            >
              <option value="date">Sort by Date</option>
              <option value="status">Sort by Status</option>
              <option value="user">Sort by User</option>
            </select>
          </div>
        </div>

        {/* Order Status Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-600 font-medium mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-700">{pendingCount}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-600 font-medium mb-1">Processing</p>
            <p className="text-2xl font-bold text-blue-700">{processingCount}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-xs text-purple-600 font-medium mb-1">Shipped</p>
            <p className="text-2xl font-bold text-purple-700">{shippedCount}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs text-green-600 font-medium mb-1">Delivered</p>
            <p className="text-2xl font-bold text-green-700">{deliveredCount}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-600 font-medium mb-1">Cancelled</p>
            <p className="text-2xl font-bold text-red-700">{cancelledCount}</p>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No orders found for the selected filter.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
            // Safely handle timestamps
            const createdAt = order.createdAt?.toDate ? 
              order.createdAt.toDate().toLocaleDateString('en-GB') : 
              'Date not available';
            
            const estimatedDelivery = order.estimatedDeliveryDate?.toDate ? 
              order.estimatedDeliveryDate.toDate().toLocaleDateString('en-GB') : 
              'Date not available';

            return (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-600">{createdAt}</p>
                    <p className="text-sm text-gray-600">
                      Customer: {order.userEmail}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <button
                      onClick={() => handleEmailUser(order.userEmail)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      title="Email Customer"
                    >
                      <Mail className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.items?.map((item: { name: string; size: string; quantity: number; image: string }, index: number) => (
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
                        Estimated Delivery: {estimatedDelivery}
                      </p>
                      {order.adminNotes && (
                        <p className="text-sm text-gray-600 mt-1">
                          Note: {order.adminNotes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Update Status
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* Order Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900/60 via-gray-900/50 to-gray-800/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Update Order #{selectedOrder.id.slice(0, 8)}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Status
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value as any)}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="Add any notes about the order..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Delivery Date
                  </label>
                  <input
                    type="date"
                    value={newDeliveryDate}
                    onChange={(e) => setNewDeliveryDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  {newDeliveryDate && (
                    <button
                      onClick={() => handleUpdateDeliveryDate(selectedOrder.id)}
                      className="mt-2 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Update Delivery Date
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
    </>
    );
  };

  const renderContent = () => {
    switch (currentPath) {
      case `/${routeMap.adminAnalytics}`:
        return (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    {stats.recentOrders.length} new orders this month
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    {stats.recentUsers.length} new users this month
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Package className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Across {products.length} categories
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Messages</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{orderMessages.filter(m => m.status !== 'resolved').length}</p>
                  </div>
                  <div className="bg-pink-100 p-3 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-pink-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    {orderMessages.filter(m => m.status === 'pending').length} pending responses
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity and Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                  <button
                    onClick={() => navigate(`/${routeMap.adminOrders}`)}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {stats.recentOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt?.toDate()).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{order.totalAmount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Messages */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Messages</h2>
                  <button
                    onClick={() => navigate(`/${routeMap.adminMessages}`)}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {orderMessages.slice(0, 5).map((message) => (
                    <div key={message.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {message.type === 'complaint' ? 'Complaint' : 'Return Request'}
                        </p>
                        <p className="text-sm text-gray-600">
                          From: {message.userName}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          message.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          message.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {message.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Status Distribution */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h2>
                <div className="space-y-4">
                  {['pending', 'processing', 'delivered', 'delayed', 'cancelled'].map((status) => {
                    const count = stats.recentOrders.filter(order => order.status === status).length;
                    const percentage = (count / stats.recentOrders.length) * 100 || 0;
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 capitalize">{status}</span>
                          <span className="text-gray-900">{count} orders</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getStatusColor(status)}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Message Type Distribution */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Message Type Distribution</h2>
                <div className="space-y-4">
                  {['complaint', 'return'].map((type) => {
                    const count = orderMessages.filter(message => message.type === type).length;
                    const percentage = (count / orderMessages.length) * 100 || 0;
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 capitalize">{type}</span>
                          <span className="text-gray-900">{count} messages</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              type === 'complaint' ? 'bg-red-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case `/${routeMap.adminUsers}`:
        return (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Users Management</h2>
            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
                {error}
                <button 
                  onClick={() => fetchDashboardData()}
                  className="ml-4 text-red-700 underline hover:text-red-800"
                >
                  Retry
                </button>
              </div>
            )}
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {users.length === 0 ? (
                  <p className="text-gray-600">No users found.</p>
                ) : (
                  (users as any[]).map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{user.displayName || 'No Name'}</p>
                        <p className="text-sm text-gray-600">{user.email || 'No Email'}</p>
                        <p className="text-xs text-gray-500">Role: {user.role || 'user'}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {user.role !== 'admin' && (
                          <button 
                            onClick={() => setUserToDelete(user.id)}
                            disabled={isDeletingUser}
                            className="px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isDeletingUser && userToDelete === user.id ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Delete Confirmation Dialog */}
            {userToDelete && (
              <div className="fixed inset-0 bg-gradient-to-br from-gray-900/60 via-gray-900/50 to-gray-800/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all">
                  <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this user? This action cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setUserToDelete(null)}
                      disabled={isDeletingUser}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteUser(userToDelete)}
                      disabled={isDeletingUser}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {isDeletingUser ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case `/${routeMap.adminOrders}`:
        return renderOrderManagement();

      case `/${routeMap.adminProducts}`:
        return (
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Products Management</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition duration-300">
                  <div className="relative">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition duration-300"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="absolute top-2 right-14 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition duration-300"
                      title="Edit Product"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Category: {product.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case '/admin/feedback':
        return (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Feedback</h2>
            <div className="space-y-4">
              {/* Add feedback list here */}
              <p className="text-gray-600">No feedback available yet.</p>
            </div>
          </div>
        );

      case `/${routeMap.adminProductsNew}`:
        return (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Product</h2>
            {/* Add Product Form */}
            {error && (
              <div className={`mb-4 p-4 rounded-lg ${
                error.includes('successfully') 
                  ? 'bg-green-50 border border-green-200 text-green-600' 
                  : 'bg-red-50 border border-red-200 text-red-600'
              }`}>
                <p>{error}</p>
              </div>
            )}
            <form onSubmit={handleAddProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Fertilizers">Fertilizers</option>
                    <option value="Seeds">Seeds</option>
                    <option value="Pesticides">Pesticides</option>
                    <option value="Equipment">Equipment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={newProduct.imageUrl || ''}
                  onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://example.com/product-image.jpg"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter a direct link to the product image (e.g., from cloud storage or image hosting service)
                </p>
                
                {newProduct.imageUrl && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <img
                      src={newProduct.imageUrl}
                      alt="Product preview"
                      className="w-64 h-64 object-cover rounded-lg border-2 border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"%3EInvalid URL%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Price Variants Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Size-Based Pricing <span className="text-red-500">*</span></h3>
                    <p className="text-sm text-gray-600">Add at least one size variant with pricing (Required)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPriceVariants([...priceVariants, {size: '', price: '', discount: '', stock: ''}])}
                    className="flex items-center px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Size Variant
                  </button>
                </div>
                
                {priceVariants.length > 0 && (
                  <div className="space-y-3">
                    {priceVariants.map((variant, index) => (
                      <div key={index} className="flex gap-3 items-end bg-gray-50 p-4 rounded-lg">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                          <input
                            type="text"
                            value={variant.size}
                            onChange={(e) => {
                              const updated = [...priceVariants];
                              updated[index].size = e.target.value;
                              setPriceVariants(updated);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="e.g., 5kg, 10kg, 25kg"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                          <input
                            type="number"
                            value={variant.price}
                            onChange={(e) => {
                              const updated = [...priceVariants];
                              updated[index].price = e.target.value;
                              setPriceVariants(updated);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="499"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="w-28">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                          <input
                            type="number"
                            value={variant.discount}
                            onChange={(e) => {
                              const updated = [...priceVariants];
                              updated[index].discount = e.target.value;
                              setPriceVariants(updated);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="0"
                            min="0"
                            max="100"
                            step="0.01"
                          />
                        </div>
                        <div className="w-28">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                          <input
                            type="number"
                            value={variant.stock}
                            onChange={(e) => {
                              const updated = [...priceVariants];
                              updated[index].stock = e.target.value;
                              setPriceVariants(updated);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="100"
                            min="0"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setPriceVariants(priceVariants.filter((_, i) => i !== index))}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {priceVariants.length === 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                    <p className="mb-2"><strong>Required:</strong> You must add at least one size variant with pricing.</p>
                    <p>Click "Add Size Variant" to set prices for each size (e.g., 5kg - ₹500, 10kg - ₹900).</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={newProduct.imageUrl || ''}
                  onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://example.com/product-image.jpg"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter a direct link to the product image (e.g., from cloud storage or image hosting service)
                </p>
                
                {newProduct.imageUrl && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <img
                      src={newProduct.imageUrl}
                      alt="Product preview"
                      className="w-64 h-64 object-cover rounded-lg border-2 border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"%3EInvalid URL%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Add Nutrient Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nitrogen (N) %</label>
                  <input
                    type="number"
                    value={newProduct.nitrogen}
                    onChange={(e) => setNewProduct({...newProduct, nitrogen: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Optional"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phosphorus (P) %</label>
                  <input
                    type="number"
                    value={newProduct.phosphorus}
                    onChange={(e) => setNewProduct({...newProduct, phosphorus: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Optional"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Potassium (K) %</label>
                  <input
                    type="number"
                    value={newProduct.potassium}
                    onChange={(e) => setNewProduct({...newProduct, potassium: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Optional"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Custom Chemicals Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Additional Chemicals</h3>
                  <button
                    type="button"
                    onClick={() => setCustomChemicals([...customChemicals, {name: '', percentage: ''}])}
                    className="flex items-center px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Chemical
                  </button>
                </div>
                
                {customChemicals.length > 0 && (
                  <div className="space-y-3">
                    {customChemicals.map((chemical, index) => (
                      <div key={index} className="flex gap-3 items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Chemical Name</label>
                          <input
                            type="text"
                            value={chemical.name}
                            onChange={(e) => {
                              const updated = [...customChemicals];
                              updated[index].name = e.target.value;
                              setCustomChemicals(updated);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="e.g., Sulfur, Zinc, Boron"
                          />
                        </div>
                        <div className="w-32">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Percentage</label>
                          <input
                            type="number"
                            value={chemical.percentage}
                            onChange={(e) => {
                              const updated = [...customChemicals];
                              updated[index].percentage = e.target.value;
                              setCustomChemicals(updated);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="0-100"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setCustomChemicals(customChemicals.filter((_, i) => i !== index))}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || uploadingImages}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingImages ? (
                  <>
                    <Upload className="h-5 w-5 mr-2 animate-pulse" />
                    Uploading Images...
                  </>
                ) : loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Product...
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 mr-2" />
                    Add Product
                  </>
                )}
              </button>
            </form>
          </div>
        );

      case `/${routeMap.adminForms}`:
        return (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Forms</h2>
            <div className="space-y-4">
              {contactForms.length === 0 ? (
                <p className="text-gray-600">No forms submitted yet.</p>
              ) : (
                contactForms.map((form) => (
                  <div key={form.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          {form.type === 'message' ? (
                            <MessageSquare className="h-5 w-5 text-blue-500" />
                          ) : (
                            <Mail className="h-5 w-5 text-green-500" />
                          )}
                          <h3 className="font-medium text-gray-900">
                            {form.type === 'message' ? 'Contact Message' : 'Get Started Form'}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          From: {form.name} ({form.email})
                        </p>
                        {form.type === 'getStarted' && (
                          <p className="text-sm text-gray-600">
                            Business: {form.businessType} | Location: {form.location}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={form.status}
                          onChange={(e) => handleUpdateFormStatus(form.id, e.target.value as ContactForm['status'])}
                          className="text-sm border rounded-md px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                        <button
                          onClick={() => {
                            setSelectedForm(form);
                            setAdminResponse(form.adminResponse || '');
                          }}
                          className="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
                        >
                          Respond
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-gray-700">{form.message}</p>
                    </div>
                    {form.adminResponse && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-md">
                        <p className="text-sm text-gray-600">Admin Response:</p>
                        <p className="text-gray-700">{form.adminResponse}</p>
                      </div>
                    )}
                    <div className="mt-2 text-sm text-gray-500">
                      Submitted: {form.createdAt?.toDate().toLocaleDateString('en-GB')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case `/${routeMap.adminDealers}`:
        const pendingDealers = dealerApplications.filter(d => d.status === 'pending');
        const acceptedDealers = dealerApplications.filter(d => d.status === 'accepted');
        
        return (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Dealer Applications</h2>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  {pendingDealers.length} New
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {acceptedDealers.length} Accepted
                </span>
              </div>
            </div>

            {/* Pending Applications */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">New Applications</h3>
              {pendingDealers.length === 0 ? (
                <p className="text-gray-600">No pending applications.</p>
              ) : (
                <div className="space-y-4">
                  {pendingDealers.map((dealer) => (
                    <div key={dealer.id} className="border rounded-lg p-4 bg-yellow-50">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{dealer.businessName}</h4>
                          <p className="text-sm text-gray-600">Owner: {dealer.ownerName}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAcceptDealer(dealer.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleRejectDealer(dealer.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center space-x-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Email: {dealer.email}</p>
                          <p className="text-gray-600">Phone: {dealer.phone}</p>
                          <p className="text-gray-600">Business Type: {dealer.businessType}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Location: {dealer.city}, {dealer.state}</p>
                          <p className="text-gray-600">Years in Business: {dealer.yearsInBusiness}</p>
                          <p className="text-gray-600">Monthly Sales: {dealer.monthlySales}</p>
                        </div>
                      </div>
                      {dealer.comments && (
                        <div className="mt-3 p-3 bg-white rounded-md">
                          <p className="text-sm text-gray-600">Comments:</p>
                          <p className="text-gray-700">{dealer.comments}</p>
                        </div>
                      )}
                      <div className="mt-2 text-sm text-gray-500">
                        Submitted: {dealer.createdAt?.toDate().toLocaleDateString('en-GB')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Accepted Dealers */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Accepted Dealers</h3>
              {acceptedDealers.length === 0 ? (
                <p className="text-gray-600">No accepted dealers yet.</p>
              ) : (
                <div className="space-y-4">
                  {acceptedDealers.map((dealer) => (
                    <div key={dealer.id} className="border rounded-lg p-4 bg-green-50">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{dealer.businessName}</h4>
                          <p className="text-sm text-gray-600">Owner: {dealer.ownerName}</p>
                        </div>
                        <button
                          onClick={() => handleRejectDealer(dealer.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center space-x-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Remove</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Email: {dealer.email}</p>
                          <p className="text-gray-600">Phone: {dealer.phone}</p>
                          <p className="text-gray-600">Business Type: {dealer.businessType}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Location: {dealer.city}, {dealer.state}</p>
                          <p className="text-gray-600">Address: {dealer.address}</p>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        Accepted: {dealer.updatedAt?.toDate().toLocaleDateString('en-GB')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case `/${routeMap.adminMessages}`:
        return (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Messages</h2>
            <div className="space-y-4">
              {orderMessages.length === 0 ? (
                <p className="text-gray-600">No messages found.</p>
              ) : (
                orderMessages.map((message) => (
                  <div key={message.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          {message.type === 'complaint' ? (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            <Package className="h-5 w-5 text-blue-500" />
                          )}
                          <h3 className="font-medium text-gray-900">
                            {message.type === 'complaint' ? 'Complaint' : 'Return Request'}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Order #{message.orderId.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-600">
                          From: {message.userName}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={message.status}
                          onChange={(e) => handleUpdateMessageStatus(message.id, e.target.value as OrderMessage['status'])}
                          className="text-sm border rounded-md px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                        <button
                          onClick={() => {
                            setAdminResponse(message.adminResponse || '');
                          }}
                          className="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
                        >
                          Respond
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-gray-700">{message.message}</p>
                    </div>
                    {message.adminResponse && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-md">
                        <p className="text-sm text-gray-600">Admin Response:</p>
                        <p className="text-gray-700">{message.adminResponse}</p>
                      </div>
                    )}
                    <div className="mt-2 text-sm text-gray-500">
                      Submitted: {message.createdAt?.toDate().toLocaleDateString('en-GB')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      default:
        return (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {quickLinks.map((link, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(link.href)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{link.name}</p>
                    </div>
                    <div className={`${link.color} p-3 rounded-lg`}>
                      {link.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                  <button
                    onClick={() => navigate(`/${routeMap.adminOrders}`)}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {stats.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt?.toDate()).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{order.totalAmount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Users */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
                  <button
                    onClick={() => navigate(`/${routeMap.adminUsers}`)}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {stats.recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{user.displayName}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                        <span className="text-sm text-gray-600">New User</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Features */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => navigate(`/${routeMap.adminProductsNew}`)}
                    className="flex items-center justify-center p-4 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    <Package className="h-5 w-5 mr-2" />
                    Add New Product
                  </button>
                  <button
                    onClick={() => navigate(`/${routeMap.adminOrders}`)}
                    className="flex items-center justify-center p-4 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Process Orders
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-gray-900">Database Connection</span>
                    </div>
                    <span className="text-sm text-green-600">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Settings className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-gray-900">System Version</span>
                    </div>
                    <span className="text-sm text-gray-600">1.0.0</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
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
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Mobile Header with Navigation */}
      <div className="lg:hidden bg-white shadow-sm sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-green-700">Admin Dashboard</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="border-t">
            <div className="px-4 py-2 space-y-1">
              <button
                onClick={() => { navigate(`/${routeMap.adminDashboard}`); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-2 rounded-md ${
                  currentPath === `/${routeMap.adminDashboard}` ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="h-4 w-4 inline mr-2" />Overview
              </button>
              <button
                onClick={() => { navigate(`/${routeMap.adminProducts}`); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-2 rounded-md ${
                  currentPath === `/${routeMap.adminProducts}` ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
                }`}
              >
                <Package className="h-4 w-4 inline mr-2" />Products
              </button>
              <button
                onClick={() => { navigate(`/${routeMap.adminOrders}`); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-2 rounded-md ${
                  currentPath === `/${routeMap.adminOrders}` ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
                }`}
              >
                <ShoppingCart className="h-4 w-4 inline mr-2" />Orders
              </button>
              <button
                onClick={() => { navigate(`/${routeMap.adminUsers}`); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-2 rounded-md ${
                  currentPath === `/${routeMap.adminUsers}` ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />Users
              </button>
              <button
                onClick={() => { navigate(`/${routeMap.adminMessages}`); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-2 rounded-md ${
                  currentPath === `/${routeMap.adminMessages}` ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
                }`}
              >
                <MessageSquare className="h-4 w-4 inline mr-2" />Messages
              </button>
              <button
                onClick={() => { navigate(`/${routeMap.adminForms}`); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-2 rounded-md ${
                  currentPath === `/${routeMap.adminForms}` ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
                }`}
              >
                <FileText className="h-4 w-4 inline mr-2" />Forms
              </button>
              <button
                onClick={() => { navigate(`/${routeMap.adminDealers}`); setIsMobileMenuOpen(false); }}
                className={`w-full text-left px-4 py-2 rounded-md ${
                  currentPath === `/${routeMap.adminDealers}` ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />Dealers
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="mb-8 pt-8 hidden lg:block">
          <h1 className="text-3xl font-bold text-gray-900 p-2 text-center text-green-700">Dashboard</h1>
        </div>

        {renderContent()}
      </div>

      {/* Response Modal */}
      {selectedForm && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900/60 via-gray-900/50 to-gray-800/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Respond to {selectedForm.type === 'message' ? 'Contact Message' : 'Get Started Form'}
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Original Message:</p>
              <p className="text-gray-700">{selectedForm.message}</p>
            </div>
            <textarea
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              className="w-full h-32 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your response..."
            />
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => {
                  setSelectedForm(null);
                  setAdminResponse('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFormResponse}
                disabled={savingResponse || !adminResponse.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {savingResponse ? 'Saving...' : 'Send Response'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-900/60 via-gray-900/50 to-gray-800/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all">
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-900">Edit Product</h3>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Fertilizers">Fertilizers</option>
                    <option value="Seeds">Seeds</option>
                    <option value="Pesticides">Pesticides</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Macronutrient">Macronutrient</option>
                    <option value="Micronutrient">Micronutrient</option>
                    <option value="Organic">Organic</option>
                    <option value="Specialty">Specialty</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  value={editingProduct.imageUrl || editingProduct.image || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, imageUrl: e.target.value, image: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
                {(editingProduct.imageUrl || editingProduct.image) && (
                  <div className="mt-2">
                    <img 
                      src={editingProduct.imageUrl || editingProduct.image} 
                      alt="Product preview" 
                      className="h-32 w-32 object-cover rounded-lg border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Sizes (comma-separated) <span className="text-xs text-gray-500">(include units)</span>
                </label>
                <input
                  type="text"
                  value={typeof editingProduct.sizes === 'string' ? editingProduct.sizes : (editingProduct.sizes || []).join(', ')}
                  onChange={(e) => setEditingProduct({...editingProduct, sizes: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5kg, 10L, 500ml, 25kg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
                  <input
                    type="number"
                    value={editingProduct.discount || 0}
                    onChange={(e) => setEditingProduct({...editingProduct, discount: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    value={editingProduct.stockQuantity}
                    onChange={(e) => setEditingProduct({...editingProduct, stockQuantity: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>

              {/* Price Variants Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Size-Based Pricing</h3>
                    <p className="text-sm text-gray-600">Add different prices for each size variant</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPriceVariants([...priceVariants, {size: '', price: '', discount: '', stock: ''}])}
                    className="flex items-center px-3 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Size Variant
                  </button>
                </div>
                
                {priceVariants.length > 0 && (
                  <div className="space-y-3">
                    {priceVariants.map((variant, index) => (
                      <div key={index} className="flex gap-3 items-end bg-gray-50 p-4 rounded-lg">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                          <input
                            type="text"
                            value={variant.size}
                            onChange={(e) => {
                              const updated = [...priceVariants];
                              updated[index].size = e.target.value;
                              setPriceVariants(updated);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="e.g., 5kg, 10kg, 25kg"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                          <input
                            type="number"
                            value={variant.price}
                            onChange={(e) => {
                              const updated = [...priceVariants];
                              updated[index].price = e.target.value;
                              setPriceVariants(updated);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="499"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="w-28">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                          <input
                            type="number"
                            value={variant.discount}
                            onChange={(e) => {
                              const updated = [...priceVariants];
                              updated[index].discount = e.target.value;
                              setPriceVariants(updated);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="0"
                            min="0"
                            max="100"
                            step="0.01"
                          />
                        </div>
                        <div className="w-28">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                          <input
                            type="number"
                            value={variant.stock}
                            onChange={(e) => {
                              const updated = [...priceVariants];
                              updated[index].stock = e.target.value;
                              setPriceVariants(updated);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="100"
                            min="0"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setPriceVariants(priceVariants.filter((_, i) => i !== index))}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sizes (comma-separated)</label>
                <input
                  type="text"
                  value={editingProduct.sizes}
                  onChange={(e) => setEditingProduct({...editingProduct, sizes: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5kg, 10kg, 25kg"
                />
              </div>

              {/* Product Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleEditImageSelect}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={uploadingImages}
                />
                {imagePreviewUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveEditImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* NPK Values */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nitrogen (N) %</label>
                  <input
                    type="number"
                    value={editingProduct.nutrients?.nitrogen || 0}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct, 
                      nutrients: {...editingProduct.nutrients, nitrogen: Number(e.target.value)}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phosphorus (P) %</label>
                  <input
                    type="number"
                    value={editingProduct.nutrients?.phosphorus || 0}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct, 
                      nutrients: {...editingProduct.nutrients, phosphorus: Number(e.target.value)}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Potassium (K) %</label>
                  <input
                    type="number"
                    value={editingProduct.nutrients?.potassium || 0}
                    onChange={(e) => setEditingProduct({
                      ...editingProduct, 
                      nutrients: {...editingProduct.nutrients, potassium: Number(e.target.value)}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Custom Chemicals */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">Additional Chemicals</h4>
                  <button
                    type="button"
                    onClick={() => setCustomChemicals([...customChemicals, {name: '', percentage: ''}])}
                    className="flex items-center px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Chemical
                  </button>
                </div>
                
                {customChemicals.length > 0 && (
                  <div className="space-y-3">
                    {customChemicals.map((chemical, index) => (
                      <div key={index} className="flex gap-3 items-end">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={chemical.name}
                            onChange={(e) => {
                              const updated = [...customChemicals];
                              updated[index].name = e.target.value;
                              setCustomChemicals(updated);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Chemical Name"
                          />
                        </div>
                        <div className="w-32">
                          <input
                            type="number"
                            value={chemical.percentage}
                            onChange={(e) => {
                              const updated = [...customChemicals];
                              updated[index].percentage = e.target.value;
                              setCustomChemicals(updated);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="%"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setCustomChemicals(customChemicals.filter((_, i) => i !== index))}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingProduct(null);
                  setProductImages([]);
                  setImagePreviewUrls([]);
                  setCustomChemicals([]);
                }}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditProduct}
                disabled={loading || uploadingImages}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {uploadingImages ? (
                  <>
                    <Upload className="h-5 w-5 mr-2 animate-pulse" />
                    Uploading...
                  </>
                ) : loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

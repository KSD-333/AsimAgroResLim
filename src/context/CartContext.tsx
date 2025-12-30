import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, updateDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  size: string;
  price?: number;
  image: string;
  nutrients?: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    otherNutrients?: Record<string, number>;
  };
}

interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: CartItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'delayed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  estimatedDeliveryDate: Timestamp;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  adminNotes?: string;
}

// Export Order type for use in other files
export type { Order };

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string, size: string) => void;
  updateQuantity: (itemId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: (shippingAddress: Order['shippingAddress']) => Promise<string>;
  getOrders: () => Promise<Order[]>;
  cancelOrder: (orderId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status'], adminNotes?: string) => Promise<void>;
  updateDeliveryDate: (orderId: string, newDate: Date) => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load cart from Firebase when user logs in
  useEffect(() => {
    const loadCart = async () => {
      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }

      try {
        const cartDoc = await getDoc(doc(db, 'carts', user.uid));
        if (cartDoc.exists()) {
          const cartData = cartDoc.data();
          setItems(cartData.items || []);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [user]);

  // Save cart to Firebase whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      if (!user) return;

      try {
        await setDoc(doc(db, 'carts', user.uid), { 
          items,
          updatedAt: Timestamp.now()
        });
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    };

    if (user) {
      saveCart();
    }
  }, [items, user]);

  const addItem = (item: CartItem) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id && i.size === item.size);
      if (existingItem) {
        return prevItems.map(i =>
          i.id === item.id && i.size === item.size
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prevItems, item];
    });
  };

  const removeItem = (itemId: string, size: string) => {
    setItems(prevItems => prevItems.filter(item => !(item.id === itemId && item.size === size)));
  };

  const updateQuantity = (itemId: string, size: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId && item.size === size ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const createOrder = async (shippingAddress: Order['shippingAddress']): Promise<string> => {
    if (!user) {
      throw new Error('You must be logged in to create an order');
    }

    if (!user.email) {
      throw new Error('User email is required to create an order');
    }

    if (items.length === 0) {
      throw new Error('Cannot create an order with an empty cart');
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.name || !shippingAddress.address || 
        !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode || 
        !shippingAddress.phone) {
      throw new Error('Please provide complete shipping address information');
    }

    try {
      const now = Timestamp.now();
      const estimatedDeliveryDate = new Date();
      estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 3);

      // Create a clean copy of items without any undefined values
      const cleanItems = items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        size: item.size,
        image: item.image,
        ...(item.nutrients && {
          nutrients: {
            nitrogen: item.nutrients.nitrogen || 0,
            phosphorus: item.nutrients.phosphorus || 0,
            potassium: item.nutrients.potassium || 0,
            ...(item.nutrients.otherNutrients && { otherNutrients: item.nutrients.otherNutrients })
          }
        })
      }));

      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        items: cleanItems,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
        estimatedDeliveryDate: Timestamp.fromDate(estimatedDeliveryDate),
        shippingAddress: {
          name: shippingAddress.name.trim(),
          address: shippingAddress.address.trim(),
          city: shippingAddress.city.trim(),
          state: shippingAddress.state.trim(),
          pincode: shippingAddress.pincode.trim(),
          phone: shippingAddress.phone.trim()
        }
      };

      console.log('Creating order with data:', orderData);
      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Only clear cart after successful order creation
      clearCart();
      return orderRef.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order. Please try again.');
    }
  };

  const getOrders = async (): Promise<Order[]> => {
    if (!user) throw new Error('User must be logged in to view orders');

    const ordersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );
    const ordersSnapshot = await getDocs(ordersQuery);
    return ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
  };

  const cancelOrder = async (orderId: string): Promise<void> => {
    if (!user) throw new Error('User must be logged in to cancel orders');

    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);

    if (!orderDoc.exists()) {
      throw new Error('Order not found');
    }

    const orderData = orderDoc.data() as Order;
    if (orderData.userId !== user.uid) {
      throw new Error('Unauthorized to cancel this order');
    }

    await updateDoc(orderRef, {
      status: 'cancelled',
      updatedAt: Timestamp.now()
    });
  };

  const updateOrderStatus = async (
    orderId: string,
    status: Order['status'],
    adminNotes?: string
  ): Promise<void> => {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status,
      updatedAt: Timestamp.now(),
      ...(adminNotes && { adminNotes })
    });
  };

  const updateDeliveryDate = async (orderId: string, newDate: Date): Promise<void> => {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      estimatedDeliveryDate: Timestamp.fromDate(newDate),
      updatedAt: Timestamp.now()
    });
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        createOrder,
        getOrders,
        cancelOrder,
        updateOrderStatus,
        updateDeliveryDate,
        loading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 
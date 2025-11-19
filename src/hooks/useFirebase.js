import { useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot, orderBy, addDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';
import { useAuthStore, useDataStore } from '../store/useStore';

export const useAuth = () => {
  const { setUser, setUserProfile, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
        setLoading(false);
      } else {
        // Verificar se há cliente QR
        const guestUser = localStorage.getItem('guestUser');
        const guestProfile = localStorage.getItem('guestProfile');
        
        if (guestUser && guestProfile) {
          setUser(JSON.parse(guestUser));
          setUserProfile(JSON.parse(guestProfile));
        } else {
          setUser(null);
          setUserProfile(null);
        }
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [setUser, setUserProfile, setLoading]);

  const getUserProfile = async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const login = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email, password, name, isOwner = false, ownerCode = '') => {
    if (isOwner && ownerCode !== 'STITCH2024OWNER') {
      throw new Error('Código de proprietário inválido');
    }
    
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', result.user.uid), {
      id: result.user.uid,
      name,
      email,
      isOwner,
      createdAt: Timestamp.now()
    });
    
    return result;
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const existingProfile = await getUserProfile(result.user.uid);
    
    if (!existingProfile) {
      await setDoc(doc(db, 'users', result.user.uid), {
        id: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
        isOwner: false,
        createdAt: Timestamp.now()
      });
    }
    
    return result;
  };

  const logout = async () => {
    // Limpar sessão de cliente QR
    localStorage.removeItem('guestUser');
    localStorage.removeItem('guestProfile');
    
    await signOut(auth);
  };

  return { login, register, loginWithGoogle, logout };
};

export const useFirebaseData = () => {
  const { user, userProfile } = useAuthStore();
  const { setProducts, setOrders, setStock, setCustomers, setCashbacks, setCategories, setMetrics } = useDataStore();

  useEffect(() => {
    if (!user) return;

    // Products listener
    const productsQuery = query(collection(db, 'products'));
    const unsubProducts = onSnapshot(productsQuery, (snapshot) => {
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(products);
    });

    // Orders listener
    const ordersQuery = query(collection(db, 'orders'), orderBy('timestamp', 'desc'));
    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(orders);
      
      // Calculate metrics
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let todaySales = 0;
      let activeOrders = 0;
      const allCustomers = new Set();
      
      orders.forEach(order => {
        allCustomers.add(order.customerId);
        
        const orderDate = order.timestamp?.toDate();
        if (orderDate >= today && order.status === 'DELIVERED') {
          todaySales += order.totalAmount || 0;
        }
        
        if (['NEW', 'PREPARING', 'READY'].includes(order.status)) {
          activeOrders++;
        }
      });
      
      setMetrics({
        todaySales,
        activeOrders,
        totalCustomers: allCustomers.size,
        stockStatus: 'OK'
      });
    });

    // Stock listener
    const stockQuery = query(collection(db, 'stock'));
    const unsubStock = onSnapshot(stockQuery, (snapshot) => {
      const stock = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStock(stock);
      
      // Update stock status
      const lowStockCount = stock.filter(item => item.currentStock <= item.minStock).length;
      setMetrics({
        stockStatus: lowStockCount > 0 ? `${lowStockCount} Baixo` : 'OK'
      });
    });

    // Customers listener - multiple strategies for reliability
    const customersQuery = query(collection(db, 'users'));
    const unsubCustomers = onSnapshot(customersQuery, (snapshot) => {
      try {
        const allUsers = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          _source: 'users_collection'
        }));
        const customers = allUsers.filter(user => !user.isOwner);
        console.log('Users collection - Total:', allUsers.length, 'Customers:', customers.length);
        setCustomers(customers);
      } catch (error) {
        console.error('Error processing users:', error);
        setCustomers([]);
      }
    }, (error) => {
      console.error('Error loading customers:', error);
      // Fallback: try to extract from orders if users collection fails
      setCustomers([]);
    });

    // Cashbacks listener
    const cashbackQuery = userProfile?.isOwner 
      ? query(collection(db, 'customer_cashbacks'))
      : query(collection(db, 'customer_cashbacks'), where('customerId', '==', user.uid));
    
    const unsubCashbacks = onSnapshot(cashbackQuery, (snapshot) => {
      const cashbacks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCashbacks(cashbacks);
    });

    // Categories listener
    const categoriesQuery = query(
      collection(db, 'categories'),
      where('isActive', '==', true),
      orderBy('name')
    );
    
    const unsubCategories = onSnapshot(categoriesQuery, (snapshot) => {
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categories);
    });

    return () => {
      unsubProducts();
      unsubOrders();
      unsubStock();
      unsubCustomers();
      unsubCashbacks();
      unsubCategories();
    };
  }, [user, userProfile, setProducts, setOrders, setStock, setCustomers, setCashbacks, setCategories, setMetrics]);

  const addProduct = async (productData) => {
    const productRef = await addDoc(collection(db, 'products'), {
      ...productData,
      isAvailable: true,
      createdAt: Timestamp.now()
    });
    
    // Auto-create stock entry for new product
    await setDoc(doc(db, 'stock', productRef.id), {
      id: productRef.id,
      productId: productRef.id,
      productName: productData.name,
      currentStock: 0,
      minStock: 5,
      maxStock: 100,
      unitCost: 0,
      lastUpdated: Timestamp.now(),
      supplier: '',
      category: productData.category || ''
    });
    
    // Auto-create category if it doesn't exist
    if (productData.category && productData.category.trim() !== '') {
      await createCategoryIfNotExists(productData.category);
    }
    
    return productRef;
  };
  
  const createCategoryIfNotExists = async (categoryName) => {
    try {
      const categoryRef = doc(db, 'categories', categoryName);
      const categoryDoc = await getDoc(categoryRef);
      
      if (!categoryDoc.exists()) {
        await setDoc(categoryRef, {
          name: categoryName,
          createdAt: Timestamp.now(),
          productCount: 1,
          isActive: true
        });
        console.log(`Nova categoria criada: ${categoryName}`);
      } else {
        // Increment product count
        const currentCount = categoryDoc.data().productCount || 0;
        await updateDoc(categoryRef, {
          productCount: currentCount + 1,
          isActive: true
        });
        console.log(`Categoria atualizada: ${categoryName}`);
      }
    } catch (error) {
      console.error('Erro ao criar/atualizar categoria:', error);
    }
  };

  const updateProduct = async (productId, updates) => {
    try {
      const productRef = doc(db, 'products', productId);
      const productDoc = await getDoc(productRef);
      
      if (!productDoc.exists()) {
        throw new Error('Produto não encontrado');
      }
      
      return await updateDoc(productRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const addStockMovement = async (movementData) => {
    // Add movement record
    await addDoc(collection(db, 'stock_movements'), {
      ...movementData,
      timestamp: Timestamp.now(),
      userId: user.uid
    });

    // Update stock
    const stockRef = doc(db, 'stock', movementData.productId);
    const stockDoc = await getDoc(stockRef);
    
    if (stockDoc.exists()) {
      const currentStock = stockDoc.data().currentStock || 0;
      const newStock = movementData.type === 'IN' 
        ? currentStock + movementData.quantity 
        : Math.max(0, currentStock - movementData.quantity);
      
      await updateDoc(stockRef, {
        currentStock: newStock,
        unitCost: movementData.unitCost,
        lastUpdated: Timestamp.now()
      });
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    return await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: Timestamp.now()
    });
  };

  const createOrder = async (orderData) => {
    try {
      // Validate all items have valid names
      const validItems = orderData.items.filter(item => 
        item.name && item.name.trim() !== '' && item.name !== 'Produto'
      ).map(item => ({
        product: {
          id: item.productId || item.id,
          name: item.name,
          price: item.price
        },
        quantity: item.quantity,
        productId: item.productId || item.id,
        name: item.name,
        price: item.price
      }));
      
      if (validItems.length === 0) {
        throw new Error('Nenhum produto válido no pedido');
      }
      
      const orderWithCorrectItems = {
        ...orderData,
        items: validItems,
        customerId: user.uid,
        customerName: userProfile?.name || user.displayName,
        status: 'NEW',
        timestamp: Timestamp.now()
      };
      
      return await addDoc(collection(db, 'orders'), orderWithCorrectItems);
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Erro ao criar pedido: ' + error.message);
    }
  };

  const closeDailyCash = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's orders that are not DELIVERED
    const todayOrders = orders.filter(order => {
      const orderDate = order.timestamp?.toDate();
      return orderDate >= today && orderDate < tomorrow && order.status !== 'DELIVERED';
    });

    let totalAmount = 0;
    const updatePromises = todayOrders.map(async (order) => {
      totalAmount += order.totalAmount || 0;
      return updateDoc(doc(db, 'orders', order.id), {
        status: 'DELIVERED',
        updatedAt: Timestamp.now()
      });
    });

    await Promise.all(updatePromises);

    return {
      ordersUpdated: todayOrders.length,
      totalAmount
    };
  };

  return {
    addProduct,
    updateProduct,
    addStockMovement,
    updateOrderStatus,
    createOrder,
    closeDailyCash,
    createCategoryIfNotExists
  };
};
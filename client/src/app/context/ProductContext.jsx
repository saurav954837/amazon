import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const ProductContext = createContext();

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [syncPending, setSyncPending] = useState(false);

  const API_BASE = 'http://localhost:8000/api';

  const getCategories = useCallback(() => {
    const categories = new Set();
    products.forEach(product => {
      const category = product.product_category || product.category;
      if (category) {
        categories.add(category.trim());
      }
    });
    return Array.from(categories);
  }, [products]);

  const getProductsByCategory = useCallback((categoryName) => {
    return products.filter(product => {
      const productCategory = product.product_category || product.category || '';
      return productCategory.toLowerCase() === categoryName.toLowerCase();
    });
  }, [products]);

  const getPopularCategories = useCallback((limit = 8) => {
    const categoryCounts = {};

    products.forEach(product => {
      const category = product.product_category || product.category || 'Uncategorized';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    return Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([category, count]) => ({
        name: category,
        count: count,
        icon: getCategoryIcon(category)
      }));
  }, [products]);

  const getCategoryIcon = (category) => {
    const categoryLower = category.toLowerCase();

    const iconMap = {
      'electronics': 'faTv',
      'computers': 'faLaptop',
      'mobile phones': 'faMobile',
      'home & kitchen': 'faHome',
      'grocery': 'faUtensils',
      'fashion': 'faShirt',
      'health': 'faHeart',
      'beauty': 'faHeart',
      'automotive': 'faCar',
      'toys': 'faGamepad',
      'games': 'faGamepad',
      'baby': 'faBaby',
      'books': 'faBook',
      'sportswear': 'faShirt',
      'makeup': 'faHeart'
    };

    for (const [key, value] of Object.entries(iconMap)) {
      if (categoryLower.includes(key)) {
        return value;
      }
    }

    return 'faTag';
  };

  const fetchCartFromServer = useCallback(async () => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      setCart(localCart);
      return;
    }

    try {
      setCartLoading(true);

      const response = await axios.get(`${API_BASE}/cart/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.status === 200 && response.data) {
        const serverCart = response.data.data?.cart || response.data.cart || [];

        if (serverCart.length > 0) {
          const formattedCart = serverCart.map(item => ({
            product_id: item.product_id || item.id,
            product_name: item.product_name || item.name,
            product_price: item.product_price || item.price,
            product_image: item.product_image || item.image,
            quantity: item.quantity || 1
          }));

          setCart(formattedCart);
          localStorage.setItem('guestCart', JSON.stringify(formattedCart));
        } else {
          const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
          if (localCart.length > 0) {
            setCart(localCart);
          }
        }
      }
    } catch (err) {
      const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      setCart(localCart);
    } finally {
      setCartLoading(false);
    }
  }, []);

  const syncCartToServer = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token || cart.length === 0 || syncPending) return;

    try {
      setSyncPending(true);

      const cartForSync = cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }));

      await axios.post(`${API_BASE}/cart/sync`, cartForSync, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      localStorage.removeItem('guestCart');
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncPending(false);
    }
  }, [cart, syncPending]);

  useEffect(() => {
    const localCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
    if (localCart.length > 0) {
      setCart(localCart);
    }

    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchCartFromServer();
    }
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('guestCart', JSON.stringify(cart));
    }
  }, [cart]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && cart.length > 0) {
      const timer = setTimeout(() => {
        syncCartToServer();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [cart, syncCartToServer]);

  const saveCartToStorage = (newCart) => {
    setCart(newCart);
  };

  const addToCart = async (product, quantity = 1) => {
    const existingItemIndex = cart.findIndex(item => item.product_id === product.product_id);
    let newCart;

    if (existingItemIndex >= 0) {
      newCart = [...cart];
      newCart[existingItemIndex].quantity += quantity;
    } else {
      const cartItem = {
        product_id: product.product_id,
        product_name: product.product_name || product.name,
        product_price: product.product_price || product.price,
        product_image: product.product_image || product.image,
        quantity: quantity
      };
      newCart = [...cart, cartItem];
    }

    saveCartToStorage(newCart);

    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        await axios.post(`${API_BASE}/cart/`, {
          product_id: product.product_id,
          quantity: quantity
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (err) {
      }
    }

    return newCart;
  };

  const removeFromCart = async (productId) => {
    const newCart = cart.filter(item => item.product_id !== productId);
    saveCartToStorage(newCart);

    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        await axios.delete(`${API_BASE}/cart/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (err) {
      }
    }
  };

  const updateCartQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    const newCart = cart.map(item =>
      item.product_id === productId
        ? { ...item, quantity: newQuantity }
        : item
    );

    saveCartToStorage(newCart);

    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        await axios.put(`${API_BASE}/cart/${productId}`, {
          quantity: newQuantity
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (err) {
      }
    }
  };

  const clearCart = async () => {
    saveCartToStorage([]);

    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        await axios.delete(`${API_BASE}/cart/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (err) {
      }
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product_price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE}/products/`, {
        headers: {
          'Accept': 'application/json',
        }
      });

      let productsData = [];

      if (Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response.data.products && Array.isArray(response.data.products)) {
        productsData = response.data.products;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        productsData = response.data.data;
      } else if (response.data.success && response.data.products) {
        productsData = response.data.products;
      } else {
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            productsData = response.data[key];
            break;
          }
        }
      }

      if (productsData.length > 0) {
        const formatProduct = (product) => ({
          product_id: product.product_id || product.id,
          product_name: product.product_name || product.name || 'Product',
          product_price: product.product_price || product.price || 0,
          product_image: product.product_image || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80',
          product_category: product.product_category || product.category || 'Uncategorized',
          product_desc: product.product_desc || product.description || 'Premium quality product',
          product_quantity: product.product_quantity || product.quantity || Math.floor(Math.random() * 50) + 10,
          product_status: product.product_status || product.status || 'active',
          brand: product.brand || 'Amazon',
          rating: product.rating || 4 + Math.random(),
          reviewCount: product.reviewCount || 100 + Math.floor(Math.random() * 900),
          isPrime: product.isPrime || Math.random() > 0.5,
          originalPrice: product.originalPrice || product.product_price * 1.3
        });

        const formattedProducts = productsData.map(formatProduct);
        setProducts(formattedProducts);
        setFeaturedProducts(formattedProducts.slice(0, 4));
        setDeals(formattedProducts.slice(4, 8));
        setRecommended(formattedProducts.slice(8, 12));
      } else {
        createMockData();
      }

    } catch (err) {
      createMockData();
      setError('Using demo data - API connection failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const createMockData = () => {
    const categories = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Health & Beauty', 'Sports'];
    const brands = ['Samsung', 'Apple', 'Sony', 'Nike', 'Adidas', 'Amazon Basics', 'Philips', 'LG'];

    const mockProducts = Array.from({ length: 50 }, (_, i) => {
      const categoryIndex = i % categories.length;
      const brandIndex = i % brands.length;

      return {
        product_id: i + 1,
        product_name: `${brands[brandIndex]} Product ${i + 1}`,
        product_price: 99.99 + (i * 5),
        product_image: `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80&i=${i}`,
        product_category: categories[categoryIndex],
        product_desc: `Premium quality ${categories[categoryIndex].toLowerCase()} product with excellent features`,
        product_quantity: Math.floor(Math.random() * 50) + 10,
        product_status: 'active',
        brand: brands[brandIndex],
        rating: 4 + Math.random(),
        reviewCount: 100 + Math.floor(Math.random() * 900),
        isPrime: Math.random() > 0.5,
        originalPrice: 149.99 + (i * 8)
      };
    });

    setProducts(mockProducts);
    setFeaturedProducts(mockProducts.slice(0, 4));
    setDeals(mockProducts.slice(4, 8));
    setRecommended(mockProducts.slice(8, 12));
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const value = {
    products,
    featuredProducts,
    deals,
    recommended,
    loading,
    error,
    cart,
    cartLoading,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    getCategories,
    getProductsByCategory,
    getPopularCategories,
    refetch: fetchProducts,
    fetchCart: fetchCartFromServer
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContext;
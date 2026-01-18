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

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching products from: http://localhost:8000/api/products/');
      
      const response = await axios.get('http://localhost:8000/api/products/', {
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      console.log('✅ API Response:', response.data);
      
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
      
      console.log('📦 Products extracted:', productsData.length);
      
      if (productsData.length > 0) {
        setProducts(productsData);
        const formatProduct = (product) => ({
          product_id: product.product_id || product.id,
          product_name: product.product_name || product.name || 'Product',
          product_price: product.product_price || product.price || 0,
          product_image: product.product_image || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80',
          product_category: product.product_category || product.category || 'Uncategorized',
          rating: product.rating || 4 + Math.random(),
          reviewCount: product.reviewCount || 100 + Math.floor(Math.random() * 900),
          isPrime: product.isPrime || Math.random() > 0.5,
          originalPrice: product.originalPrice || product.product_price * 1.3
        });
    
        const formattedProducts = productsData.slice(0, 12).map(formatProduct);
        
        setFeaturedProducts(formattedProducts.slice(0, 4));
        setDeals(formattedProducts.slice(4, 8));
        setRecommended(formattedProducts.slice(8, 12));
        
        console.log('🎯 Product distribution complete');
      } else {
        console.log('⚠️ No products found, using mock data');
        createMockData();
      }
      
    } catch (err) {
      console.error('❌ API Error Details:', {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config?.url
      });
      
      // Network error or server down - use mock data
      console.log('🔄 Falling back to mock data');
      createMockData();
      setError('Using demo data - API connection failed');
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to create mock data
  const createMockData = () => {
    const mockProducts = Array.from({ length: 12 }, (_, i) => ({
      product_id: i + 1,
      product_name: `Premium Product ${i + 1}`,
      product_price: 99.99 + (i * 10),
      product_image: `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80&i=${i}`,
      product_category: i < 4 ? 'Electronics' : i < 8 ? 'Sportswear' : 'Makeup',
      rating: 4 + Math.random(),
      reviewCount: 100 + Math.floor(Math.random() * 900),
      isPrime: Math.random() > 0.5,
      originalPrice: 149.99 + (i * 15)
    }));
    
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
    refetch: fetchProducts
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContext;
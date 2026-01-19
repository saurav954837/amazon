import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faFilter,
  faEye,
  faTimes,
  faCheck,
  faBox,
  faRefresh,
  faUpload
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import styles from '../../styles/ProductManagement.module.css';

const ProductManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    product_name: '',
    product_category: '',
    product_desc: '',
    product_image: '',
    product_quantity: '',
    product_price: '',
    product_status: 'active'
  });
  const [formErrors, setFormErrors] = useState({});

  const categories = [
    'Electronics', 'Clothing', 'Books', 'Home & Kitchen', "Mobile Phones",
    'Beauty', 'Sports', 'Toys', 'Automotive', "Grocery"
  ];

  const validateField = (name, value) => {
    const errors = {};
    
    switch (name) {
      case 'product_name':
        if (!value.trim()) errors.product_name = 'Product name is required.';
        else if (value.length < 3 || value.length > 255) errors.product_name = 'Product name must be between 3 and 255 characters.';
        else if (!/^[a-zA-Z0-9\s\-&.,()#+@!]+$/.test(value)) errors.product_name = 'Product name contains invalid characters.';
        break;
        
      case 'product_category':
        if (!value.trim()) errors.product_category = 'Product category is required.';
        else if (value.length < 2 || value.length > 55) errors.product_category = 'Product category must be between 2 and 55 characters.';
        else if (!/^[a-zA-Z0-9\s\-&]+$/.test(value)) errors.product_category = 'Category contains invalid characters.';
        break;
        
      case 'product_desc':
        if (value && (value.length < 10 || value.length > 2000)) errors.product_desc = 'Product description must be between 10 and 2000 characters.';
        break;
        
      case 'product_image':
        if (value) {
          try {
            new URL(value);
          } catch {
            errors.product_image = 'Product image must be a valid URL.';
          }
          if (value.length > 255) errors.product_image = 'Image URL too long.';
        }
        break;
        
      case 'product_quantity':
        if (!value) errors.product_quantity = 'Product quantity is required.';
        else {
          const quantity = parseInt(value);
          if (isNaN(quantity) || quantity < 0 || quantity > 10000) errors.product_quantity = 'Quantity must be between 0 and 10,000.';
        }
        break;
        
      case 'product_price':
        if (!value) errors.product_price = 'Product price is required.';
        else {
          const price = parseFloat(value);
          if (isNaN(price) || price < 0.01 || price > 1000000) errors.product_price = 'Price must be between $0.01 and $1,000,000.';
        }
        break;
        
      case 'product_status':
        if (value && !['active', 'inactive'].includes(value)) errors.product_status = "Status must be 'active' or 'inactive'.";
        break;
    }
    
    return errors;
  };

  const validateForm = (data) => {
    const errors = {};
    
    Object.keys(data).forEach(key => {
      const fieldErrors = validateField(key, data[key]);
      if (fieldErrors[key]) {
        errors[key] = fieldErrors[key];
      }
    });
    
    if (!editingProduct) {
      const requiredFields = ['product_name', 'product_category', 'product_quantity', 'product_price'];
      requiredFields.forEach(field => {
        if (!data[field] || data[field].toString().trim() === '') {
          errors[field] = `${field.replace('_', ' ')} is required.`;
        }
      });
    } else {
      const updateFields = ['product_name', 'product_category', 'product_desc', 'product_image', 'product_quantity', 'product_price', 'product_status'];
      const hasAtLeastOne = updateFields.some(field => 
        data[field] !== undefined && data[field] !== null && data[field].toString().trim() !== ''
      );
      
      if (!hasAtLeastOne) {
        errors.general = 'At least one field must be provided for update.';
      }
    }
    
    return errors;
  };

  const sanitizeInput = (name, value) => {
    if (typeof value !== 'string') return value;
    
    let sanitized = value;
    
    switch (name) {
      case 'product_name':
        sanitized = value.replace(/^\s+|\s+$/g, '');
        break;
      case 'product_category':
        sanitized = value.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
        break;
      case 'product_desc':
        sanitized = value.replace(/^\s+|\s+$/g, '');
        break;
      case 'product_image':
        sanitized = value.trim();
        break;
      default:
        sanitized = value.trim();
        if (sanitized === '' && !['product_name', 'product_category', 'product_quantity', 'product_price'].includes(name)) {
          sanitized = null;
        }
    }
    
    return sanitized;
  };

  const sanitizeFormData = (data) => {
    const sanitized = {};
    Object.keys(data).forEach(key => {
      sanitized[key] = sanitizeInput(key, data[key]);
    });
    return sanitized;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(name, value);
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    const errors = validateField(name, sanitizedValue);
    setFormErrors(prev => ({
      ...prev,
      [name]: errors[name] || null
    }));
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.get('http://localhost:8000/api/products/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setProducts(response.data.data || []);
        setFilteredProducts(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      const safeSearchTerm = searchTerm.replace(/[^a-zA-Z0-9\s\-&.,()#+@!]/g, '');
      filtered = filtered.filter(product =>
        product.product_name.toLowerCase().includes(safeSearchTerm.toLowerCase()) ||
        product.product_desc.toLowerCase().includes(safeSearchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      const safeCategory = selectedCategory.replace(/[^a-zA-Z0-9\s\-&]/g, '');
      filtered = filtered.filter(product =>
        product.product_category === safeCategory
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      product_name: product.product_name,
      product_category: product.product_category,
      product_desc: product.product_desc,
      product_image: product.product_image,
      product_quantity: product.product_quantity,
      product_price: product.product_price,
      product_status: product.product_status
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setFormData({
      product_name: '',
      product_category: '',
      product_desc: '',
      product_image: '',
      product_quantity: '',
      product_price: '',
      product_status: 'active'
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const sanitizedData = sanitizeFormData(formData);
    const errors = validateForm(sanitizedData);
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const finalData = {
      ...sanitizedData,
      product_quantity: parseInt(sanitizedData.product_quantity),
      product_price: parseFloat(sanitizedData.product_price)
    };

    try {
      const token = localStorage.getItem('accessToken');
      const url = editingProduct 
        ? `http://localhost:8000/api/products/${editingProduct.product_id}`
        : 'http://localhost:8000/api/products/';
      
      const method = editingProduct ? 'put' : 'post';
      
      const response = await axios[method](url, finalData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        await fetchProducts();
        setShowModal(false);
        setEditingProduct(null);
        setFormErrors({});
      }
    } catch (err) {
      console.error('Failed to save product:', err);
      setError('Failed to save product');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    if (!productId || isNaN(productId) || productId < 1) {
      setError('Invalid product ID');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.delete(`http://localhost:8000/api/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        await fetchProducts();
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
      setError('Failed to delete product');
    }
  };

  const handleViewProduct = (productId) => {
    if (!productId || isNaN(productId) || productId < 1) {
      setError('Invalid product ID');
      return;
    }
    navigate(`/products/${productId}`);
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return '$0.00';
    
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(numPrice);
  };

  const getStatusBadge = (status) => {
    return status === 'active' ? styles.statusActive : styles.statusInactive;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className={styles.productManagement}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitle}>
            <FontAwesomeIcon icon={faBox} className={styles.headerIcon} />
            <h1>Product Management</h1>
          </div>
          <button onClick={() => navigate('/admin-dashboard')} className={styles.backButton}>
            Back to Dashboard
          </button>
        </div>
      </header>

      <div className={styles.content}>
        {error && (
          <div className={styles.errorAlert}>
            <span>{error}</span>
            <button onClick={() => setError('')} className={styles.closeError}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        )}

        <div className={styles.controls}>
          <div className={styles.searchContainer}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => {
                const safeValue = e.target.value.replace(/[^a-zA-Z0-9\s\-&.,()#+@!]/g, '');
                setSearchTerm(safeValue);
              }}
              maxLength="100"
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterContainer}>
            <FontAwesomeIcon icon={faFilter} className={styles.filterIcon} />
            <select
              value={selectedCategory}
              onChange={(e) => {
                const safeValue = e.target.value.replace(/[^a-zA-Z0-9\s\-&]/g, '');
                setSelectedCategory(safeValue);
              }}
              className={styles.filterSelect}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <button onClick={fetchProducts} className={styles.refreshButton}>
            <FontAwesomeIcon icon={faRefresh} />
            Refresh
          </button>

          <button onClick={handleCreate} className={styles.createButton}>
            <FontAwesomeIcon icon={faPlus} />
            Add Product
          </button>
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Products</span>
            <span className={styles.statValue}>{products.length}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Active Products</span>
            <span className={styles.statValue}>
              {products.filter(p => p.product_status === 'active').length}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Stock</span>
            <span className={styles.statValue}>
              {products.reduce((sum, p) => sum + (parseInt(p.product_quantity) || 0), 0)}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Value</span>
            <span className={styles.statValue}>
              {formatPrice(products.reduce((sum, p) => {
                const price = parseFloat(p.product_price) || 0;
                const quantity = parseInt(p.product_quantity) || 0;
                return sum + (price * quantity);
              }, 0))}
            </span>
          </div>
        </div>

        <div className={styles.productsTableContainer}>
          <table className={styles.productsTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className={styles.noProducts}>
                    <FontAwesomeIcon icon={faBox} />
                    <p>No products found</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.product_id}>
                    <td className={styles.productId}>{product.product_id}</td>
                    <td>
                      <img
                        src={product.product_image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'}
                        alt={product.product_name}
                        className={styles.productImage}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80';
                        }}
                      />
                    </td>
                    <td className={styles.productName}>
                      <strong>{product.product_name}</strong>
                      <p className={styles.productDesc}>{product.product_desc ? product.product_desc.substring(0, 50) + '...' : ''}</p>
                    </td>
                    <td className={styles.productCategory}>{product.product_category}</td>
                    <td className={styles.productPrice}>{formatPrice(product.product_price)}</td>
                    <td className={styles.productStock}>
                      <span className={product.product_quantity > 0 ? styles.inStock : styles.outOfStock}>
                        {product.product_quantity}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusBadge(product.product_status)}`}>
                        {product.product_status}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      <button
                        onClick={() => handleViewProduct(product.product_id)}
                        className={styles.viewButton}
                        title="View Product"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        className={styles.editButton}
                        title="Edit Product"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.product_id)}
                        className={styles.deleteButton}
                        title="Delete Product"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowModal(false)} className={styles.modalClose}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Product Name</label>
                  <input
                    type="text"
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleInputChange}
                    required={!editingProduct}
                    minLength="3"
                    maxLength="255"
                    className={`${styles.formInput} ${formErrors.product_name ? styles.inputError : ''}`}
                  />
                  {formErrors.product_name && <span className={styles.errorText}>{formErrors.product_name}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label>Category</label>
                  <select
                    name="product_category"
                    value={formData.product_category}
                    onChange={handleInputChange}
                    required={!editingProduct}
                    className={`${styles.formInput} ${formErrors.product_category ? styles.inputError : ''}`}
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {formErrors.product_category && <span className={styles.errorText}>{formErrors.product_category}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label>Price (EGP)</label>
                  <input
                    type="number"
                    name="product_price"
                    value={formData.product_price}
                    onChange={handleInputChange}
                    required={!editingProduct}
                    step="0.01"
                    min="0.01"
                    max="1000000"
                    className={`${styles.formInput} ${formErrors.product_price ? styles.inputError : ''}`}
                  />
                  {formErrors.product_price && <span className={styles.errorText}>{formErrors.product_price}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    name="product_quantity"
                    value={formData.product_quantity}
                    onChange={handleInputChange}
                    required={!editingProduct}
                    min="0"
                    max="10000"
                    className={`${styles.formInput} ${formErrors.product_quantity ? styles.inputError : ''}`}
                  />
                  {formErrors.product_quantity && <span className={styles.errorText}>{formErrors.product_quantity}</span>}
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Description</label>
                  <textarea
                    name="product_desc"
                    value={formData.product_desc}
                    onChange={handleInputChange}
                    rows="3"
                    minLength="10"
                    maxLength="2000"
                    className={`${styles.formTextarea} ${formErrors.product_desc ? styles.inputError : ''}`}
                  />
                  {formErrors.product_desc && <span className={styles.errorText}>{formErrors.product_desc}</span>}
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Image URL</label>
                  <input
                    type="url"
                    name="product_image"
                    value={formData.product_image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    maxLength="255"
                    className={`${styles.formInput} ${formErrors.product_image ? styles.inputError : ''}`}
                  />
                  {formErrors.product_image && <span className={styles.errorText}>{formErrors.product_image}</span>}
                </div>
                <div className={styles.formGroup}>
                  <label>Status</label>
                  <select
                    name="product_status"
                    value={formData.product_status}
                    onChange={handleInputChange}
                    className={`${styles.formInput} ${formErrors.product_status ? styles.inputError : ''}`}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  {formErrors.product_status && <span className={styles.errorText}>{formErrors.product_status}</span>}
                </div>
              </div>
              {formErrors.general && <div className={styles.generalError}>{formErrors.general}</div>}
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveButton}>
                  <FontAwesomeIcon icon={editingProduct ? faEdit : faPlus} />
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
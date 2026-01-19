import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faTags,
  faExclamationTriangle,
  faHome,
  faSearch,
  faFilter,
  faSortAmountDown,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { useProduct } from '../../context/ProductContext.jsx';
import ProductCard from './ProductCard.jsx';
import styles from '../../styles/CategorizedProducts.module.css';

const CategorizedProducts = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const { products, loading, getProductsByCategory } = useProduct();
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const decodedCategory = decodeURIComponent(categoryName || '');
    
    if (decodedCategory && products.length > 0) {
      const filtered = getProductsByCategory(decodedCategory);
      setCategoryProducts(filtered);
    }
    
    setIsLoading(false);
  }, [categoryName, products, getProductsByCategory]);

  const filteredProducts = useMemo(() => {
    let result = [...categoryProducts];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(product => {
        const name = product.product_name || product.name || '';
        const desc = product.product_desc || product.description || '';
        const brand = product.brand || '';
        
        return name.toLowerCase().includes(term) ||
               desc.toLowerCase().includes(term) ||
               brand.toLowerCase().includes(term);
      });
    }
    
    result = result.filter(product => {
      const price = product.product_price || product.price || 0;
      return price >= priceRange.min && price <= priceRange.max;
    });
    
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.product_price || 0) - (b.product_price || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (b.product_price || 0) - (a.product_price || 0));
        break;
      case 'name':
        result.sort((a, b) => (a.product_name || '').localeCompare(b.product_name || ''));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }
    
    return result;
  }, [categoryProducts, searchTerm, sortBy, priceRange]);

  const handlePriceRangeChange = (min, max) => {
    setPriceRange({ min: Number(min), max: Number(max) });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSortBy('default');
    setPriceRange({ min: 0, max: 10000 });
    setShowFilters(false);
  };

  const formatCategoryName = (name) => {
    if (!name) return 'Category';
    return decodeURIComponent(name)
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getMinPrice = () => {
    return categoryProducts.reduce((min, product) => {
      const price = product.product_price || 0;
      return price < min ? price : min;
    }, Infinity) || 0;
  };

  const getMaxPrice = () => {
    return categoryProducts.reduce((max, product) => {
      const price = product.product_price || 0;
      return price > max ? price : max;
    }, 0) || 10000;
  };

  if (isLoading || loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading category products...</p>
      </div>
    );
  }

  const displayName = formatCategoryName(categoryName);

  return (
    <div className={styles.categoryPage}>
      <div className={styles.container}>
        <header className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate('/')}>
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Home
          </button>
          
          <div className={styles.titleSection}>
            <h1 className={styles.categoryTitle}>
              <FontAwesomeIcon icon={faTags} className={styles.titleIcon} />
              {displayName}
            </h1>
            <p className={styles.productCount}>
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </header>

        <div className={styles.controlsSection}>
          <div className={styles.searchBar}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button className={styles.clearSearch} onClick={() => setSearchTerm('')}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>

          <div className={styles.controlsRight}>
            <div className={styles.sortContainer}>
              <FontAwesomeIcon icon={faSortAmountDown} className={styles.sortIcon} />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={styles.sortSelect}>
                <option value="default">Sort by</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            <button className={styles.filterToggle} onClick={() => setShowFilters(!showFilters)}>
              <FontAwesomeIcon icon={faFilter} />
              Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className={styles.filtersPanel}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Price Range</label>
              <div className={styles.priceRange}>
                <div className={styles.priceInputs}>
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => handlePriceRangeChange(e.target.value, priceRange.max)}
                    className={styles.priceInput}
                    min="0"
                  />
                  <span className={styles.priceSeparator}>to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => handlePriceRangeChange(priceRange.min, e.target.value)}
                    className={styles.priceInput}
                    min="0"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max={getMaxPrice()}
                  value={priceRange.max}
                  onChange={(e) => handlePriceRangeChange(priceRange.min, e.target.value)}
                  className={styles.priceSlider}
                />
              </div>
              <div className={styles.priceDisplay}>
                <span>EGP {priceRange.min} - EGP {priceRange.max}</span>
              </div>
            </div>

            <div className={styles.filterActions}>
              <button className={styles.resetButton} onClick={resetFilters}>
                Reset All
              </button>
              <button className={styles.applyButton} onClick={() => setShowFilters(false)}>
                Apply Filters
              </button>
            </div>
          </div>
        )}

        <div className={styles.productsSection}>
          {filteredProducts.length > 0 ? (
            <>
              <div className={styles.productsHeader}>
                <h2 className={styles.productsTitle}>Products in {displayName}</h2>
                <div className={styles.activeFilters}>
                  {searchTerm && (
                    <span className={styles.activeFilter}>
                      Search: {searchTerm}
                      <button onClick={() => setSearchTerm('')}>×</button>
                    </span>
                  )}
                  {priceRange.min > 0 && (
                    <span className={styles.activeFilter}>
                      Min: EGP {priceRange.min}
                      <button onClick={() => handlePriceRangeChange(0, priceRange.max)}>×</button>
                    </span>
                  )}
                  {priceRange.max < 10000 && (
                    <span className={styles.activeFilter}>
                      Max: EGP {priceRange.max}
                      <button onClick={() => handlePriceRangeChange(priceRange.min, 10000)}>×</button>
                    </span>
                  )}
                  {sortBy !== 'default' && (
                    <span className={styles.activeFilter}>
                      Sorted
                      <button onClick={() => setSortBy('default')}>×</button>
                    </span>
                  )}
                </div>
              </div>
              
              <div className={styles.productsGrid}>
                {filteredProducts.map(product => (
                  <ProductCard key={product.product_id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIllustration}>
                <FontAwesomeIcon icon={faExclamationTriangle} className={styles.emptyIcon} />
              </div>
              <h3 className={styles.emptyTitle}>No Products Found</h3>
              <p className={styles.emptyMessage}>
                {searchTerm || priceRange.min > 0 || priceRange.max < 10000
                  ? `No products match your filters in "${displayName}" category.`
                  : `No products available in "${displayName}" category yet.`
                }
              </p>
              <div className={styles.emptyActions}>
                {searchTerm || priceRange.min > 0 || priceRange.max < 10000 ? (
                  <button className={styles.actionButton} onClick={resetFilters}>
                    Reset Filters
                  </button>
                ) : (
                  <Link to="/" className={styles.actionButton}>
                    <FontAwesomeIcon icon={faHome} />
                    Browse All Products
                  </Link>
                )}
                <Link to="/" className={styles.secondaryButton}>
                  <FontAwesomeIcon icon={faTags} />
                  View All Categories
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategorizedProducts;
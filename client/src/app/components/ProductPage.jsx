import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTruck, 
  faShieldAlt,
  faChevronLeft,
  faShare,
  faCartPlus,
  faBox,
  faTag,
  faCheckCircle,
  faStar,
  faStarHalfAlt
} from '@fortawesome/free-solid-svg-icons';
import { useProduct } from '../context/ProductContext.jsx';
import axios from 'axios';
import ProductCard from './ProductCard.jsx';
import styles from '../styles/ProductPage.module.css';

const ProductPage = () => {
  const params = useParams();
  const product_id = params?.product_id;
  
  const navigate = useNavigate()
  const { products } = useProduct()
  const [product, setProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [relatedProducts, setRelatedProducts] = useState([])

  useEffect(() => {
    if (!product_id) {
      setLoading(false)
      return
    }

    const fetchProduct = async () => {
      setLoading(true)
      
      try {
        // Try to find in context first
        const foundProduct = products.find(p => {
          const productId = p.product_id || p.id || p._id
          return String(productId) === String(product_id)
        })
        
        if (foundProduct) {
          setProduct(foundProduct)
          
          // Get related products from same category
          const related = products.filter(p => {
            const productId = p.product_id || p.id || p._id
            return String(productId) !== String(product_id) && 
                   p.product_category === foundProduct.product_category
          }).slice(0, 4)
          
          setRelatedProducts(related)
        } else {
          // Fallback to API call
          try {
            const response = await axios.get(`http://localhost:8000/api/products/${product_id}`)
            
            if (response.data) {
              const apiProduct = response.data.product || response.data
              setProduct(apiProduct)
              
              if (apiProduct.product_category) {
                const relatedFromAPI = products.filter(p => {
                  const productId = p.product_id || p.id || p._id
                  return String(productId) !== String(product_id) && 
                         p.product_category === apiProduct.product_category
                }).slice(0, 4)
                
                if (relatedFromAPI.length > 0) {
                  setRelatedProducts(relatedFromAPI)
                }
              }
            }
          } catch (apiError) {
            console.error('Error fetching product from API:', apiError)
            const mockProduct = {
              product_id: product_id,
              product_name: `Product ${product_id}`,
              product_price: 99.99,
              product_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
              product_category: 'Electronics',
              product_desc: 'Premium quality product with excellent features. This product offers the best value for money with its advanced features and durable construction.',
              product_quantity: 50,
              product_status: 'active',
              brand: 'Amazon',
              originalPrice: 149.99,
              rating: 4.5,
              features: [
                'High quality materials',
                'Durable construction',
                'Easy to use',
                'Excellent performance',
                'Value for money',
                'Popular choice'
              ]
            }
            setProduct(mockProduct)
          }
        }
      } catch (error) {
        console.error('Error in fetchProduct:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [product_id, products])

  const addToCart = async (product, qty = 1) => {
    console.log('Adding to cart:', product, 'Quantity:', qty)
    return { success: true }
  }

  // Single product image - removed extra images
  const productImage = product?.product_image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'

  const formatPrice = (price) => {
    const safePrice = Number(price) || 0
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(safePrice)
  }

  const renderStars = (rating) => {
    const safeRating = rating || 4.5
    const stars = []
    const fullStars = Math.floor(safeRating)
    const hasHalfStar = safeRating % 1 >= 0.5
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FontAwesomeIcon key={`full-${i}`} icon={faStar} className={styles.starFull} />)
    }
    
    if (hasHalfStar) {
      stars.push(<FontAwesomeIcon key="half" icon={faStarHalfAlt} className={styles.starFull} />)
    }
    
    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={faStar} className={styles.starEmpty} />)
    }
    
    return stars
  }

  const handleAddToCart = async () => {
    if (!product) return
    
    const result = await addToCart(product, quantity)
    if (result.success) {
      alert('Added to cart successfully!')
    }
  }

  const handleBuyNow = async () => {
    if (!product) return
    
    const result = await addToCart(product, quantity)
    if (result.success) {
      navigate('/cart')
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.product_name,
        text: product.product_desc,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (!product_id) {
    return (
      <div className={styles.notFound}>
        <h2>Product ID not provided</h2>
        <p>Please select a product from the home page.</p>
        <button onClick={() => navigate('/')} className={styles.backButton}>
          <FontAwesomeIcon icon={faChevronLeft} />
          Back to Home
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading product details...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className={styles.notFound}>
        <h2>Product not found</h2>
        <button onClick={() => navigate('/')} className={styles.backButton}>
          <FontAwesomeIcon icon={faChevronLeft} />
          Back to Home
        </button>
      </div>
    )
  }

  const discount = product.originalPrice && product.product_price < product.originalPrice 
    ? Math.round(((product.originalPrice - product.product_price) / product.originalPrice) * 100)
    : 0

  // Function to display all product details except excluded ones
  const renderProductDetails = () => {
    const excludedFields = ['product_id', 'created_at', 'updated_at', 'id', '_id', 'features', 'rating']
    
    return Object.entries(product).map(([key, value]) => {
      // Skip excluded fields
      if (excludedFields.includes(key)) return null;
      
      // Format the key for display
      const formattedKey = key
        .replace(/_/g, ' ')
        .replace(/product_/g, '')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Format the value
      let formattedValue = value;
      
      if (key === 'product_price' || key === 'price') {
        formattedValue = formatPrice(value);
      } else if (key === 'product_status' || key === 'status') {
        formattedValue = (
          <span className={`${styles.statusBadge} ${
            value === 'active' ? styles.statusActive : styles.statusInactive
          }`}>
            {value}
          </span>
        );
      } else if (typeof value === 'boolean') {
        formattedValue = value ? 'Yes' : 'No';
      }
      
      return (
        <div key={key} className={styles.detailRow}>
          <div className={styles.detailLabel}>{formattedKey}:</div>
          <div className={styles.detailValue}>{formattedValue}</div>
        </div>
      );
    }).filter(Boolean);
  }

  return (
    <div className={styles.productPage}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <button onClick={() => navigate('/')} className={styles.breadcrumbLink}>
            Home
          </button>
          <span className={styles.breadcrumbSeparator}>›</span>
          <button 
            onClick={() => navigate(`/category/${product.product_category?.toLowerCase().replace(/\s+/g, '-')}`)}
            className={styles.breadcrumbLink}
          >
            {product.product_category || 'Category'}
          </button>
          <span className={styles.breadcrumbSeparator}>›</span>
          <span className={styles.current}>{product.product_name}</span>
        </nav>

        <div className={styles.productLayout}>
          {/* Product Images - Single main image only */}
          <div className={styles.imageSection}>
            <div className={styles.mainImageContainer}>
              <img 
                src={productImage} 
                alt={product.product_name}
                className={styles.mainImage}
                loading="eager"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
                }}
              />
              {discount > 0 && (
                <div className={styles.discountBadge}>
                  <span className={styles.discountPercent}>-{discount}%</span>
                  <span className={styles.discountLabel}>OFF</span>
                </div>
              )}
            </div>
            
            <div className={styles.imageActions}>
              <button className={styles.shareBtn} onClick={handleShare}>
                <FontAwesomeIcon icon={faShare} />
                Share Product
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className={styles.infoSection}>
            <div className={styles.productHeader}>
              <h1 className={styles.productTitle}>{product.product_name}</h1>
              <div className={styles.ratingContainer}>
                <div className={styles.stars}>
                  {renderStars(product.rating)}
                </div>
                <span className={styles.ratingText}>{product.rating || 4.5}/5</span>
              </div>
            </div>
            
            <div className={styles.brandInfo}>
              <span className={styles.brandLabel}>Brand:</span>
              <span className={styles.brandValue}>{product.brand || 'Unknown'}</span>
            </div>
            
            <div className={styles.priceSection}>
              <div className={styles.priceRow}>
                <span className={styles.currentPrice}>{formatPrice(product.product_price)}</span>
                {product.originalPrice && product.originalPrice > product.product_price && (
                  <>
                    <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
                    <span className={styles.discountText}>{discount}% off</span>
                  </>
                )}
              </div>
              <div className={styles.installmentInfo}>
                <FontAwesomeIcon icon={faCheckCircle} className={styles.checkIcon} />
                <span>No Cost EMI available</span>
              </div>
            </div>
            
            <div className={styles.descriptionSection}>
              <h3 className={styles.sectionTitle}>Description</h3>
              <p className={styles.productDescription}>{product.product_desc || 'No description available.'}</p>
            </div>
            
            {product.features && product.features.length > 0 && (
              <div className={styles.featuresSection}>
                <h3 className={styles.sectionTitle}>Key Features</h3>
                <ul className={styles.featuresList}>
                  {product.features.map((feature, index) => (
                    <li key={index} className={styles.featureItem}>
                      <FontAwesomeIcon icon={faCheckCircle} className={styles.featureIcon} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className={styles.detailsGrid}>
              {renderProductDetails()}
            </div>
            
            <div className={styles.stockSection}>
              <div className={styles.stockInfo}>
                <FontAwesomeIcon icon={faBox} className={styles.stockIcon} />
                <div className={styles.stockContent}>
                  <strong>Stock Status: </strong>
                  <span className={`${styles.stockStatusText} ${
                    product.product_quantity > 0 ? styles.inStock : styles.outOfStock
                  }`}>
                    {product.product_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                  {product.product_quantity > 0 && (
                    <span className={styles.stockCount}> ({product.product_quantity} items available)</span>
                  )}
                </div>
              </div>
              
              <div className={styles.categoryInfo}>
                <FontAwesomeIcon icon={faTag} className={styles.categoryIcon} />
                <div>
                  <strong>Category: </strong>
                  <span className={styles.categoryValue}>{product.product_category || 'Uncategorized'}</span>
                </div>
              </div>
            </div>
            
            <div className={styles.primeDelivery}>
              <FontAwesomeIcon icon={faTruck} className={styles.primeIcon} />
              <div className={styles.primeContent}>
                <strong>FREE delivery</strong>
                <span>Tomorrow, 9am - 12pm. Order within 5 hrs 30 mins</span>
              </div>
            </div>
            
            <div className={styles.warrantyInfo}>
              <FontAwesomeIcon icon={faShieldAlt} className={styles.warrantyIcon} />
              <div className={styles.warrantyContent}>
                <strong>1 Year Warranty</strong>
                <span>Manufacturer warranty included</span>
              </div>
            </div>
            
            <div className={styles.quantitySection}>
              <div className={styles.quantityHeader}>
                <h3 className={styles.quantityTitle}>Quantity:</h3>
                <span className={styles.maxQuantity}>Max: {product.product_quantity || 10}</span>
              </div>
              <div className={styles.quantitySelector}>
                <button 
                  className={styles.quantityBtn}
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  disabled={quantity <= 1 || product.product_quantity <= 0}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className={styles.quantityValue}>{quantity}</span>
                <button 
                  className={styles.quantityBtn}
                  onClick={() => setQuantity(prev => prev + 1)}
                  disabled={quantity >= (product.product_quantity || 10) || product.product_quantity <= 0}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
            
            <div className={styles.actionButtons}>
              <button 
                className={`${styles.addToCartBtn} ${product.product_quantity <= 0 ? styles.disabled : ''}`} 
                onClick={handleAddToCart}
                disabled={product.product_quantity <= 0}
              >
                <FontAwesomeIcon icon={faCartPlus} />
                Add to Cart
              </button>
              <button 
                className={`${styles.buyNowBtn} ${product.product_quantity <= 0 ? styles.disabled : ''}`} 
                onClick={handleBuyNow}
                disabled={product.product_quantity <= 0}
              >
                Buy Now
              </button>
            </div>
            
            <div className={styles.securityNote}>
              <FontAwesomeIcon icon={faShieldAlt} />
              <span>Secure transaction with SSL encryption</span>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className={styles.relatedProducts}>
            <h2 className={styles.relatedTitle}>Related Products</h2>
            <div className={styles.relatedGrid}>
              {relatedProducts.map(relatedProduct => (
                <ProductCard key={relatedProduct.product_id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default ProductPage;
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
  faStarHalfAlt,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import { useProduct } from '../../context/ProductContext.jsx';
import axios from 'axios';
import ProductCard from './ProductCard.jsx';
import styles from '../../styles/ProductPage.module.css';
import { useAuth } from "../../hooks/authHook.js";

const ProductPage = () => {
  const params = useParams();
  const product_id = params?.product_id;

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const navigate = useNavigate()
  const { products, cart, addToCart, updateCartQuantity } = useProduct()
  const [product, setProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    if (!product_id) {
      setLoading(false)
      return
    }

    const fetchProduct = async () => {
      setLoading(true)
      
      try {
        const foundProduct = products.find(p => {
          const productId = p.product_id || p.id || p._id
          return String(productId) === String(product_id)
        })
        
        if (foundProduct) {
          setProduct(foundProduct)
          
          const related = products.filter(p => {
            const productId = p.product_id || p.id || p._id
            return String(productId) !== String(product_id) && 
                   p.product_category === foundProduct.product_category
          }).slice(0, 4)
          
          setRelatedProducts(related)
        } else {
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

  const isProductInCart = () => {
    return cart.some(item => item.product_id === product?.product_id)
  }

  const getCartItemQuantity = () => {
    const cartItem = cart.find(item => item.product_id === product?.product_id)
    return cartItem ? cartItem.quantity : 0
  }

  const handleAddToCart = async () => {
    if (!product || product.product_quantity <= 0) return
    
    setIsAddingToCart(true)
    try {
      await addToCart(product, quantity)
      setAddedToCart(true)
      
      setTimeout(() => {
        setAddedToCart(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      alert('Failed to add to cart. Please try again.')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    if (!product || product.product_quantity <= 0) return
    
    setIsAddingToCart(true)
    try {
      await addToCart(product, quantity)
      navigate('/cart')
    } catch (error) {
      console.error('Failed to add to cart:', error)
      alert('Failed to add to cart. Please try again.')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleUpdateCartQuantity = async (newQuantity) => {
    if (!product) return
    
    try {
      if (newQuantity === 0) {
        return
      }
      
      const existingQuantity = getCartItemQuantity()
      if (existingQuantity > 0) {
        await updateCartQuantity(product.product_id, newQuantity)
        setQuantity(newQuantity)
      }
    } catch (error) {
      console.error('Failed to update cart quantity:', error)
    }
  }

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

  const isInCart = isProductInCart()
  const cartItemQuantity = getCartItemQuantity()
  const maxQuantity = product.product_quantity || 10
  const availableQuantity = maxQuantity - (isInCart ? cartItemQuantity : 0)

  const renderProductDetails = () => {
    const excludedFields = ['product_id', 'created_at', 'updated_at', 'id', '_id', 'features', 'rating']
    
    return Object.entries(product).map(([key, value]) => {
      if (excludedFields.includes(key)) return null;
      
      const formattedKey = key
        .replace(/_/g, ' ')
        .replace(/product_/g, '')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
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
            
            {isInCart && (
              <div className={styles.cartNotification}>
                <FontAwesomeIcon icon={faCheck} className={styles.cartCheckIcon} />
                <span>This item is already in your cart ({cartItemQuantity} {cartItemQuantity === 1 ? 'item' : 'items'})</span>
              </div>
            )}
            
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
              
              {isInCart && (
                <div className={styles.cartSummary}>
                  <FontAwesomeIcon icon={faCartPlus} className={styles.cartSummaryIcon} />
                  <div>
                    <strong>In Your Cart: </strong>
                    <span className={styles.cartQuantity}>{cartItemQuantity} {cartItemQuantity === 1 ? 'item' : 'items'}</span>
                    <span className={styles.cartTotal}>
                      ({formatPrice(product.product_price * cartItemQuantity)})
                    </span>
                  </div>
                </div>
              )}
              
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
                <span className={styles.maxQuantity}>
                  {isInCart ? 
                    `Available: ${availableQuantity}` : 
                    `Max: ${maxQuantity}`
                  }
                </span>
              </div>
              <div className={styles.quantitySelector}>
                <button 
                  className={styles.quantityBtn}
                  onClick={() => {
                    const newQty = Math.max(1, quantity - 1)
                    setQuantity(newQty)
                    if (isInCart) {
                      handleUpdateCartQuantity(newQty)
                    }
                  }}
                  disabled={quantity <= 1 || product.product_quantity <= 0 || (isInCart && availableQuantity <= 0)}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className={styles.quantityValue}>{quantity}</span>
                <button 
                  className={styles.quantityBtn}
                  onClick={() => {
                    const newQty = quantity + 1
                    setQuantity(newQty)
                    if (isInCart) {
                      handleUpdateCartQuantity(newQty)
                    }
                  }}
                  disabled={
                    quantity >= (isInCart ? availableQuantity : maxQuantity) || 
                    product.product_quantity <= 0 || 
                    (isInCart && availableQuantity <= 0)
                  }
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
            
            <div className={styles.actionButtons}>
              <button 
                className={`${styles.addToCartBtn} ${
                  product.product_quantity <= 0 ? styles.disabled : ''
                } ${isInCart ? styles.inCart : ''} ${addedToCart ? styles.added : ''}`} 
                onClick={handleAddToCart}
                disabled={product.product_quantity <= 0 || isAddingToCart || (isInCart && availableQuantity <= 0)}
              >
                {isAddingToCart ? (
                  <span className={styles.loadingText}>Adding...</span>
                ) : addedToCart ? (
                  <>
                    <FontAwesomeIcon icon={faCheck} />
                    <span>Added!</span>
                  </>
                ) : isInCart ? (
                  <>
                    <FontAwesomeIcon icon={faCartPlus} />
                    <span>Update Cart ({cartItemQuantity})</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCartPlus} />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
              <button 
                className={`${styles.buyNowBtn} ${
                  product.product_quantity <= 0 ? styles.disabled : ''
                } ${isInCart ? styles.inCart : ''}`} 
                onClick={handleBuyNow}
                disabled={product.product_quantity <= 0 || isAddingToCart || (isInCart && availableQuantity <= 0)}
              >
                {isInCart ? 'Buy More Now' : 'Buy Now'}
              </button>
            </div>
            
            <div className={styles.securityNote}>
              <FontAwesomeIcon icon={faShieldAlt} />
              <span>Secure transaction with SSL encryption</span>
            </div>
          </div>
        </div>

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
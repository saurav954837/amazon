import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faStarHalfAlt, faTruck } from '@fortawesome/free-solid-svg-icons';
import { useProduct } from '../context/ProductContext.jsx';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/ProductCard.module.css';

const ProductCard = ({ product }) => {
  // Add a safety check at the beginning
  if (!product) {
    return (
      <div className={styles.productCard}>
        <div className={styles.productImageContainer}>
          <div className={styles.skeletonImage} />
        </div>
        <div className={styles.productInfo}>
          <div className={styles.skeletonText} style={{ width: '80%' }} />
          <div className={styles.skeletonText} style={{ width: '60%' }} />
          <div className={styles.skeletonText} style={{ width: '40%' }} />
        </div>
      </div>
    );
  }

  const { addToCart } = useProduct()
  const navigate = useNavigate()

  // Safe property access with fallbacks
  const getProductId = () => {
    return product.product_id || product.id || product._id || null;
  }

  const getProductName = () => {
    return product.product_name || product.name || 'Product Name';
  }

  const getProductPrice = () => {
    return product.product_price || product.price || 0;
  }

  const getOriginalPrice = () => {
    return product.originalPrice || product.product_price * 1.3 || getProductPrice() * 1.3;
  }

  const getProductImage = () => {
    return product.product_image || product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80';
  }

  const renderStars = (rating) => {
    const safeRating = rating || 4;
    const stars = []
    const fullStars = Math.floor(safeRating)
    const hasHalfStar = safeRating % 1 >= 0.5
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FontAwesomeIcon key={`full-${i}`} icon={faStar} className={styles.starFull} />)
    }
    
    if (hasHalfStar) {
      stars.push(<FontAwesomeIcon key="half" icon={faStarHalfAlt} className={styles.starHalf} />)
    }
    
    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FontAwesomeIcon key={`empty-${i}`} icon={faStar} className={styles.starEmpty} />)
    }
    
    return stars
  }

  const formatPrice = (price) => {
    const safePrice = Number(price) || 0;
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(safePrice)
  }

  const calculateDiscount = () => {
    const price = getProductPrice();
    const originalPrice = getOriginalPrice();
    
    if (originalPrice && price < originalPrice) {
      const discount = ((originalPrice - price) / originalPrice) * 100
      return Math.round(discount)
    }
    return 0
  }

  const discount = calculateDiscount()
  const productId = getProductId();

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const result = await addToCart(product)
    if (!result.success) {
      // If not authenticated, it will redirect to register page
      return
    }
    // Show success message or update UI
  }

  const handleBuyNow = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const result = await addToCart(product)
    if (!result.success) {
      // If not authenticated, it will redirect to register page
      return
    }
    
    // Navigate to cart if authenticated
    navigate('/cart')
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    // Wishlist logic here
  }

  const handleCardClick = (e) => {
    if (e.target.closest('button')) return
    if (productId) {
      navigate(`/products/${productId}`)
    }
  }

  return (
    <div className={styles.productCard} onClick={handleCardClick} role="button" tabIndex={0}>
      <div className={styles.productImageContainer}>
        <img 
          src={getProductImage()} 
          alt={getProductName()}
          className={styles.productImage}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80'
          }}
        />
        {discount > 0 && (
          <span className={styles.discountBadge}>-{discount}%</span>
        )}
        <button 
          className={styles.wishlistBtn}
          onClick={handleWishlist}
          aria-label={`Add ${getProductName()} to wishlist`}
        >
          ♡
        </button>
      </div>
      
      <div className={styles.productInfo}>
        <h3 className={styles.productName} title={getProductName()}>
          {getProductName()}
        </h3>
        
        <div className={styles.ratingContainer}>
          <div className={styles.stars}>
            {renderStars(product.rating)}
          </div>
          <span className={styles.reviewCount}>({product.reviewCount || 100})</span>
        </div>
        
        <div className={styles.priceContainer}>
          <span className={styles.currentPrice}>
            {formatPrice(getProductPrice())}
          </span>
          {getOriginalPrice() > getProductPrice() && (
            <span className={styles.originalPrice}>{formatPrice(getOriginalPrice())}</span>
          )}
        </div>
        
        {product.isPrime && (
          <div className={styles.primeBadge}>
            <FontAwesomeIcon icon={faTruck} className={styles.primeIcon} />
            <span>Prime</span>
          </div>
        )}
        
        <div className={styles.productActions}>
          <button 
            className={styles.addToCartBtn}
            onClick={handleAddToCart}
            aria-label={`Add ${getProductName()} to cart`}
          >
            Add to Cart
          </button>
          <button 
            className={styles.buyNowBtn}
            onClick={handleBuyNow}
            aria-label={`Buy ${getProductName()} now`}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
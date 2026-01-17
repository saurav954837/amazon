import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faStarHalfAlt, faTruck } from '@fortawesome/free-solid-svg-icons'
import styles from '../styles/ProductCard.module.css'

const ProductCard = ({ product }) => {
  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    
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
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(price)
  }

  const calculateDiscount = () => {
    if (product.originalPrice && product.price < product.originalPrice) {
      const discount = ((product.originalPrice - product.price) / product.originalPrice) * 100
      return Math.round(discount)
    }
    return 0
  }

  const discount = calculateDiscount()

  return (
    <div className={styles.productCard}>
      <div className={styles.productImageContainer}>
        <img 
          src={product.image} 
          alt={product.name}
          className={styles.productImage}
          loading="lazy"
        />
        {discount > 0 && (
          <span className={styles.discountBadge}>-{discount}%</span>
        )}
        <button className={styles.wishlistBtn}>
          ♡
        </button>
      </div>
      
      <div className={styles.productInfo}>
        <h3 className={styles.productName} title={product.name}>
          {product.name.length > 50 ? `${product.name.substring(0, 50)}...` : product.name}
        </h3>
        
        <div className={styles.ratingContainer}>
          <div className={styles.stars}>
            {renderStars(product.rating)}
          </div>
          <span className={styles.reviewCount}>({product.reviewCount})</span>
        </div>
        
        <div className={styles.priceContainer}>
          <span className={styles.currentPrice}>{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
          )}
        </div>
        
        {product.isPrime && (
          <div className={styles.primeBadge}>
            <FontAwesomeIcon icon={faTruck} className={styles.primeIcon} />
            <span>Prime</span>
          </div>
        )}
        
        <div className={styles.productActions}>
          <button className={styles.addToCartBtn}>
            Add to Cart
          </button>
          <button className={styles.buyNowBtn}>
            Buy Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
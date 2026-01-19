import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faEdit } from '@fortawesome/free-solid-svg-icons';
import { useProduct } from '../context/ProductContext.jsx';
import { useNavigate } from 'react-router-dom';
import AddToCartButton from './AddToCartButton.jsx';
import { useAuth } from '../hooks/authHook.js';
import styles from '../styles/ProductCard.module.css';

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

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

  const { cart } = useProduct()
  const navigate = useNavigate()

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

  const getProductCategory = () => {
    return product.product_category || product.category || 'Uncategorized';
  }

  const getProductDescription = () => {
    return product.product_desc || product.description || 'No description available';
  }

  const getProductStock = () => {
    return product.product_quantity || product.quantity || 0;
  }

  const isProductInCart = () => {
    return cart.some(item => item.product_id === getProductId())
  }

  const getCartItemQuantity = () => {
    const cartItem = cart.find(item => item.product_id === getProductId())
    return cartItem ? cartItem.quantity : 0
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
  const isInCart = isProductInCart()
  const cartItemQuantity = getCartItemQuantity()

  const handleCardClick = (e) => {
    if (e.target.closest('button')) return
    if (productId) {
      if (isAdmin) {
        navigate(`/admin/products`)
      } else {
        navigate(`/products/${productId}`)
      }
    }
  }

  const handleEditProduct = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (productId) {
      navigate(`/admin/products`)
    }
  }

  const handleBuyNow = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
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
        {product.isPrime && (
          <div className={styles.primeBadge}>
            <FontAwesomeIcon icon={faTruck} className={styles.primeIcon} />
            <span>Prime</span>
          </div>
        )}
      </div>
      
      <div className={styles.productInfo}>
        <h3 className={styles.productName} title={getProductName()}>
          {getProductName()}
        </h3>
        
        <div className={styles.productCategory}>
          <span className={styles.categoryLabel}>Category:</span>
          <span className={styles.categoryValue}>{getProductCategory()}</span>
        </div>
        
        <div className={styles.productDescription}>
          <p>{getProductDescription()}</p>
        </div>
        
        <div className={styles.stockStatus}>
          <span className={`${styles.stockIndicator} ${getProductStock() > 0 ? styles.inStock : styles.outOfStock}`}>
            {getProductStock() > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
          {getProductStock() > 0 && (
            <span className={styles.stockCount}>({getProductStock()} available)</span>
          )}
        </div>
        
        {isInCart && !isAdmin && (
          <div className={styles.cartIndicator}>
            <span className={styles.cartItemCount}>In Cart: {cartItemQuantity}</span>
            <span className={styles.cartItemTotal}>
              {formatPrice(getProductPrice() * cartItemQuantity)}
            </span>
          </div>
        )}
        
        <div className={styles.priceContainer}>
          <span className={styles.currentPrice}>
            {formatPrice(getProductPrice())}
          </span>
          {getOriginalPrice() > getProductPrice() && (
            <span className={styles.originalPrice}>{formatPrice(getOriginalPrice())}</span>
          )}
        </div>
        
        <div className={styles.productStatus}>
          <span className={`${styles.statusBadge} ${
            product.product_status === 'active' ? styles.statusActive : styles.statusInactive
          }`}>
            {product.product_status || 'active'}
          </span>
        </div>
        
        <div className={styles.productActions}>
          {isAdmin ? (
            <button 
              className={styles.editProductBtn}
              onClick={handleEditProduct}
              aria-label={`Edit ${getProductName()}`}
            >
              <FontAwesomeIcon icon={faEdit} />
              Edit Product
            </button>
          ) : (
            <>
              <div className={styles.addToCartWrapper}>
                <AddToCartButton product={product} />
              </div>
              <button 
                className={styles.buyNowBtn}
                onClick={handleBuyNow}
                aria-label={`Buy ${getProductName()} now`}
                disabled={getProductStock() <= 0}
              >
                {isInCart ? 'View Details' : 'Buy Now'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard;
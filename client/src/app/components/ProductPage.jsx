import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faStar, 
  faStarHalfAlt, 
  faTruck, 
  faShieldAlt,
  faChevronLeft,
  faShare,
  faHeart,
  faCartPlus
} from '@fortawesome/free-solid-svg-icons'
import ProductCard from './ProductCard.jsx'
import styles from '../styles/ProductPage.module.css'

const ProductPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const productImages = [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80'
  ]

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      
      const mockProduct = {
        id: id || '1',
        name: 'Premium Wireless Headphones with Noise Cancellation',
        brand: 'AudioTech',
        price: 299.99,
        originalPrice: 399.99,
        rating: 4.5,
        reviewCount: 1247,
        description: 'Experience premium audio quality with our latest wireless headphones featuring active noise cancellation, 30-hour battery life, and superior comfort for extended listening sessions.',
        features: [
          'Active Noise Cancellation',
          '30-hour battery life',
          'Quick charge (5 min = 3 hours)',
          'Bluetooth 5.2',
          'Voice assistant support',
          'Foldable design'
        ],
        inStock: true,
        isPrime: true,
        warranty: '1 year manufacturer warranty',
        colorOptions: ['Black', 'White', 'Blue', 'Red'],
        stock: 42
      }

      setProduct(mockProduct)

      const mockRelatedProducts = Array.from({ length: 4 }, (_, i) => ({
        id: i + 100,
        name: `Related Product ${i + 1}`,
        price: 199.99 + (i * 50),
        originalPrice: 299.99 + (i * 75),
        rating: 4 + Math.random(),
        reviewCount: 500 + Math.floor(Math.random() * 500),
        image: `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=60&i=${i}`,
        isPrime: Math.random() > 0.3,
        discount: Math.random() > 0.5 ? 25 : 0
      }))

      setRelatedProducts(mockRelatedProducts)
      setLoading(false)
    }

    fetchProduct()
  }, [id])

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(price)
  }

  const handleAddToCart = () => {
    console.log('Added to cart:', product, 'Quantity:', quantity)
  }

  const handleBuyNow = () => {
    console.log('Buy now:', product, 'Quantity:', quantity)
    navigate('/checkout')
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

  return (
    <div className={styles.productPage}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <a href="/">Home</a>
          <span>›</span>
          <a href="/electronics">Electronics</a>
          <span>›</span>
          <a href="/headphones">Headphones</a>
          <span>›</span>
          <span className={styles.current}>{product.name}</span>
        </nav>

        <div className={styles.productLayout}>
          {/* Product Images */}
          <div className={styles.imageSection}>
            <div className={styles.mainImage}>
              <img 
                src={productImages[selectedImage]} 
                alt={product.name}
                className={styles.selectedImage}
              />
            </div>
            
            <div className={styles.thumbnailGrid}>
              {productImages.map((image, index) => (
                <button
                  key={index}
                  className={`${styles.thumbnail} ${selectedImage === index ? styles.active : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={image} alt={`View ${index + 1}`} />
                </button>
              ))}
            </div>
            
            <div className={styles.imageActions}>
              <button className={styles.shareBtn}>
                <FontAwesomeIcon icon={faShare} />
                Share
              </button>
              <button className={styles.wishlistBtn}>
                <FontAwesomeIcon icon={faHeart} />
                Add to Wishlist
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className={styles.infoSection}>
            <h1 className={styles.productTitle}>{product.name}</h1>
            
            <div className={styles.brandInfo}>
              <span>Brand: </span>
              <strong>{product.brand}</strong>
            </div>
            
            <div className={styles.ratingSection}>
              <div className={styles.stars}>
                {renderStars(product.rating)}
              </div>
              <a href="#reviews" className={styles.ratingCount}>
                {product.rating} ({product.reviewCount} ratings)
              </a>
              <span className={styles.divider}>|</span>
              <a href="#questions" className={styles.questions}>
                142 answered questions
              </a>
            </div>
            
            <div className={styles.priceSection}>
              <div className={styles.priceRow}>
                <span className={styles.currentPrice}>{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
                )}
                <span className={styles.discount}>
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                </span>
              </div>
              <div className={styles.installment}>
                <strong>Save EXTRA with No Cost EMI</strong>
              </div>
            </div>
            
            <div className={styles.primeBadge}>
              <FontAwesomeIcon icon={faTruck} />
              <div>
                <strong>FREE delivery</strong>
                <span>Tomorrow, 9am - 12pm. Order within 5 hrs 30 mins</span>
              </div>
            </div>
            
            <div className={styles.warrantyBadge}>
              <FontAwesomeIcon icon={faShieldAlt} />
              <div>
                <strong>1 Year Warranty</strong>
                <span>Manufacturer warranty</span>
              </div>
            </div>
            
            <div className={styles.colorSection}>
              <h3>Color:</h3>
              <div className={styles.colorOptions}>
                {product.colorOptions.map((color, index) => (
                  <button
                    key={index}
                    className={styles.colorOption}
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                  />
                ))}
              </div>
            </div>
            
            <div className={styles.quantitySection}>
              <h3>Quantity:</h3>
              <div className={styles.quantitySelector}>
                <button 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button 
                  onClick={() => setQuantity(prev => prev + 1)}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              <span className={styles.stockInfo}>
                {product.stock} items left
              </span>
            </div>
            
            <div className={styles.actionButtons}>
              <button className={styles.addToCartBtn} onClick={handleAddToCart}>
                <FontAwesomeIcon icon={faCartPlus} />
                Add to Cart
              </button>
              <button className={styles.buyNowBtn} onClick={handleBuyNow}>
                Buy Now
              </button>
            </div>
            
            <div className={styles.securityNote}>
              <FontAwesomeIcon icon={faShieldAlt} />
              <span>Secure transaction</span>
            </div>
            
            <div className={styles.soldBy}>
              <span>Ships from and sold by </span>
              <strong>Amazon.eg</strong>
            </div>
          </div>

          {/* Product Details */}
          <div className={styles.detailsSection}>
            <div className={styles.detailsCard}>
              <h2>About this item</h2>
              <div className={styles.productDescription}>
                <p>{product.description}</p>
              </div>
              
              <div className={styles.featuresList}>
                <h3>Key Features:</h3>
                <ul>
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              
              <div className={styles.specifications}>
                <h3>Specifications:</h3>
                <div className={styles.specGrid}>
                  <div className={styles.specItem}>
                    <span>Brand</span>
                    <span>{product.brand}</span>
                  </div>
                  <div className={styles.specItem}>
                    <span>Model</span>
                    <span>ATH-M50xBT2</span>
                  </div>
                  <div className={styles.specItem}>
                    <span>Connectivity</span>
                    <span>Bluetooth 5.2</span>
                  </div>
                  <div className={styles.specItem}>
                    <span>Battery Life</span>
                    <span>30 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <section className={styles.relatedProducts}>
          <h2 className={styles.relatedTitle}>Customers who viewed this item also viewed</h2>
          <div className={styles.relatedGrid}>
            {relatedProducts.map(relatedProduct => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default ProductPage
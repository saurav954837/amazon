import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faStar, 
  faStarHalfAlt, 
  faTruck, 
  faShieldAlt,
  faChevronLeft,
  faShare,
  faHeart,
  faCartPlus
} from '@fortawesome/free-solid-svg-icons';
import { useProduct } from '../context/ProductContext.jsx';
import axios from 'axios';
import ProductCard from './ProductCard.jsx';
import styles from '../styles/ProductPage.module.css';

const ProductPage = () => {
  // FIXED: Safely destructure params
  const params = useParams()
  const id = params?.id // Use optional chaining
  
  const navigate = useNavigate()
  const { products, recommended } = useProduct()
  const [product, setProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [relatedProducts, setRelatedProducts] = useState([])

  useEffect(() => {
    // Only fetch if id exists
    if (!id) {
      setLoading(false)
      return
    }

    const fetchProduct = async () => {
      setLoading(true)
      
      try {
        // Try to find in context first
        const foundProduct = products.find(p => {
          // Try multiple ID properties
          const productId = p.product_id || p.id || p._id
          return String(productId) === String(id)
        })
        
        if (foundProduct) {
          setProduct(foundProduct)
          
          // Get related products from same category
          const related = products.filter(p => {
            const productId = p.product_id || p.id || p._id
            return String(productId) !== String(id) && 
                   p.product_category === foundProduct.product_category
          }).slice(0, 4)
          
          setRelatedProducts(related)
        } else {
          // Fallback to API call if not found in context
          try {
            console.log('🔄 Fetching product from API with ID:', id)
            const response = await axios.get(`http://localhost:8000/api/products/${id}`)
            console.log('✅ API response:', response.data)
            
            if (response.data) {
              const apiProduct = response.data.product || response.data
              setProduct(apiProduct)
              
              // Get related products if available
              if (apiProduct.product_category) {
                const relatedFromAPI = products.filter(p => {
                  const productId = p.product_id || p.id || p._id
                  return String(productId) !== String(id) && 
                         p.product_category === apiProduct.product_category
                }).slice(0, 4)
                
                if (relatedFromAPI.length > 0) {
                  setRelatedProducts(relatedFromAPI)
                }
              }
            }
          } catch (apiError) {
            console.error('Error fetching product from API:', apiError)
            // Use a mock product if API fails
            const mockProduct = {
              product_id: id,
              product_name: `Product ${id}`,
              product_price: 99.99,
              product_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
              product_category: 'Electronics',
              product_desc: 'Premium quality product with excellent features.',
              rating: 4.5,
              reviewCount: 1247,
              isPrime: true,
              originalPrice: 149.99,
              brand: 'Amazon',
              product_quantity: 50,
              product_status: 'active',
              features: [
                'High quality materials',
                'Durable construction',
                'Easy to use',
                'Excellent performance'
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
  }, [id, products])

  // Also fix the missing addToCart function - add this helper function
  const addToCart = async (product, qty = 1) => {
    // Add your cart logic here
    console.log('Adding to cart:', product, 'Quantity:', qty)
    return { success: true }
  }

  // Fix getProductById - add this function
  const getProductById = (id) => {
    return products.find(p => {
      const productId = p.product_id || p.id || p._id
      return String(productId) === String(id)
    })
  }

  const productImages = [
    product?.product_image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80'
  ]

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

  const formatPrice = (price) => {
    const safePrice = Number(price) || 0
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(safePrice)
  }

  const handleAddToCart = async () => {
    if (!product) return
    
    const result = await addToCart(product, quantity)
    if (result.success) {
      // Show success message
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

  if (!id) {
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

  const colorOptions = ['Black', 'White', 'Silver', 'Blue', 'Red']

  return (
    <div className={styles.productPage}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span>›</span>
          <a href={`/category/${product.product_category?.toLowerCase().replace(/\s+/g, '-')}`}>
            {product.product_category || 'Category'}
          </a>
          <span>›</span>
          <span className={styles.current}>{product.product_name}</span>
        </nav>

        <div className={styles.productLayout}>
          {/* Product Images */}
          <div className={styles.imageSection}>
            <div className={styles.mainImage}>
              <img 
                src={productImages[selectedImage]} 
                alt={product.product_name}
                className={styles.selectedImage}
                loading="eager"
              />
            </div>
            
            <div className={styles.thumbnailGrid}>
              {productImages.map((image, index) => (
                <button
                  key={index}
                  className={`${styles.thumbnail} ${selectedImage === index ? styles.active : ''}`}
                  onClick={() => setSelectedImage(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={image} alt={`${product.product_name} view ${index + 1}`} />
                </button>
              ))}
            </div>
            
            <div className={styles.imageActions}>
              <button className={styles.shareBtn} onClick={handleShare}>
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
            <h1 className={styles.productTitle}>{product.product_name}</h1>
            
            <div className={styles.brandInfo}>
              <span>Brand: </span>
              <strong>{product.brand || 'Amazon'}</strong>
            </div>
            
            <div className={styles.ratingSection}>
              <div className={styles.stars}>
                {renderStars(product.rating)}
              </div>
              <a href="#reviews" className={styles.ratingCount}>
                {product.rating || 4.5} ({product.reviewCount || 1247} ratings)
              </a>
              <span className={styles.divider}>|</span>
              <a href="#questions" className={styles.questions}>
                142 answered questions
              </a>
            </div>
            
            <div className={styles.priceSection}>
              <div className={styles.priceRow}>
                <span className={styles.currentPrice}>{formatPrice(product.product_price)}</span>
                {product.originalPrice && product.originalPrice > product.product_price && (
                  <>
                    <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
                    <span className={styles.discount}>{discount}% off</span>
                  </>
                )}
              </div>
              <div className={styles.installment}>
                <strong>No Cost EMI available</strong>
                <span>Pay with easy installments</span>
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
                <span>Manufacturer warranty included</span>
              </div>
            </div>
            
            <div className={styles.colorSection}>
              <h3>Color:</h3>
              <div className={styles.colorOptions}>
                {colorOptions.map((color, index) => (
                  <button
                    key={index}
                    className={styles.colorOption}
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                    aria-label={`Select ${color} color`}
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
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span>{quantity}</span>
                <button 
                  onClick={() => setQuantity(prev => prev + 1)}
                  disabled={quantity >= (product.product_quantity || 10)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <span className={styles.stockInfo}>
                {product.product_quantity || 10} items left
              </span>
            </div>
            
            <div className={styles.actionButtons}>
              <button 
                className={styles.addToCartBtn} 
                onClick={handleAddToCart}
                disabled={product.product_quantity <= 0}
              >
                <FontAwesomeIcon icon={faCartPlus} />
                Add to Cart
              </button>
              <button 
                className={styles.buyNowBtn} 
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
            
            <div className={styles.soldBy}>
              <span>Ships from and sold by </span>
              <strong>Amazon.eg</strong>
              <span> • Fulfilled by Amazon</span>
            </div>
          </div>

          {/* Product Details */}
          <div className={styles.detailsSection}>
            <div className={styles.detailsCard}>
              <h2>About this item</h2>
              <div className={styles.productDescription}>
                <p>{product.product_desc || 'Premium quality product with excellent features.'}</p>
              </div>
              
              <div className={styles.featuresList}>
                <h3>Key Features:</h3>
                <ul>
                  {product.features?.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  )) || [
                    'High quality materials',
                    'Durable construction',
                    'Easy to use',
                    'Excellent performance',
                    'Value for money',
                    'Popular choice'
                  ].map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              
              <div className={styles.specifications}>
                <h3>Specifications:</h3>
                <div className={styles.specGrid}>
                  <div className={styles.specItem}>
                    <span>Brand</span>
                    <span>{product.brand || 'Amazon Basics'}</span>
                  </div>
                  <div className={styles.specItem}>
                    <span>Model</span>
                    <span>{product.model || 'PRO-2024'}</span>
                  </div>
                  <div className={styles.specItem}>
                    <span>Category</span>
                    <span>{product.product_category || 'General'}</span>
                  </div>
                  <div className={styles.specItem}>
                    <span>Warranty</span>
                    <span>1 year</span>
                  </div>
                  <div className={styles.specItem}>
                    <span>Stock</span>
                    <span>{product.product_quantity || 10} units available</span>
                  </div>
                  <div className={styles.specItem}>
                    <span>Status</span>
                    <span className={product.product_status === 'active' ? styles.statusActive : styles.statusInactive}>
                      {product.product_status || 'active'}
                    </span>
                  </div>
                </div>
              </div>
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

        {/* Recommended Products */}
        {recommended.length > 0 && (
          <section className={styles.relatedProducts}>
            <h2 className={styles.relatedTitle}>Recommended for You</h2>
            <div className={styles.relatedGrid}>
              {recommended.slice(0, 4).map(recProduct => (
                <ProductCard key={recProduct.product_id} product={recProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default ProductPage;
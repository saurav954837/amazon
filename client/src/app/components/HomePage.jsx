import { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useProduct } from '../context/ProductContext.jsx';
import styles from '../styles/Homepage.module.css';

const MemoizedProductCard = memo(ProductCard);

const Homepage = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  const { featuredProducts, deals, recommended, loading, error } = useProduct()
  const navigate = useNavigate()

  const heroSlides = [
    {
      id: 1,
      title: 'Up to 70% off | Deals on electronics',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1500&q=80',
      link: '/deals/electronics',
      mobileImage: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2,
      title: 'Home refresh made easy',
      image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=1500&q=80',
      link: '/deals/home',
      mobileImage: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 3,
      title: 'Fashion deals you will love',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1500&q=80',
      link: '/deals/fashion',
      mobileImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 4,
      title: 'Top picks for your home',
      image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1500&q=80',
      link: '/deals/kitchen',
      mobileImage: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80'
    }
  ]

  const handleProductAction = useCallback((action, productId) => {
    navigate('/register', { 
      state: { 
        redirect: '/checkout',
        message: `Please sign up to ${action} this product`,
        productId: productId
      }
    })
  }, [navigate])

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [heroSlides.length, isTransitioning])

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [heroSlides.length, isTransitioning])

  useEffect(() => {
    const interval = setInterval(nextSlide, 7000)
    return () => clearInterval(interval)
  }, [nextSlide])

  const handleIndicatorClick = useCallback((index) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [currentSlide, isTransitioning])

  // Show loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading products...</p>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error loading products</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className={styles.retryButton}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={styles.homepage}>
      <div className={styles.heroSection}>
        <div className={styles.heroCarousel}>
          <div className={styles.slidesContainer} style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {heroSlides.map((slide) => (
              <div
                key={slide.id}
                className={styles.heroSlide}
                aria-hidden={currentSlide !== slide.id - 1}
              >
                <picture>
                  <source media="(max-width: 768px)" srcSet={slide.mobileImage} />
                  <img 
                    src={slide.image} 
                    alt={slide.title}
                    className={styles.slideImage}
                    loading={slide.id === 1 ? "eager" : "lazy"}
                  />
                </picture>
                <div className={styles.slideContent}>
                  <h2 className={styles.slideTitle}>{slide.title}</h2>
                  <a href={slide.link} className={styles.shopNowBtn} aria-label={`Shop now for ${slide.title}`}>
                    Shop now
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            className={styles.carouselBtn} 
            onClick={prevSlide}
            aria-label="Previous slide"
            disabled={isTransitioning}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <button 
            className={`${styles.carouselBtn} ${styles.nextBtn}`} 
            onClick={nextSlide}
            aria-label="Next slide"
            disabled={isTransitioning}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
          
          <div className={styles.carouselIndicators}>
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={`${styles.indicator} ${index === currentSlide ? styles.active : ''}`}
                onClick={() => handleIndicatorClick(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentSlide}
                disabled={isTransitioning}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {featuredProducts.length > 0 && (
          <section className={styles.productSection} aria-labelledby="featured-products">
            <div className={styles.sectionHeader}>
              <h2 id="featured-products" className={styles.sectionTitle}>Featured Products</h2>
              <a href="/products" className={styles.seeAllLink}>See all</a>
            </div>
            <div className={styles.productsGrid}>
              {featuredProducts.map(product => (
                <MemoizedProductCard 
                  key={product.product_id || product.id} 
                  product={product} 
                  onAddToCart={() => handleProductAction('add to cart', product.product_id || product.id)}
                  onBuyNow={() => handleProductAction('buy', product.product_id || product.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Today's Deals Section */}
        {deals.length > 0 && (
          <section className={styles.productSection} aria-labelledby="todays-deals">
            <div className={styles.sectionHeader}>
              <h2 id="todays-deals" className={styles.sectionTitle}>Today's Deals</h2>
              <a href="/deals" className={styles.seeAllLink}>See all deals</a>
            </div>
            <div className={styles.productsGrid}>
              {deals.map(product => (
                <MemoizedProductCard 
                  key={product.product_id || product.id} 
                  product={product} 
                  onAddToCart={() => handleProductAction('add to cart', product.product_id || product.id)}
                  onBuyNow={() => handleProductAction('buy', product.product_id || product.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Recommended Products Section */}
        {recommended.length > 0 && (
          <section className={styles.productSection} aria-labelledby="recommended">
            <div className={styles.sectionHeader}>
              <h2 id="recommended" className={styles.sectionTitle}>Recommended for You</h2>
              <a href="/recommended" className={styles.seeAllLink}>See more</a>
            </div>
            <div className={styles.productsGrid}>
              {recommended.map(product => (
                <MemoizedProductCard 
                  key={product.product_id || product.id} 
                  product={product} 
                  onAddToCart={() => handleProductAction('add to cart', product.product_id || product.id)}
                  onBuyNow={() => handleProductAction('buy', product.product_id || product.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Categories Section */}
        <section className={styles.categoriesSection} aria-labelledby="shop-categories">
          <h2 id="shop-categories" className={styles.sectionTitle}>Shop by Category</h2>
          <div className={styles.categoriesGrid}>
            {[
              { name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=300&q=80' },
              { name: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=300&q=80' },
              { name: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=300&q=80' },
              { name: 'Beauty & Personal Care', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=300&q=80' },
              { name: 'Sports & Outdoors', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=300&q=80' },
            ].map((category, index) => (
              <a 
                key={index} 
                href={`/category/${category.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} 
                className={styles.categoryCard}
                aria-label={`Browse ${category.name}`}
              >
                <div className={styles.categoryImageWrapper}>
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className={styles.categoryImage}
                    loading="lazy"
                  />
                </div>
                <h3 className={styles.categoryName}>{category.name}</h3>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
};

export default Homepage;
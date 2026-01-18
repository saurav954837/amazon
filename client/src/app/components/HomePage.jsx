import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import {
  faChevronLeft,
  faChevronRight,
  faFastBackward,
  faFastForward
} from '@fortawesome/free-solid-svg-icons';
import { useProduct } from '../context/ProductContext.jsx';
import { useAuth } from '../hooks/authHook.js';
import styles from '../styles/Homepage.module.css';

const MemoizedProductCard = memo(ProductCard);

const Homepage = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(8)

  const { products, loading, error } = useProduct()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const topOfPageRef = useRef(null)

  const heroSlides = [
    {
      id: 1,
      title: 'Up to 70% off | Deals on electronics',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1500&q=80',
      link: '',
      mobileImage: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2,
      title: 'Home refresh made easy',
      image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=1500&q=80',
      link: '',
      mobileImage: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 3,
      title: 'Fashion deals you will love',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1500&q=80',
      link: '',
      mobileImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 4,
      title: 'Top picks for your home',
      image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1500&q=80',
      link: '',
      mobileImage: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=800&q=80'
    }
  ]

  // Calculate pagination
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(products.length / productsPerPage)

  // Scroll to top of page function
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, [])

  // Handle page change with scroll to top
  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber)
    setTimeout(() => {
      scrollToTop()
    }, 100)
  }, [scrollToTop])

  const nextPage = useCallback(() => {
    const nextPageNum = Math.min(currentPage + 1, totalPages)
    setCurrentPage(nextPageNum)
    scrollToTop()
  }, [currentPage, totalPages, scrollToTop])

  const prevPage = useCallback(() => {
    const prevPageNum = Math.max(currentPage - 1, 1)
    setCurrentPage(prevPageNum)
    scrollToTop()
  }, [currentPage, scrollToTop])

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1)
    scrollToTop()
  }, [scrollToTop])

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages)
    scrollToTop()
  }, [totalPages, scrollToTop])

  const handleProductAction = useCallback((action, productId) => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          redirect: '/products',
          message: `Please login to ${action} this product`,
          productId: productId
        }
      })
    } else {
      if (action === 'add to cart') {
        console.log('Adding to cart:', productId)
      } else if (action === 'buy') {
        console.log('Buying product:', productId)
      }
    }
  }, [isAuthenticated, navigate])

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

  const handleIndicatorClick = useCallback((index) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [currentSlide, isTransitioning])

  useEffect(() => {
    const interval = setInterval(nextSlide, 7000)
    return () => clearInterval(interval)
  }, [nextSlide])

  // Generate page numbers
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      let startPage = Math.max(1, currentPage - 2)
      let endPage = Math.min(totalPages, currentPage + 2)

      if (currentPage <= 3) {
        endPage = maxPagesToShow
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxPagesToShow + 1
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }
    }

    return pageNumbers
  }

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
    <div className={styles.homepage} ref={topOfPageRef}>
      {isAuthenticated && (
        <div className={styles.welcomeBanner}>
          {/* Add floating particles for visual effect */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={styles.welcomeParticle}
              style={{
                width: "20px",
                height: "20px",
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`
              }}
            />
          ))}

          <div className={styles.welcomeContent}>
            <div className={styles.welcomeText}>
              <div className={styles.userIcon}>
                <FontAwesomeIcon icon={faUser} />
              </div>
              <div className={styles.userGreeting}>
                Welcome back, <span className={styles.userName}>{user?.first_name} {user?.last_name}</span>
              </div>
            </div>

            <button
              className={`${styles.dashboardBtn} ${user?.role === 'admin' ? styles.admin : styles.user}`}
              onClick={() => navigate(user?.role === 'admin' ? '/admin-dashboard' : '/dashboard')}
            >
              {user?.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
        </div>
      )}

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
        {/* All Products Section with Pagination */}
        <section
          className={styles.allProductsSection}
          aria-labelledby="all-products"
        >
          <div className={styles.sectionHeader}>
            <h2 id="all-products" className={styles.sectionTitle}>
              All Products <span className={styles.productCount}>({products.length} products)</span>
            </h2>

            {/* Optional: Add a "Back to Top" button */}
            {products.length > productsPerPage && (
              <button
                className={styles.backToTopBtn}
                onClick={scrollToTop}
                aria-label="Scroll to top of page"
              >
                ↑ Top
              </button>
            )}
          </div>

          {/* Product Grid */}
          <div className={styles.productsGrid}>
            {currentProducts.map(product => (
              <MemoizedProductCard
                key={product.product_id || product.id}
                product={product}
                onAddToCart={() => handleProductAction('add to cart', product.product_id || product.id)}
                onBuyNow={() => handleProductAction('buy', product.product_id || product.id)}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>

          {/* Pagination Component */}
          {products.length > productsPerPage && (
            <div className={styles.paginationContainer}>
              <div className={styles.paginationInfo}>
                Showing {indexOfFirstProduct + 1} - {Math.min(indexOfLastProduct, products.length)} of {products.length} products
              </div>

              <nav className={styles.pagination} aria-label="Product pagination">
                <button
                  className={styles.paginationBtn}
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  aria-label="Go to first page"
                >
                  <FontAwesomeIcon icon={faFastBackward} />
                </button>

                <button
                  className={styles.paginationBtn}
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  aria-label="Go to previous page"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>

                {/* Page Numbers */}
                <div className={styles.pageNumbers}>
                  {getPageNumbers().map(number => (
                    <button
                      key={number}
                      className={`${styles.pageBtn} ${currentPage === number ? styles.active : ''}`}
                      onClick={() => handlePageChange(number)}
                      aria-label={`Go to page ${number}`}
                      aria-current={currentPage === number ? 'page' : undefined}
                    >
                      {number}
                    </button>
                  ))}
                </div>

                <button
                  className={styles.paginationBtn}
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  aria-label="Go to next page"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>

                <button
                  className={styles.paginationBtn}
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                  aria-label="Go to last page"
                >
                  <FontAwesomeIcon icon={faFastForward} />
                </button>
              </nav>
            </div>
          )}
        </section>

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
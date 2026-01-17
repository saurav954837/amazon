import { useState, useEffect } from 'react'
import ProductCard from './ProductCard.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import styles from '../styles/Homepage.module.css';

const Homepage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [deals, setDeals] = useState([])
  const [recommended, setRecommended] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)

  const heroSlides = [
    {
      id: 1,
      title: 'Up to 70% off | Deals on electronics',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1500',
      link: '/deals/electronics'
    },
    {
      id: 2,
      title: 'Home refresh made easy',
      image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=1500',
      link: '/deals/home'
    },
    {
      id: 3,
      title: 'Fashion deals you will love',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1500',
      link: '/deals/fashion'
    },
    {
      id: 4,
      title: 'Top picks for your home',
      image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1500',
      link: '/deals/kitchen'
    }
  ]

  useEffect(() => {
    const mockProducts = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      name: `Product ${i + 1}`,
      price: 99.99 + (i * 10),
      originalPrice: 149.99 + (i * 15),
      rating: 4 + Math.random(),
      reviewCount: 100 + Math.floor(Math.random() * 900),
      image: `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=60&i=${i}`,
      isPrime: Math.random() > 0.5,
      discount: Math.random() > 0.7 ? 30 : 0
    }))

    setFeaturedProducts(mockProducts.slice(0, 4))
    setDeals(mockProducts.slice(4, 8))
    setRecommended(mockProducts.slice(8, 12))
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={styles.homepage}>
      {/* Hero Carousel */}
      <div className={styles.heroSection}>
        <div className={styles.heroCarousel}>
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`${styles.heroSlide} ${index === currentSlide ? styles.active : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className={styles.slideContent}>
                <h2 className={styles.slideTitle}>{slide.title}</h2>
                <a href={slide.link} className={styles.shopNowBtn}>
                  Shop now
                </a>
              </div>
            </div>
          ))}
          
          <button className={styles.carouselBtn} onClick={prevSlide}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <button className={`${styles.carouselBtn} ${styles.nextBtn}`} onClick={nextSlide}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
          
          <div className={styles.carouselIndicators}>
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={`${styles.indicator} ${index === currentSlide ? styles.active : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className={styles.container}>
        {/* Featured Products */}
        <section className={styles.productSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Featured Products</h2>
            <a href="/products" className={styles.seeAllLink}>See all</a>
          </div>
          <div className={styles.productsGrid}>
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Today's Deals */}
        <section className={styles.productSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Today's Deals</h2>
            <a href="/deals" className={styles.seeAllLink}>See all deals</a>
          </div>
          <div className={styles.productsGrid}>
            {deals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Recommended for You */}
        <section className={styles.productSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recommended for You</h2>
            <a href="/recommended" className={styles.seeAllLink}>See more</a>
          </div>
          <div className={styles.productsGrid}>
            {recommended.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className={styles.categoriesSection}>
          <h2 className={styles.sectionTitle}>Shop by Category</h2>
          <div className={styles.categoriesGrid}>
            {[
              { name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=300&q=80' },
              { name: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=300&q=80' },
              { name: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=300&q=80' },
              { name: 'Beauty & Personal Care', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=300&q=80' },
              { name: 'Sports & Outdoors', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=300&q=80' },
              { name: 'Books', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80' },
            ].map((category, index) => (
              <a key={index} href={`/category/${category.name.toLowerCase()}`} className={styles.categoryCard}>
                <div 
                  className={styles.categoryImage}
                  style={{ backgroundImage: `url(${category.image})` }}
                />
                <h3 className={styles.categoryName}>{category.name}</h3>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Homepage
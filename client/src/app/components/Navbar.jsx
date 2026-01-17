import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faBars, 
  faFire, 
  faGift, 
  faMobile, 
  faTv,
  faLaptop,
  faHome,
  faUtensils,
  faShirt,
  faHeart,
  faCar,
  faGamepad,
  faBaby,
  faBook
} from '@fortawesome/free-solid-svg-icons'
import styles from '../styles/Navbar.module.css'

const Navbar = () => {
  const [showAllCategories, setShowAllCategories] = useState(false)

  const categories = [
    { icon: faFire, label: 'Today\'s Deals', color: '#E47911' },
    { icon: faGift, label: 'Gift Cards', color: '#007185' },
    { icon: faMobile, label: 'Mobile Phones', color: '#0F1111' },
    { icon: faTv, label: 'Electronics', color: '#0F1111' },
    { icon: faLaptop, label: 'Computers', color: '#0F1111' },
    { icon: faHome, label: 'Home & Kitchen', color: '#0F1111' },
    { icon: faUtensils, label: 'Grocery', color: '#0F1111' },
    { icon: faShirt, label: 'Fashion', color: '#0F1111' },
    { icon: faHeart, label: 'Health & Beauty', color: '#0F1111' },
    { icon: faCar, label: 'Automotive', color: '#0F1111' },
    { icon: faGamepad, label: 'Toys & Games', color: '#0F1111' },
    { icon: faBaby, label: 'Baby Products', color: '#0F1111' },
    { icon: faBook, label: 'Books', color: '#0F1111' },
  ]

  const visibleCategories = showAllCategories ? categories : categories.slice(0, 8)

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.navContent}>
          <button 
            className={styles.allCategoriesBtn}
            onMouseEnter={() => setShowAllCategories(true)}
            onMouseLeave={() => setShowAllCategories(false)}
          >
            <FontAwesomeIcon icon={faBars} className={styles.menuIcon} />
            <span>All</span>
          </button>

          <div className={styles.navLinks}>
            {visibleCategories.map((category, index) => (
              <Link 
                key={index}
                to={`/category/${category.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={styles.navLink}
                onMouseEnter={() => category.label === 'All' && setShowAllCategories(true)}
              >
                <FontAwesomeIcon 
                  icon={category.icon} 
                  className={styles.categoryIcon}
                  style={{ color: category.color }}
                />
                <span>{category.label}</span>
              </Link>
            ))}
            
            {!showAllCategories && categories.length > 8 && (
              <button 
                className={styles.moreBtn}
                onClick={() => setShowAllCategories(true)}
              >
                More
              </button>
            )}
          </div>

          {showAllCategories && (
            <div 
              className={styles.allCategoriesDropdown}
              onMouseEnter={() => setShowAllCategories(true)}
              onMouseLeave={() => setShowAllCategories(false)}
            >
              <div className={styles.dropdownContent}>
                <div className={styles.dropdownGrid}>
                  {categories.map((category, index) => (
                    <Link 
                      key={index}
                      to={`/category/${category.label.toLowerCase().replace(/\s+/g, '-')}`}
                      className={styles.dropdownItem}
                    >
                      <FontAwesomeIcon 
                        icon={category.icon} 
                        className={styles.dropdownIcon}
                        style={{ color: category.color }}
                      />
                      <span>{category.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar;
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
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
} from '@fortawesome/free-solid-svg-icons';
import styles from '../../styles/CategoriesGrid.module.css';

const CategoriesGrid = () => {
  const categories = [
    { icon: faMobile, label: 'Electronics', path: 'electronics' },
    { icon: faLaptop, label: 'Computers', path: 'computers' },
    { icon: faMobile, label: 'Mobile Phones', path: 'phones' },
    { icon: faHome, label: 'Home & Kitchen', path: 'home-kitchen' },
    { icon: faUtensils, label: 'Grocery', path: 'grocery' },
    { icon: faShirt, label: 'Fashion', path: 'fashion' },
    { icon: faHeart, label: 'Health & Beauty', path: 'health-beauty' },
    { icon: faCar, label: 'Automotive', path: 'automotive' },
    { icon: faGamepad, label: 'Toys & Games', path: 'toys-games' },
    { icon: faBaby, label: 'Baby Products', path: 'baby-products' },
    { icon: faBook, label: 'Books', path: 'books' },
    { icon: faTv, label: 'TV & Audio', path: 'tv-audio' }
  ];

  return (
    <div className={styles.categoriesGrid}>
      <div className={styles.header}>
        <h2 className={styles.title}>Shop by Category</h2>
        <p className={styles.subtitle}>Browse products by your favorite categories</p>
      </div>
      
      <div className={styles.grid}>
        {categories.map((category, index) => (
          <Link 
            key={index}
            to={`/category/${category.path}`}
            className={styles.categoryCard}
          >
            <div className={styles.iconWrapper}>
              <FontAwesomeIcon 
                icon={category.icon} 
                className={styles.categoryIcon}
              />
            </div>
            <h3 className={styles.categoryLabel}>{category.label}</h3>
            <div className={styles.arrowIcon}>→</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesGrid;
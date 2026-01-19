import { useState } from 'react';
import { useProduct } from '../context/ProductContext.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/AddToCartButton.module.css';

const AddToCartButton = ({ product, variant = 'default' }) => {
  const { addToCart, cart, updateCartQuantity } = useProduct();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const isInCart = cart.some(item => item.product_id === product.product_id);
  const cartItem = cart.find(item => item.product_id === product.product_id);
  const cartQuantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = async () => {
    if (isAdding) return;
    
    setIsAdding(true);
    try {
      if (isInCart) {
        await updateCartQuantity(product.product_id, cartQuantity + 1);
      } else {
        await addToCart(product, 1);
      }
      
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const getButtonClass = () => {
    if (variant === 'large') return styles.largeButton;
    if (variant === 'small') return styles.smallButton;
    return styles.defaultButton;
  };

  const getButtonContent = () => {
    if (isAdding) {
      return (
        <>
          <FontAwesomeIcon icon={faSpinner} className={styles.spinnerIcon} />
          <span>Adding...</span>
        </>
      );
    }
    
    if (added) {
      return (
        <>
          <FontAwesomeIcon icon={faCheck} className={styles.checkIcon} />
          <span>Added!</span>
        </>
      );
    }
    
    if (isInCart) {
      return (
        <>
          <FontAwesomeIcon icon={faShoppingCart} className={styles.cartIcon} />
          <span>In Cart ({cartQuantity})</span>
        </>
      );
    }
    
    return (
      <>
        <FontAwesomeIcon icon={faShoppingCart} className={styles.cartIcon} />
        <span>Add to Cart</span>
      </>
    );
  };

  const buttonClass = getButtonClass();
  const isDisabled = product.product_quantity <= 0;

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding || isDisabled}
      className={`${buttonClass} ${isInCart ? styles.inCart : ''} ${added ? styles.added : ''} ${isDisabled ? styles.disabled : ''}`}
      aria-label={isInCart ? `Update quantity (${cartQuantity} in cart)` : 'Add to cart'}
    >
      {getButtonContent()}
    </button>
  );
};

export default AddToCartButton;
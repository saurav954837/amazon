import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faTrash, faShoppingCart, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProduct } from '../../context/ProductContext.jsx';
import styles from '../../styles/CartSidebar.module.css';
import { useState } from 'react';

const CartSidebar = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateCartQuantity } = useProduct();
  const navigate = useNavigate();
  const location = useLocation();
  const [isUpdating, setIsUpdating] = useState({});

  const isCartPage = location.pathname === '/user/cart';

  const formatPrice = (price) => {
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice === 0) return 'EGP 0.00';
    
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(numPrice);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      const price = Number(item.product_price) || 0;
      const quantity = Number(item.quantity) || 0;
      return total + (price * quantity);
    }, 0);
  };

  const handleCheckout = () => {
    if (onClose) onClose();
    navigate('/checkout');
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  const handleQuantityUpdate = async (productId, newQuantity) => {
    if (isUpdating[productId]) return;
    
    setIsUpdating(prev => ({ ...prev, [productId]: true }));
    
    try {
      if (newQuantity < 1) {
        await removeFromCart(productId);
      } else {
        await updateCartQuantity(productId, newQuantity);
      }
    } finally {
      setTimeout(() => {
        setIsUpdating(prev => ({ ...prev, [productId]: false }));
      }, 300);
    }
  };

  if (!isCartPage && !isOpen) return null;

  return (
    <div className={`${styles.cartOverlay} ${isCartPage ? styles.fullPage : ''}`} onClick={!isCartPage ? onClose : undefined}>
      <div className={`${styles.cartSidebar} ${isCartPage ? styles.fullPageSidebar : ''}`} onClick={e => !isCartPage && e.stopPropagation()}>
        <div className={styles.cartHeader}>
          <h2 className={styles.cartTitle}>
            <FontAwesomeIcon icon={faShoppingCart} />
            Shopping Cart ({cart.length})
          </h2>
          <button className={styles.closeBtn} onClick={handleClose}>
            {isCartPage ? (
              <>
                <FontAwesomeIcon icon={faArrowLeft} />
                <span className={styles.backText}>Back</span>
              </>
            ) : (
              <FontAwesomeIcon icon={faTimes} />
            )}
          </button>
        </div>

        <div className={styles.cartContent}>
          {cart.length === 0 ? (
            <div className={styles.emptyCart}>
              <FontAwesomeIcon icon={faShoppingCart} className={styles.emptyIcon} />
              <p>Your cart is empty</p>
              <button className={styles.continueShopping} onClick={handleClose}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className={styles.cartItems}>
                {cart.map(item => {
                  const itemPrice = Number(item.product_price) || 0;
                  const itemQuantity = Number(item.quantity) || 0;
                  
                  return (
                    <div key={item.product_id} className={styles.cartItem}>
                      <img src={item.product_image} alt={item.product_name} className={styles.itemImage} />
                      <div className={styles.itemInfo}>
                        <h3 className={styles.itemName}>{item.product_name}</h3>
                        <div className={styles.itemPrice}>{formatPrice(itemPrice)}</div>
                        <div className={styles.itemActions}>
                          <div className={styles.quantityControls}>
                            <button 
                              onClick={() => handleQuantityUpdate(item.product_id, itemQuantity - 1)}
                              className={styles.quantityBtn}
                              disabled={itemQuantity <= 1 || isUpdating[item.product_id]}
                            >
                              -
                            </button>
                            <span className={styles.quantity}>{itemQuantity}</span>
                            <button 
                              onClick={() => handleQuantityUpdate(item.product_id, itemQuantity + 1)}
                              className={styles.quantityBtn}
                              disabled={isUpdating[item.product_id]}
                            >
                              +
                            </button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.product_id)}
                            className={styles.removeBtn}
                            disabled={isUpdating[item.product_id]}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.cartSummary}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>{formatPrice(calculateTotal())}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Shipping</span>
                  <span className={styles.freeShipping}>FREE</span>
                </div>
                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                  <span>Total</span>
                  <span className={styles.totalPrice}>{formatPrice(calculateTotal())}</span>
                </div>
              </div>

              <div className={styles.cartActions}>
                <button className={styles.checkoutBtn} onClick={handleCheckout}>
                  Proceed to Checkout
                </button>
                <button className="btn btn-dark p-3" onClick={handleClose}>
                  Continue Shopping
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebar;
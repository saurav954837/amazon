import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faTrash, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useProduct } from '../context/ProductContext.jsx';
import styles from '../styles/CartSidebar.module.css';

const CartSidebar = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateCartQuantity } = useProduct()
  const navigate = useNavigate()

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(price)
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleCheckout = () => {
    onClose()
    navigate('/checkout')
  }

  if (!isOpen) return null

  return (
    <div className={styles.cartOverlay} onClick={onClose}>
      <div className={styles.cartSidebar} onClick={e => e.stopPropagation()}>
        <div className={styles.cartHeader}>
          <h2 className={styles.cartTitle}>
            <FontAwesomeIcon icon={faShoppingCart} />
            Shopping Cart ({cart.length})
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.cartContent}>
          {cart.length === 0 ? (
            <div className={styles.emptyCart}>
              <FontAwesomeIcon icon={faShoppingCart} className={styles.emptyIcon} />
              <p>Your cart is empty</p>
              <button className={styles.continueShopping} onClick={onClose}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className={styles.cartItems}>
                {cart.map(item => (
                  <div key={item.product_id} className={styles.cartItem}>
                    <img src={item.image} alt={item.name} className={styles.itemImage} />
                    <div className={styles.itemInfo}>
                      <h3 className={styles.itemName}>{item.name}</h3>
                      <div className={styles.itemPrice}>{formatPrice(item.price)}</div>
                      <div className={styles.itemActions}>
                        <div className={styles.quantityControls}>
                          <button 
                            onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                            className={styles.quantityBtn}
                          >
                            -
                          </button>
                          <span className={styles.quantity}>{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                            className={styles.quantityBtn}
                          >
                            +
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.product_id)}
                          className={styles.removeBtn}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
                <button className={styles.continueBtn} onClick={onClose}>
                  Continue Shopping
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CartSidebar;
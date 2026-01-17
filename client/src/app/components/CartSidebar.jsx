import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, faTrash, faShoppingCart } from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from 'react-router-dom'
import styles from '../styles/CartSidebar.module.css';

const CartSidebar = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Wireless Headphones', price: 299.99, quantity: 1, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80' },
    { id: 2, name: 'Smart Watch', price: 199.99, quantity: 2, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80' },
    { id: 3, name: 'Laptop Stand', price: 49.99, quantity: 1, image: 'https://images.unsplash.com/photo-1545235617-9465d2a55698?auto=format&fit=crop&w=200&q=80' }
  ])
  const navigate = useNavigate()

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(price)
  }

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const updateQuantity = (id, delta) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    )
  }

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id))
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
            Shopping Cart
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className={styles.cartContent}>
          {cartItems.length === 0 ? (
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
                {cartItems.map(item => (
                  <div key={item.id} className={styles.cartItem}>
                    <img src={item.image} alt={item.name} className={styles.itemImage} />
                    <div className={styles.itemInfo}>
                      <h3 className={styles.itemName}>{item.name}</h3>
                      <div className={styles.itemPrice}>{formatPrice(item.price)}</div>
                      <div className={styles.itemActions}>
                        <div className={styles.quantityControls}>
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className={styles.quantityBtn}
                          >
                            -
                          </button>
                          <span className={styles.quantity}>{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className={styles.quantityBtn}
                          >
                            +
                          </button>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
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
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCreditCard,
  faTruck,
  faHome,
  faLock,
  faArrowLeft,
  faCheckCircle,
  faShieldAlt,
  faTag
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useProduct } from '../../context/ProductContext.jsx';
import styles from '../../styles/CheckoutPage.module.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, clearCart, getCartTotal } = useProduct();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [formData, setFormData] = useState({
    shipping_address: '',
    payment_method: 'cod',
    email: '',
    phone: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (cart.length === 0 && !orderSuccess) {
      navigate('/cart');
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setFormData(prev => ({
      ...prev,
      email: user.email || '',
      phone: user.phone || ''
    }));
  }, [cart, navigate, orderSuccess]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.shipping_address.trim()) {
      errors.shipping_address = 'Shipping address is required';
    } else if (formData.shipping_address.trim().length < 10) {
      errors.shipping_address = 'Address must be at least 10 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9+\-\s]{10,15}$/.test(formData.phone)) {
      errors.phone = 'Phone number is invalid';
    }

    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const calculateTax = () => {
    const subtotal = getCartTotal();
    return subtotal * 0.14;
  };

  const calculateShipping = () => {
    return getCartTotal() > 500 ? 0 : 50;
  };

  const calculateTotal = () => {
    return getCartTotal() + calculateTax() + calculateShipping();
  };

  const handlePlaceOrder = async () => {
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      
      const orderItems = cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.price
      }));

      const orderData = {
        shipping_address: formData.shipping_address,
        payment_method: formData.payment_method,
        cart_items: orderItems
      };

      const response = await axios.post('http://localhost:8000/api/orders/', orderData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setOrderDetails(response.data.data);
        setOrderSuccess(true);
        clearCart();
        
        localStorage.setItem('lastOrder', JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error('Order placement error:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(price);
  };

  if (orderSuccess && orderDetails) {
    return (
      <div className={styles.successContainer}>
        <div className={styles.successCard}>
          <FontAwesomeIcon icon={faCheckCircle} className={styles.successIcon} />
          <h1>Order Confirmed!</h1>
          <p className={styles.successMessage}>
            Thank you for your purchase. Your order has been placed successfully.
          </p>
          
          <div className={styles.orderSummary}>
            <div className={styles.summaryItem}>
              <span>Order ID:</span>
              <strong>#{orderDetails.order.order_id}</strong>
            </div>
            <div className={styles.summaryItem}>
              <span>Total Amount:</span>
              <strong>{formatPrice(orderDetails.order.total_amount)}</strong>
            </div>
            <div className={styles.summaryItem}>
              <span>Status:</span>
              <span className={styles.statusBadge}>{orderDetails.order.status}</span>
            </div>
            <div className={styles.summaryItem}>
              <span>Payment:</span>
              <span>{orderDetails.order.payment_method.toUpperCase()}</span>
            </div>
          </div>

          <div className={styles.actionButtons}>
            <button 
              onClick={() => navigate('/user-dashboard')}
              className={styles.dashboardButton}
            >
              View Order History
            </button>
            <button 
              onClick={() => navigate('/')}
              className={styles.continueButton}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.checkoutContainer}>
      <div className={styles.checkoutHeader}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Cart
        </button>
        <h1 className={styles.pageTitle}>Checkout</h1>
      </div>

      <div className={styles.checkoutContent}>
        <div className={styles.leftColumn}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <FontAwesomeIcon icon={faHome} />
              <h2>Shipping Address</h2>
            </div>
            <div className={styles.formGroup}>
              <label>Full Address</label>
              <textarea
                name="shipping_address"
                value={formData.shipping_address}
                onChange={handleInputChange}
                placeholder="Enter your complete shipping address including street, city, and postal code"
                rows="3"
                className={`${styles.textarea} ${formErrors.shipping_address ? styles.inputError : ''}`}
              />
              {formErrors.shipping_address && (
                <span className={styles.errorText}>{formErrors.shipping_address}</span>
              )}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`${styles.input} ${formErrors.email ? styles.inputError : ''}`}
                />
                {formErrors.email && (
                  <span className={styles.errorText}>{formErrors.email}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+20 123 456 7890"
                  className={`${styles.input} ${formErrors.phone ? styles.inputError : ''}`}
                />
                {formErrors.phone && (
                  <span className={styles.errorText}>{formErrors.phone}</span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <FontAwesomeIcon icon={faCreditCard} />
              <h2>Payment Method</h2>
            </div>
            
            <div className={styles.paymentMethods}>
              <label className={styles.paymentOption}>
                <input
                  type="radio"
                  name="payment_method"
                  value="cod"
                  checked={formData.payment_method === 'cod'}
                  onChange={handleInputChange}
                />
                <div className={styles.paymentContent}>
                  <FontAwesomeIcon icon={faTruck} />
                  <div>
                    <h4>Cash on Delivery</h4>
                    <p>Pay when you receive your order</p>
                  </div>
                </div>
              </label>

              <label className={styles.paymentOption}>
                <input
                  type="radio"
                  name="payment_method"
                  value="credit_card"
                  checked={formData.payment_method === 'credit_card'}
                  onChange={handleInputChange}
                  disabled
                />
                <div className={styles.paymentContent}>
                  <FontAwesomeIcon icon={faCreditCard} />
                  <div>
                    <h4>Credit/Debit Card</h4>
                    <p>Pay securely with your card</p>
                    <span className={styles.comingSoon}>Coming Soon</span>
                  </div>
                </div>
              </label>
            </div>

            <div className={styles.securityNote}>
              <FontAwesomeIcon icon={faShieldAlt} />
              <span>Your payment information is secure and encrypted</span>
            </div>
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.orderSummary}>
            <h3>Order Summary</h3>
            
            <div className={styles.summaryItems}>
              {cart.map(item => (
                <div key={item.product_id} className={styles.summaryItem}>
                  <img src={item.image} alt={item.name} className={styles.itemImage} />
                  <div className={styles.itemDetails}>
                    <h4>{item.name}</h4>
                    <div className={styles.itemMeta}>
                      <span>{formatPrice(item.price)} × {item.quantity}</span>
                      <span className={styles.itemTotal}>
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.priceBreakdown}>
              <div className={styles.priceRow}>
                <span>Subtotal</span>
                <span>{formatPrice(getCartTotal())}</span>
              </div>
              <div className={styles.priceRow}>
                <span>Shipping</span>
                <span>{calculateShipping() === 0 ? 'FREE' : formatPrice(calculateShipping())}</span>
              </div>
              <div className={styles.priceRow}>
                <span>Tax (14%)</span>
                <span>{formatPrice(calculateTax())}</span>
              </div>
              {calculateShipping() === 0 && (
                <div className={styles.discountNote}>
                  <FontAwesomeIcon icon={faTag} />
                  <span>Free shipping applied on orders over 500 EGP</span>
                </div>
              )}
              <div className={`${styles.priceRow} ${styles.totalRow}`}>
                <span>Total</span>
                <span className={styles.totalPrice}>{formatPrice(calculateTotal())}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading || cart.length === 0}
              className={styles.placeOrderButton}
            >
              {loading ? (
                <>
                  <div className={styles.spinner}></div>
                  Processing...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faLock} />
                  Place Order
                </>
              )}
            </button>

            <p className={styles.terms}>
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBox,
  faTruck,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faEye,
  faCalendar,
  faReceipt
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import styles from '../styles/UserOrders.module.css';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.get('http://localhost:8000/api/orders/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setOrders(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`http://localhost:8000/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setSelectedOrder(response.data.data);
        setShowDetails(true);
      }
    } catch (err) {
      console.error('Failed to fetch order details:', err);
      alert('Failed to load order details');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(
        `http://localhost:8000/api/orders/${orderId}/cancel`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        fetchUserOrders();
        if (selectedOrder && selectedOrder.order.order_id === orderId) {
          setSelectedOrder(response.data.data);
        }
      }
    } catch (err) {
      console.error('Failed to cancel order:', err);
      alert(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return faClock;
      case 'processing': return faBox;
      case 'shipped': return faTruck;
      case 'delivered': return faCheckCircle;
      case 'cancelled': return faTimesCircle;
      default: return faBox;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'processing': return '#3b82f6';
      case 'shipped': return '#8b5cf6';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return 'EGP 0.00';
    
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 2
    }).format(numPrice);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && orders.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className={styles.userOrders}>
      <div className={styles.header}>
        <FontAwesomeIcon icon={faReceipt} className={styles.headerIcon} />
        <h1>My Orders</h1>
        <button onClick={fetchUserOrders} className={styles.refreshButton}>
          Refresh
        </button>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className={styles.emptyOrders}>
          <FontAwesomeIcon icon={faBox} className={styles.emptyIcon} />
          <h3>No orders yet</h3>
          <p>You haven't placed any orders yet. Start shopping!</p>
          <button onClick={() => window.location.href = '/'} className={styles.shopButton}>
            Start Shopping
          </button>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {orders.map(order => (
            <div key={order.order_id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderInfo}>
                  <h3 className={styles.orderId}>Order #{order.order_id}</h3>
                  <div className={styles.orderMeta}>
                    <span className={styles.orderDate}>
                      <FontAwesomeIcon icon={faCalendar} />
                      {formatDate(order.created_at)}
                    </span>
                    <span className={styles.itemCount}>
                      {order.item_count} items
                    </span>
                  </div>
                </div>
                <div className={styles.orderStatus}>
                  <FontAwesomeIcon 
                    icon={getStatusIcon(order.status)} 
                    style={{ color: getStatusColor(order.status) }}
                  />
                  <span 
                    className={styles.statusText}
                    style={{ color: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              <div className={styles.orderContent}>
                <div className={styles.orderDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Payment:</span>
                    <span className={styles.detailValue}>{order.payment_status}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Items Total:</span>
                    <span className={styles.detailValue}>{order.total_quantity} items</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Order Total:</span>
                    <span className={styles.totalPrice}>{formatPrice(order.total_amount)}</span>
                  </div>
                </div>

                <div className={styles.orderActions}>
                  <button
                    onClick={() => fetchOrderDetails(order.order_id)}
                    className={styles.viewButton}
                  >
                    <FontAwesomeIcon icon={faEye} />
                    View Details
                  </button>
                  
                  {(order.status === 'pending' || order.status === 'processing') && (
                    <button
                      onClick={() => handleCancelOrder(order.order_id)}
                      className={styles.cancelButton}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDetails && selectedOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Order Details - #{selectedOrder.order.order_id}</h2>
              <button onClick={() => setShowDetails(false)} className={styles.modalClose}>
                ×
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.detailSection}>
                <h3>Order Summary</h3>
                <div className={styles.summaryGrid}>
                  <div className={styles.summaryItem}>
                    <span>Order Status:</span>
                    <span 
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(selectedOrder.order.status) }}
                    >
                      {selectedOrder.order.status}
                    </span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Payment Status:</span>
                    <span>{selectedOrder.order.payment_status}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Payment Method:</span>
                    <span>{selectedOrder.order.payment_method.toUpperCase()}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Order Date:</span>
                    <span>{formatDate(selectedOrder.order.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>Shipping Address</h3>
                <p className={styles.shippingAddress}>{selectedOrder.order.shipping_address}</p>
              </div>

              <div className={styles.detailSection}>
                <h3>Order Items ({selectedOrder.items.length})</h3>
                <div className={styles.itemsList}>
                  {selectedOrder.items.map(item => (
                    <div key={item.order_item_id} className={styles.itemRow}>
                      <img 
                        src={item.product_image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'}
                        alt={item.product_name}
                        className={styles.itemImage}
                      />
                      <div className={styles.itemDetails}>
                        <h4>{item.product_name}</h4>
                        <p className={styles.itemCategory}>{item.product_category}</p>
                        <div className={styles.itemMeta}>
                          <span>Quantity: {item.quantity}</span>
                          <span>Price: {formatPrice(item.price_at_purchase)}</span>
                          <span className={styles.itemTotal}>
                            Total: {formatPrice(item.price_at_purchase * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.priceBreakdown}>
                <div className={styles.priceRow}>
                  <span>Items Total:</span>
                  <span>
                    {formatPrice(selectedOrder.items.reduce((sum, item) => sum + (item.price_at_purchase * item.quantity), 0))}
                  </span>
                </div>
                <div className={styles.priceRow}>
                  <span>Shipping:</span>
                  <span>FREE</span>
                </div>
                <div className={styles.priceRow}>
                  <span>Tax:</span>
                  <span>
                    {formatPrice(selectedOrder.order.total_amount - selectedOrder.items.reduce((sum, item) => sum + (item.price_at_purchase * item.quantity), 0))}
                  </span>
                </div>
                <div className={`${styles.priceRow} ${styles.totalRow}`}>
                  <span>Order Total:</span>
                  <span className={styles.finalTotal}>
                    {formatPrice(selectedOrder.order.total_amount)}
                  </span>
                </div>
              </div>

              {(selectedOrder.order.status === 'pending' || selectedOrder.order.status === 'processing') && (
                <div className={styles.cancelSection}>
                  <button
                    onClick={() => {
                      handleCancelOrder(selectedOrder.order.order_id);
                      setShowDetails(false);
                    }}
                    className={styles.cancelOrderButton}
                  >
                    Cancel This Order
                  </button>
                </div>
              )}
            </div>

            <div className={styles.modalActions}>
              <button onClick={() => setShowDetails(false)} className={styles.closeButton}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;
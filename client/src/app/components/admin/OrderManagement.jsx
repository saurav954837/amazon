import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBox,
  faSearch,
  faFilter,
  faEye,
  faEdit,
  faTrash,
  faRefresh,
  faTimes,
  faCheck,
  faTruck,
  faCreditCard,
  faHome,
  faUser,
  faCalendar,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import styles from '../../styles/OrderManagement.module.css';

const OrderManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending', color: '#f59e0b' },
    { value: 'processing', label: 'Processing', color: '#3b82f6' },
    { value: 'shipped', label: 'Shipped', color: '#8b5cf6' },
    { value: 'delivered', label: 'Delivered', color: '#10b981' },
    { value: 'cancelled', label: 'Cancelled', color: '#ef4444' }
  ];

  const paymentStatusOptions = [
    { value: 'all', label: 'All Payments' },
    { value: 'pending', label: 'Pending', color: '#f59e0b' },
    { value: 'paid', label: 'Paid', color: '#10b981' },
    { value: 'failed', label: 'Failed', color: '#ef4444' }
  ];

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.get(`http://localhost:8000/api/orders/?page=${page}&status=${selectedStatus}&search=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setOrders(response.data.data.orders || []);
        setFilteredOrders(response.data.data.orders || []);
        setTotalPages(response.data.data.totalPages || 1);
        setCurrentPage(response.data.data.page || 1);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://localhost:8000/api/orders/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, []);

  useEffect(() => {
    let filtered = orders;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    if (selectedPaymentStatus !== 'all') {
      filtered = filtered.filter(order => order.payment_status === selectedPaymentStatus);
    }

    setFilteredOrders(filtered);
  }, [selectedStatus, selectedPaymentStatus, orders]);

  const handleSearch = () => {
    fetchOrders(1);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (!window.confirm(`Change order status to ${newStatus}?`)) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(
        `http://localhost:8000/api/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        fetchOrders(currentPage);
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update order status');
    }
  };

  const handlePaymentStatusUpdate = async (orderId, newPaymentStatus) => {
    if (!window.confirm(`Change payment status to ${newPaymentStatus}?`)) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(
        `http://localhost:8000/api/orders/${orderId}/payment`,
        { payment_status: newPaymentStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        fetchOrders(currentPage);
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to update payment status:', err);
      alert('Failed to update payment status');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.delete(
        `http://localhost:8000/api/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        fetchOrders(currentPage);
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to delete order:', err);
      alert('Failed to delete order');
    }
  };

  const handleViewOrderDetails = async (orderId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `http://localhost:8000/api/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setSelectedOrder(response.data.data);
        setShowOrderModal(true);
      }
    } catch (err) {
      console.error('Failed to fetch order details:', err);
      alert('Failed to load order details');
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.color : '#6b7280';
  };

  const getPaymentStatusBadge = (status) => {
    const option = paymentStatusOptions.find(opt => opt.value === status);
    return option ? option.color : '#6b7280';
  };

  if (loading && !orders.length) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className={styles.orderManagement}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitle}>
            <FontAwesomeIcon icon={faBox} className={styles.headerIcon} />
            <h1>Order Management</h1>
          </div>
          <button onClick={() => navigate('/admin-dashboard')} className={styles.backButton}>
            Back to Dashboard
          </button>
        </div>
      </header>

      <div className={styles.content}>
        {error && (
          <div className={styles.errorAlert}>
            <span>{error}</span>
            <button onClick={() => setError('')} className={styles.closeError}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        )}

        <div className={styles.controls}>
          <div className={styles.searchContainer}>
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by Order ID, Username, or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className={styles.searchInput}
            />
            <button onClick={handleSearch} className={styles.searchButton}>
              Search
            </button>
          </div>

          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <FontAwesomeIcon icon={faFilter} className={styles.filterIcon} />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={styles.filterSelect}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <FontAwesomeIcon icon={faCreditCard} className={styles.filterIcon} />
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className={styles.filterSelect}
              >
                {paymentStatusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={() => setShowStats(!showStats)} className={styles.statsButton}>
              <FontAwesomeIcon icon={faChartLine} />
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </button>

            <button onClick={fetchOrders} className={styles.refreshButton}>
              <FontAwesomeIcon icon={faRefresh} />
              Refresh
            </button>
          </div>
        </div>

        {showStats && stats && (
          <div className={styles.statsContainer}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <FontAwesomeIcon icon={faBox} className={styles.statIcon} />
                  <h3>Total Orders</h3>
                </div>
                <div className={styles.statValue}>{stats.stats.total_orders}</div>
                <div className={styles.statLabel}>Last 30 Days</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <FontAwesomeIcon icon={faCreditCard} className={styles.statIcon} />
                  <h3>Total Revenue</h3>
                </div>
                <div className={styles.statValue}>{formatPrice(stats.stats.total_revenue)}</div>
                <div className={styles.statLabel}>Last 30 Days</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <FontAwesomeIcon icon={faCheck} className={styles.statIcon} />
                  <h3>Delivered Orders</h3>
                </div>
                <div className={styles.statValue}>{stats.stats.delivered_orders}</div>
                <div className={styles.statLabel}>Completed</div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <FontAwesomeIcon icon={faTimes} className={styles.statIcon} />
                  <h3>Cancelled Orders</h3>
                </div>
                <div className={styles.statValue}>{stats.stats.cancelled_orders}</div>
                <div className={styles.statLabel}>Last 30 Days</div>
              </div>
            </div>
          </div>
        )}

        <div className={styles.ordersTableContainer}>
          <table className={styles.ordersTable}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className={styles.noOrders}>
                    <FontAwesomeIcon icon={faBox} />
                    <p>No orders found</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.order_id}>
                    <td className={styles.orderId}>#{order.order_id}</td>
                    <td className={styles.customerInfo}>
                      <div className={styles.customerName}>{order.username}</div>
                      <div className={styles.customerEmail}>{order.email}</div>
                    </td>
                    <td className={styles.orderDate}>
                      <FontAwesomeIcon icon={faCalendar} />
                      {formatDate(order.created_at)}
                    </td>
                    <td className={styles.orderItems}>
                      <span className={styles.itemCount}>{order.item_count || 0}</span>
                      <span className={styles.itemQuantity}>({order.total_quantity || 0} items)</span>
                    </td>
                    <td className={styles.orderTotal}>{formatPrice(order.total_amount)}</td>
                    <td>
                      <span 
                        className={styles.statusBadge}
                        style={{ backgroundColor: getStatusBadge(order.status) }}
                      >
                        {order.status}
                      </span>
                      <div className={styles.statusActions}>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.order_id, e.target.value)}
                          className={styles.statusSelect}
                        >
                          {statusOptions.filter(opt => opt.value !== 'all').map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td>
                      <span 
                        className={styles.paymentBadge}
                        style={{ backgroundColor: getPaymentStatusBadge(order.payment_status) }}
                      >
                        {order.payment_status}
                      </span>
                      <div className={styles.paymentActions}>
                        <select
                          value={order.payment_status}
                          onChange={(e) => handlePaymentStatusUpdate(order.order_id, e.target.value)}
                          className={styles.paymentSelect}
                        >
                          {paymentStatusOptions.filter(opt => opt.value !== 'all').map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className={styles.actions}>
                      <button
                        onClick={() => handleViewOrderDetails(order.order_id)}
                        className={styles.viewButton}
                        title="View Details"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.order_id)}
                        className={styles.deleteButton}
                        title="Delete Order"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => {
                  if (currentPage > 1) {
                    fetchOrders(currentPage - 1);
                  }
                }}
                disabled={currentPage === 1}
                className={styles.pageButton}
              >
                Previous
              </button>
              
              <span className={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => {
                  if (currentPage < totalPages) {
                    fetchOrders(currentPage + 1);
                  }
                }}
                disabled={currentPage === totalPages}
                className={styles.pageButton}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {showOrderModal && selectedOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Order Details - #{selectedOrder.order.order_id}</h2>
              <button onClick={() => setShowOrderModal(false)} className={styles.modalClose}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.orderDetails}>
                <div className={styles.detailSection}>
                  <h3>
                    <FontAwesomeIcon icon={faUser} />
                    Customer Information
                  </h3>
                  <div className={styles.detailGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Customer:</span>
                      <span className={styles.detailValue}>{selectedOrder.order.username}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Email:</span>
                      <span className={styles.detailValue}>{selectedOrder.order.email}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Phone:</span>
                      <span className={styles.detailValue}>{selectedOrder.order.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3>
                    <FontAwesomeIcon icon={faHome} />
                    Shipping Information
                  </h3>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Address:</span>
                    <span className={styles.detailValue}>{selectedOrder.order.shipping_address}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Payment Method:</span>
                    <span className={styles.detailValue}>{selectedOrder.order.payment_method.toUpperCase()}</span>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h3>
                    <FontAwesomeIcon icon={faBox} />
                    Order Items ({selectedOrder.items.length})
                  </h3>
                  <div className={styles.orderItemsList}>
                    {selectedOrder.items.map(item => (
                      <div key={item.order_item_id} className={styles.orderItem}>
                        <img 
                          src={item.product_image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'} 
                          alt={item.product_name}
                          className={styles.itemImage}
                        />
                        <div className={styles.itemDetails}>
                          <h4>{item.product_name}</h4>
                          <div className={styles.itemMeta}>
                            <span>Quantity: {item.quantity}</span>
                            <span>Price: {formatPrice(item.price_at_purchase)}</span>
                            <span>Subtotal: {formatPrice(item.price_at_purchase * item.quantity)}</span>
                          </div>
                          <div className={styles.itemCategory}>
                            Category: {item.product_category}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.orderSummary}>
                  <div className={styles.summaryRow}>
                    <span>Subtotal:</span>
                    <span>{formatPrice(selectedOrder.items.reduce((sum, item) => sum + (item.price_at_purchase * item.quantity), 0))}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Shipping:</span>
                    <span>FREE</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Tax:</span>
                    <span>{formatPrice(selectedOrder.order.total_amount - selectedOrder.items.reduce((sum, item) => sum + (item.price_at_purchase * item.quantity), 0))}</span>
                  </div>
                  <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                    <span>Total:</span>
                    <span>{formatPrice(selectedOrder.order.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button onClick={() => setShowOrderModal(false)} className={styles.closeButton}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
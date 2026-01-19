import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faUserShield,
  faUserEdit,
  faTrash,
  faSearch,
  faFilter,
  faEye,
  faTimes,
  faCheck,
  faCalendar,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import styles from '../../styles/UserManagement.module.css';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    role: 'user'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.get('http://localhost:8000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setUsers(response.data.data || []);
        setFilteredUsers(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, selectedRole, users]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      username: user.username,
      role: user.role
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(
        `http://localhost:8000/api/admin/users/${editingUser.user_id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        await fetchUsers();
        setShowModal(false);
        setEditingUser(null);
      }
    } catch (err) {
      console.error('Failed to update user:', err);
      setError('Failed to update user');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.delete(`http://localhost:8000/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        await fetchUsers();
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
      setError('Failed to delete user');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadge = (role) => {
    return role === 'admin' ? styles.roleAdmin : styles.roleUser;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className={styles.userManagement}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTitle}>
            <FontAwesomeIcon icon={faUserShield} className={styles.headerIcon} />
            <h1>User Management</h1>
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
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterContainer}>
            <FontAwesomeIcon icon={faFilter} className={styles.filterIcon} />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>

          <button onClick={fetchUsers} className={styles.refreshButton}>
            <FontAwesomeIcon icon={faUser} />
            Refresh
          </button>
        </div>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Users</span>
            <span className={styles.statValue}>{users.length}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Admins</span>
            <span className={styles.statValue}>
              {users.filter(u => u.role === 'admin').length}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Regular Users</span>
            <span className={styles.statValue}>
              {users.filter(u => u.role === 'user').length}
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Active Today</span>
            <span className={styles.statValue}>
              {users.filter(u => {
                const today = new Date().toDateString();
                const lastLogin = u.last_login ? new Date(u.last_login).toDateString() : '';
                return lastLogin === today;
              }).length}
            </span>
          </div>
        </div>

        <div className={styles.usersTableContainer}>
          <table className={styles.usersTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Email</th>
                <th>Username</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className={styles.noUsers}>
                    <FontAwesomeIcon icon={faUser} />
                    <p>No users found</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.user_id}>
                    <td className={styles.userId}>{user.user_id}</td>
                    <td>
                      <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>
                          <FontAwesomeIcon icon={faUser} />
                        </div>
                        <div>
                          <strong>{user.first_name} {user.last_name}</strong>
                        </div>
                      </div>
                    </td>
                    <td className={styles.userEmail}>
                      <FontAwesomeIcon icon={faEnvelope} />
                      {user.email}
                    </td>
                    <td className={styles.userUsername}>@{user.username}</td>
                    <td>
                      <span className={`${styles.roleBadge} ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className={styles.userDate}>
                      <FontAwesomeIcon icon={faCalendar} />
                      {formatDate(user.created_at)}
                    </td>
                    <td className={styles.userDate}>
                      {user.last_login ? (
                        <>
                          <FontAwesomeIcon icon={faCalendar} />
                          {formatDate(user.last_login)}
                        </>
                      ) : 'Never'}
                    </td>
                    <td className={styles.actions}>
                      <button
                        onClick={() => handleEdit(user)}
                        className={styles.editButton}
                        title="Edit User"
                      >
                        <FontAwesomeIcon icon={faUserEdit} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.user_id)}
                        className={styles.deleteButton}
                        title="Delete User"
                        disabled={user.role === 'admin'}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Edit User</h2>
              <button onClick={() => setShowModal(false)} className={styles.modalClose}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                    className={styles.formInput}
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={styles.formInput}
                  />
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className={styles.formInput}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" className={styles.saveButton}>
                  <FontAwesomeIcon icon={faCheck} />
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
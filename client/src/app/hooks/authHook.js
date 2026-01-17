import React, { useState, useEffect, useCallback, useContext, createContext } from 'react'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'

const AuthContext = createContext(null);
const authApi = axios.create({
    baseURL: 'http://localhost:5000/api', // CHANGED
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

authApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

authApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const refreshToken = localStorage.getItem('refreshToken')
                const response = await axios.post(
                    'http://localhost:5000/api/auth/refresh-token', // CHANGED
                    { refreshToken }
                )

                const { accessToken, refreshToken: newRefreshToken } = response.data

                localStorage.setItem('accessToken', accessToken)
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken)
                }

                originalRequest.headers.Authorization = `Bearer ${accessToken}`
                return authApi(originalRequest)
            } catch (refreshError) {
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                localStorage.removeItem('user')
                window.location.href = '/login'
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
);

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('accessToken')
            const storedUser = localStorage.getItem('user')

            if (token && storedUser) {
                try {
                    const response = await authApi.get('/auth/verify')
                    setUser(JSON.parse(storedUser));
                } catch (err) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        initAuth()
    }, []);

    const login = useCallback(async (email, password) => {
        setLoading(true)
        setError(null);

        try {
            const response = await authApi.post('/auth/login', {
                email,
                password,
            });

            const { accessToken, refreshToken, user: userData } = response.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(userData));

            setUser(userData);

            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });

            return { success: true, user: userData };
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed'
            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setLoading(false)
        }
    }, [navigate, location]);
    
    const register = useCallback(async (userData) => {
        setLoading(true)
        setError(null)

        try {
            const response = await authApi.post('/auth/register', userData)

            const { accessToken, refreshToken, user: registeredUser } = response.data;
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)
            localStorage.setItem('user', JSON.stringify(registeredUser))

            setUser(registeredUser);
            navigate('/', { replace: true });

            return { success: true, user: registeredUser }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Registration failed'
            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setLoading(false)
        }
    }, [navigate])
    
    const logout = useCallback(async () => {
        setLoading(true)

        try {
            await authApi.post('/auth/logout')
        } catch (err) {
            console.error('Logout API error:', err)
        } finally {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            localStorage.removeItem('cart')

            setUser(null)
            setError(null)
            setLoading(false)
            navigate('/login', { replace: true })
        }
    }, [navigate])

    const updateProfile = useCallback(async (userData) => {
        setLoading(true)
        setError(null)

        try {
            const response = await authApi.put('/auth/profile', userData)
            const updatedUser = response.data
            localStorage.setItem('user', JSON.stringify(updatedUser))
            setUser(updatedUser)

            return { success: true, user: updatedUser }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Profile update failed'
            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setLoading(false)
        }
    }, [])

    const changePassword = useCallback(async (currentPassword, newPassword) => {
        setLoading(true)
        setError(null)

        try {
            await authApi.put('/auth/change-password', {
                currentPassword,
                newPassword,
            })

            return { success: true }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Password change failed'
            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setLoading(false)
        }
    }, [])

    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'admin';

    const hasPermission = useCallback((permission) => {
        if (!user) return false

        if (isAdmin) return true

        const userPermissions = user.permissions || []
        return userPermissions.includes(permission)
    }, [user, isAdmin])

    const contextValue = {
        user,
        loading,
        error,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        hasPermission,
        clearError: () => setError(null), 
    };

    return React.createElement(
        AuthContext.Provider,
        { value: contextValue },
        children
    );
};

export default useAuth;
import React, { useState, useEffect, useCallback, useContext, createContext } from 'react'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'

const AuthContext = createContext(null);

const authApi = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // IMPORTANT: This allows cookies to be sent
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
                // Try to refresh token using HTTP-only cookie
                const response = await authApi.post('/auth/refresh-token')
                
                const { accessToken, refreshToken: newRefreshToken } = response.data.data

                localStorage.setItem('accessToken', accessToken)
                if (newRefreshToken) {
                    localStorage.setItem('refreshToken', newRefreshToken)
                }

                originalRequest.headers.Authorization = `Bearer ${accessToken}`
                return authApi(originalRequest)
            } catch (refreshError) {
                // Clear everything on refresh failure
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                localStorage.removeItem('user')
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login'
                }
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

    // Initialize auth on mount
    const initAuth = useCallback(async () => {
        const token = localStorage.getItem('accessToken')
        const storedUser = localStorage.getItem('user')

        if (token && storedUser) {
            try {
                // Verify token with backend
                const response = await authApi.get('/auth/verify')
                if (response.data.success) {
                    setUser(JSON.parse(storedUser))
                } else {
                    // Token invalid, try to refresh
                    await refreshAuth()
                }
            } catch (err) {
                console.log('Token verification failed, trying refresh...')
                await refreshAuth()
            }
        }
        setLoading(false)
    }, [])

    // Refresh authentication
    const refreshAuth = useCallback(async () => {
        try {
            const response = await authApi.post('/auth/refresh-token')
            if (response.data.success) {
                const { accessToken, refreshToken } = response.data.data
                const userResponse = await authApi.get('/auth/profile')
                
                localStorage.setItem('accessToken', accessToken)
                if (refreshToken) {
                    localStorage.setItem('refreshToken', refreshToken)
                }
                localStorage.setItem('user', JSON.stringify(userResponse.data.data.user))
                
                setUser(userResponse.data.data.user)
                return true
            }
        } catch (err) {
            console.log('Refresh failed:', err.message)
            // Clear everything
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            setUser(null)
        }
        return false
    }, [])

    useEffect(() => {
        initAuth()
    }, [initAuth])

    const login = useCallback(async (email, password) => {
        setLoading(true)
        setError(null);

        try {
            const response = await authApi.post('/auth/login', {
                email,
                password,
            });

            const { data: responseData } = response;
            
            if (!responseData.success) {
                throw new Error(responseData.message || 'Login failed')
            }

            const { accessToken, refreshToken, user: userData } = responseData.data;
            
            // Store tokens and user data
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)
            localStorage.setItem('user', JSON.stringify(userData))

            setUser(userData);

            const from = location.state?.from?.pathname || '/'
            navigate(from, { replace: true });

            return { success: true, user: userData };
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Login failed'
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
            const response = await authApi.post('/auth/register', {
                first_name: userData.first_name,
                last_name: userData.last_name,
                email: userData.email,
                password: userData.password,
            })

            const { data: responseData } = response;
            
            if (!responseData.success) {
                throw new Error(responseData.message || 'Registration failed')
            }

            const { accessToken, refreshToken, user: registeredUser } = responseData.data;
            
            localStorage.setItem('accessToken', accessToken)
            localStorage.setItem('refreshToken', refreshToken)
            localStorage.setItem('user', JSON.stringify(registeredUser))
            
            setUser(registeredUser);
            navigate('/', { replace: true });

            return { success: true, user: registeredUser }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Registration failed'
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
            // Clear everything
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
            const updatedUser = response.data.data.user
            localStorage.setItem('user', JSON.stringify(updatedUser))
            setUser(updatedUser)

            return { success: true, user: updatedUser }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Profile update failed'
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
                current_password: currentPassword,
                new_password: newPassword,
            })

            return { success: true }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Password change failed'
            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setLoading(false)
        }
    }, [])

    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'admin';

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
        clearError: () => setError(null), 
    };

    return React.createElement(
        AuthContext.Provider,
        { value: contextValue },
        children
    );
};

export default useAuth;
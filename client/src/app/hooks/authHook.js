import React, { useState, useEffect, useCallback, useContext, createContext } from 'react'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'

const AuthContext = createContext(null);

const API_BASE = 'http://localhost:8000/api';

const authApi = axios.create({
    baseURL: API_BASE,
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

                if (!refreshToken) {
                    throw new Error('No refresh token')
                }

                const response = await authApi.post('/auth/refresh-token', {
                    refresh_token: refreshToken
                })

                if (response.data.success) {
                    const { accessToken } = response.data.data

                    localStorage.setItem('accessToken', accessToken)

                    originalRequest.headers.Authorization = `Bearer ${accessToken}`
                    return authApi(originalRequest)
                }
            } catch (refreshError) {
                console.log('Refresh failed:', refreshError.message)
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                localStorage.removeItem('user')
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login'
                }
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

    const initAuth = useCallback(async () => {
        const token = localStorage.getItem('accessToken')
        const storedUser = localStorage.getItem('user')

        if (token && storedUser) {
            try {
                const response = await authApi.get('/auth/verify')
                if (response.data.success) {
                    const parsedUser = JSON.parse(storedUser)
                    setUser(parsedUser)
                } else {
                    localStorage.removeItem('accessToken')
                    localStorage.removeItem('refreshToken')
                    localStorage.removeItem('user')
                    setUser(null)
                }
            } catch (err) {
                console.log('Token verification failed')
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                localStorage.removeItem('user')
                setUser(null)
            }
        }
        setLoading(false)
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
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            localStorage.removeItem('guestCart')

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
    }, []);

    const refreshAuth = useCallback(async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                throw new Error('No refresh token');
            }

            const response = await authApi.post('/auth/refresh-token', {
                refresh_token: refreshToken
            });

            if (response.data.success) {
                const { accessToken } = response.data.data;

                localStorage.setItem('accessToken', accessToken);

                const userResponse = await authApi.get('/auth/profile');

                localStorage.setItem('user', JSON.stringify(userResponse.data.data.user));

                setUser(userResponse.data.data.user);
                return true;
            }
        } catch (err) {
            console.log('Refresh failed:', err.message);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setUser(null);
        }
        return false;
    }, []);

    const getDashboardPath = useCallback(() => {
        if (user?.role === 'admin') {
            return '/admin-dashboard';
        }
        return '/user-dashboard';
    }, [user]);

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
        refreshAuth,
        getDashboardPath,
        clearError: () => setError(null),
    };

    return React.createElement(
        AuthContext.Provider,
        { value: contextValue },
        children
    );
};

export { authApi };
export default useAuth;
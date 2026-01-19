import React, { Suspense, lazy, useEffect } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Outlet,
  Navigate
} from 'react-router-dom';

// Layout Components
import MainLayout from './app/layout/MainLayout.jsx';
import AuthLayout from './app/layout/AuthLayout.jsx';
import AdminRoute from './app/routes/AdminRoute.jsx';
import GuestRoute from './app/routes/GuestRoute.jsx';

// Context Providers
import { AuthProvider } from './app/hooks/authHook.js';
import { ProductProvider } from './app/context/ProductContext.jsx';

// UI Components
import Loader from './app/ui/Loader.jsx';
import ErrorBoundary from './app/ui/ErrorBoundary.jsx';

// Lazy loaded components
const Homepage = lazy(() => import('./app/components/HomePage.jsx'));
const ProductPage = lazy(() => import('./app/components/ProductPage.jsx'));
const NotFound = lazy(() => import('./app/components/NotFound.jsx'));
const LoginPage = lazy(() => import('./app/components/auth/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./app/components/auth/RegisterPage.jsx'));
const UserDashboard = lazy(() => import('./app/components/guard/UserDashboard.jsx'));
const AdminDashboard = lazy(() => import('./app/components/guard/AdminDashboard.jsx'));
const UnauthorizedPage = lazy(() => import('./app/components/UnauthorizedPage.jsx'));
const CartSidebar = lazy(() => import('./app/components/CartSidebar.jsx'));

// Data loaders for route preloading
import { productLoader, homepageLoader, searchLoader } from './app/utils/dataLoader.js';

// Create router outside component to prevent recreation on re-renders
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={
        <AuthProvider>
          <ProductProvider>
            <MainLayout />
          </ProductProvider>
        </AuthProvider>
      }
      errorElement={<div className="error-page">Something went wrong</div>}
      loader={homepageLoader}
    >
      {/* Public Routes */}
      <Route
        index
        element={
          <Suspense fallback={<Loader />}>
            <Homepage />
          </Suspense>
        }
      />

      {/* Guest Only Routes - Login/Register */}
      <Route element={<GuestRoute />}>
        <Route
          path="login"
          element={
            <Suspense fallback={<Loader />}>
              <LoginPage />
            </Suspense>
          }
        />
        <Route
          path="register"
          element={
            <Suspense fallback={<Loader />}>
              <RegisterPage />
            </Suspense>
          }
        />
      </Route>

      {/* Protected User Routes - Need Authentication */}
      <Route element={<AuthLayout />}>
        <Route
          path="dashboard"
          element={
            <Suspense fallback={<Loader />}>
              <UserDashboard />
            </Suspense>
          }
        />
        
        <Route
          path="orders"
          element={
            <Suspense fallback={<Loader />}>
              <div>Orders</div>
            </Suspense>
          }
        />

        <Route
          path="cart"
          element={
            <Suspense fallback={<Loader />}>
              <CartSidebar />
            </Suspense>
          }
        />
      </Route>

      {/* Admin Only Routes - Need Admin Role */}
      <Route element={<AdminRoute />}>
        <Route
          path="admin-dashboard"
          element={
            <Suspense fallback={<Loader />}>
              <AdminDashboard />
            </Suspense>
          }
        />
        <Route
          path="admin/users"
          element={
            <Suspense fallback={<Loader />}>
              <div>User Management</div>
            </Suspense>
          }
        />
        <Route
          path="admin/products"
          element={
            <Suspense fallback={<Loader />}>
              <div>Product Management</div>
            </Suspense>
          }
        />
        <Route
          path="admin/orders"
          element={
            <Suspense fallback={<Loader />}>
              <div>Order Management</div>
            </Suspense>
          }
        />
      </Route>

      {/* Error and Info Pages */}
      <Route
        path="unauthorized"
        element={
          <Suspense fallback={<Loader />}>
            <UnauthorizedPage />
          </Suspense>
        }
      />

      {/* Product Routes */}
      <Route
        path="products"
        element={
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        }
      >
        <Route
          index
          element={<Homepage />}
          loader={searchLoader}
        />
        <Route
          path=":product_id"
          element={
            <Suspense fallback={<Loader />}>
              <ProductPage />
            </Suspense>
          }
          loader={productLoader}
        />
      </Route>

      {/* Category Routes */}
      <Route
        path="category/:category"
        element={
          <Suspense fallback={<Loader />}>
            <Homepage />
          </Suspense>
        }
        loader={({ params }) => searchLoader(params.category)}
      />

      {/* Search Route */}
      <Route
        path="search"
        element={
          <Suspense fallback={<Loader />}>
            <Homepage />
          </Suspense>
        }
        loader={({ request }) => {
          const url = new URL(request.url);
          const query = url.searchParams.get('q');
          return searchLoader(query);
        }}
      />

      {/* Dashboard Redirects */}
      <Route
        path="admin"
        element={<Navigate to="/admin-dashboard" replace />}
      />
      <Route
        path="user"
        element={<Navigate to="/dashboard" replace />}
      />

      {/* 404 Page */}
      <Route
        path="*"
        element={
          <Suspense fallback={<Loader />}>
            <NotFound />
          </Suspense>
        }
      />
    </Route>
  ),
  {
    basename: '/',
    future: {
      v7_normalizeFormMethod: true,
    },
  }
);

const App = () => {
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('tempData');
      sessionStorage.clear();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    const preloadOnHover = (e) => {
      const link = e.target.closest('a');
      if (link) {
        const href = link.getAttribute('href');
        if (href === '/products') {
          import('./app/components/ProductPage.jsx');
        } else if (href === '/dashboard') {
          import('./app/components/guard/UserDashboard.jsx');
        } else if (href === '/admin-dashboard') {
          import('./app/components/guard/AdminDashboard.jsx');
        }
      }
    };

    document.addEventListener('mouseover', preloadOnHover);
    return () => document.removeEventListener('mouseover', preloadOnHover);
  }, []);

  return (
    <ErrorBoundary>
      <React.StrictMode>
        <RouterProvider
          router={router}
          fallbackElement={
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              background: '#f3f4f6'
            }}>
              <Loader size="large" message="Loading..." />
            </div>
          }
        />
      </React.StrictMode>
    </ErrorBoundary>
  );
};
export default React.memo(App);
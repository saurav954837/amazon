import React, { Suspense, lazy, useEffect } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Outlet,
  Navigate
} from 'react-router-dom';

// Amazon App Layouts
import MainLayout from './app/layout/MainLayout.jsx';
import AuthLayout from './app/layout/AuthLayout.jsx';

// Admin & Guest Routes
import AdminRoute from './app/routes/AdminRoute.jsx';
import GuestRoute from './app/routes/GuestRoute.jsx';

// Amazon App Utilities
import Loader from './app/ui/Loader.jsx';
import ErrorBoundary from './app/ui/ErrorBoundary.jsx';
import DashboardRedirect from './app/components/guard/DashboardRedirect.jsx';

// Amazon App Providers
import { AuthProvider } from './app/hooks/authHook.js';
import { ProductProvider } from './app/context/ProductContext.jsx';

// Amazon Landing
const Homepage = lazy(() => import('./app/components/HomePage.jsx'));
const NotFound = lazy(() => import('./app/components/NotFound.jsx'));

// Authentication & Authorization Lazy Loaded Components
const LoginPage = lazy(() => import('./app/components/auth/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./app/components/auth/RegisterPage.jsx'));
const UnauthorizedPage = lazy(() => import('./app/components/UnauthorizedPage.jsx'));

// User Lazy Loaded Components
const UserDashboard = lazy(() => import('./app/components/guard/UserDashboard.jsx'));
const ProductPage = lazy(() => import('./app/components/store/ProductPage.jsx'));
const CategorizedProducts = lazy(() => import('./app/components/store/CategorizedProducts.jsx'));
const CartSidebar = lazy(() => import('./app/components/store/CartSidebar.jsx'));

// Admin Lazy Loaded Components
const AdminDashboard = lazy(() => import('./app/components/guard/AdminDashboard.jsx'));
const ProductManagement = lazy(() => import('./app/components/admin/ProductManagement.jsx'));
const UserManagement = lazy(() => import('./app/components/admin/UserManagement.jsx'));

import { productLoader, homepageLoader, searchLoader } from './app/utils/dataLoader.js';

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
      <Route
        index
        element={
          <Suspense fallback={<Loader />}>
            <Homepage />
          </Suspense>
        }
      />

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

      <Route element={<AuthLayout />}>
        <Route
          path="user-dashboard"
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
          path="admin/products"
          element={
            <Suspense fallback={<Loader />}>
              <ProductManagement />
            </Suspense>
          }
        />
        <Route
          path="admin/users"
          element={
            <Suspense fallback={<Loader />}>
              <UserManagement />
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

      <Route
        path="unauthorized"
        element={
          <Suspense fallback={<Loader />}>
            <UnauthorizedPage />
          </Suspense>
        }
      />

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

      <Route
        path="category/:categoryName"
        element={
          <Suspense fallback={<Loader />}>
            <CategorizedProducts />
          </Suspense>
        }
      />

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

      <Route
        path="dashboard"
        element={<DashboardRedirect />}
      />

      <Route
        path="admin"
        element={<Navigate to="/admin-dashboard" replace />}
      />

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
          import('./app/components/store/ProductPage.jsx');
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
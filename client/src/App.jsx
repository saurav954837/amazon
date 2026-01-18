import React, { Suspense, lazy } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Outlet
} from 'react-router-dom';
import MainLayout from './app/layout/MainLayout.jsx';
import Loader from './app/ui/Loader.jsx';
import ErrorBoundary from './app/ui/ErrorBoundary.jsx';
import { AuthProvider } from './app/hooks/authHook.js';
import { ProductProvider } from './app/context/ProductContext.jsx'
import RequireAuth from './app/components/auth/RequireAuth.jsx';
import RequireGuest from './app/components/auth/RequireGuest.jsx'

// Lazy load components with preloading
const Homepage = lazy(() => import('./app/components/HomePage.jsx'))
const ProductPage = lazy(() => import('./app/components/ProductPage.jsx'))
const NotFound = lazy(() => import('./app/components/NotFound.jsx'))
const LoginPage = lazy(() => import('./app/components/auth/LoginPage.jsx'))
const RegisterPage = lazy(() => import('./app/components/auth/RegisterPage.jsx'))

// Data loaders
import { productLoader, homepageLoader, searchLoader } from './app/utils/dataLoader.js';

// Error components
import RouteError from './app/ui/RouterError.jsx';
import NetworkError from './app/ui/NetworkError.jsx';

// Performance optimization: Preload critical routes
const preloadRoutes = () => {
  const preloadPromises = [
    import('./app/components/HomePage.jsx'),
    import('./app/components/ProductPage.jsx'),
    import('./app/components/auth/LoginPage.jsx'),
    import('./app/components/auth/RegisterPage.jsx')
  ];

  Promise.allSettled(preloadPromises).catch(() => {
    // Silent fail for preloading
  })
}

// Initialize preloading on app start
if (typeof window !== 'undefined') {
  window.addEventListener('load', preloadRoutes);
  document.addEventListener('mouseover', (e) => {
    const link = e.target.closest('a[href^="/"]')
    if (link) {
      const href = link.getAttribute('href')
      if (href === '/products') {
        import('./app/components/ProductPage.jsx')
      } else if (href === '/login') {
        import('./app/components/auth/LoginPage.jsx')
      } else if (href === '/register') {
        import('./app/components/auth/RegisterPage.jsx')
      }
    }
  }, { passive: true })
};

// Route configuration with nested routes
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
      errorElement={<RouteError />}
      loader={homepageLoader}
      shouldRevalidate={({ currentUrl, nextUrl }) => {
        return currentUrl.pathname !== nextUrl.pathname
      }}
    >
      {/* Public Homepage */}
      <Route
        index
        element={
          <Suspense fallback={<Loader />}>
            <Homepage />
          </Suspense>
        }
        errorElement={<NetworkError />}
      />

      {/* Auth Routes - Public */}
      <Route
        path="login"
        element={
          <RequireGuest>
            <Suspense fallback={<Loader />}>
              <LoginPage />
            </Suspense>
          </RequireGuest>
        }
      />

      <Route
        path="register"
        element={
          <RequireGuest>
            <Suspense fallback={<Loader />}>
              <RegisterPage />
            </Suspense>
          </RequireGuest>
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
          element={<ProductPage />}
          loader={productLoader}
          errorElement={<RouteError />}
          shouldRevalidate={({ currentParams, nextParams }) => {
            return currentParams.product_id !== nextParams.product_id;
          }}
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
          const url = new URL(request.url)
          const query = url.searchParams.get('q')
          return searchLoader(query)
        }}
      />

      {/* Deals & Specials */}
      <Route
        path="deals"
        element={
          <Suspense fallback={<Loader />}>
            <Homepage />
          </Suspense>
        }
        loader={() => searchLoader('deals')}
      />

      <Route
        path="bestsellers"
        element={
          <Suspense fallback={<Loader />}>
            <Homepage />
          </Suspense>
        }
        loader={() => searchLoader('bestsellers')}
      />

      <Route
        path="new"
        element={
          <Suspense fallback={<Loader />}>
            <Homepage />
          </Suspense>
        }
        loader={() => searchLoader('new')}
      />

      {/* Protected User Routes */}

      {/* Protected Admin Routes */}

      {/* Static Pages */}

      {/* Catch-all 404 route */}
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
    basename: process.env.NODE_ENV === 'production' ? '/amazon' : '/',
    future: {
      v7_normalizeFormMethod: true,
      v7_fetcherPersist: true,
      v7_partialHydration: true,
      v7_relativeSplatPath: true,
    },
    window: typeof window !== 'undefined' ? window : undefined,
  }
);

const App = () => {
  const MemoizedRouterProvider = React.memo(RouterProvider)

  return (
    <ErrorBoundary>
      <React.StrictMode>
        <MemoizedRouterProvider
          router={router}
          fallbackElement={
            <div className="app-loading">
              <Loader size="large" message="Loading Amazon Experience..." />
            </div>
          }
        />
      </React.StrictMode>
    </ErrorBoundary>
  )
}

export default React.memo(App);
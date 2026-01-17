import React from 'react';
import { useRouteError, Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h1>Something went wrong</h1>
            <p>We're sorry for the inconvenience. Please try refreshing the page.</p>
            <div className="error-actions">
              <button 
                onClick={() => window.location.reload()}
                className="retry-btn"
              >
                Refresh Page
              </button>
              <Link to="/" className="home-link">
                Go to Homepage
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
};

export default ErrorBoundary;
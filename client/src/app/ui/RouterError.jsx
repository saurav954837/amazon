import { useRouteError, Link } from 'react-router-dom';

const RouteError = () => {
  const error = useRouteError()
  
  console.error('Route Error:', error)

  return (
    <div className="route-error">
      <div className="error-container">
        <h1>Oops!</h1>
        <p>Sorry, an unexpected error has occurred.</p>
        <p className="error-message">
          {error.statusText || error.message}
        </p>
        <div className="error-actions">
          <Link to="/" className="btn-primary">
            Return Home
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="btn-secondary"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
};

export default RouteError;
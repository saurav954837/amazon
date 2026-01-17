import { Link } from 'react-router-dom';

const NetworkError = () => {
  return (
    <div className="network-error">
      <div className="error-content">
        <div className="error-icon">📡</div>
        <h2>Network Connection Lost</h2>
        <p>Please check your internet connection and try again.</p>
        <div className="error-actions">
          <button 
            onClick={() => window.location.reload()}
            className="retry-btn"
          >
            Retry Connection
          </button>
          <Link to="/" className="home-link">
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
};

export default NetworkError;
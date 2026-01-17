import React from 'react';
import '../styles/Loader.module.css';

const Loader = ({ size = 'medium', message = 'Loading...' }) => {
  const sizeClass = {
    small: 'loader-sm',
    medium: 'loader-md',
    large: 'loader-lg',
  }[size]

  return (
    <div className={`loader-container ${sizeClass}`}>
      <div className="loader-spinner">
        <div className="spinner-inner"></div>
      </div>
      {message && <p className="loader-message">{message}</p>}
    </div>
  )
};

export default React.memo(Loader);
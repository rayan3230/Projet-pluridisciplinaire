import React from 'react';

/**
 * A simple Alert component using Bootstrap classes.
 * 
 * Props:
 *  - type: string (e.g., 'danger', 'success', 'warning', 'info') - determines the alert style.
 *  - message: string - the text content of the alert.
 */
function Alert({ type = 'info', message }) {
  if (!message) {
    return null; // Don't render if no message
  }

  const alertClass = `alert alert-${type}`;

  return (
    <div className={alertClass} role="alert">
      {message}
    </div>
  );
}

export default Alert; 
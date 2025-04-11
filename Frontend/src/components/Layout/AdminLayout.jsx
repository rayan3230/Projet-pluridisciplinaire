import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import '../../Admin.css';

function AdminLayout() {
  // Add checks here to ensure only admins can access this layout
  // e.g., check auth context, redirect if not admin

  // Add class to body when AdminLayout is active
  React.useEffect(() => {
    document.body.classList.add('admin-body');
    // Cleanup function to remove the class when component unmounts
    return () => {
      document.body.classList.remove('admin-body');
    };
  }, []); // Empty dependency array means this runs once on mount and cleanup on unmount

  return (
    <div className="admin-layout">
      <NavBar className="admin-navbar" />
      <main className="admin-main-content">
        <Outlet /> {/* Child routes will render here */}
      </main>
      {/* Optional Footer */}
    </div>
  );
}

export default AdminLayout; 
import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';

function AdminLayout() {
  // Add checks here to ensure only admins can access this layout
  // e.g., check auth context, redirect if not admin

  return (
    <div>
      <NavBar />
      <main style={{ padding: '1rem' }}>
        <Outlet /> {/* Child routes will render here */}
      </main>
      {/* Optional Footer */}
    </div>
  );
}

export default AdminLayout; 
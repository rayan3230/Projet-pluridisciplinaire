import React from 'react';
import { Outlet } from 'react-router-dom';

function AuthLayout() {
  // This layout might be simpler, perhaps just centering the content
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <main>
        <Outlet /> {/* Login or ChangePassword pages render here */}
      </main>
    </div>
  );
}

export default AuthLayout; 
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import useAuth hook

function NavBar() {
  // Get actual roles and logout function from AuthContext
  const { isAdmin, isTeacher, logout } = useAuth(); 

  const handleLogout = () => {
    logout();
    // Navigate to login page after logout - useNavigate can be added if needed
    // For simplicity, the AppRouter logic might handle redirecting to /login anyway
    console.log('User logged out');
  };

  return (
    <nav style={{ background: '#eee', padding: '1rem', marginBottom: '1rem' }}>
      {/* Basic NavBar structure - consider using Tailwind or MUI later */}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {/* Admin Links */}
        {isAdmin && (
          <>
            <li><Link to="/admin/dashboard">Dashboard</Link></li>
            <li><Link to="/admin/users">Users</Link></li>
            {/* Add other admin links from Promps.md as needed */}
            {/* Example: */}
            <li><Link to="/admin/specialities">Specialities</Link></li>
            <li><Link to="/admin/promos">Promos</Link></li>
            <li><Link to="/admin/sections">Sections</Link></li>
            <li><Link to="/admin/classes">Classes</Link></li>
            <li><Link to="/admin/modules/base">Base Modules</Link></li>
            <li><Link to="/admin/modules/version">Version Modules</Link></li>
            <li><Link to="/admin/teachers/assign">Assign Teachers</Link></li>
            <li><Link to="/admin/semesters">Semesters</Link></li>
            <li><Link to="/admin/exams">Exams</Link></li>
            <li><Link to="/admin/schedule/generate">Generate Schedule</Link></li>
          </>
        )}

        {/* Teacher Links */}
        {isTeacher && (
          <>
            <li><Link to="/teacher/dashboard">Dashboard</Link></li>
            <li><Link to="/teacher/modules/select">Select Modules</Link></li>
            <li><Link to="/teacher/schedule">My Schedule</Link></li>
          </>
        )}

        {/* Logout Button - aligned to the right */}
        <li style={{ marginLeft: 'auto' }}>
            <button onClick={handleLogout}>Logout</button>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar; 
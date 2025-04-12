import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import useAuth hook
import logo from '../../assets/circle.png'; // Assuming this is the correct path
import './NavBar.css'; // Make sure CSS supports the new structure

function NavBar() {
  // Get actual roles and logout function from AuthContext
  const { user, isAdmin, isTeacher, logout } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true }); // Redirect to login after logout
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to={user ? (isAdmin ? '/admin/dashboard' : '/teacher/dashboard') : '/'}>
          <img src={logo} alt="Scope Logo" style={{ height: '40px' }} />
          <span>Scope</span>
        </Link>
      </div>
      <ul className="navbar-links">
        {user ? (
          <>
            <li>
              <span className="navbar-user">Welcome, {user.name || 'User'}!</span>
            </li>
            {/* Admin Specific Links */}
            {isAdmin && (
              <>
                <li><Link to="/admin/dashboard">Dashboard</Link></li>
                <li><Link to="/admin/users">Manage Users</Link></li>
                {/* Dropdown or separate links for academic structure */}
                <li className="dropdown">
                  <button className="dropbtn">Academic Structure</button>
                  <div className="dropdown-content">
                    <Link to="/admin/specialities">Specialities</Link>
                    <Link to="/admin/promos">Promos</Link>
                    <Link to="/admin/sections">Sections</Link>
                    <Link to="/admin/classrooms">Classrooms</Link>
                    <Link to="/admin/locations">Locations</Link>
                  </div>
                </li>
                <li className="dropdown">
                  <button className="dropbtn">Modules</button>
                  <div className="dropdown-content">
                    <Link to="/admin/base-modules">Base Modules</Link>
                    <Link to="/admin/version-modules">Version Modules</Link>
                  </div>
                </li>
                <li className="dropdown">
                  <button className="dropbtn">Schedule Management</button>
                  <div className="dropdown-content">
                    <Link to="/admin/semesters">Semesters</Link>
                    <Link to="/admin/exams">Exam Definitions</Link>
                    <Link to="/admin/schedule/generate">Class Schedule Generator</Link>
                    <Link to="/admin/schedules/promos">View Promo Schedules</Link>
                    <Link to="/admin/schedules/teachers">View Teacher Schedules</Link>
                    <Link to="/admin/surveillance">Exam Surveillance</Link>
                  </div>
                </li>
                <li><Link to="/admin/assignments">Assign Teachers</Link></li>
              </>
            )}
            {/* Teacher Specific Links */}
            {!isAdmin && (
              <>
                <li><Link to="/teacher/dashboard">Dashboard</Link></li>
                <li><Link to="/teacher/preferences">Module Preferences</Link></li>
                <li><Link to="/teacher/schedule">My Schedule</Link></li>
              </>
            )}
            <li>
              <button onClick={handleLogout} className="navbar-button logout-button">
                Logout
              </button>
            </li>
          </>
        ) : (
          // Links for logged-out users
          <>
            <li><Link to="/login">Login</Link></li>
            {/* Maybe add About, Contact links etc. */}
          </>
        )}
      </ul>
    </nav>
  );
}

export default NavBar; 
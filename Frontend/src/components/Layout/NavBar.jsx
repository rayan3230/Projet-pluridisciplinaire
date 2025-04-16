import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Import useAuth hook
import logo from '../../assets/navlogo.png'; // Use your actual logo
import './NavBar.css'; // Make sure CSS supports the new structure

function NavBar() {
  // Get actual roles and logout function from AuthContext
  const { user, isAdmin, isTeacher, logout } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const [activeDropdown, setActiveDropdown] = useState(null); // Track open dropdown
  const dropdownRef = useRef(null); // Ref for dropdowns
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const menuButtonRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const toggleDropdown = (dropdownName) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the dropdown area (might need refinement based on exact structure)
      // For simplicity, we just close on any click outside the navbar maybe?
      // A more robust solution would involve refs on each dropdown.
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
         // A basic check, might close prematurely if clicking inside another part of navbar
         // Consider adding refs to each dropdown button if this is too broad
          if (!event.target.closest('.dropdown')) { // Close if click is not on a dropdown button/content
             setActiveDropdown(null);
          }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // Only run once

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) &&
          menuButtonRef.current && !menuButtonRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to check if a link (or parent dropdown) is active
  const isLinkActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Check if any link within a dropdown group is active
  const isDropdownActive = (paths) => {
    return paths.some(path => isLinkActive(path));
  };

  // Define dropdown link groups for activity check
  const academicStructurePaths = ['/admin/specialities', '/admin/promos', '/admin/sections', '/admin/classrooms', '/admin/locations'];
  const modulesPaths = ['/admin/base-modules', '/admin/version-modules'];
  const schedulePaths = ['/admin/semesters', '/admin/exams', '/admin/schedule/generate', '/admin/schedules/promos', '/admin/schedules/teachers', '/admin/surveillance'];

  const renderNavLinks = () => (
    <>
      {user ? (
        <>
          <li><Link to="/admin/dashboard" className={isLinkActive('/admin/dashboard') ? 'active' : ''} onClick={handleLinkClick}>Dashboard</Link></li>
          <li><Link to="/admin/users" className={isLinkActive('/admin/users') ? 'active' : ''} onClick={handleLinkClick}>Manage Users</Link></li>
          
          {/* Academic Structure Dropdown */}
          <li className={`dropdown ${isDropdownActive(academicStructurePaths) ? 'active' : ''}`}>
            <button onClick={() => toggleDropdown('academic')} className={`dropbtn ${activeDropdown === 'academic' ? 'open' : ''}`}>
              Academic Structure <span className="dropdown-caret">&#9662;</span>
            </button>
            <div className={`dropdown-content ${activeDropdown === 'academic' ? 'show' : ''}`}>
              <Link to="/admin/specialities" onClick={() => setActiveDropdown(null)}>Specialities</Link>
              <Link to="/admin/promos" onClick={() => setActiveDropdown(null)}>Promos</Link>
              <Link to="/admin/sections" onClick={() => setActiveDropdown(null)}>Sections</Link>
              <Link to="/admin/classrooms" onClick={() => setActiveDropdown(null)}>Classrooms</Link>
              <Link to="/admin/locations" onClick={() => setActiveDropdown(null)}>Locations</Link>
            </div>
          </li>

          {/* Modules Dropdown */}
          <li className={`dropdown ${isDropdownActive(modulesPaths) ? 'active' : ''}`}>
            <button onClick={() => toggleDropdown('modules')} className={`dropbtn ${activeDropdown === 'modules' ? 'open' : ''}`}>
              Modules <span className="dropdown-caret">&#9662;</span>
            </button>
            <div className={`dropdown-content ${activeDropdown === 'modules' ? 'show' : ''}`}>
              <Link to="/admin/base-modules" onClick={() => setActiveDropdown(null)}>Base Modules</Link>
              <Link to="/admin/version-modules" onClick={() => setActiveDropdown(null)}>Version Modules</Link>
            </div>
          </li>

          {/* Schedule Management Dropdown */}
           <li className={`dropdown ${isDropdownActive(schedulePaths) ? 'active' : ''}`}>
            <button onClick={() => toggleDropdown('schedule')} className={`dropbtn ${activeDropdown === 'schedule' ? 'open' : ''}`}>
              Scheduling <span className="dropdown-caret">&#9662;</span>
            </button>
            <div className={`dropdown-content ${activeDropdown === 'schedule' ? 'show' : ''}`}>
              <Link to="/admin/semesters" onClick={() => setActiveDropdown(null)}>Semesters</Link>
              <Link to="/admin/exams" onClick={() => setActiveDropdown(null)}>Exam Definitions</Link>
              <Link to="/admin/schedule/generate" onClick={() => setActiveDropdown(null)}>Class Schedule</Link>
              <Link to="/admin/schedules/promos" onClick={() => setActiveDropdown(null)}>View Promo Schedules</Link>
              <Link to="/admin/schedules/teachers" onClick={() => setActiveDropdown(null)}>View Teacher Schedules</Link>
              <Link to="/admin/surveillance" onClick={() => setActiveDropdown(null)}>Exam Surveillance</Link>
            </div>
          </li>

          <li><Link to="/admin/assignments" className={isLinkActive('/admin/assignments') ? 'active' : ''} onClick={handleLinkClick}>Assign Teachers</Link></li>
        </>
      ) : (
        // Links for logged-out users
        <>
          <li><Link to="/login" className={isLinkActive('/login') ? 'active' : ''} onClick={handleLinkClick}>Login</Link></li>
        </>
      )}
    </>
  );

  return (
    <nav className="navbar modern-navbar" ref={dropdownRef}> {/* Add modern class and ref */}
      <div className="navbar-logo">
        <Link to={user ? (isAdmin ? '/admin/dashboard' : '/teacher/dashboard') : '/'}>
          <img src={logo} alt="Scope Logo" /> 
        </Link>
      </div>
      <ul className="navbar-links">
        {user ? (
          <>
            <li><Link to="/admin/dashboard" className={isLinkActive('/admin/dashboard') ? 'active' : ''}>Dashboard</Link></li>
            <li><Link to="/admin/users" className={isLinkActive('/admin/users') ? 'active' : ''}>Manage Users</Link></li>
            
            {/* Academic Structure Dropdown */}
            <li className={`dropdown ${isDropdownActive(academicStructurePaths) ? 'active' : ''}`}>
              <button onClick={() => toggleDropdown('academic')} className={`dropbtn ${activeDropdown === 'academic' ? 'open' : ''}`}>
                Academic Structure <span className="dropdown-caret">&#9662;</span>
              </button>
              <div className={`dropdown-content ${activeDropdown === 'academic' ? 'show' : ''}`}>
                <Link to="/admin/specialities" onClick={() => setActiveDropdown(null)}>Specialities</Link>
                <Link to="/admin/promos" onClick={() => setActiveDropdown(null)}>Promos</Link>
                <Link to="/admin/sections" onClick={() => setActiveDropdown(null)}>Sections</Link>
                <Link to="/admin/classrooms" onClick={() => setActiveDropdown(null)}>Classrooms</Link>
                <Link to="/admin/locations" onClick={() => setActiveDropdown(null)}>Locations</Link>
              </div>
            </li>

            {/* Modules Dropdown */}
            <li className={`dropdown ${isDropdownActive(modulesPaths) ? 'active' : ''}`}>
              <button onClick={() => toggleDropdown('modules')} className={`dropbtn ${activeDropdown === 'modules' ? 'open' : ''}`}>
                Modules <span className="dropdown-caret">&#9662;</span>
              </button>
              <div className={`dropdown-content ${activeDropdown === 'modules' ? 'show' : ''}`}>
                <Link to="/admin/base-modules" onClick={() => setActiveDropdown(null)}>Base Modules</Link>
                <Link to="/admin/version-modules" onClick={() => setActiveDropdown(null)}>Version Modules</Link>
              </div>
            </li>

            {/* Schedule Management Dropdown */}
             <li className={`dropdown ${isDropdownActive(schedulePaths) ? 'active' : ''}`}>
              <button onClick={() => toggleDropdown('schedule')} className={`dropbtn ${activeDropdown === 'schedule' ? 'open' : ''}`}>
                Scheduling <span className="dropdown-caret">&#9662;</span>
              </button>
              <div className={`dropdown-content ${activeDropdown === 'schedule' ? 'show' : ''}`}>
                <Link to="/admin/semesters" onClick={() => setActiveDropdown(null)}>Semesters</Link>
                <Link to="/admin/exams" onClick={() => setActiveDropdown(null)}>Exam Definitions</Link>
                <Link to="/admin/schedule/generate" onClick={() => setActiveDropdown(null)}>Class Schedule</Link>
                <Link to="/admin/schedules/promos" onClick={() => setActiveDropdown(null)}>View Promo Schedules</Link>
                <Link to="/admin/schedules/teachers" onClick={() => setActiveDropdown(null)}>View Teacher Schedules</Link>
                <Link to="/admin/surveillance" onClick={() => setActiveDropdown(null)}>Exam Surveillance</Link>
              </div>
            </li>

            <li><Link to="/admin/assignments" className={isLinkActive('/admin/assignments') ? 'active' : ''}>Assign Teachers</Link></li>
          </>
        ) : (
          // Links for logged-out users
          <>
            <li><Link to="/login" className={isLinkActive('/login') ? 'active' : ''}>Login</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default NavBar; 
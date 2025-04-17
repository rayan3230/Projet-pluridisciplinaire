import React from 'react';
import { FaClock, FaMapMarkerAlt, FaBell, FaUser } from 'react-icons/fa';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="logo-container">
        <img src="/scope-logo.png" alt="Scope" className="logo" />
        <span className="logo-text">Scope</span>
      </div>
      <nav className="nav-icons">
        <FaClock className="icon" />
        <FaMapMarkerAlt className="icon" />
        <FaBell className="icon" />
        <FaUser className="icon" />
      </nav>
    </header>
  );
}

export default Header; 
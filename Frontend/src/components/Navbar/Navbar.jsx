import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';
import logo from '../../assets/navlogo.png';

function Navbar() {
    const [activeLink, setActiveLink] = useState("home");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navRef = useRef(null);

    const handleLinkClick = (link) => {
        setActiveLink(link);
        setIsMobileMenuOpen(false);
    };

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav className="navbar" ref={navRef}>
            <div className="navbar-brand">
                <img src={logo} alt="scope logo" className="logo" />
            </div>

            {/* Desktop Navigation */}
            <div className="desktop-nav">
                <ul>
                    {["home", "about", "features", "faq", "contact"].map((link) => (
                        <li
                            key={link}
                            className={activeLink === link ? "active" : ""}
                            onClick={() => handleLinkClick(link)}
                        >
                            <a href={`#${link}`}>{link.charAt(0).toUpperCase() + link.slice(1)}</a>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Mobile Menu Button */}
            <button 
                className={`menu-button ${isMobileMenuOpen ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
            >
                <span className="menu-icon"></span>
            </button>

            {/* Mobile Navigation */}
            <div className={`mobile-nav ${isMobileMenuOpen ? 'active' : ''}`}>
                <ul>
                    {["home", "about", "features", "faq", "contact"].map((link) => (
                        <li
                            key={link}
                            className={activeLink === link ? "active" : ""}
                            onClick={() => handleLinkClick(link)}
                        >
                            <a href={`#${link}`}>{link.charAt(0).toUpperCase() + link.slice(1)}</a>
                        </li>
                    ))}
                </ul>
                <button className="login-button">Login</button>
            </div>

            {/* Desktop Login Button */}
            <button className="desktop-login-button">Login</button>
        </nav>
    );
}

export default Navbar; 
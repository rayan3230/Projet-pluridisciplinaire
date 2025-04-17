import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./appnavbar.css";
import logo from '../../assets/navlogo.png';
import profile from '../../assets/profile.png';
import Quickprofile from '../Quickprofile/Quickprofile.jsx';
import Quickhelp from '../Quickhelp/Quickhelp.jsx';
import Notification from '../Notification/Notification.jsx'; // Import Notification component

import icon1 from '../../assets/navicons/icon1.svg';
import icon2 from '../../assets/navicons/icon2.svg';
import icon3 from '../../assets/navicons/icon3.svg';
import icon4 from '../../assets/navicons/icon4.svg';

// Define the links and their corresponding paths
const navLinks = [
    { text: "Home", path: "/home" }, 
    { text: "Pending Requests", path: "/pending-requests" },
    { text: "Incoming Requests", path: "/incoming-requests" },
    { text: "Time Swap", path: "/time-swap" }
];

function Appnavbar() {
    const [activeLink, setActiveLink] = useState(navLinks[0]);
    const [showProfilePopup, setShowProfilePopup] = useState(false);
    const [showHelpPopup, setShowHelpPopup] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false); // State for notification popup

    const navRef = useRef(null);
    const indicatorRef = useRef(null);
    const profilePopupRef = useRef(null);
    const helpPopupRef = useRef(null);
    const profileButtonRef = useRef(null);
    const helpButtonRef = useRef(null);
    const mobileMenuRef = useRef(null);
    const notificationPopupRef = useRef(null); // Ref for notification popup
    const notificationButtonRef = useRef(null); // Ref for notification button

    const handleLinkClick = (link, index) => {
        setActiveLink(link);
        setIsMobileMenuOpen(false);
    };

    const updateIndicatorPosition = (index) => {
        if (navRef.current && index >= 0) {
            const navItems = navRef.current.querySelectorAll("li");
            if (navItems[index]) {
                const item = navItems[index];
                const leftPos = item.offsetLeft;
                const itemWidth = item.offsetWidth;

                if (indicatorRef.current) {
                    indicatorRef.current.style.setProperty('--indicator-left', `${leftPos}px`);
                    indicatorRef.current.style.setProperty('--indicator-width', `${itemWidth}px`);
                }
            }
        } else if (indicatorRef.current) {
            indicatorRef.current.style.setProperty('--indicator-width', `0px`);
        }
    };

    const toggleProfilePopup = () => {
        setShowProfilePopup(prev => !prev);
        setShowHelpPopup(false);
        setShowNotifications(false); // Close other popups
    };

    const toggleHelpPopup = () => {
        setShowHelpPopup(prev => !prev);
        setShowProfilePopup(false);
        setShowNotifications(false); // Close other popups
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(prev => !prev);
        setShowProfilePopup(false);
        setShowHelpPopup(false);
        setShowNotifications(false); // Close other popups
    };

    // Function to toggle notification popup
    const toggleNotifications = () => {
        setShowNotifications(prev => !prev);
        setShowProfilePopup(false);
        setShowHelpPopup(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profilePopupRef.current && !profilePopupRef.current.contains(event.target) && 
                profileButtonRef.current && !profileButtonRef.current.contains(event.target)) {
                setShowProfilePopup(false);
            }
            if (helpPopupRef.current && !helpPopupRef.current.contains(event.target) && 
                helpButtonRef.current && !helpButtonRef.current.contains(event.target)) {
                setShowHelpPopup(false);
            }
            if (notificationPopupRef.current && !notificationPopupRef.current.contains(event.target) && 
                notificationButtonRef.current && !notificationButtonRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && 
                !event.target.closest('.menu-button')) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const updatePosition = () => {
            // Find the index based on the activeLink text
            const currentIndex = navLinks.findIndex(link => link.text === activeLink.text);
            updateIndicatorPosition(currentIndex);
        }
        
        updatePosition();
        window.addEventListener('resize', updatePosition);
        return () => {
            window.removeEventListener('resize', updatePosition);
        };
    }, [activeLink]);

    return (
        <div className="navbar">
            <div className="container">
                {/* Nav Left */}
                <div className="nav-left">
                    <button className="website">
                        <img src={logo} alt="scope logo" className="logo" />
                    </button>
                    
                    {/* Desktop Navigation */}
                    <div className="nav" ref={navRef}>
                        <ul id="navlist">
                            {navLinks.map((link, index) => (
                                <li
                                    key={link.text}
                                    className={activeLink.text === link.text ? "active" : ""}
                                    onClick={() => handleLinkClick(link, index)}
                                >
                                    <Link to={link.path}>{link.text}</Link>
                                </li>
                            ))}
                        </ul>
                        <div className="indicator" ref={indicatorRef}></div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        className={`menu-button ${isMobileMenuOpen ? 'active' : ''}`}
                        onClick={toggleMobileMenu}
                        aria-label="Toggle menu"
                    >
                        <span className="menu-icon"></span>
                    </button>
                </div>

                {/* Nav Right */}
                <div className="nav-right">
                    <div className="iconed">
                        {/* Notification Button and Popup */}
                        <div className="notification-wrapper" ref={notificationButtonRef}>
                             <button onClick={toggleNotifications} className={`notification-button ${showNotifications ? 'active' : ''}`}>
                                <img src={icon1} alt="Notifications" />
                                {/* Optional: Add a badge for unread count */} 
                            </button>
                             {showNotifications && (
                                <div className="notification-popup" ref={notificationPopupRef}>
                                    <Notification />
                                </div>
                            )}
                        </div>
                        <button>
                            <img src={icon4} alt="Messages" />
                        </button>
                        <button>
                            <img src={icon3} alt="Settings" />
                        </button>
                        <div className="help-wrapper" ref={helpButtonRef}>
                            <button onClick={toggleHelpPopup} className={`help-button ${showHelpPopup ? 'active' : ''}`}>
                                <img src={icon2} alt="Help" />
                            </button>
                            {showHelpPopup && (
                                <div className="help-popup" ref={helpPopupRef}>
                                    <Quickhelp />
                                </div>
                            )}
                        </div>
                        <div className="profile-wrapper" ref={profileButtonRef}>
                            <button onClick={toggleProfilePopup} className={`profile-button ${showProfilePopup ? 'active' : ''}`}>
                                <img src={profile} alt="User Profile" id="profile-icon" />
                            </button>
                            {showProfilePopup && (
                                <div className="profile-popup" ref={profilePopupRef}>
                                    <Quickprofile teacherName="DR.AI" teacherId="#12345" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className={`mobile-nav ${isMobileMenuOpen ? 'active' : ''}`} ref={mobileMenuRef}>
                <ul id="navlist">
                    {navLinks.map((link, index) => (
                        <li
                            key={link.text}
                            className={activeLink.text === link.text ? "active" : ""}
                            onClick={() => handleLinkClick(link, index)}
                        >
                            <Link to={link.path}>{link.text}</Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default Appnavbar;
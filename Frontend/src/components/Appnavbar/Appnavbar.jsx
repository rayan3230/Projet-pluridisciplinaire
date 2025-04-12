import React, { useState, useEffect, useRef } from "react";
import "./appnavbar.css";
import logo from '../../assets/navlogo.png';
import profile from '../../assets/profile.png';
import Quickprofile from '../Quickprofile/Quickprofile.jsx';
import Quickhelp from '../Quickhelp/Quickhelp.jsx';

import icon1 from '../../assets/navicons/icon1.svg';
import icon2 from '../../assets/navicons/icon2.svg';
import icon3 from '../../assets/navicons/icon3.svg';
import icon4 from '../../assets/navicons/icon4.svg';

// Define the links rendered in the nav
const navLinks = ["Home", "Pending Requests", "Incoming Requests", "Time Swap"];

function Appnavbar(){
    // Set initial active link to Home
    const [activeLink, setActiveLink] = useState(navLinks[0]);
    const [showProfilePopup, setShowProfilePopup] = useState(false);
    const [showHelpPopup, setShowHelpPopup] = useState(false);

    const navRef = useRef(null);
    const indicatorRef = useRef(null);
    const profilePopupRef = useRef(null);
    const helpPopupRef = useRef(null);
    const profileButtonRef = useRef(null);
    const helpButtonRef = useRef(null);

    const handleLinkClick = (link, index) => {
      setActiveLink(link);
      // No need to call updateIndicatorPosition here, useEffect [activeLink] handles it
    };

    const updateIndicatorPosition = (index) => {
      if (navRef.current && index >= 0) { // Check index validity
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
         // Hide indicator if no link is active or index is invalid
         indicatorRef.current.style.setProperty('--indicator-width', `0px`); 
      }
    };

    // Toggle functions (remain the same)
    const toggleProfilePopup = () => {
        setShowProfilePopup(prev => !prev);
        setShowHelpPopup(false); // Close other popup
    };

    const toggleHelpPopup = () => {
        setShowHelpPopup(prev => !prev);
        setShowProfilePopup(false); // Close other popup
    };

    // Click outside handler (remains the same)
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close profile popup if click is outside
            if (profilePopupRef.current && !profilePopupRef.current.contains(event.target) && 
                profileButtonRef.current && !profileButtonRef.current.contains(event.target)) {
                setShowProfilePopup(false);
            }
            // Close help popup if click is outside
            if (helpPopupRef.current && !helpPopupRef.current.contains(event.target) && 
                helpButtonRef.current && !helpButtonRef.current.contains(event.target)) {
                setShowHelpPopup(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Effect to update indicator when activeLink changes or on resize
    useEffect(() => {
        const updatePosition = () => {
            const currentIndex = navLinks.indexOf(activeLink);
            updateIndicatorPosition(currentIndex);
        }
        
        updatePosition(); // Update on initial render and activeLink change

        window.addEventListener('resize', updatePosition);
        return () => {
            window.removeEventListener('resize', updatePosition);
        };
    }, [activeLink]); // Rerun when activeLink changes

    return (
        <div className="navbar">
            <div className="container">
                {/* Nav Left */}
                <div className="nav-left">
                     <button className="website">
                         <img src={logo} alt="scope logo" className="logo" />
                     </button>
                     <div className="nav" ref={navRef}>
                         <ul id="navlist">
                             {navLinks.map((link, index) => (
                               <li
                                 key={link}
                                 className={activeLink === link ? "active" : ""}
                                 onClick={() => handleLinkClick(link, index)}
                               >
                                 <a href={`#${link.replace(/\s+/g, '')}`}>{link}</a>
                               </li>
                             ))}
                         </ul>
                         <div
                           className="indicator"
                           ref={indicatorRef}
                         ></div>
                     </div>
                 </div>

                {/* Nav Right - Final Icon Order Attempt */}
                <div className="nav-right">
                    <div className="iconed">
                        {/* 1. Notifications */}
                        <button>
                            <img src={icon1} alt="Notifications" />
                        </button>
                        
                        {/* 2. Messages/History */}
                        <button>
                            <img src={icon4} alt="Messages" />
                        </button>
                        
                        {/* 3. Settings/Exams */}
                        <button>
                            <img src={icon3} alt="Settings" />
                        </button>

                        {/* 4. Help */}
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

                        {/* 5. Profile */}
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
        </div>
    );
}

export default Appnavbar;
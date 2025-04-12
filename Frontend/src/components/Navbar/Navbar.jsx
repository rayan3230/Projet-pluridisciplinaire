import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';
import logo from '../../assets/navlogo.png';




    
    function Navbar() {
        const [activeLink, setActiveLink] = useState("home");
        const [indicatorPosition, setIndicatorPosition] = useState(0);
        const [indicatorwidth, setindicatorwidth] = useState(50);
        const navRef = useRef(null);
      
        const handleLinkClick = (link, index) => {
          setActiveLink(link);
          updateIndicatorPosition(index);
        };
      
        const updateIndicatorPosition = (index) => {
          if (navRef.current) {
            const navItems = navRef.current.querySelectorAll("li");
            if (navItems[index]) {
              const item = navItems[index];
              const rect = item.getBoundingClientRect();
              setIndicatorPosition(rect.left);
              setindicatorwidth(rect.width ); 
            }
          }
        };
      
        useEffect(() => {
          const initialIndex = ["home", "about", "features", "faq", "contact"].indexOf(activeLink);
          updateIndicatorPosition(initialIndex);
      
          const handleResize = () => {
            const currentIndex = ["home", "about", "features", "faq", "contact"].indexOf(activeLink);
            updateIndicatorPosition(currentIndex);
          };
      
          window.addEventListener('resize', handleResize);
          return () => {
            window.removeEventListener('resize', handleResize);
          };
        }, [activeLink]);
      
        return (
          <div className="navbar">
            <img src={logo} alt="scope logo" className="logo" />
      
            <div className="nav" ref={navRef}>
              <ul>
                {["home", "about", "features", "faq", "contact"].map((link, index) => (
                  <li
                    key={link}
                    className={activeLink === link ? "active" : ""}
                    onClick={() => handleLinkClick(link, index)}
                  >
                    <a href={`#${link}`}>{link.charAt(0).toUpperCase() + link.slice(1)}</a>
                  </li>
                ))}
              </ul>
              <div
                className="indicator"
                style={{ left: `${indicatorPosition}px`, width: `${indicatorwidth}px` }}
              ></div>
            </div>
      
            <button>Login</button>
          </div>
        );
        }
      


export default Navbar; 
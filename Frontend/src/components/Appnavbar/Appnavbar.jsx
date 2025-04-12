import React, { useState, useEffect, useRef } from "react";
import "./appnavbar.css";
import logo from '../../assets/navlogo.png';
import profile from '../../assets/profile.png';

import icon1 from '../../assets/navicons/icon1.svg';
import icon2 from '../../assets/navicons/icon2.svg';
import icon3 from '../../assets/navicons/icon3.svg';
import icon4 from '../../assets/navicons/icon4.svg';



function Appnavbar(){
    const [activeLink, setActiveLink] = useState("home");
            const navRef = useRef(null);
            const indicatorRef = useRef(null);
          
            const handleLinkClick = (link, index) => {
              setActiveLink(link);
              updateIndicatorPosition(index);
            };
          
            const updateIndicatorPosition = (index) => {
              if (navRef.current) {
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
              }
            };
          
            useEffect(() => {
              const initialIndex = ["home", "Pending Requests", "Incoming Requests", "Time Swap"].indexOf(activeLink);
              updateIndicatorPosition(initialIndex);
          
              const handleResize = () => {
                const currentIndex = ["home", "Pending Requests", "Incoming Requests", "Time Swap"].indexOf(activeLink);
                updateIndicatorPosition(currentIndex);
              };
          
              window.addEventListener('resize', handleResize);
              return () => {
                window.removeEventListener('resize', handleResize);
              };
            }, [activeLink]);
          
            return (
              <div className="navbar">
                <div className="container">
                    {/* Group Logo and Nav Links */}
                    <div className="nav-left">
                        <button className="website">
                            <img src={logo} alt="scope logo" className="logo" />
                        </button>
                        <div className="nav" ref={navRef}>
                            <ul id="navlist">
                                {["home", "Pending Requests", "Incoming Requests", "Time Swap"].map((link, index) => (
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
                              ref={indicatorRef}
                            ></div>
                        </div>
                    </div>

                    {/* Group Icons and Profile */}
                    <div className="nav-right">
                        <div className="iconed">
                            <button>
                                <img src={icon1} alt="Notifications" />
                            </button>
                            <button>
                                <img src={icon2} alt="Messages" />
                            </button>
                            <button>
                                <img src={icon3} alt="Settings" />
                            </button>
                            <button>
                                <img src={icon4} alt="Help" />
                            </button>
                            <button className="profile-button">
                                <img src={profile} alt="User Profile" id="profile-icon" />
                            </button>
                        </div>
                    </div>
                </div>
              </div>
            );
            }


export default Appnavbar;
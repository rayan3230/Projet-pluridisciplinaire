import React, { useState, useEffect, useRef } from 'react';
import './newrequest.css';

// --- Placeholder Icons (Replace with actual imports/SVG components) ---
const GridIconPlaceholder = () => (
    <div style={{ width: '20px', height: '20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', marginRight: '8px' }}>
        {Array.from({ length: 9 }).map((_, i) => <div key={i} style={{ background: 'white', borderRadius: '1px' }}></div>)}
    </div>
);

const CalendarIconPlaceholder = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: '#555'}}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

const CloseIconPlaceholder = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const ProfileImagePlaceholder = () => (
    <div className="profile-image-placeholder">BS</div> // Simple initials placeholder
);
// --- End Placeholder Icons ---

function Newrequest() {
    const [activeTab, setActiveTab] = useState('class'); // 'class' or 'additional'
    const tabsContainerRef = useRef(null); // Ref for the tabs container
    const indicatorRef = useRef(null); // Ref for the indicator element

    // Effect to update indicator position
    useEffect(() => {
        if (tabsContainerRef.current && indicatorRef.current) {
            const tabs = tabsContainerRef.current.querySelectorAll('.tab');
            let activeTabIndex = -1;
            tabs.forEach((tab, index) => {
                if (tab.classList.contains('active')) {
                    activeTabIndex = index;
                }
            });

            if (activeTabIndex !== -1) {
                const activeTabElement = tabs[activeTabIndex];
                const left = activeTabElement.offsetLeft;
                const width = activeTabElement.offsetWidth;
                indicatorRef.current.style.setProperty('--indicator-left', `${left}px`);
                indicatorRef.current.style.setProperty('--indicator-width', `${width}px`);
            }
        }
    }, [activeTab]); // Re-run when activeTab changes

    return (
        <div className="newrequest-overlay"> 
            <div className="newrequest-container">
                <div className="newrequest-header">
                    <div className="header-left">
                        <img src="#" alt="Menu Icon" className="header-icon" />
                        <h2>New Request</h2>
                    </div>
                    <button className="close-button">
                        <CloseIconPlaceholder />
                    </button>
                </div>

                <div className="newrequest-body">
                    <div className="info-section">
                        <p className="info-label">Teacher swapped with:</p>
                        <div className="info-content teacher-info">
                            <ProfileImagePlaceholder />
                            <span className="teacher-name">Brooklyn Simmons</span>
                        </div>
                    </div>

                    <div className="info-section">
                        <p className="info-label">Submission date:</p>
                        <div className="info-content date-info">
                             <CalendarIconPlaceholder />
                            <span className="submission-date-value">06 - 04 - 2025</span>
                        </div>
                    </div>

                    <div className="description-section">
                        <label htmlFor="description" className="info-label">Description</label>
                        <textarea id="description" rows="4" placeholder="Enter description here..."></textarea>
                    </div>

                    <div className="details-tabs">
                        <div className="tabs-container" ref={tabsContainerRef}>
                            <button 
                                className={`tab ${activeTab === 'class' ? 'active' : ''}`}
                                onClick={() => setActiveTab('class')}
                            >
                                Class Details
                            </button>
                            <button 
                                className={`tab ${activeTab === 'additional' ? 'active' : ''}`}
                                onClick={() => setActiveTab('additional')}
                            >
                                Additional Details
                            </button>
                            <div className="tab-indicator" ref={indicatorRef}></div>
                        </div>
                    </div>
                     {/* Future Tab Content Area */}
                     {/* 
                     <div className="tab-content">
                         {activeTab === 'class' && <div>Class Details Content...</div>}
                         {activeTab === 'additional' && <div>Additional Details Content...</div>}
                     </div>
                     */}

                </div>

                <div className="newrequest-footer">
                    <button className='submit-button'>Make request</button>
                </div>
            </div>
        </div>
    );
}

export default Newrequest;


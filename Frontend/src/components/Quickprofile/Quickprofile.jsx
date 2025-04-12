import React from 'react';
import './quickprofile.css';

// --- Placeholder Icons --- 
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const ExternalLinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
);

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
);
// --- End Placeholder Icons ---

function Quickprofile({ teacherName = "Teacher Name", teacherId = "DR.AI" }) { // Added default props
    // Placeholder handlers - replace with actual logic
    const handleProfileClick = () => console.log('Profile clicked');
    const handleWebsiteClick = () => console.log('Website clicked');
    const handleLogoutClick = () => console.log('Logout clicked');

    return (
        <div className="quick-profile-card">
            <div className="profile-info">
                <div className="profile-name">{teacherName}</div>
                <div className="profile-id">{teacherId}</div>
            </div>
            <hr className="profile-separator" />
            <ul className="profile-actions">
                <li onClick={handleProfileClick}>
                    <UserIcon />
                    <span>Profile</span>
                </li>
                <li onClick={handleWebsiteClick}>
                    <ExternalLinkIcon />
                    <span>Scope's Website</span>
                </li>
                <li className="logout-item" onClick={handleLogoutClick}>
                    <LogoutIcon />
                    <span>Logout</span>
                </li>
            </ul>
        </div>
    );
}

export default Quickprofile;

import React from 'react';
import './quickhelp.css';

// --- Placeholder Icons ---
const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const QuestionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);

const CheckSquareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
    </svg>
);
// --- End Placeholder Icons ---

function Quickhelp() {
    // Placeholder handlers
    const handleContactAdmin = () => console.log('Contact Admin clicked');
    const handleFAQs = () => console.log('FAQs clicked');
    const handleImprove = () => console.log('Help Us Improve clicked');

    return (
        <div className="quick-help-card">
            <div className="help-title">Help Center</div>
            <ul className="help-actions">
                <li onClick={handleContactAdmin}>
                    <UserIcon />
                    <span>Contact Admin</span>
                </li>
                <li onClick={handleFAQs}>
                    <QuestionIcon />
                    <span>FAQs</span>
                </li>
                <li>
                    <a 
                        href="https://docs.google.com/forms/d/e/1FAIpQLSfBabnG-J0QJqZ9FUjMIeoC-dHR0owLhAMmNR2o6Vf8s2RYSw/viewform?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="help-link"
                    >
                        <CheckSquareIcon />
                        <span>Help Us Improve</span>
                    </a>
                </li>
            </ul>
        </div>
    );
}

export default Quickhelp;

import React from 'react';
import './QuickStats.css'; // Import CSS

// --- Placeholder Icons (Optional) ---
// Example: Replace with actual relevant icons if desired
const PendingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
);
const SwapIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
    </svg>
);
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);
// --- New Document Icon ---
const DocumentIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
);
// --- End Placeholder Icons ---


// --- Placeholder Data ---
// Replace with actual data fetching logic
const dummyStats = [
    { id: 1, label: 'Pending Requests', value: '2', Icon: PendingIcon },
    { id: 2, label: 'Upcoming Swaps', value: '1', Icon: SwapIcon },
    { id: 3, label: 'Classes Today', value: '3', Icon: CalendarIcon },
    { id: 4, label: 'Exam Programs', value: 'Set', Icon: DocumentIcon },
];
// --- End Placeholder Data ---

function QuickStats() {
    return (
        <div className="quick-stats-card">
            <h3 className="stats-title">Quick Stats</h3>
            <ul className="stats-list">
                {dummyStats.map(stat => (
                    <li key={stat.id} className="stat-item">
                        {stat.Icon && (
                            <div className="stat-icon">
                                <stat.Icon />
                            </div>
                        )}
                        <div className="stat-info">
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default QuickStats; 
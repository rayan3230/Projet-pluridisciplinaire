import React from 'react';
import './PendingRequests.css'; // Import the CSS

// --- Placeholder Icons (replace with actual icons if available) ---
const SwapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
    </svg>
);

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
);
// --- End Placeholder Icons ---

// --- Placeholder Data ---
const dummyPendingRequests = [
    {
        id: 1,
        swapWith: 'MR.Teacher',
        requestDate: '20-01-2025',
        classToSwap: 'Sunday 8:00 - 9:30 | Course 145 T',
        studentsAffected: 'Section B ING INFO'
    },
    {
        id: 2,
        swapWith: 'MR.Teacher',
        requestDate: '20-01-2025',
        classToSwap: 'Sunday 8:00 - 9:30 | Course 145 T',
        studentsAffected: 'Section B ING INFO'
    }
];
// --- End Placeholder Data ---

function PendingRequests() {
    // Placeholder handlers
    const handleEdit = (id) => console.log(`Edit clicked for request ${id}`);
    const handleDelete = (id) => console.log(`Delete clicked for request ${id}`);
    const handleSeeAll = () => console.log('See All Pending Requests clicked');

    return (
        <div className="pending-requests-card">
            <div className="card-header">
                <h3 className="card-title">
                    <span className="pending-indicator"></span>
                    Pending requests
                </h3>
                <a href="#" className="see-all-link" onClick={handleSeeAll}>See All</a>
            </div>
            <ul className="requests-list">
                {dummyPendingRequests.map(request => (
                    <li key={request.id} className="request-item">
                        <div className="request-details">
                            <p><SwapIcon /> <strong>Swap with :</strong> {request.swapWith}</p>
                            <p><CalendarIcon /> <strong>Request Date :</strong> {request.requestDate}</p>
                            <p><ClockIcon /> <strong>Class to be swapped :</strong> {request.classToSwap}</p>
                            <p><ClockIcon /> <strong>Class to be swapped :</strong> {request.classToSwap}</p> {/* Duplicated line from image? */} 
                            <p><UsersIcon /> <strong>Students Affected :</strong> {request.studentsAffected}</p>
                        </div>
                        <div className="request-actions">
                            <button className="edit-button" onClick={() => handleEdit(request.id)}>Edit Request</button>
                            <button className="delete-button" onClick={() => handleDelete(request.id)}>Delete Request</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default PendingRequests; 
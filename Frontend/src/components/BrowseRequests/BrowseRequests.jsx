import React from 'react';
import './BrowseRequests.css';

// --- Placeholder Icons (replace with actual icons if available) ---
const MessageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);
// --- End Placeholder Icons ---

// --- Placeholder Data ---
const dummyRequests = [
        {
            id: 1,
        teacherName: 'Teacher 1',
        teacherRole: 'DR.AI',
        teacherImg: 'https://via.placeholder.com/30', // Replace with actual image path
            yours: 'Sunday 8:00 - 9:30 | Course 145 T',
        with: 'Monday 8:00 - 9:30 | Course 313 T'
        },
        {
            id: 2,
        teacherName: 'Teacher 3',
        teacherRole: 'DR.AI',
        teacherImg: 'https://via.placeholder.com/30', // Replace with actual image path
            yours: 'Sunday 8:00 - 9:30 | Course 145 T',
        with: 'Monday 8:00 - 9:30 | Course 313 T'
    }
];
// --- End Placeholder Data ---

function BrowseRequests() {
    // Placeholder handlers
    const handleMessage = (id) => console.log(`Message clicked for request ${id}`);
    const handleAccept = (id) => console.log(`Accept clicked for request ${id}`);
    const handleReject = (id) => console.log(`Reject clicked for request ${id}`);
    const handleSeeAll = () => console.log('See All Browse Requests clicked');

    return (
        <div className="browse-requests-card">
            <div className="card-header">
                <h3>Browse requests</h3>
                <a href="#" className="see-all-link" onClick={handleSeeAll}>See all</a>
            </div>
            <ul className="browse-list">
                {dummyRequests.map(request => (
                    <li key={request.id} className="browse-item">
                        <div className="item-header">
                            <img src={request.teacherImg} alt={request.teacherName} className="teacher-icon" />
                    <div className="teacher-info">
                                <span>{request.teacherName}</span>
                                <small>{request.teacherRole}</small>
                        </div>
                            <div className="item-actions">
                                <button onClick={() => handleMessage(request.id)} title="Message"><MessageIcon /></button>
                                <button onClick={() => handleAccept(request.id)} title="Accept"><CheckIcon /></button>
                                <button onClick={() => handleReject(request.id)} title="Reject"><CloseIcon /></button>
                        </div>
                        </div>
                        <div className="item-body">
                            <p><strong>Yours :</strong> {request.yours}</p>
                            <p><strong>With :</strong> {request.with}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default BrowseRequests; 
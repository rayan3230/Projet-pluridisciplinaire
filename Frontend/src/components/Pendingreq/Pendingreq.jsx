import React from 'react';
import { Link } from 'react-router-dom'; // For "See All" link if needed
import './pendingreq.css';

// --- Icons ---
// Assuming you have or will create these SVG components or import them
const SwapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-repeat icon-detail" viewBox="0 0 16 16">
        <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
        <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.5A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.5z"/>
    </svg>
);
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-calendar-event icon-detail" viewBox="0 0 16 16">
        <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
    </svg>
);

// Dummy data matching the structure in the image
const dummyRequests = [
    {
        id: 1,
        swapWith: "MR.Teacher",
        requestDate: "20-01-2025",
        classToSwap1: "Sunday 8:00 - 9:30 | Course 145 T",
        classToSwap2: "Sunday 8:00 - 9:30 | Course 145 T",
        studentsAffected: "Section B ING INFO"
    },
    {
        id: 2,
        swapWith: "MR.Teacher",
        requestDate: "20-01-2025",
        classToSwap1: "Sunday 8:00 - 9:30 | Course 145 T",
        classToSwap2: "Sunday 8:00 - 9:30 | Course 145 T",
        studentsAffected: "Section B ING INFO"
    },
    // Add more dummy requests if needed
];

function Pendingreq({ requests = dummyRequests }) { // Use passed requests or dummy data

    const handleEdit = (requestId) => {
        console.log("Edit action triggered for request:", requestId);
        // Add logic to handle editing the request
    };

    const handleDelete = (requestId) => {
        console.log("Delete action triggered for request:", requestId);
        // Add logic to handle deleting the request
    };

    return (
        <div className="pending-requests-container">
            <div className="pending-requests-header">
                <h3 className="title">
                    <span className="title-icon"></span> Pending requests
                </h3>
                {/* Use Link from react-router-dom if navigation is set up */}
                <a href="/pending-requests" className="see-all-link">See All</a>
            </div>

            <div className="pending-requests-list">
                {requests.length > 0 ? (
                    requests.map((request) => (
                        <div key={request.id} className="pending-request-item">
                            <div className="request-details">
                                <div className="request-detail">
                                    <SwapIcon />
                                    <span className="detail-label">Swap with :</span>
                                    <span className="detail-value">{request.swapWith}</span>
                    </div>
                                <div className="request-detail">
                                    <CalendarIcon />
                                    <span className="detail-label">Request Date :</span>
                                    <span className="detail-value">{request.requestDate}</span>
                    </div>
                                <div className="request-detail">
                                    <span className="detail-label indented">Class to be swapped :</span>
                                    <span className="detail-value">{request.classToSwap1}</span>
                </div>
                                 <div className="request-detail">
                                    <span className="detail-label indented">Class to be swapped :</span>
                                    <span className="detail-value">{request.classToSwap2}</span>
                </div>
                                <div className="request-detail">
                                    <span className="detail-label indented">Students Affected :</span>
                                    <span className="detail-value">{request.studentsAffected}</span>
                    </div>
                </div>
                            <div className="request-actions">
                                <button onClick={() => handleEdit(request.id)} className="action-button edit-button">
                                    Edit Request
                </button>
                                <button onClick={() => handleDelete(request.id)} className="action-button delete-button">
                                    Delete Request
                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No pending requests.</p> // Message when there are no requests
                )}
            </div>
        </div>
    );
}

export default Pendingreq;

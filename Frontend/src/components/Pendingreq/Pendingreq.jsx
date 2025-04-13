import React from 'react';
import './pendingreq.css'; // Use the correct CSS file
// Import the profile image if needed, or remove if not used
// import profileImageSrc from '../../assets/profile.png'; 

// --- Placeholder Icons (Copied from Incomingrequ) ---
const SwapIconPlaceholder = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
    </svg>
);

// --- Icons for Pending Requests ---
const MessageIconPlaceholder = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);
const EditIconPlaceholder = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);
const DeleteIconPlaceholder = () => (
     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);
// --- End Placeholders ---

// Component name changed to Pendingreq
function Pendingreq({ requestData }) {
    // Default/dummy data (same as Incomingrequ for structure)
    const data = requestData || {
        teacherName: "Teacher 3",
        teacherId: "DR.AI",
        originalSlot: "Sunday 8:00 - 9:30 | Course 145 T",
        requestedSlot: "Monday 8:00 - 9:30 | Course 313 T",
        sentDate: "27/03/2025",
        projector: false,
        computers: true,
        reqProjector: true,
        reqComputers: true
    };

    // Placeholder handlers for new actions
    const handleMessage = () => console.log("Message action triggered for request:", data.id || 'N/A');
    const handleEdit = () => console.log("Edit action triggered for request:", data.id || 'N/A');
    const handleDelete = () => console.log("Delete action triggered for request:", data.id || 'N/A');

    return (
        // Apply the same class names as Incomingrequ for styling
        <div className="request-card expanded"> {/* Make sure pendingreq.css targets this class */}
            <div className="requester-info expanded-requester">
                <div className="requester-details">
                    <span className="teacher-name">{data.teacherName}</span>
                    <span className="teacher-id">{data.teacherId}</span>
                </div>
            </div>

            <div className="request-content-wrapper">
                <div className="slot-info-expanded">
                    <span className="slot-label">Your Time:</span>
                    <div className="slot-details original-slot">
                        <span>{data.originalSlot}</span>
                    </div>
                    <div className="extra-details">
                        <span className="detail-item">Sent: {data.sentDate}</span>
                        <span className="detail-item">Projector: {data.projector ? '✓' : 'x'}</span>
                        <span className="detail-item">Computers: {data.computers ? '✓' : 'x'}</span>
                    </div>
                </div>

                <div className="swap-icon">
                    <SwapIconPlaceholder />
                </div>

                <div className="slot-info-expanded">
                    <span className="slot-label">Requested Time:</span>
                    <div className="slot-details requested-slot">
                        <span>{data.requestedSlot}</span>
                    </div>
                    <div className="extra-details">
                        <span className="detail-item">Projector: {data.reqProjector ? '✓' : 'x'}</span>
                        <span className="detail-item">Computers: {data.reqComputers ? '✓' : 'x'}</span>
                    </div>
                </div>
            </div>

            {/* Updated Action Buttons */}
            <div className="action-buttons">
                <button onClick={handleMessage} className="action-button message-button" title="Message">
                    <MessageIconPlaceholder />
                </button>
                <button onClick={handleEdit} className="action-button edit-button" title="Edit">
                    <EditIconPlaceholder />
                </button>
                <button onClick={handleDelete} className="action-button delete-button" title="Delete">
                    <DeleteIconPlaceholder />
                </button>
            </div>
        </div>
    );
}

export default Pendingreq; // Export the new component name

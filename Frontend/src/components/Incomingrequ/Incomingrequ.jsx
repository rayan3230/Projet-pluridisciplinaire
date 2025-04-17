import React from 'react';
import './incomingrequ.css';
import profileImageSrc from '../../assets/profile.png'; // Import the profile image

// --- Placeholder Icons (Replace with actual icons) ---
const SwapIconPlaceholder = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
    </svg>
);
const ChatIconPlaceholder = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);
const AcceptIconPlaceholder = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);
const RejectIconPlaceholder = () => (
     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);
const ProfileImage = ({ src, alt }) => (
    <img src={src} alt={alt} className="profile-image" />
);
// --- End Placeholders ---

// Example Prop Data Structure:
// const requestData = {
//     teacherName: "Teacher 3",
//     teacherId: "DR.AI",
//     profileImageUrl: "path/to/image.jpg", // Replace with actual URL or import
//     originalSlot: "Sunday 8:00 - 9:30 | Course 145 T",
//     requestedSlot: "Monday 8:00 - 9:30 | Course 313 T"
// };

function Incomingrequ({ requestData }) {
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

    const handleAccept = () => console.log("Request accepted");
    const handleReject = () => console.log("Request rejected");
    const handleChat = () => console.log("Open chat");

    return (
        <div className="request-card expanded">
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

            <div className="action-buttons">
                <button onClick={handleChat} className="action-button chat-button" title="Chat">
                    <ChatIconPlaceholder />
                </button>
                <button onClick={handleAccept} className="action-button accept-button" title="Accept">
                    <AcceptIconPlaceholder />
                </button>
                <button onClick={handleReject} className="action-button reject-button" title="Reject">
                    <RejectIconPlaceholder />
                </button>
            </div>
        </div>
    );
}

export default Incomingrequ;

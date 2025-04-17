import React from 'react';
import './HistoryCard.css';

// --- Placeholder Icons (Same as Incomingrequ for consistency) ---
const SwapIconPlaceholder = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
    </svg>
);
// --- End Placeholders ---

// Function to get status styles
const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
        case 'accepted': return 'status-accepted';
        case 'rejected': return 'status-rejected';
        case 'canceled': return 'status-canceled';
        case 'expired': return 'status-expired';
        default: return 'status-unknown';
    }
};

function HistoryCard({ historyData }) {
    // Default/dummy data if none provided
    const data = historyData || {
        id: 0,
        teacherName: "Teacher Name",
        teacherId: "Teacher ID",
        originalSlot: "Original Slot Info",
        requestedSlot: "Requested Slot Info",
        completedDate: "DD/MM/YYYY", // Or Resolved Date
        status: "Unknown", // e.g., 'Accepted', 'Rejected', 'Canceled', 'Expired'
        projector: false,
        computers: false,
        reqProjector: false,
        reqComputers: false
    };

    return (
        <div className={`history-card ${getStatusClass(data.status)}`}>
            {/* Keep requester info minimal or adjust as needed for history */}
            <div className="requester-info">
                 <div className="requester-details">
                    <span className="teacher-name">{data.teacherName}</span>
                    <span className="teacher-id">{data.teacherId}</span>
                </div>
            </div>

            <div className="request-content-wrapper">
                {/* Slot Info */}
                <div className="slot-info">
                    <span className="slot-label">Original Time:</span>
                    <div className="slot-details original-slot">
                        <span>{data.originalSlot}</span>
                    </div>
                     <div className="extra-details">
                        <span className="detail-item">Projector: {data.projector ? '✓' : 'x'}</span>
                        <span className="detail-item">Computers: {data.computers ? '✓' : 'x'}</span>
                    </div>
                </div>

                <div className="swap-icon">
                    <SwapIconPlaceholder />
                </div>

                <div className="slot-info">
                    <span className="slot-label">Swapped Time:</span>
                    <div className="slot-details requested-slot">
                        <span>{data.requestedSlot}</span>
                    </div>
                     <div className="extra-details">
                        <span className="detail-item">Projector: {data.reqProjector ? '✓' : 'x'}</span>
                        <span className="detail-item">Computers: {data.reqComputers ? '✓' : 'x'}</span>
                    </div>
                </div>
            </div>

            {/* Status Display */}
            <div className="status-info">
                <span className={`status-badge ${getStatusClass(data.status)}`}>{data.status}</span>
                <span className="completed-date">Resolved: {data.completedDate}</span>
            </div>
        </div>
    );
}

export default HistoryCard; 
import React from 'react';
import './swap.css';
import profileImageSrc from '../../assets/profile.png'; // Placeholder image

// Placeholder data structure
const dummySwapData = {
    teacherName: "Teacher 3",
    teacherId: "DR.AI",
    profileImageUrl: profileImageSrc, 
    slotInfo: "Sunday 8:00 - 9:30 | Course 145 T",
    sentDate: "27/03/2025",
    projector: false,
    computers: true
};

// Define the component
function Swap({ swapData = dummySwapData }) { // Use default dummy data if no prop provided
    
    const handleMakeRequest = () => {
        console.log("Make Request clicked for:", swapData.teacherName);
        // Add actual request logic here
    };

    return (
        <div className="swap-card">
            {/* Teacher Info */}
            <div className="swap-teacher-info">
                <img 
                    src={swapData.profileImageUrl} 
                    alt={swapData.teacherName} 
                    className="swap-teacher-image" 
                />
                <div className="swap-teacher-details">
                    <span className="swap-teacher-name">{swapData.teacherName}</span>
                    <span className="swap-teacher-id">{swapData.teacherId}</span>
                </div>
            </div>

            {/* Slot Info */}
            <div className="swap-slot-info">
                <span>{swapData.slotInfo}</span>
            </div>

            {/* Extra Details */}
            <div className="swap-extra-details">
                <span className="detail-item">Sent: {swapData.sentDate}</span>
                <span className="detail-item">Projector: {swapData.projector ? '✓' : 'x'}</span>
                <span className="detail-item">Computers: {swapData.computers ? '✓' : 'x'}</span>
            </div>

            {/* Action Button */}
            <div className="swap-action">
                <button onClick={handleMakeRequest} className="make-request-button">
                    Make Request
                </button>
            </div>
        </div>
    );
}

export default Swap; 
import React, { useState } from 'react';
import Appnavbar from '../../../components/Appnavbar/Appnavbar.jsx'; // Import Appnavbar
import HistoryCard from '../../../components/HistoryCard/HistoryCard.jsx'; // Import HistoryCard
import './History.css'; // Import CSS for styling

// Dummy data for history items
const dummyHistory = [
    {
        id: 1,
        teacherName: "Prof. Elara Vance",
        teacherId: "#EV987",
        originalSlot: "Monday 10:00 - 11:30 | Course CS101",
        requestedSlot: "Friday 14:00 - 15:30 | Course CS101",
        completedDate: "15/04/2024",
        status: "Accepted",
        projector: true, computers: false, reqProjector: true, reqComputers: false
    },
    {
        id: 2,
        teacherName: "Dr. Ben Carter",
        teacherId: "#BC456",
        originalSlot: "Tuesday 08:30 - 10:00 | Course MA202",
        requestedSlot: "Thursday 16:00 - 17:30 | Course MA202",
        completedDate: "12/04/2024",
        status: "Rejected",
        projector: false, computers: true, reqProjector: false, reqComputers: true
    },
    {
        id: 3,
        teacherName: "Prof. Elara Vance",
        teacherId: "#EV987",
        originalSlot: "Wednesday 13:00 - 14:30 | Course PH301",
        requestedSlot: "Monday 08:00 - 09:30 | Course PH301",
        completedDate: "10/04/2024",
        status: "Canceled",
        projector: true, computers: true, reqProjector: true, reqComputers: true
    },
    {
        id: 4,
        teacherName: "Dr. Samira Khan",
        teacherId: "#SK123",
        originalSlot: "Friday 09:00 - 10:30 | Course CH101",
        requestedSlot: "Friday 11:00 - 12:30 | Course CH101",
        completedDate: "05/03/2024",
        status: "Expired",
         projector: false, computers: false, reqProjector: false, reqComputers: false
    },
];

function History() {
    // You'll replace dummyHistory with actual fetched data
    const [historyItems, setHistoryItems] = useState(dummyHistory);

    return (
        <div className="page-container"> {/* Wrapper for navbar + content */}
            <Appnavbar />
            <div className="history-page-content">
                {/* Main content area */} 
                <h1>Swap History</h1>
                <div className="history-list">
                    {historyItems.length > 0 ? (
                        historyItems.map(item => (
                            <HistoryCard key={item.id} historyData={item} />
                        ))
                    ) : (
                        <p>No swap history found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default History; 
import React, { useState } from 'react';
import './incomingrequests.css'; // Import CSS for this page
import Filter from '../../../components/Filter/Filter.jsx';
import Incomingrequ from '../../../components/Incomingrequ/Incomingrequ.jsx';
import Appnavbar from '../../../components/Appnavbar/Appnavbar.jsx'; // Assuming you want the navbar

// --- Placeholder Icons (Replace with actual icons) ---
const SearchIconPlaceholder = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);
// --- End Placeholders ---

// Example data for multiple requests (use actual data fetching later)
const exampleRequests = [
    {
        id: 1,
        teacherName: "Teacher 3",
        teacherId: "DR.AI",
        profileImageUrl: "https://via.placeholder.com/50/CED4DA/808080?text=T3", // Use unique placeholders if possible
        originalSlot: "Sunday 8:00 - 9:30 | Course 145 T",
        requestedSlot: "Monday 8:00 - 9:30 | Course 313 T",
        sentDate: "27/03/2025",
        projector: false,
        computers: true,
        reqProjector: true,
        reqComputers: true,
        isExpanded: false // Initial state for expansion (if needed)
    },
    {
        id: 2,
        teacherName: "Teacher 3",
        teacherId: "DR.AI",
        profileImageUrl: "https://via.placeholder.com/50/CED4DA/808080?text=T3",
        originalSlot: "Sunday 8:00 - 9:30 | Course 145 T",
        requestedSlot: "Monday 8:00 - 9:30 | Course 313 T",
        sentDate: "27/03/2025",
        projector: false,
        computers: true,
        reqProjector: true,
        reqComputers: true,
        isExpanded: true // Example expanded state
    },
    {
        id: 3,
        teacherName: "Teacher 3",
        teacherId: "DR.AI",
        profileImageUrl: "https://via.placeholder.com/50/CED4DA/808080?text=T3",
        originalSlot: "Sunday 8:00 - 9:30 | Course 145 T",
        requestedSlot: "Monday 8:00 - 9:30 | Course 313 T",
        sentDate: "27/03/2025",
        projector: false,
        computers: true,
        reqProjector: true,
        reqComputers: true,
        isExpanded: false
    }
];

function IncomingRequests() {
    const [requests, setRequests] = useState(exampleRequests);
    const [searchTerm, setSearchTerm] = useState('');

    // Add filtering logic based on search term and filters from Filter component later

    return (
        <div className="page-container"> {/* Added page container */}
            <Appnavbar />
            <div className="incoming-requests-page">
                <aside className="filter-sidebar">
                    <Filter />
                </aside>
                <main className="requests-main-content">
                    <div className="search-bar-container">
                         <div className="search-input-wrapper">
                            <input 
                                type="text"
                                placeholder="Search for request..."
                                className="search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="search-icon">
                                <SearchIconPlaceholder />
                            </div>
                        </div>
                    </div>
                    <div className="requests-list">
                        {requests.map(request => (
                            // Note: The Incomingrequ component itself needs modification
                            // to handle the expanded state based on the prop (isExpanded)
                            <Incomingrequ key={request.id} requestData={request} />
                        ))}
                        {/* Add placeholder divs if needed */}
                        <div className="request-placeholder"></div>
                        <div className="request-placeholder"></div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default IncomingRequests;

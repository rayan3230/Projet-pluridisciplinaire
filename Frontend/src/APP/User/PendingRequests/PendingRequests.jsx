import React, { useState } from 'react';
import AppNavbar from '../../../components/Appnavbar/AppNavbar.jsx';
import Filter from '../../../components/Filter/Filter.jsx';
import Pendingreq from '../../../components/Pendingreq/Pendingreq.jsx';
import './pendingrequests.css';

const SearchIcon = ({ className }) => (
    <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

function PendingRequestsPage() {
    const [sortBy, setSortBy] = useState('date-desc');

    const handleSortChange = (event) => {
        setSortBy(event.target.value);
        console.log("Sort by:", event.target.value);
    };

    const dummyRequests = [
        { id: 1, teacherName: "Teacher A", teacherId: "DR.123", originalSlot: "Mon 10:00 - 11:30 | Algo", requestedSlot: "Wed 13:00 - 14:30 | Algo", sentDate: "01/04/2024", projector: true, computers: false, reqProjector: true, reqComputers: false },
        { id: 2, teacherName: "Teacher B", teacherId: "DR.456", originalSlot: "Tue 14:00 - 15:30 | Web", requestedSlot: "Fri 08:00 - 09:30 | Web", sentDate: "02/04/2024", projector: false, computers: true, reqProjector: false, reqComputers: true },
        { id: 3, teacherName: "Teacher C", teacherId: "DR.789", originalSlot: "Sun 08:00 - 09:30 | OS", requestedSlot: "Thu 11:20 - 12:50 | OS", sentDate: "03/04/2024", projector: true, computers: true, reqProjector: true, reqComputers: true },
    ];

    return (
        <div className="page-container">
            <AppNavbar />
            <div className="content-grid">
                <div className="filter-column">
                    <Filter />
                </div>

                <div className="main-column">
                    <div className="main-column-header">
                        <div className="sort-dropdown-container">
                            <label htmlFor="sort-select" className="sort-label">Sort by:</label>
                            <select id="sort-select" className="sort-select" value={sortBy} onChange={handleSortChange}>
                                <option value="date-desc">Newest First</option>
                                <option value="date-asc">Oldest First</option>
                                <option value="teacher-asc">Teacher Name (A-Z)</option>
                            </select>
                        </div>
                        <div className="search-bar-container">
                            <input type="text" placeholder="Search for request..." className="search-input" />
                            <SearchIcon className="search-icon" />
                        </div>
                    </div>

                    <div className="requests-list-container">
                        {dummyRequests.map(request => (
                            <Pendingreq key={request.id} requestData={request} />
                        ))}
                        {dummyRequests.length === 0 && (
                            <p className="no-requests-message">No pending requests found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PendingRequestsPage;
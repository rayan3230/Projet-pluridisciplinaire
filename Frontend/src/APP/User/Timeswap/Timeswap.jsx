import React, { useState } from 'react';
import AppNavbar from '../../../components/Appnavbar/AppNavbar.jsx'; 
import Filter from '../../../components/Filter/Filter.jsx'; 
import Swap from '../../../components/Swap/Swap.jsx'; // Import Swap component
import './timeswap.css'; // Import the correct CSS

// --- Placeholder Icons ---
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
// --- End Placeholder Icons ---

function TimeswapPage() { // Renamed component function
    const [sortBy, setSortBy] = useState('date-desc'); // Keep state for sorting

    const handleSortChange = (event) => {
        setSortBy(event.target.value);
        console.log("Sort by:", event.target.value);
    };

    // Dummy data array - replace with actual data for available swaps
    const dummySwaps = [
        // Using the same structure as Pending/Incoming for now
        { id: 101, teacherName: "Teacher X", teacherId: "DR.ABC", slotInfo: "Mon 08:00 - 09:30 | Network", sentDate: "01/04/2024", projector: true, computers: true },
        { id: 102, teacherName: "Teacher Y", teacherId: "DR.DEF", slotInfo: "Tue 11:20 - 12:50 | Database", sentDate: "02/04/2024", projector: false, computers: true },
        { id: 103, teacherName: "Teacher Z", teacherId: "DR.GHI", slotInfo: "Fri 14:40 - 16:10 | AI", sentDate: "03/04/2024", projector: true, computers: false },
    ];

    // Add sorting logic here based on sortBy state before rendering
    // const sortedSwaps = [...dummySwaps].sort(...);

    return (
        <div className="page-container"> 
            <AppNavbar />
            <div className="content-grid"> 
                <div className="filter-column">
                    <Filter />
                </div>

                <div className="main-column">
                    <div className="main-column-header">
                        {/* Moved Title Inside Header */}
                        <h1 className="page-title">Time Swap</h1> 
                        
                        {/* Group for Sort and Search */}
                        <div className="header-actions-group">
                            {/* Sort Dropdown */} 
                            <div className="sort-dropdown-container">
                                <label htmlFor="sort-select" className="sort-label">Sort by:</label>
                                <select id="sort-select" className="sort-select" value={sortBy} onChange={handleSortChange}>
                                    <option value="date-desc">Newest First</option>
                                    <option value="date-asc">Oldest First</option>
                                    <option value="teacher-asc">Teacher Name (A-Z)</option>
                                    {/* Add other relevant sort options */} 
                                </select>
                            </div>
                            {/* Search Bar */} 
                            <div className="search-bar-container">
                                <input type="text" placeholder="Search for available slots..." className="search-input" />
                                <SearchIcon className="search-icon" />
                            </div>
                        </div>
                    </div>

                    {/* Title removed from here */} 
                    <div className="requests-list-container"> {/* Can reuse class name */}
                        {/* Map over sortedSwaps instead of dummySwaps once sorting is implemented */}
                        {dummySwaps.map(swap => (
                            <Swap key={swap.id} swapData={swap} /> // Use Swap component
                        ))}
                        {dummySwaps.length === 0 && (
                            <p className="no-requests-message">No available slots found.</p> // Adjusted message
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TimeswapPage; // Export the page component

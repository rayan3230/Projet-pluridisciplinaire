import React from 'react';
import './Home.css'; // Import CSS for layout
import TeacherSchedule from '../../../components/TeacherSchedule/TeacherSchedule.jsx';
import PendingRequests from '../../../components/PendingRequest/PendingRequests.jsx';
import BrowseRequests from '../../../components/BrowseRequests/BrowseRequests.jsx';
// import Quickhelp from '../Quickhelp/Quickhelp'; // Removed Quickhelp import
import QuickStats from '../../../components/QuickStats/QuickStats.jsx'; // Import QuickStats
import Appnavbar from '../../../components/Appnavbar/Appnavbar.jsx'; // Import Appnavbar

function Home() {
    return (
        <>
            <Appnavbar />
            <div className="home-container">
                <div className="teacher-schedule-area">
                    <TeacherSchedule />
                </div>
                <div className="quick-actions-area"> {/* Renamed from pending-requests to quick-actions */} 
                    <PendingRequests /> {/* This will contain the pending requests card */}
                </div>
                <div className="browse-requests-area">
                    <BrowseRequests />
                </div>
                {/* Removed Help Center Area */}
                {/* <div className="help-center-area">
                    <Quickhelp />
                </div> */}
                {/* Add new component/content for this grid area below */}
                <div className="quick-stats-area"> {/* Changed class name */}
                    <QuickStats /> {/* Added QuickStats component */}
                </div>
            </div>
        </>
    );
}

export default Home;

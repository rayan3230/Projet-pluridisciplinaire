import React from 'react';
import './Home.css'; // Import CSS for layout
import TeacherSchedule from '../TeacherSchedule/TeacherSchedule';
import PendingRequests from '../PendingRequests/PendingRequests';
import BrowseRequests from '../BrowseRequests/BrowseRequests';
// import Quickhelp from '../Quickhelp/Quickhelp'; // Removed Quickhelp import
import QuickStats from '../QuickStats/QuickStats'; // Import QuickStats

function Home() {
    return (
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
    );
}

export default Home;

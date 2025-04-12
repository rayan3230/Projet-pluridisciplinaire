import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSemesters } from '../../services/semesterService'; // Need semesters
import ScheduleTable from '../../components/Schedule/ScheduleTable'; // Reuse table
// import './TeacherDashboardPage.css'; // Add styles if needed

function TeacherDashboardPage() {
  const { user } = useAuth(); // Get logged-in user
  const [currentSemester, setCurrentSemester] = useState(null); // Or selected semester state
  const [loadingSemester, setLoadingSemester] = useState(true);
  const [semesterError, setSemesterError] = useState(null);

  // Fetch semesters (e.g., to find the current one or allow selection)
  useEffect(() => {
    const fetchCurrentSemester = async () => {
      setLoadingSemester(true);
      setSemesterError(null);
      try {
        const semesters = await getSemesters();
        // Find the "current" semester based on date or just default to latest/first
        // This logic might need adjustment based on how you define "current"
        if (semesters && semesters.length > 0) {
          // Simple approach: use the first one returned (might need sorting by date)
          setCurrentSemester(semesters[0]); 
        } else {
           setSemesterError("No semesters found.");
        }
      } catch (err) {
        console.error("Failed to load semesters:", err);
        setSemesterError('Could not load semester data.');
      } finally {
        setLoadingSemester(false);
      }
    };
    fetchCurrentSemester();
  }, []);

  return (
    <div className="page-container teacher-dashboard">
      <h1>Teacher Dashboard</h1>
      <p>Welcome, {user?.name || 'Teacher'}!</p>
      
      {/* Other dashboard widgets could go here */}

      <div className="schedule-section">
        <h2>My Schedule {currentSemester ? `(${currentSemester.name})` : ''}</h2>
        {loadingSemester ? (
           <p>Loading semester info...</p>
        ) : semesterError ? (
           <p className="error-message">{semesterError}</p>
        ) : currentSemester && user?.id ? (
           <ScheduleTable 
             key={currentSemester.id} // Key by semester
             semesterId={currentSemester.id} 
             teacherId={user.id} 
           />
        ) : (
           <p>No schedule available to display.</p>
        )}
        {/* Optional: Add semester selector here if needed */}
      </div>

    </div>
  );
}

export default TeacherDashboardPage; 
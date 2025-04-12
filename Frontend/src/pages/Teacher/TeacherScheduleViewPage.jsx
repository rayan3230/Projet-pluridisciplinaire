import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getSemesters } from '../../services/semesterService'; // Need semesters
import ScheduleTable from '../../components/Schedule/ScheduleTable'; // Reuse table
// import './TeacherScheduleViewPage.css'; // Add styles if needed

function TeacherScheduleViewPage() {
  const { user } = useAuth(); // Get logged-in user
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [loadingSemesters, setLoadingSemesters] = useState(true);
  const [error, setError] = useState(null);

  // Fetch available semesters
  useEffect(() => {
    const fetchSemesters = async () => {
      setLoadingSemesters(true);
      setError(null);
      try {
        const data = await getSemesters();
        setSemesters(data || []);
      } catch (err) {
        console.error("Failed to load semesters:", err);
        setError('Could not load semesters.');
      } finally {
        setLoadingSemesters(false);
      }
    };
    fetchSemesters();
  }, []);

  return (
    <div className="page-container teacher-schedule-view-page">
      <h1>My Weekly Schedule</h1>
      {error && <p className="error-message">{error}</p>}

      <div className="controls-container">
        {loadingSemesters ? (
          <p>Loading semesters...</p>
        ) : (
          <div className="form-group">
            <label htmlFor="semesterSelect">Select Semester:</label>
            <select
              id="semesterSelect"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              disabled={semesters.length === 0}
              className="admin-select" // Reuse admin styling or create new
            >
              <option value="">-- Select Semester --</option>
              {semesters.map(semester => (
                <option key={semester.id} value={semester.id}>
                  {semester.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Display the schedule table if a semester is selected */}
      <div className="schedule-display-area">
        {selectedSemester && user?.id ? (
          <ScheduleTable
            key={`${selectedSemester}-${user.id}`} // Key includes user ID
            semesterId={selectedSemester}
            teacherId={user.id} // Pass teacher ID to filter
            // No need to pass promoId or sectionId here
          />
        ) : (
          !loadingSemesters && <p>Please select a semester to view your schedule.</p>
        )}
      </div>
    </div>
  );
};

export default TeacherScheduleViewPage;

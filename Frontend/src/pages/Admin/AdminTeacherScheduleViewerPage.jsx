import React, { useState, useEffect } from 'react';
import { getSemesters } from '../../services/semesterService';
import { getUsers } from '../../services/adminService'; // To get teachers
import { exportTeacherScheduleToPDF, exportTeacherScheduleToExcel } from '../../services/scheduleService';
import ScheduleTable from '../../components/Schedule/ScheduleTable'; // Reuse the table
// Add specific styling if needed

const AdminTeacherScheduleViewerPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [loading, setLoading] = useState(true); // Combined loading state
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Fetch available teachers and semesters
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [teachersData, semestersData] = await Promise.all([
          getUsers({ is_teacher: true }), // Fetch only teachers
          getSemesters()
        ]);
        setTeachers(teachersData || []);
        setSemesters(semestersData || []);
      } catch (err) {
        console.error("Failed to load teachers or semesters:", err);
        setError('Could not load necessary data. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExportPDF = async () => {
    if (!selectedTeacher || !selectedSemester) {
      setError('Please select both teacher and semester before exporting.');
      return;
    }

    setExporting(true);
    try {
      await exportTeacherScheduleToPDF(selectedTeacher, selectedSemester);
    } catch (error) {
      console.error('Export to PDF error:', error);
      setError('Failed to export schedule to PDF.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!selectedTeacher || !selectedSemester) {
      setError('Please select both teacher and semester before exporting.');
      return;
    }

    setExporting(true);
    try {
      await exportTeacherScheduleToExcel(selectedTeacher, selectedSemester);
    } catch (error) {
      console.error('Export to Excel error:', error);
      setError('Failed to export schedule to Excel.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="admin-page-container teacher-schedule-viewer-page">
      <h1>View Teacher Schedules</h1>
      {error && <p className="admin-error">{error}</p>}

      {loading ? (
        <p className="admin-loading">Loading options...</p>
      ) : (
        <div className="controls-container admin-form" style={{ marginBottom: '20px' }}>
          <div className="form-row"> {/* Use form-row for horizontal layout */}
            <div className="form-group form-group-half">
              <label htmlFor="teacherSelect">Select Teacher:</label>
              <select
                id="teacherSelect"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                disabled={teachers.length === 0}
                className="admin-select"
              >
                <option value="">-- Select Teacher --</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.full_name || teacher.scope_email}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group form-group-half">
              <label htmlFor="semesterSelect">Select Semester:</label>
              <select
                id="semesterSelect"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                disabled={semesters.length === 0}
                className="admin-select"
              >
                <option value="">-- Select Semester --</option>
                {semesters
                  .filter(sem => sem.start_date && sem.end_date) // <-- Filter semesters with dates
                  .map(semester => (
                  <option key={semester.id} value={semester.id}>
                    {semester.semester_number === 1 ? 'First Semester' : 'Second Semester'} 
                    ({semester.academic_year?.year_start ?? '?'}-{semester.academic_year?.year_end ?? '?'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedTeacher && selectedSemester && (
            <div className="export-buttons">
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="admin-button"
              >
                {exporting ? 'Exporting...' : 'Export to PDF'}
              </button>
              <button
                onClick={handleExportExcel}
                disabled={exporting}
                className="admin-button"
              >
                {exporting ? 'Exporting...' : 'Export to Excel'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Display the schedule table if a semester and teacher are selected */}
      <div className="schedule-display-area">
        {selectedSemester && selectedTeacher ? (
          <ScheduleTable
            key={`${selectedSemester}-${selectedTeacher}`} // Re-render when selection changes
            semesterId={selectedSemester}
            teacherId={selectedTeacher} // Pass selected teacher ID
          />
        ) : (
          !loading && <p>Please select a Teacher and Semester to view their schedule.</p>
        )}
      </div>
    </div>
  );
};

export default AdminTeacherScheduleViewerPage;
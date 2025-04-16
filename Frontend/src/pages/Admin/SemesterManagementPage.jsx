import React, { useState, useEffect } from 'react';
import { getSemesters, updateSemester } from '../../services/semesterService';
import { getAcademicYears, createAcademicYear } from '../../services/academicService';
import SemesterList from '../../components/Admin/SemesterList';
import SemesterForm from '../../components/Admin/SemesterForm';
import './SemesterManagementPage.css';

const SemesterManagementPage = () => {
  const [semesters, setSemesters] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newAcademicYear, setNewAcademicYear] = useState({
    year_start: '',
    year_end: ''
  });

  useEffect(() => {
    fetchSemesters();
    fetchAcademicYears();
  }, []);

  const fetchSemesters = async () => {
    try {
      const data = await getSemesters();
      setSemesters(data);
    } catch (error) {
      setError('Failed to fetch semesters');
      console.error('Error fetching semesters:', error);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const data = await getAcademicYears();
      setAcademicYears(data);
    } catch (error) {
      setError('Failed to fetch academic years');
      console.error('Error fetching academic years:', error);
    }
  };

  const handleEditSemester = (semester) => {
    setSelectedSemester(semester);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedSemester(null);
    setError(null);
  };

  const handleUpdateSuccess = () => {
    setIsFormOpen(false);
    setSelectedSemester(null);
    fetchSemesters();
    setError(null);
  };

  const handleUpdateSemester = async (updatedData) => {
    try {
      await updateSemester(selectedSemester.id, updatedData);
      await fetchSemesters();
      handleCloseForm();
    } catch (error) {
      setError('Failed to update semester');
      console.error('Error updating semester:', error);
    }
  };

  const handleCreateAcademicYear = async (e) => {
    e.preventDefault();
    // Parse years to integers before sending
    const payload = {
      year_start: parseInt(newAcademicYear.year_start, 10),
      year_end: parseInt(newAcademicYear.year_end, 10)
    };

    // Basic validation for numbers
    if (isNaN(payload.year_start) || isNaN(payload.year_end)) {
        setError('Invalid year format. Please enter numbers.');
        console.error('Invalid year input:', newAcademicYear);
        return; 
    }

    // --- Add validation for year span BEFORE API call ---
    if (payload.year_end !== payload.year_start + 1) {
        setError('Academic year must span exactly one year (e.g., Start 2024, End 2025).');
        return; // Stop before making the API call
    }
    // --- End of year span check ---

    // --- Check for existing year BEFORE API call ---
    const yearExists = academicYears.some(
      (year) => year.year_start === payload.year_start && year.year_end === payload.year_end
    );

    if (yearExists) {
        window.alert(`Academic Year ${payload.year_start}-${payload.year_end} already exists.`);
        return; // Stop before making the API call
    }
    // --- End of added check ---

    setIsLoading(true);
    setError('');

    try {
      await createAcademicYear(payload); // Use the parsed payload
      await fetchAcademicYears(); // Refresh the list including the new one
      await fetchSemesters();
      setNewAcademicYear({ year_start: '', year_end: '' });
      setError(''); // Clear any previous errors on success
    } catch (error) {
      let errorMessage = 'Failed to create academic year.'; // Default error
      if (error.response && error.response.data && error.response.data.non_field_errors) {
        const nonFieldErrors = error.response.data.non_field_errors;
        if (nonFieldErrors.some(err => err.includes('must make a unique set')) ||
            nonFieldErrors.some(err => err.includes('already exists'))) { 
          errorMessage = `Academic Year ${payload.year_start}-${payload.year_end} already exists.`;
        } else if (nonFieldErrors.some(err => err.includes('must span exactly one year'))) { // Added check for span error
           errorMessage = 'Academic year must span exactly one year (e.g., Start 2024, End 2025).';
        }
      }
      setError(errorMessage);
      console.error('Error creating academic year:', error); // Keep detailed log for debugging
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="semester-management-container">
      <h1>Semester Management</h1>
      
      <div className="academic-year-form">
        <h2>Create New Academic Year</h2>
        <form onSubmit={handleCreateAcademicYear}>
          <div className="form-group">
            <label htmlFor="year_start">Start Year:</label>
            <input
              type="number"
              id="year_start"
              value={newAcademicYear.year_start}
              onChange={(e) => setNewAcademicYear({ ...newAcademicYear, year_start: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="year_end">End Year:</label>
            <input
              type="number"
              id="year_end"
              value={newAcademicYear.year_end}
              onChange={(e) => setNewAcademicYear({ ...newAcademicYear, year_end: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="create-button" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Academic Year'}
          </button>
        </form>
      </div>

      <div className="semester-list-section">
        <h2>Academic Year Semesters</h2>
        <p className="info-note">
          Each academic year has two semesters (First and Second) that are shared across all specialities.
          You can only edit the start and end dates of each semester.
        </p>
        <SemesterList semesters={semesters} onEditSemester={handleEditSemester} />
      </div>

      {isFormOpen && (
        <SemesterForm
          semester={selectedSemester}
          onClose={handleCloseForm}
          onSubmitSuccess={handleUpdateSuccess}
        />
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default SemesterManagementPage; 
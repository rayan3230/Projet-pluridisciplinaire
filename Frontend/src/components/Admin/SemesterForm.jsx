import React, { useState, useEffect } from 'react';
import { updateSemester } from '../../services/semesterService';

function SemesterForm({ semester, onSubmitSuccess, onCancel }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (semester) {
      setStartDate(semester.start_date || '');
      setEndDate(semester.end_date || '');
    }
  }, [semester]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const updatedData = { 
      start_date: startDate, 
      end_date: endDate 
    };

    try {
      await updateSemester(semester.id, updatedData);
      onSubmitSuccess();
    } catch (err) {
        let errorMessage = 'Failed to update semester.';
        if (err.response && err.response.data) {
            const errorData = err.response.data;
            if (errorData.start_date && Array.isArray(errorData.start_date)) {
                errorMessage = `Start Date: ${errorData.start_date.join(' ')}`;
            } else if (errorData.end_date && Array.isArray(errorData.end_date)) {
                errorMessage = `End Date: ${errorData.end_date.join(' ')}`;
            } else if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
                errorMessage = errorData.non_field_errors.join(' ');
            } else if (typeof errorData === 'object' && errorData !== null) {
                errorMessage = JSON.stringify(errorData);
            } else if (typeof errorData === 'string') {
                errorMessage = errorData;
            }
        }
      setError(errorMessage);
      console.error('Semester update failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.2em' }}>
        Edit {semester?.semester_number === 1 ? 'First' : 'Second'} Semester
      </h2>
      
      <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#e9f7fe', borderRadius: '5px' }}>
        <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
          Academic Year: {semester?.academic_year?.year_start ?? 'N/A'}-{semester?.academic_year?.year_end ?? 'N/A'}
        </p>
      </div>
      
      <p style={{ marginBottom: '1rem', color: '#666' }}>
        Set the start and end dates for this semester.
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="startDate" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Start Date:</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            disabled={isLoading}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor="endDate" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>End Date:</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            disabled={isLoading}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
          />
        </div>
      </div>

      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button 
          type="submit" 
          disabled={isLoading}
          style={{
            padding: '10px 15px', 
            backgroundColor: isLoading ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '3px', 
            cursor: isLoading ? 'not-allowed' : 'pointer',
            flex: 1
          }}
        >
          {isLoading ? 'Saving...' : 'Update Semester'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            style={{
              padding: '10px 15px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer',
              flex: 1
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default SemesterForm; 
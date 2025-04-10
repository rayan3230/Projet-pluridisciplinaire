import React, { useState } from 'react';
import { createSemester } from '../../services/semesterService';

function SemesterForm({ onSubmitSuccess }) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !startDate || !endDate) {
        setError('Please fill in all fields.');
        return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setError('End date must be after start date.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = { name, start_date: startDate, end_date: endDate };
      await createSemester(payload);
      setName('');
      setStartDate('');
      setEndDate('');
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      console.error('Semester creation failed:', err);
      const errorMsg = err.response?.data?.detail || 'Failed to create semester.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.2em' }}>Create New Semester</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="semesterName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Semester Name:</label>
        <input
          type="text"
          id="semesterName"
          placeholder="e.g., Semester 1, Autumn 2024"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
        />
      </div>

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
      
      <button 
        type="submit" 
        disabled={isLoading}
        style={{
          padding: '10px 15px', 
          backgroundColor: isLoading ? '#ccc' : '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '3px', 
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? 'Creating...' : 'Create Semester'}
      </button>
    </form>
  );
}

export default SemesterForm; 
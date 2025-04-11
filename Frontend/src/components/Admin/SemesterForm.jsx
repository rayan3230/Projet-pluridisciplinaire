import React, { useState } from 'react';
// import { createSemester } from '../../services/semesterService';

function SemesterForm({ onSubmitSuccess }) {
  const [name, setName] = useState(''); // e.g., Semester 1, Semester 2
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!startDate || !endDate || new Date(startDate) >= new Date(endDate)) {
      setError('Please provide valid start and end dates.');
      return;
    }
    try {
      // await createSemester({ name, start_date: startDate, end_date: endDate });
      console.log(`Semester '${name}' created (mock)`);
      setName('');
      setStartDate('');
      setEndDate('');
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      console.error('Semester creation failed:', err);
      setError('Failed to create semester.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
      <h2>Create New Semester</h2>
      <div>
        <label htmlFor="semesterName">Name:</label>
        <input
          type="text"
          id="semesterName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Semester 1 2024/2025"
          required
        />
      </div>
      <div>
        <label htmlFor="startDate">Start Date:</label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="endDate">End Date:</label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">Create Semester</button>
    </form>
  );
}

export default SemesterForm; 
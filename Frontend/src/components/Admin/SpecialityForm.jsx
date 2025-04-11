import React, { useState } from 'react';
// import { createSpeciality } from '../../services/academicService';

function SpecialityForm({ onSubmitSuccess }) { // onSubmitSuccess callback to update list
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // await createSpeciality({ name });
      console.log(`Speciality '${name}' created (mock)`);
      setName('');
      if (onSubmitSuccess) onSubmitSuccess(); // Trigger parent component update
    } catch (err) {
      console.error('Speciality creation failed:', err);
      setError('Failed to create speciality.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
      <h2>Create New Speciality</h2>
      <div>
        <label htmlFor="specialityName">Name:</label>
        <input
          type="text"
          id="specialityName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">Create Speciality</button>
    </form>
  );
}

export default SpecialityForm; 
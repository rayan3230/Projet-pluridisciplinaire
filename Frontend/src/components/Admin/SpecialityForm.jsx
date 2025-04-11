import React, { useState } from 'react';
import { createSpeciality } from '../../services/academicService';

function SpecialityForm({ onSubmitSuccess }) { // onSubmitSuccess callback to update list
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true); // Start loading
    try {
      await createSpeciality({ name }); // Use the actual API call
      setName(''); // Clear form on success
      if (onSubmitSuccess) onSubmitSuccess(); // Trigger parent component update
    } catch (err) {
      console.error('Speciality creation failed:', err);
      // Display a more specific error if available from the backend response
      const errorMsg = err.response?.data?.name?.[0] || err.response?.data?.detail || 'Failed to create speciality.';
      setError(errorMsg);
    } finally {
      setIsLoading(false); // Stop loading regardless of outcome
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.2em' }}>Create New Speciality</h2>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="specialityName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Name:</label>
        <input
          type="text"
          id="specialityName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading} // Disable input while loading
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
        />
      </div>
      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
      <button 
        type="submit" 
        disabled={isLoading} // Disable button while loading
        style={{ 
          padding: '10px 15px', 
          backgroundColor: isLoading ? '#ccc' : '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '3px', 
          cursor: isLoading ? 'not-allowed' : 'pointer' 
        }}
      >
        {isLoading ? 'Creating...' : 'Create Speciality'}
      </button>
    </form>
  );
}

export default SpecialityForm; 
import React, { useState } from 'react';
// Use createClassroom from the updated service
import { createClassroom } from '../../services/academicService'; 

function ClassForm({ onSubmitSuccess }) {
  const [name, setName] = useState(''); 
  const [classType, setClassType] = useState('Cours'); // Cours, TD, TP
  const [capacity, setCapacity] = useState(30); // Added capacity field
  const [hasProjector, setHasProjector] = useState(false);
  const [computersCount, setComputersCount] = useState(0); // Renamed from tpComputers
  
  // Removed hardcoded sectionId - this likely needs to be passed as a prop
  // or selected within a parent component.
  // const sectionId = 1; // Placeholder removed

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const payload = {
      name,
      type: classType,
      capacity: parseInt(capacity, 10) || 0,
      has_projector: hasProjector,
      computers_count: parseInt(computersCount, 10) || 0 // Use correct field name
      // section: sectionId, // Removed - Classroom model doesn't link directly to Section
    };
    // computers_count is always sent now, backend model handles defaults
    // if (classType === 'TP') {
    //   payload.computers_count = parseInt(computersCount, 10) || 0;
    // }

    try {
      await createClassroom(payload); // Use real API call
      // console.log(`Class '${name}' of type '${classType}' created (mock)`); // Remove mock
      // Reset form
      setName('');
      setClassType('Cours');
      setCapacity(30);
      setHasProjector(false);
      setComputersCount(0);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      console.error('Classroom creation failed:', err);
      const errorMsg = err.response?.data?.detail || 'Failed to create classroom.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Basic styling similar to other forms
  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.2em' }}>Create New Classroom</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="className" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Classroom Name/Number:</label>
        <input
          type="text"
          id="className"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="classType" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Type:</label>
          <select
            id="classType"
            value={classType}
            onChange={(e) => setClassType(e.target.value)}
            required
            disabled={isLoading}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
          >
            <option value="Cours">Cours</option>
            <option value="TD">TD</option>
            <option value="TP">TP</option>
          </select>
        </div>
        <div style={{ flex: 1 }}>
           <label htmlFor="capacity" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Capacity:</label>
            <input
              type="number"
              id="capacity"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              min="0"
              required
              disabled={isLoading}
              style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
            />
        </div>
      </div>

       <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
         <div style={{ flex: 2, display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              id="hasProjector"
              checked={hasProjector}
              onChange={(e) => setHasProjector(e.target.checked)}
              disabled={isLoading}
              style={{ marginRight: '0.5rem' }}
            />
            <label htmlFor="hasProjector" style={{ fontWeight: 'bold' }}>Has Projector?</label>
        </div>
         <div style={{ flex: 1 }}>
           <label htmlFor="computersCount" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Computers (if TP):</label>
            <input
              type="number"
              id="computersCount"
              value={computersCount}
              onChange={(e) => setComputersCount(e.target.value)}
              min="0"
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
        {isLoading ? 'Creating...' : 'Create Classroom'}
      </button>
    </form>
  );
}

export default ClassForm; 
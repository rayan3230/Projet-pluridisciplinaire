import React, { useState } from 'react';
// import { createClass } from '../../services/academicService';

function ClassForm({ onSubmitSuccess }) {
  const [name, setName] = useState(''); // Or maybe room number?
  const [classType, setClassType] = useState('Cours'); // Cours, TD, TP
  const [hasProjector, setHasProjector] = useState(false);
  const [tpComputers, setTpComputers] = useState(0);
  // Need section ID from parent context or selection
  const sectionId = 1; // Placeholder
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = {
      name, // Adjust if needed
      type: classType,
      has_projector: hasProjector,
      section: sectionId, // Pass the relevant section ID
    };
    if (classType === 'TP') {
      payload.tp_computers = parseInt(tpComputers, 10) || 0;
    }

    try {
      // await createClass(payload);
      console.log(`Class '${name}' of type '${classType}' created (mock)`);
      // Reset form
      setName('');
      setClassType('Cours');
      setHasProjector(false);
      setTpComputers(0);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      console.error('Class creation failed:', err);
      setError('Failed to create class.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
      <h2>Create New Class/Room</h2>
      {/* Add selection for Section if managing classes globally */}
      <div>
        <label htmlFor="className">Name/Number:</label>
        <input
          type="text"
          id="className"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="classType">Type:</label>
        <select
          id="classType"
          value={classType}
          onChange={(e) => setClassType(e.target.value)}
        >
          <option value="Cours">Cours</option>
          <option value="TD">TD</option>
          <option value="TP">TP</option>
        </select>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={hasProjector}
            onChange={(e) => setHasProjector(e.target.checked)}
          />
          Has Projector?
        </label>
      </div>
      {classType === 'TP' && (
        <div>
          <label htmlFor="tpComputers">Number of Computers:</label>
          <input
            type="number"
            id="tpComputers"
            value={tpComputers}
            onChange={(e) => setTpComputers(e.target.value)}
            min="0"
          />
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">Create Class</button>
    </form>
  );
}

export default ClassForm; 
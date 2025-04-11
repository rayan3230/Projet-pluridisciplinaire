import React, { useState } from 'react';
// import { createBaseModule } from '../../services/moduleService';

function BaseModuleForm({ onSubmitSuccess }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [coef, setCoef] = useState(1);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // await createBaseModule({ name, code, coef: parseFloat(coef) });
      console.log(`Base Module '${name}' (${code}) created (mock)`);
      setName('');
      setCode('');
      setCoef(1);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      console.error('Base Module creation failed:', err);
      setError('Failed to create base module.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
      <h2>Create New Base Module</h2>
      <div>
        <label htmlFor="moduleName">Name:</label>
        <input
          type="text"
          id="moduleName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="moduleCode">Code (e.g., ANAL):</label>
        <input
          type="text"
          id="moduleCode"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="moduleCoef">Coefficient:</label>
        <input
          type="number"
          id="moduleCoef"
          value={coef}
          onChange={(e) => setCoef(e.target.value)}
          min="0" // Adjust min/step as needed
          step="0.5"
          required
        />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit">Create Base Module</button>
    </form>
  );
}

export default BaseModuleForm; 
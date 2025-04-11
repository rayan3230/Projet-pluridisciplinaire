import React, { useState } from 'react';
import { createBaseModule } from '../../services/moduleService';

function BaseModuleForm({ onSubmitSuccess }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [coef, setCoef] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const payload = { name, code, coef: parseFloat(coef) || 1.0 };
      await createBaseModule(payload);
      setName('');
      setCode('');
      setCoef(1);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      console.error('Base Module creation failed:', err);
      const errorMsg = err.response?.data?.detail || 'Failed to create base module. Check fields.';
      if (err.response?.data?.name) setError(`Name: ${err.response.data.name[0]}`);
      else if (err.response?.data?.code) setError(`Code: ${err.response.data.code[0]}`);
      else if (err.response?.data?.coef) setError(`Coefficient: ${err.response.data.coef[0]}`);
      else setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.2em' }}>Create New Base Module</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="moduleName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Name:</label>
        <input
          type="text"
          id="moduleName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="moduleCode" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Code (e.g., ANAL):</label>
        <input
          type="text"
          id="moduleCode"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          disabled={isLoading}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="moduleCoef" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Coefficient:</label>
        <input
          type="number"
          id="moduleCoef"
          value={coef}
          onChange={(e) => setCoef(e.target.value)}
          min="0" 
          step="0.5"
          required
          disabled={isLoading}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
        />
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
        {isLoading ? 'Creating...' : 'Create Base Module'}
      </button>
    </form>
  );
}

export default BaseModuleForm; 
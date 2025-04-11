import React, { useState, useEffect } from 'react';
import { createVersionModule, getBaseModules } from '../../services/moduleService';

function VersionModuleForm({ onSubmitSuccess }) {
  const [versionName, setVersionName] = useState('');
  const [baseModuleId, setBaseModuleId] = useState('');
  const [coursHours, setCoursHours] = useState(0);
  const [tdHours, setTdHours] = useState(0);
  const [tpHours, setTpHours] = useState(0);
  const [baseModules, setBaseModules] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBaseModules = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await getBaseModules();
        setBaseModules(data);
      } catch (err) {
        console.error('Failed to fetch base modules:', err);
        setError('Could not load base modules for selection. Please refresh or try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBaseModules();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!baseModuleId) {
      setError('Please select a base module.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        version_name: versionName,
        base_module_id: baseModuleId,
        cours_hours: parseInt(coursHours, 10) || 0,
        td_hours: parseInt(tdHours, 10) || 0,
        tp_hours: parseInt(tpHours, 10) || 0,
      };
      await createVersionModule(payload);
      setVersionName('');
      setBaseModuleId('');
      setCoursHours(0);
      setTdHours(0);
      setTpHours(0);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      console.error('Version Module creation failed:', err);
      const errorMsg = err.response?.data?.detail || 'Failed to create version module.';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.2em' }}>Create New Version Module</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="baseModuleSelect" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Base Module:</label>
        <select 
          id="baseModuleSelect" 
          value={baseModuleId} 
          onChange={(e) => setBaseModuleId(e.target.value)} 
          required
          disabled={isLoading || isSubmitting}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
        >
          <option value="">-- Select Base Module --</option>
          {baseModules.map(bm => (
            <option key={bm.id} value={bm.id}>{bm.name} ({bm.code})</option>
          ))}
        </select>
        {isLoading && <p>Loading base modules...</p>}
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="versionName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Version Name (e.g., 1, Advanced, optional):</label>
        <input
          type="text"
          id="versionName"
          value={versionName}
          onChange={(e) => setVersionName(e.target.value)}
          disabled={isSubmitting}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label htmlFor="coursHours" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Cours Hours:</label>
          <input
            type="number"
            id="coursHours"
            value={coursHours}
            onChange={(e) => setCoursHours(e.target.value)}
            min="0"
            required
            disabled={isSubmitting}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor="tdHours" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>TD Hours:</label>
          <input
            type="number"
            id="tdHours"
            value={tdHours}
            onChange={(e) => setTdHours(e.target.value)}
            min="0"
            required
            disabled={isSubmitting}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label htmlFor="tpHours" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>TP Hours:</label>
          <input
            type="number"
            id="tpHours"
            value={tpHours}
            onChange={(e) => setTpHours(e.target.value)}
            min="0"
            required
            disabled={isSubmitting}
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
          />
        </div>
      </div>

      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}
      
      <button 
        type="submit" 
        disabled={isLoading || isSubmitting}
        style={{
          padding: '10px 15px', 
          backgroundColor: (isLoading || isSubmitting) ? '#ccc' : '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '3px', 
          cursor: (isLoading || isSubmitting) ? 'not-allowed' : 'pointer'
        }}
      >
        {isSubmitting ? 'Creating...' : 'Create Version Module'}
      </button>
    </form>
  );
}

export default VersionModuleForm; 
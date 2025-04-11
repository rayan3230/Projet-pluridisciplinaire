import React, { useState, useEffect } from 'react';
// import { createVersionModule, getBaseModules } from '../../services/moduleService';

function VersionModuleForm({ onSubmitSuccess }) {
  const [name, setName] = useState(''); // e.g., ANAL1
  const [baseModuleId, setBaseModuleId] = useState('');
  const [coursHours, setCoursHours] = useState(0);
  const [tdHours, setTdHours] = useState(0);
  const [tpHours, setTpHours] = useState(0);
  const [baseModules, setBaseModules] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch base modules for selection
    const fetchBaseModules = async () => {
      try {
        // const data = await getBaseModules();
        // setBaseModules(data);
        setBaseModules([{ id: 1, name: 'Analyse (Mock)', code: 'ANAL' }, { id: 2, name: 'Programmation (Mock)', code: 'PROG' }]); // Mock
      } catch (err) {
        console.error('Failed to fetch base modules:', err);
        setError('Could not load base modules for selection.');
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
    try {
      const payload = {
        name,
        base_module: baseModuleId,
        cours_hours: parseInt(coursHours, 10) || 0,
        td_hours: parseInt(tdHours, 10) || 0,
        tp_hours: parseInt(tpHours, 10) || 0,
      };
      // await createVersionModule(payload);
      console.log(`Version Module '${name}' created (mock)`);
      // Reset form
      setName('');
      setBaseModuleId('');
      setCoursHours(0);
      setTdHours(0);
      setTpHours(0);
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      console.error('Version Module creation failed:', err);
      setError('Failed to create version module.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
      <h2>Create New Version Module</h2>
      <div>
        <label htmlFor="versionModuleName">Name (e.g., ANAL1):</label>
        <input
          type="text"
          id="versionModuleName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="baseModuleSelect">Base Module:</label>
        <select
          id="baseModuleSelect"
          value={baseModuleId}
          onChange={(e) => setBaseModuleId(e.target.value)}
          required
        >
          <option value="">-- Select Base Module --</option>
          {baseModules.map(bm => (
            <option key={bm.id} value={bm.id}>{bm.name} ({bm.code})</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="coursHours">Cours Hours:</label>
        <input type="number" id="coursHours" value={coursHours} onChange={(e) => setCoursHours(e.target.value)} min="0" />
      </div>
      <div>
        <label htmlFor="tdHours">TD Hours:</label>
        <input type="number" id="tdHours" value={tdHours} onChange={(e) => setTdHours(e.target.value)} min="0" />
      </div>
      <div>
        <label htmlFor="tpHours">TP Hours:</label>
        <input type="number" id="tpHours" value={tpHours} onChange={(e) => setTpHours(e.target.value)} min="0" />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={baseModules.length === 0}>Create Version Module</button>
    </form>
  );
}

export default VersionModuleForm; 
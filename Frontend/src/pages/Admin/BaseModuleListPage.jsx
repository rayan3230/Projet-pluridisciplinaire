import React, { useState, useEffect } from 'react';
import { getBaseModules } from '../../services/moduleService';
import BaseModuleForm from '../../components/Admin/BaseModuleForm';

// Basic styling
const styles = {
  container: { padding: '1rem', maxWidth: '800px', margin: 'auto' },
  list: { listStyle: 'none', padding: 0 },
  listItem: { borderBottom: '1px solid #eee', padding: '0.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  error: { color: 'red', marginBottom: '1rem' },
  loading: { fontStyle: 'italic' }
};

function BaseModuleListPage() {
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getBaseModules(); 
      setModules(data);
    } catch (err) {
      console.error("Failed to fetch base modules:", err);
      setError('Could not load base modules. Please try refreshing.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFormSubmitSuccess = () => {
    setShowForm(false); 
    fetchData(); 
  };

  return (
    <div style={styles.container}>
      <h1>Manage Base Modules</h1>
      {error && <p style={styles.error}>{error}</p>}

      <button 
        onClick={() => setShowForm(!showForm)} 
        style={{ marginBottom: '1rem', padding: '8px 12px', cursor: 'pointer' }}
      >
        {showForm ? 'Cancel' : 'Add New Base Module'}
      </button>

      {showForm && (
        <BaseModuleForm onSubmitSuccess={handleFormSubmitSuccess} />
      )}

      {isLoading ? (
        <p style={styles.loading}>Loading base modules...</p>
      ) : modules.length === 0 && !error ? (
        <p>No base modules found.</p>
      ) : (
        <ul style={styles.list}>
          {modules.map(mod => (
            <li key={mod.id} style={styles.listItem}>
              <span>{mod.name} ({mod.code}) - Coef: {mod.coef}</span> 
              {/* Add Edit/Delete buttons later */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BaseModuleListPage; 
import React, { useState, useEffect } from 'react';
import { getVersionModules } from '../../services/moduleService';
import VersionModuleForm from '../../components/Admin/VersionModuleForm';

// Basic styling
const styles = {
  container: { padding: '1rem', maxWidth: '800px', margin: 'auto' },
  list: { listStyle: 'none', padding: 0 },
  listItem: { borderBottom: '1px solid #eee', padding: '0.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  error: { color: 'red', marginBottom: '1rem' },
  loading: { fontStyle: 'italic' }
};

function VersionModuleListPage() {
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Fetch version modules - serializer includes base module details
      const data = await getVersionModules(); 
      setModules(data);
    } catch (err) {
      console.error("Failed to fetch version modules:", err);
      setError('Could not load version modules. Please try refreshing.');
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
      <h1>Manage Version Modules</h1>
      {error && <p style={styles.error}>{error}</p>}

      <button 
        onClick={() => setShowForm(!showForm)} 
        style={{ marginBottom: '1rem', padding: '8px 12px', cursor: 'pointer' }}
      >
        {showForm ? 'Cancel' : 'Add New Version Module'}
      </button>

      {showForm && (
        <VersionModuleForm onSubmitSuccess={handleFormSubmitSuccess} />
      )}

      {isLoading ? (
        <p style={styles.loading}>Loading version modules...</p>
      ) : modules.length === 0 && !error ? (
        <p>No version modules found.</p>
      ) : (
        <ul style={styles.list}>
          {modules.map(mod => (
            <li key={mod.id} style={styles.listItem}>
              <span>
                {mod.base_module?.name || 'N/A'} 
                {mod.version_name ? ` - ${mod.version_name}` : ''} 
                (C: {mod.cours_hours}h, TD: {mod.td_hours}h, TP: {mod.tp_hours}h)
              </span> 
              {/* Add Edit/Delete buttons later */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default VersionModuleListPage; 
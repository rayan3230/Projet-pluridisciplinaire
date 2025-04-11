import React, { useState, useEffect } from 'react';
import { getClassrooms } from '../../services/academicService';
import ClassForm from '../../components/Admin/ClassForm';

// Basic styling
const styles = {
  container: { padding: '1rem', maxWidth: '800px', margin: 'auto' },
  list: { listStyle: 'none', padding: 0 },
  listItem: { borderBottom: '1px solid #eee', padding: '0.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  error: { color: 'red', marginBottom: '1rem' },
  loading: { fontStyle: 'italic' }
};

function ClassroomListPage() {
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getClassrooms(); 
      setClassrooms(data);
    } catch (err) {
      console.error("Failed to fetch classrooms:", err);
      setError('Could not load classrooms. Please try refreshing.');
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
      <h1>Manage Classrooms</h1>
      {error && <p style={styles.error}>{error}</p>}

      <button 
        onClick={() => setShowForm(!showForm)} 
        style={{ marginBottom: '1rem', padding: '8px 12px', cursor: 'pointer' }}
      >
        {showForm ? 'Cancel' : 'Add New Classroom'}
      </button>

      {showForm && (
        <ClassForm onSubmitSuccess={handleFormSubmitSuccess} />
      )}

      {isLoading ? (
        <p style={styles.loading}>Loading classrooms...</p>
      ) : classrooms.length === 0 && !error ? (
        <p>No classrooms found.</p>
      ) : (
        <ul style={styles.list}>
          {classrooms.map(cr => (
            <li key={cr.id} style={styles.listItem}>
              <span>{cr.name} ({cr.type}) - Cap: {cr.capacity}, Proj: {cr.has_projector ? 'Yes' : 'No'}, PCs: {cr.computers_count}</span> 
              {/* Add Edit/Delete buttons later */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ClassroomListPage; 
import React, { useState, useEffect } from 'react';
import { getSpecialities } from '../../services/academicService'; 
import SpecialityForm from '../../components/Admin/SpecialityForm'; // Import the form

// Basic styling (replace with CSS classes or UI library)
const styles = {
  container: { padding: '1rem', maxWidth: '800px', margin: 'auto' },
  list: { listStyle: 'none', padding: 0 },
  listItem: { borderBottom: '1px solid #eee', padding: '0.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  error: { color: 'red', marginBottom: '1rem' },
  loading: { fontStyle: 'italic' }
  // TODO: Add styles for Edit/Delete buttons if needed
};

function SpecialityListPage() {
  const [specialities, setSpecialities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false); // State to toggle form visibility

  // Function to fetch data
  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getSpecialities();
      setSpecialities(data);
    } catch (err) {
      console.error("Failed to fetch specialities:", err);
      setError('Could not load specialities. Please try refreshing.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Callback for when the form successfully submits
  const handleFormSubmitSuccess = () => {
    setShowForm(false); // Hide the form
    fetchData(); // Refresh the list
  };

  return (
    <div style={styles.container}>
      <h1>Manage Specialities</h1>
      {error && <p style={styles.error}>{error}</p>}

      <button 
        onClick={() => setShowForm(!showForm)} 
        style={{ marginBottom: '1rem', padding: '8px 12px', cursor: 'pointer' }}
      >
        {showForm ? 'Cancel' : 'Add New Speciality'}
      </button>

      {showForm && (
        <SpecialityForm onSubmitSuccess={handleFormSubmitSuccess} />
      )}

      {isLoading ? (
        <p style={styles.loading}>Loading specialities...</p>
      ) : specialities.length === 0 && !error ? (
        <p>No specialities found.</p>
      ) : (
        <ul style={styles.list}>
          {specialities.map(spec => (
            <li key={spec.id} style={styles.listItem}>
              <span>{spec.name}</span>
              {/* Add Edit/Delete buttons here later */}
              {/* <div>
                  <button>Edit</button>
                  <button>Delete</button>
              </div> */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SpecialityListPage; 
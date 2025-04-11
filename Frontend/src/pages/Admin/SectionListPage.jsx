import React, { useState, useEffect } from 'react';
import { getSections } from '../../services/academicService';
import SectionForm from '../../components/Admin/SectionForm';

// Basic styling
const styles = {
  container: { padding: '1rem', maxWidth: '800px', margin: 'auto' },
  list: { listStyle: 'none', padding: 0 },
  listItem: { borderBottom: '1px solid #eee', padding: '0.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  error: { color: 'red', marginBottom: '1rem' },
  loading: { fontStyle: 'italic' }
};

function SectionListPage() {
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Fetch sections - serializer includes promo details
      const data = await getSections(); 
      setSections(data);
    } catch (err) {
      console.error("Failed to fetch sections:", err);
      setError('Could not load sections. Please try refreshing.');
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
      <h1>Manage Sections</h1>
      {error && <p style={styles.error}>{error}</p>}

      <button 
        onClick={() => setShowForm(!showForm)} 
        style={{ marginBottom: '1rem', padding: '8px 12px', cursor: 'pointer' }}
      >
        {showForm ? 'Cancel' : 'Add New Section'}
      </button>

      {showForm && (
        <SectionForm onSubmitSuccess={handleFormSubmitSuccess} />
      )}

      {isLoading ? (
        <p style={styles.loading}>Loading sections...</p>
      ) : sections.length === 0 && !error ? (
        <p>No sections found.</p>
      ) : (
        <ul style={styles.list}>
          {sections.map(section => (
            <li key={section.id} style={styles.listItem}>
              {/* Display section name and full promo info */}
              <span>Section {section.name} ({section.promo?.name || 'N/A'} - {section.promo?.speciality?.name || 'N/A'})</span> 
              {/* Add Edit/Delete buttons later */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SectionListPage; 
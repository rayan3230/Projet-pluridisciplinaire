import React, { useState, useEffect } from 'react';
import { getPromos } from '../../services/academicService';
import PromoForm from '../../components/Admin/PromoForm';

// Basic styling
const styles = {
  container: { padding: '1rem', maxWidth: '800px', margin: 'auto' },
  list: { listStyle: 'none', padding: 0 },
  listItem: { borderBottom: '1px solid #eee', padding: '0.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  error: { color: 'red', marginBottom: '1rem' },
  loading: { fontStyle: 'italic' }
};

function PromoListPage() {
  const [promos, setPromos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Fetch promos - serializer includes speciality details
      const data = await getPromos(); 
      setPromos(data);
    } catch (err) {
      console.error("Failed to fetch promos:", err);
      setError('Could not load promos. Please try refreshing.');
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
      <h1>Manage Promos</h1>
      {error && <p style={styles.error}>{error}</p>}

      <button 
        onClick={() => setShowForm(!showForm)} 
        style={{ marginBottom: '1rem', padding: '8px 12px', cursor: 'pointer' }}
      >
        {showForm ? 'Cancel' : 'Add New Promo'}
      </button>

      {showForm && (
        <PromoForm onSubmitSuccess={handleFormSubmitSuccess} />
      )}

      {isLoading ? (
        <p style={styles.loading}>Loading promos...</p>
      ) : promos.length === 0 && !error ? (
        <p>No promos found.</p>
      ) : (
        <ul style={styles.list}>
          {promos.map(promo => (
            <li key={promo.id} style={styles.listItem}>
              <span>{promo.name} ({promo.speciality?.name || 'N/A'})</span> 
              {/* Add Edit/Delete buttons later */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PromoListPage; 
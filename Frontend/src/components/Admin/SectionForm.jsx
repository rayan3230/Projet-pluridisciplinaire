import React, { useState, useEffect } from 'react';
import { createSection, getPromos } from '../../services/academicService';

function SectionForm({ onSubmitSuccess }) {
  const [name, setName] = useState('');
  const [promoId, setPromoId] = useState('');
  const [promos, setPromos] = useState([]); // To populate dropdown
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state for fetch
  const [isSubmitting, setIsSubmitting] = useState(false); // Specific submitting state

  useEffect(() => {
    const fetchPromos = async () => {
      setIsLoading(true);
      setError(''); // Clear previous errors
      try {
        const data = await getPromos(); // Use real API call
        setPromos(data); 
        // setPromos([{ id: 1, name: '1st year Informatique (Mock)' }, { id: 2, name: '2nd year Informatique (Mock)' }]); // Remove Mock data
      } catch (err) {
        console.error('Failed to fetch promos:', err);
        setError('Could not load promos for selection. Please refresh or try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPromos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!promoId) {
      setError('Please select a promo.');
      return;
    }
    setIsSubmitting(true); // Start submission loading state
    try {
      const payload = { name, promo_id: promoId }; // Ensure key is promo_id
      await createSection(payload); // Use real API call
      // console.log(`Section '${name}' for promo ${promoId} created (mock)`); // Remove mock
      setName('');
      setPromoId('');
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      console.error('Section creation failed:', err);
      const errorMsg = err.response?.data?.name?.[0] || err.response?.data?.detail || 'Failed to create section.';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false); // End submission loading state
    }
  };

  // Basic styling similar to other forms
  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.2em' }}>Create New Section</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="sectionName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Section Name (e.g., A, B):</label>
        <input
          type="text"
          id="sectionName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isSubmitting}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="promoSelect" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Promo:</label>
        <select 
          id="promoSelect" 
          value={promoId} 
          onChange={(e) => setPromoId(e.target.value)} 
          required
          disabled={isLoading || isSubmitting}
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
        >
          <option value="">-- Select Promo --</option>
          {promos.map(promo => (
            // Display promo name and speciality for clarity
            <option key={promo.id} value={promo.id}>{promo.name} ({promo.speciality?.name || 'N/A'})</option> 
          ))}
        </select>
        {isLoading && <p>Loading promos...</p>} 
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
        {isSubmitting ? 'Creating...' : 'Create Section'}
      </button>
    </form>
  );
}

export default SectionForm; 
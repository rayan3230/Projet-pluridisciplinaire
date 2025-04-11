import React, { useState, useEffect } from 'react';
import { createPromo, getSpecialities } from '../../services/academicService';

function PromoForm({ onSubmitSuccess }) {
  const [name, setName] = useState('');
  const [specialityId, setSpecialityId] = useState('');
  const [specialities, setSpecialities] = useState([]); // To populate dropdown
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state for fetch and submit
  const [isSubmitting, setIsSubmitting] = useState(false); // Specific submitting state

  useEffect(() => {
    const fetchSpecialities = async () => {
      setIsLoading(true);
      setError(''); // Clear previous errors
      try {
        const data = await getSpecialities(); // Use real API call
        setSpecialities(data); 
        // setSpecialities([{ id: 1, name: 'Informatique (Mock)' }, { id: 2, name: 'Génie Civil (Mock)' }]); // Remove Mock data
      } catch (err) {
        console.error('Failed to fetch specialities:', err);
        setError('Could not load specialities for selection. Please refresh or try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSpecialities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!specialityId) {
      setError('Please select a speciality.');
      return;
    }
    setIsSubmitting(true); // Start submission loading state
    try {
      const payload = { name, speciality_id: specialityId }; // Ensure key is speciality_id
      await createPromo(payload); // Use real API call
      // console.log(`Promo '${name}' for speciality ${specialityId} created (mock)`); // Remove mock
      setName('');
      setSpecialityId('');
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      console.error('Promo creation failed:', err);
      const errorMsg = err.response?.data?.name?.[0] || err.response?.data?.detail || 'Failed to create promo.';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false); // End submission loading state
    }
  };

  // Basic styling similar to SpecialityForm
  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.2em' }}>Create New Promo</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="promoName" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Promo Name:</label>
        <input
          type="text"
          id="promoName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isSubmitting} // Disable during submission
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="specialitySelect" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Speciality:</label>
        <select 
          id="specialitySelect" 
          value={specialityId} 
          onChange={(e) => setSpecialityId(e.target.value)} 
          required
          disabled={isLoading || isSubmitting} // Disable while loading specialities or submitting
          style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '3px' }}
        >
          <option value="">-- Select Speciality --</option>
          {specialities.map(spec => (
            <option key={spec.id} value={spec.id}>{spec.name}</option>
          ))}
        </select>
        {isLoading && <p>Loading specialities...</p>} 
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
        {isSubmitting ? 'Creating...' : 'Create Promo'}
      </button>
    </form>
  );
}

export default PromoForm; 
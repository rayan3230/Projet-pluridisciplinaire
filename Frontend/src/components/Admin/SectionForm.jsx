import React, { useState, useEffect } from 'react';
// import { createSection, getPromos } from '../../services/academicService';

function SectionForm({ onSubmitSuccess }) {
  const [name, setName] = useState('');
  const [promoId, setPromoId] = useState('');
  const [promos, setPromos] = useState([]); // To populate dropdown
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch promos when component mounts
    const fetchPromos = async () => {
      try {
        // const data = await getPromos();
        // setPromos(data);
        setPromos([{ id: 1, name: '1st year Informatique (Mock)' }, { id: 2, name: '2nd year Informatique (Mock)' }]); // Mock data
      } catch (err) {
        console.error('Failed to fetch promos:', err);
        setError('Could not load promos for selection.');
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
    try {
      // await createSection({ name, promo: promoId });
      console.log(`Section '${name}' for promo ${promoId} created (mock)`);
      setName('');
      setPromoId('');
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      console.error('Section creation failed:', err);
      setError('Failed to create section.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
      <h2>Create New Section</h2>
      <div>
        <label htmlFor="sectionName">Name (e.g., A, B):</label>
        <input
          type="text"
          id="sectionName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="sectionPromo">Promo:</label>
        <select
          id="sectionPromo"
          value={promoId}
          onChange={(e) => setPromoId(e.target.value)}
          required
        >
          <option value="">-- Select Promo --</option>
          {promos.map(promo => (
            <option key={promo.id} value={promo.id}>{promo.name}</option>
          ))}
        </select>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={promos.length === 0}>Create Section</button>
    </form>
  );
}

export default SectionForm; 
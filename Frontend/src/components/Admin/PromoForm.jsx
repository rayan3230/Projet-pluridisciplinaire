import React, { useState, useEffect } from 'react';
// import { createPromo, getSpecialities } from '../../services/academicService';

function PromoForm({ onSubmitSuccess }) {
  const [name, setName] = useState('');
  const [specialityId, setSpecialityId] = useState('');
  const [specialities, setSpecialities] = useState([]); // To populate dropdown
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch specialities when component mounts
    const fetchSpecialities = async () => {
      try {
        // const data = await getSpecialities();
        // setSpecialities(data);
        setSpecialities([{ id: 1, name: 'Informatique (Mock)' }, { id: 2, name: 'Génie Civil (Mock)' }]); // Mock data
      } catch (err) {
        console.error('Failed to fetch specialities:', err);
        setError('Could not load specialities for selection.');
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
    try {
      // await createPromo({ name, speciality: specialityId });
      console.log(`Promo '${name}' for speciality ${specialityId} created (mock)`);
      setName('');
      setSpecialityId('');
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      console.error('Promo creation failed:', err);
      setError('Failed to create promo.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
      <h2>Create New Promo</h2>
      <div>
        <label htmlFor="promoName">Name (e.g., 1st Year):</label>
        <input
          type="text"
          id="promoName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="promoSpeciality">Speciality:</label>
        <select
          id="promoSpeciality"
          value={specialityId}
          onChange={(e) => setSpecialityId(e.target.value)}
          required
        >
          <option value="">-- Select Speciality --</option>
          {specialities.map(spec => (
            <option key={spec.id} value={spec.id}>{spec.name}</option>
          ))}
        </select>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={specialities.length === 0}>Create Promo</button>
    </form>
  );
}

export default PromoForm; 
import React, { useState, useEffect } from 'react';
import {
  createPromo,
  updatePromo,
  getSpecialities
} from '../../services/academicService';

function PromoForm({ onSubmitSuccess, initialData, onCancel }) {
  const [name, setName] = useState('');
  const [specialityId, setSpecialityId] = useState('');
  const [specialities, setSpecialities] = useState([]);
  const [error, setError] = useState('');
  const [isLoadingSpecialities, setIsLoadingSpecialities] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(initialData);

  // Fetch specialities for the dropdown
  useEffect(() => {
    const fetchSpecialitiesData = async () => {
      setIsLoadingSpecialities(true);
      setError('');
      try {
        const data = await getSpecialities();
        setSpecialities(data);
      } catch (err) {
        console.error('Failed to fetch specialities:', err);
        setError('Could not load specialities. Please refresh.');
      } finally {
        setIsLoadingSpecialities(false);
      }
    };
    fetchSpecialitiesData();
  }, []);

  // Populate form fields when editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      // Use optional chaining and correct field from serializer
      setSpecialityId(initialData.speciality?.id || ''); 
    } else {
      // Clear form for adding
      setName('');
      setSpecialityId('');
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!specialityId) {
      setError('Please select a speciality.');
      return;
    }
    setIsSubmitting(true);
    const promoData = { name, speciality_id: specialityId };

    try {
      if (isEditing) {
        await updatePromo(initialData.id, promoData);
      } else {
        await createPromo(promoData);
      }
      // Reset form is handled by useEffect
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      console.error(`Promo ${isEditing ? 'update' : 'creation'} failed:`, err);
      const errorMsg = err.response?.data?.name?.[0] || err.response?.data?.detail || `Failed to ${isEditing ? 'update' : 'create'} promo.`;
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <h2>{isEditing ? 'Edit Promo' : 'Create New Promo'}</h2>
      
      <div className="form-group">
        <label htmlFor="promoName">Promo Name:</label>
        <input
          type="text"
          id="promoName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="specialitySelect">Speciality:</label>
        <select 
          id="specialitySelect" 
          value={specialityId} 
          onChange={(e) => setSpecialityId(e.target.value)} 
          required
          disabled={isLoadingSpecialities || isSubmitting} 
        >
          <option value="">-- Select Speciality --</option>
          {specialities.map(spec => (
            <option key={spec.id} value={spec.id}>{spec.name}</option>
          ))}
        </select>
        {isLoadingSpecialities && <p className="admin-loading">Loading specialities...</p>} 
      </div>

      {error && <p className="admin-error">{error}</p>}
      
      <div className="form-actions">
        <button 
          type="submit" 
          disabled={isLoadingSpecialities || isSubmitting}
          className="admin-button"
        >
          {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Promo' : 'Create Promo')}
        </button>
        <button 
          type="button" 
          onClick={onCancel} 
          disabled={isSubmitting}
          className="admin-button cancel-button"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default PromoForm; 
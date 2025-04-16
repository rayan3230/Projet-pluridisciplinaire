import React, { useState, useEffect } from 'react';
import {
  createSection,
  updateSection,
  getPromos
} from '../../services/academicService';

function SectionForm({ onSubmit, onCancel, initialData, promos }) {
  const [name, setName] = useState('');
  const [promoId, setPromoId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(initialData);

  // Populate form fields when editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setPromoId(initialData.promo?.id || '');
    } else {
      setName('');
      setPromoId('');
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!promoId) {
      setError('Please select a promo.');
      return;
    }
    setIsSubmitting(true);
    const sectionData = { 
      name, 
      promo_id: promoId
    };

    try {
      await onSubmit(sectionData);
    } catch (err) {
      console.error(`Section ${isEditing ? 'update' : 'creation'} failed:`, err);
      const errorMsg = err.response?.data?.name?.[0] || err.response?.data?.detail || `Failed to ${isEditing ? 'update' : 'create'} section.`;
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <h2>{isEditing ? 'Edit Section' : 'Create New Section'}</h2>
      
      <div className="form-group">
        <label htmlFor="sectionName">Section Name (e.g., A, B):</label>
        <input
          type="text"
          id="sectionName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="promoSelect">Promo:</label>
        <select 
          id="promoSelect" 
          value={promoId} 
          onChange={(e) => setPromoId(e.target.value)} 
          required
          disabled={isSubmitting}
        >
          <option value="">-- Select Promo --</option>
          {promos.map(promo => (
            <option key={promo.id} value={promo.id}>
              {promo.name} ({promo.speciality?.name || 'No Speciality'})
            </option>
          ))}
        </select>
      </div>

      {error && <p className="admin-error">{error}</p>}
      
      <div className="form-actions">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="admin-button"
        >
          {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Section' : 'Create Section')}
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

export default SectionForm; 
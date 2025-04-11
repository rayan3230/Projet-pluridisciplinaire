import React, { useState, useEffect } from 'react';
import {
  createSection,
  updateSection,
  getPromos
} from '../../services/academicService';

function SectionForm({ onSubmitSuccess, initialData, onCancel }) {
  const [name, setName] = useState('');
  const [promoId, setPromoId] = useState('');
  const [promos, setPromos] = useState([]);
  const [error, setError] = useState('');
  const [isLoadingPromos, setIsLoadingPromos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(initialData);

  // Fetch promos for the dropdown
  useEffect(() => {
    const fetchPromosData = async () => {
      setIsLoadingPromos(true);
      setError('');
      try {
        const data = await getPromos();
        setPromos(data);
      } catch (err) {
        console.error('Failed to fetch promos:', err);
        setError('Could not load promos. Please refresh.');
      } finally {
        setIsLoadingPromos(false);
      }
    };
    fetchPromosData();
  }, []);

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
    const sectionData = { name, promo_id: promoId };

    try {
      if (isEditing) {
        await updateSection(initialData.id, sectionData);
      } else {
        await createSection(sectionData);
      }
      // Reset form is handled by useEffect
      if (onSubmitSuccess) onSubmitSuccess();
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
          disabled={isLoadingPromos || isSubmitting}
        >
          <option value="">-- Select Promo --</option>
          {promos.map(promo => (
            <option key={promo.id} value={promo.id}>{promo.name} ({promo.speciality?.name || 'N/A'})</option> 
          ))}
        </select>
        {isLoadingPromos && <p className="admin-loading">Loading promos...</p>} 
      </div>

      {error && <p className="admin-error">{error}</p>}
      
      <div className="form-actions">
        <button 
          type="submit" 
          disabled={isLoadingPromos || isSubmitting}
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
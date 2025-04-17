import React, { useState, useEffect } from 'react';
import { createSpeciality, updateSpeciality } from '../../services/academicService';

function SpecialityForm({ onSubmitSuccess, initialData, onCancel }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = Boolean(initialData);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
    } else {
      // Clear form if switching from edit to add
      setName('');
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const specialityData = { name };

    try {
      if (isEditing) {
        await updateSpeciality(initialData.id, specialityData);
      } else {
        await createSpeciality(specialityData);
      }
      setName(''); // Reset form on success
      if (onSubmitSuccess) onSubmitSuccess(); // Notify parent
    } catch (err) {
      console.error('Speciality submission failed:', err);
      const errorMsg = err.response?.data?.name?.[0] || err.response?.data?.detail || `Failed to ${isEditing ? 'update' : 'create'} speciality.`;
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <h2>{isEditing ? 'Edit Speciality' : 'Create New Speciality'}</h2>
      <div className="form-group">
        <label htmlFor="specialityName">Name:</label>
        <input
          type="text"
          id="specialityName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      {error && <p className="admin-error">{error}</p>}
      <div className="form-actions">
        <button 
          type="submit" 
          disabled={isLoading}
          className="admin-button"
        >
          {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Speciality' : 'Create Speciality')}
        </button>
        <button 
          type="button" 
          onClick={onCancel} 
          disabled={isLoading}
          className="admin-button cancel-button"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default SpecialityForm; 
import React, { useState, useEffect } from 'react';
import {
  createBaseModule,
  updateBaseModule
} from '../../services/moduleService';

function BaseModuleForm({ onSubmitSuccess, initialData, onCancel }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(initialData);

  // Populate form fields when editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
    } else {
      // Reset form for adding
      setName('');
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const payload = { name };

    try {
      if (isEditing) {
        await updateBaseModule(initialData.id, payload);
      } else {
        await createBaseModule(payload);
      }
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      console.error(`Base Module ${isEditing ? 'update' : 'creation'} failed:`, err);
      let errorMsg = `Failed to ${isEditing ? 'update' : 'create'} base module.`;
      if (err.response?.data) {
        const errors = err.response.data;
        const fieldErrors = Object.keys(errors)
          .map(key => `${key}: ${errors[key].join ? errors[key].join(', ') : errors[key]}`)
          .join('; ');
        if (fieldErrors) {
          errorMsg = fieldErrors;
        } else if (errors.detail) {
          errorMsg = errors.detail;
        }
      }
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <h2>{isEditing ? 'Edit Base Module' : 'Create New Base Module'}</h2>
      
      <div className="form-group">
        <label htmlFor="moduleName">Name:</label>
        <input
          type="text"
          id="moduleName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      {error && <p className="admin-error">{error}</p>}
      
      <div className="form-actions">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="admin-button"
        >
          {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Base Module' : 'Create Base Module')}
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

export default BaseModuleForm; 
import React, { useState, useEffect } from 'react';
import {
  createBaseModule,
  updateBaseModule
} from '../../services/moduleService';

function BaseModuleForm({ onSubmitSuccess, initialData, onCancel }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [coef, setCoef] = useState(1);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(initialData);

  // Populate form fields when editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setCode(initialData.code || '');
      setCoef(initialData.coef || 1);
    } else {
      // Reset form for adding
      setName('');
      setCode('');
      setCoef(1);
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const payload = { name, code, coef: parseFloat(coef) || 1.0 };

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

      <div className="form-group">
        <label htmlFor="moduleCode">Code (e.g., ANAL):</label>
        <input
          type="text"
          id="moduleCode"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="moduleCoef">Coefficient:</label>
        <input
          type="number"
          id="moduleCoef"
          value={coef}
          onChange={(e) => setCoef(e.target.value)}
          min="0" 
          step="0.5"
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
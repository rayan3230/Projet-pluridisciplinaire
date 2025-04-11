import React, { useState, useEffect } from 'react';
// Use createClassroom from the updated service
import {
  createClassroom,
  updateClassroom // Import updateClassroom
} from '../../services/academicService'; 

function ClassForm({ onSubmitSuccess, initialData, onCancel }) {
  const [name, setName] = useState(''); 
  const [classType, setClassType] = useState('Cours'); // Cours, TD, TP
  const [capacity, setCapacity] = useState(30); // Added capacity field
  const [hasProjector, setHasProjector] = useState(false);
  const [computersCount, setComputersCount] = useState(0); // Renamed from tpComputers
  
  // Removed hardcoded sectionId - this likely needs to be passed as a prop
  // or selected within a parent component.
  // const sectionId = 1; // Placeholder removed

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Renamed for clarity
  const isEditing = Boolean(initialData);

  // Pre-fill form for editing
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setClassType(initialData.type || 'Cours');
      setCapacity(initialData.capacity || 0);
      setHasProjector(initialData.has_projector || false);
      setComputersCount(initialData.computers_count || 0);
    } else {
      // Reset form for adding
      setName('');
      setClassType('Cours');
      setCapacity(30);
      setHasProjector(false);
      setComputersCount(0);
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const payload = {
      name,
      type: classType,
      capacity: parseInt(capacity, 10) || 0,
      has_projector: hasProjector,
      computers_count: parseInt(computersCount, 10) || 0
    };

    try {
      if (isEditing) {
        await updateClassroom(initialData.id, payload); // Use update API
      } else {
        await createClassroom(payload); // Use create API
      }
      // Reset form fields is handled by useEffect when initialData changes back to null
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      console.error(`Classroom ${isEditing ? 'update' : 'creation'} failed:`, err);
      // Attempt to get more specific error messages
      let errorMsg = `Failed to ${isEditing ? 'update' : 'create'} classroom.`;
      if (err.response?.data) {
        const errors = err.response.data;
        // Concatenate multiple errors if they exist
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

  // Basic styling similar to other forms
  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <h2>{isEditing ? 'Edit Classroom' : 'Create New Classroom'}</h2>
      
      <div className="form-group">
        <label htmlFor="className">Classroom Name/Number:</label>
        <input
          type="text"
          id="className"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="form-row">
        <div className="form-group form-group-half">
          <label htmlFor="classType">Type:</label>
          <select
            id="classType"
            value={classType}
            onChange={(e) => setClassType(e.target.value)}
            required
            disabled={isSubmitting}
          >
            <option value="Cours">Cours</option>
            <option value="TD">TD</option>
            <option value="TP">TP</option>
          </select>
        </div>
        <div className="form-group form-group-half">
           <label htmlFor="capacity">Capacity:</label>
            <input
              type="number"
              id="capacity"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              min="0"
              required
              disabled={isSubmitting}
            />
        </div>
      </div>

       <div className="form-row">
         <div className="form-group form-group-check">
            <input
              type="checkbox"
              id="hasProjector"
              checked={hasProjector}
              onChange={(e) => setHasProjector(e.target.checked)}
              disabled={isSubmitting}
            />
            <label htmlFor="hasProjector">Has Projector?</label>
        </div>
         <div className="form-group form-group-half">
           <label htmlFor="computersCount">Computers Count:</label>
            <input
              type="number"
              id="computersCount"
              value={computersCount}
              onChange={(e) => setComputersCount(e.target.value)}
              min="0"
              required
              disabled={isSubmitting}
            />
        </div>
      </div>

      {error && <p className="admin-error">{error}</p>}
      
      <div className="form-actions">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="admin-button"
        >
          {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Classroom' : 'Create Classroom')}
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

export default ClassForm; 
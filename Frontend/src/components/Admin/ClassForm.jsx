import React, { useState, useEffect } from 'react';
// Use createClassroom from the updated service
import {
  createClassroom,
  updateClassroom // Import updateClassroom
} from '../../services/academicService'; 

function ClassForm({ onSubmitSuccess, initialData, onCancel }) {
  const [name, setName] = useState(''); 
  // Use backend choices (COURS, TD, TP)
  const [classType, setClassType] = useState('COURS'); 
  // const [capacity, setCapacity] = useState(30); // Removed
  const [hasProjector, setHasProjector] = useState(false);
  const [computersCount, setComputersCount] = useState(0);
  
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
      // Use backend value for type
      setClassType(initialData.type || 'COURS'); 
      // setCapacity(initialData.capacity || 0); // Removed
      setHasProjector(initialData.has_projector || false);
      setComputersCount(initialData.computers_count || 0);
    } else {
      // Reset form for adding
      setName('');
      setClassType('COURS');
      // setCapacity(30); // Removed
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
      type: classType, // Sends COURS, TD, or TP
      // capacity: parseInt(capacity, 10) || 0, // Removed
      has_projector: hasProjector,
      // Conditionally send computers_count or let backend handle it
      computers_count: classType === 'TP' ? (parseInt(computersCount, 10) || 0) : 0 
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
            value={classType} // Value is now COURS, TD, TP
            onChange={(e) => setClassType(e.target.value)}
            required
            disabled={isSubmitting}
          >
            {/* Use backend choices as value */}
            <option value="COURS">Cours</option>
            <option value="TD">TD</option>
            <option value="TP">TP</option>
          </select>
        </div>
        {/* Remove Capacity Input */}
        {/* <div className="form-group form-group-half">
           <label htmlFor="capacity">Capacity:</label>
           <input ... />
        </div> */}
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
         {/* Conditionally show Computers Count */}
         {classType === 'TP' && (
         <div className="form-group form-group-half">
             <label htmlFor="computersCount">Computers Count (for TP):</label>
            <input
              type="number"
              id="computersCount"
              value={computersCount}
              onChange={(e) => setComputersCount(e.target.value)}
              min="0"
              disabled={isSubmitting}
            />
        </div>
         )}
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
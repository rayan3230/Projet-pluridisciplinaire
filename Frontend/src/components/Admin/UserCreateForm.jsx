import React, { useState, useEffect } from 'react';
import { createUser, updateUser } from '../../services/adminService'; 
import { useAuth } from '../../context/AuthContext';

// Note: Editing user passwords is not handled here. Usually requires a separate flow.
// Note: We assume backend handles `scope_email` generation/update appropriately.

function UserCreateForm({ onSubmitSuccess, initialData, onCancel }) {
  const { isAdmin } = useAuth(); 
  const [fullName, setFullName] = useState('');       
  const [personnelEmail, setPersonnelEmail] = useState('');
  const [isTeacher, setIsTeacher] = useState(false);
  const [isAdminRole, setIsAdminRole] = useState(false);
  // const [isSuperuser, setIsSuperuser] = useState(false); // Not managing superuser role via this form
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(initialData);

  // Populate form for editing
  useEffect(() => {
    if (initialData) {
      setFullName(initialData.full_name || '');     
      setPersonnelEmail(initialData.personnel_email || '');
      setIsTeacher(initialData.is_teacher || false);
      setIsAdminRole(initialData.is_staff || false);
      // setIsSuperuser(initialData.is_superuser || false);
      setSuccess(''); // Clear success message when editing
    } else {
      // Reset for add mode
      setFullName('');                              
      setPersonnelEmail('');
      setIsTeacher(false);
      setIsAdminRole(false);
      // setIsSuperuser(false);
      setSuccess('');
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      let response;
      if (isEditing) {
        const updatePayload = {
           full_name: fullName, 
           personnel_email: personnelEmail,
           is_teacher: isTeacher,
           is_staff: isAdminRole,
           // scope_email is read-only
        };
        response = await updateUser(initialData.id, updatePayload);
        setSuccess(`User ${response.scope_email} updated successfully!`);
      } else {
        const createPayload = {
            full_name: fullName, 
            personnel_email: personnelEmail,
            is_teacher: isTeacher,
            is_staff: isAdminRole,
        }; 
        response = await createUser(createPayload); 
        setSuccess(`User ${response.scope_email} created successfully! Check personnel email for credentials if applicable.`);
      }
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      console.error(`User ${isEditing ? 'update' : 'creation'} failed:`, err.response?.data || err.message);
      let errorMsg = `User ${isEditing ? 'update' : 'creation'} failed.`;
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

  if (!isAdmin) {
    // Silently fail or show minimal message if non-admin somehow reaches this form
    return null; 
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <h2>{isEditing ? 'Edit User' : 'Create New User'}</h2>
      
      {isEditing && (
        <div className="form-group">
            <label htmlFor="scopeEmail">Scope Email:</label>
            <input
              type="email"
              id="scopeEmail"
              value={initialData?.scope_email || ''} 
              readOnly
              disabled
            />
            <small>Scope Email cannot be changed.</small>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="fullName">Full Name:</label>
        <input
          type="text"
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required 
          disabled={isSubmitting}
        />
      </div>
      <div className="form-group">
        <label htmlFor="personnelEmail">Personnel Email (Optional):</label>
        <input
          type="email"
          id="personnelEmail"
          value={personnelEmail}
          onChange={(e) => setPersonnelEmail(e.target.value)}
          disabled={isSubmitting}
        />
      </div>
     
      {/* Role Checkboxes - using form-row structure */}
      <div className="form-row" style={{ marginBottom: '1.5rem' }}>
          <div className="form-group form-group-check">
              <input 
                type="checkbox" 
                id="isTeacherCheck"
                checked={isTeacher} 
                onChange={(e) => setIsTeacher(e.target.checked)}
                disabled={isSubmitting}
              />
              <label htmlFor="isTeacherCheck">Teacher Role?</label>
          </div>
          <div className="form-group form-group-check">
              <input 
                type="checkbox" 
                id="isAdminCheck"
                checked={isAdminRole} 
                onChange={(e) => setIsAdminRole(e.target.checked)}
                disabled={isSubmitting}
              />
              <label htmlFor="isAdminCheck">Admin Role? (Staff Access)</label>
          </div>
      </div>

      {!isEditing && 
        <p className="form-note">
          Password will be auto-generated and details sent if email configuration is set up.
        </p>
      }

      {error && <p className="admin-error">{error}</p>}
      {/* Only show success message briefly on creation? Or let parent handle it. */}
      {/* {success && !isEditing && <p style={{ color: 'lime', marginTop: '1rem' }}>{success}</p>} */}
      
      <div className="form-actions">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="admin-button"
        >
          {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update User' : 'Create User')}
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

export default UserCreateForm; 
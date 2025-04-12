import React, { useState, useEffect } from 'react';
import {
  createVersionModule,
  updateVersionModule,
  getBaseModules
} from '../../services/moduleService';

function VersionModuleForm({ onSubmitSuccess, initialData, onCancel }) {
  const [versionName, setVersionName] = useState('');
  const [baseModuleId, setBaseModuleId] = useState('');
  const [coursHours, setCoursHours] = useState(0);
  const [tdHours, setTdHours] = useState(0);
  const [tpHours, setTpHours] = useState(0);
  const [baseModules, setBaseModules] = useState([]);
  const [error, setError] = useState('');
  const [isLoadingBaseModules, setIsLoadingBaseModules] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coefficient, setCoefficient] = useState(1.0);
  const isEditing = Boolean(initialData);

  // Fetch base modules for dropdown
  useEffect(() => {
    const fetchBaseModulesData = async () => {
      setIsLoadingBaseModules(true);
      setError('');
      try {
        const baseModuleData = await getBaseModules();
        setBaseModules(baseModuleData);
      } catch (err) {
        console.error('Failed to fetch base modules:', err);
        setError('Could not load base modules. Please refresh.');
      } finally {
        setIsLoadingBaseModules(false);
      }
    };
    fetchBaseModulesData();
  }, []);

  // Populate form for editing
  useEffect(() => {
    if (initialData) {
      setVersionName(initialData.version_name || '');
      setBaseModuleId(initialData.base_module?.id || '');
      setCoursHours(initialData.cours_hours || 0);
      setTdHours(initialData.td_hours || 0);
      setTpHours(initialData.tp_hours || 0);
      setCoefficient(initialData.coefficient || 1.0);
    } else {
      // Reset form for adding
      setVersionName('');
      setBaseModuleId('');
      setCoursHours(0);
      setTdHours(0);
      setTpHours(0);
      setCoefficient(1.0);
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!baseModuleId) {
      setError('Please select a base module.');
      return;
    }
    setIsSubmitting(true);
    const payload = {
      version_name: versionName,
      base_module_id: baseModuleId,
      cours_hours: parseInt(coursHours, 10) || 0,
      td_hours: parseInt(tdHours, 10) || 0,
      tp_hours: parseInt(tpHours, 10) || 0,
      coefficient: parseFloat(coefficient) || 1.0,
    };

    try {
      if (isEditing) {
        await updateVersionModule(initialData.id, payload);
      } else {
        await createVersionModule(payload);
      }
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      console.error(`Version Module ${isEditing ? 'update' : 'creation'} failed:`, err);
      let errorMsg = `Failed to ${isEditing ? 'update' : 'create'} version module.`;
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
      <h2>{isEditing ? 'Edit Version Module' : 'Create New Version Module'}</h2>

      <div className="form-group">
        <label htmlFor="baseModuleSelect">Base Module:</label>
        <select 
          id="baseModuleSelect" 
          value={baseModuleId} 
          onChange={(e) => setBaseModuleId(e.target.value)} 
          required
          // Disable changing base module when editing
          disabled={isLoadingBaseModules || isSubmitting || isEditing} 
        >
          <option value="">-- Select Base Module --</option>
          {baseModules.map(bm => (
            <option key={bm.id} value={bm.id}>{bm.name} ({bm.code})</option>
          ))}
        </select>
        {isLoadingBaseModules && <p className="admin-loading">Loading base modules...</p>}
      </div>
      
      <div className="form-group">
        <label htmlFor="versionName">Version Name (optional):</label>
        <input
          type="text"
          id="versionName"
          value={versionName}
          onChange={(e) => setVersionName(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      {/* Use form-row for horizontal layout */}
      <div className="form-row">
        <div className="form-group form-group-third">
          <label htmlFor="coursHours">Cours Hours:</label>
          <input
            type="number"
            id="coursHours"
            value={coursHours}
            onChange={(e) => setCoursHours(e.target.value)}
            min="0"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group form-group-third">
          <label htmlFor="tdHours">TD Hours:</label>
          <input
            type="number"
            id="tdHours"
            value={tdHours}
            onChange={(e) => setTdHours(e.target.value)}
            min="0"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group form-group-third">
          <label htmlFor="tpHours">TP Hours:</label>
          <input
            type="number"
            id="tpHours"
            value={tpHours}
            onChange={(e) => setTpHours(e.target.value)}
            min="0"
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="coefficient">Coefficient:</label>
        <input
          type="number"
          id="coefficient"
          value={coefficient}
          onChange={(e) => setCoefficient(e.target.value)}
          min="0"
          step="0.1"
          required
          disabled={isSubmitting}
        />
      </div>

      {error && <p className="admin-error">{error}</p>}
      
      <div className="form-actions">
        <button 
          type="submit" 
          disabled={isLoadingBaseModules || isSubmitting}
          className="admin-button"
        >
          {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Version' : 'Create Version')}
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

export default VersionModuleForm;
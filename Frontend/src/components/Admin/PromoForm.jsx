import React, { useState, useEffect } from 'react';
import {
  createPromo,
  updatePromo,
  getSpecialities
} from '../../services/academicService';
import { getVersionModules } from '../../services/moduleService';
import { getSemesters } from '../../services/semesterService';

function PromoForm({ onSubmitSuccess, initialData, onCancel }) {
  const [name, setName] = useState('');
  const [specialityId, setSpecialityId] = useState('');
  const [selectedModules, setSelectedModules] = useState([]);
  const [semesterId, setSemesterId] = useState('');
  const [yearStart, setYearStart] = useState(new Date().getFullYear());
  const [yearEnd, setYearEnd] = useState(new Date().getFullYear() + 1);
  const [specialities, setSpecialities] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [error, setError] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(initialData);

  useEffect(() => {
    const fetchDropdownData = async () => {
      setIsLoadingData(true);
      setError('');
      try {
        const [specialityData, moduleData, semesterData] = await Promise.all([
          getSpecialities(),
          getVersionModules(),
          getSemesters()
        ]);
        setSpecialities(specialityData);
        setAvailableModules(moduleData);
        setSemesters(semesterData);
      } catch (err) {
        console.error('Failed to fetch dropdown data:', err);
        setError('Could not load dropdown data. Please refresh.');
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSpecialityId(initialData.speciality?.id || '');
      setSelectedModules(initialData.modules?.map(m => m.id.toString()) || []);
      setSemesterId(initialData.semester?.id || '');
      setYearStart(initialData.year_start || new Date().getFullYear());
      setYearEnd(initialData.year_end || new Date().getFullYear() + 1);
    } else {
      setName('');
      setSpecialityId('');
      setSelectedModules([]);
      setSemesterId('');
      setYearStart(new Date().getFullYear());
      setYearEnd(new Date().getFullYear() + 1);
    }
  }, [initialData]);

  const handleModuleCheckboxChange = (e) => {
    const moduleId = e.target.value;
    const isChecked = e.target.checked;

    setSelectedModules(prevSelected => {
      if (isChecked) {
        return [...prevSelected, moduleId];
      } else {
        return prevSelected.filter(id => id !== moduleId);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!specialityId) {
      setError('Please select a speciality.');
      return;
    }
    if (parseInt(yearEnd) <= parseInt(yearStart)) {
      setError('End year must be after start year.');
      return;
    }
    setIsSubmitting(true);
    const promoData = {
      name,
      speciality_id: specialityId,
      module_ids: selectedModules.map(id => parseInt(id, 10)),
      semester_id: semesterId || null,
      year_start: parseInt(yearStart, 10),
      year_end: parseInt(yearEnd, 10)
    };

    try {
      if (isEditing) {
        await updatePromo(initialData.id, promoData);
      } else {
        await createPromo(promoData);
      }
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
          disabled={isLoadingData || isSubmitting} 
        >
          <option value="">-- Select Speciality --</option>
          {specialities.map(spec => (
            <option key={spec.id} value={spec.id}>{spec.name}</option>
          ))}
        </select>
        {isLoadingData && <p className="admin-loading">Loading specialities...</p>} 
      </div>

      <div className="form-row">
        <div className="form-group form-group-half">
          <label htmlFor="yearStart">Start Year:</label>
          <input 
            type="number" 
            id="yearStart" 
            value={yearStart}
            onChange={(e) => setYearStart(e.target.value)}
            min={new Date().getFullYear() - 5} 
            max={new Date().getFullYear() + 5}
            step="1"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group form-group-half">
          <label htmlFor="yearEnd">End Year:</label>
          <input 
            type="number" 
            id="yearEnd" 
            value={yearEnd}
            onChange={(e) => setYearEnd(e.target.value)}
            min={yearStart ? parseInt(yearStart, 10) + 1 : new Date().getFullYear() - 4} 
            max={new Date().getFullYear() + 6}
            step="1"
            required
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="semesterSelect">Semester:</label>
        <select 
          id="semesterSelect" 
          value={semesterId} 
          onChange={(e) => setSemesterId(e.target.value)} 
          disabled={isLoadingData || isSubmitting} 
        >
          <option value="">-- Select Semester --</option>
          {semesters.map(sem => (
            <option key={sem.id} value={sem.id}>{sem.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Assign Modules:</label>
        <div className="checkbox-list-container" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
          {isLoadingData ? (
            <p className="admin-loading">Loading modules...</p>
          ) : availableModules.length > 0 ? (
            availableModules.map(mod => (
              <div key={mod.id} className="checkbox-item">
                <input 
                  type="checkbox"
                  id={`module-${mod.id}`}
                  value={mod.id.toString()}
                  checked={selectedModules.includes(mod.id.toString())}
                  onChange={handleModuleCheckboxChange}
                  disabled={isSubmitting}
                />
                <label htmlFor={`module-${mod.id}`}> 
                  {mod.base_module.name} ({mod.version_name})
                </label>
              </div>
            ))
          ) : (
            <p>No modules available.</p>
          )}
        </div>
      </div>

      {error && <p className="admin-error">{error}</p>}
      
      <div className="form-actions">
        <button 
          type="submit" 
          disabled={isLoadingData || isSubmitting}
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
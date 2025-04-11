import React, { useState, useEffect } from 'react';
import { getBaseModules } from '../../services/moduleService';
import { getTeacherPreferences, updateTeacherPreferences } from '../../services/teacherService';
import { useAuth } from '../../context/AuthContext';

function ModuleSelector() {
  const [availableModules, setAvailableModules] = useState([]);
  const [selectedModules, setSelectedModules] = useState(new Set());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();
  const teacherId = user?.id;

  useEffect(() => {
    const fetchData = async () => {
      if (!teacherId) return;

      setIsLoading(true);
      setError('');
      setSuccess('');
      try {
        const [modulesData, preferencesData] = await Promise.all([
            getBaseModules(), 
            getTeacherPreferences(teacherId)
        ]);
        
        setAvailableModules(modulesData);
        const preferenceIds = Array.isArray(preferencesData) 
            ? preferencesData.map(pref => typeof pref === 'object' ? pref.id : pref) 
            : [];
        setSelectedModules(new Set(preferenceIds));

      } catch (err) {
        console.error('Failed to load module data:', err);
        setError('Could not load modules or preferences. Please try refreshing.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [teacherId]);

  const handleCheckboxChange = (moduleId) => {
    setSelectedModules(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(moduleId)) {
        newSelected.delete(moduleId);
      } else {
        newSelected.add(moduleId);
      }
      return newSelected;
    });
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!teacherId) {
        setError('User ID not found. Cannot save preferences.');
        return;
    }

    setIsSaving(true);
    try {
      const preferenceIds = Array.from(selectedModules);
      await updateTeacherPreferences(teacherId, preferenceIds);
      setSuccess('Preferences updated successfully!');
    } catch (err) {
      console.error('Failed to update preferences:', err);
      setError('Could not save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!teacherId) {
    return <p>Error: Could not identify teacher. Please log in again.</p>;
  }

  if (isLoading) {
    return <p>Loading module preferences...</p>;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Select Your Preferred Modules</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      
      {availableModules.length === 0 && !isLoading ? (
        <p>No base modules available to select.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #eee', marginBottom: '1rem', padding: '0.5rem' }}>
            {availableModules.map(module => (
              <div key={module.id} style={{ marginBottom: '0.5rem' }}>
                <label>
                  <input 
                    type="checkbox"
                    checked={selectedModules.has(module.id)}
                    onChange={() => handleCheckboxChange(module.id)}
                    disabled={isSaving}
                    style={{ marginRight: '0.5rem' }}
                  />
                  {module.name} ({module.code})
                </label>
              </div>
            ))}
          </div>
          <button 
            type="submit" 
            disabled={isSaving}
            style={{
              padding: '10px 15px', 
              backgroundColor: isSaving ? '#ccc' : '#007bff',
              color: 'white', 
              border: 'none', 
              borderRadius: '3px', 
              cursor: isSaving ? 'not-allowed' : 'pointer'
            }}
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </form>
      )}
    </div>
  );
}

export default ModuleSelector; 
import React, { useState, useEffect } from 'react';
// import { getBaseModules } from '../../services/moduleService';
// import { getTeacherPreferences, updateTeacherPreferences } from '../../services/teacherService'; // Assuming teacherId is available

function ModuleSelector() {
  const [availableModules, setAvailableModules] = useState([]);
  const [selectedModules, setSelectedModules] = useState(new Set()); // Using a Set for efficient add/remove
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const { user } = useAuth(); // Assuming useAuth provides logged-in user info including ID
  const teacherId = 1; // Placeholder: Get actual teacher ID from context

  useEffect(() => {
    // Fetch available base modules and teacher's current preferences
    const fetchData = async () => {
      if (!teacherId) return; // Don't fetch if teacher ID isn't available

      setIsLoading(true);
      setError('');
      try {
        // const modulesData = await getBaseModules();
        // const preferencesData = await getTeacherPreferences(teacherId); // API needed
        // setAvailableModules(modulesData);
        // setSelectedModules(new Set(preferencesData?.map(pref => pref.id) || [])); // Handle potential null/undefined preferences

        // Mock Data
        setAvailableModules([
          { id: 1, name: 'Analyse', code: 'ANAL' },
          { id: 2, name: 'Programmation', code: 'PROG' },
          { id: 3, name: 'Algèbre', code: 'ALG' },
          { id: 4, name: 'Physique 1', code: 'PHY1' },
        ]);
        // Simulate fetching preferences for teacherId 1
        const mockPreferences = await Promise.resolve([1, 3]); // Mock API call
        setSelectedModules(new Set(mockPreferences));

      } catch (err) {
        console.error('Failed to load module data:', err);
        setError('Could not load modules or preferences.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [teacherId]); // Re-fetch if teacherId changes (though unlikely in this context)

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!teacherId) {
        setError('User ID not found. Cannot save preferences.');
        return;
    }

    setIsLoading(true);
    try {
      const preferenceIds = Array.from(selectedModules);
      // await updateTeacherPreferences(teacherId, preferenceIds); // API needed
      console.log(`Updated preferences for teacher ${teacherId} (mock): `, preferenceIds);
      setSuccess('Preferences updated successfully!');
      // Optionally re-fetch preferences to confirm, though API should be source of truth
    } catch (err) {
      console.error('Failed to update preferences:', err);
      setError('Could not save preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && availableModules.length === 0) {
    return <p>Loading modules...</p>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
      <h2>Select Your Preferred Base Modules</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {availableModules.length > 0 ? (
        availableModules.map(module => (
          <div key={module.id}>
            <label>
              <input
                type="checkbox"
                checked={selectedModules.has(module.id)}
                onChange={() => handleCheckboxChange(module.id)}
                disabled={isLoading}
              />
              {module.name} ({module.code})
            </label>
          </div>
        ))
      ) : (
        !isLoading && <p>No modules available to select.</p>
      )}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <button type="submit" disabled={isLoading} style={{ marginTop: '1rem' }}>
        {isLoading ? 'Saving...' : 'Save Preferences'}
      </button>
    </form>
  );
}

export default ModuleSelector; 
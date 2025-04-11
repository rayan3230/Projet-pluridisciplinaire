import React, { useState, useEffect } from 'react';
import { getTeachers, getAssignments, createAssignment } from '../../services/adminService';
import { getPromos } from '../../services/academicService';
import { getVersionModules } from '../../services/moduleService';

// Basic styling (replace with CSS classes or UI library)
const styles = {
  container: { padding: '1rem', maxWidth: '800px', margin: 'auto' },
  form: { border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem', borderRadius: '5px', backgroundColor: '#f9f9f9' },
  label: { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' },
  select: { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '3px', marginBottom: '1rem' },
  button: { padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' },
  disabledButton: { backgroundColor: '#ccc', cursor: 'not-allowed' },
  list: { listStyle: 'none', padding: 0 },
  listItem: { borderBottom: '1px solid #eee', padding: '0.5rem 0', display: 'flex', justifyContent: 'space-between' },
  error: { color: 'red', marginBottom: '1rem' },
  loading: { fontStyle: 'italic' }
};

function TeacherAssignmentPage() {
  // Form state
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedPromo, setSelectedPromo] = useState('');
  
  // Data state
  const [teachers, setTeachers] = useState([]);
  const [modules, setModules] = useState([]);
  const [promos, setPromos] = useState([]);
  const [assignments, setAssignments] = useState([]);

  // UI state
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch initial data for dropdowns and existing assignments
  const fetchData = async () => {
    setIsLoadingData(true);
    setError('');
    try {
      const [teachersData, modulesData, promosData, assignmentsData] = await Promise.all([
        getTeachers(),
        getVersionModules(), // Fetch all version modules
        getPromos(),
        getAssignments() // Fetch existing assignments
      ]);
      setTeachers(teachersData);
      setModules(modulesData);
      setPromos(promosData);
      setAssignments(assignmentsData);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Could not load data needed for assignments. Please refresh.');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedTeacher || !selectedModule || !selectedPromo) {
      setError('Please select a teacher, module, and promo.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        teacher_id: selectedTeacher,
        module_id: selectedModule,
        promo_id: selectedPromo,
      };
      const newAssignment = await createAssignment(payload);
      
      // Add the new assignment to the list optimistcally or re-fetch
      // setAssignments(prev => [...prev, newAssignment]); // Optimistic
      await fetchData(); // Re-fetch to ensure consistency

      // Reset form
      setSelectedTeacher('');
      setSelectedModule('');
      setSelectedPromo('');

    } catch (err) {
      console.error('Failed to create assignment:', err);
      const errorMsg = err.response?.data?.detail || 'Failed to create assignment. Check if this combination already exists.';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Assign Teachers to Modules for Promos</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>Create New Assignment</h2>
        {error && <p style={styles.error}>{error}</p>}

        <div>
          <label htmlFor="teacherSelect" style={styles.label}>Teacher:</label>
          <select 
            id="teacherSelect"
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
            required
            disabled={isLoadingData || isSubmitting}
            style={styles.select}
          >
            <option value="">-- Select Teacher --</option>
            {teachers.map(t => (
              <option key={t.id} value={t.id}>{t.full_name} ({t.scope_email})</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="moduleSelect" style={styles.label}>Version Module:</label>
          <select 
            id="moduleSelect"
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            required
            disabled={isLoadingData || isSubmitting}
            style={styles.select}
          >
            <option value="">-- Select Module --</option>
            {modules.map(m => (
              // Display base module info for clarity
              <option key={m.id} value={m.id}>{m.base_module?.name || 'Unknown Base'}{m.version_name ? ` - ${m.version_name}` : ''}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="promoSelect" style={styles.label}>Promo:</label>
          <select 
            id="promoSelect"
            value={selectedPromo}
            onChange={(e) => setSelectedPromo(e.target.value)}
            required
            disabled={isLoadingData || isSubmitting}
            style={styles.select}
          >
            <option value="">-- Select Promo --</option>
            {promos.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.speciality?.name || 'N/A'})</option>
            ))}
          </select>
        </div>

        {isLoadingData && <p style={styles.loading}>Loading data...</p>}

        <button 
          type="submit" 
          disabled={isLoadingData || isSubmitting}
          style={{...styles.button, ...( (isLoadingData || isSubmitting) ? styles.disabledButton : {})}}
        >
          {isSubmitting ? 'Assigning...' : 'Create Assignment'}
        </button>
      </form>

      <h2>Existing Assignments</h2>
      {isLoadingData ? (
        <p style={styles.loading}>Loading assignments...</p>
      ) : assignments.length === 0 ? (
        <p>No assignments found.</p>
      ) : (
        <ul style={styles.list}>
          {assignments.map(a => (
            <li key={a.id} style={styles.listItem}>
              <span>
                <strong>{a.teacher?.full_name || 'N/A'}</strong> assigned to 
                <strong>{a.module?.base_module?.name || 'N/A'}{a.module?.version_name ? ` - ${a.module.version_name}` : ''}</strong> for promo 
                <strong>{a.promo?.name || 'N/A'} ({a.promo?.speciality?.name || 'N/A'})</strong>
              </span>
              {/* TODO: Add Delete button here */}
              {/* <button onClick={() => handleDelete(a.id)} style={{...styles.button, backgroundColor: '#dc3545'}}>Delete</button> */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TeacherAssignmentPage; 
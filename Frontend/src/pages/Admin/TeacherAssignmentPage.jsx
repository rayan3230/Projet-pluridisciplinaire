import React, { useState, useEffect } from 'react';
import { getTeachers, getAssignments, createAssignment } from '../../services/adminService';
import { getPromos } from '../../services/academicService';
import { getVersionModules } from '../../services/moduleService';
import { getUsers } from '../../services/adminService';

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

  // Fetch initial data
  useEffect(() => {
    // Fetch data, but filter teachers after getting them
    const fetchData = async () => {
      setIsLoadingData(true);
      setError('');
      try {
        const [allUsersData, modulesData, promosData, assignmentsData] = await Promise.all([
          getUsers(), // Fetch all users initially
          getVersionModules(), 
          getPromos(),
          getAssignments() 
        ]);
        // Filter users to get only teachers
        const teacherUsers = allUsersData.filter(user => user.is_teacher);
        setTeachers(teacherUsers); 
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
      await createAssignment(payload);
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
    <div className="admin-page-container teacher-assignment-page">
      <h1>Assign Teachers to Modules for Promos</h1>

      <div className="assignment-form-container">
        <form onSubmit={handleSubmit} className="admin-form">
          <h2>Create New Assignment</h2>
          {error && <p className="admin-error">{error}</p>}

          <div className="form-group">
            <label htmlFor="teacherSelect">Teacher:</label>
            <select 
              id="teacherSelect"
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              required
              disabled={isLoadingData || isSubmitting}
            >
              <option value="">-- Select Teacher --</option>
              {/* The `teachers` state now only contains actual teachers */}
              {teachers.map(t => (
                // Display name and email (or just name)
                <option key={t.id} value={t.id}>{t.first_name && t.last_name ? `${t.first_name} ${t.last_name}` : t.email}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="moduleSelect">Version Module:</label>
            <select 
              id="moduleSelect"
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              required
              disabled={isLoadingData || isSubmitting}
            >
              <option value="">-- Select Module --</option>
              {modules.map(m => (
                <option key={m.id} value={m.id}>{m.base_module?.name || 'Unknown Base'}{m.version_name ? ` - ${m.version_name}` : ''}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="promoSelect">Promo:</label>
            <select 
              id="promoSelect"
              value={selectedPromo}
              onChange={(e) => setSelectedPromo(e.target.value)}
              required
              disabled={isLoadingData || isSubmitting}
            >
              <option value="">-- Select Promo --</option>
              {promos.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.speciality?.name || 'N/A'})</option>
              ))}
            </select>
          </div>

          {isLoadingData && <p className="admin-loading">Loading data...</p>}

          <button 
            type="submit" 
            disabled={isLoadingData || isSubmitting}
            className="admin-button"
          >
            {isSubmitting ? 'Assigning...' : 'Create Assignment'}
          </button>
        </form>
      </div>

      <div className="assignment-list-container">
        <h2>Existing Assignments</h2>
        {isLoadingData ? (
          <p className="admin-loading">Loading assignments...</p>
        ) : assignments.length === 0 ? (
          <p>No assignments found.</p>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Module</th>
                  <th>Promo</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map(a => (
                  <tr key={a.id}>
                    <td>{a.teacher?.first_name && a.teacher?.last_name ? `${a.teacher.first_name} ${a.teacher.last_name}` : a.teacher?.email || 'N/A'}</td>
                    <td>{a.module?.base_module?.name || 'N/A'}{a.module?.version_name ? ` - ${a.module.version_name}` : ''}</td>
                    <td>{a.promo?.name || 'N/A'} ({a.promo?.speciality?.name || 'N/A'})</td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button className="admin-button delete-button" disabled>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherAssignmentPage; 
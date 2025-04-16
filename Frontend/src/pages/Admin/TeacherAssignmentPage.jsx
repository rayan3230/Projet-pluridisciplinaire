import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getTeachers, getBaseModules, getAssignments, createAssignment, deleteAssignment, getVersionModules } from '../../services/adminService';
import './TeacherAssignmentPage.css';

const TeacherAssignmentPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [modules, setModules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedModules, setSelectedModules] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedTeachers, setExpandedTeachers] = useState(new Set());
  const [isEditing, setIsEditing] = useState(false);

  const formContainerRef = useRef(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [teachersData, modulesData, assignmentsData] = await Promise.all([
        getTeachers(),
        getBaseModules(),
        getAssignments()
      ]);
      setTeachers(teachersData);
      setModules(modulesData);
      setAssignments(assignmentsData);
      // console.log('Data Fetched - Assignments:', assignmentsData); // Keep commented out unless debugging
      // console.log('Data Fetched - Teachers:', teachersData);
      setError('');
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleModuleToggle = (moduleId) => {
    setSelectedModules(prev => {
      const newSelected = new Set(prev);
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
    if (!selectedTeacher || selectedModules.size === 0) {
      setError('Please select a teacher and at least one base module.');
      return;
    }

    setLoading(true);
    try {
      const assignmentData = {
        teacher_id: selectedTeacher,
        base_module_ids: Array.from(selectedModules)
      };
      console.log('Submitting assignment data:', assignmentData, 'Is Editing:', isEditing);
      await createAssignment(assignmentData);

      await fetchData();
      setSelectedTeacher('');
      setSelectedModules(new Set());
      setError('');
      setIsEditing(false);
    } catch (err) {
      console.error('Assignment creation error:', err);
      if (typeof err === 'object' && err.module_id) {
        setError(`Module error: ${err.module_id.join(', ')}`);
      } else if (err.message) {
        setError(`Error: ${err.message}`);
      } else {
        setError('Failed to create assignments. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assignmentId) => {
    setLoading(true);
    try {
      await deleteAssignment(assignmentId);
      await fetchData();
      setError('');
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete assignment. Please try again.');
    }
    setLoading(false);
  };

  const handleDeleteAll = async (teacherId) => {
    setLoading(true);
    try {
      const teacherAssignments = getTeacherModules(teacherId);
      await Promise.all(teacherAssignments.map(assignment => deleteAssignment(assignment.id)));
      await fetchData();
      setError('');
    } catch (err) {
      console.error('Delete all error:', err);
      setError('Failed to delete assignments. Please try again.');
    }
    setLoading(false);
  };

  const filteredModules = modules.filter(module => 
    module.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleTeacherModules = (teacherId) => {
    setExpandedTeachers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(teacherId)) {
        newSet.delete(teacherId);
      } else {
        newSet.add(teacherId);
      }
      return newSet;
    });
  };

  const getTeacherModules = (teacherId) => {
    return assignments.filter(assignment => 
        assignment && 
        assignment.teacher_details && 
        assignment.teacher_details.id === teacherId
    );
  };

  const handleEdit = (teacherId) => {
    const teacherAssignments = getTeacherModules(teacherId);
    const currentModuleIds = new Set(teacherAssignments.map(a => a.base_module.id));
    
    setSelectedTeacher(teacherId);
    setSelectedModules(currentModuleIds);
    setIsEditing(true);
    setError('');

    if (formContainerRef.current) {
        formContainerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const clearForm = () => {
      setSelectedTeacher('');
      setSelectedModules(new Set());
      setIsEditing(false);
      setError('');
      setSearchQuery('');
  };

  return (
    <div className="teacher-assignment-page">
      <h1>Assign Teachers to Base Modules</h1>

      <div className="assignment-form-container" ref={formContainerRef}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="teacher-select">Select Teacher:</label>
            <select
              id="teacher-select"
              value={selectedTeacher}
              onChange={(e) => { 
                  setSelectedTeacher(e.target.value);
                  setIsEditing(false);
                  setSelectedModules(new Set());
              }}
              className="admin-select"
            >
              <option value="">-- Select Teacher --</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.full_name || `${teacher.first_name} ${teacher.last_name}` || teacher.scope_email}
                </option>
              ))}
            </select>
          </div>

          <div className="module-selection-container">
            <div className="module-selection-header">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search base modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="module-search-input"
                />
              </div>
              <div className="selection-info">
                {selectedModules.size} module{selectedModules.size !== 1 ? 's' : ''} selected
              </div>
            </div>

            <div className="module-grid">
              {filteredModules.length > 0 ? (
                filteredModules.map(module => (
                  <div
                    key={module.id}
                    className={`module-card ${selectedModules.has(module.id) ? 'selected' : ''}`}
                    onClick={() => handleModuleToggle(module.id)}
                  >
                    <div className="module-card-content">
                      <div className="module-name">{module.name}</div>
                    </div>
                    <div className="module-select-indicator" />
                  </div>
                ))
              ) : (
                <div className="no-results">
                  No base modules found matching your search.
                </div>
              )}
            </div>
          </div>

          {error && <div className="admin-error">{error}</div>}
          
          <div className="form-actions">
            <button
              type="submit"
              className="admin-button create-button"
              disabled={loading || !selectedTeacher || selectedModules.size === 0}
            >
              {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Assignment' : 'Create Assignment')}
            </button>
            {isEditing && (
                <button
                    type="button"
                    className="admin-button cancel-button"
                    onClick={clearForm}
                    disabled={loading}
                >
                    Cancel Edit
                </button>
            )}
          </div>
        </form>
      </div>

      <div className="assignment-list-container">
        <h2>Current Assignments</h2>
        {assignments.length > 0 ? (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Teacher</th>
                  <th>Base Module</th>
                  <th className="actions-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(teacher => {
                  const teacherAssignments = getTeacherModules(teacher.id);
                  if (teacherAssignments.length === 0) return null;
                  
                  return (
                    <React.Fragment key={teacher.id}>
                      <tr>
                        <td>{teacher.full_name}</td>
                        <td>
                          <button
                            className="show-modules-button"
                            onClick={() => toggleTeacherModules(teacher.id)}
                          >
                            {expandedTeachers.has(teacher.id) ? 'Hide Modules' : 'Show Modules'}
                          </button>
                        </td>
                        <td className="actions-cell">
                          <div className="action-buttons">
                            <button
                              className="admin-button edit-button"
                              onClick={() => handleEdit(teacher.id)}
                              disabled={loading}
                            >
                              Edit
                            </button>
                            <button
                              className="admin-button delete-button"
                              onClick={() => handleDeleteAll(teacher.id)}
                              disabled={loading}
                            >
                              Delete All
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedTeachers.has(teacher.id) && (
                        <tr className="expanded-row">
                          <td colSpan="3">
                            <div className="teacher-modules-list">
                              {teacherAssignments.map(assignment => (
                                <div key={assignment.id} className="module-item">
                                  <div className="module-info">
                                    <span className="module-name">{assignment.base_module.name}</span>
                                    <div className="version-modules">
                                      {assignment.base_module.versions?.map(version => (
                                        <div key={version.id} className="version-module">
                                          {version.version_name} ({version.cours_hours + version.td_hours + version.tp_hours}h)
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <button
                                    className="admin-button delete-button"
                                    onClick={() => handleDelete(assignment.id)}
                                    disabled={loading}
                                  >
                                    Delete
                                  </button>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="admin-loading">No assignments found.</p>
        )}
      </div>
    </div>
  );
};

export default TeacherAssignmentPage; 
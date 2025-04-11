import React, { useState, useEffect } from 'react';
import {
  getClassrooms,
  deleteClassroom,
  // updateClassroom handled by form
} from '../../services/academicService';
import ClassForm from '../../components/Admin/ClassForm';

function ClassroomListPage() {
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState(null); // State for editing

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getClassrooms(); 
      setClassrooms(data);
    } catch (err) {
      console.error("Failed to fetch classrooms:", err);
      setError('Could not load classrooms. Please try refreshing.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Show form for adding
  const handleAddClick = () => {
    setEditingClassroom(null);
    setShowForm(true);
  }

  // Show form for editing
  const handleEditClick = (classroom) => {
    setEditingClassroom(classroom);
    setShowForm(true);
  };

  // Handle deletion
  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this classroom?')) {
      try {
        await deleteClassroom(id);
        fetchData(); // Refresh list
      } catch (err) {
        console.error("Failed to delete classroom:", err);
        setError('Failed to delete classroom. It might be in use in a schedule.');
      }
    }
  };

  // Callback for form success
  const handleFormSubmitSuccess = () => {
    setShowForm(false); 
    setEditingClassroom(null);
    fetchData(); 
  };

  // Cancel adding/editing
  const handleCancel = () => {
    setShowForm(false);
    setEditingClassroom(null);
  };

  return (
    <div className="admin-page-container">
      <h1>Manage Classrooms</h1>
      {error && <p className="admin-error">{error}</p>}

      {!showForm && (
        <button 
          onClick={handleAddClick} 
          className="admin-button add-button"
        >
          Add New Classroom
        </button>
      )}

      {showForm && (
        <ClassForm 
          onSubmitSuccess={handleFormSubmitSuccess} 
          initialData={editingClassroom}
          onCancel={handleCancel}
        />
      )}

      <h2>Existing Classrooms</h2>
      {isLoading ? (
        <p className="admin-loading">Loading classrooms...</p>
      ) : classrooms.length === 0 && !error ? (
        <p>No classrooms found.</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Projector</th>
                <th>PCs</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classrooms.map(cr => (
                <tr key={cr.id}>
                  <td>{cr.name}</td>
                  <td>{cr.type}</td>
                  <td>{cr.capacity}</td>
                  <td>{cr.has_projector ? 'Yes' : 'No'}</td>
                  <td>{cr.computers_count}</td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleEditClick(cr)} 
                        className="admin-button edit-button"
                        disabled={showForm}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(cr.id)} 
                        className="admin-button delete-button"
                        disabled={showForm}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ClassroomListPage; 
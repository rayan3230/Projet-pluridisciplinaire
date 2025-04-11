import React, { useState, useEffect } from 'react';
import {
  getSpecialities,
  deleteSpeciality, 
  // updateSpeciality will be handled by the form
} from '../../services/academicService'; 
import SpecialityForm from '../../components/Admin/SpecialityForm'; // Import the form

function SpecialityListPage() {
  const [specialities, setSpecialities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false); // State to toggle form visibility
  const [editingSpeciality, setEditingSpeciality] = useState(null); // State to hold the item being edited

  // Function to fetch data
  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getSpecialities();
      setSpecialities(data);
    } catch (err) {
      console.error("Failed to fetch specialities:", err);
      setError('Could not load specialities. Please try refreshing.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Show form for adding
  const handleAddClick = () => {
    setEditingSpeciality(null); // Ensure we are not editing
    setShowForm(true);
  }

  // Show form for editing
  const handleEditClick = (speciality) => {
    setEditingSpeciality(speciality);
    setShowForm(true);
  };

  // Handle deletion
  const handleDeleteClick = async (id) => {
    // Simple confirmation, ideally use a modal
    if (window.confirm('Are you sure you want to delete this speciality?')) {
      try {
        await deleteSpeciality(id);
        fetchData(); // Refresh list after delete
      } catch (err) {
        console.error("Failed to delete speciality:", err);
        setError('Failed to delete speciality. It might be linked to other items.');
      }
    }
  };

  // Callback for when the form successfully submits (add or edit)
  const handleFormSubmitSuccess = () => {
    setShowForm(false); // Hide the form
    setEditingSpeciality(null); // Reset editing state
    fetchData(); // Refresh the list
  };

  // Cancel adding/editing
  const handleCancel = () => {
    setShowForm(false);
    setEditingSpeciality(null);
  };

  return (
    <div className="admin-page-container">
      <h1>Manage Specialities</h1>
      {error && <p className="admin-error">{error}</p>}

      {/* Show Add button only if form is not visible */}
      {!showForm && (
        <button 
          onClick={handleAddClick} 
          className="admin-button add-button"
        >
          Add New Speciality
        </button>
      )}

      {/* Show the form if showForm is true (for add or edit) */}
      {showForm && (
        <SpecialityForm 
          onSubmitSuccess={handleFormSubmitSuccess} 
          initialData={editingSpeciality} // Pass initial data for editing
          onCancel={handleCancel} // Pass cancel handler
        />
      )}

      <h2>Existing Specialities</h2>
      {isLoading ? (
        <p className="admin-loading">Loading specialities...</p>
      ) : specialities.length === 0 && !error ? (
        <p>No specialities found.</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {specialities.map(spec => (
                <tr key={spec.id}>
                  <td>{spec.name}</td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleEditClick(spec)} 
                        className="admin-button edit-button"
                        disabled={showForm} // Disable if form is already open
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(spec.id)} 
                        className="admin-button delete-button"
                        disabled={showForm} // Disable if form is already open
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

export default SpecialityListPage; 
import React, { useState, useEffect } from 'react';
import {
  getSections,
  deleteSection,
  // updateSection handled by form
} from '../../services/academicService';
import SectionForm from '../../components/Admin/SectionForm';

function SectionListPage() {
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSection, setEditingSection] = useState(null); // State for editing

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Fetch sections - serializer includes promo details
      const data = await getSections(); 
      setSections(data);
    } catch (err) {
      console.error("Failed to fetch sections:", err);
      setError('Could not load sections. Please try refreshing.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Show form for adding
  const handleAddClick = () => {
    setEditingSection(null);
    setShowForm(true);
  }

  // Show form for editing
  const handleEditClick = (section) => {
    setEditingSection(section);
    setShowForm(true);
  };

  // Handle deletion
  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await deleteSection(id);
        fetchData(); // Refresh list
      } catch (err) {
        console.error("Failed to delete section:", err);
        setError('Failed to delete section. It might be linked to other items.');
      }
    }
  };

  // Callback for form success
  const handleFormSubmitSuccess = () => {
    setShowForm(false); 
    setEditingSection(null);
    fetchData(); 
  };

  // Cancel adding/editing
  const handleCancel = () => {
    setShowForm(false);
    setEditingSection(null);
  };

  return (
    <div className="admin-page-container">
      <h1>Manage Sections</h1>
      {error && <p className="admin-error">{error}</p>}

      {!showForm && (
        <button 
          onClick={handleAddClick} 
          className="admin-button add-button"
        >
          Add New Section
        </button>
      )}

      {showForm && (
        <SectionForm 
          onSubmitSuccess={handleFormSubmitSuccess} 
          initialData={editingSection}
          onCancel={handleCancel}
        />
      )}

      <h2>Existing Sections</h2>
      {isLoading ? (
        <p className="admin-loading">Loading sections...</p>
      ) : sections.length === 0 && !error ? (
        <p>No sections found.</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Promo</th>
                <th>Speciality</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sections.map(section => (
                <tr key={section.id}>
                  <td>{section.name}</td>
                  <td>{section.promo?.name || 'N/A'}</td> 
                  <td>{section.promo?.speciality?.name || 'N/A'}</td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleEditClick(section)}
                        className="admin-button edit-button"
                        disabled={showForm}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(section.id)} 
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

export default SectionListPage; 
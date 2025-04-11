import React, { useState, useEffect } from 'react';
import {
  getVersionModules,
  deleteVersionModule,
  // updateVersionModule handled by form
} from '../../services/moduleService';
import VersionModuleForm from '../../components/Admin/VersionModuleForm';

function VersionModuleListPage() {
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingModule, setEditingModule] = useState(null); // State for editing

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Fetch version modules - serializer includes base module details
      const data = await getVersionModules(); 
      setModules(data);
    } catch (err) {
      console.error("Failed to fetch version modules:", err);
      setError('Could not load version modules. Please try refreshing.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Show form for adding
  const handleAddClick = () => {
    setEditingModule(null);
    setShowForm(true);
  }

  // Show form for editing
  const handleEditClick = (module) => {
    setEditingModule(module);
    setShowForm(true);
  };

  // Handle deletion
  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this version module? This might affect schedules or teacher assignments.')) {
      try {
        await deleteVersionModule(id);
        fetchData(); // Refresh list
      } catch (err) {
        console.error("Failed to delete version module:", err);
        setError('Failed to delete version module. It might be linked to other items.');
      }
    }
  };

  // Callback for form success
  const handleFormSubmitSuccess = () => {
    setShowForm(false); 
    setEditingModule(null);
    fetchData(); 
  };

  // Cancel adding/editing
  const handleCancel = () => {
    setShowForm(false);
    setEditingModule(null);
  };

  return (
    <div className="admin-page-container">
      <h1>Manage Version Modules</h1>
      {error && <p className="admin-error">{error}</p>}

      {!showForm && (
        <button 
          onClick={handleAddClick} 
          className="admin-button add-button"
        >
          Add New Version Module
        </button>
      )}

      {showForm && (
        <VersionModuleForm 
          onSubmitSuccess={handleFormSubmitSuccess} 
          initialData={editingModule}
          onCancel={handleCancel}
        />
      )}

      <h2>Existing Version Modules</h2>
      {isLoading ? (
        <p className="admin-loading">Loading version modules...</p>
      ) : modules.length === 0 && !error ? (
        <p>No version modules found.</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Base Module</th>
                <th>Version Name</th>
                <th>Cours (h)</th>
                <th>TD (h)</th>
                <th>TP (h)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {modules.map(mod => (
                <tr key={mod.id}>
                  <td>{mod.base_module?.name || 'N/A'}</td>
                  <td>{mod.version_name || '-'}</td>
                  <td>{mod.cours_hours}</td>
                  <td>{mod.td_hours}</td>
                  <td>{mod.tp_hours}</td>
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleEditClick(mod)} 
                        className="admin-button edit-button"
                        disabled={showForm}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(mod.id)} 
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

export default VersionModuleListPage; 
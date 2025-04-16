import React, { useState, useEffect } from 'react';
import {
  getBaseModules,
  deleteBaseModule,
} from '../../services/moduleService';
import BaseModuleForm from '../../components/Admin/BaseModuleForm';

function BaseModuleListPage() {
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingModule, setEditingModule] = useState(null); 

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getBaseModules(); 
      setModules(data);
    } catch (err) {
      console.error("Failed to fetch base modules:", err);
      setError('Could not load base modules. Please try refreshing.');
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
    if (window.confirm('Are you sure you want to delete this base module? This might affect version modules.')) {
      try {
        await deleteBaseModule(id);
        fetchData(); // Refresh list
      } catch (err) {
        console.error("Failed to delete base module:", err);
        setError('Failed to delete base module. It might be linked to version modules or other items.');
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

  const getStatusBadgeClass = (status) => {
    switch (status.code) {
      case 'ready':
        return 'status-badge ready';
      case 'no_versions':
        return 'status-badge warning';
      case 'no_teachers':
        return 'status-badge warning';
      default:
        return 'status-badge error';
    }
  };

  return (
    <div className="admin-page-container">
      <h1>Manage Base Modules</h1>
      {error && <p className="admin-error">{error}</p>}

      {!showForm && (
        <button 
          onClick={handleAddClick} 
          className="admin-button add-button"
        >
          Add New Base Module
        </button>
      )}

      {showForm && (
        <BaseModuleForm 
          onSubmitSuccess={handleFormSubmitSuccess} 
          initialData={editingModule}
          onCancel={handleCancel}
        />
      )}

      <h2>Existing Base Modules</h2>
      {isLoading ? (
        <p className="admin-loading">Loading base modules...</p>
      ) : modules.length === 0 && !error ? (
        <p>No base modules found.</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Versions</th>
                <th>Latest Version</th>
                <th>Teachers</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {modules.map(mod => (
                <tr key={mod.id}>
                  <td>{mod.name}</td>
                  <td>
                    <span className={getStatusBadgeClass(mod.status)}>
                      {mod.status.label}
                    </span>
                  </td>
                  <td>{mod.versions_count}</td>
                  <td>
                    {mod.latest_version ? (
                      <div className="version-info">
                        <span className="version-name">{mod.latest_version.version_name}</span>
                        <span className="version-hours">
                          {mod.latest_version.hours.total}h total
                        </span>
                      </div>
                    ) : (
                      <span className="no-version">No versions</span>
                    )}
                  </td>
                  <td>{mod.assigned_teachers_count}</td>
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

export default BaseModuleListPage; 
import React, { useState, useEffect } from 'react';
import {
  getPromos,
  deletePromo,
  // updatePromo handled by form
} from '../../services/academicService';
import PromoForm from '../../components/Admin/PromoForm';

function PromoListPage() {
  const [promos, setPromos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null); // State for editing

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Fetch promos - serializer includes speciality details
      const data = await getPromos(); 
      setPromos(data);
    } catch (err) {
      console.error("Failed to fetch promos:", err);
      setError('Could not load promos. Please try refreshing.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Show form for adding
  const handleAddClick = () => {
    setEditingPromo(null);
    setShowForm(true);
  }

  // Show form for editing
  const handleEditClick = (promo) => {
    setEditingPromo(promo);
    setShowForm(true);
  };

  // Handle deletion
  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this promo?')) {
      try {
        await deletePromo(id);
        fetchData(); // Refresh list
      } catch (err) {
        console.error("Failed to delete promo:", err);
        setError('Failed to delete promo. It might be linked to other items.');
      }
    }
  };

  // Callback for form success
  const handleFormSubmitSuccess = () => {
    setShowForm(false); 
    setEditingPromo(null);
    fetchData(); 
  };

  // Cancel adding/editing
  const handleCancel = () => {
    setShowForm(false);
    setEditingPromo(null);
  };

  return (
    <div className="admin-page-container">
      <h1>Manage Promos</h1>
      {error && <p className="admin-error">{error}</p>}

      {!showForm && (
        <button 
          onClick={handleAddClick} 
          className="admin-button add-button"
        >
          Add New Promo
        </button>
      )}

      {showForm && (
        <PromoForm 
          onSubmitSuccess={handleFormSubmitSuccess} 
          initialData={editingPromo}
          onCancel={handleCancel}
        />
      )}

      <h2>Existing Promos</h2>
      {isLoading ? (
        <p className="admin-loading">Loading promos...</p>
      ) : promos.length === 0 && !error ? (
        <p>No promos found.</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Speciality</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.map(promo => (
                <tr key={promo.id}>
                  <td>{promo.name}</td>
                  <td>{promo.speciality?.name || 'N/A'}</td> 
                  <td className="actions-cell">
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleEditClick(promo)}
                        className="admin-button edit-button"
                        disabled={showForm}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(promo.id)} 
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

export default PromoListPage; 
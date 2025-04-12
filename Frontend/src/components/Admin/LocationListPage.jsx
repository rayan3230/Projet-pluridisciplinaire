import React, { useState, useEffect } from 'react';
import LocationForm from '../../components/Admin/LocationForm'; // Assuming LocationForm.jsx exists here
import { getLocations, deleteLocation } from '../../services/adminService';

function LocationListPage() {
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingLocation, setEditingLocation] = useState(null);

    const loadLocations = async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await getLocations();
            setLocations(data || []);
        } catch (err) {
            setError('Failed to load locations.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadLocations();
    }, []);

    const handleDelete = async (id) => {
        // Reset error before attempting delete
        setError('');
        if (window.confirm('Are you sure you want to delete this location?\nClassrooms using this location will have their location removed.')) {
            try {
                await deleteLocation(id);
                loadLocations(); // Refresh list
            } catch (err) {
                // Display the specific error from the service function
                setError(err.message || 'Failed to delete location.');
                console.error(err);
            }
        }
    };

    const handleEdit = (location) => {
        setEditingLocation(location);
        setShowForm(true);
        setError(''); // Clear error when opening form
    };

    const handleAdd = () => {
        setEditingLocation(null);
        setShowForm(true);
        setError(''); // Clear error when opening form
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setEditingLocation(null);
        loadLocations(); // Refresh list
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingLocation(null);
    };

    return (
        <div className="admin-page">
            <h1>Manage Locations</h1>

            {/* Display general error messages here */}
            {error && <p className="admin-error">{error}</p>}

            <button onClick={handleAdd} className="admin-button add-button" style={{ marginBottom: '1rem' }}>
                Add New Location
            </button>

            {showForm && (
                <LocationForm
                    onSubmitSuccess={handleFormSuccess}
                    initialData={editingLocation}
                    onCancel={handleFormCancel}
                />
            )}

            {isLoading && <p className="admin-loading">Loading locations...</p>}

            {!isLoading && locations.length === 0 && !error && (
                <p>No locations found. Add one to get started!</p>
            )}

            {!isLoading && locations.length > 0 && (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {locations.map(location => (
                                <tr key={location.id}>
                                    <td>{location.name}</td>
                                    <td>{location.description || '-'}</td>
                                    <td className="actions-cell">
                                        <div className="action-buttons">
                                            <button onClick={() => handleEdit(location)} className="admin-button edit-button">Edit</button>
                                            <button onClick={() => handleDelete(location.id)} className="admin-button delete-button">Delete</button>
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

export default LocationListPage;
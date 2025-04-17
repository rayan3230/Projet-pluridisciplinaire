import React, { useState, useEffect } from 'react';
import { createLocation, updateLocation } from '../../services/adminService';
// ... other imports ...

function LocationForm({ onSubmitSuccess, initialData, onCancel }) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = Boolean(initialData);
    // ... other state ...

    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setError('');
        } else {
            setName('');
            setError('');
        }
    }, [initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const payload = {
            name,
        };

        try {
            if (isEditing) {
                await updateLocation(initialData.id, payload);
            } else {
                await createLocation(payload);
            }
            if (onSubmitSuccess) onSubmitSuccess();
        } catch (err) {
            console.error(`Location ${isEditing ? 'update' : 'creation'} failed:`, err.response?.data || err.message);
            setError(err.response?.data?.name?.[0] || err.response?.data?.detail || `Failed to ${isEditing ? 'update' : 'create'} location.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="admin-form">
            <h2>{isEditing ? 'Edit Location' : 'Create New Location'}</h2>

            <div className="form-group">
                <label htmlFor="locationName">Location Name:</label>
                <input
                    type="text"
                    id="locationName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="admin-input"
                />
            </div>

            {error && <p className="admin-error">{error}</p>}

            <div className="form-actions">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="admin-button">
                    {isSubmitting ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Update Location' : 'Create Location')}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="admin-button cancel-button">
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default LocationForm;

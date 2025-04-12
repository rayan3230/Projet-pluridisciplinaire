import React, { useState, useEffect } from 'react';
import { createClassroom, updateClassroom, getLocations } from '../../services/adminService';

// Import SessionType enum if needed, or define choices directly
const sessionTypeChoices = [
    { value: 'COURS', label: 'Course' },
    { value: 'TD', label: 'TD' },
    { value: 'TP', label: 'TP' },
];

function ClassroomForm({ onSubmitSuccess, initialData, onCancel }) {
    const [name, setName] = useState('');
    const [type, setType] = useState(sessionTypeChoices[0].value); // Default to COURS
    const [hasProjector, setHasProjector] = useState(false);
    const [locations, setLocations] = useState([]); // State for fetched locations
    const [selectedLocationId, setSelectedLocationId] = useState(''); // State for the selected location ID
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingLocations, setIsLoadingLocations] = useState(false); // State for loading locations
    const isEditing = Boolean(initialData);

    // Effect to fetch locations on component mount
    useEffect(() => {
        setIsLoadingLocations(true);
        getLocations()
            .then(data => {
                setLocations(data || []);
            })
            .catch(err => {
                console.error("Failed to fetch locations:", err);
                setError('Could not load locations list.');
            })
            .finally(() => {
                setIsLoadingLocations(false);
            });
    }, []); // Empty dependency array ensures this runs only once

    // Effect to populate form when editing
    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setType(initialData.type || sessionTypeChoices[0].value);
            setHasProjector(initialData.has_projector || false);
            setSelectedLocationId(initialData.location?.id ?? '');
            setError('');
        } else {
            // Reset form for creating new classroom
            setName('');
            setType(sessionTypeChoices[0].value);
            setHasProjector(false);
            setSelectedLocationId('');
            setError('');
        }
    }, [initialData]); // Re-run if initialData changes

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const payload = {
            name,
            type: type,
            has_projector: hasProjector,
            location_id: selectedLocationId ? parseInt(selectedLocationId, 10) : null,
        };

        try {
            if (isEditing) {
                await updateClassroom(initialData.id, payload);
            } else {
                await createClassroom(payload);
            }
            if (onSubmitSuccess) onSubmitSuccess();
        } catch (err) {
            console.error(`Classroom ${isEditing ? 'update' : 'creation'} failed:`, err.response?.data || err.message);
            setError(err.response?.data?.detail || err.response?.data?.name?.[0] || `Failed to ${isEditing ? 'update' : 'create'} classroom.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="admin-form">
            <h2>{isEditing ? 'Edit Classroom' : 'Create New Classroom'}</h2>

            <div className="form-group">
                <label htmlFor="classroomName">Classroom Name:</label>
                <input
                    type="text"
                    id="classroomName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="admin-input" />
            </div>

            <div className="form-group">
                <label htmlFor="classroomType">Type:</label>
                <select 
                    id="classroomType"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    disabled={isSubmitting}
                    className="admin-select">
                    {sessionTypeChoices.map(choice => (
                        <option key={choice.value} value={choice.value}>
                            {choice.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group form-group-check">
                 <input 
                    type="checkbox" 
                    id="hasProjectorCheck"
                    checked={hasProjector} 
                    onChange={(e) => setHasProjector(e.target.checked)}
                    disabled={isSubmitting}
                 />
                 <label htmlFor="hasProjectorCheck">Has Projector?</label>
            </div>

            <div className="form-group">
                <label htmlFor="classroomLocation">Location (Optional):</label>
                <select
                    id="classroomLocation"
                    value={selectedLocationId}
                    onChange={(e) => setSelectedLocationId(e.target.value)}
                    disabled={isSubmitting || isLoadingLocations || locations.length === 0}
                    className="admin-select" >
                    <option value="">-- Select a Location --</option>
                    {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>
                            {loc.name}
                        </option>
                    ))}
                </select>
                {isLoadingLocations && <small>Loading locations...</small>}
                {!isLoadingLocations && locations.length === 0 && !error && <small>No locations available. Please add one first.</small>}
            </div>

            {error && <p className="admin-error">{error}</p>}

            <div className="form-actions">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="admin-button">
                    {isSubmitting ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Update Classroom' : 'Create Classroom')}
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

export default ClassroomForm; 
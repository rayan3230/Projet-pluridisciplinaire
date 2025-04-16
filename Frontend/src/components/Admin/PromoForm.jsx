import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getPromos, getPromoById, createPromo, updatePromo, deletePromo,
    getSpecialities, getAcademicYears, getSemestersByAcademicYear, getModules, // Assuming getModules fetches VersionModules
    createPromoModuleAssignment // New service function needed
} from '../../services/academicService'; 
import Alert from '../Shared/Alert.jsx';

function PromoForm() {
    const { id } = useParams(); // Get promo ID for editing
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    // Form State
    const [name, setName] = useState('');
    const [selectedSpeciality, setSelectedSpeciality] = useState('');
    const [selectedAcademicYear, setSelectedAcademicYear] = useState('');

    // Dropdown Data State
    const [specialities, setSpecialities] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [semesters, setSemesters] = useState([]); // Semesters for the selected year (with dates)
    const [allVersionModules, setAllVersionModules] = useState([]); // All available VersionModules

    // Module Assignment State
    const [moduleAssignments, setModuleAssignments] = useState({}); // { semesterId: [moduleId1, ...], ... }

    // UI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch initial data for dropdowns and editing
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const [specialitiesData, academicYearsData, versionModulesData] = await Promise.all([
                    getSpecialities(),
                    getAcademicYears(),
                    getModules() 
                ]);
                // Set state directly with the fetched data arrays
                setSpecialities(specialitiesData || []);
                setAcademicYears(academicYearsData || []);
                setAllVersionModules(versionModulesData || []);

                if (isEditMode) {
                    const promoRes = await getPromoById(id);
                    const promoData = promoRes.data;
                    setName(promoData.name || '');
                    setSelectedSpeciality(promoData.speciality?.id || '');
                    setSelectedAcademicYear(promoData.academic_year?.id || '');
                    // Fetch existing assignments for edit mode
                    // This requires an API endpoint like /api/promo-module-assignments/?promo_id={id}
                    // For simplicity, we'll skip pre-populating assignments in edit mode for now.
                }
            } catch (err) {
                console.error("Failed to fetch initial form data:", err);
                setError('Failed to load necessary data. Please try again.');
            }
            setLoading(false);
        };
        fetchData();
    }, [id, isEditMode]);

    // Fetch semesters when academic year changes
    useEffect(() => {
        if (selectedAcademicYear) {
            setLoading(true);
            setError('');
            getSemestersByAcademicYear(selectedAcademicYear)
                .then(response => { // 'response' is the array of semesters
                    // Filter semesters that have both start and end dates (Backend should already do this)
                    // Call filter directly on the response array
                    const filteredSemesters = response.filter(s => s.start_date && s.end_date);
                    setSemesters(filteredSemesters || []);
                    // Reset assignments if year changes
                    setModuleAssignments({}); 
                })
                .catch(err => {
                    console.error("Failed to fetch semesters:", err);
                    setError('Failed to fetch semesters for the selected academic year.');
                    setSemesters([]);
                    setModuleAssignments({});
                })
                .finally(() => setLoading(false));
        } else {
            setSemesters([]);
            setModuleAssignments({});
        }
    }, [selectedAcademicYear]);

    // Handle module selection change for a specific semester using checkboxes
    const handleModuleChange = (semesterId, moduleId, isChecked) => {
        setModuleAssignments(prev => {
            const currentSemesterAssignments = prev[semesterId] || [];
            let newAssignments;
            if (isChecked) {
                // Add module ID if not already present
                newAssignments = [...new Set([...currentSemesterAssignments, moduleId.toString()])];
            } else {
                // Remove module ID
                newAssignments = currentSemesterAssignments.filter(id => id !== moduleId.toString());
            }
            return {
                ...prev,
                [semesterId]: newAssignments
            };
        });
    };

    // Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const promoData = {
            name,
            speciality_id: selectedSpeciality,
            academic_year_id: selectedAcademicYear
        };

        try {
            let promoResponse;
            if (isEditMode) {
                promoResponse = await updatePromo(id, promoData);
                // ** Handle updating assignments (DELETE existing, then POST new ones) **
                // This part is complex and needs careful implementation.
                // For now, we'll just update the promo basic info.
                setSuccess('Promo updated successfully! (Module assignments update not implemented yet)');
                // Optionally navigate away or reset form

            } else {
                promoResponse = await createPromo(promoData);
                // Access id directly from the response data object
                const newPromoId = promoResponse.id; 
                setSuccess('Promo created successfully! Assigning modules...');

                // Create module assignments
                const assignmentPromises = [];
                for (const semesterId in moduleAssignments) {
                    if (moduleAssignments[semesterId].length > 0) {
                        for (const moduleId of moduleAssignments[semesterId]) {
                            assignmentPromises.push(
                                createPromoModuleAssignment({
                                    promo: newPromoId,
                                    semester: semesterId,
                                    module: moduleId
                                })
                            );
                        }
                    }
                }
                
                await Promise.all(assignmentPromises);
                setSuccess('Promo and module assignments created successfully!');
                // Reset form or navigate away
                // setName('');
                // setSelectedSpeciality('');
                // setSelectedAcademicYear('');
                // setSemesters([]);
                // setModuleAssignments({});
                 navigate('/admin/promos'); // Example navigation
            }

        } catch (err) {
            console.error("Failed to save promo or assignments:", err);
            const errorMsg = err.response?.data?.detail || err.response?.data || err.message || 'An unexpected error occurred.';
            setError(`Failed to save: ${JSON.stringify(errorMsg)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        // Use admin-form class for overall form styling
        <form onSubmit={handleSubmit} className="admin-form">
            <h2>{isEditMode ? 'Edit Promo' : 'Create Promo'}</h2>
            
            {error && <Alert type="danger" message={error} />} 
            {success && <Alert type="success" message={success} />} 

            {/* Name Input */}
            <div className="form-group">
                <label htmlFor="promoName">Promo Name</label>
                <input 
                    type="text" 
                    id="promoName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                    // Inputs implicitly styled by .admin-form input selector in Admin.css
                />
            </div>

            {/* Speciality Dropdown */}
            <div className="form-group">
                <label htmlFor="speciality">Speciality</label>
                <select 
                    id="speciality"
                    value={selectedSpeciality}
                    onChange={(e) => setSelectedSpeciality(e.target.value)}
                    required
                    disabled={loading}
                    // Selects implicitly styled by .admin-form select selector in Admin.css
                >
                    <option value="">Select Speciality</option>
                    {specialities.map(spec => (
                        <option key={spec.id} value={spec.id}>{spec.name}</option>
                    ))}
                </select>
            </div>

            {/* Academic Year Dropdown */}
            <div className="form-group">
                <label htmlFor="academicYear">Academic Year</label>
                <select 
                    id="academicYear"
                    value={selectedAcademicYear}
                    onChange={(e) => setSelectedAcademicYear(e.target.value)}
                    required
                    disabled={loading}
                    // Selects implicitly styled by .admin-form select selector in Admin.css
                >
                    <option value="">Select Academic Year</option>
                    {academicYears.map(year => (
                        <option key={year.id} value={year.id}>{year.year_start}-{year.year_end}</option>
                    ))}
                </select>
            </div>

            {/* Semester Sections & Module Assignment */}
            {semesters.length > 0 && (
                <div className="form-group">
                    <h4>Assign Modules per Semester</h4>
                    {semesters.map(semester => (
                        <div key={semester.id} className="mb-3 p-3 border rounded">
                            <h5>Semester {semester.semester_number} ({semester.start_date} to {semester.end_date})</h5>
                            <label>Modules:</label>
                            {/* Checkbox container with scrolling */}
                            <div className="checkbox-list-container" style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--admin-input-border)', padding: '10px', borderRadius: '5px', marginTop: '0.5rem' }}>
                                {allVersionModules.length > 0 ? (
                                    allVersionModules.map(module => {
                                        const isChecked = moduleAssignments[semester.id]?.includes(module.id.toString()) || false;
                                        return (
                                            <div key={module.id} className="form-group-check" style={{ marginBottom: '0.5rem' }}> {/* Use form-group-check from Admin.css? */} 
                                                <input 
                                                    type="checkbox" 
                                                    id={`module-${semester.id}-${module.id}`}
                                                    value={module.id} 
                                                    checked={isChecked}
                                                    onChange={(e) => handleModuleChange(semester.id, module.id, e.target.checked)}
                                                    disabled={loading}
                                                />
                                                <label htmlFor={`module-${semester.id}-${module.id}`} style={{ marginLeft: '0.5rem', fontWeight: 'normal' }}>
                                                    {module.base_module?.name} ({module.version_name})
                                                </label>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p>No modules available to assign.</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Submission Button */}
            <div className="form-actions"> {/* Use form-actions for button alignment? */} 
                <button type="submit" className="admin-button" disabled={loading}>
                    {loading ? 'Saving...' : (isEditMode ? 'Update Promo' : 'Create Promo')}
                </button>
                <button type="button" className="admin-button cancel-button" onClick={() => navigate('/admin/promos')} disabled={loading}>
                    Cancel
                </button>
            </div>
        </form>
    );
}

export default PromoForm; 
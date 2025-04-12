import React, { useState, useEffect } from 'react';
import './editprofile.css';

const CloseIconPlaceholder = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const AddIconPlaceholder = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const RemoveIconPlaceholder = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

function Editprofile({ 
    user = {}, 
    onClose, 
    availableModules = ['Calculus I', 'Linear Algebra', 'Data Structures', 'Algorithms', 'Operating Systems', 'Database Management'] // Example prop
}) {
    
    const [name, setName] = useState(user.Name || '');
    const [email, setEmail] = useState(user.Email || '');
    const [assignedModules, setAssignedModules] = useState(Array.isArray(user.AssignedCourses) ? user.AssignedCourses : ['Calculus I', 'Data Structures']); // Example initial
    const [selectedModuleToAdd, setSelectedModuleToAdd] = useState(''); // State for dropdown selection
    

    const handleSave = (e) => {
        e.preventDefault();
        const updatedProfile = {
            Name: name,
            Email: email,
            AssignedCourses: assignedModules, // Save the modules array
        };
        console.log("Saving profile:", updatedProfile);
        if(onClose) onClose(); // Close modal after save attempt
    };

    const handlePasswordResetClick = () => {
        console.log("Password reset initiated for:", email);
        // Add logic here to trigger password reset flow (e.g., call API, show another modal)
        // Optionally close this modal or keep it open
        // if(onClose) onClose(); 
    };

    // Function to add the selected module from the dropdown
    const handleAddModule = () => {
        // Check if a valid module is selected and not already assigned
        if (selectedModuleToAdd && !assignedModules.includes(selectedModuleToAdd)) {
            setAssignedModules([...assignedModules, selectedModuleToAdd]);
            setSelectedModuleToAdd(''); // Reset dropdown selection
        }
    };

    // Function to remove a module
    const handleRemoveModule = (moduleToRemove) => {
        setAssignedModules(assignedModules.filter(module => module !== moduleToRemove));
    };

    // Filter available modules for the dropdown
    const modulesForDropdown = availableModules.filter(
        module => !assignedModules.includes(module)
    );

    // Update dropdown state when selection changes
    useEffect(() => {
        // Set the default selection to the first available option if selection is empty
        if (!selectedModuleToAdd && modulesForDropdown.length > 0) {
            setSelectedModuleToAdd(modulesForDropdown[0]);
        }
        // If the currently selected module is removed from available (because it was added), reset selection
        else if (selectedModuleToAdd && !modulesForDropdown.includes(selectedModuleToAdd)) {
             setSelectedModuleToAdd(modulesForDropdown.length > 0 ? modulesForDropdown[0] : '');
        }
    }, [assignedModules, availableModules]); // Re-run when assigned or available modules change

    return (
        <div className="editprofile-overlay">
            <div className="editprofile-container">
                <div className="editprofile-header">
                    <h2>Edit Profile</h2>
                    <button onClick={onClose} className="close-button">
                        <CloseIconPlaceholder />
                    </button>
                </div>
                <form className="editprofile-body" onSubmit={handleSave}>
                    <div className="form-group">
                        <label htmlFor="edit-name">Name</label>
                        <input 
                            type="text" 
                            id="edit-name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="edit-email">Email</label>
                        <input 
                            type="email" 
                            id="edit-email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    
                    {/* Assigned Modules Section */}
                    <div className="form-group assigned-modules-section">
                        <label>Assigned Modules</label>
                        <div className="modules-list">
                            {assignedModules.map((module, index) => (
                                <div key={index} className="module-tag">
                                    <span>{module}</span>
                                    <button 
                                        type="button" 
                                        className="remove-module-btn" 
                                        onClick={() => handleRemoveModule(module)}
                                    >
                                        <RemoveIconPlaceholder />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="add-module-input-group">
                            <select 
                                className="module-select" 
                                value={selectedModuleToAdd} 
                                onChange={(e) => setSelectedModuleToAdd(e.target.value)}
                                disabled={modulesForDropdown.length === 0} // Disable if no modules left
                            >
                                {/* Default option if needed, or handle empty state */}
                                {modulesForDropdown.length === 0 && <option value="">No more modules</option>}
                                {modulesForDropdown.map(module => (
                                    <option key={module} value={module}>
                                        {module}
                                    </option>
                                ))}
                            </select>
                            <button 
                                type="button" 
                                className="add-module-btn" 
                                onClick={handleAddModule}
                                disabled={!selectedModuleToAdd || modulesForDropdown.length === 0} // Disable if no selection/no options
                            >
                                <AddIconPlaceholder />
                            </button>
                        </div>
                    </div>

                    <div className="editprofile-footer">
                        {/* Moved Reset Password Button */} 
                        <button 
                            type="button" 
                            className="reset-password-button" 
                            onClick={handlePasswordResetClick}
                        >
                            Reset Password
                        </button>
                        {/* Group Cancel and Save buttons */}
                        <div> 
                            <button type="button" className="cancel-button" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="save-button">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Editprofile;

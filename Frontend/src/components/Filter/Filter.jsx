import React, { useState, useEffect } from 'react';
import './filter.css';

// --- Placeholder Icons (Replace with actual icons) ---
const FilterIconPlaceholder = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
);
const DropdownIconPlaceholder = () => (
     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: 'none' }}>
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);
// --- End Placeholder Icons ---

function Filter() {
    const [filters, setFilters] = useState({
        mode: ['In-Person'], 
        timeSlots: [],
        classTypes: [],
        locations: [],
        selectedClass: 'class1' 
    });
    const [selectedLocationToAdd, setSelectedLocationToAdd] = useState('');

    // Example data
    const timeSlotOptions = ['8:00 - 9:30', '9:45 - 11:15', '11:30 - 13:00', '14:00 - 15:30', '15:45 - 17:15'];
    const classTypeOptions = ['Cour', 'TD', 'TP'];
    const allLocationOptions = ['Nouveau Blocs', 'Nouveau Nouveau Blocs', 'Faculty', 'Enfi', 'Bloc 100', 'Bloc 300'];
    const classOptions = [{value: 'class1', label: 'Class 1'}, {value: 'class2', label: 'Class 2'}];

    const handleCheckboxChange = (group, value) => {
        setFilters(prevFilters => {
            const currentGroup = prevFilters[group];
            const newGroup = currentGroup.includes(value)
                ? currentGroup.filter(item => item !== value)
                : [...currentGroup, value]; 
            return { ...prevFilters, [group]: newGroup };
        });
    };

    const handleSelectChange = (event) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            selectedClass: event.target.value
        }));
    };

    const handleResetAll = () => {
        setFilters({
            mode: [],
            timeSlots: [],
            classTypes: [],
            locations: [],
            selectedClass: classOptions.length > 0 ? classOptions[0].value : ''
        });
        const available = allLocationOptions;
        setSelectedLocationToAdd(available.length > 0 ? available[0] : '');
    };

    const handleResetCheckboxGroup = (groupName) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [groupName]: []
        }));
    };

    const handleAddLocation = () => {
        if (selectedLocationToAdd && !filters.locations.includes(selectedLocationToAdd)) {
            setFilters(prevFilters => ({
                ...prevFilters,
                locations: [...prevFilters.locations, selectedLocationToAdd]
            }));
        }
    };

    const handleRemoveLocation = (locationToRemove) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            locations: prevFilters.locations.filter(loc => loc !== locationToRemove)
        }));
    };

    const renderCheckboxGroup = (groupName, options, label) => (
        <div className="filter-group">
            <div className="filter-group-header">
                <label className="filter-group-label">{label}</label>
                <button 
                    className="reset-group-button" 
                    onClick={() => handleResetCheckboxGroup(groupName)}
                    disabled={filters[groupName].length === 0}
                >
                    Reset
                </button>
            </div>
            {options.map((option, index) => (
                <div key={`${groupName}-${index}`} className="checkbox-item">
                    <input 
                        type="checkbox" 
                        id={`${groupName}-${index}`} 
                        value={option}
                        checked={filters[groupName].includes(option)}
                        onChange={() => handleCheckboxChange(groupName, option)}
                    />
                    <label htmlFor={`${groupName}-${index}`}>{option}</label>
                </div>
            ))}
        </div>
    );

    const locationsForDropdown = allLocationOptions.filter(
        loc => !filters.locations.includes(loc)
    );

    useEffect(() => {
        if (!selectedLocationToAdd && locationsForDropdown.length > 0) {
            setSelectedLocationToAdd(locationsForDropdown[0]);
        }
        else if (selectedLocationToAdd && !locationsForDropdown.includes(selectedLocationToAdd)) {
             setSelectedLocationToAdd(locationsForDropdown.length > 0 ? locationsForDropdown[0] : '');
        }
    }, [filters.locations, allLocationOptions]);

    return (
        <div className="filter-container">
            <div className="filter-header">
                <div className="filter-title">
                    <FilterIconPlaceholder />
                    <span>Filters</span>
                </div>
                <button className="reset-button" onClick={handleResetAll}>Reset</button>
            </div>

            <div className="filter-body">
                {renderCheckboxGroup('mode', ['In-Person', 'Online'], 'Mode')}
                <hr className="filter-separator" />
                {renderCheckboxGroup('timeSlots', timeSlotOptions, 'Time Slot')}
                <hr className="filter-separator" />
                {renderCheckboxGroup('classTypes', classTypeOptions, 'Class type')}
                <hr className="filter-separator" />
                
                <div className="filter-group location-filter-group">
                    <div className="filter-group-header">
                         <label className="filter-group-label">Location</label>
                         {filters.locations.length > 0 && (
                             <button 
                                 className="reset-group-button" 
                                 onClick={() => handleResetCheckboxGroup('locations')}
                             >
                                 Reset
                             </button>
                         )}
                    </div>
                    <div className="selected-items-list">
                        {filters.locations.map((location, index) => (
                            <div key={index} className="selected-item-tag location-tag">
                                <span>{location}</span>
                                <button 
                                    type="button" 
                                    className="remove-item-btn" 
                                    onClick={() => handleRemoveLocation(location)}
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                     <div className="add-item-group">
                        <div className="select-wrapper">
                            <select 
                                className="location-select" 
                                value={selectedLocationToAdd} 
                                onChange={(e) => setSelectedLocationToAdd(e.target.value)}
                                disabled={locationsForDropdown.length === 0}
                            >
                                {locationsForDropdown.length === 0 && <option value="">All added</option>}
                                {locationsForDropdown.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                            <div className="select-icon">
                                 <DropdownIconPlaceholder />
                            </div>
                        </div>
                        <button 
                            type="button" 
                            className="add-item-btn" 
                            onClick={handleAddLocation}
                            disabled={!selectedLocationToAdd || locationsForDropdown.length === 0}
                        >
                             +
                        </button>
                    </div>
                </div>

                <hr className="filter-separator" />

                <div className="filter-group dropdown-group">
                    <div className="select-wrapper">
                        <select 
                            id="class-select"
                            value={filters.selectedClass}
                            onChange={handleSelectChange}
                        >
                            {classOptions.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                        <div className="select-icon">
                             <DropdownIconPlaceholder />
                        </div>
                   </div>
                </div>
            </div>
        </div>
    );
}

export default Filter;

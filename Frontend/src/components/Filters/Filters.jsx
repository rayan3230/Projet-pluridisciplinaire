import React, { useState } from 'react';
import './Filters.css';

const Filters = () => {
  const [filters, setFilters] = useState({
    mode: 'in-person',
    timeSlots: [],
    classTypes: [],
    locations: []
  });

  const handleModeChange = (mode) => {
    setFilters({ ...filters, mode });
  };

  const toggleTimeSlot = (index) => {
    const newSlots = filters.timeSlots.includes(index)
      ? filters.timeSlots.filter(i => i !== index)
      : [...filters.timeSlots, index];
    setFilters({ ...filters, timeSlots: newSlots });
  };

  const toggleClassType = (type) => {
    const newTypes = filters.classTypes.includes(type)
      ? filters.classTypes.filter(t => t !== type)
      : [...filters.classTypes, type];
    setFilters({ ...filters, classTypes: newTypes });
  };

  const toggleLocation = (location) => {
    const newLocations = filters.locations.includes(location)
      ? filters.locations.filter(l => l !== location)
      : [...filters.locations, location];
    setFilters({ ...filters, locations: newLocations });
  };

  const resetFilters = () => {
    setFilters({
      mode: 'in-person',
      timeSlots: [],
      classTypes: [],
      locations: []
    });
  };

  return (
    <div className="filters-panel">
      <div className="filters-header">
        <h2>Filters</h2>
        <button className="reset-btn" onClick={resetFilters}>Reset</button>
      </div>

      <div className="filter-group">
        <h3 className="filter-title">Mode</h3>
        <label className="radio-option">
          <input
            type="radio"
            name="mode"
            checked={filters.mode === 'in-person'}
            onChange={() => handleModeChange('in-person')}
          />
          <span className="checkmark"></span>
          In-Person
        </label>
        <label className="radio-option">
          <input
            type="radio"
            name="mode"
            checked={filters.mode === 'online'}
            onChange={() => handleModeChange('online')}
          />
          <span className="checkmark"></span>
          Online
        </label>
      </div>

      <div className="filter-group">
        <h3 className="filter-title">Time Slot</h3>
        {[1, 2, 3, 4, 5].map((_, index) => (
          <label key={index} className="checkbox-option">
            <input
              type="checkbox"
              checked={filters.timeSlots.includes(index)}
              onChange={() => toggleTimeSlot(index)}
            />
            <span className="checkmark"></span>
            8:00 - 9:30
          </label>
        ))}
      </div>

      <div className="filter-group">
        <h3 className="filter-title">Class type</h3>
        {['Cour', 'TD', 'TP'].map(type => (
          <label key={type} className="checkbox-option">
            <input
              type="checkbox"
              checked={filters.classTypes.includes(type)}
              onChange={() => toggleClassType(type)}
            />
            <span className="checkmark"></span>
            {type}
          </label>
        ))}
      </div>

      <div className="filter-group">
        <h3 className="filter-title">Location</h3>
        {[
          'Nouveau Blocs',
          'Nouveau Nouveau Blocs',
          'Faculty',
          'Enfi',
          'Bloc 100',
          'Bloc 300'
        ].map(location => (
          <label key={location} className="checkbox-option">
            <input
              type="checkbox"
              checked={filters.locations.includes(location)}
              onChange={() => toggleLocation(location)}
            />
            <span className="checkmark"></span>
            {location}
          </label>
        ))}
      </div>
    </div>
  );
};

export default Filters;
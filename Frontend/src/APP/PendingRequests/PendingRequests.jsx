import React, { useState } from 'react';

const PendingRequests = () => {
  const [filters, setFilters] = useState({
    node: false,
    inPerson: false,
    online: false,
    timeSlots: Array(5).fill(false),
    classTypes: {
      cour: false,
      td: false,
      tp: false
    }
  });

  const handleFilterChange = (filterName) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const handleTimeSlotChange = (index) => {
    const newTimeSlots = [...filters.timeSlots];
    newTimeSlots[index] = !newTimeSlots[index];
    setFilters(prev => ({
      ...prev,
      timeSlots: newTimeSlots
    }));
  };

  const handleClassTypeChange = (type) => {
    setFilters(prev => ({
      ...prev,
      classTypes: {
        ...prev.classTypes,
        [type]: !prev.classTypes[type]
      }
    }));
  };

  const resetFilters = () => {
    setFilters({
      node: false,
      inPerson: false,
      online: false,
      timeSlots: Array(5).fill(false),
      classTypes: {
        cour: false,
        td: false,
        tp: false
      }
    });
  };

  const pendingRequests = [
    {
      id: 1,
      teacher: "Teacher 3",
      department: "DRAI",
      currentSlot: "Sunday 8:00 - 9:30 | Course 145 T",
      requestedSlot: "Monday 8:00 - 9:30 | Course 313 T",
      status: "Pending"
    },
    {
      id: 2,
      teacher: "Teacher 3",
      department: "DRAI",
      currentSlot: "Sunday 8:00 - 9:30 | Course 145 T",
      requestedSlot: "Monday 8:00 - 9:30 | Course 313 T",
      status: "Pending"
    },
    {
      id: 3,
      teacher: "Teacher 3",
      department: "DRAI",
      currentSlot: "Sunday 8:00 - 9:30 | Course 145 T",
      requestedSlot: "Monday 8:00 - 9:30 | Course 313 T",
      status: "Pending"
    },
    {
      id: 4,
      teacher: "Teacher 3",
      department: "DRAI",
      currentSlot: "Sunday 8:00 - 9:30 | Course 145 T",
      requestedSlot: "Monday 8:00 - 9:30 | Course 313 T",
      status: "Pending"
    }
  ];

  return (
    <div className="pending-requests-container">
      <div className="sidebar">
        <h1>Scope</h1>
        <nav>
          <a href="#">Home</a>
          <a href="#" className="active">Pending Requests</a>
          <a href="#">Incoming Requests</a>
          <a href="#">Time Swap</a>
        </nav>
      </div>

      <div className="main-content">
        <div className="filters-section">
          <div className="filters-header">
            <h2>Filters</h2>
            <button onClick={resetFilters} className="reset-btn">Reset</button>
          </div>

          <div className="filter-group">
            <label>
              <input 
                type="checkbox" 
                checked={filters.node} 
                onChange={() => handleFilterChange('node')} 
              />
              Node
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={filters.inPerson} 
                onChange={() => handleFilterChange('inPerson')} 
              />
              In-Person
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={filters.online} 
                onChange={() => handleFilterChange('online')} 
              />
              Online
            </label>
          </div>

          <div className="filter-subsection">
            <h3>Time Slot</h3>
            {filters.timeSlots.map((checked, index) => (
              <label key={index}>
                <input 
                  type="checkbox" 
                  checked={checked} 
                  onChange={() => handleTimeSlotChange(index)} 
                />
                8:00 - 9:30
              </label>
            ))}
          </div>

          <div className="filter-subsection">
            <h3>Class type</h3>
            <label>
              <input 
                type="checkbox" 
                checked={filters.classTypes.cour} 
                onChange={() => handleClassTypeChange('cour')} 
              />
              Cour
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={filters.classTypes.td} 
                onChange={() => handleClassTypeChange('td')} 
              />
              TD
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={filters.classTypes.tp} 
                onChange={() => handleClassTypeChange('tp')} 
              />
              TP
            </label>
          </div>

          <div className="filter-subsection">
            <h3>Location</h3>
            <input 
              type="text" 
              placeholder="New Request → Search for request..." 
              className="search-input"
            />
          </div>
        </div>

        <div className="requests-list">
          {pendingRequests.map(request => (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <span className="teacher-name">{request.teacher}</span>
                <span className="department">{request.department}</span>
              </div>
              <div className="time-slots">
                <div className="time-slot current">
                  {request.currentSlot}
                </div>
                <div className="time-slot requested">
                  {request.requestedSlot}
                </div>
              </div>
              <div className="request-status">
                {request.status}
              </div>
              <div className="request-actions">
                <button className="btn approve">Approve</button>
                <button className="btn reject">Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PendingRequests;
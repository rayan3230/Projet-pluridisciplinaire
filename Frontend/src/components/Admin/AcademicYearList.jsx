import React from 'react';
import './AcademicYearList.css';

const AcademicYearList = ({ academicYears, onEdit }) => {
  return (
    <div className="academic-year-list-container">
      <h2>Academic Years</h2>
      <p className="note">
        Each academic year has two semesters that are shared across all specialities.
        You can only edit the start and end dates of semesters.
      </p>
      <div className="academic-years-list">
        {academicYears.map((year) => (
          <div key={year.id} className="academic-year-item">
            <div className="academic-year-header">
              <h3>{year.year_start}-{year.year_end}</h3>
            </div>
            <div className="semesters-container">
              {year.semesters.map((semester) => (
                <div key={semester.id} className="semester-item">
                  <div className="semester-info">
                    <h4>Semester {semester.semester_number}</h4>
                    <div className="semester-dates">
                      <p>Start: {new Date(semester.start_date).toLocaleDateString()}</p>
                      <p>End: {new Date(semester.end_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button 
                    className="edit-button"
                    onClick={() => onEdit(semester)}
                  >
                    Edit Dates
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AcademicYearList; 
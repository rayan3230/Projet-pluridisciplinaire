import React from 'react';
import './SemesterList.css';

const SemesterList = ({ semesters, onEditSemester }) => {
  // Filter out only invalid semesters (null or undefined)
  const validSemesters = semesters.filter(semester => semester);

  // Group semesters by academic year, handling cases where academic_year might be missing
  const semestersByYear = validSemesters.reduce((acc, semester) => {
    let year;
    if (semester.academic_year) {
      year = `${semester.academic_year.year_start}-${semester.academic_year.year_end}`;
    } else {
      year = 'Unknown Academic Year';
    }
    
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(semester);
    return acc;
  }, {});

  // Sort years in descending order, handling unknown years
  const sortedYears = Object.keys(semestersByYear).sort((a, b) => {
    if (a === 'Unknown Academic Year') return 1;
    if (b === 'Unknown Academic Year') return -1;
    const yearA = parseInt(a.split('-')[0], 10);
    const yearB = parseInt(b.split('-')[0], 10);
    return yearB - yearA;
  });

  return (
    <div className="semester-list-container">
      <h2>Academic Year Semesters</h2>
      <p className="semester-note">Note: Each academic year has two semesters. You can only edit their start and end dates.</p>
      {sortedYears.length === 0 ? (
        <p className="no-data">No semesters found.</p>
      ) : (
        <div className="academic-years-list">
          {sortedYears.map(year => (
            <div key={year} className="academic-year-group">
              <h3 className="academic-year-title">{year}</h3>
              <ul className="semester-list">
                {semestersByYear[year]
                  .sort((a, b) => a.semester_number - b.semester_number)
                  .map(semester => (
                    <li key={semester.id} className="semester-item">
                      <div className="semester-info">
                        <span className="semester-name">
                          {semester.semester_number === 1 ? 'First Semester' : 'Second Semester'}
                        </span>
                        <span className="semester-dates">
                          {semester.start_date ? new Date(semester.start_date).toLocaleDateString() : 'Start date not set'} - {semester.end_date ? new Date(semester.end_date).toLocaleDateString() : 'End date not set'}
                        </span>
                      </div>
                      <div className="action-buttons">
                        <button
                          onClick={() => onEditSemester(semester)}
                          className="edit-button"
                        >
                          Edit
                        </button>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SemesterList; 
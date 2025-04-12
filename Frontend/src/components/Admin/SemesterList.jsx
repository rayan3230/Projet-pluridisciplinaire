import React from 'react';
import './SemesterList.css';
import { deleteSemester } from '../../services/semesterService';

const SemesterList = ({ semesters, onEdit, onDeleteSuccess }) => {
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this semester? This action cannot be undone.')) {
      try {
        await deleteSemester(id);
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
      } catch (error) {
        console.error('Failed to delete semester:', error);
        alert('Failed to delete semester. Please try again.');
      }
    }
  };

  return (
    <div className="semester-list-container">
      <h2>Existing Semesters</h2>
      {semesters.length === 0 ? (
        <p className="no-data">No semesters found. Create a new one to get started.</p>
      ) : (
        <ul className="semester-list">
          {semesters.map(semester => (
            <li key={semester.id} className="semester-item">
              <div className="semester-info">
                <span className="semester-name">{semester.name}</span>
                <span className="semester-dates">
                  {new Date(semester.start_date).toLocaleDateString()} - {new Date(semester.end_date).toLocaleDateString()}
                </span>
              </div>
              <div className="action-buttons">
                <button
                  onClick={() => onEdit(semester)}
                  className="edit-button"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(semester.id)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SemesterList; 
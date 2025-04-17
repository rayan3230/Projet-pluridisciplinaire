import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AcademicYearForm.css';

const AcademicYearForm = ({ semester, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (semester) {
      setFormData({
        start_date: semester.start_date || '',
        end_date: semester.end_date || ''
      });
    }
  }, [semester]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.put(`/api/semesters/${semester.id}/`, formData);
      onUpdate();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while updating the semester');
    } finally {
      setLoading(false);
    }
  };

  if (!semester) return null;

  return (
    <div className="academic-year-form-container">
      <h2>Edit Semester Dates</h2>
      <div className="semester-info">
        <p><strong>Academic Year:</strong> {semester.promo.year_start}-{semester.promo.year_end}</p>
        <p><strong>Semester:</strong> {semester.semester_number === 1 ? 'First' : 'Second'} Semester</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="start_date">Start Date:</label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="end_date">End Date:</label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button type="button" onClick={onClose} className="cancel-button">
            Cancel
          </button>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AcademicYearForm; 
import React, { useState, useEffect } from 'react';
import { getSemesters } from '../../services/semesterService';
import SemesterForm from '../../components/Admin/SemesterForm';
import SemesterList from '../../components/Admin/SemesterList';

function SemesterManagementPage() {
  const [semesters, setSemesters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);

  const fetchSemesters = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getSemesters();
      setSemesters(data);
    } catch (err) {
      console.error('Failed to fetch semesters:', err);
      setError('Could not load semesters. Please try refreshing.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  const handleAddClick = () => {
    setEditingSemester(null);
    setShowForm(true);
  };

  const handleEditClick = (semester) => {
    setEditingSemester(semester);
    setShowForm(true);
  };

  const handleFormSubmitSuccess = () => {
    setShowForm(false);
    setEditingSemester(null);
    fetchSemesters();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSemester(null);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Semester Management</h1>
      
      {error && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '5px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {!showForm && (
        <button
          onClick={handleAddClick}
          style={{
            padding: '10px 15px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          Add New Semester
        </button>
      )}

      {showForm ? (
        <SemesterForm
          semester={editingSemester}
          onSubmitSuccess={handleFormSubmitSuccess}
          onCancel={handleCancel}
        />
      ) : (
        <SemesterList
          semesters={semesters}
          onEdit={handleEditClick}
          onDeleteSuccess={fetchSemesters}
        />
      )}
    </div>
  );
}

export default SemesterManagementPage; 
import React, { useState, useEffect } from 'react';
import { getPromos } from '../../services/academicService';
import { getSemesters } from '../../services/semesterService';
import { getModulesForPromo } from '../../services/moduleService';
import { generateSchedule } from '../../services/scheduleService';
import './ScheduleManagementPage.css';

const ScheduleManagementPage = () => {
  const [promos, setPromos] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [promosRes, semestersRes] = await Promise.all([
          getPromos(),
          getSemesters()
        ]);
        setPromos(promosRes);
        setSemesters(semestersRes);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePromoChange = async (e) => {
    const promoId = e.target.value;
    setSelectedPromo(promoId);
    if (promoId && selectedSemester) {
      try {
        const modulesRes = await getModulesForPromo(promoId, selectedSemester);
        setModules(modulesRes);
      } catch (err) {
        setError('Failed to load modules');
      }
    }
  };

  const handleSemesterChange = async (e) => {
    const semesterId = e.target.value;
    setSelectedSemester(semesterId);
    if (selectedPromo && semesterId) {
      try {
        const modulesRes = await getModulesForPromo(selectedPromo, semesterId);
        setModules(modulesRes);
      } catch (err) {
        setError('Failed to load modules');
      }
    }
  };

  const handleGenerateSchedule = async () => {
    if (!selectedPromo || !selectedSemester) return;
    
    setLoading(true);
    setError(null);
    try {
      await generateSchedule(selectedPromo, selectedSemester);
      setShowForm(false);
    } catch (err) {
      setError('Failed to generate schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-container schedule-management-page">
      <h1>Schedule Management</h1>
      {error && <p className="admin-error">{error}</p>}

      {!showForm && (
        <button 
          onClick={() => setShowForm(true)}
          className="admin-button add-button"
        >
          Generate New Schedule
        </button>
      )}

      {showForm && (
        <div className="schedule-form">
          <h2>Generate Schedule</h2>
          <div className="form-group">
            <label htmlFor="promoSelect">Promo:</label>
            <select
              id="promoSelect"
              value={selectedPromo}
              onChange={handlePromoChange}
              required
              disabled={loading}
            >
              <option value="">Select a promo</option>
              {promos.map(promo => (
                <option key={promo.id} value={promo.id}>
                  {promo.name} ({promo.speciality?.name || 'No Speciality'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="semesterSelect">Semester:</label>
            <select
              id="semesterSelect"
              value={selectedSemester}
              onChange={handleSemesterChange}
              required
              disabled={loading}
            >
              <option value="">Select a semester</option>
              {semesters
                .filter(sem => sem.start_date && sem.end_date)
                .map(semester => (
                <option key={semester.id} value={semester.id}>
                  {semester.semester_number === 1 ? 'First Semester' : 'Second Semester'} 
                  ({semester.academic_year?.year_start ?? '?'}-{semester.academic_year?.year_end ?? '?'})
                </option>
              ))}
            </select>
          </div>

          {selectedPromo && selectedSemester && (
            <div className="modules-summary">
              <h3>Selected Modules:</h3>
              <ul>
                {modules.map(module => (
                  <li key={module.id}>
                    {module.base_module?.name || 'Unknown'} - {module.version_name || 'Default'}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="admin-button cancel-button"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGenerateSchedule}
              className="admin-button generate-button"
              disabled={loading || !selectedPromo || !selectedSemester}
            >
              {loading ? 'Generating...' : 'Generate Schedule'}
            </button>
          </div>
        </div>
      )}

      <h2>Existing Schedules</h2>
      {loading ? (
        <p className="admin-loading">Loading schedules...</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Promo</th>
                <th>Semester</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* TODO: Add schedule list when backend is ready */}
              <tr>
                <td colSpan="4" className="no-data">No schedules available yet</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagementPage; 
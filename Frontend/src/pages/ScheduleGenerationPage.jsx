import React, { useState, useEffect } from 'react';
import {
  getAcademicYears,
  getSemestersByYear,
  getPromos,
  getCompatibleTeachers,
  generateClassSchedule
} from '../../services/scheduleService';
import './ScheduleGenerationPage.css';
import { ClipLoader } from 'react-spinners';

const ScheduleGenerationPage = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [promos, setPromos] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState('');
  const [compatibleTeachers, setCompatibleTeachers] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const data = await getAcademicYears();
        setAcademicYears(data);
      } catch (err) {
        setError('Failed to fetch academic years.');
      }
    };
    fetchYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      const fetchSemesters = async () => {
        try {
          const data = await getSemestersByYear(selectedYear);
          setSemesters(data);
          setSelectedSemester('');
          setPromos([]);
          setSelectedPromo('');
          setCompatibleTeachers([]);
          setSelectedTeachers(new Set());
        } catch (err) {
          setError('Failed to fetch semesters.');
        }
      };
      fetchSemesters();
    } else {
      setSemesters([]);
      setSelectedSemester('');
    }
  }, [selectedYear]);

  useEffect(() => {
    if (selectedYear) {
      const fetchPromos = async () => {
        try {
          const data = await getPromos(selectedYear);
          setPromos(data);
          setSelectedPromo('');
          setCompatibleTeachers([]);
          setSelectedTeachers(new Set());
        } catch (err) {
          setError('Failed to fetch promos.');
        }
      };
      fetchPromos();
    } else {
      setPromos([]);
      setSelectedPromo('');
    }
  }, [selectedYear]);

  useEffect(() => {
    if (selectedPromo && selectedSemester) {
      const fetchTeachers = async () => {
        setLoadingTeachers(true);
        setCompatibleTeachers([]);
        setSelectedTeachers(new Set());
        setError('');
        try {
          const data = await getCompatibleTeachers(selectedPromo, selectedSemester);
          setCompatibleTeachers(data);
        } catch (err) {
          setError('Failed to fetch compatible teachers.');
          setCompatibleTeachers([]);
        } finally {
          setLoadingTeachers(false);
        }
      };
      fetchTeachers();
    } else {
      setCompatibleTeachers([]);
      setSelectedTeachers(new Set());
    }
  }, [selectedPromo, selectedSemester]);

  const handleTeacherSelection = (teacherId) => {
    setSelectedTeachers(prevSelected => {
      const newSelection = new Set(prevSelected);
      if (newSelection.has(teacherId)) {
        newSelection.delete(teacherId);
      } else {
        newSelection.add(teacherId);
      }
      return newSelection;
    });
  };

  const handleGenerateSchedule = async () => {
    if (!selectedPromo || !selectedSemester || selectedTeachers.size === 0) {
      setError('Please select an academic year, semester, promo, and at least one teacher.');
      return;
    }
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const result = await generateClassSchedule(selectedPromo, selectedSemester, Array.from(selectedTeachers));
      setMessage(result.message || 'Schedule generated successfully!');
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to generate schedule.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="schedule-generation-page">
      <h1>Generate Class Schedule</h1>

      <div className="selection-controls">
        <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} disabled={loading || loadingTeachers}>
          <option value="">Select Academic Year</option>
          {academicYears.map(year => (
            <option key={year.id} value={year.id}>{year.year_start}-{year.year_end}</option>
          ))}
        </select>

        <select value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)} disabled={!selectedYear || loading || loadingTeachers}>
          <option value="">Select Semester</option>
          {semesters.map(semester => (
            <option key={semester.id} value={semester.id}>{semester.name}</option>
          ))}
        </select>

        <select value={selectedPromo} onChange={e => setSelectedPromo(e.target.value)} disabled={!selectedSemester || loading || loadingTeachers}>
          <option value="">Select Promo</option>
          {promos.map(promo => (
            <option key={promo.id} value={promo.id}>{promo.name} ({promo.speciality?.name})</option>
          ))}
        </select>
      </div>

      {selectedPromo && selectedSemester && (
        <div className="teacher-selection-container">
          <h2>Select Compatible Teachers</h2>
          {loadingTeachers ? (
            <div className="loading-spinner"><ClipLoader size={30} color="#3498db" /> Loading teachers...</div>
          ) : compatibleTeachers.length > 0 ? (
            <div className="teacher-list">
              {compatibleTeachers.map(teacher => (
                <div key={teacher.id} className="teacher-item">
                  <input
                    type="checkbox"
                    id={`teacher-${teacher.id}`}
                    checked={selectedTeachers.has(teacher.id)}
                    onChange={() => handleTeacherSelection(teacher.id)}
                    disabled={loading}
                  />
                  <label htmlFor={`teacher-${teacher.id}`}>{teacher.full_name}</label>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-teachers-message">No compatible teachers found for this promo and semester.</p>
          )}
        </div>
      )}

      <button onClick={handleGenerateSchedule} disabled={loading || loadingTeachers || !selectedPromo || !selectedSemester || selectedTeachers.size === 0} className="generate-button">
        {loading ? <ClipLoader size={20} color="#fff" /> : 'Generate Schedule'}
      </button>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default ScheduleGenerationPage; 
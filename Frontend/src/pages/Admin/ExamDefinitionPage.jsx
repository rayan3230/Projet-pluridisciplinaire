import React, { useState, useEffect } from 'react';
import { getSemesters } from '../../services/semesterService';
import { getExams, createExam, updateExam, deleteExam, getExamPeriods, createExamPeriod, generateExamSchedule } from '../../services/examService';
import { getPromos } from '../../services/academicService';
import { getModulesForPromo } from '../../services/moduleService';
import './ExamDefinitionPage.css';

const ExamDefinitionPage = () => {
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [promos, setPromos] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState('');
  const [modules, setModules] = useState([]);
  const [exams, setExams] = useState([]);
  const [examPeriods, setExamPeriods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newExam, setNewExam] = useState({
    name: '',
    module_id: '',
    exam_date: '',
    duration_minutes: 120
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [semesterData, promoData] = await Promise.all([
          getSemesters(),
          getPromos()
        ]);
        setSemesters(semesterData);
        setPromos(promoData);
      } catch (err) {
        setError('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedSemester) {
        setExams([]);
        setExamPeriods([]);
        setModules([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [examsData, periodsData] = await Promise.all([
          getExams(selectedSemester),
          getExamPeriods(selectedSemester)
        ]);
        setExams(examsData);
        setExamPeriods(periodsData);

        if (selectedPromo) {
          const modulesData = await getModulesForPromo(selectedPromo, selectedSemester);
          setModules(modulesData);
        } else {
          setModules([]);
        }

      } catch (err) {
        console.error("Fetch data error:", err);
        setError('Failed to load exams, periods, or modules');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedSemester, selectedPromo]);

  const handleSemesterChange = (e) => {
    setSelectedSemester(e.target.value);
    setSelectedPromo('');
    setModules([]);
  };

  const handlePromoChange = (e) => {
    setSelectedPromo(e.target.value);
  };

  const handleGenerateSchedule = async () => {
    if (!selectedSemester || !selectedPromo) {
      setError('Please select both a semester and a promo first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await generateExamSchedule(selectedSemester, selectedPromo);
      console.log("Schedule generation result:", result);

      const [updatedExams, updatedPeriods] = await Promise.all([
        getExams(selectedSemester),
        getExamPeriods(selectedSemester)
      ]);
      setExams(updatedExams);
      setExamPeriods(updatedPeriods);

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate exam schedule');
      console.error("Schedule generation failed:", err.response || err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExam = async (e) => {
    e.preventDefault();
    if (!selectedSemester || !newExam.module_id || !newExam.exam_date) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const examData = {
        ...newExam,
        semester_id: selectedSemester
      };
      await createExam(examData);
      const updatedExams = await getExams(selectedSemester);
      setExams(updatedExams);
      setNewExam({
        name: '',
        module_id: '',
        exam_date: '',
        duration_minutes: 120
      });
      setShowForm(false);
    } catch (err) {
      setError('Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-container exam-definition-page">
      <h1>Exam Definition & Scheduling</h1>
      {error && <p className="admin-error">{error}</p>}

      <div className="selection-controls" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div className="form-group">
          <label htmlFor="semester">Select Semester:</label>
          <select
            id="semester"
            value={selectedSemester}
            onChange={handleSemesterChange}
            disabled={loading}
            className="admin-select"
          >
            <option value="">Select a semester</option>
            {semesters.map(semester => (
              <option key={semester.id} value={semester.id}>
                {semester.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="promo">Select Promo:</label>
          <select
            id="promo"
            value={selectedPromo}
            onChange={handlePromoChange}
            disabled={loading || !selectedSemester}
            className="admin-select"
          >
            <option value="">Select a promo</option>
            {promos.map(promo => (
              <option key={promo.id} value={promo.id}>
                {promo.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedSemester && selectedPromo && (
        <>
          <div className="action-buttons">
            <button
              onClick={() => setShowForm(true)}
              className="admin-button add-button"
              disabled={loading}
            >
              Add Single Exam Manually
            </button>
            <button
              onClick={handleGenerateSchedule}
              className="admin-button generate-button"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Full Exam Schedule'}
            </button>
          </div>

          {showForm && (
            <div className="admin-form">
              <h2>Add New Exam</h2>
              <form onSubmit={handleAddExam}>
                <div className="form-group">
                  <label htmlFor="examName">Exam Name:</label>
                  <input
                    type="text"
                    id="examName"
                    value={newExam.name}
                    onChange={(e) => setNewExam({...newExam, name: e.target.value})}
                    required
                    className="admin-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="examModule">Module:</label>
                  <select
                    id="examModule"
                    value={newExam.module_id}
                    onChange={(e) => setNewExam({...newExam, module_id: e.target.value})}
                    required
                    className="admin-select"
                  >
                    <option value="">Select a module</option>
                    {modules.map(module => (
                      <option key={module.id} value={module.id}>
                        {module.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="examDate">Exam Date:</label>
                  <input
                    type="datetime-local"
                    id="examDate"
                    value={newExam.exam_date}
                    onChange={(e) => setNewExam({...newExam, exam_date: e.target.value})}
                    required
                    className="admin-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="duration">Duration (minutes):</label>
                  <input
                    type="number"
                    id="duration"
                    value={newExam.duration_minutes}
                    onChange={(e) => setNewExam({...newExam, duration_minutes: parseInt(e.target.value)})}
                    min="30"
                    step="30"
                    required
                    className="admin-input"
                  />
                </div>

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
                    type="submit"
                    className="admin-button submit-button"
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add Exam'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="admin-table-container">
            <h2>Exam Periods</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Start Date</th>
                  <th>End Date</th>
                </tr>
              </thead>
              <tbody>
                {examPeriods.map(period => (
                  <tr key={period.id}>
                    <td>{new Date(period.start_date).toLocaleDateString()}</td>
                    <td>{new Date(period.end_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-table-container">
            <h2>Existing Exams</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Classroom</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exams.map(exam => (
                  <tr key={exam.id}>
                    <td>{exam.name}</td>
                    <td>{new Date(exam.exam_date).toLocaleString()}</td>
                    <td>{exam.duration_minutes} minutes</td>
                    <td>{exam.classroom?.name || 'N/A'}</td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          className="admin-button edit-button"
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          className="admin-button delete-button"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ExamDefinitionPage; 
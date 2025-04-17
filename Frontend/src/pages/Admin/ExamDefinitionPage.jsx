import React, { useState, useEffect } from 'react';
import { getSemesters } from '../../services/semesterService';
import { getExams, createExam, updateExam, deleteExam, getExamPeriods, createExamPeriod, generateExamSchedule, generateAllPromosExamSchedule } from '../../services/examService';
import { getPromos, getAcademicYears } from '../../services/academicService';
import { getModulesForPromo } from '../../services/moduleService';
import { getSections } from '../../services/academicService';
import './ExamDefinitionPage.css';

const ExamDefinitionPage = () => {
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [promos, setPromos] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState('');
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [sectionsForPromo, setSectionsForPromo] = useState([]);
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
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [examDefinitionForm, setExamDefinitionForm] = useState({
    name: '',
    module: '',
    duration: '',
    startDate: '',
    endDate: ''
  });
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [semesterData, promoData, academicYearsData] = await Promise.all([
          getSemesters(),
          getPromos(),
          getAcademicYears()
        ]);
        setSemesters(semesterData);
        setPromos(promoData);
        setAcademicYears(academicYearsData);
      } catch (err) {
        setError('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Filter semesters based on selected academic year
  const filteredSemesters = semesters.filter(semester => 
    !selectedAcademicYear || semester.academic_year?.id === parseInt(selectedAcademicYear)
  );

  useEffect(() => {
    const fetchData = async () => {
      setSectionsForPromo([]);
      setExams([]);
      setExamPeriods([]);
      setModules([]);

      if (!selectedSemester) return;

      setLoading(true);
      setError(null);

      try {
        const periodsData = await getExamPeriods(selectedSemester);
        setExamPeriods(periodsData);

        if (selectedPromo) {
          console.log(`Fetching data for Semester: ${selectedSemester}, Promo: ${selectedPromo}`);
          const [sectionsData, examsData, modulesData] = await Promise.all([
            getSections({ promo_id: selectedPromo }),
            getExams(selectedSemester, selectedPromo),
            getModulesForPromo(selectedPromo, selectedSemester)
          ]);
          console.log("Fetched Sections:", sectionsData);
          console.log("Fetched Exams:", examsData);
          
          // Filter sections and exams to only include those from the selected promo
          const filteredSections = sectionsData?.filter(section => section.promo?.id === parseInt(selectedPromo)) || [];
          const filteredExams = examsData?.filter(exam => exam.section?.promo?.id === parseInt(selectedPromo)) || [];
          
          setSectionsForPromo(filteredSections);
          setExams(filteredExams);
          setModules(modulesData || []);
        } else {
          setExams([]);
        }

      } catch (err) {
        console.error("Fetch data error:", err);
        setError('Failed to load schedule data or related info');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedSemester, selectedPromo]);

  const handleAcademicYearChange = (e) => {
    setSelectedAcademicYear(e.target.value);
    setSelectedSemester('');
    setSelectedPromo('');
    setModules([]);
  };

  const handleSemesterChange = async (e) => {
    const semesterId = e.target.value;
    setSelectedSemester(semesterId);
    
    if (semesterId) {
      try {
        // Fetch exam periods for the selected semester
        const periods = await getExamPeriods(semesterId);
        if (periods.length > 0) {
          setExamPeriods(periods);
          setSelectedPeriod(periods[0].id);
          // Set the exam period dates in the form
          setExamDefinitionForm(prev => ({
            ...prev,
            startDate: periods[0].start_date,
            endDate: periods[0].end_date
          }));
        } else {
          setExamPeriods([]);
          setSelectedPeriod(null);
          setExamDefinitionForm(prev => ({
            ...prev,
            startDate: '',
            endDate: ''
          }));
        }
      } catch (error) {
        console.error('Error fetching exam periods:', error);
        setExamPeriods([]);
        setSelectedPeriod(null);
      }
    } else {
      setExamPeriods([]);
      setSelectedPeriod(null);
    }
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
        getExams(selectedSemester, selectedPromo),
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

  const handleGenerateSinglePromoSchedule = async () => {
    if (!selectedSemester || !selectedPromo) {
      setError('Please select both a semester and a promo first');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await generateExamSchedule(selectedPromo, selectedSemester);
      console.log("Single promo schedule generation result:", result);
      const [updatedExams, updatedPeriods] = await Promise.all([
        getExams(selectedSemester, selectedPromo),
        getExamPeriods(selectedSemester)
      ]);
      setExams(updatedExams);
      setExamPeriods(updatedPeriods);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate exam schedule for the selected promo');
      console.error("Single promo schedule generation failed:", err.response || err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAllPromosSchedule = async () => {
    if (!selectedSemester) {
      setError('Please select a semester first');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await generateAllPromosExamSchedule(selectedSemester);
      console.log("All promos schedule generation result:", result);
      if (selectedPromo) {
        const [updatedExams, updatedPeriods] = await Promise.all([
          getExams(selectedSemester, selectedPromo),
          getExamPeriods(selectedSemester)
        ]);
        setExams(updatedExams);
        setExamPeriods(updatedPeriods);
      } else {
        setExams([]);
        setExamPeriods([]);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate exam schedule for all promos in the semester');
      console.error("All promos schedule generation failed:", err.response || err);
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

  const groupExamsBySection = (examList) => {
    if (!examList) return {};
    return examList.reduce((acc, exam) => {
      const sectionId = exam.section?.id;
      // Only include exams for sections that belong to the selected promo
      if (!sectionId || exam.section?.promo?.id !== parseInt(selectedPromo)) return acc;
      if (!acc[sectionId]) {
        acc[sectionId] = [];
      }
      acc[sectionId].push(exam);
      return acc;
    }, {});
  };

  const examsGroupedBySection = groupExamsBySection(exams);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedSemester) {
        setError('Please select a semester');
        return;
      }

      if (!selectedPeriod) {
        setError('Please select an exam period');
        return;
      }

      const examPeriod = examPeriods.find(p => p.id === selectedPeriod);
      if (!examPeriod) {
        setError('Invalid exam period selected');
        return;
      }

      const examData = {
        ...examDefinitionForm,
        semester: selectedSemester,
        exam_period: selectedPeriod,
        start_date: examPeriod.start_date,
        end_date: examPeriod.end_date
      };

      await createExam(examData);
      setSuccess('Exam created successfully');
      setExamDefinitionForm({
        name: '',
        module: '',
        duration: '',
        startDate: examPeriod.start_date,
        endDate: examPeriod.end_date
      });
      setSelectedSemester('');
      setSelectedPeriod(null);
      setExamPeriods([]);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create exam');
    }
  };

  return (
    <div className="admin-page-container exam-definition-page">
      <h1>Exam Definition & Scheduling</h1>
      {error && <p className="admin-error">{error}</p>}
      {success && <p className="admin-success">{success}</p>}

      <div className="selection-controls" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div className="form-group">
          <label htmlFor="academicYear">Select Academic Year:</label>
          <select
            id="academicYear"
            value={selectedAcademicYear}
            onChange={handleAcademicYearChange}
            disabled={loading}
            className="admin-select"
          >
            <option value="">Select an academic year</option>
            {academicYears.map(year => (
              <option key={year.id} value={year.id}>
                {year.year_start}-{year.year_end}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="semester">Select Semester:</label>
          <select
            id="semester"
            value={selectedSemester}
            onChange={handleSemesterChange}
            disabled={loading || !selectedAcademicYear}
            className="admin-select"
          >
            <option value="">Select a semester</option>
            {filteredSemesters
              .filter(sem => sem.start_date && sem.end_date)
              .map(semester => (
              <option key={semester.id} value={semester.id}>
                {semester.semester_number === 1 ? 'First Semester' : 'Second Semester'}
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
                {promo.name} ({promo.speciality?.name || 'No Speciality'})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="action-buttons" style={{ marginTop: '20px' }}>
        {/* Only show generate button when academic year and semester are selected */}
        {selectedAcademicYear && selectedSemester && !selectedPromo && (
          <button
            onClick={handleGenerateAllPromosSchedule}
            className="admin-button generate-all-button"
            disabled={loading}
            title={`Generate schedule for ALL promos in ${semesters.find(s => s.id === parseInt(selectedSemester))?.name || 'selected semester'}`}
          >
            {loading ? 'Generating...' : 'Generate for All in Semester'}
          </button>
        )}
      </div>

      {selectedSemester && selectedPromo && showForm && (
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

      {selectedSemester && (
        <>
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

          {selectedPromo && (
            <div className="admin-table-container">
              <h2>Existing Exams</h2>
              {sectionsForPromo.length > 0 ? (
                sectionsForPromo.map(section => {
                  const examsForThisSection = examsGroupedBySection[section.id] || [];
                  return (
                    <div key={section.id} className="section-exam-group">
                      <h3>Section: {section.name}</h3>
                      {examsForThisSection.length > 0 ? (
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Exam Name</th>
                              <th>Module</th>
                              <th>Date & Time</th>
                              <th>Duration</th>
                              <th>Classroom</th>
                            </tr>
                          </thead>
                          <tbody>
                            {examsForThisSection.map(exam => (
                              <tr key={exam.id}>
                                <td>{exam.name}</td>
                                <td>{exam.module?.base_module?.name || exam.module?.name || 'N/A'}</td>
                                <td>{new Date(exam.exam_date).toLocaleString()}</td>
                                <td>{exam.duration_minutes} mins</td>
                                <td>{exam.classroom?.name || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p>No exams scheduled for this section.</p>
                      )}
                    </div>
                  );
                })
              ) : (
                <p>No sections found for this promo.</p>
              )}
            </div>
          )}
        </>
      )}

      {selectedSemester && selectedPromo && showForm && (
        <div className="admin-form">
          <h2>Add New Exam</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="examName">Exam Name:</label>
              <input
                type="text"
                id="examName"
                value={examDefinitionForm.name}
                onChange={(e) => setExamDefinitionForm({...examDefinitionForm, name: e.target.value})}
                required
                className="admin-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="examModule">Module:</label>
              <select
                id="examModule"
                value={examDefinitionForm.module}
                onChange={(e) => setExamDefinitionForm({...examDefinitionForm, module: e.target.value})}
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
              <label htmlFor="examDuration">Duration (minutes):</label>
              <input
                type="number"
                id="examDuration"
                value={examDefinitionForm.duration}
                onChange={(e) => setExamDefinitionForm({...examDefinitionForm, duration: e.target.value})}
                min="30"
                step="30"
                required
                className="admin-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="examPeriod">Select Exam Period:</label>
              <select
                id="examPeriod"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                required
                className="admin-select"
              >
                <option value="">Select an exam period</option>
                {examPeriods.map(period => (
                  <option key={period.id} value={period.id}>
                    {new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()}
                  </option>
                ))}
              </select>
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
    </div>
  );
};

export default ExamDefinitionPage; 
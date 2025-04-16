import React, { useState, useEffect } from 'react';
import { getAcademicYears, getSemesters, getPromos, generateSurveillanceSchedule, getExams } from '../../services/adminServices';

const ExamSurveillanceSchedulePage = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [promos, setPromos] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState('');
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [academicYearsData, semestersData, promosData] = await Promise.all([
          getAcademicYears(),
          getSemesters(),
          getPromos()
        ]);
        setAcademicYears(academicYearsData);
        setSemesters(semestersData);
        setPromos(promosData);
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

  const handleAcademicYearChange = (e) => {
    setSelectedAcademicYear(e.target.value);
    setSelectedSemester('');
    setSelectedPromo('');
    setSelectedSection('');
    setSections([]);
    setExams([]);
  };

  const handleSemesterChange = (e) => {
    setSelectedSemester(e.target.value);
    setSelectedPromo('');
    setSelectedSection('');
    setSections([]);
    setExams([]);
  };

  const handlePromoChange = (e) => {
    setSelectedPromo(e.target.value);
    setSelectedSection('');
    setSections([]);
    setExams([]);
  };

  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
    setExams([]);
  };

  const handleGenerateSchedule = async () => {
    if (!selectedAcademicYear || !selectedSemester || !selectedPromo || !selectedSection) {
      setError('Please select all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await generateSurveillanceSchedule(selectedSection, selectedSemester);
      setSuccess('Surveillance schedule generated successfully');
      const updatedExams = await getExams(selectedSemester, selectedPromo);
      setExams(updatedExams);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate surveillance schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-container exam-surveillance-page">
      <h1>Exam Surveillance Schedule</h1>
      {error && <p className="admin-error">{error}</p>}
      {success && <p className="admin-success">{success}</p>}

      <div className="selection-controls">
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
            disabled={loading || !selectedAcademicYear || !selectedSemester}
            className="admin-select"
          >
            <option value="">Select a promo</option>
            {promos.map(promo => (
              <option key={promo.id} value={promo.id}>
                {promo.promo_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="section">Select Section:</label>
          <select
            id="section"
            value={selectedSection}
            onChange={handleSectionChange}
            disabled={loading || !selectedAcademicYear || !selectedSemester || !selectedPromo}
            className="admin-select"
          >
            <option value="">Select a section</option>
            {sections.map(section => (
              <option key={section.id} value={section.id}>
                {section.section_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="action-buttons">
        {selectedAcademicYear && selectedSemester && selectedPromo && selectedSection && (
          <button
            onClick={handleGenerateSchedule}
            className="admin-button generate-button"
            disabled={loading}
            title="Generate surveillance schedule for the selected section"
          >
            {loading ? 'Generating...' : 'Generate Surveillance Schedule'}
          </button>
        )}
      </div>

      {exams.length > 0 && (
        <div className="admin-table-container">
          <h2>Exam Schedule</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Exam Name</th>
                <th>Date & Time</th>
                <th>Duration</th>
                <th>Classroom</th>
                <th>Surveillance Teachers</th>
              </tr>
            </thead>
            <tbody>
              {exams.map(exam => (
                <tr key={exam.id}>
                  <td>{exam.name}</td>
                  <td>{new Date(exam.exam_date).toLocaleString()}</td>
                  <td>{exam.duration_minutes} mins</td>
                  <td>{exam.classroom?.name || 'N/A'}</td>
                  <td>
                    {exam.surveillance_teachers?.map(teacher => teacher.name).join(', ') || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExamSurveillanceSchedulePage; 